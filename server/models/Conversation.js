import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
  },
  { timestamps: true }
)

// compound index on participants for fast lookups
conversationSchema.index({ participants: 1 })

// static method — find existing conversation or create a new one
conversationSchema.statics.findOrCreate = async function (userAId, userBId) {
  let conversation = await this.findOne({
    participants: { $all: [userAId, userBId] },
  })

  if (!conversation) {
    conversation = await this.create({
      participants: [userAId, userBId],
    })
  }

  return conversation
}

const Conversation = mongoose.model('Conversation', conversationSchema)

export default Conversation