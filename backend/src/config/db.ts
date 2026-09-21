import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cardia_x';

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log(`[Database] ✅ Connected to MongoDB at ${uri}`);
  } catch {
    console.warn('[Database] ⚠️  External MongoDB unavailable. Launching embedded in-memory MongoDB...');
    try {
      mongoMemServer = await MongoMemoryServer.create();
      const memUri = mongoMemServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] ✅ In-memory MongoDB running at ${memUri}`);
      console.log('[Database] ℹ️  Data is ephemeral — resets on server restart. Install MongoDB for persistence.');
    } catch (memErr) {
      console.error('[Database] ❌ Failed to start in-memory MongoDB:', memErr);
      process.exit(1);
    }
  }
};

export const closeDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoMemServer) {
    await mongoMemServer.stop();
  }
};
