import mongoose, { Schema } from 'mongoose';

// User Schema & Model
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    resetOtp: {
      type: String,
      select: false,
    },
    resetOtpExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);