export type InvitationStatus = 'draft' | 'sent' | 'opened' | 'accepted' | 'declined';

export interface IUser {
    name: string;
    email: string;
    password?: string;
    role: 'admin' | 'user';
    isActive: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IInvitation {
    adminId: any;
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
    carouselImages: Array<{
        url: string;
        caption?: string;
        displayOrder?: number;
    }>;
    status: InvitationStatus;
    sentAt?: Date;
    openedAt?: Date;
    acceptedAt?: Date;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IEmailLog {
    invitationId: any;
    template: string;
    status: 'sent' | 'delivered' | 'opened' | 'failed';
    messageId?: string;
    opens: Date[];
    clicks: Date[];
    error?: string;
    sentAt: Date;
}

export interface IAILog {
    userId: any;
    type: 'message' | 'description';
    input: object;
    output: string;
    aiModel: string;
    tokensUsed?: number;
    duration?: number;
    createdAt: Date;
}
