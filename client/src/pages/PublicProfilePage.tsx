import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../lib/axios'
import useChatStore from '../store/chatStore'
import useAuthStore from '../store/authStore'

interface PublicUser {
  _id: string
  username: string
  email: string
  profilePic: string
  bio: string
  createdAt: string
  lastSeen: string | null
}

const getLastSeenLabel = (lastSeen: string | null | undefined): string => {
  if (!lastSeen) return 'Offline'
  const date = new Date(lastSeen)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Last seen just now'
  if (diffMins < 60) return `Last seen ${diffMins}m ago`
  if (diffHours < 24) return `Last seen ${diffHours}h ago`
  if (diffDays === 1) return 'Last seen yesterday'
  if (diffDays < 7) return `Last seen ${diffDays} days ago`
  return `Last seen ${date.toLocaleDateString([], { day: 'numeric', month: 'short' })}`
}

const getMemberSince = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString([], { month: 'long', year: 'numeric' })
}

const PublicProfilePage = () => {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { user: me } = useAuthStore()
  const { createConversation, onlineUsers } = useChatStore()

  const [profile, setProfile] = useState<PublicUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const isOnline = profile ? onlineUsers.includes(profile._id) : false
  const isMe = profile?._id === me?._id

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      try {
        const res = await axiosInstance.get(`/users/${userId}`)
        setProfile(res.data)
      } catch (err: any) {
        if (err.response?.status === 404) setNotFound(true)
      } finally {
        setIsLoading(false)
      }
    }
    if (userId) fetchUser()
  }, [userId])

  const handleSendMessage = async () => {
    if (!profile) return
    await createConversation(profile._id)
    navigate('/')
  }

  // ── LOADING ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
          <span className="font-medium">Loading profile...</span>
        </div>
      </div>
    )
  }

  // ── NOT FOUND ──
  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center font-sans p-4">
        <div className="text-center glass-card p-10 max-w-sm w-full">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <p className="text-gray-900 dark:text-white font-bold text-xl mb-2">User not found</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">This profile doesn't exist or was removed.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-indigo-500/20"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col font-sans relative overflow-hidden">
      
      {/* Background blurs */}
      <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

      {/* Top bar */}
      <div className="border-b border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md px-6 py-4 flex items-center gap-4 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
        <span className="text-gray-900 dark:text-white font-bold">Profile Details</span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center px-4 py-8 md:py-16 relative z-10">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="glass-card overflow-hidden animate-in fade-in zoom-in-95 duration-500 border border-gray-100 dark:border-gray-800/60 shadow-xl shadow-gray-200/50 dark:shadow-black/20">

            {/* Banner strip */}
            <div className="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
              <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Avatar + info */}
            <div className="px-6 pb-8 relative">
              {/* Avatar floated up over banner */}
              <div className="flex justify-between items-end -mt-12 mb-5">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white dark:ring-gray-900 bg-white dark:bg-gray-800 shadow-lg">
                    {profile.profilePic ? (
                      <img src={profile.profilePic} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300 text-4xl font-bold">
                        {profile.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span
                    className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-[3px] border-white dark:border-gray-900 shadow-sm ${
                      isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}
                  />
                </div>

                {/* Action button */}
                {!isMe && (
                  <button
                    onClick={handleSendMessage}
                    className="mb-1 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    Message
                  </button>
                )}
                {isMe && (
                  <button
                    onClick={() => navigate('/settings')}
                    className="mb-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Username + status */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-gray-900 dark:text-white font-extrabold text-2xl tracking-tight">{profile.username}</h1>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm ${
                      isOnline
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{profile.email}</p>
              </div>

              {/* Bio */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">About</h3>
                {profile.bio ? (
                  <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/60 rounded-2xl px-5 py-4 shadow-inner">
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800/30 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-center">
                    <p className="text-gray-400 text-sm italic">This user hasn't written a bio yet.</p>
                  </div>
                )}
              </div>

              {/* Meta info */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Joined</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{getMemberSince(profile.createdAt)}</span>
                </div>
                {!isOnline && (
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-900/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Last Seen</span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{getLastSeenLabel(profile.lastSeen)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicProfilePage