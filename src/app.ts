import express from 'express';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorMiddleware';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  logger.info('Root route was hit');
  res.send('Parking API is running...');
});

// Test bad route (optional)
app.get('/test-error', (req, res) => {
  throw new Error('This is a test error');
});

app.use('*', (req, res) => {
  logger.warn(`404 Not Found - ${req.originalUrl}`);
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});
