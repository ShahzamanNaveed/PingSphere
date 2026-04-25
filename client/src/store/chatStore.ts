import { create } from 'zustand'
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
  isMessagesLoading: boolean
  isConversationsLoading: boolean
  isUsersLoading: boolean
  setSelectedConversation: (conversation: Conversation | null) => void
  getConversations: () => Promise<void>
  getUsers: () => Promise<void>
  createConversation: (recipientId: string) => Promise<void>
  getMessages: (conversationId: string) => Promise<void>
  sendMessage: (conversationId: string, text: string) => Promise<void>
  subscribeToMessages: () => void
  unsubscribeFromMessages: () => void
  setOnlineUsers: (users: string[]) => void
}

const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  messages: [],
  users: [],
  selectedConversation: null,
  onlineUsers: [],
  isMessagesLoading: false,
  isConversationsLoading: false,
  isUsersLoading: false,

  setSelectedConversation: (conversation) => {
    set({ selectedConversation: conversation })
  },

  setOnlineUsers: (users) => {
    set({ onlineUsers: users })
  },

  getUsers: async () => {
    set({ isUsersLoading: true })
    try {
      const res = await axiosInstance.get('/users')
      set({ users: res.data, isUsersLoading: false })
    } catch (error) {
      set({ isUsersLoading: false })
    }
  },

  createConversation: async (recipientId) => {
    try {
      const res = await axiosInstance.post('/conversations', { recipientId })
      const newConversation = res.data

      // add to conversations list if not already there
      set((state) => {
        const exists = state.conversations.find((c) => c._id === newConversation._id)
        if (exists) return { selectedConversation: newConversation }
        return {
          conversations: [newConversation, ...state.conversations],
          selectedConversation: newConversation,
        }
      })
    } catch (error) {
      console.error('createConversation error:', error)
    }
  },

  getConversations: async () => {
    set({ isConversationsLoading: true })
    try {
      const res = await axiosInstance.get('/conversations')
      set({ conversations: res.data, isConversationsLoading: false })
    } catch (error) {
      set({ isConversationsLoading: false })
    }
  },

  getMessages: async (conversationId) => {
    set({ isMessagesLoading: true })
    try {
      const res = await axiosInstance.get(`/messages/${conversationId}`)
      set({ messages: res.data, isMessagesLoading: false })
    } catch (error) {
      set({ isMessagesLoading: false })
    }
  },

  sendMessage: async (conversationId, text) => {
    const socket = getSocket()
    if (!socket) return
    socket.emit('sendMessage', { conversationId, text })
  },

  subscribeToMessages: () => {
    const socket = getSocket()
    if (!socket) return

    socket.on('newMessage', (message: Message) => {
      set((state) => ({ messages: [...state.messages, message] }))
    })

    socket.on('onlineUsers', (users: string[]) => {
      set({ onlineUsers: users })
    })
  },

  unsubscribeFromMessages: () => {
    const socket = getSocket()
    if (!socket) return
    socket.off('newMessage')
    socket.off('onlineUsers')
  },
}))

export default useChatStore