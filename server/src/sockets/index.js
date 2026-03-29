import { Server } from 'socket.io';
import { supabase } from '../db/supabase.js';

let io;

export const initializeSockets = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join a specific video room
    socket.on('joinVideo', (videoId) => {
      socket.join(`video_${videoId}`);
      console.log(`Socket ${socket.id} joined video ${videoId}`);
    });

    // Handle new comment
    socket.on('new_comment', async (data) => {
      try {
        const { videoId, user, text, time, type } = data;
        
        let { data: users } = await supabase.from('user').select('*').limit(1);
        let dbUser = users?.[0];
        
        if (!dbUser) {
          const { data: newUsers } = await supabase.from('user').insert([{
            email: 'mock@demo.com', name: 'Demo User', passwordHash: 'mocked'
          }]).select();
          dbUser = newUsers[0];
        }
        
        if (type === 'comment' || type === 'marker' || type === 'cut') {
           const { data: comments, error } = await supabase.from('comment').insert([{
             videoid: videoId,
             userid: dbUser.id,
             content: type === 'cut' ? '✂️ Cut marked' : text,
             timestamp: time
           }]).select();
           
           if (error) throw error;
           const comment = comments[0];
           
           io.to(`video_${videoId}`).emit('receive_comment', {
             id: comment.id,
             user: user || dbUser.name,
             text: type === 'cut' ? '✂️ Cut marked' : text,
             time,
             type
           });
        }
      } catch (error) {
        console.error('Socket error saving comment:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized');
  }
  return io;
};
