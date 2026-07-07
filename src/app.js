// src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import logger, { logStream } from './utils/logger.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

// Import Routes
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import postRoutes from './modules/post/post.routes.js';
import commentRoutes from './modules/comment/comment.routes.js';
import replyRoutes from './modules/reply/reply.routes.js';
import likeRoutes from './modules/like/like.routes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
console.log(' Serving uploads from:', path.join(__dirname, '../uploads'));


app.use(helmet());

// app.use(cors({
//   origin: env.CLIENT_URL,
//   credentials: true,
//   optionsSuccessStatus: 200,
// }));

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://buddy-front-three.vercel.app',
    'https://buddy-front-git-main-tanvir-haans-projects.vercel.app',
    'https://buddy-front-eqvqwu2n9-tanvir-haans-projects.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ============================================
// Logging Middleware
// ============================================
app.use(morgan('combined', { stream: logStream }));

// ============================================
// Body Parsing Middleware
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ============================================
// API Routes
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/replies', replyRoutes);
app.use('/api/likes', likeRoutes);

// ============================================
// Error Handling Middleware
// ============================================
app.use(notFound);
app.use(errorHandler);

export default app;