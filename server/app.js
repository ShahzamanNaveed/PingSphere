import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

const app = express()

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())

// Routes
app.get('/', (req, res) => {
  res.send('PingSphere server is alive!')
})

export default app