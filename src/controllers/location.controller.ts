import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import prisma from "../utils/client";
import { AppError } from "../middlewares/errorMiddleware";

// CREATE LOCATION
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

    res.status(201).json({ location });
    logger.info(`Location created: ${location.name}`);
    return next();
  } catch (error) {
    logger.error(`Error creating location - ${error}`);
    return next(error);
  }
};

// GET LOCATIONS
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
      res.status(404).json({ message: "No locations found" });
      logger.warn("No locations found");
      return next();
    }
    res.status(200).json({ locations });
    logger.info(`Fetched ${locations.length} locations`);
    return next();
  } catch (error) {
    logger.error(`Error fetching locations - ${error}`);
    return next(error);
  }
};

// UPDATE LOCATION
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

    res.status(200).json({ location });
    logger.info(`Location updated: ${id}`);
    return next();
  } catch (error) {
    logger.error(`Error updating location - ${error}`);
    return next(error);
  }
};

// DELETE A LOCATION
export const deleteLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.location.delete({ where: { id } });

    res.status(204).send();
    logger.info(`Location deleted: ${id}`);
    return next();
  } catch (error) {
    logger.error(`Error deleting location - ${error}`);
    return next(error);
  }
};
