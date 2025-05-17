import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import prisma from "../utils/client";
import { AppError } from "../middlewares/errorMiddleware";

export const createLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, address } = req.body;

    if (!name || !address) {
      logger.error("Location creation failed: Name and address are required");
      return next(new AppError("Name and address are required", 400));
    }

    const location = await prisma.location.create({
      data: { name, address },
    });

    logger.info(`Location created: ${location.name}`);
    res.status(201).json({ location });
    return next();
  } catch (error) {
    return next(error);
  }
};

export const getLocations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const locations = await prisma.location.findMany({
      include: { slots: true },
    });
    if (!locations || locations.length === 0) {
      logger.warn("No locations found");
      res.status(404).json({ message: "No locations found" });
      return next();
    }
    logger.info(`Fetched ${locations.length} locations`);
    res.status(200).json({ locations });
    return next();
  } catch (error) {
    logger.error(`Error fetching locations - ${error}`);
    return next(error);
  }
};

export const updateLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, address } = req.body;

    const location = await prisma.location.update({
      where: { id },
      data: { name, address },
    });

    logger.info(`Location updated: ${id}`);
    res.status(200).json({ location });
    return next();
  } catch (error) {
    logger.error(`Error updating location - ${error}`);
    return next(error);
  }
};

export const deleteLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.location.delete({ where: { id } });

    logger.info(`Location deleted: ${id}`);
    res.status(204).send();
    return next();
  } catch (error) {
    logger.error(`Error deleting location - ${error}`);
    return next(error);
  }
};
