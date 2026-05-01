import { useEffect, useRef } from 'react'
import useAuthStore from '../store/authStore'
import useChatStore from '../store/chatStore'
import TypingDots from './TypingDots'

const getDateLabel = (dateStr: string): string => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })
}

const MessageSkeleton = () => (
  <div className="flex flex-col gap-3 animate-pulse">
    <div className="flex justify-start">
      <div className="h-10 w-48 bg-gray-200 rounded-2xl" />
    </div>
    <div className="flex justify-end">
      <div className="h-10 w-36 bg-gray-200 rounded-2xl" />
    </div>
    <div className="flex justify-start">
      <div className="h-10 w-56 bg-gray-200 rounded-2xl" />
    </div>
    <div className="flex justify-end">
      <div className="h-10 w-40 bg-gray-200 rounded-2xl" />
    </div>
    <div className="flex justify-start">
      <div className="h-10 w-32 bg-gray-200 rounded-2xl" />
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
  } = useChatStore()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const getOtherUser = () => {
    return selectedConversation?.participants.find((p: any) => p._id !== user?._id)
  }

  const otherUser = getOtherUser()
  const isOnline = onlineUsers.includes(otherUser?._id || '')

  useEffect(() => {
    if (!selectedConversation) return
    getMessages(selectedConversation._id)
  }, [selectedConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-300">👋 Welcome to PingSphere</p>
          <p className="text-gray-400 mt-2 text-sm">Select a conversation to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full">

      {/* Chat Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
        <button
          onClick={() => setSelectedConversation(null)}
          className="md:hidden text-gray-500 hover:text-blue-500 transition-colors text-xl mr-1"
        >
          ←
        </button>
        <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
          {otherUser?.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{otherUser?.username}</p>
          {isTyping === selectedConversation._id ? (
            <p className="text-xs flex items-center gap-1 text-blue-400">typing <TypingDots /></p>
          ) : (
            <p className={`text-xs ${isOnline ? 'text-green-500' : 'text-gray-400'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-2"
      >
        {isMessagesLoading ? (
          <MessageSkeleton />
        ) : (
          <>
            {hasMoreMessages && (
              <p className="text-center text-gray-400 text-xs py-2">
                Scroll up for older messages
              </p>
            )}
            {messages.length === 0 ? (
              <p className="text-center text-gray-400 text-sm mt-8">No messages yet. Say hello!</p>
            ) : (
              messages.map((message, index) => {
                const isMine = message.senderId === user?._id || message.pending === true
                const showDivider =
                  index === 0 ||
                  getDateLabel(message.createdAt) !== getDateLabel(messages[index - 1].createdAt)

                return (
                  <div key={message._id}>
                    {showDivider && (
                      <div className="flex items-center gap-2 my-2">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400 px-2">{getDateLabel(message.createdAt)}</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    )}
                    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs w-fit px-4 py-2 rounded-2xl text-sm break-words ${
                          isMine
                            ? `${message.pending ? 'bg-blue-300' : 'bg-blue-500'} text-white rounded-br-sm`
                            : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.text}</p>
                        <p className={`text-xs mt-1 ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

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
    <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-end gap-3">
      <textarea
        ref={textRef}
        placeholder="Type a message..."
        rows={1}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="flex-1 px-4 py-2 bg-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-300 resize-none overflow-y-auto leading-5"
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