import mongoose from 'mongoose';

// MongoDB database connection setup with connection caching for serverless environments (Vercel)
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Database connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    throw error;
  }
};

export default connectDB;