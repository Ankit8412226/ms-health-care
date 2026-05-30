const mongoose = require('mongoose');

let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
  // Reuse existing connection in serverless environments
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ms-care';
    cached.promise = mongoose.connect(uri, { dbName: 'ms-care' }).then((m) => {
      console.log(`MongoDB Connected: ${m.connection.host}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error(`Database Connection Error: ${error.message}`);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;
