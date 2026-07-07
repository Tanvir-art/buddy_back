
import { UserModel } from './user.model.js';
import { CONSTANTS } from '../../config/constants.js';
import logger from '../../utils/logger.js';

export const UserService = {
  // Get user profile
  async getProfile(userId) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        const error = new Error(CONSTANTS.ERRORS.USER_NOT_FOUND);
        error.statusCode = 404;
        throw error;
      }
      return user;
    } catch (error) {
      logger.error('Get profile failed:', error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(userId, data) {
    try {
      const user = await UserModel.update(userId, {
        first_name: data.firstName,
        last_name: data.lastName,
      });
      if (!user) {
        const error = new Error(CONSTANTS.ERRORS.USER_NOT_FOUND);
        error.statusCode = 404;
        throw error;
      }
      return user;
    } catch (error) {
      logger.error('Update profile failed:', error);
      throw error;
    }
  },

  // Update profile image
  async updateProfileImage(userId, imageUrl) {
    try {
      const user = await UserModel.updateProfileImage(userId, imageUrl);
      if (!user) {
        const error = new Error(CONSTANTS.ERRORS.USER_NOT_FOUND);
        error.statusCode = 404;
        throw error;
      }
      return user;
    } catch (error) {
      logger.error('Update profile image failed:', error);
      throw error;
    }
  },
};