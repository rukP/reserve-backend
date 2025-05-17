import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/authController';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/signin', loginUser);
router.post('/signout', logoutUser);

export default router;
