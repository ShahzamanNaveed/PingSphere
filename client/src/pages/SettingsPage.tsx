import React from 'react';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'
import axiosInstance from '../lib/axios'
import toast from 'react-hot-toast'

type Tab = 'account' | 'security' | 'appearance' | 'danger'

const SettingsPage = () => {
  const { user, logout, updateAvatar, updateProfile } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<Tab>('account')

  // Account tab state
  const [username, setUsername] = useState(user?.username || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [isProfileLoading, setIsProfileLoading] = useState(false)

  // Security tab state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const isProfileUnchanged =
    username.trim() === user?.username && bio.trim() === (user?.bio || '')

  const handleUpdate = async () => {
    if (username.trim().length < 3) return toast.error('Username must be at least 3 characters')
    if (bio.length > 150) return toast.error('Bio must be 150 characters or less')
    setIsProfileLoading(true)
    try {
      await updateProfile(username.trim(), bio.trim())
    } finally {
      setIsProfileLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) return toast.error('All fields are required')
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match')
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setIsPasswordLoading(true)
    try {
      await axiosInstance.put('/users/password', { currentPassword, newPassword })
      toast.success('Password updated!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
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

  const navItems: { id: Tab; label: string; icon: React.ReactElement }[] = [
    { 
      id: 'account', 
      label: 'Account', 
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    },
    { 
      id: 'security', 
      label: 'Security', 
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
    },
    { 
      id: 'appearance', 
      label: 'Appearance', 
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
    },
    { 
      id: 'danger', 
      label: 'Danger Zone', 
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col font-sans relative overflow-hidden">

      {/* Background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      {/* Top bar */}
      <div className="border-b border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md px-6 py-4 flex items-center gap-4 relative z-10">
        <button
          onClick={() => navigate('/')}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
        <span className="text-gray-900 dark:text-white font-bold">Settings</span>
      </div>

      <div className="flex flex-col md:flex-row flex-1 max-w-5xl mx-auto w-full gap-8 px-4 sm:px-6 md:px-8 py-8 relative z-10">

        {/* ── LEFT NAV ── */}
        <nav className="w-full md:w-64 flex-shrink-0 space-y-8">
          <div className="glass-card p-3 shadow-sm border border-gray-100 dark:border-gray-800/60">
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
                      activeTab === item.id
                        ? item.id === 'danger'
                          ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 shadow-sm'
                          : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span className={activeTab === item.id ? (item.id === 'danger' ? 'text-red-500' : 'text-indigo-500') : 'text-gray-400'}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Version tag */}
          <div className="px-4 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
              </div>
              <p className="text-gray-900 dark:text-white font-bold text-sm">PingSphere</p>
            </div>
            <p className="text-gray-400 text-xs font-medium ml-8">Version 1.0.0</p>
          </div>
        </nav>

        {/* ── RIGHT PANEL ── */}
        <main className="flex-1 min-w-0">
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            {/* ── ACCOUNT TAB ── */}
            {activeTab === 'account' && (
              <div className="glass-card p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800/60">
                <div className="mb-8">
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Account Settings</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your public profile information and personal details.</p>
                </div>

                <div className="space-y-8">
                  {/* Avatar */}
                  <div className="flex items-center gap-6 pb-8 border-b border-gray-100 dark:border-gray-800/50">
                    <label className="cursor-pointer group relative flex-shrink-0">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-3xl ring-4 ring-white dark:ring-gray-900 shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
                        {user?.profilePic ? (
                          <img src={user.profilePic} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          user?.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
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
                    <div>
                      <p className="text-gray-900 dark:text-white font-bold text-lg">{user?.username}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{user?.email}</p>
                      <p className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold mt-2 group-hover:underline cursor-pointer">Change Profile Photo</p>
                    </div>
                  </div>

                  <div className="max-w-md space-y-5">
                    {/* Username */}
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/60 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-white transition-all font-medium"
                        placeholder="your_username"
                      />
                      <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-1.5 ml-1">Must be at least 3 characters long</p>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="flex justify-between items-center text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                        Bio
                        <span className={`text-[11px] font-normal ${bio.length >= 150 ? 'text-red-500' : 'text-gray-400'}`}>{bio.length}/150</span>
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={150}
                        rows={3}
                        placeholder="Tell people about yourself..."
                        className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/60 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none transition-all custom-scrollbar leading-relaxed"
                      />
                    </div>

                    <button
                      onClick={handleUpdate}
                      disabled={isProfileLoading || isProfileUnchanged}
                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-200 dark:disabled:bg-indigo-900/50 disabled:text-indigo-400 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-500/20 disabled:shadow-none mt-2"
                    >
                      {isProfileLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Saving...
                        </span>
                      ) : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── SECURITY TAB ── */}
            {activeTab === 'security' && (
              <div className="glass-card p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800/60">
                <div className="mb-8">
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Security</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Update your password to keep your account safe.</p>
                </div>

                <div className="bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-6 max-w-md flex flex-col gap-5">
                  {/* Current password */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-gray-900 dark:text-white transition-all pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
                      >
                        {showCurrent ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New password */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-gray-900 dark:text-white transition-all pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
                      >
                        {showNew ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-1.5 ml-1">Must be at least 6 characters</p>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full px-4 py-2.5 bg-white dark:bg-gray-900/80 border rounded-xl text-sm outline-none focus:ring-2 transition-all pr-10 ${
                          confirmPassword && newPassword !== confirmPassword 
                            ? 'border-red-300 dark:border-red-500/50 focus:border-red-500 focus:ring-red-500/50 text-red-900 dark:text-red-100' 
                            : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500/50 focus:border-indigo-500 text-gray-900 dark:text-white'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
                      >
                        {showConfirm ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                    {/* Match indicator */}
                    {confirmPassword && (
                      <p className={`text-[11px] font-medium mt-1.5 ml-1 flex items-center gap-1 ${newPassword === confirmPassword ? 'text-emerald-500' : 'text-red-500'}`}>
                        {newPassword === confirmPassword ? (
                          <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Passwords match</>
                        ) : (
                          <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> Passwords do not match</>
                        )}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={isPasswordLoading || (!!confirmPassword && newPassword !== confirmPassword)}
                    className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed py-2.5 rounded-xl text-sm font-bold transition-all mt-2 shadow-sm"
                  >
                    {isPasswordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}

            {/* ── APPEARANCE TAB ── */}
            {activeTab === 'appearance' && (
              <div className="glass-card p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800/60">
                <div className="mb-8">
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Appearance</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Customize how PingSphere looks on your device.</p>
                </div>

                <div className="max-w-md space-y-6">
                  {/* Theme toggle */}
                  <div className="bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">Theme Mode</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Currently running in <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{isDark ? 'Dark' : 'Light'}</span> mode
                      </p>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                        isDark ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center text-[10px] ${
                          isDark ? 'translate-x-7' : 'translate-x-0'
                        }`}
                      >
                        {isDark ? '🌙' : '☀️'}
                      </span>
                    </button>
                  </div>

                  {/* Theme cards */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-3 ml-1">Theme Preview</label>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Dark Preview */}
                      <button
                        onClick={() => !isDark && toggleTheme()}
                        className={`relative rounded-2xl p-4 text-left transition-all overflow-hidden border-2 ${
                          isDark
                            ? 'border-indigo-500 bg-indigo-500/5 shadow-md'
                            : 'border-transparent bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="w-full h-20 rounded-xl bg-gray-950 mb-4 border border-gray-800 flex flex-col justify-end p-2 gap-2 relative overflow-hidden">
                          <div className="absolute top-2 left-2 w-12 h-2 rounded bg-gray-800" />
                          <div className="flex items-end gap-1.5 w-full">
                            <div className="w-6 h-4 rounded-md bg-indigo-600" />
                            <div className="w-12 h-3 rounded bg-gray-800" />
                          </div>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">Dark</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Sleek, modern vibe</p>
                        {isDark && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </div>
                        )}
                      </button>

                      {/* Light Preview */}
                      <button
                        onClick={() => isDark && toggleTheme()}
                        className={`relative rounded-2xl p-4 text-left transition-all overflow-hidden border-2 ${
                          !isDark
                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                            : 'border-transparent bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="w-full h-20 rounded-xl bg-white mb-4 border border-gray-200 flex flex-col justify-end p-2 gap-2 relative overflow-hidden shadow-sm">
                          <div className="absolute top-2 left-2 w-12 h-2 rounded bg-gray-200" />
                          <div className="flex items-end gap-1.5 w-full">
                            <div className="w-6 h-4 rounded-md bg-indigo-500" />
                            <div className="w-12 h-3 rounded bg-gray-200" />
                          </div>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">Light</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Clean, bright look</p>
                        {!isDark && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── DANGER ZONE TAB ── */}
            {activeTab === 'danger' && (
              <div className="glass-card p-6 md:p-8 shadow-sm border border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/5">
                <div className="mb-8">
                  <h2 className="text-2xl font-extrabold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Irreversible or potentially destructive actions.</p>
                </div>

                <div className="max-w-md space-y-4">
                  {/* Logout */}
                  <div className="bg-white/80 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">Log Out</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        You'll be securely signed out of your account on this device.
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex-shrink-0 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold px-4 py-2 rounded-xl text-sm transition-all border border-transparent hover:border-red-200 dark:hover:border-red-500/30"
                    >
                      Log Out
                    </button>
                  </div>

                  {/* Placeholder for future: delete account */}
                  <div className="bg-white/50 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-800/50 rounded-2xl p-5 flex items-center justify-between gap-4 opacity-60">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">Delete Account</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Permanently erase your account, messages, and profile.
                      </p>
                    </div>
                    <button
                      disabled
                      className="flex-shrink-0 bg-gray-100 dark:bg-gray-800 text-gray-400 font-bold px-4 py-2 rounded-xl text-sm cursor-not-allowed border border-transparent"
                    >
                      Soon
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default SettingsPage