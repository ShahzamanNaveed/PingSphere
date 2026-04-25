import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - no token' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized - invalid token' })
    }

    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - user not found' })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('protectRoute error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}

export default protectRoute