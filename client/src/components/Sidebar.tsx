import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useChatStore from '../store/chatStore'

const Sidebar = () => {
  const { user, logout } = useAuthStore()
  const {
    conversations,
    getConversations,
    setSelectedConversation,
    selectedConversation,
    users,
    getUsers,
    createConversation,
    isUsersLoading,
    isTyping,
  } = useChatStore()

  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    getConversations()
  }, [])

  const handleOpenModal = () => {
    setShowModal(true)
    getUsers()
  }

  const handleSelectUser = async (userId: string) => {
    await createConversation(userId)
    setShowModal(false)
  }

  const getOtherUser = (conversation: any) => {
    return conversation.participants.find((p: any) => p._id !== user?._id)
  }

  const filtered = conversations.filter((c) => {
    const other = getOtherUser(c)
    return other?.username.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full w-full">

      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity"
            title="View profile"
          >
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-gray-800">{user?.username}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenModal}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-blue-500 transition-colors text-xl"
            title="New conversation"
          >
            +
          </button>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-8">No conversations yet</p>
        ) : (
          filtered.map((conversation) => {
            const other = getOtherUser(conversation)
            const isSelected = selectedConversation?._id === conversation._id

            return (
              <div
                key={conversation._id}
                onClick={() => setSelectedConversation(conversation)}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {other?.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm">{other?.username}</p>
                  <p className="text-xs truncate">
                    {isTyping === conversation._id ? (
                      <span className="text-blue-400 italic">typing...</span>
                    ) : conversation.lastMessage ? (
                      <span className="text-gray-400">{conversation.lastMessage.text}</span>
                    ) : (
                      <span className="text-gray-400">No messages yet</span>
                    )}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* New Conversation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-80 max-h-96 flex flex-col">

            {/* Modal header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">New Conversation</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {/* User list */}
            <div className="flex-1 overflow-y-auto">
              {isUsersLoading ? (
                <p className="text-center text-gray-400 text-sm mt-8">Loading users...</p>
              ) : users.length === 0 ? (
                <p className="text-center text-gray-400 text-sm mt-8">No users found</p>
              ) : (
                users.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => handleSelectUser(u._id)}
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{u.username}</span>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default Sidebar