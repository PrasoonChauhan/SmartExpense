const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const dotenv = require('dotenv');

dotenv.config();

// Passport config
require('./config/passport');

const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expense');
const aiRoutes = require('./routes/ai');

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── CORS ───────────────────────────────────────────────────────────────────────
const clientUrl = (process.env.CLIENT_URL || '').replace(/\/$/, '');
const allowedOrigins = [
  'http://localhost:5173',
  clientUrl,
  'https://prasoonsmartexpense.vercel.app',
].filter(Boolean).map(origin => origin.replace(/\/$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      
      console.warn(`CORS blocked for origin: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(null, false);
    },
    credentials: true,
  })
);

// ── Health Check (always available — before session/passport) ──────────────────
let dbConnected = false;
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Smart Expense API is running 🚀',
    db: dbConnected ? 'connected' : 'connecting',
  });
});

// ── Session ────────────────────────────────────────────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'session_secret_fallback',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  })
);

// ── Passport ───────────────────────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// ── Server Start ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Required for Render — must bind to all interfaces

// Start HTTP server immediately so Render health checks pass right away
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server listening on ${HOST}:${PORT}`);
});

// ── MongoDB Connection with Retry ──────────────────────────────────────────────
const connectDB = async (retries = 5, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      dbConnected = true;
      console.log('✅ MongoDB connected');
      return;
    } catch (err) {
      console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt < retries) {
        console.log(`⏳ Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * 2, 30000); // Exponential backoff, max 30s
      } else {
        console.error('❌ All MongoDB connection attempts failed. Server will continue running without DB.');
      }
    }
  }
};

connectDB();
