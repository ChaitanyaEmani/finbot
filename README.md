# 💬 FinBot - Your Personal Finance Chatbot

FinBot is an AI-powered chatbot that helps users manage and understand their personal finances by answering queries instantly. It leverages OpenRouter's large language models to provide reliable, conversational financial guidance.

---

## 🚀 Features

- 🔐 User Authentication (Signup/Login) with JWT
- 🧠 AI Chatbot for financial queries (via OpenRouter API)
- 💾 Previous chats stored and retrieved from MongoDB
- ♻️ Persistent sessions – resume chats even after logout
- 💬 Dynamic Dashboard: Sidebar for previous chats, center chat UI, and right panel for future features
- 📱 Fully responsive UI using React.js

---

## 🖥️ Tech Stack


###Frontend:
React.js – For building the user interface
React Router – For page routing (Dashboard, Login, Signup)
Axios – To make API calls
CSS – For custom styling

###Backend:
Node.js – Runtime environment
Express.js – Web framework for handling routes and APIs
OpenRouter API – To generate AI-powered responses from the bot
JWT (JSON Web Token) – For secure authentication
Mongoose – For modeling MongoDB data

###Database:
MongoDB – To store users, chat history, and sessions

###Authentication:
JWT Auth (Login & Signup) – Secure user authentication using email and password

###Deployment:
Frontend – Deployed on Vercel
Backend – Deployed on Render

## 🔧 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/finbot.git
cd finbot

###Install Frontend Dependencies

cd frontend
npm install

###Install Backend Dependencies
cd ../backend
npm install

###Create .env in /backend
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_api_key

##Start the Application
Backend
    cd backend
    nodemon server

Frontend

    cd frontend
    npm run dev
Visit: https://finbot-ten.vercel.app/

🧠 How It Works
When a user sends a message, it’s forwarded to OpenRouter's LLMs.

The response is saved in MongoDB tied to that user's session.

Old conversations appear in the sidebar for easy access.
