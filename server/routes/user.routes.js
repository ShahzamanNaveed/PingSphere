import { Router } from 'express'
import {
  getUsers,
  getUserById,
  updateProfile,
  changePassword,
  uploadAvatar,
  multerUpload,
  deleteAccount,
} from '../controllers/user.controller.js'
import protectRoute from '../middleware/protectRoute.js'

const router = Router()

router.get('/', protectRoute, getUsers)
router.get('/:userId', protectRoute, getUserById)   // ← new
router.put('/profile', protectRoute, updateProfile)
router.put('/password', protectRoute, changePassword)
router.post('/profile/avatar', protectRoute, multerUpload.single('avatar'), uploadAvatar)
router.delete('/delete', protectRoute, deleteAccount)

export default router