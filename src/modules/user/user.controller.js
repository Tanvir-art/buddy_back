
import { UserService } from './user.service.js';
import { CONSTANTS } from '../../config/constants.js';

export const UserController = {
  // Get profile
  async getProfile(req, res, next) {
    try {
      const user = await UserService.getProfile(req.user.id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update profile
  async updateProfile(req, res, next) {
    try {
      const { firstName, lastName } = req.body;
      
      const user = await UserService.updateProfile(req.user.id, {
        firstName,
        lastName,
      });

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS.PROFILE_UPDATED,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // Upload profile image
  async uploadProfileImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided',
        });
      }

      const imageUrl = `/uploads/profiles/${req.file.filename}`;
      
      const user = await UserService.updateProfileImage(req.user.id, imageUrl);

      res.status(200).json({
        success: true,
        message: 'Profile image updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
};