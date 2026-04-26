import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import axiosInstance from '../lib/axios'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user, logout, checkAuth } = useAuthStore()
  const navigate = useNavigate()

  const [username, setUsername] = useState(user?.username || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async () => {
    if (username.trim().length < 3) {
      toast.error('Username must be at least 3 characters')
      return
    }

    setIsLoading(true)
    try {
      await axiosInstance.put('/users/profile', { username: username.trim() })
      await checkAuth()
      toast.success('Profile updated!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">

        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-blue-500 transition-colors text-sm mb-6 flex items-center gap-1"
        >
          ← Back to chats
        </button>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-3xl mb-3">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <p className="text-gray-500 text-sm">{user?.email}</p>
        </div>

        {/* Username field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Update button */}
        <button
          onClick={handleUpdate}
          disabled={isLoading || username.trim() === user?.username}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition-colors mb-3"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>

        {/* Logout button */}
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