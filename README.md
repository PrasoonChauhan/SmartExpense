# 💸 Smart Expense

An AI-powered expense tracker that intelligently parses your spending using Google Gemini, with Google OAuth authentication and a beautiful dark-mode dashboard.

![Smart Expense](./client/public/vite.svg)

## ✨ Features

- 🤖 **AI-Powered Parsing** — Describe expenses in plain text or voice; Gemini AI extracts product, amount, category & date
- 🎙️ **Voice Input** — Speak your expenses using the Web Speech API
- 🔐 **Google OAuth 2.0** — Secure sign-in with your Google account
- 📊 **Analytics Dashboard** — Interactive charts with spending breakdowns by category
- 🗂️ **Custom Categories** — Full CRUD with support for custom expense categories
- 🌙 **Dark Mode UI** — Sleek, modern interface built with React
- 📅 **IST Timezone Support** — Dates displayed in Indian Standard Time

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Recharts, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | Google OAuth 2.0 (Passport.js), JWT |
| AI | Google Gemini API (`@google/generative-ai`) |
| Styling | Vanilla CSS |

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Google Cloud Console project (OAuth + Gemini API)

### 1. Clone the repository

```bash
git clone https://github.com/PrasoonChauhan/SmartExpense.git
cd SmartExpense
```

### 2. Setup the Server

```bash
cd server
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

### 3. Setup the Client

```bash
cd client
npm install
npm run dev
```

The app will be running at:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000

## ⚙️ Environment Variables

Copy `server/.env.example` to `server/.env` and fill in:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL |
| `GEMINI_API_KEY` | Google Gemini API key |
| `SESSION_SECRET` | Express session secret |
| `CLIENT_URL` | Frontend URL (for CORS) |

## 📁 Project Structure

```
SmartExpense/
├── client/               # React frontend (Vite)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-level pages
│   │   └── ...
│   └── package.json
├── server/               # Express backend
│   ├── controllers/      # Route controllers
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/        # Auth & other middleware
│   ├── config/           # Passport & DB config
│   ├── .env.example      # Environment template
│   └── index.js          # Server entry point
└── README.md
```

## 📄 License

MIT License — feel free to use and modify.
