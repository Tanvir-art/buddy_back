// src/modules/comment/comment.routes.js
import express from 'express';
import { CommentController } from './comment.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import {
  createCommentSchema,
  updateCommentSchema,
} from './comment.validation.js';

const router = express.Router();

// All routes are protected
router.use(authenticate);

// Get comments for post
router.get('/post/:postId', CommentController.getComments);

// Create comment
router.post('/', validate(createCommentSchema), CommentController.createComment);

// Single comment operations
router.patch('/:id', validate(updateCommentSchema), CommentController.updateComment);
router.delete('/:id', CommentController.deleteComment);

// Like operations — specific routes before /:id
router.post('/:id/like', CommentController.toggleLike);
router.delete('/:id/like', CommentController.toggleLike);
router.get('/:id/likes', CommentController.getLikes);

export default router;