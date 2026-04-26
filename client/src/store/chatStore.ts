import { create } from 'zustand'
import toast from 'react-hot-toast'
import axiosInstance from '../lib/axios'
import { getSocket } from '../lib/socket'

interface User {
  _id: string
  username: string
  profilePic: string
}

interface Message {
  _id: string
  conversationId: string
  senderId: string
  text: string
  seen: boolean
  createdAt: string
}

interface Conversation {
  _id: string
  participants: User[]
  lastMessage: Message | null
  updatedAt: string
}

interface ChatStore {
  conversations: Conversation[]
  messages: Message[]
  users: User[]
  selectedConversation: Conversation | null
  onlineUsers: string[]
  isTyping: string | null
  isMessagesLoading: boolean
  isConversationsLoading: boolean
  isUsersLoading: boolean
  hasMoreMessages: boolean
  setSelectedConversation: (conversation: Conversation | null) => void
  getConversations: () => Promise<void>
  getUsers: () => Promise<void>
  createConversation: (recipientId: string) => Promise<void>
  getMessages: (conversationId: string) => Promise<void>
  loadMoreMessages: (conversationId: string) => Promise<void>
  sendMessage: (conversationId: string, text: string) => Promise<void>
  subscribeToMessages: () => void
  unsubscribeFromMessages: () => void
  setOnlineUsers: (users: string[]) => void
  emitTyping: (conversationId: string) => void
  emitStopTyping: (conversationId: string) => void
}

const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  messages: [],
  users: [],
  selectedConversation: null,
  onlineUsers: [],
  isTyping: null,
  isMessagesLoading: false,
  isConversationsLoading: false,
  isUsersLoading: false,
  hasMoreMessages: false,

  setSelectedConversation: (conversation) => {
    set({ selectedConversation: conversation })
  },

  setOnlineUsers: (users) => {
    set({ onlineUsers: users })
  },

  emitTyping: (conversationId) => {
    const socket = getSocket()
    if (!socket) return
    socket.emit('typing', { conversationId })
  },

  emitStopTyping: (conversationId) => {
    const socket = getSocket()
    if (!socket) return
    socket.emit('stopTyping', { conversationId })
  },

  getUsers: async () => {
    set({ isUsersLoading: true })
    try {
      const res = await axiosInstance.get('/users')
      set({ users: res.data, isUsersLoading: false })
    } catch {
      set({ isUsersLoading: false })
    }
  },

  createConversation: async (recipientId) => {
    try {
      const res = await axiosInstance.post('/conversations', { recipientId })
      const newConversation = res.data
      set((state) => {
        const exists = state.conversations.find((c) => c._id === newConversation._id)
        if (exists) return { selectedConversation: newConversation }
        return {
          conversations: [newConversation, ...state.conversations],
          selectedConversation: newConversation,
        }
      })
    } catch {
      toast.error('Could not start conversation')
    }
  },

  getConversations: async () => {
    set({ isConversationsLoading: true })
    try {
      const res = await axiosInstance.get('/conversations')
      set({ conversations: res.data, isConversationsLoading: false })
    } catch {
      set({ isConversationsLoading: false })
      toast.error('Could not load chats')
    }
  },

  getMessages: async (conversationId) => {
    set({ isMessagesLoading: true })
    try {
      const res = await axiosInstance.get(`/messages/${conversationId}`)
      set({
        messages: res.data,
        isMessagesLoading: false,
        hasMoreMessages: res.data.length === 30,
      })
    } catch {
      set({ isMessagesLoading: false })
      toast.error('Could not load messages')
    }
  },

  loadMoreMessages: async (conversationId) => {
    const { messages, hasMoreMessages } = get()
    if (!hasMoreMessages || messages.length === 0) return
    const oldestMessage = messages[0]
    try {
      const res = await axiosInstance.get(
        `/messages/${conversationId}?before=${oldestMessage._id}`
      )
      if (res.data.length === 0) {
        set({ hasMoreMessages: false })
        return
      }
      set({
        messages: [...res.data, ...messages],
        hasMoreMessages: res.data.length === 30,
      })
    } catch {
      toast.error('Could not load older messages')
    }
  },

  sendMessage: async (conversationId, text) => {
    const socket = getSocket()
    if (!socket) {
      toast.error('Not connected. Please refresh.')
      return
    }
    socket.emit('sendMessage', { conversationId, text })
  },

  subscribeToMessages: () => {
    const socket = getSocket()
    if (!socket) return

    socket.off('newMessage')
    socket.off('onlineUsers')
    socket.off('typing')
    socket.off('stopTyping')

    socket.on('newMessage', (message: Message) => {
      set((state) => ({ messages: [...state.messages, message] }))
    })

    socket.on('onlineUsers', (users: string[]) => {
      set({ onlineUsers: users })
    })

    socket.on('typing', ({ conversationId }: { conversationId: string }) => {
      set({ isTyping: conversationId })
    })

    socket.on('stopTyping', () => {
      set({ isTyping: null })
    })
  },

  unsubscribeFromMessages: () => {
    const socket = getSocket()
    if (!socket) return
    socket.off('newMessage')
    socket.off('onlineUsers')
    socket.off('typing')
    socket.off('stopTyping')
  },
}))

export default useChatStore