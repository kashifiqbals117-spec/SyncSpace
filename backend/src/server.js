import http from 'http';
import app from './app.js';
import { config } from './config/env.js';
import { initSocket } from './sockets/index.js';
import prisma from './config/prisma.js';

const server = http.createServer(app);

// Initialize Socket.IO with HTTP server
initSocket(server, config.clientOrigin);

const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('PostgreSQL database connected successfully.');

    server.listen(config.port, () => {
      console.log(`SyncSpace Backend listening on port ${config.port}`);
      console.log(`API Base: http://localhost:${config.port}/api/v1`);
      console.log(`CORS Allowed Origin: ${config.clientOrigin}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown handling
const shutdown = async () => {
  console.log('Shutting down server gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Server and database connections closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
