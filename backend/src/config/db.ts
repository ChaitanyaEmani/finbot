import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connString = process.env.MONGO_URI || 'mongodb://localhost:27017/saveup';
    const conn = await mongoose.connect(connString);
    console.log(`MongoDB Connected1`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${(error as Error).message}`);
    process.exit(1);
  }
};
