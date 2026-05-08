import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const { forgotPassword } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await forgotPassword(email)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 font-sans relative overflow-hidden">

      {/* Background blur effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[120px]" />

      <div className="w-full max-w-md p-8 glass-card rounded-3xl shadow-2xl relative z-10 mx-4 border border-white/40 dark:border-white/10">

        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/login"
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            ← Back to login
          </Link>

          <h1 className="text-3xl font-extrabold mt-4 text-gray-900 dark:text-white">
            Forgot Password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Enter your email and we’ll send you a reset link
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div className="group">
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Email Address
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                ✉️
              </div>

              <input
                type="email"
                className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm text-gray-900 dark:text-white"
                placeholder="name@example.com"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/25"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword