import express from 'express'
import {
  getMessages,
  createMessage,
  markMessagesSeen,
  unsendMessage,
  editMessage,
  reactToMessage,
  searchMessages,
  clearChat,
} from '../controllers/message.controller.js'
import protectRoute from '../middleware/protectRoute.js'

const router = express.Router()

router.get('/:conversationId/search', protectRoute, searchMessages)
router.get('/:conversationId', protectRoute, getMessages)
router.post('/', protectRoute, createMessage)
router.put('/:conversationId/seen', protectRoute, markMessagesSeen)
router.delete('/:conversationId/clear', protectRoute, clearChat)
router.delete('/:messageId', protectRoute, unsendMessage)
router.put('/:messageId', protectRoute, editMessage)
router.post('/:messageId/react', protectRoute, reactToMessage)

export default router