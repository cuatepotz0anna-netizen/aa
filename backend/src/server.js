require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');
const { seedRoles } = require('./modules/roles/role.seed');
const { seedPermissions } = require('./modules/permissions/permission.seed');

const PORT = process.env.PORT || 5000;
let server;
let isShuttingDown = false;

const shutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`Received ${signal}; shutting down gracefully.`);

  let shutdownError;
  if (server) {
    try {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    } catch (error) {
      shutdownError = error;
    }
  }

  try {
    await mongoose.disconnect();
  } catch (error) {
    shutdownError = shutdownError || error;
  }

  if (shutdownError) {
    console.error('Graceful shutdown failed:', shutdownError.code || shutdownError.name);
    process.exitCode = 1;
  }
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

const startServer = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is required');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.code || error.name);
    await mongoose.disconnect().catch((disconnectError) => {
      console.error('MongoDB disconnect failed:', disconnectError.code || disconnectError.name);
    });
    process.exit(1);
  }

  try {
    await seedRoles();
    await seedPermissions();
  } catch (error) {
    console.error('Default data initialization failed:', error.code || error.name);
    await mongoose.disconnect().catch((disconnectError) => {
      console.error('MongoDB disconnect failed:', disconnectError.code || disconnectError.name);
    });
    process.exit(1);
  }

  server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on('error', (error) => {
    console.error('HTTP server failed to start:', error.code || error.name);
    shutdown('server error');
  });
};

void startServer();
