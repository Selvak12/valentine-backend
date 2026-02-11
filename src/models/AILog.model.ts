import mongoose, { Schema, Document } from 'mongoose';
import { IAILog } from '../types';

export interface IAILogDocument extends IAILog, Document { }

const AILogSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['message', 'description'], required: true },
    input: { type: Object, required: true },
    output: { type: String, required: true },
    aiModel: { type: String, required: true },
    tokensUsed: { type: Number },
    duration: { type: Number }
}, { timestamps: true });

export default mongoose.model<IAILogDocument>('AILog', AILogSchema);
