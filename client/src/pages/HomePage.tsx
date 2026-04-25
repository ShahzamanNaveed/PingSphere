import Sidebar from '../components/Sidebar.tsx'
import ChatArea from '../components/ChatArea.tsx'

const HomePage = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <ChatArea />
    </div>
  )
}
 
export default HomePage