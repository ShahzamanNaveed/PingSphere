import { useEffect, useRef } from 'react'
import useAuthStore from '../store/authStore'
import useChatStore from '../store/chatStore'

const ChatArea = () => {
  const { user } = useAuthStore()
  const {
    selectedConversation,
    messages,
    getMessages,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
    onlineUsers,
  } = useChatStore()

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const getOtherUser = () => {
    return selectedConversation?.participants.find((p: any) => p._id !== user?._id)
  }

  const otherUser = getOtherUser()
  const isOnline = onlineUsers.includes(otherUser?._id || '')

  useEffect(() => {
    if (!selectedConversation) return
    getMessages(selectedConversation._id)
    subscribeToMessages()
    return () => unsubscribeFromMessages()
  }, [selectedConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (text: string) => {
    if (!selectedConversation) return
    sendMessage(selectedConversation._id, text)
  }

  // No conversation selected
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
    <div className="flex-1 flex flex-col h-full">

      {/* Chat Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
          {otherUser?.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{otherUser?.username}</p>
          <p className={`text-xs ${isOnline ? 'text-green-500' : 'text-gray-400'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-8">No messages yet. Say hello!</p>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId === user?._id

            return (
              <div
                key={message._id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                    isMine
                      ? 'bg-blue-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                  }`}
                >
                  <p>{message.text}</p>
                  <p className={`text-xs mt-1 ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput onSend={handleSend} />

    </div>
  )
}

// Input bar as a small internal component
const MessageInput = ({ onSend }: { onSend: (text: string) => void }) => {
  const textRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    const text = textRef.current?.value.trim()
    if (!text) return
    onSend(text)
    if (textRef.current) textRef.current.value = ''
  }

  return (
    <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center gap-3">
      <input
        ref={textRef}
        type="text"
        placeholder="Type a message..."
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-300"
      />
      <button
        onClick={handleSubmit}
        className="w-9 h-9 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors"
      >
        ➤
      </button>
    </div>
  )
}

export default ChatArea