import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import Message from '../models/Message.js'
import Conversation from '../models/Conversation.js'
import { updateLastSeen } from '../controllers/user.controller.js'

const presenceMap = new Map()

export const getSocketId = (userId) => presenceMap.get(userId)

let io

export const getIO = () => io

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
    transports: process.env.NODE_ENV === 'production' ? ['websocket'] : ['polling', 'websocket'],
  })

  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || '')
      const token = cookies.jwt

      if (!token) {
        return next(new Error('Unauthorized - no token'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = decoded.userId
      next()
    } catch (error) {
      next(new Error('Unauthorized - invalid token'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId} | socketId: ${socket.id}`)

    presenceMap.set(socket.userId, socket.id)
    io.emit('onlineUsers', Array.from(presenceMap.keys()))

    socket.on('sendMessage', async ({ conversationId, text, replyTo }) => {
      try {
        const message = await Message.create({
          conversationId,
          senderId: socket.userId,
          text,
          replyTo: replyTo || null,
        })

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          updatedAt: new Date(),
        })

        const conversation = await Conversation.findById(conversationId)
        const recipientId = conversation.participants.find(
          (id) => id.toString() !== socket.userId
        )

        const populatedMessage = await Message.findById(message._id).populate('replyTo', 'text senderId')

        const recipientSocketId = presenceMap.get(recipientId?.toString())
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('newMessage', populatedMessage)
        }

        socket.emit('newMessage', populatedMessage)
      } catch (error) {
        console.error('sendMessage error:', error.message)
      }
    })

    socket.on('typing', ({ conversationId }) => {
      Conversation.findById(conversationId).then((conv) => {
        if (!conv) return
        const recipientId = conv.participants.find(
          (id) => id.toString() !== socket.userId
        )
        const recipientSocketId = presenceMap.get(recipientId?.toString())
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('typing', { conversationId })
        }
      })
    })

    socket.on('stopTyping', ({ conversationId }) => {
      Conversation.findById(conversationId).then((conv) => {
        if (!conv) return
        const recipientId = conv.participants.find(
          (id) => id.toString() !== socket.userId
        )
        const recipientSocketId = presenceMap.get(recipientId?.toString())
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('stopTyping', { conversationId })
        }
      })
    })

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`)
      presenceMap.delete(socket.userId)
      io.emit('onlineUsers', Array.from(presenceMap.keys()))
      updateLastSeen(socket.userId)
    })
  })

  return io
}