import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityDocument extends Document {
    invitationId: mongoose.Schema.Types.ObjectId;
    sessionId: mongoose.Schema.Types.ObjectId;
    activityType: 'link_opened' | 'page_viewed' | 'button_hover' | 'proposal_accepted';
    page?: string;
    metadata: any;
    createdAt: Date;
}

const ActivitySchema: Schema = new Schema({
    invitationId: { type: Schema.Types.ObjectId, ref: 'Invitation', required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    activityType: {
        type: String,
        enum: ['link_opened', 'page_viewed', 'button_hover', 'proposal_accepted'],
        required: true
    },
    page: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

ActivitySchema.index({ invitationId: 1 });
ActivitySchema.index({ activityType: 1 });

export default mongoose.model<IActivityDocument>('Activity', ActivitySchema);
