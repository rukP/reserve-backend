/**
 * @swagger
 * tags:
 *   name: Slots
 *   description: Manage parking slots
 *
 * /slots:
 *   get:
 *     summary: Get all parking slots
 *     tags: [Slots]
 *     responses:
 *       200:
 *         description: List of all parking slots
 *
 * /slots/location/{locationId}:
 *   get:
 *     summary: Get slots by location
 *     tags: [Slots]
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Location ID
 *     responses:
 *       200:
 *         description: List of slots for the location
 *
 * /slots/admin/slots:
 *   post:
 *     summary: Create a new slot
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - locationId
 *             properties:
 *               identifier:
 *                 type: string
 *                 example: "A1"
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, LIMITED_TIME, UNAVAILABLE]
 *               locationId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Slot created successfully
 *
 * /slots/admin/slots/{id}:
 *   patch:
 *     summary: Update a slot
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Slot ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, LIMITED_TIME, UNAVAILABLE]
 *               locationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Slot updated successfully
 *
 *   delete:
 *     summary: Delete a slot
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Slot ID
 *     responses:
 *       204:
 *         description: Slot deleted successfully
 */

import { Router } from "express";
import {
  createSlot,
  getAllSlots,
  getSlotsByLocation,
  updateSlot,
  deleteSlot,
} from "../controllers/slot.controller";
import { isAdmin, protect } from "../middlewares/authMiddleware";

const router = Router();

// PUBLIC ROUTES FOR USERS
router.get("/", getAllSlots);
router.get("/location/:locationId", getSlotsByLocation);

// ADMIN-ONLY ROUTES
router.post("/admin/slots", protect, isAdmin, createSlot);
router.patch("/admin/slots/:id", protect, isAdmin, updateSlot);
router.delete("/admin/slots/:id", protect, isAdmin, deleteSlot);

export default router;
