import { create } from 'zustand'
import toast from 'react-hot-toast'
import axiosInstance from '../lib/axios'
import { connectSocket, disconnectSocket } from '../lib/socket'
import useChatStore from './chatStore'

interface User {
  _id: string
  username: string
  email: string
  profilePic: string
}

interface AuthStore {
  user: User | null
  isLoading: boolean
  error: string | null
  checkAuth: () => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateAvatar: (file: File) => Promise<void>
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  checkAuth: async () => {
    set({ isLoading: true })
    try {
      const res = await axiosInstance.get('/auth/me')
      set({ user: res.data, isLoading: false })
      connectSocket()
      useChatStore.getState().subscribeToMessages()
    } catch {
      set({ user: null, isLoading: false })
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true, error: null })
    try {
      const res = await axiosInstance.post('/auth/register', { username, email, password })
      set({ user: res.data, isLoading: false })
      connectSocket()
      useChatStore.getState().subscribeToMessages()
      toast.success('Account created!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Something went wrong'
      set({ error: message, isLoading: false })
      toast.error(message)
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const res = await axiosInstance.post('/auth/login', { email, password })
      set({ user: res.data, isLoading: false })
      connectSocket()
      useChatStore.getState().subscribeToMessages()
      toast.success('Welcome back!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Something went wrong'
      set({ error: message, isLoading: false })
      toast.error(message)
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout')
      disconnectSocket()
      useChatStore.getState().unsubscribeFromMessages()
      set({ user: null, isLoading: false, error: null })
      toast.success('Logged out')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    }
  },

  updateAvatar: async (file) => {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await axiosInstance.post('/users/profile/avatar', formData)
      set({ user: res.data })
      toast.success('Avatar updated!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not upload avatar')
    }
  },
}))

export default useAuthStore