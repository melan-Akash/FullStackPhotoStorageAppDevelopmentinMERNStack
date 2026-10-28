import mongoose from 'mongoose';

// MongoDB database connection setup
const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('Database connected successfully');
    });

    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;