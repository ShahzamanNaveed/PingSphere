import Sidebar from '../components/Sidebar'
import ChatArea from '../components/ChatArea'
import useChatStore from '../store/chatStore'

const HomePage = () => {
  const { selectedConversation } = useChatStore()

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className={`${selectedConversation ? 'hidden' : 'flex'} md:flex w-full md:w-80`}>
        <Sidebar />
      </div>
      <div className={`${selectedConversation ? 'flex' : 'hidden'} md:flex flex-1`}>
        <ChatArea />
      </div>
    </div>
  )
}

export default HomePage