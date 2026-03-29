import app from './app.js';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initializeSockets } from './sockets/index.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = createServer(app);

// Initialize Socket.io
initializeSockets(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
