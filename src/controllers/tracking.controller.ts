import { Request, Response } from 'express';
import Invitation from '../models/Invitation.model';
import Session from '../models/Session.model';
import Activity from '../models/Activity.model';
import { emitInvitationUpdate } from '../services/socket.service';

export const getPublicInvitation = async (req: any, res: any) => {
    try {
        const invitation = await Invitation.findOne({ shortCode: req.params.shortCode })
            .select('recipientName personalizedMessage settings carouselImages status');

        if (!invitation) return res.status(404).json({ success: false, error: 'Invitation not found' });

        res.json({ success: true, data: { invitation } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const trackPageView = async (req: any, res: any) => {
    try {
        const { invitationId, sessionId, page, userAgent, screenSize, referrer } = req.body;

        let session = await Session.findOne({ invitationId, sessionId });

        if (!session) {
            session = new Session({
                invitationId,
                sessionId,
                userAgent,
                screenSize,
                referrer,
                startedAt: new Date()
            });
            await session.save();

            // Mark invitation as opened if it's the first view
            const invitation = await Invitation.findById(invitationId);
            if (invitation && invitation.status === 'sent') {
                invitation.status = 'opened';
                invitation.openedAt = new Date();
                await invitation.save();
                emitInvitationUpdate(invitation);
            }
        }

        const activity = new Activity({
            invitationId,
            sessionId: session._id,
            activityType: 'page_viewed',
            page,
            metadata: { userAgent, screenSize, referrer }
        });
        await activity.save();

        res.json({ success: true, data: { sessionId: session.sessionId } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const trackInteraction = async (req: any, res: any) => {
    try {
        const { invitationId, sessionId, event, data } = req.body;

        const session = await Session.findOne({ invitationId, sessionId });
        if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

        const activity = new Activity({
            invitationId,
            sessionId: session._id,
            activityType: event,
            metadata: data
        });
        await activity.save();

        res.json({ success: true, data: { tracked: true } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const trackAccept = async (req: any, res: any) => {
    try {
        const { invitationId, sessionId, timeSpent, deviceInfo } = req.body;

        const session = await Session.findOne({ invitationId, sessionId });
        if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

        session.endedAt = new Date();
        session.duration = timeSpent;
        await session.save();

        const activity = new Activity({
            invitationId,
            sessionId: session._id,
            activityType: 'proposal_accepted',
            metadata: { timeSpent, deviceInfo }
        });
        await activity.save();

        const invitation = await Invitation.findById(invitationId);
        if (invitation) {
            invitation.status = 'accepted';
            invitation.acceptedAt = new Date();
            await invitation.save();
            emitInvitationUpdate(invitation);
        }

        res.json({
            success: true,
            data: {
                accepted: true,
                nextPage: '/acceptance',
                message: 'Congratulations! ❤️'
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};
