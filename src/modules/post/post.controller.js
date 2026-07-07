
import { PostService } from './post.service.js';
import { CONSTANTS } from '../../config/constants.js';

export const PostController = {
  async createPost(req, res, next) {
    try {
      const { content, visibility } = req.body;
      const file = req.file;
      
      const post = await PostService.createPost(
        req.user.id,
        { content, visibility },
        file
      );

      res.status(201).json({
        success: true,
        message: CONSTANTS.SUCCESS.POST_CREATED,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  },

  async getFeed(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      
      console.log(` Fetching feed: page=${page}, limit=${limit}, user=${req.user.id}`);
      
      const result = await PostService.getFeed(req.user.id, page, limit);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('❌ GetFeed Error:', error);
      next(error);
    }
  },

  async getPost(req, res, next) {
    try {
      const { id } = req.params;
      const post = await PostService.getPostById(id, req.user.id);

      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  },

  async updatePost(req, res, next) {
    try {
      const { id } = req.params;
      const { content, visibility } = req.body;
      
      const post = await PostService.updatePost(
        id,
        req.user.id,
        { content, visibility }
      );

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS.POST_UPDATED,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  },

  async deletePost(req, res, next) {
    try {
      const { id } = req.params;
      
      await PostService.deletePost(id, req.user.id);

      res.status(200).json({
        success: true,
        message: CONSTANTS.SUCCESS.POST_DELETED,
      });
    } catch (error) {
      next(error);
    }
  },

  async toggleLike(req, res, next) {
    try {
      const { id } = req.params;
      const result = await PostService.toggleLike(id, req.user.id);

      res.status(200).json({
        success: true,
        message: result.liked ? CONSTANTS.SUCCESS.LIKED : CONSTANTS.SUCCESS.UNLIKED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getLikes(req, res, next) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      
      const result = await PostService.getPostLikes(id, req.user.id, limit, page);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};