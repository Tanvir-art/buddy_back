
import { LikeModel } from './like.model.js';
import { CONSTANTS } from '../../config/constants.js';
import logger from '../../utils/logger.js';

export const LikeController = {
  // ============ POST LIKES ============
  
  async likePost(req, res, next) {
    try {
      const { id } = req.params;
      await LikeModel.likePost(req.user.id, id);
      
      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS.LIKED,
      });
    } catch (error) {
      next(error);
    }
  },

  async unlikePost(req, res, next) {
    try {
      const { id } = req.params;
      await LikeModel.unlikePost(req.user.id, id);
      
      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS.UNLIKED,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPostLikes(req, res, next) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      
      const likes = await LikeModel.getPostLikes(id, limit, offset);

      res.status(200).json({
        success: true,
        data: {
          likes,
          pagination: { page, limit },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ============ COMMENT LIKES ============
  
  async likeComment(req, res, next) {
    try {
      const { id } = req.params;
      await LikeModel.likeComment(req.user.id, id);
      
      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS.LIKED,
      });
    } catch (error) {
      next(error);
    }
  },

  async unlikeComment(req, res, next) {
    try {
      const { id } = req.params;
      await LikeModel.unlikeComment(req.user.id, id);
      
      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS.UNLIKED,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCommentLikes(req, res, next) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      
      const likes = await LikeModel.getCommentLikes(id, limit, offset);

      res.status(200).json({
        success: true,
        data: {
          likes,
          pagination: { page, limit },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ============ REPLY LIKES ============
  
  async likeReply(req, res, next) {
    try {
      const { id } = req.params;
      await LikeModel.likeReply(req.user.id, id);
      
      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS.LIKED,
      });
    } catch (error) {
      next(error);
    }
  },

  async unlikeReply(req, res, next) {
    try {
      const { id } = req.params;
      await LikeModel.unlikeReply(req.user.id, id);
      
      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS.UNLIKED,
      });
    } catch (error) {
      next(error);
    }
  },

  async getReplyLikes(req, res, next) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      
      const likes = await LikeModel.getReplyLikes(id, limit, offset);

      res.status(200).json({
        success: true,
        data: {
          likes,
          pagination: { page, limit },
        },
      });
    } catch (error) {
      next(error);
    }
  },
};