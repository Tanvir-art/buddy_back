
import { AuthService } from './auth.service.js';
import { CONSTANTS } from '../../config/constants.js';

export const AuthController = {
  // Register
  async register(req, res, next) {
    try {
      const { firstName, lastName, email, password, agreeTerms } = req.body;
      
      
      if (!agreeTerms) {
        return res.status(400).json({
          success: false,
          message: 'You must agree to the terms and conditions',
          errors: [
            {
              field: 'agreeTerms',
              message: 'You must agree to terms & conditions'
            }
          ]
        });
      }

      const result = await AuthService.register({
        firstName,
        lastName,
        email,
        password,
        agreeTerms, // Pass to service if needed
      });

      res.status(201).json({
        success: true,
        message: CONSTANTS.SUCCESS.REGISTERED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // Login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      const result = await AuthService.login(email, password);

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS.LOGIN,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // Refresh Token
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      const result = await AuthService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS.TOKEN_REFRESHED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // Logout
  async logout(req, res, next) {
    try {
      const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
      
      await AuthService.logout(refreshToken);

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS.LOGOUT,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get Current User
  async getMe(req, res, next) {
    try {
      const user = await AuthService.getCurrentUser(req.user.id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // Change Password
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      await AuthService.changePassword(req.user.id, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS.PASSWORD_CHANGED,
      });
    } catch (error) {
      next(error);
    }
  },
};