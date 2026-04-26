import 'dotenv/config'
import http from 'http'
import app from './app.js'
import connectDB from './config/db.js'
import { initSocket } from './socket/socket.js'

const PORT = process.env.PORT || 5000

const server = http.createServer(app)
initSocket(server)
connectDB()
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})