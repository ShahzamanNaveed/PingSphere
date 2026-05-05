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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <div className="glass-card w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="flex items-center mb-8 relative">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors absolute left-0"
            title="Back to chats"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white w-full text-center tracking-tight">Your Profile</h2>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <label className="cursor-pointer group relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg ring-4 ring-white dark:ring-gray-900 transition-transform group-hover:scale-105">
              {user?.profilePic ? (
                <img src={user.profilePic} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                user?.username.charAt(0).toUpperCase()
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-[2px] transform-gpu flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <svg className="w-8 h-8 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
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
          <div className="mt-4 text-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user?.username}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/60 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-white transition-all font-medium"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="flex justify-between items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
              Bio
              <span className={`text-xs font-normal ${bio.length >= 150 ? 'text-red-500' : 'text-gray-400'}`}>{bio.length}/150</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={150}
              rows={3}
              placeholder="Tell people a little about yourself..."
              className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/60 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none transition-all custom-scrollbar leading-relaxed"
            />
          </div>

          <button
            onClick={handleUpdate}
            disabled={isProfileLoading || isProfileUnchanged}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 dark:disabled:bg-indigo-800/50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:shadow-none"
          >
            {isProfileLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Saving...
              </span>
            ) : 'Save Changes'}
          </button>
        </div>

        <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6">
          {/* Change Password Toggle */}
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex items-center justify-between w-full p-4 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-colors group mb-4"
          >
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200 font-semibold text-sm">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              Security & Password
            </div>
            <svg className={`w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-transform duration-300 ${showPasswordForm ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>

          {/* Change Password Form */}
          {showPasswordForm && (
            <div className="bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/60 rounded-xl p-5 mb-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
              <div>
                <label className="block text-[13px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5 ml-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 text-gray-900 dark:text-white transition-all"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5 ml-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 text-gray-900 dark:text-white transition-all"
                  placeholder="At least 6 characters"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5 ml-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 text-gray-900 dark:text-white transition-all"
                  placeholder="Repeat new password"
                />
              </div>
              <button
                onClick={handleChangePassword}
                disabled={isPasswordLoading}
                className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-bold transition-all mt-1"
              >
                {isPasswordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border border-transparent hover:border-red-200 dark:hover:border-red-900/50 py-3 rounded-xl text-sm font-bold transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Log Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage