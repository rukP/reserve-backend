//@ts-nocheck
import { Router } from 'express';
import {
  createSlot,
  getAllSlots,
  getSlotsByLocation,
  updateSlot,
  deleteSlot,
} from '../controllers/slot.controller';
import { isAdmin, protect } from '../middlewares/authMiddleware';

const router = Router();

// Public (or protected for users)
router.get('/', getAllSlots);
router.get('/location/:locationId', getSlotsByLocation);

// Admin-only
router.post('/admin/slots', protect, isAdmin, createSlot);
router.patch('/admin/slots/:id', protect, isAdmin, updateSlot);
router.delete('/admin/slots/:id', protect, isAdmin, deleteSlot);

export default router;
