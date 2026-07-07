
import express from 'express';
import { UserController } from './user.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { uploadSingle, handleMulterError } from '../../config/multer.js';
import { updateProfileSchema } from './user.validation.js';

const router = express.Router();

// All routes are protected
router.use(authenticate);

router.get('/profile', UserController.getProfile);
router.patch('/profile', validate(updateProfileSchema), UserController.updateProfile);
router.post(
  '/profile-image',
  uploadSingle('profileImage'),
  handleMulterError,
  UserController.uploadProfileImage
);

export default router;