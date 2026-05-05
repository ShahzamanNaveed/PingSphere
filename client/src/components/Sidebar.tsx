import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useChatStore from '../store/chatStore'
import useThemeStore from '../store/themeStore'
import TypingDots from './TypingDots'

const ConversationSkeleton = () => (
  <div className="flex items-center gap-3 p-3 mx-2 my-1 rounded-xl animate-pulse">
    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex-shrink-0" />
    <div className="flex-1 space-y-2.5 py-1">
      <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded-full w-1/2" />
      <div className="h-3 bg-gray-100 dark:bg-gray-800/60 rounded-full w-3/4" />
    </div>
  </div>
)

const Sidebar = () => {
  const { user } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const {
    conversations,
    getConversations,
    setSelectedConversation,
    selectedConversation,
    users,
    getUsers,
    createConversation,
    isUsersLoading,
    isConversationsLoading,
    isTyping,
    onlineUsers,
    unreadCounts,
  } = useChatStore()

  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    getConversations()
  }, [getConversations])

  const handleOpenModal = () => {
    setShowModal(true)
    getUsers()
  }

  const handleSelectUser = async (userId: string) => {
    await createConversation(userId)
    setShowModal(false)
  }

  const getOtherUser = (conversation: any) => {
    return conversation.participants?.find((p: any) => p._id !== user?._id)
  }

  const filtered = conversations.filter((c) => {
    const other = getOtherUser(c)
    return other?.username?.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="w-full bg-white dark:bg-gray-900 flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md transform-gpu z-10 shrink-0">
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
            {user?.profilePic ? (
              <img src={user.profilePic} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              user?.username?.charAt(0).toUpperCase() || '?'
            )}
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{user?.username}</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
          
          {/* Settings */}
          <button
            onClick={() => navigate('/settings')}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* New conversation */}
          <button
            onClick={handleOpenModal}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors ml-1"
            title="New conversation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 shrink-0">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-100/80 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-500/40 focus:bg-white dark:focus:bg-gray-800 transition-all border border-transparent focus:border-indigo-200 dark:focus:border-indigo-500/30"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5 custom-scrollbar">
        {isConversationsLoading ? (
          <>
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <div className="w-12 h-12 mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <p className="text-sm font-medium">No conversations yet</p>
          </div>
        ) : (
          filtered.map((conversation) => {
            const other = getOtherUser(conversation)
            const isSelected = selectedConversation?._id === conversation._id
            const isOtherOnline = onlineUsers.includes(other?._id || '')
            const unreadCount = unreadCounts[conversation._id] || 0

            return (
              <div
                key={conversation._id}
                onClick={() => setSelectedConversation(conversation)}
                className={`flex items-center gap-3.5 p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-500/15'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-lg shadow-sm">
                    {other?.profilePic ? (
                      <img src={other.profilePic} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      other?.username?.charAt(0).toUpperCase() || '?'
                    )}
                  </div>
                  {isOtherOnline && (
                    <span className="absolute bottom-0 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm" />
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center h-12">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <p className={`font-semibold text-sm truncate pr-2 ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-gray-900 dark:text-gray-100'}`}>
                      {other?.username || 'Unknown User'}
                    </p>
                    {/* Timestamp placeholder - optional enhancement if data existed */}
                    {conversation.lastMessage && (
                      <span className={`text-[10px] font-medium shrink-0 ${unreadCount > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {new Date(conversation.lastMessage.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center gap-2">
                    <p className={`text-[13px] truncate ${unreadCount > 0 ? 'font-medium text-gray-900 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                      {isTyping === conversation._id ? (
                        <span className="flex items-center gap-1 text-indigo-500 font-medium tracking-wide">
                          typing <TypingDots />
                        </span>
                      ) : conversation.lastMessage ? (
                        conversation.lastMessage.text
                      ) : (
                        <span className="italic opacity-70">No messages yet</span>
                      )}
                    </p>
                    {unreadCount > 0 && (
                      <div className="flex-shrink-0 min-w-[20px] h-5 bg-indigo-500 rounded-full flex items-center justify-center px-1.5 shadow-sm shadow-indigo-500/30">
                        <span className="text-white text-[11px] font-bold leading-none">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* New Conversation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm transform-gpu flex items-center justify-center z-[100] p-4">
          <div 
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30 rounded-t-2xl">
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">New Conversation</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[60vh] p-2 custom-scrollbar">
              {isUsersLoading ? (
                <>
                  <ConversationSkeleton />
                  <ConversationSkeleton />
                  <ConversationSkeleton />
                </>
              ) : users.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <p className="text-sm font-medium">No other users found</p>
                </div>
              ) : (
                users.map((u: any) => (
                  <div
                    key={u._id}
                    onClick={() => handleSelectUser(u._id)}
                    className="flex items-center gap-3.5 p-3 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {u.profilePic ? (
                          <img src={u.profilePic} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          u.username?.charAt(0).toUpperCase() || '?'
                        )}
                      </div>
                      {onlineUsers.includes(u._id) && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full" />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{u.username}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Sidebar