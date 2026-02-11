import mongoose, { Schema, Document } from 'mongoose';
import { IEmailLog } from '../types';

export interface IEmailLogDocument extends IEmailLog, Document { }

const EmailLogSchema: Schema = new Schema({
    invitationId: { type: Schema.Types.ObjectId, ref: 'Invitation', required: true },
    template: { type: String, required: true },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'opened', 'failed'],
        default: 'sent'
    },
    messageId: { type: String },
    opens: [{ type: Date }],
    clicks: [{ type: Date }],
    error: { type: String },
    sentAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IEmailLogDocument>('EmailLog', EmailLogSchema);
