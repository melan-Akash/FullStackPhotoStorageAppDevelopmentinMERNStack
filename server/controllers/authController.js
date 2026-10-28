import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/user.js';
import {
  sendWelcomeEmail,
  sendOtpEmail,
  sendPasswordChangedEmail,
} from '../config/email.js';

// Helper function to sign JWT token
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: 'Account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Send professional welcome email in background
    sendWelcomeEmail(user).catch((err) => {
      console.error('[Welcome Email Error]:', err.message);
    });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
      message: 'Account created successfully! A welcome email has been sent.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to register' });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);
    res.status(200).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to login' });
  }
};

// Get current authenticated user details
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

// Send OTP for Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Please enter your email address' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Securely hash OTP before persisting in DB to protect against database leaks
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    user.resetOtp = hashedOtp;
    user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await user.save();

    // Deliver OTP to user email
    await sendOtpEmail(user.email, user.name, otp);

    res.status(200).json({
      message: `A 6-digit verification code has been sent to ${user.email}`,
      email: user.email,
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: error.message || 'Failed to send verification code' });
  }
};

// Verify OTP and Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+resetOtp +resetOtpExpires');

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Check if OTP has expired
    if (!user.resetOtpExpires || user.resetOtpExpires.getTime() < Date.now()) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    // Verify OTP using SHA-256 hash comparison
    const hashedOtp = crypto.createHash('sha256').update(otp.trim()).digest('hex');
    if (user.resetOtp !== hashedOtp) {
      return res.status(400).json({ message: 'Invalid verification code. Please check your email and try again.' });
    }

    // Hash new password and clear reset fields
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    // Send confirmation email asynchronously
    sendPasswordChangedEmail(user).catch((err) => {
      console.error('[Password Changed Email Error]:', err.message);
    });

    res.status(200).json({
      message: 'Password reset successful! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: error.message || 'Failed to reset password' });
  }
};
