// @ts-nocheck
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { initSocket } = require('./services/socket.service');
const morgan = require('morgan');
const logger = require('./utils/logger').default;
const { securityHeaders } = require('./middleware/security.middleware');

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://192.168.1.36:3000'
].filter(Boolean);

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true
    }
});

// Initialize socket service
initSocket(io);

// Middleware
app.use(securityHeaders);
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/health', (req: any, res: any) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Import Routes
import authRoutes from './routes/auth.routes';
import invitationRoutes from './routes/invitation.routes';
import trackingRoutes from './routes/tracking.routes';
import aiRoutes from './routes/ai.routes';
import analyticsRoutes from './routes/analytics.routes';
import mediaRoutes from './routes/media.routes';

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/track', trackingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/media', mediaRoutes);

// Helper for public link support directly
app.use('/api/invite', trackingRoutes);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
});

export { app, httpServer, io };
