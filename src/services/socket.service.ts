// @ts-nocheck
import { Server } from 'socket.io';

let ioInstance: Server | null = null;

export const initSocket = (io: Server) => {
    ioInstance = io;

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('client:join-room', (roomId: string) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};

export const emitInvitationUpdate = (invitation: any) => {
    if (ioInstance) ioInstance.emit('server:invitation-updated', invitation);
};

export const emitStatsUpdate = (stats: any) => {
    if (ioInstance) ioInstance.emit('server:stats-updated', stats);
};
