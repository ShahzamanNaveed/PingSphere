# PingSphere 🟣

A full-stack real-time chat application built with the MERN stack and Socket.io. Clean, minimal, and fast — built as a learning project with a focus on real-world features and production-ready architecture.

**Live Demo:** [pingsphere.vercel.app](https://pingsphere.vercel.app) &nbsp;|&nbsp; 

---

## Screenshots

> Landing page
> <img width="927" height="407" alt="image" src="https://github.com/user-attachments/assets/82230302-a134-4fdf-bee4-af16cb596cea" />

>  · Chat UI
> <img width="932" height="389" alt="image" src="https://github.com/user-attachments/assets/3b027742-a1d8-4a9e-89a9-be7058098735" />
---

## Features

### Core Chat
- ⚡ Real-time messaging via Socket.io
- ✓✓ Message read receipts (single tick = sent, double tick = seen)
- 🔢 Unread message count badges
- ↩ Reply to messages with quoted preview
- ✏️ Edit sent messages (inline, with "edited" label)
- ✕ Unsend messages
- 😊 Message reactions (6 emojis, toggle support)
- 🔍 Search messages within a conversation
- 📄 Infinite scroll with cursor-based pagination (loads 30 at a time)
- 🟢 Online/offline presence indicators
- ⌨️ Typing indicators with animated dots
- 🕐 Last seen timestamps

### Pages & UI
- 🏠 Landing page with animated background and live chat preview
- ⚙️ Settings page (Account · Security · Appearance · Danger Zone)
- 👤 Public profile pages with online status, bio, member since
- 🌙 Dark / Light mode toggle (saved to localStorage)
- 📱 Mobile responsive — single panel collapse with back navigation
- 💀 Skeleton loaders for messages and conversations
- 📅 Date dividers (Today, Yesterday, or date)

### Auth & Security
- 🔐 JWT authentication stored in HttpOnly cookies
- 🛡️ Helmet, rate limiting, NoSQL injection + XSS protection
- 🔒 Password hashing with bcryptjs
- 🚪 Session persistence across page refreshes

### Profile
- 🖼️ Avatar upload via Cloudinary
- ✍️ Username and bio editing
- 🔑 Change password with current password verification

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS v4 |
| State | Zustand |
| Routing | React Router v6 |
| HTTP | Axios |
| Real-time | Socket.io client |
| Backend | Node.js, Express.js v5 |
| Database | MongoDB + Mongoose |
| Auth | JWT, bcryptjs, express-validator |
| Security | helmet, sanitize-html, express-rate-limit |
| File Upload | Cloudinary, multer |
| Notifications | react-hot-toast |
| Deploy | Vercel (frontend), Railway (backend), MongoDB Atlas |

---

## Project Structure

```
pingsphere/
├── client/                   # React frontend (Vite)
│   └── src/
│       ├── components/       # Sidebar, ChatArea, TypingDots
│       ├── pages/            # Landing, Login, Register, Home, Profile, Settings
│       ├── store/            # Zustand stores (auth, chat, theme)
│       └── lib/              # Axios instance, Socket singleton
├── server/                   # Express backend
│   ├── config/               # DB connection, Cloudinary config
│   ├── controllers/          # Auth, User, Conversation, Message
│   ├── middleware/           # protectRoute, sanitizeObject
│   ├── models/               # User, Conversation, Message
│   ├── routes/               # Auth, User, Conversation, Message routes
│   └── socket/               # Socket.io server with presence map
└── package.json              # Root with concurrently scripts
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas account
- Cloudinary account (for avatar uploads)

### 1. Clone the repo
```bash
git clone https://github.com/ShahzamanNaveed/PingSphere.git
cd PingSphere
```

### 2. Install dependencies
```bash
npm install            # root
npm install --prefix server
npm install --prefix client
```

### 3. Set up environment variables

Create `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/pingsphere
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

### 4. Run the app
```bash
npm run dev
```

This starts both the backend (port 5000) and frontend (port 5173) concurrently.

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Routes

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current session |

### Users
| Method | Route | Description |
|---|---|---|
| GET | `/api/users` | Get all users (except self) |
| GET | `/api/users/:userId` | Get public profile |
| PUT | `/api/users/profile` | Update username + bio |
| PUT | `/api/users/password` | Change password |
| POST | `/api/users/profile/avatar` | Upload avatar |

### Conversations
| Method | Route | Description |
|---|---|---|
| GET | `/api/conversations` | Get all conversations |
| POST | `/api/conversations` | Create or find conversation |

### Messages
| Method | Route | Description |
|---|---|---|
| GET | `/api/messages/:conversationId` | Get messages (paginated) |
| PUT | `/api/messages/:conversationId/seen` | Mark messages as seen |
| PUT | `/api/messages/:messageId` | Edit message |
| DELETE | `/api/messages/:messageId` | Unsend message |
| POST | `/api/messages/:messageId/react` | React to message |
| GET | `/api/messages/:conversationId/search` | Search messages |

---

## Socket Events

| Event | Direction | Description |
|---|---|---|
| `sendMessage` | Client → Server | Send a new message |
| `newMessage` | Server → Client | Receive a message |
| `typing` | Client → Server | User started typing |
| `stopTyping` | Client → Server | User stopped typing |
| `onlineUsers` | Server → Client | Updated online users list |
| `messagesSeen` | Server → Client | Messages marked as seen |
| `messageUnsent` | Server → Client | Message was deleted |
| `messageEdited` | Server → Client | Message was edited |
| `messageReaction` | Server → Client | Reaction added/removed |

---

## Deployment

### Backend → Railway
1. Connect your GitHub repo to Railway
2. Set root directory to `/` with build command `npm install --prefix server`
3. Start command: `node server/server.js`
4. Add all `server/.env` variables in Railway dashboard
5. Do **not** set `PORT` — Railway assigns it automatically

### Frontend → Vercel
1. Connect your GitHub repo to Vercel
2. Set root directory to `client/`
3. Build command: `npm run build`
4. Add `VITE_API_URL` pointing to your Railway backend URL

### Database → MongoDB Atlas
1. Create a free M0 cluster
2. Create a database user with read/write access
3. Add `0.0.0.0/0` to IP Access List (required for Railway dynamic IPs)
4. Copy the connection string to `MONGO_URI` in Railway env vars

---

## What I Learned

- Setting up a production MERN monorepo from scratch
- JWT authentication with HttpOnly cookies (more secure than localStorage)
- Real-time bidirectional communication with Socket.io presence maps
- Cursor-based pagination for chat history
- Optimistic UI updates for better perceived performance
- Cloudinary file upload via streams (no disk writes with multer memoryStorage)
- Deploying a split frontend/backend app across Vercel + Railway + Atlas
- Express v5 breaking changes and workarounds

---

## Author

Built by **Shahzaman Naveed** ·

---
