const crypto = require('crypto');
const UserModel = require('../models/userModel');
const { generateToken } = require('../middleware/auth');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');

const authController = {
  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      // Validation
      const errors = [];
      if (!username || username.trim().length < 3) {
        errors.push('Username must be at least 3 characters.');
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('A valid email address is required.');
      }
      if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters.');
      }
      if (password && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter.');
      }
      if (password && !/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number.');
      }

      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }

      // Check duplicates
      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ success: false, errors: ['Email is already registered.'] });
      }

      const existingUsername = await UserModel.findByUsername(username);
      if (existingUsername) {
        return res.status(409).json({ success: false, errors: ['Username is already taken.'] });
      }

      // Create user
      const user = await UserModel.create({ username, email, password });

      // Generate JWT
      const token = generateToken(user);

      // Send welcome email (non-blocking)
      sendWelcomeEmail(user).catch((err) => console.error('Welcome email failed:', err.message));

      res.status(201).json({
        success: true,
        data: {
          user: { id: user.id, username: user.username, email: user.email, created_at: user.created_at },
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { identifier, password } = req.body;
      // identifier can be email or username

      if (!identifier || !password) {
        return res.status(400).json({ success: false, errors: ['Email/username and password are required.'] });
      }

      const user = await UserModel.findByEmailOrUsername(identifier);
      if (!user) {
        return res.status(401).json({ success: false, errors: ['Invalid credentials.'] });
      }

      const validPassword = await UserModel.verifyPassword(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ success: false, errors: ['Invalid credentials.'] });
      }

      const token = generateToken(user);

      res.json({
        success: true,
        data: {
          user: { id: user.id, username: user.username, email: user.email, created_at: user.created_at },
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/logout
   * (Stateless JWT — just acknowledge. Client discards the token.)
   */
  async logout(req, res) {
    res.json({ success: true, message: 'Logged out successfully.' });
  },

  /**
   * GET /api/auth/me
   */
  async me(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, errors: ['Email is required.'] });
      }

      const user = await UserModel.findByEmail(email);

      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
      }

      // Generate token
      const resetToken = crypto.randomBytes(32).toString('hex');
      await UserModel.createResetToken(user.id, resetToken);

      // Send email (non-blocking)
      sendPasswordResetEmail({ username: user.username, email: user.email }, resetToken)
        .catch((err) => console.error('Reset email failed:', err.message));

      res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ success: false, errors: ['Token and new password are required.'] });
      }

      if (password.length < 6) {
        return res.status(400).json({ success: false, errors: ['Password must be at least 6 characters.'] });
      }

      const resetRecord = await UserModel.findValidResetToken(token);
      if (!resetRecord) {
        return res.status(400).json({ success: false, errors: ['Invalid or expired reset link. Please request a new one.'] });
      }

      // Update the password
      await UserModel.updatePassword(resetRecord.user_id, password);

      // Mark token as used
      await UserModel.markTokenUsed(resetRecord.id);

      res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
