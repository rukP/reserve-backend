import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/auth.controller';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/signin', loginUser);
router.post('/signout', logoutUser);

export default router;
