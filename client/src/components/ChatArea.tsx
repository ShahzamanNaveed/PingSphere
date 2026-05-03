import { useEffect, useRef, useState } from 'react'
import useAuthStore from '../store/authStore'
import useChatStore from '../store/chatStore'
import TypingDots from './TypingDots'

const EMOJI_LIST = ['❤️', '😂', '😮', '😢', '😡', '👍']

const getDateLabel = (dateStr: string): string => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })
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

const MessageSkeleton = () => (
  <div className="flex flex-col gap-3 animate-pulse">
    <div className="flex justify-start">
      <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
    </div>
    <div className="flex justify-end">
      <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
    </div>
    <div className="flex justify-start">
      <div className="h-10 w-56 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
    </div>
    <div className="flex justify-end">
      <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
    </div>
    <div className="flex justify-start">
      <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
    </div>
  </div>
)

const ChatArea = () => {
  const { user } = useAuthStore()
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
  }, [selectedConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 px-2">{getDateLabel(message.createdAt)}</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>
        )}

        {isSearchResult && (
          <p className="text-xs text-gray-400 text-center mb-1">
            {getDateLabel(message.createdAt)} · {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}

        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} group relative`}>

          {isMine && !message.pending && !isEditing && !isSearchResult && (
            <div className="flex items-center gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity self-center">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEmojiPickerFor(emojiPickerFor === message._id ? null : message._id)
                  }}
                  className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-500 hover:text-yellow-500 transition-colors text-xs"
                  title="React"
                >
                  😊
                </button>
                {emojiPickerFor === message._id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-9 right-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 px-2 py-1 flex gap-1 z-50"
                  >
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={(e) => handleReact(e, message._id, emoji)}
                        className={`text-lg hover:scale-125 transition-transform p-0.5 rounded ${myReaction?.emoji === emoji ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setReplyingTo(message)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-500 hover:text-blue-500 transition-colors text-xs"
                title="Reply"
              >
                ↩
              </button>
              <button
                onClick={() => handleStartEdit(message._id, message.text)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-500 hover:text-blue-500 transition-colors text-xs"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={() => unsendMessage(message._id)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors text-xs"
                title="Unsend"
              >
                ✕
              </button>
            </div>
          )}

          {!isMine && !isEditing && !isSearchResult && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-center order-last ml-2">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEmojiPickerFor(emojiPickerFor === message._id ? null : message._id)
                  }}
                  className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-500 hover:text-yellow-500 transition-colors text-xs"
                  title="React"
                >
                  😊
                </button>
                {emojiPickerFor === message._id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-9 left-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 px-2 py-1 flex gap-1 z-50"
                  >
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={(e) => handleReact(e, message._id, emoji)}
                        className={`text-lg hover:scale-125 transition-transform p-0.5 rounded ${myReaction?.emoji === emoji ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setReplyingTo(message)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-500 hover:text-blue-500 transition-colors text-xs"
                title="Reply"
              >
                ↩
              </button>
            </div>
          )}

          <div className="flex flex-col">
            <div
              className={`max-w-xs w-fit px-4 py-2 rounded-2xl text-sm break-words ${
                isMine
                  ? `${message.pending ? 'bg-blue-300' : 'bg-blue-500'} text-white rounded-br-sm`
                  : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-sm shadow-sm'
              } ${isSearchResult ? 'ring-2 ring-yellow-300' : ''}`}
            >
              {message.replyTo && (
                <div className={`mb-2 px-2 py-1 rounded-lg border-l-2 text-xs ${
                  isMine
                    ? 'border-blue-200 bg-blue-400 text-blue-100'
                    : 'border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300'
                }`}>
                  <p className="font-semibold mb-0.5">
                    {message.replyTo.senderId === user?._id ? 'You' : otherUser?.username}
                  </p>
                  <p className="truncate">{message.replyTo.text}</p>
                </div>
              )}

              {isEditing ? (
                <div className="flex flex-col gap-2">
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
                    className="bg-blue-400 text-white placeholder-blue-200 rounded-lg px-2 py-1 text-sm outline-none resize-none w-full min-w-[160px]"
                    rows={2}
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={handleCancelEdit} className="text-xs text-blue-200 hover:text-white transition-colors">Cancel</button>
                    <button onClick={handleConfirmEdit} className="text-xs bg-white text-blue-500 px-2 py-0.5 rounded-full hover:bg-blue-50 transition-colors font-medium">Save</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  {message.edited && (
                    <p className={`text-xs italic mt-0.5 ${isMine ? 'text-blue-200' : 'text-gray-400 dark:text-gray-400'}`}>edited</p>
                  )}
                  {!isSearchResult && (
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <p className={`text-xs ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {isMine && !message.pending && (
                        <span className={`text-xs font-bold ${message.seen ? 'text-blue-200' : 'text-blue-100 opacity-60'}`}>
                          {message.seen ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {hasReactions && (
              <div className={`flex flex-wrap gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                {Object.entries(
                  message.reactions!.reduce((acc: Record<string, number>, r: any) => {
                    acc[r.emoji] = (acc[r.emoji] || 0) + 1
                    return acc
                  }, {})
                ).map(([emoji, count]) => (
                  <button
                    key={emoji}
                    onClick={() => reactToMessage(message._id, emoji)}
                    className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition-colors ${
                      myReaction?.emoji === emoji
                        ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-300'
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span>{emoji}</span>
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
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-300 dark:text-gray-600">👋 Welcome to PingSphere</p>
          <p className="text-gray-400 mt-2 text-sm">Select a conversation to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full">

      {/* Chat Header */}
      <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
        <button
          onClick={() => setSelectedConversation(null)}
          className="md:hidden text-gray-500 hover:text-blue-500 transition-colors text-xl mr-1"
        >
          ←
        </button>
        <div className="w-9 h-9 rounded-full overflow-hidden bg-green-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {otherUser?.profilePic ? (
            <img src={otherUser.profilePic} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            otherUser?.username.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 dark:text-white text-sm">{otherUser?.username}</p>
          {isTyping === selectedConversation._id ? (
            <p className="text-xs flex items-center gap-1 text-blue-400">typing <TypingDots /></p>
          ) : isOnline ? (
            <p className="text-xs text-green-500">Online</p>
          ) : (
            <p className="text-xs text-gray-400">{getLastSeenLabel(otherUser?.lastSeen)}</p>
          )}
          {otherUser?.bio && (
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{otherUser.bio}</p>
          )}
        </div>
        <button
          onClick={() => showSearch ? handleCloseSearch() : setShowSearch(true)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors text-sm flex-shrink-0 ${
            showSearch
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Search messages"
        >
          🔍
        </button>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search messages..."
            className="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300"
          />
          {isSearching && <span className="text-xs text-gray-400">Searching...</span>}
          <button
            onClick={handleCloseSearch}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search results */}
      {showSearch && searchQuery.trim() ? (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50 dark:bg-gray-900">
          {isSearching ? (
            <p className="text-center text-gray-400 text-sm mt-8">Searching...</p>
          ) : searchResults.length === 0 ? (
            <p className="text-center text-gray-400 text-sm mt-8">No messages found for "{searchQuery}"</p>
          ) : (
            <>
              <p className="text-xs text-gray-400 text-center">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found</p>
              {searchResults.map((message, index) => renderMessage(message, index, searchResults, true))}
            </>
          )}
        </div>
      ) : (
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-gray-50 dark:bg-gray-900"
        >
          {isMessagesLoading ? (
            <MessageSkeleton />
          ) : (
            <>
              {hasMoreMessages && (
                <p className="text-center text-gray-400 text-xs py-2">Scroll up for older messages</p>
              )}
              {messages.length === 0 ? (
                <p className="text-center text-gray-400 text-sm mt-8">No messages yet. Say hello!</p>
              ) : (
                messages.map((message, index) => renderMessage(message, index, messages))
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Reply preview bar */}
      {replyingTo && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <div className="flex-1 border-l-2 border-blue-500 pl-3">
            <p className="text-xs font-semibold text-blue-500">
              {replyingTo.senderId === user?._id ? 'You' : otherUser?.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{replyingTo.text}</p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Message Input */}
      <MessageInput onSend={handleSend} conversationId={selectedConversation._id} />

    </div>
  )
}

const MessageInput = ({ onSend, conversationId }: { onSend: (text: string) => void, conversationId: string }) => {
  const { emitTyping, emitStopTyping } = useChatStore()
  const textRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleInput = () => {
    const textarea = textRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 96)}px`
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
    <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-end gap-3">
      <textarea
        ref={textRef}
        placeholder="Type a message..."
        rows={1}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-300 resize-none overflow-y-auto leading-5"
      />
      <button
        onClick={handleSubmit}
        className="w-9 h-9 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
      >
        ➤
      </button>
    </div>
  )
}

export default ChatArea