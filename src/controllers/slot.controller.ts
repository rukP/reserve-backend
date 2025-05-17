import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../middlewares/errorMiddleware';
import prisma from '../utils/client';

export const createSlot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, locationId, status } = req.body;

    if (!identifier || !locationId) {
        logger.error('Slot creation failed: Identifier and locationId are required');
      return next(new AppError('Identifier and locationId are required', 400));
    }

    // Check if location exists
    const location = await prisma.location.findUnique({ where: { id: locationId } });
    logger.error(`Location not found: ${location?.name}`);
    if (!location) return next(new AppError('Location not found', 404));

    const slot = await prisma.slot.create({
      data: {
        identifier,
        status: status || 'AVAILABLE',
        locationId,
      },
    });

    logger.info(`Slot created: ${slot.identifier} at location ${locationId}`);
    res.status(201).json({ slot });
  } catch (error) {
    logger.error(`Error creating slot - ${error}`);
    next(error);
  }
};

export const getAllSlots = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slots = await prisma.slot.findMany({
      include: {
        location: true,
      },
    });
    if (!slots || slots.length === 0) {
      logger.warn('No slots found');
      return res.status(404).json({ message: 'No slots found' });
    }
    logger.info(`Fetched ${slots.length} slots`);
    res.status(200).json({ slots });
  } catch (error) {
    logger.error(`Error fetching slots - ${error}`);
    next(error);
  }
};

export const getSlotsByLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { locationId } = req.params;

    const slots = await prisma.slot.findMany({
      where: { locationId },
      include: { location: true },
    });

    if (!slots || slots.length === 0) {
      logger.warn(`No slots found for location: ${locationId}`);
      return res.status(404).json({ message: 'No slots found for this location' });
    }
    logger.info(`Fetched ${slots.length} slots for location: ${locationId}`);
    res.status(200).json({ slots });
  } catch (error) {
    logger.error(`Error fetching slots for location - ${error}`);
    next(error);
  }
};

export const updateSlot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { identifier, status, locationId } = req.body;

    const slot = await prisma.slot.update({
      where: { id },
      data: {
        identifier,
        status,
        locationId,
      },
    });

    logger.info(`Slot updated: ${id}`);
    res.status(200).json({ slot });
  } catch (error) {
    logger.error(`Error updating slot - ${error}`);
    next(error);
  }
};

export const deleteSlot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.slot.delete({ where: { id } });

    logger.info(`Slot deleted: ${id}`);
    res.status(204).send();
  } catch (error) {
    logger.error(`Error deleting slot - ${error}`);
    next(error);
  }
};
