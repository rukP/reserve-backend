import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { AppError } from "../middlewares/errorMiddleware";
import prisma from "../utils/client";

// CREATE A SLOT
export const createSlot = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { identifier, locationId, status } = req.body;

    if (!identifier || !locationId) {
      logger.error("Slot creation failed: Identifier and locationId are required");
      return next(new AppError("Identifier and locationId are required", 400));
    }

    // Check if location exists
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });
    if (!location) {
      return next(new AppError("Location not found", 404));
    }

    // Check if slot identifier already exists at this location
    const existingSlot = await prisma.slot.findFirst({
      where: {
        identifier,
        locationId,
      },
    });

    if (existingSlot) {
      logger.warn(`Slot '${identifier}' already exists at location '${location.name}'`);
      return next(new AppError("Slot with this identifier already exists at the specified location", 409));
    }

    const slot = await prisma.slot.create({
      data: {
        identifier,
        status: status || "AVAILABLE",
        locationId,
      },
    });

    logger.info(`Slot created: ${slot.identifier} at location ${location.name}`);
    res.status(201).json({ slot });
  } catch (error) {
    logger.error(`Error creating slot - ${error}`);
    return next(error);
  }
};

// GET ALL SLOTS
export const getAllSlots = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const slots = await prisma.slot.findMany({
      include: {
        location: true,
      },
    });
    if (!slots || slots.length === 0) {
      logger.warn("No slots found");
      res.status(404).json({ message: "No slots found" });
    }
    logger.info(`Fetched ${slots.length} slots`);
    res.status(200).json({ slots });
  } catch (error) {
    logger.error(`Error fetching slots - ${error}`);
    return next(error);
  }
};

// GET SLOTS BY LOCATION
export const getSlotsByLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { locationId } = req.params;

    const slots = await prisma.slot.findMany({
      where: { locationId },
      include: { location: true },
    });

    if (!slots || slots.length === 0) {
      logger.warn(`No slots found for location: ${locationId}`);
      res
        .status(404)
        .json({ message: "No slots found for this location" });
    }

    logger.info(`Fetched ${slots.length} slots for location: ${locationId}`);
    res.status(200).json({ slots });
  } catch (error) {
    logger.error(`Error fetching slots for location - ${error}`);
    return next(error);
  }
};

// UPDATE A SLOT
export const updateSlot = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { identifier, status, locationId } = req.body;

    const existingSlot = await prisma.slot.findUnique({ where: { id } });
    if (!existingSlot) {
      return next(new AppError("Slot not found", 404));
    }

    // If identifier or location is being changed, check for conflicts
    if (
      (identifier && identifier !== existingSlot.identifier) ||
      (locationId && locationId !== existingSlot.locationId)
    ) {
      const duplicateSlot = await prisma.slot.findFirst({
        where: {
          identifier: identifier || existingSlot.identifier,
          locationId: locationId || existingSlot.locationId,
          NOT: { id }, // Exclude current slot
        },
      });

      if (duplicateSlot) {
        return next(new AppError("Another slot with this identifier already exists at the target location", 409));
      }
    }

    const slot = await prisma.slot.update({
      where: { id },
      data: {
        identifier: identifier || existingSlot.identifier,
        status: status || existingSlot.status,
        locationId: locationId || existingSlot.locationId,
      },
    });

    logger.info(`Slot updated: ${id}`);
    res.status(200).json({ slot });
  } catch (error) {
    logger.error(`Error updating slot - ${error}`);
    return next(error);
  }
};

// DELETE A SLOT
export const deleteSlot = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.slot.delete({ where: { id } });

    logger.info(`Slot deleted: ${id}`);
    res.status(204).send();
  } catch (error) {
    logger.error(`Error deleting slot - ${error}`);
    return next(error);
  }
};
