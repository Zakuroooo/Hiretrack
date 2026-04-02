import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var mongoose: { conn: mongoose.Mongoose | null; promise: Promise<mongoose.Mongoose> | null } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not defined. Please add it to your .env.local file.\n" +
      "Example: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hiretrack"
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB(): Promise<mongoose.Mongoose> {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    cached!.promise = mongoose
      .connect(MONGODB_URI!, {
        bufferCommands: false,
      })
      .then((connection) => {
        console.log("✓ MongoDB connected successfully");
        return connection;
      });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (err) {
    cached!.promise = null;
    throw err;
  }

  return cached!.conn;
}

export default connectDB;
