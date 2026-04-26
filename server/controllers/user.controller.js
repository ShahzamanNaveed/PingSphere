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