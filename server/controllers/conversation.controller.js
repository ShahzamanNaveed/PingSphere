import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.user._id] },
    })
      .populate('participants', '-password')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })

      for (const conversation of conversations) {

      const visibleLastMessage = await Message.findOne({
        conversationId: conversation._id,
        deletedFor: { $ne: req.user._id }
      })
        .sort({ createdAt: -1 })


      conversation.lastMessage = visibleLastMessage || null
    }

    res.status(200).json(conversations)
  } catch (error) {
    console.error('getConversations error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}

export const createConversation = async (req, res) => {
  try {
    const { recipientId } = req.body

    const conversation = await Conversation.findOrCreate(
      req.user._id,
      recipientId
    )

    const populated = await conversation.populate('participants', '-password')

    res.status(200).json(populated)
  } catch (error) {
    console.error('createConversation error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}