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
  pending?: boolean
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
  sendMessage: (conversationId: string, text: string) => void
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

  sendMessage: (conversationId, text) => {
    const socket = getSocket()
    if (!socket) {
      toast.error('Not connected. Please refresh.')
      return
    }

    // create a temp message and append it immediately
    const tempId = `temp_${Date.now()}`
    const tempMessage: Message = {
      _id: tempId,
      conversationId,
      senderId: 'me',
      text,
      seen: false,
      createdAt: new Date().toISOString(),
      pending: true,
    }

    set((state) => ({ messages: [...state.messages, tempMessage] }))

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
      set((state) => {
        const isMyMessage = message.senderId !== state.selectedConversation?.participants.find(
          (p) => p._id !== message.senderId
        )?._id

        // replace the latest pending message with the real one (if it's mine)
        let updatedMessages
        if (isMyMessage) {
          const lastPendingIndex = [...state.messages]
            .reverse()
            .findIndex((m) => m.pending)
          if (lastPendingIndex !== -1) {
            const realIndex = state.messages.length - 1 - lastPendingIndex
            updatedMessages = state.messages.map((m, i) =>
              i === realIndex ? { ...message, pending: false } : m
            )
          } else {
            updatedMessages = state.selectedConversation?._id === message.conversationId
              ? [...state.messages, message]
              : state.messages
          }
        } else {
          // it's from the other person, just append
          updatedMessages = state.selectedConversation?._id === message.conversationId
            ? [...state.messages, message]
            : state.messages
        }

        // update lastMessage and re-sort conversations to top
        const updatedConversations = state.conversations
          .map((c) =>
            c._id === message.conversationId
              ? { ...c, lastMessage: message, updatedAt: message.createdAt }
              : c
          )
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

        return {
          messages: updatedMessages,
          conversations: updatedConversations,
        }
      })
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