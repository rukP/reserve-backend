/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: Manage parking reservations
 *
 * /reservations:
 *   post:
 *     summary: Create a new reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slotId
 *               - startTime
 *               - endTime
 *             properties:
 *               slotId:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *       400:
 *         description: Invalid input or slot not available
 *
 *   get:
 *     summary: Get all reservations (Admin only)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all reservations
 *       403:
 *         description: Access denied (non-admin users)
 *
 * /reservations/me:
 *   get:
 *     summary: Get current user's reservations
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's reservations
 *
 * /reservations/{id}:
 *   delete:
 *     summary: Cancel a reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation cancelled successfully
 *       403:
 *         description: Unauthorized to cancel this reservation
 *       404:
 *         description: Reservation not found
 */

import express from "express";
import {
  createReservation,
  getAllReservations,
  getMyReservations,
  cancelReservation,
} from "../controllers/reservation.controller";
import { protect, isAdmin } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", protect, createReservation);
router.get("/", protect, isAdmin, getAllReservations);
router.get("/me", protect, getMyReservations);
router.delete("/:id", protect, cancelReservation);

export default router;
