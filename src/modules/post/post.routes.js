import express from 'express';
import { PostController } from './post.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { uploadSingle, handleMulterError } from '../../config/multer.js';
import {
  createPostSchema,
  updatePostSchema,
  getPostsQuerySchema,
} from './post.validation.js';

const router = express.Router();

// All routes are protected
router.use(authenticate);

// Get feed and create post
router.get('/', validate(getPostsQuerySchema), PostController.getFeed);
router.post(
  '/',
  uploadSingle('image'),
  handleMulterError,
  validate(createPostSchema),
  PostController.createPost
);

// Single post operations
router.get('/:id', PostController.getPost);
router.patch('/:id', validate(updatePostSchema), PostController.updatePost);
router.delete('/:id', PostController.deletePost);

// Like operations
router.post('/:id/like', PostController.toggleLike);
router.delete('/:id/like', PostController.toggleLike);
router.get('/:id/likes', PostController.getLikes);

export default router;