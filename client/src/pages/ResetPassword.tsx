import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const ResetPassword = () => {
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { resetPassword } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (token) {
      await resetPassword(token, password)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 font-sans relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[120px]" />

      <div className="w-full max-w-md p-8 glass-card rounded-3xl shadow-2xl relative z-10 mx-4 border border-white/40 dark:border-white/10">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Reset Password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Enter your new password
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* New Password */}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <input
              type="password"
              className="w-full mt-2 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm text-gray-900 dark:text-white"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full mt-2 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm text-gray-900 dark:text-white"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-500 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-green-500/25"
          >
            Reset Password
          </button>

          <Link
            to="/login"
            className="text-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Back to Login
          </Link>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword