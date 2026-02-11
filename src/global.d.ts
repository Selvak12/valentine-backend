declare namespace NodeJS {
    interface ProcessEnv {
        PORT?: string;
        MONGO_URI?: string;
        JWT_SECRET?: string;
        NODE_ENV?: 'development' | 'production';
        CORS_ORIGINS?: string;
        EMAIL_USER?: string;
        EMAIL_PASS?: string;
        GEMINI_API_KEY?: string;
        CLOUDINARY_CLOUD_NAME?: string;
        CLOUDINARY_API_KEY?: string;
        CLOUDINARY_API_SECRET?: string;
        FRONTEND_URL?: string;
    }
}

declare module 'express';
declare module 'cors';
declare module 'dotenv';
declare module 'http';
declare module 'socket.io';
declare module 'jsonwebtoken';
declare module 'bcryptjs';
declare module 'nodemailer';
declare module 'mongoose';
declare module 'multer';
declare module 'multer-storage-cloudinary';
declare module 'joi';
declare module '@google/genai';
declare module 'cloudinary';
