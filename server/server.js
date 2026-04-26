import dotenv from 'dotenv'
dotenv.config()

import http from 'http'
import app from './app.js'
import connectDB from './config/db.js'
import { initSocket } from './socket/socket.js'

const PORT = process.env.PORT || 5000

console.log('ENV CHECK:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGO_URI: process.env.MONGO_URI ? 'EXISTS' : 'UNDEFINED',
  JWT_SECRET: process.env.JWT_SECRET ? 'EXISTS' : 'UNDEFINED',
})

const server = http.createServer(app)
initSocket(server)
connectDB()
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})