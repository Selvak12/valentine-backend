import mongoose, { Schema, Document } from 'mongoose';

export interface ISessionDocument extends Document {
    invitationId: mongoose.Schema.Types.ObjectId;
    sessionId: string;
    deviceType?: string;
    deviceModel?: string;
    browser?: string;
    os?: string;
    screenSize?: string;
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;

    startedAt: Date;
    endedAt?: Date;
    duration?: number; // in seconds
}

const SessionSchema: Schema = new Schema({
    invitationId: { type: Schema.Types.ObjectId, ref: 'Invitation', required: true },
    sessionId: { type: String, required: true },
    deviceType: { type: String },
    deviceModel: { type: String },
    browser: { type: String },
    os: { type: String },
    screenSize: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    referrer: { type: String },

    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    duration: { type: Number }
}, { timestamps: true });

SessionSchema.index({ invitationId: 1, sessionId: 1 }, { unique: true });

export default mongoose.model<ISessionDocument>('Session', SessionSchema);
