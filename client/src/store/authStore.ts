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
  bio: string
  lastSeen: string | null
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
  updateProfile: (username: string, bio: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
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

  updateProfile: async (username, bio) => {
    try {
      const res = await axiosInstance.put('/users/profile', { username, bio })
      set({ user: res.data })
      toast.success('Profile updated!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not update profile')
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const res = await axiosInstance.post('/auth/forgot-password', { email })
      toast.success('Reset email sent')
      return res.data
    } catch (error: any) {
      toast.error(error.response?.data?.message)
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      await axiosInstance.post(`/auth/reset-password/${token}`, {
        password,
      })
      toast.success('Password reset successful')
    } catch (error: any) {
      toast.error(error.response?.data?.message)
    }
  },
}))

export default useAuthStore