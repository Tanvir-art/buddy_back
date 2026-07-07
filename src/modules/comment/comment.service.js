// src/modules/comment/comment.service.js
import { CommentModel } from './comment.model.js';
import { LikeModel } from '../like/like.model.js';
import { PostModel } from '../post/post.model.js';
import { ReplyModel } from '../reply/reply.model.js';
import { CONSTANTS } from '../../config/constants.js';
import logger from '../../utils/logger.js';
import { query } from '../../config/database.js';

export const CommentService = {
  // Create comment
  async createComment(postId, userId, content) {
    try {
      // Check if post exists
      const post = await PostModel.findById(postId);
      if (!post) {
        const error = new Error(CONSTANTS.ERRORS.NOT_FOUND);
        error.statusCode = 404;
        throw error;
      }

      const comment = await CommentModel.create({
        postId,
        userId,
        content,
      });

      // Get user details
      const user = await query(
        'SELECT id, first_name, last_name, profile_image FROM users WHERE id = $1',
        [userId]
      );

      return {
        ...comment,
        user: user.rows[0],
        userLiked: false,
        replies: [],
      };
    } catch (error) {
      logger.error('Create comment failed:', error);
      throw error;
    }
  },

  // Get comments for post
  async getComments(postId, userId, limit = 20, page = 1) {
    try {
      const offset = (page - 1) * limit;
      
      // Get comments
      const comments = await CommentModel.getByPost(postId, userId, limit);

      // Get replies for each comment
      const commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
          const replies = await ReplyModel.getByComment(comment.id, userId);
          return {
            ...comment,
            replies,
          };
        })
      );

      // Get total count
      const total = await CommentModel.getCountByPost(postId);

      return {
        comments: commentsWithReplies,
        pagination: {
          page,
          limit,
          total,
          hasMore: comments.length === limit,
        },
      };
    } catch (error) {
      logger.error('Get comments failed:', error);
      throw error;
    }
  },

  // Update comment
  async updateComment(commentId, userId, content) {
    try {
      // Check ownership
      const isOwner = await CommentModel.isOwner(commentId, userId);
      if (!isOwner) {
        const error = new Error(CONSTANTS.ERRORS.FORBIDDEN);
        error.statusCode = 403;
        throw error;
      }

      const comment = await CommentModel.update(commentId, content);
      if (!comment) {
        const error = new Error(CONSTANTS.ERRORS.NOT_FOUND);
        error.statusCode = 404;
        throw error;
      }

      return comment;
    } catch (error) {
      logger.error('Update comment failed:', error);
      throw error;
    }
  },

  // Delete comment
  async deleteComment(commentId, userId) {
    try {
      // Check ownership
      const isOwner = await CommentModel.isOwner(commentId, userId);
      if (!isOwner) {
        const error = new Error(CONSTANTS.ERRORS.FORBIDDEN);
        error.statusCode = 403;
        throw error;
      }

      const comment = await CommentModel.delete(commentId);
      if (!comment) {
        const error = new Error(CONSTANTS.ERRORS.NOT_FOUND);
        error.statusCode = 404;
        throw error;
      }

      return comment;
    } catch (error) {
      logger.error('Delete comment failed:', error);
      throw error;
    }
  },

  // Toggle like
  async toggleLike(commentId, userId) {
    try {
      // Check if comment exists
      const comment = await CommentModel.findById(commentId);
      if (!comment) {
        const error = new Error(CONSTANTS.ERRORS.NOT_FOUND);
        error.statusCode = 404;
        throw error;
      }

      // Check if already liked
      const alreadyLiked = await LikeModel.hasLikedComment(userId, commentId);

      if (alreadyLiked) {
        await LikeModel.unlikeComment(userId, commentId);
        return { liked: false, likeCount: comment.like_count - 1 };
      } else {
        await LikeModel.likeComment(userId, commentId);
        return { liked: true, likeCount: comment.like_count + 1 };
      }
    } catch (error) {
      logger.error('Toggle comment like failed:', error);
      throw error;
    }
  },

  // Get comment likes
  async getCommentLikes(commentId, limit = 20, page = 1) {
    try {
      const offset = (page - 1) * limit;
      const result = await query(
        `SELECT 
          u.id, u.first_name, u.last_name, u.profile_image,
          cl.created_at
         FROM comment_likes cl
         JOIN users u ON u.id = cl.user_id
         WHERE cl.comment_id = $1
         ORDER BY cl.created_at DESC
         LIMIT $2 OFFSET $3`,
        [commentId, limit, offset]
      );

      const totalResult = await query(
        'SELECT COUNT(*) FROM comment_likes WHERE comment_id = $1',
        [commentId]
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
      logger.error('Get comment likes failed:', error);
      throw error;
    }
  },
};