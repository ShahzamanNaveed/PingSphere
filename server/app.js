import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.routes.js'
import protectRoute from './middleware/protectRoute.js'

const app = express()

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth', authRoutes)



app.get('/', (req, res) => {
  res.send('PingSphere server is alive!')
})

export default app