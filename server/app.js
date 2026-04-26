import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import sanitizeHtml from 'sanitize-html'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import conversationRoutes from './routes/conversation.routes.js'
import messageRoutes from './routes/message.routes.js'

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Recursively sanitize an object's string values
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return
  for (const key of Object.keys(obj)) {
    // Strip MongoDB operators
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key]
      continue
    }
    if (typeof obj[key] === 'string') {
      // Strip XSS
      obj[key] = sanitizeHtml(obj[key], { allowedTags: [], allowedAttributes: {} })
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key])
    }
  }
}

const app = express()

app.use(helmet())
app.use(globalLimiter)
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())

// Custom sanitize middleware — safe with Express v5
app.use((req, res, next) => {
  sanitizeObject(req.body)
  sanitizeObject(req.params)
  next()
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/messages', messageRoutes)

app.get('/', (req, res) => {
  res.send('PingSphere server is alive!')
})

export default app