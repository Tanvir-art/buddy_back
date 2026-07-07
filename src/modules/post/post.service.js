
import { PostModel } from './post.model.js';
import { LikeModel } from '../like/like.model.js';
import { CONSTANTS } from '../../config/constants.js';
import logger from '../../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { env } from '../../config/env.js';

export const PostService = {
  // Create post
  async createPost(userId, postData, file) {
    try {
      let imageUrl = null;

      if (file) {
        // imageUrl = `/uploads/posts/${file.filename}`;
        const baseUrl = env.BASE_URL || 'http://localhost:5000';
        imageUrl = `${baseUrl}/uploads/posts/${file.filename}`;
      }

      const post = await PostModel.create({
        userId,
        content: postData.content,
        imageUrl,
        visibility: postData.visibility || CONSTANTS.VISIBILITY.PUBLIC,
      });

      // Get user details
      const user = await PostModel.findById(post.id);

      return {
        ...post,
        user: {
          id: userId,
          first_name: user?.first_name || '',
          last_name: user?.last_name || '',
          profile_image: user?.profile_image || null,
        },
        userLiked: false,
      };
    } catch (error) {
      if (file) {
        const filePath = path.join('uploads/posts', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      logger.error('Create post failed:', error);
      throw error;
    }
  },

  async getFeed(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const posts = await PostModel.getFeed(userId, limit, offset);
      const total = await PostModel.getFeedCount(userId);

      const normalizedPosts = posts.map(({ user_id, first_name, last_name, profile_image, user_liked, ...post }) => ({
        ...post,
        user_id,
        user: { id: user_id, first_name, last_name, profile_image },
        userLiked: user_liked,
        likeCount: post.like_count,
        commentCount: post.comment_count,
      }));

      return {
        posts: normalizedPosts,
        pagination: {
          page,
          limit,
          total,
          hasMore: posts.length === limit,
        },
      };
    } catch (error) {
      logger.error('Get feed failed:', error);
      throw error;
    }
  },

  // Get single post
  async getPostById(postId, userId) {
    try {
      const post = await PostModel.findById(postId);
      if (!post) {
        const error = new Error(CONSTANTS.ERRORS.NOT_FOUND);
        error.statusCode = 404;
        throw error;
      }

      if (post.visibility === CONSTANTS.VISIBILITY.PRIVATE && post.user_id !== userId) {
        const error = new Error(CONSTANTS.ERRORS.FORBIDDEN);
        error.statusCode = 403;
        throw error;
      }

      const userLiked = await LikeModel.hasLikedPost(userId, postId);

      return {
        ...post,
        userLiked,
      };
    } catch (error) {
      logger.error('Get post failed:', error);
      throw error;
    }
  },

  // Update post
  async updatePost(postId, userId, updateData) {
    try {
      const isOwner = await PostModel.isOwner(postId, userId);
      if (!isOwner) {
        const error = new Error(CONSTANTS.ERRORS.FORBIDDEN);
        error.statusCode = 403;
        throw error;
      }

      const post = await PostModel.update(postId, updateData);
      if (!post) {
        const error = new Error(CONSTANTS.ERRORS.NOT_FOUND);
        error.statusCode = 404;
        throw error;
      }

      return post;
    } catch (error) {
      logger.error('Update post failed:', error);
      throw error;
    }
  },

  // Delete post
  async deletePost(postId, userId) {
    try {
      const isOwner = await PostModel.isOwner(postId, userId);
      if (!isOwner) {
        const error = new Error(CONSTANTS.ERRORS.FORBIDDEN);
        error.statusCode = 403;
        throw error;
      }

      const post = await PostModel.delete(postId);
      if (!post) {
        const error = new Error(CONSTANTS.ERRORS.NOT_FOUND);
        error.statusCode = 404;
        throw error;
      }

      return post;
    } catch (error) {
      logger.error('Delete post failed:', error);
      throw error;
    }
  },

  // Toggle like
  async toggleLike(postId, userId) {
    try {
      const post = await PostModel.findById(postId);
      if (!post) {
        const error = new Error(CONSTANTS.ERRORS.NOT_FOUND);
        error.statusCode = 404;
        throw error;
      }

      const alreadyLiked = await LikeModel.hasLikedPost(userId, postId);

      if (alreadyLiked) {
        await LikeModel.unlikePost(userId, postId);
        return { liked: false, likeCount: post.like_count - 1 };
      } else {
        await LikeModel.likePost(userId, postId);
        return { liked: true, likeCount: post.like_count + 1 };
      }
    } catch (error) {
      logger.error('Toggle like failed:', error);
      throw error;
    }
  },

  // Get post likes
  async getPostLikes(postId, userId, limit = 20, page = 1) {
    try {
      const offset = (page - 1) * limit;
      const result = await query(
        `SELECT 
          u.id, u.first_name, u.last_name, u.profile_image,
          pl.created_at
         FROM post_likes pl
         JOIN users u ON u.id = pl.user_id
         WHERE pl.post_id = $1
         ORDER BY pl.created_at DESC
         LIMIT $2 OFFSET $3`,
        [postId, limit, offset]
      );

      const totalResult = await query(
        'SELECT COUNT(*) FROM post_likes WHERE post_id = $1',
        [postId]
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
      logger.error('Get post likes failed:', error);
      throw error;
    }
  },
};

// Import query for getPostLikes
import { query } from '../../config/database.js';