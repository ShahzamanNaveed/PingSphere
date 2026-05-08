import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useChatStore from '../store/chatStore'
import TypingDots from './TypingDots'

const EMOJI_LIST = ['❤️', '😂', '😮', '😢', '😡', '👍']

const getDateLabel = (dateStr: string): string => {
  if (!dateStr) return 'Unknown Date'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Unknown Date'
  
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })
}

const formatTime = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getLastSeenLabel = (lastSeen: string | null | undefined): string => {
  if (!lastSeen) return 'Offline'
  const date = new Date(lastSeen)
  if (isNaN(date.getTime())) return 'Offline'
  
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

const MessageSkeleton = () => (
  <div className="flex flex-col gap-5 animate-pulse p-4">
    <div className="flex justify-start">
      <div className="h-12 w-64 bg-gray-200 dark:bg-gray-800 rounded-2xl rounded-bl-sm" />
    </div>
    <div className="flex justify-end">
      <div className="h-12 w-48 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl rounded-br-sm" />
    </div>
    <div className="flex justify-start">
      <div className="h-20 w-72 bg-gray-200 dark:bg-gray-800 rounded-2xl rounded-bl-sm" />
    </div>
    <div className="flex justify-end">
      <div className="h-12 w-56 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl rounded-br-sm" />
    </div>
    <div className="flex justify-start">
      <div className="h-12 w-40 bg-gray-200 dark:bg-gray-800 rounded-2xl rounded-bl-sm" />
    </div>
  </div>
)

const ChatArea = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const {
    selectedConversation,
    messages,
    getMessages,
    sendMessage,
    onlineUsers,
    isTyping,
    isMessagesLoading,
    setSelectedConversation,
    hasMoreMessages,
    loadMoreMessages,
    markSeen,
    unsendMessage,
    editMessage,
    replyingTo,
    setReplyingTo,
    reactToMessage,
    searchMessages,
    clearSearch,
    searchResults,
    isSearching,
  } = useChatStore()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [emojiPickerFor, setEmojiPickerFor] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const editInputRef = useRef<HTMLTextAreaElement>(null)

  const getOtherUser = () => {
    return selectedConversation?.participants.find((p: any) => p._id !== user?._id)
  }

  const otherUser = getOtherUser()
  const isOnline = onlineUsers.includes(otherUser?._id || '')

  useEffect(() => {
    if (!selectedConversation) return
    getMessages(selectedConversation._id)
    markSeen(selectedConversation._id)
  }, [selectedConversation, getMessages, markSeen])

  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages])

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.setSelectionRange(
        editInputRef.current.value.length,
        editInputRef.current.value.length
      )
    }
  }, [editingId])

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  useEffect(() => {
    const handleClickOutside = () => setEmojiPickerFor(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleCloseSearch = () => {
    setShowSearch(false)
    setSearchQuery('')
    clearSearch()
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setSearchQuery(q)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      if (selectedConversation) {
        searchMessages(selectedConversation._id, q)
      }
    }, 400)
  }

  const handleScroll = () => {
    if (!messagesContainerRef.current) return
    if (messagesContainerRef.current.scrollTop === 0 && hasMoreMessages) {
      loadMoreMessages(selectedConversation!._id)
    }
  }

  const handleSend = (text: string) => {
    if (!selectedConversation) return
    sendMessage(selectedConversation._id, text)
  }

  const handleStartEdit = (messageId: string, currentText: string) => {
    setEditingId(messageId)
    setEditText(currentText)
  }

  const handleConfirmEdit = async () => {
    if (!editingId || !editText.trim()) return
    await editMessage(editingId, editText.trim())
    setEditingId(null)
    setEditText('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const handleReact = async (e: React.MouseEvent, messageId: string, emoji: string) => {
    e.stopPropagation()
    setEmojiPickerFor(null)
    await reactToMessage(messageId, emoji)
  }

  const renderMessage = (message: any, index: number, list: any[], isSearchResult = false) => {
    const isMine = message.senderId === user?._id || message.pending === true
    const showDivider = !isSearchResult && (
      index === 0 ||
      getDateLabel(message.createdAt) !== getDateLabel(list[index - 1].createdAt)
    )
    const isEditing = editingId === message._id
    const hasReactions = message.reactions && message.reactions.length > 0
    const myReaction = message.reactions?.find((r: any) => r.userId === user?._id)

    return (
      <div key={message._id}>
        {showDivider && (
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
            <span className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-800/60 shadow-sm">{getDateLabel(message.createdAt)}</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
          </div>
        )}

        {isSearchResult && (
          <div className="flex justify-center mb-2">
            <span className="text-[10px] font-medium text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">
              {getDateLabel(message.createdAt)} · {formatTime(message.createdAt)}
            </span>
          </div>
        )}

        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} group relative mb-1.5`}>

          {isMine && !message.pending && !isEditing && !isSearchResult && (
            <div className="flex items-center gap-1.5 mr-3 opacity-0 group-hover:opacity-100 transition-opacity self-center">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEmojiPickerFor(emojiPickerFor === message._id ? null : message._id)
                  }}
                  className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-amber-500 transition-colors shadow-sm border border-gray-100 dark:border-gray-700"
                  title="React"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
                {emojiPickerFor === message._id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-10 right-0 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-100 dark:border-gray-700 px-3 py-2 flex gap-2 z-50 animate-in fade-in slide-in-from-bottom-2"
                  >
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={(e) => handleReact(e, message._id, emoji)}
                        className={`text-xl hover:scale-125 transition-transform rounded-full w-8 h-8 flex items-center justify-center ${myReaction?.emoji === emoji ? 'bg-indigo-50 dark:bg-indigo-500/20' : ''}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setReplyingTo(message)}
                className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-indigo-500 transition-colors shadow-sm border border-gray-100 dark:border-gray-700"
                title="Reply"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
              </button>
              <button
                onClick={() => handleStartEdit(message._id, message.text)}
                className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-indigo-500 transition-colors shadow-sm border border-gray-100 dark:border-gray-700"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
              <button
                onClick={() => unsendMessage(message._id)}
                className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm border border-gray-100 dark:border-gray-700"
                title="Unsend"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          )}

          {!isMine && !isEditing && !isSearchResult && (
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity self-center order-last ml-3">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEmojiPickerFor(emojiPickerFor === message._id ? null : message._id)
                  }}
                  className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-amber-500 transition-colors shadow-sm border border-gray-100 dark:border-gray-700"
                  title="React"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
                {emojiPickerFor === message._id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-10 left-0 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-100 dark:border-gray-700 px-3 py-2 flex gap-2 z-50 animate-in fade-in slide-in-from-bottom-2"
                  >
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={(e) => handleReact(e, message._id, emoji)}
                        className={`text-xl hover:scale-125 transition-transform rounded-full w-8 h-8 flex items-center justify-center ${myReaction?.emoji === emoji ? 'bg-indigo-50 dark:bg-indigo-500/20' : ''}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setReplyingTo(message)}
                className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-indigo-500 transition-colors shadow-sm border border-gray-100 dark:border-gray-700"
                title="Reply"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
              </button>
            </div>
          )}

          <div className="flex flex-col max-w-[75%] lg:max-w-[65%] relative">
            <div
              className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm transition-all duration-200 ${
                isMine
                  ? `${message.pending ? 'bg-indigo-400 shadow-none' : 'bg-indigo-600 shadow-indigo-500/20'} text-white rounded-br-sm`
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-sm'
              } ${isSearchResult ? 'ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-gray-900' : ''}`}
            >
              {message.replyTo && (
                <div className={`mb-2 px-3 py-2 rounded-xl border-l-4 text-sm ${
                  isMine
                    ? 'border-indigo-300 bg-indigo-700/50 text-indigo-50'
                    : 'border-indigo-400 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300'
                }`}>
                  <p className="font-bold text-xs mb-0.5 opacity-90">
                    {message.replyTo.senderId === user?._id ? 'You' : otherUser?.username || 'Unknown'}
                  </p>
                  <p className="truncate opacity-80">{message.replyTo.text}</p>
                </div>
              )}

              {isEditing ? (
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <textarea
                    ref={editInputRef}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleConfirmEdit()
                      }
                      if (e.key === 'Escape') handleCancelEdit()
                    }}
                    className="bg-indigo-700/50 text-white placeholder-indigo-200/50 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/50 resize-none w-full"
                    rows={2}
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={handleCancelEdit} className="text-xs font-medium text-indigo-200 hover:text-white transition-colors px-2 py-1">Cancel</button>
                    <button onClick={handleConfirmEdit} className="text-xs bg-white text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-colors font-bold shadow-sm">Save</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  
                  <div className={`flex items-center justify-end gap-1.5 mt-1.5 -mb-0.5 select-none ${isMine ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {message.edited && (
                      <span className="text-[10px] italic opacity-80 mr-1">edited</span>
                    )}
                    {!isSearchResult && (
                      <>
                        <span className="text-[10px] font-medium opacity-90">
                          {formatTime(message.createdAt)}
                        </span>
                        {isMine && !message.pending && (
                          <span className={`flex items-center ${message.seen ? 'text-indigo-200' : 'opacity-60'}`}>
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                              {message.seen ? (
                                <>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 13l4 4M21 7l-4 4" className="opacity-50" />
                                </>
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              )}
                            </svg>
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {hasReactions && (
              <div className={`flex flex-wrap gap-1 mt-1 z-10 ${isMine ? 'justify-end pr-1' : 'justify-start pl-1'}`}>
                {Object.entries(
                  message.reactions!.reduce((acc: Record<string, number>, r: any) => {
                    acc[r.emoji] = (acc[r.emoji] || 0) + 1
                    return acc
                  }, {})
                ).map(([emoji, count]) => (
                  <button
                    key={emoji}
                    onClick={() => reactToMessage(message._id, emoji)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border shadow-sm transition-all hover:scale-105 ${
                      myReaction?.emoji === emoji
                        ? 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300'
                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-sm">{emoji}</span>
                    {(count as number) > 1 && <span>{count as number}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-8 text-center h-full">
        <div className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">PingSphere</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">Select a conversation from the sidebar or start a new one to begin messaging.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-50 dark:opacity-5 pointer-events-none z-0" />

      {/* Chat Header */}
      <div className="px-5 py-3.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md transform-gpu border-b border-gray-100 dark:border-gray-800/60 flex items-center gap-3 z-20 shadow-sm shrink-0 relative">
        <button
          onClick={() => setSelectedConversation(null)}
          className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors mr-1"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>

        {/* Clickable avatar → public profile */}
        <div
          onClick={() => navigate(`/profile/${otherUser?._id}`)}
          className="relative w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
          title="View profile"
        >
          {otherUser?.profilePic ? (
            <img src={otherUser.profilePic} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            otherUser?.username?.charAt(0).toUpperCase() || '?'
          )}
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {/* Clickable username → public profile */}
          <p
            onClick={() => navigate(`/profile/${otherUser?._id}`)}
            className="font-bold text-gray-900 dark:text-white text-[15px] cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-fit leading-tight"
          >
            {otherUser?.username || 'Unknown User'}
          </p>
          <div className="h-4 flex items-center">
            {isTyping === selectedConversation._id ? (
              <p className="text-xs flex items-center gap-1.5 text-indigo-500 font-medium">typing <TypingDots /></p>
            ) : isOnline ? (
              <p className="text-[11px] font-medium text-emerald-500">Online now</p>
            ) : (
              <p className="text-[11px] text-gray-500 dark:text-gray-400">{getLastSeenLabel(otherUser?.lastSeen)}</p>
            )}
          </div>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => showSearch ? handleCloseSearch() : setShowSearch(true)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all text-sm flex-shrink-0 ${
              showSearch
                ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title="Search messages"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="More options"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
          </button>
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="px-5 py-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md transform-gpu border-b border-gray-100 dark:border-gray-800 z-10 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search in this conversation..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all border border-transparent focus:border-indigo-300"
            />
          </div>
          {isSearching && <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 absolute right-12">Searching</span>}
          <button
            onClick={handleCloseSearch}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Search results */}
      {showSearch && searchQuery.trim() ? (
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-gray-50/50 dark:bg-gray-950/30">
          {isSearching ? (
            <p className="text-center text-gray-400 text-sm mt-8 animate-pulse font-medium">Searching messages...</p>
          ) : searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-12 text-gray-400">
              <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-sm font-medium">No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{searchResults.length} Match{searchResults.length !== 1 ? 'es' : ''}</p>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
              </div>
              {searchResults.map((message, index) => renderMessage(message, index, searchResults, true))}
            </>
          )}
        </div>
      ) : (
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 md:px-6 flex flex-col bg-gray-50/80 dark:bg-gray-950/50 relative custom-scrollbar"
        >
          {isMessagesLoading ? (
            <MessageSkeleton />
          ) : (
            <>
              {hasMoreMessages && (
                <div className="flex justify-center py-4">
                  <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full text-[11px] font-medium text-gray-500 shadow-sm flex items-center gap-2">
                    <svg className="w-3 h-3 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    Scroll for history
                  </span>
                </div>
              )}
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center pb-20">
                  <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4">
                    <span className="text-4xl">👋</span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">Say Hello!</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">Send a message to start the conversation with {otherUser?.username || 'this user'}.</p>
                </div>
              ) : (
                <div className="mt-auto">
                  {messages.map((message, index) => renderMessage(message, index, messages))}
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} className="h-2" />
        </div>
      )}

      {/* Reply preview bar */}
      {replyingTo && (
        <div className="absolute bottom-[72px] left-4 right-4 md:left-6 md:right-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md transform-gpu border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-3 flex items-start gap-3 shadow-lg z-20 animate-in slide-in-from-bottom-5">
          <div className="flex-1 border-l-4 border-indigo-500 pl-3">
            <div className="flex items-center gap-2 mb-0.5">
              <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wide">
                Replying to {replyingTo.senderId === user?._id ? 'yourself' : otherUser?.username || 'Unknown'}
              </p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate opacity-90">{replyingTo.text}</p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Message Input */}
      <MessageInput onSend={handleSend} conversationId={selectedConversation._id} hasReply={!!replyingTo} />

    </div>
  )
}

const MessageInput = ({ onSend, conversationId, hasReply }: { onSend: (text: string) => void, conversationId: string, hasReply: boolean }) => {
  const { emitTyping, emitStopTyping } = useChatStore()
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const INPUT_EMOJIS = [
  '😀','😂','❤️','🔥','👍',
  '😭','😮','😡','🎉','👀'
  ]
  const insertEmoji = (emoji:string) => {

  if (!textRef.current) return

  textRef.current.value += emoji
  handleInput()
  textRef.current.focus()

  setShowEmojiPicker(false)
  }
  const textRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleInput = () => {
    const textarea = textRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
      return
    }

    emitTyping(conversationId)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(conversationId)
    }, 2000)
  }

  const handleSubmit = () => {
    const text = textRef.current?.value.trim()
    if (!text) return
    onSend(text)
    if (textRef.current) {
      textRef.current.value = ''
      textRef.current.style.height = 'auto'
    }
    emitStopTyping(conversationId)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
  }

  return (
    <div className={`p-4 md:p-6 bg-transparent shrink-0 relative z-10 transition-all ${hasReply ? 'pt-16' : ''}`}>
      <div className="flex items-end gap-3 bg-white dark:bg-gray-800 p-2 pl-4 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-700/60 transition-all focus-within:shadow-indigo-500/10 focus-within:border-indigo-200 dark:focus-within:border-indigo-500/30">
        
        <div className="relative">

          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-400 hover:text-indigo-500 transition-colors mb-0.5"
          > 
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </button>
          {showEmojiPicker && (
             <div className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 px-3 py-2 flex gap-2 z-50">
                {INPUT_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={(e) => {
                    e.stopPropagation()
                    insertEmoji(emoji)
                   }}
                   className="text-xl hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        <button className="p-2 text-gray-400 hover:text-indigo-500 transition-colors mb-0.5">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
        </button>

        <textarea
          ref={textRef}
          placeholder="Message..."
          rows={1}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="flex-1 py-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 text-[15px] outline-none resize-none max-h-[120px] custom-scrollbar leading-relaxed"
        />
        
        <button
          onClick={handleSubmit}
          className="w-11 h-11 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center transition-all shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 flex-shrink-0 mb-0.5"
        >
          <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ChatArea