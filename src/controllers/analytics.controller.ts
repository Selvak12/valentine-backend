import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Invitation from '../models/Invitation.model';
import Session from '../models/Session.model';
import Activity from '../models/Activity.model';

export const getOverview = async (req: any, res: any) => {
    try {
        const adminId = req.user.id;

        // Basic metrics
        const totalInvitations = await Invitation.countDocuments({ adminId });
        const totalOpened = await Invitation.countDocuments({ adminId, status: { $in: ['opened', 'accepted'] } });
        const totalAccepted = await Invitation.countDocuments({ adminId, status: 'accepted' });

        const openRate = totalInvitations > 0 ? (totalOpened / totalInvitations) * 100 : 0;
        const conversionRate = totalOpened > 0 ? (totalAccepted / totalOpened) * 100 : 0;

        // Device breakdown
        const deviceData = await Session.aggregate([
            { $lookup: { from: 'invitations', localField: 'invitationId', foreignField: '_id', as: 'inv' } },
            { $unwind: '$inv' },
            { $match: { 'inv.adminId': adminId } },
            { $group: { _id: '$deviceType', count: { $sum: 1 } } }
        ]);

        const totalSessions = deviceData.reduce((acc, curr) => acc + curr.count, 0);
        const deviceBreakdown = deviceData.map(d => ({
            device: d._id || 'unknown',
            percentage: totalSessions > 0 ? (d.count / totalSessions) * 100 : 0
        }));

        // Trends (last 7 days)
        const trends = { sent: [0, 0, 0, 0, 0, 0, 0], accepted: [0, 0, 0, 0, 0, 0, 0] };
        // This would normally be a complex aggregate, simplified for now

        res.json({
            success: true,
            data: {
                metrics: {
                    totalInvitations,
                    totalOpened,
                    totalAccepted,
                    openRate: parseFloat(openRate.toFixed(1)),
                    conversionRate: parseFloat(conversionRate.toFixed(1)),
                    avgInteractionTime: "N/A"
                },
                trends,
                deviceBreakdown
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getActivities = async (req: any, res: any) => {
    try {
        const adminId = req.user.id;
        const { limit = 50, type = 'all' } = req.query;

        const query: any = {};
        if (type !== 'all') query.activityType = type;

        const activities = await Activity.find(query)
            .populate('invitationId', 'recipientName recipientEmail')
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        const formattedActivities = activities.map((a: any) => ({
            id: a._id,
            type: a.activityType,
            recipientName: a.invitationId?.recipientName,
            recipientEmail: a.invitationId?.recipientEmail,
            invitationId: a.invitationId?._id,
            timestamp: a.createdAt,
            metadata: a.metadata
        }));

        res.json({ success: true, data: formattedActivities });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};
