
import express from 'express';
import { ReplyController } from './reply.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import {
  createReplySchema,
  updateReplySchema,
} from './reply.validation.js';

const router = express.Router();

// All routes are protected
router.use(authenticate);

// Get replies for comment
router.get('/comment/:commentId', ReplyController.getReplies);

// Create reply
router.post('/', validate(createReplySchema), ReplyController.createReply);

// Single reply operations
router.patch('/:id', validate(updateReplySchema), ReplyController.updateReply);
router.delete('/:id', ReplyController.deleteReply);

// Like operations
router.post('/:id/like', ReplyController.toggleLike);
router.delete('/:id/like', ReplyController.toggleLike);
router.get('/:id/likes', ReplyController.getLikes);

export default router;