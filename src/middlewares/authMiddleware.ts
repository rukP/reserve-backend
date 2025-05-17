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
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "supersecret"
      ) as JwtPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, role: true },
      });

      if (!user) {
        res.status(401).json({ message: "User not found" });
        return next();
      }

      req.user = user;
      return next();
    } catch (err) {
      logger.warn("Token verification failed");
      res.status(401).json({ message: "Not authorized, token failed" });
      return next();
    }
  }

  res.status(401).json({ message: "Not authorized, no token" });
  return next();
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "ADMIN") {
    return next();
  }

  res.status(403).json({ message: "Access denied: Admins only" });
  return next();
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user || user.role !== "ADMIN") {
    return next(new AppError("Access denied. Admins only.", 403));
  }

  return next();
};
