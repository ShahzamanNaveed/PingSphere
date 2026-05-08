import express from 'express'
import { body } from 'express-validator'
import rateLimit from 'express-rate-limit'
import { register, login, logout, getMe, forgotPassword, resetPassword } from '../controllers/auth.controller.js'
import protectRoute from '../middleware/protectRoute.js'

const router = express.Router()

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, please try again after a minute' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/register', [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], register)

router.post('/login', loginLimiter, [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required'),
], login)

router.post('/logout', logout)
router.get('/me', protectRoute, getMe)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)

export default router