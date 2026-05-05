import express from 'express';
import { register, login, getMe, updateMe, changePassword, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/error.js';
import { createUserValidator, loginValidator } from '../middleware/validators.js';

const router = express.Router();

router.post('/register', createUserValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/change-password', protect, changePassword);

export default router;
