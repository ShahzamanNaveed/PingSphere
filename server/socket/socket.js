import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import Message from '../models/Message.js'
import Conversation from '../models/Conversation.js'

const presenceMap = new Map()

export const getSocketId = (userId) => presenceMap.get(userId)

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  })

  // JWT verification middleware
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

    // Handle sendMessage event
    socket.on('sendMessage', async ({ conversationId, text }) => {
      try {
        const message = await Message.create({
          conversationId,
          senderId: socket.userId,
          text,
        })

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          updatedAt: new Date(),
        })

        // Find the recipient and emit to them
        const conversation = await Conversation.findById(conversationId)
        const recipientId = conversation.participants.find(
          (id) => id.toString() !== socket.userId
        )

        const recipientSocketId = presenceMap.get(recipientId?.toString())
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('newMessage', message)
        }

        // Also emit back to sender
        socket.emit('newMessage', message)
      } catch (error) {
        console.error('sendMessage error:', error.message)
      }
    })

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`)
      presenceMap.delete(socket.userId)
      io.emit('onlineUsers', Array.from(presenceMap.keys()))
    })
  })

  return io
}