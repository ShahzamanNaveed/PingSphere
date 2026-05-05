import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const LandingPage = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  // Animated dot-grid canvas background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)

    const resize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)

    const dots: { x: number; y: number; o: number; speed: number }[] = []
    const spacing = 40
    for (let x = 0; x < w; x += spacing) {
      for (let y = 0; y < h; y += spacing) {
        dots.push({ x, y, o: Math.random(), speed: 0.002 + Math.random() * 0.003 })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      dots.forEach(d => {
        d.o += d.speed
        if (d.o > 1) { d.o = 0; d.speed = 0.002 + Math.random() * 0.003 }
        ctx.fillStyle = `rgba(99,102,241,${d.o * 0.15})` // Indigo dots
        ctx.fillRect(d.x - 1.5, d.y - 1.5, 3, 3)
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const features = [
    {
      icon: '⚡',
      title: 'Real-time messaging',
      desc: 'Messages delivered instantly via Socket.io. No refresh, no delay — just conversation.',
    },
    {
      icon: '👁',
      title: 'Read receipts',
      desc: 'Know exactly when your message was seen. Single tick, double tick, blue tick.',
    },
    {
      icon: '🔒',
      title: 'Secure by default',
      desc: 'JWT auth in HttpOnly cookies. Helmet, rate limiting, and NoSQL injection protection baked in.',
    },
    {
      icon: '🟢',
      title: 'Presence system',
      desc: 'See who\'s online in real time. Typing indicators, last seen, live status dots.',
    },
  ]

  const mockMessages = [
    { me: false, text: 'yo did you push the fix?', time: '11:42 AM' },
    { me: true, text: 'just did, check the PR', time: '11:43 AM' },
    { me: false, text: 'lgtm 🔥 merging now', time: '11:43 AM' },
    { me: true, text: 'finally haha', time: '11:44 AM' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white font-sans relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-100">

      {/* Animated bg canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-50 dark:opacity-100" />

      {/* Subtle radial glow */}
      <div className="fixed top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-indigo-500/10 blur-[150px] transform-gpu pointer-events-none z-0" />
      <div className="fixed bottom-[-200px] right-[-100px] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[150px] transform-gpu pointer-events-none z-0" />

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 glass border-b-0 border-white/20 dark:border-gray-800/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white font-bold text-lg leading-none mt-[-2px]">P</span>
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">PingSphere</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 font-semibold"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="pt-28">
        {/* ── HERO ── */}
        <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-20">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-xs px-4 py-1.5 rounded-full mb-8 font-medium shadow-sm backdrop-blur-sm transform-gpu transition-transform hover:scale-105 cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Open Source Real-time Chat
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6 max-w-4xl text-gray-900 dark:text-white">
            Connect instantly, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              without the noise.
            </span>
          </h1>

          <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-light">
            A premium, real-time messaging platform built for modern teams and communities. Fast, secure, and delightfully interactive.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 text-base flex items-center justify-center gap-2"
            >
              Start Chatting For Free
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto glass-card hover:bg-white dark:hover:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-medium transition-all hover:-translate-y-1 text-base"
            >
              Log into your account
            </Link>
          </div>

          {/* ── MOCK CHAT UI ── */}
          <div className="mt-20 w-full max-w-2xl mx-auto relative group perspective-1000">
            {/* Decorative background glow for the mockup */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-purple-500/20 blur-3xl transform-gpu rounded-3xl -z-10 transition-opacity duration-500 group-hover:opacity-100 opacity-70"></div>
            
            <div className="glass-card rounded-2xl overflow-hidden shadow-2xl shadow-gray-200/50 dark:shadow-black/50 border border-white/40 dark:border-white/10 transition-transform duration-500 hover:scale-[1.02]">

              {/* Window Controls */}
              <div className="px-4 py-3 bg-gray-100/50 dark:bg-gray-900/50 border-b border-gray-200/50 dark:border-white/5 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="mx-auto text-xs font-medium text-gray-500 dark:text-gray-400">Alex - PingSphere</div>
              </div>

              {/* Chat header */}
              <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md transform-gpu">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-md">A</div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Alex Developer</p>
                  <p className="text-xs text-emerald-500 dark:text-emerald-400 font-medium">Online</p>
                </div>
                <div className="flex gap-3 text-gray-400">
                  <button className="hover:text-indigo-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </button>
                  <button className="hover:text-indigo-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="px-5 py-6 flex flex-col gap-4 bg-gray-50/50 dark:bg-gray-950/30">
                {mockMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.me ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                        m.me
                          ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-sm'
                      }`}
                    >
                      <p className="leading-relaxed">{m.text}</p>
                      <div className={`flex items-center gap-1 mt-1 justify-end ${m.me ? 'text-indigo-200' : 'text-gray-400'} text-[10px] font-medium`}>
                        <span>{m.time}</span>
                        {m.me && (
                          <svg className="w-3 h-3 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center shadow-sm w-fit">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"
                        style={{ animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Input bar */}
              <div className="px-5 py-4 border-t border-gray-200/50 dark:border-white/5 bg-white/80 dark:bg-gray-900/80 backdrop-blur transform-gpu flex items-center gap-3">
                <button className="text-gray-400 hover:text-indigo-500 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                </button>
                <div className="flex-1 bg-gray-100 dark:bg-gray-800/50 border border-transparent dark:border-gray-700 rounded-full px-4 py-2.5 text-gray-500 text-sm flex items-center">
                  <span className="opacity-70">Type your message...</span>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-full transition-transform hover:scale-110 shadow-md shadow-indigo-500/30">
                  <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="relative z-10 px-6 md:px-12 py-24 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase mb-3">Core Features</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              Everything you need. <span className="text-gray-400 dark:text-gray-500 font-normal">Nothing you don't.</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 border border-gray-100 dark:border-gray-800"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <h4 className="text-gray-900 dark:text-white font-bold mb-3 text-lg">{f.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="relative z-10 px-6 py-24 text-center">
          <div className="max-w-4xl mx-auto glass-card rounded-3xl px-8 py-16 bg-gradient-to-br from-indigo-900/5 to-purple-900/5 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-500/20 relative overflow-hidden">
            {/* Background elements for CTA */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl transform-gpu pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl transform-gpu pointer-events-none"></div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 relative z-10">Start your conversation today.</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 max-w-lg mx-auto relative z-10">Join thousands of users enjoying a faster, more secure way to communicate.</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1 relative z-10"
            >
              Create Free Account
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-gray-200 dark:border-white/5 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm transform-gpu px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs leading-none">P</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">PingSphere</span>
          </div>
          <p className="text-gray-500 text-sm">
            Built with modern web technologies. © {new Date().getFullYear()}
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-indigo-500 transition-colors">Twitter</a>
            <a href="#" className="text-gray-400 hover:text-indigo-500 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}

export default LandingPage