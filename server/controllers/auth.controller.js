import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'
import User from '../models/User.js'

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

const setTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production'
  res.cookie('jwt', token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
  })
}

export const register = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }

  const { username, email, password } = req.body

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    const user = await User.create({ username, email, password })
    const token = generateToken(user._id)
    setTokenCookie(res, token)

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
    })
  } catch (error) {
    console.error('register error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}

export const login = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }

  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user._id)
    setTokenCookie(res, token)

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
    })
  } catch (error) {
    console.error('login error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}

export const logout = async (req, res) => {
  res.clearCookie('jwt')
  res.status(200).json({ message: 'Logged out successfully' })
}

export const getMe = async (req, res) => {
  try {
    res.status(200).json(req.user)
  } catch (error) {
    console.error('getMe error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}