import { create } from 'zustand'
import axiosInstance from '../lib/axios'

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
    } catch {
      set({ user: null, isLoading: false })
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true, error: null })
    try {
      const res = await axiosInstance.post('/auth/register', { username, email, password })
      set({ user: res.data, isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Something went wrong', isLoading: false })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const res = await axiosInstance.post('/auth/login', { email, password })
      set({ user: res.data, isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Something went wrong', isLoading: false })
    }
  },

  logout: async () => {
  try {
    await axiosInstance.post('/auth/logout')
    set({ user: null, isLoading: false, error: null })
  } catch (error: any) {
    set({ error: error.response?.data?.message || 'Something went wrong', isLoading: false })
  }
},
}))

export default useAuthStore