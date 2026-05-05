import User from '../models/User.js'
import cloudinary from '../config/cloudinary.js'
import multer from 'multer'

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('-password')
    res.status(200).json(users)
  } catch (error) {
    console.error('getUsers error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.status(200).json(user)
  } catch (error) {
    console.error('getUserById error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { username, bio } = req.body

    if (!username || username.trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' })
    }

    if (bio !== undefined && bio.length > 150) {
      return res.status(400).json({ message: 'Bio must be 150 characters or less' })
    }

    const updateData = { username: username.trim() }
    if (bio !== undefined) updateData.bio = bio.trim()

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password')

    res.status(200).json(updatedUser)
  } catch (error) {
    console.error('updateProfile error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body
  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' })
    }

    const user = await User.findById(req.user._id)
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    user.password = newPassword
    await user.save()

    res.status(200).json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('changePassword error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'pingsphere/avatars' },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      stream.end(req.file.buffer)
    })

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: result.secure_url },
      { new: true }
    ).select('-password')

    res.status(200).json(user)
  } catch (error) {
    console.error('uploadAvatar error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateLastSeen = async (userId) => {
  try {
    await User.findByIdAndUpdate(userId, { lastSeen: new Date() })
  } catch (error) {
    console.error('updateLastSeen error:', error.message)
  }
}

export const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Only JPEG, PNG and WebP images are allowed'))
  },
})