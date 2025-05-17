import { Router } from 'express';
import {
  createLocation,
  getLocations,
  updateLocation,
  deleteLocation,
} from '../controllers/location.controller';
import { isAdmin, protect } from '../middlewares/authMiddleware';

const router = Router();

// Public (or user-protected if needed)
router.get('/', getLocations);

// Admin routes
router.post('/admin/locations', protect, isAdmin, createLocation);
router.patch('/admin/locations/:id', protect, isAdmin, updateLocation);
router.delete('/admin/locations/:id', protect, isAdmin, deleteLocation);

export default router;
