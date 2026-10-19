import mongoose from 'mongoose';

const RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MS = 3000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set — check your .env file against .env.example');
    process.exit(1);
  }

  // Retries a genuinely down database no better than a single attempt would —
  // this exists for the container-orchestration race where the app starts
  // before the database container is actually ready to accept connections yet.
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      await mongoose.connect(uri);
      console.log('MongoDB connected');
      return;
    } catch (error) {
      const isLastAttempt = attempt === RETRY_ATTEMPTS;
      console.error(
        `MongoDB connection attempt ${attempt}/${RETRY_ATTEMPTS} failed: ${error.message}`
      );
      if (isLastAttempt) process.exit(1);
      await sleep(RETRY_DELAY_MS);
    }
  }
}
