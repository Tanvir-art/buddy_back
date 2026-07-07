// src/modules/reply/reply.controller.js
import { ReplyService } from './reply.service.js';
import { CONSTANTS } from '../../config/constants.js';

export const ReplyController = {
  // Create reply
  async createReply(req, res, next) {
    try {
      const { commentId, content } = req.body;
      
      const reply = await ReplyService.createReply(
        commentId,
        req.user.id,
        content
      );

      res.status(201).json({
        success: true,
        message: CONSTANTS.SUCCESS.REPLY_CREATED,
        data: reply,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get replies for comment
  async getReplies(req, res, next) {
    try {
      const { commentId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      
      const result = await ReplyService.getReplies(
        commentId,
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

  // Update reply
  async updateReply(req, res, next) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      
      const reply = await ReplyService.updateReply(
        id,
        req.user.id,
        content
      );

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS.REPLY_UPDATED,
        data: reply,
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete reply
  async deleteReply(req, res, next) {
    try {
      const { id } = req.params;
      
      await ReplyService.deleteReply(id, req.user.id);

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS.REPLY_DELETED,
      });
    } catch (error) {
      next(error);
    }
  },

  // Toggle like
  async toggleLike(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ReplyService.toggleLike(id, req.user.id);

      res.status(200).json({
        success: true,
        message: result.liked ? CONSTANTS.SUCCESS.LIKED : CONSTANTS.SUCCESS.UNLIKED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get reply likes
  async getLikes(req, res, next) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      
      const result = await ReplyService.getReplyLikes(id, limit, page);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};