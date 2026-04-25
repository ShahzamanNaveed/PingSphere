import Conversation from '../models/Conversation.js'

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.user._id] },
    })
      .populate('participants', '-password')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })

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