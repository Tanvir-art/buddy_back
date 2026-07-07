
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthModel } from './auth.model.js';
import { env } from '../../config/env.js';
import logger from '../../utils/logger.js';
import { CONSTANTS } from '../../config/constants.js';

export const AuthService = {
  // Register new user
  async register(userData) {
    try {
      const { firstName, lastName, email, password, agreeTerms } = userData;
      
      //  Check Terms & Conditions
      if (!agreeTerms) {
        const error = new Error('You must agree to the terms and conditions');
        error.statusCode = 400;
        throw error;
      }

      // Check if user exists
      const existingUser = await AuthModel.findByEmail(email);
      if (existingUser) {
        const error = new Error(CONSTANTS.ERRORS.USER_EXISTS);
        error.statusCode = 409;
        throw error;
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await AuthModel.create({
        firstName,
        lastName,
        email,
        passwordHash,
      });

      // Generate tokens
      const tokens = await this.generateTokens(user);

      return {
        user,
        ...tokens,
      };
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  },

  // Login user
  async login(email, password) {
    try {
      // Find user
      const user = await AuthModel.findByEmail(email);
      if (!user) {
        const error = new Error(CONSTANTS.ERRORS.INVALID_CREDENTIALS);
        error.statusCode = 401;
        throw error;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        const error = new Error(CONSTANTS.ERRORS.INVALID_CREDENTIALS);
        error.statusCode = 401;
        throw error;
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      return {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          profileImage: user.profile_image,
        },
        ...tokens,
      };
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  },

  // Generate JWT tokens
  async generateTokens(user) {
    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    };

    // Access Token (short-lived)
    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY,
    });

    // Refresh Token (long-lived)
    const refreshToken = jwt.sign(
      { id: user.id },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRY }
    );

    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    await AuthModel.saveRefreshToken(user.id, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
    };
  },

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
      
      // Check if token exists in database
      const tokenData = await AuthModel.findRefreshToken(refreshToken);
      if (!tokenData) {
        const error = new Error(CONSTANTS.ERRORS.INVALID_TOKEN);
        error.statusCode = 401;
        throw error;
      }

      // Check if token is expired
      if (new Date(tokenData.expires_at) < new Date()) {
        await AuthModel.deleteRefreshToken(refreshToken);
        const error = new Error(CONSTANTS.ERRORS.TOKEN_EXPIRED);
        error.statusCode = 401;
        throw error;
      }

      // Get user
      const user = await AuthModel.findById(decoded.id);
      if (!user) {
        const error = new Error(CONSTANTS.ERRORS.USER_NOT_FOUND);
        error.statusCode = 404;
        throw error;
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Delete old refresh token
      await AuthModel.deleteRefreshToken(refreshToken);

      return tokens;
    } catch (error) {
      logger.error('Refresh token failed:', error);
      throw error;
    }
  },

  // Logout
  async logout(refreshToken) {
    try {
      if (refreshToken) {
        await AuthModel.deleteRefreshToken(refreshToken);
      }
      return { message: CONSTANTS.SUCCESS.LOGOUT };
    } catch (error) {
      logger.error('Logout failed:', error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser(userId) {
    try {
      const user = await AuthModel.findById(userId);
      if (!user) {
        const error = new Error(CONSTANTS.ERRORS.USER_NOT_FOUND);
        error.statusCode = 404;
        throw error;
      }
      return user;
    } catch (error) {
      logger.error('Get current user failed:', error);
      throw error;
    }
  },

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await AuthModel.findById(userId);
      if (!user) {
        const error = new Error(CONSTANTS.ERRORS.USER_NOT_FOUND);
        error.statusCode = 404;
        throw error;
      }

      // Get full user with password hash
      const fullUser = await AuthModel.findByEmail(user.email);
      
      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, fullUser.password_hash);
      if (!isValidPassword) {
        const error = new Error('Current password is incorrect');
        error.statusCode = 401;
        throw error;
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await AuthModel.update(userId, { password_hash: newPasswordHash });

      // Delete all refresh tokens
      await AuthModel.deleteAllRefreshTokens(userId);

      return { message: CONSTANTS.SUCCESS.PASSWORD_CHANGED };
    } catch (error) {
      logger.error('Change password failed:', error);
      throw error;
    }
  },
};