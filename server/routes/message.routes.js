import express from 'express'
import { getMessages, createMessage, markMessagesSeen } from '../controllers/message.controller.js'
import protectRoute from '../middleware/protectRoute.js'

const router = express.Router()

router.get('/:conversationId', protectRoute, getMessages)
router.post('/', protectRoute, createMessage)
router.put('/:conversationId/seen', protectRoute, markMessagesSeen)

export default router