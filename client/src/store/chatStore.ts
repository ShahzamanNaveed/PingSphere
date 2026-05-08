import { create } from 'zustand'
import toast from 'react-hot-toast'
import axiosInstance from '../lib/axios'
import { getSocket } from '../lib/socket'
import useAuthStore from './authStore'
const messageSound = new Audio('/sounds/message.mp3')

interface User {
  _id: string
  username: string
  profilePic: string
  bio?: string
  lastSeen?: string | null
}

interface ReplyTo {
  _id: string
  text: string
  senderId: string
}

interface Reaction {
  _id?: string
  emoji: string
  userId: string
}

interface Message {
  _id: string
  conversationId: string
  senderId: string
  text: string
  seen: boolean
  edited?: boolean
  createdAt: string
  pending?: boolean
  replyTo?: ReplyTo | null
  reactions?: Reaction[]
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
  unreadCounts: Record<string, number>
  replyingTo: Message | null
  searchResults: Message[]
  isSearching: boolean
  isLoadingMore: boolean
  mutedChats: string[]
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
  markSeen: (conversationId: string) => Promise<void>
  unsendMessage: (messageId: string) => Promise<void>
  editMessage: (messageId: string, text: string) => Promise<void>
  setReplyingTo: (message: Message | null) => void
  reactToMessage: (messageId: string, emoji: string) => Promise<void>
  searchMessages: (conversationId: string, query: string) => Promise<void>
  clearSearch: () => void
  clearChat: (conversationId: string) => Promise<void>
  toggleMute: (conversationId: string) => void
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
  unreadCounts: {},
  replyingTo: null,
  searchResults: [],
  isSearching: false,
  isLoadingMore: false,
  mutedChats: [],

  setSelectedConversation: (conversation) => {
    set({ selectedConversation: conversation, replyingTo: null, searchResults: [], isSearching: false })
  },

  setReplyingTo: (message) => {
    set({ replyingTo: message })
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
    const { messages, hasMoreMessages, isLoadingMore } = get()
    if (!hasMoreMessages || messages.length === 0 || isLoadingMore) return
    set({ isLoadingMore: true })
    const oldestMessage = messages[0]
    try {
      const res = await axiosInstance.get(
        `/messages/${conversationId}?before=${oldestMessage._id}`
      )
      if (res.data.length === 0) {
        set({ hasMoreMessages: false, isLoadingMore: false })
        return
      }
      set({
        messages: [...res.data, ...messages],
        hasMoreMessages: res.data.length === 30,
        isLoadingMore: false,
      })
    } catch {
      set({ isLoadingMore: false })
      toast.error('Could not load older messages')
    }
  },

  markSeen: async (conversationId) => {
    try {
      await axiosInstance.put(`/messages/${conversationId}/seen`)
      set((state) => ({
        unreadCounts: { ...state.unreadCounts, [conversationId]: 0 },
      }))
    } catch (error) {
      console.error('markSeen error:', error)
    }
  },

  unsendMessage: async (messageId) => {
    try {
      set((state) => ({
        messages: state.messages.filter((m) => m._id !== messageId),
      }))
      await axiosInstance.delete(`/messages/${messageId}`)
    } catch (error) {
      toast.error('Could not unsend message')
    }
  },

  editMessage: async (messageId, text) => {
    try {
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === messageId ? { ...m, text, edited: true } : m
        ),
      }))
      await axiosInstance.put(`/messages/${messageId}`, { text })
    } catch (error) {
      toast.error('Could not edit message')
    }
  },

  reactToMessage: async (messageId, emoji) => {
    try {
      await axiosInstance.post(`/messages/${messageId}/react`, { emoji })
    } catch (error) {
      toast.error('Could not add reaction')
    }
  },

  searchMessages: async (conversationId, query) => {
    if (!query.trim()) {
      set({ searchResults: [] })
      return
    }
    set({ isSearching: true })
    try {
      const res = await axiosInstance.get(
        `/messages/${conversationId}/search?q=${encodeURIComponent(query.trim())}`
      )
      set({ searchResults: res.data, isSearching: false })
    } catch (error) {
      set({ isSearching: false })
      toast.error('Search failed')
    }
  },

  clearSearch: () => {
    set({ searchResults: [], isSearching: false })
  },

  sendMessage: (conversationId, text) => {
    const socket = getSocket()
    if (!socket) {
      toast.error('Not connected. Please refresh.')
      return
    }

    const currentUser = useAuthStore.getState().user
    const { replyingTo } = get()
    const tempId = `temp_${Date.now()}`
    const tempMessage: Message = {
      _id: tempId,
      conversationId,
      senderId: currentUser?._id || '',
      text,
      seen: false,
      createdAt: new Date().toISOString(),
      pending: true,
      replyTo: replyingTo ? {
        _id: replyingTo._id,
        text: replyingTo.text,
        senderId: replyingTo.senderId,
      } : null,
    }

    set((state) => ({ messages: [...state.messages, tempMessage], replyingTo: null }))
    socket.emit('sendMessage', { conversationId, text, replyTo: replyingTo?._id || null })
  },

  subscribeToMessages: () => {
    const socket = getSocket()
    if (!socket) return

    socket.off('newMessage')
    socket.off('onlineUsers')
    socket.off('typing')
    socket.off('stopTyping')
    socket.off('messagesSeen')
    socket.off('messageUnsent')
    socket.off('messageEdited')
    socket.off('messageReaction')

    socket.on('newMessage', (message: Message) => {
      set((state) => {
        const currentUser = useAuthStore.getState().user
        const isMyMessage = message.senderId === currentUser?._id
        let unreadCounts = { ...state.unreadCounts }

        let updatedMessages
        if (isMyMessage) {
          const withoutPending = state.messages.filter((m) => !m.pending)
          updatedMessages = [...withoutPending, { ...message, pending: false }]
        } else {
          updatedMessages = state.selectedConversation?._id === message.conversationId
            ? [...state.messages, message]
            : state.messages

            const isMuted =state.mutedChats.includes(message.conversationId)
            if (state.selectedConversation?._id !== message.conversationId)
              {
                unreadCounts = 
                {
                  ...state.unreadCounts,
                  [message.conversationId]:
                    (state.unreadCounts[message.conversationId] || 0) + 1,
                }
                if (!isMuted) 
                  {
                  messageSound.currentTime = 0
                  messageSound.play().catch(() => {})
                  }
              } else {
              get().markSeen(message.conversationId)
            }
        }

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
          unreadCounts,
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

    socket.on('messagesSeen', ({ conversationId }: { conversationId: string }) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m.conversationId === conversationId ? { ...m, seen: true } : m
        ),
      }))
    })

    socket.on('messageUnsent', ({ messageId }: { messageId: string }) => {
      set((state) => ({
        messages: state.messages.filter((m) => m._id !== messageId),
      }))
    })

    socket.on('messageEdited', ({ messageId, text }: { messageId: string, text: string }) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === messageId ? { ...m, text, edited: true } : m
        ),
      }))
    })

    socket.on('messageReaction', ({ messageId, reactions }: { messageId: string, reactions: Reaction[] }) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === messageId ? { ...m, reactions } : m
        ),
      }))
    })
  },

  unsubscribeFromMessages: () => {
    const socket = getSocket()
    if (!socket) return
    socket.off('newMessage')
    socket.off('onlineUsers')
    socket.off('typing')
    socket.off('stopTyping')
    socket.off('messagesSeen')
    socket.off('messageUnsent')
    socket.off('messageEdited')
    socket.off('messageReaction')
  },

  clearChat: async (conversationId: string) => {
    try {

      await axiosInstance.delete(`/messages/${conversationId}`)

      set({
        messages: []
      })

      toast.success('Chat cleared')

    } catch {

      toast.error('Could not clear chat')

    }
  },

  toggleMute: (conversationId) => {
    set((state) => {

      const alreadyMuted =
        state.mutedChats.includes(conversationId)

      return {
        mutedChats: alreadyMuted
          ? state.mutedChats.filter(
              id => id !== conversationId
            )
          : [...state.mutedChats, conversationId],
      }
    })
  },
}))

export default useChatStore