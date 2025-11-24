# FinBot 💰🤖

An AI-powered personal finance assistant built with the MERN stack that helps users manage, analyze, and understand their financial data through intelligent insights and natural language interactions.

## 🌟 Features

### User Management
- Secure user registration and login with JWT authentication
- Profile management
- Encrypted storage of financial data

### Transaction Management
- Add, edit, and delete income and expense entries
- Smart transaction categorization (Food, Rent, Groceries, Travel, Investments, etc.)
- Comprehensive transaction history
- Monthly and weekly breakdowns

### Budget Tracking
- Set monthly budgets for each spending category
- Real-time budget progress tracking (used vs. remaining)
- Automated alerts when spending exceeds limits

### Dashboard & Analytics
- Visual representation of income vs. expenses
- Category-wise expense breakdown with pie charts
- Month-over-month spending trends with line charts
- Savings tracker and progress monitoring
- Basic spending predictions

### AI-Powered Financial Insights
Powered by OpenRouter.ai, FinBot provides:
- **Spending Pattern Analysis**: Understand why your spending increased or decreased
- **Savings Strategies**: Get personalized recommendations to reduce expenses
- **Auto-Categorization**: Automatically assign categories based on transaction descriptions
- **Monthly Summaries**: Natural-language financial summaries
- **Financial Education**: Ask questions like "What is SIP?" or "How does compound interest work?"
- **Personalized Recommendations**: Expense control tips, budget suggestions, and cashflow insights

### Security
- JWT-based authentication
- Rate limiting for API requests
- Encrypted sensitive financial data
- Protected API routes

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- Axios
- Context API for state management
- Tailwind for styling

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

**AI Integration:**
- OpenRouter.ai API

## 📁 Project Structure

```
finbot/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── openrouter.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── chatController.js
│   │   │   └── transactionController.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Transaction.js
│   │   │   └── Chat.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   └── transactionRoutes.js
│   │   ├── utils/
│   │   │   ├── financialAnalysis.js
│   │   │   └── prompts.js
│   │   └── server.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   │   └── axiosClient.js
    │   ├── components/
    │   │   ├── ChatBubble.jsx
    │   │   ├── Navbar.jsx
    │   │   └── TransactionCard.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── Chat.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── styles/
    │   │   └── global.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── .env
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- OpenRouter.ai API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/finbot.git
cd finbot
```

2. **Backend Setup**
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
OPENROUTER_API_KEY=your_openrouter_api_key
NODE_ENV=development
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Run the Application**

Start the backend server:
```bash
cd backend
npm run dev
```

Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application should now be running at `http://localhost:5173` (frontend) and `http://localhost:5000` (backend).

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  passwordHash: String,
  createdAt: Date
}
```

### Transactions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: "income" | "expense",
  amount: Number,
  category: String,
  description: String,
  date: Date
}
```

### Budgets Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  category: String,
  limit: Number,
  month: Number,
  year: Number
}
```

### Chats Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  messages: Array,
  createdAt: Date
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Transactions
- `POST /api/transactions/add` - Add new transaction
- `GET /api/transactions/list` - Get all transactions
- `PUT /api/transactions/update/:id` - Update transaction
- `DELETE /api/transactions/delete/:id` - Delete transaction

### Budgets
- `POST /api/budgets/set` - Set budget for category
- `GET /api/budgets/current` - Get current budgets

### Analytics
- `GET /api/analytics/summary` - Get financial summary
- `GET /api/analytics/patterns` - Get spending patterns

### AI Chat
- `POST /api/chat/send` - Send message to FinBot
- `GET /api/chat/history` - Get chat history

## 🤖 AI Capabilities

FinBot uses OpenRouter.ai to provide intelligent financial assistance. Example interactions:

- "Explain why my spending increased this month compared to last month."
- "Suggest ways to reduce expenses based on my last three months' data."
- "What is SIP and how can it help me save?"
- "Is my spending healthy given my income?"
- "Generate a summary of my finances this month."

## 🎨 UI Components

- **Dashboard**: Visual analytics with charts and graphs
- **Chat Interface**: Natural language interaction with FinBot
- **Transaction List**: Organized view of all financial transactions
- **Budget Tracker**: Visual representation of budget usage
- **Profile Management**: User settings and preferences

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes with middleware
- Rate limiting to prevent abuse
- Input validation and sanitization

## 👨‍💻 Author

Your Name - [Your GitHub Profile](https://github.com/ChaitanyaEmani)

## 🙏 Acknowledgments

- OpenRouter.ai for AI capabilities
- MongoDB for database solutions
- The MERN stack community

**Disclaimer**: FinBot provides financial insights and information for educational purposes only. It does not provide legal, investment, or professional financial advice. Always consult with qualified professionals for important financial decisions.
