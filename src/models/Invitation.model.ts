import mongoose, { Schema, Document } from 'mongoose';

export interface ICarouselImage {
    url: string;
    caption?: string;
    displayOrder?: number;
}

export interface IInvitationDocument extends Document {
    adminId: mongoose.Schema.Types.ObjectId;
    shortCode: string;
    recipientName: string;
    recipientEmail: string;
    personalizedMessage?: string;

    settings: {
        enableButtonEvasion: boolean;
        enableAutoAdvance: boolean;
        musicAutoPlay: boolean;
        songUrl?: string;
    };

    carouselImages: ICarouselImage[];

    status: 'draft' | 'sent' | 'opened' | 'accepted' | 'declined';
    emailId?: string;
    emailStatus?: string;

    sentAt?: Date;
    openedAt?: Date;
    acceptedAt?: Date;
    expiresAt: Date;

    createdAt: Date;
    updatedAt: Date;
}

const InvitationSchema: Schema = new Schema({
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shortCode: { type: String, unique: true, required: true },
    recipientName: { type: String, required: true },
    recipientEmail: { type: String, required: true },
    personalizedMessage: { type: String },

    settings: {
        enableButtonEvasion: { type: Boolean, default: true },
        enableAutoAdvance: { type: Boolean, default: true },
        musicAutoPlay: { type: Boolean, default: true },
        songUrl: { type: String }
    },

    carouselImages: [{
        url: { type: String, required: true },
        caption: { type: String },
        displayOrder: { type: Number, default: 0 }
    }],

    status: {
        type: String,
        enum: ['draft', 'sent', 'opened', 'accepted', 'declined'],
        default: 'draft'
    },
    emailId: { type: String },
    emailStatus: { type: String },

    sentAt: { type: Date },
    openedAt: { type: Date },
    acceptedAt: { type: Date },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
}, { timestamps: true });

InvitationSchema.index({ adminId: 1 });
InvitationSchema.index({ status: 1 });
InvitationSchema.index({ shortCode: 1 });

export default mongoose.model<IInvitationDocument>('Invitation', InvitationSchema);
