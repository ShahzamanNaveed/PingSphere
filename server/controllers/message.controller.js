import Message from '../models/Message.js'
import Conversation from '../models/Conversation.js'

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
    res.status(200).json({ message: 'Messages marked as seen' })
  } catch (error) {
    console.error('markMessagesSeen error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}