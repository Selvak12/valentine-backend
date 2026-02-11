import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { generateValentineMessage } from '../services/ai.service';

export const generateMessage = async (req: any, res: any) => {
    try {
        const { recipientName, relationship, tone, length } = req.body;
        const message = await generateValentineMessage(
            req.user.id,
            recipientName,
            relationship,
            tone,
            length
        );
        res.json({ success: true, data: { message, generatedAt: new Date() } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};
