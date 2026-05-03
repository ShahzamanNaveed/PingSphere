import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import axiosInstance from '../lib/axios'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user, logout, updateAvatar, updateProfile } = useAuthStore()
  const navigate = useNavigate()

  const [username, setUsername] = useState(user?.username || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [isProfileLoading, setIsProfileLoading] = useState(false)

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)

  const handleUpdate = async () => {
    if (username.trim().length < 3) {
      toast.error('Username must be at least 3 characters')
      return
    }
    if (bio.length > 150) {
      toast.error('Bio must be 150 characters or less')
      return
    }
    setIsProfileLoading(true)
    try {
      await updateProfile(username.trim(), bio.trim())
    } finally {
      setIsProfileLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All fields are required')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    setIsPasswordLoading(true)
    try {
      await axiosInstance.put('/users/password', { currentPassword, newPassword })
      toast.success('Password updated!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordForm(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setIsPasswordLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isProfileUnchanged =
    username.trim() === user?.username && bio.trim() === (user?.bio || '')

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md w-full max-w-md p-8">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-blue-500 transition-colors text-sm mb-6 flex items-center gap-1"
        >
          ← Back to chats
        </button>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <label className="cursor-pointer group relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white font-bold text-3xl">
              {user?.profilePic ? (
                <img src={user.profilePic} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                user?.username.charAt(0).toUpperCase()
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-medium">Change</span>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) updateAvatar(file)
              }}
            />
          </label>
          <p className="text-gray-400 text-xs mt-2">Click avatar to change</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{user?.email}</p>
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bio
            <span className="text-gray-400 font-normal ml-1">({bio.length}/150)</span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={150}
            rows={3}
            placeholder="Tell people a little about yourself..."
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300 resize-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        <button
          onClick={handleUpdate}
          disabled={isProfileLoading || isProfileUnchanged}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition-colors mb-6"
        >
          {isProfileLoading ? 'Saving...' : 'Save Changes'}
        </button>

        {/* Change Password Toggle */}
        <button
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          className="w-full text-sm text-blue-500 hover:text-blue-600 font-medium mb-3 text-left transition-colors"
        >
          {showPasswordForm ? '▲ Hide password form' : '▼ Change password'}
        </button>

        {/* Change Password Form */}
        {showPasswordForm && (
          <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 mb-4 flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                placeholder="Repeat new password"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={isPasswordLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {isPasswordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 dark:bg-red-900 hover:bg-red-100 dark:hover:bg-red-800 text-red-500 dark:text-red-300 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default ProfilePage