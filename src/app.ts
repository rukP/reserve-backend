import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { AppError, errorHandler } from "./middlewares/errorMiddleware";
import { logger } from "./utils/logger";
import authRoutes from './routes/auth.routes';
import slotRoutes from './routes/slot.routes';
import locationRoutes from './routes/location.routes';
import { createDefaultAdmin } from './utils/seedAdmin';

dotenv.config();

const app = express();
app.use(express.json());

createDefaultAdmin(); // SEED DEFAULT ADMIN

app.get("/api", (req, res) => {
  logger.info("Root route was hit");
  res.send("Parking Reserve API is running...");
});

app.use('/api/auth', authRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/locations', locationRoutes);

// CATCH-ALL ROUTE
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(error);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});
