import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCheck = error.config?.url?.includes('/auth/me')
    if (error.response?.status === 401 && !isAuthCheck) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance