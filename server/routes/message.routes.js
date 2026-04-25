import express from 'express'
import { getMessages, createMessage } from '../controllers/message.controller.js'
import protectRoute from '../middleware/protectRoute.js'

const router = express.Router()

router.get('/:conversationId', protectRoute, getMessages)
router.post('/', protectRoute, createMessage)

export default router