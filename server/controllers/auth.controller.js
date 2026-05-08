import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'
import User from '../models/User.js'
import crypto from 'crypto'
import sendEmail from '../utils/sendEmail.js'

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

const setTokenCookie = (res, token) => {
  res.cookie('jwt', token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: true,
    sameSite: 'none',
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
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  })
  res.status(200).json({ message: 'Logged out successfully' })
}

export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex')

    // Hash token before saving
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000 // 10 min

    await user.save({ validateBeforeSave: false })

    // Reset URL (frontend page)
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

    // Email message
    const message = `
You requested a password reset for PingSphere.

Click below to reset your password:
${resetUrl}

This link expires in 10 minutes.
`

    await sendEmail({
      email: user.email,
      subject: 'PingSphere Password Reset',
      message,
    })

    res.status(200).json({
      message: 'Password reset email sent successfully',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' })
    }

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    res.status(200).json({ message: 'Password reset successful' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getMe = async (req, res) => {
  try {
    res.status(200).json(req.user)
  } catch (error) {
    console.error('getMe error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}