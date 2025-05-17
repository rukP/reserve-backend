import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import asyncHandler from 'express-async-handler';
import prisma from '../utils/client';

// SIGNUP
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('All fields are required');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    res.status(400);
    logger.error(`User registration failed: ${email} already exists`);
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  logger.info(`New user registered: ${email}`);

  res.status(201).json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    },
  });
});

// SIGNIN
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    res.status(401);
    logger.error(`Login failed for email: ${email} - Invalid email or password`);
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(401);
    logger.error(`Login failed for email: ${email} - Invalid email or password`);
    throw new Error('Invalid email or password');
  }

  logger.info(`User logged in: ${email}`);

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    },
  });
});

// SIGNOUT
export const logoutUser = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Logged out (token expired on client).' });
  logger.info("Logged out user");
});
