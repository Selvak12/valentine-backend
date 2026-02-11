import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshTokenDocument extends Document {
    adminId: mongoose.Schema.Types.ObjectId;
    token: string;
    expiresAt: Date;
    isRevoked: boolean;
    createdAt: Date;
}

const RefreshTokenSchema: Schema = new Schema({
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    isRevoked: { type: Boolean, default: false }
}, { timestamps: true });

RefreshTokenSchema.index({ adminId: 1 });
RefreshTokenSchema.index({ token: 1 });

export default mongoose.model<IRefreshTokenDocument>('RefreshToken', RefreshTokenSchema);
