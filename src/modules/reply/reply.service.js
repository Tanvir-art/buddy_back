// src/modules/reply/reply.service.js
import { ReplyModel } from './reply.model.js';
import { LikeModel } from '../like/like.model.js';
import { CommentModel } from '../comment/comment.model.js';
import { CONSTANTS } from '../../config/constants.js';
import logger from '../../utils/logger.js';
import { query } from '../../config/database.js';

export const ReplyService = {
  // Create reply
  async createReply(commentId, userId, content) {
    try {
      // Check if comment exists
      const comment = await CommentModel.findById(commentId);
      if (!comment) {
        const error = new Error(CONSTANTS.ERRORS.NOT_FOUND);
        error.statusCode = 404;
        throw error;
      }

      const reply = await ReplyModel.create({
        commentId,
        userId,
        content,
      });

      // Get user details
      const user = await query(
        'SELECT id, first_name, last_name, profile_image FROM users WHERE id = $1',
        [userId]
      );

      return {
        ...reply,
        user: user.rows[0],
        userLiked: false,
      };
    } catch (error) {
      logger.error('Create reply failed:', error);
      throw error;
    }
  },

  // Get replies for comment
  async getReplies(commentId, userId, limit = 20, page = 1) {
    try {
      const replies = await ReplyModel.getByComment(commentId, userId, limit);
      const total = await ReplyModel.getCountByComment(commentId);

      return {
        replies,
        pagination: {
          page,
          limit,
          total,
          hasMore: replies.length === limit,
        },
      };
    } catch (error) {
      logger.error('Get replies failed:', error);
      throw error;
    }
  },

  // Update reply
  async updateReply(replyId, userId, content) {
    try {
      // Check ownership
      const isOwner = await ReplyModel.isOwner(replyId, userId);
      if (!isOwner) {
        const error = new Error(CONSTANTS.ERRORS.FORBIDDEN);
        error.statusCode = 403;
        throw error;
      }

      const reply = await ReplyModel.update(replyId, content);
      if (!reply) {
        const error = new Error(CONSTANTS.ERRORS.NOT_FOUND);
        error.statusCode = 404;
        throw error;
      }

      return reply;
    } catch (error) {
      logger.error('Update reply failed:', error);
      throw error;
    }
  },

  // Delete reply
  async deleteReply(replyId, userId) {
    try {
      // Check ownership
      const isOwner = await ReplyModel.isOwner(replyId, userId);
      if (!isOwner) {
        const error = new Error(CONSTANTS.ERRORS.FORBIDDEN);
        error.statusCode = 403;
        throw error;
      }

      const reply = await ReplyModel.delete(replyId);
      if (!reply) {
        const error = new Error(CONSTANTS.ERRORS.NOT_FOUND);
        error.statusCode = 404;
        throw error;
      }

      return reply;
    } catch (error) {
      logger.error('Delete reply failed:', error);
      throw error;
    }
  },

  // Toggle like
  async toggleLike(replyId, userId) {
    try {
      // Check if reply exists
      const reply = await ReplyModel.findById(replyId);
      if (!reply) {
        const error = new Error(CONSTANTS.ERRORS.NOT_FOUND);
        error.statusCode = 404;
        throw error;
      }

      // Check if already liked
      const alreadyLiked = await LikeModel.hasLikedReply(userId, replyId);

      if (alreadyLiked) {
        await LikeModel.unlikeReply(userId, replyId);
        return { liked: false, likeCount: reply.like_count - 1 };
      } else {
        await LikeModel.likeReply(userId, replyId);
        return { liked: true, likeCount: reply.like_count + 1 };
      }
    } catch (error) {
      logger.error('Toggle reply like failed:', error);
      throw error;
    }
  },

  // Get reply likes
  async getReplyLikes(replyId, limit = 20, page = 1) {
    try {
      const offset = (page - 1) * limit;
      const result = await query(
        `SELECT 
          u.id, u.first_name, u.last_name, u.profile_image,
          rl.created_at
         FROM reply_likes rl
         JOIN users u ON u.id = rl.user_id
         WHERE rl.reply_id = $1
         ORDER BY rl.created_at DESC
         LIMIT $2 OFFSET $3`,
        [replyId, limit, offset]
      );

      const totalResult = await query(
        'SELECT COUNT(*) FROM reply_likes WHERE reply_id = $1',
        [replyId]
      );

      return {
        likes: result.rows,
        pagination: {
          page,
          limit,
          total: parseInt(totalResult.rows[0].count),
        },
      };
    } catch (error) {
      logger.error('Get reply likes failed:', error);
      throw error;
    }
  },
};