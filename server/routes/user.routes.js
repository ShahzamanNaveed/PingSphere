import { Router } from 'express'
import { getUsers, updateProfile, changePassword, uploadAvatar, multerUpload } from '../controllers/user.controller.js'
import protectRoute from '../middleware/protectRoute.js'

const router = Router()

router.get('/', protectRoute, getUsers)
router.put('/profile', protectRoute, updateProfile)
router.put('/password', protectRoute, changePassword)
router.post('/profile/avatar', protectRoute, multerUpload.single('avatar'), uploadAvatar)

export default router