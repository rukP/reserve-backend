/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: Manage parking locations
 *
 * /locations:
 *   get:
 *     summary: Get all locations
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: List of all locations
 *
 * /locations/admin/locations:
 *   post:
 *     summary: Create a new location
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Location created successfully
 *
 * /locations/admin/locations/{id}:
 *   patch:
 *     summary: Update a location
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Location ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Location updated successfully
 *
 *   delete:
 *     summary: Delete a location
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Location ID
 *     responses:
 *       204:
 *         description: Location deleted successfully
 */

import { Router } from "express";
import {
  createLocation,
  getLocations,
  updateLocation,
  deleteLocation,
} from "../controllers/location.controller";
import { isAdmin, protect } from "../middlewares/authMiddleware";

const router = Router();

// PUBLIC ROUTES FOR USERS
router.get("/", getLocations);

// ADMIN-ONLY ROUTES
router.post("/admin/locations", protect, isAdmin, createLocation);
router.patch("/admin/locations/:id", protect, isAdmin, updateLocation);
router.delete("/admin/locations/:id", protect, isAdmin, deleteLocation);

export default router;
