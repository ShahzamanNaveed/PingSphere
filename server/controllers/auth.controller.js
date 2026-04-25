import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'
import User from '../models/User.js'

const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

export const register = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const { username, email, password } = req.body

    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return res.status(400).json({ message: 'Email or username already taken' })
    }

    const user = await User.create({ username, email, password })

    generateToken(user._id, res)

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
    })
  } catch (error) {
    console.error('Register error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}

export const login = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    generateToken(user._id, res)

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
    })
  } catch (error) {
    console.error('Login error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}

export const logout = (req, res) => {
  res.cookie('jwt', '', { maxAge: 0 })
  res.status(200).json({ message: 'Logged out successfully' })
}