import Message from '../models/Message.js'
import Conversation from '../models/Conversation.js'
import { getIO, getSocketId } from '../socket/socket.js'

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    const { before } = req.query
    const LIMIT = 30

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: { $in: [req.user._id] },
    })

    if (!conversation) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const query = { conversationId }

    if (before) {
      const cursorMessage = await Message.findById(before)
      if (cursorMessage) {
        query.createdAt = { $lt: cursorMessage.createdAt }
      }
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(LIMIT)

    res.status(200).json(messages.reverse())
  } catch (error) {
    console.error('getMessages error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}

export const createMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: { $in: [req.user._id] },
    })

    if (!conversation) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const message = await Message.create({
      conversationId,
      senderId: req.user._id,
      text,
    })

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date(),
    })

    res.status(201).json(message)
  } catch (error) {
    console.error('createMessage error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}

export const markMessagesSeen = async (req, res) => {
  const { conversationId } = req.params
  try {
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' })
    }
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    )
    if (!isParticipant) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: req.user._id },
        seen: false,
      },
      { seen: true }
    )

    const senderId = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    )
    const senderSocketId = getSocketId(senderId?.toString())
    if (senderSocketId) {
      getIO().to(senderSocketId).emit('messagesSeen', { conversationId })
    }

    res.status(200).json({ message: 'Messages marked as seen' })
  } catch (error) {
    console.error('markMessagesSeen error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}

export const unsendMessage = async (req, res) => {
  const { messageId } = req.params
  try {
    const message = await Message.findById(messageId)
    if (!message) {
      return res.status(404).json({ message: 'Message not found' })
    }
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only unsend your own messages' })
    }

    const conversation = await Conversation.findById(message.conversationId)
    await Message.findByIdAndDelete(messageId)

    const recipientId = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    )
    const recipientSocketId = getSocketId(recipientId?.toString())
    if (recipientSocketId) {
      getIO().to(recipientSocketId).emit('messageUnsent', {
        messageId,
        conversationId: message.conversationId.toString(),
      })
    }

    res.status(200).json({ message: 'Message unsent' })
  } catch (error) {
    console.error('unsendMessage error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}

export const editMessage = async (req, res) => {
  const { messageId } = req.params
  const { text } = req.body
  try {
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Message text cannot be empty' })
    }

    const message = await Message.findById(messageId)
    if (!message) {
      return res.status(404).json({ message: 'Message not found' })
    }
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own messages' })
    }

    message.text = text.trim()
    message.edited = true
    await message.save()

    const conversation = await Conversation.findById(message.conversationId)
    const recipientId = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    )
    const recipientSocketId = getSocketId(recipientId?.toString())
    if (recipientSocketId) {
      getIO().to(recipientSocketId).emit('messageEdited', {
        messageId,
        text: message.text,
        conversationId: message.conversationId.toString(),
      })
    }

    res.status(200).json(message)
  } catch (error) {
    console.error('editMessage error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}