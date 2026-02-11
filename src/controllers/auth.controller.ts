import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import RefreshToken from '../models/RefreshToken.model';

const generateToken = (userId: string, role: string) => {
    const token = jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }  // Token valid for 7 days
    );
    return token;
};

export const register = async (req: any, res: any) => {
    try {
        const { name, email, password, role } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'admin'
        });

        await user.save();

        const token = generateToken(user._id as any as string, user.role);

        res.status(201).json({
            success: true,
            data: {
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
                token
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const login = async (req: any, res: any) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !user.isActive || !user.password) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user._id as any as string, user.role);

        res.json({
            success: true,
            data: {
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
                token
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};


export const logout = async (req: any, res: any) => {
    try {
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};
