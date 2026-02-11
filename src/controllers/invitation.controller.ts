import { Request, Response } from 'express';
import Invitation from '../models/Invitation.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { emitInvitationUpdate } from '../services/socket.service';
import { sendInvitationEmail } from '../services/email.service';
import crypto from 'crypto';

const generateShortCode = (name: string): string => {
    const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const random = crypto.randomBytes(2).toString('hex');
    return `${sanitized}-${random}`;
};

export const createInvitation = async (req: any, res: any) => {
    try {
        // Support both frontend names (message, images) and backend names (personalizedMessage, carouselImages)
        const {
            recipientName,
            recipientEmail,
            personalizedMessage,
            message,  // Frontend sends "message"
            settings,
            carouselImages,
            images  // Frontend sends "images"
        } = req.body;

        const shortCode = generateShortCode(recipientName);

        const invitation = new Invitation({
            adminId: req.user.id,
            shortCode,
            recipientName,
            recipientEmail,
            personalizedMessage: personalizedMessage || message,  // Accept either field name
            settings: {
                enableButtonEvasion: settings?.enableButtonEvasion ?? true,
                enableAutoAdvance: settings?.enableAutoAdvance ?? true,
                musicAutoPlay: settings?.musicAutoPlay ?? true,
                songUrl: settings?.songUrl
            },
            carouselImages: carouselImages || images || [],  // Accept either field name
            status: 'draft'
        });

        await invitation.save();
        res.status(201).json({ success: true, data: invitation });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getInvitations = async (req: any, res: any) => {
    try {
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', status, search } = req.query;

        const query: any = { adminId: req.user.id };
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { recipientName: { $regex: search, $options: 'i' } },
                { recipientEmail: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const invitations = await Invitation.find(query)
            .sort({ [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Invitation.countDocuments(query);

        res.json({
            success: true,
            data: {
                invitations,
                pagination: {
                    total,
                    page: Number(page),
                    pages: Math.ceil(total / Number(limit)),
                    limit: Number(limit),
                    hasNext: skip + invitations.length < total,
                    hasPrev: skip > 0
                }
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getInvitationById = async (req: any, res: any) => {
    try {
        const invitation = await Invitation.findOne({
            _id: req.params.id,
            adminId: req.user.id
        });

        if (!invitation) return res.status(404).json({ success: false, error: 'Invitation not found' });

        res.json({ success: true, data: invitation });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteInvitation = async (req: any, res: any) => {
    try {
        const invitation = await Invitation.findOneAndDelete({
            _id: req.params.id,
            adminId: req.user.id
        });

        if (!invitation) return res.status(404).json({ success: false, error: 'Invitation not found' });

        res.json({ success: true, message: 'Invitation deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const sendInvitation = async (req: any, res: any) => {
    try {
        const invitation = await Invitation.findOne({
            _id: req.params.id,
            adminId: req.user.id
        });

        if (!invitation) return res.status(404).json({ success: false, error: 'Invitation not found' });

        // Generate shareable link with hash for HashRouter
        const invitationLink = `${process.env.FRONTEND_URL}/#/invite/${invitation.shortCode}`;

        let emailSent = false;
        let emailError = null;

        try {
            // Try to send email to recipient
            await sendInvitationEmail(invitation._id as any as string);
            emailSent = true;
        } catch (error: any) {
            // Email failed, but continue - mark as sent anyway
            emailError = error.message;
            invitation.status = 'sent';
            invitation.sentAt = new Date();
            await invitation.save();
        }

        res.json({
            success: true,
            data: {
                message: emailSent
                    ? 'Invitation sent successfully to recipient email'
                    : 'Invitation created. Email not sent (configure EMAIL_PASS in .env). Share link manually.',
                sentAt: invitation.sentAt,
                invitationLink,
                recipientEmail: invitation.recipientEmail,
                shortCode: invitation.shortCode,
                emailSent,
                ...(emailError && { emailError })
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};
