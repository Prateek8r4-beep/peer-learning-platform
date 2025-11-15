require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { Server } = require('socket.io');

// Import configurations
const { connectPostgres } = require('./config/database');
const { connectMongoDB } = require('./config/mongodb');
const { connectRedis } = require('./config/redis');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const roomRoutes = require('./routes/rooms');
const noteRoutes = require('./routes/notes');
const lectureRoutes = require('./routes/lectures');
const messageRoutes = require('./routes/messages');
const doubtRoutes = require('./routes/doubts');
const paymentRoutes = require('./routes/payments');

// Import socket handlers
const ChatHandler = require('./sockets/chatHandler');
const RoomHandler = require('./sockets/roomHandler');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling
app.use(errorHandler);

// Initialize connections and start server
async function startServer() {
  try {
    // Connect to databases
    const pgPool = await connectPostgres();
    const mongoClient = await connectMongoDB();
    const redisClient = await connectRedis();

    // Make database connections available globally
    app.locals.pgPool = pgPool;
    app.locals.mongoClient = mongoClient;
    app.locals.redisClient = redisClient;

    // Initialize socket handlers
    const chatHandler = new ChatHandler(io, mongoClient, redisClient);
    const roomHandler = new RoomHandler(io, pgPool, redisClient);
    
    chatHandler.initialize();
    roomHandler.initialize();

    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

startServer();

module.exports = { app, server, io };
