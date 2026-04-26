import express from 'express'
import { getUsers, updateProfile } from '../controllers/user.controller.js'
import protectRoute from '../middleware/protectRoute.js'

const router = express.Router()

router.get('/', protectRoute, getUsers)
router.put('/profile', protectRoute, updateProfile)

export default router