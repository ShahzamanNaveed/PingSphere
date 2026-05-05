import Sidebar from '../components/Sidebar'
import ChatArea from '../components/ChatArea'
import useChatStore from '../store/chatStore'

const HomePage = () => {
  const { selectedConversation } = useChatStore()

  return (
    <div className="flex h-[100dvh] bg-gray-50 dark:bg-gray-950 font-sans p-0 md:p-4 lg:p-6 transition-all duration-300 relative overflow-hidden">
      {/* Decorative background blurs for desktop */}
      <div className="hidden md:block absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="hidden md:block absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

      <div className="flex w-full h-full max-w-[1600px] mx-auto bg-white dark:bg-gray-900 md:rounded-3xl md:shadow-2xl md:border border-gray-200/50 dark:border-gray-800/50 overflow-hidden relative z-10">
        <div className={`${selectedConversation ? 'hidden' : 'flex'} md:flex w-full md:w-[320px] lg:w-[380px] flex-shrink-0 border-r border-gray-100 dark:border-gray-800`}>
          <Sidebar />
        </div>
        <div className={`${selectedConversation ? 'flex' : 'hidden'} md:flex flex-1 min-w-0 bg-gray-50/50 dark:bg-gray-950/30`}>
          <ChatArea />
        </div>
      </div>
    </div>
  )
}

export default HomePage