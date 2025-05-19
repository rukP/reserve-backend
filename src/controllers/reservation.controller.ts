import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { AppError } from "../middlewares/errorMiddleware";
import prisma from "../utils/client";
import nodemailer from "nodemailer";

// NODEMAILER SETUP
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// HELPER FUNCTION TO SEND CONFIRMATION EMAIL
const sendConfirmationEmail = async (email: string, reservationId: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reservation Confirmation",
    text: `Your reservation has been confirmed. Reservation ID: ${reservationId}. Thank you for booking with us!`,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Reservation confirmation email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send confirmation email - ${error}`);
  }
};

// CREATE A NEW RESERVATION
export const createReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slotId, startTime, endTime } = req.body;
    const userId = req.user?.id;

    if (!slotId || !startTime || !endTime) {
      logger.warn("Reservation creation failed: Missing fields");
      return next(new AppError("slotId, startTime, and endTime are required", 400));
    }

    if (!userId) {
      logger.warn("Reservation creation failed: Missing userId");
      return next(new AppError("User ID is required to create a reservation", 400));
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // CHECK THAT START TIME IS IN THE FUTURE
    const currentDateTime = new Date();
    if (start < currentDateTime) {
      logger.warn("Reservation creation failed: Cannot book in the past");
      return next(new AppError("Cannot reserve a slot in the past", 400));
    }

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      logger.warn("Reservation creation failed: Invalid time range");
      return next(new AppError("Invalid start or end time", 400));
    }

    // CHECK IF SLOT EXISTS AND IS AVAILABLE
    const slot = await prisma.slot.findUnique({ where: { id: slotId } });

    if (!slot) return next(new AppError("Slot not found", 404));
    if (slot.status !== "AVAILABLE")
      return next(new AppError("Slot is not available", 400));

    // CHECK FOR OVERLAPPING RESERVATIONS ON THE SAME SLOT
    const conflicting = await prisma.reservation.findFirst({
      where: {
        slotId,
        canceled: false,
        OR: [
          {
            startTime: { lt: end },
            endTime: { gt: start },
          },
        ],
      },
    });

    // CREATE THE RESERVATION
    const reservation = await prisma.reservation.create({
      data: {
        userId: userId,
        slotId,
        startTime: start,
        endTime: end,
      },
    });

    // SEND CONFIRMATION EMAIL TO THE USER
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await sendConfirmationEmail(user.email, reservation.id);
    }

    logger.info(`Reservation created by user ${user?.name} for slot ${slot.identifier}`);
    res.status(201).json({ reservation });
  } catch (error) {
    logger.error(`Error creating reservation - ${error}`);
    return next(error);
  }
};

// GET ALL RESERVATIONS (ADMINS ONLY)
export const getAllReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        user: true,
        slot: { include: { location: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ reservations });
    logger.info("Fetched all reservations");
  } catch (error) {
    logger.error(`Error fetching all reservations - ${error}`);
    return next(error);
  }
};

// GET CURRENT USER'S RESERVATIONS
export const getMyReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    const reservations = await prisma.reservation.findMany({
      where: { userId },
      include: {
        slot: { include: { location: true } },
      },
      orderBy: { startTime: "asc" },
    });

    res.status(200).json({ reservations });
    logger.info(`Fetched reservations for user ${userId}`);
  } catch (error) {
    logger.error(`Error fetching user reservations - ${error}`);
    return next(error);
  }
};

// CANCEL RESERVATIONS
export const cancelReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) return next(new AppError("Reservation not found", 404));
    if (reservation.userId !== userId)
      return next(new AppError("Unauthorized to cancel this reservation", 403));

    const updated = await prisma.reservation.update({
      where: { id },
      data: { canceled: true },
    });

    res.status(200).json({ reservation: updated });
    logger.info(`Reservation ${id} canceled by user ${userId}`);
  } catch (error) {
    logger.error(`Error canceling reservation - ${error}`);
    return next(error);
  }
};
