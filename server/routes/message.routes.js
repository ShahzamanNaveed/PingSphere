import express from 'express'
import {
  getMessages,
  createMessage,
  markMessagesSeen,
  unsendMessage,
  editMessage,
} from '../controllers/message.controller.js'
import protectRoute from '../middleware/protectRoute.js'

const router = express.Router()

router.get('/:conversationId', protectRoute, getMessages)
router.post('/', protectRoute, createMessage)
router.put('/:conversationId/seen', protectRoute, markMessagesSeen)
router.delete('/:messageId', protectRoute, unsendMessage)
router.put('/:messageId', protectRoute, editMessage)

export default router