import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5001;

async function start() {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Container orchestrators (Docker, Render, Railway, k8s) send SIGTERM on a
  // redeploy or scale-down. Without handling it, in-flight requests — a save
  // half-written to Mongo — can be cut off mid-request instead of finishing.
  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down gracefully...`);
    server.close(async () => {
      await mongoose.connection.close();
      console.log('HTTP server and MongoDB connection closed.');
      process.exit(0);
    });
    // Belt-and-suspenders: force-exit if close() hangs (e.g. a connection
    // that never idles out) rather than leaving the process stuck forever.
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
