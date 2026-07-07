
import express from 'express';
import { LikeController } from './like.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(authenticate);

// ============ POST LIKES ============
router.post('/posts/:id/like', LikeController.likePost);
router.delete('/posts/:id/like', LikeController.unlikePost);
router.get('/posts/:id/likes', LikeController.getPostLikes);

// ============ COMMENT LIKES ============
router.post('/comments/:id/like', LikeController.likeComment);
router.delete('/comments/:id/like', LikeController.unlikeComment);
router.get('/comments/:id/likes', LikeController.getCommentLikes);

// ============ REPLY LIKES ============
router.post('/replies/:id/like', LikeController.likeReply);
router.delete('/replies/:id/like', LikeController.unlikeReply);
router.get('/replies/:id/likes', LikeController.getReplyLikes);

export default router;