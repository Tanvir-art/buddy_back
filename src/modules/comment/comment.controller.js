// src/modules/comment/comment.controller.js
import { CommentService } from './comment.service.js';
import { CONSTANTS } from '../../config/constants.js';

export const CommentController = {
  // Create comment
  async createComment(req, res, next) {
    try {
      const { postId, content } = req.body;
      
      const comment = await CommentService.createComment(
        postId,
        req.user.id,
        content
      );

      res.status(201).json({
        success: true,
        message: CONSTANTS.SUCCESS.COMMENT_CREATED,
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get comments for post
  async getComments(req, res, next) {
    try {
      const { postId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      
      const result = await CommentService.getComments(
        postId,
        req.user.id,
        limit,
        page
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update comment
  async updateComment(req, res, next) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      
      const comment = await CommentService.updateComment(
        id,
        req.user.id,
        content
      );

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS.COMMENT_UPDATED,
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete comment
  async deleteComment(req, res, next) {
    try {
      const { id } = req.params;
      
      await CommentService.deleteComment(id, req.user.id);

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS.COMMENT_DELETED,
      });
    } catch (error) {
      next(error);
    }
  },

  // Toggle like
  async toggleLike(req, res, next) {
    try {
      const { id } = req.params;
      const result = await CommentService.toggleLike(id, req.user.id);

      res.status(200).json({
        success: true,
        message: result.liked ? CONSTANTS.SUCCESS.LIKED : CONSTANTS.SUCCESS.UNLIKED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get comment likes
  async getLikes(req, res, next) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      
      const result = await CommentService.getCommentLikes(id, limit, page);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};