import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../utils/client";
import { logger } from "../utils/logger";
import { AppError } from "./errorMiddleware";

interface JwtPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.error("No token provided");
    return next(new AppError("Not authorized, no token provided", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true },
    });

    if (!user) {
      logger.error("User not found");
      return next(new AppError("User not found", 401));
    }

    req.user = { id: user.id, role: user.role };
    logger.info(`User ${user.id} authenticated successfully`);
    return next();
  } catch (err) {
    logger.warn(`Token verification failed - ${err}`);
    return next(new AppError("Not authorized, token failed", 401));
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "ADMIN") {
    logger.error("Access denied. Admins only.");
    return next(new AppError("Access denied. Admins only.", 403));
  }

  logger.info(`User ${req.user.id} is an admin`);
  return next();
};
