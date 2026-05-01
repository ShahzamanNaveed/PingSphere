import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import axiosInstance from '../lib/axios'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user, logout, checkAuth, updateAvatar } = useAuthStore()
  const navigate = useNavigate()

  const [username, setUsername] = useState(user?.username || '')
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
    setIsProfileLoading(true)
    try {
      await axiosInstance.put('/users/profile', { username: username.trim() })
      await checkAuth()
      toast.success('Profile updated!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong')
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">
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
          <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <button
          onClick={handleUpdate}
          disabled={isProfileLoading || username.trim() === user?.username}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition-colors mb-6"
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
          <div className="border border-gray-100 rounded-xl p-4 mb-4 flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Repeat new password"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={isPasswordLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {isPasswordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 hover:bg-red-100 text-red-500 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default ProfilePage