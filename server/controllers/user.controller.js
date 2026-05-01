import User from '../models/User.js'

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('-password')
    res.status(200).json(users)
  } catch (error) {
    console.error('getUsers error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { username } = req.body

    if (!username || username.trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' })
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { username: username.trim() },
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