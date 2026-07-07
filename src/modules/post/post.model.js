
import { query } from '../../config/database.js';
import { CONSTANTS } from '../../config/constants.js';

export const PostModel = {
  // Create post
  async create(postData) {
    const { userId, content, imageUrl, visibility } = postData;
    const result = await query(
      `INSERT INTO posts (user_id, content, image_url, visibility)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, content, image_url, visibility, 
                 like_count, comment_count, created_at`,
      [userId, content, imageUrl, visibility || CONSTANTS.VISIBILITY.PUBLIC]
    );
    return result.rows[0];
  },

  //  Get feed posts with pagination OFFSET based
  async getFeed(userId, limit = 20, offset = 0) {
    const result = await query(
      `
      SELECT 
        p.id, p.content, p.image_url, p.visibility, 
        p.like_count, p.comment_count, p.created_at,
        u.id as user_id, u.first_name, u.last_name, u.profile_image,
        EXISTS(
          SELECT 1 FROM post_likes 
          WHERE post_id = p.id AND user_id = $1
        ) as user_liked
      FROM posts p
      JOIN users u ON u.id = p.user_id
      WHERE (p.visibility = 'PUBLIC' OR p.user_id = $1)
        AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
      `,
      [userId, limit, offset]
    );
    return result.rows;
  },

  
  async getFeedCount(userId) {
    const result = await query(
      `
      SELECT COUNT(*) 
      FROM posts 
      WHERE (visibility = 'PUBLIC' OR user_id = $1) 
        AND deleted_at IS NULL
      `,
      [userId]
    );
    return parseInt(result.rows[0].count);
  },

  // Get single post
  async findById(id) {
    const result = await query(
      `SELECT 
        p.*, 
        u.id as user_id, u.first_name, u.last_name, u.profile_image
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE p.id = $1 AND p.deleted_at IS NULL`,
      [id]
    );
    return result.rows[0];
  },

  // Update post
  async update(id, data) {
    const fields = [];
    const values = [];
    let index = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const result = await query(
      `UPDATE posts 
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${index} AND deleted_at IS NULL
       RETURNING id, content, image_url, visibility, updated_at`,
      values
    );
    return result.rows[0];
  },

  // Soft delete post
  async delete(id) {
    const result = await query(
      `UPDATE posts 
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [id]
    );
    return result.rows[0];
  },

  // Check if user owns post
  async isOwner(postId, userId) {
    const result = await query(
      'SELECT id FROM posts WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [postId, userId]
    );
    return result.rows.length > 0;
  },

  // Get posts by user
  async getByUser(userId, currentUserId, limit = 20, offset = 0) {
    const result = await query(
      `
      SELECT 
        p.id, p.content, p.image_url, p.visibility, 
        p.like_count, p.comment_count, p.created_at,
        u.id as user_id, u.first_name, u.last_name, u.profile_image,
        EXISTS(
          SELECT 1 FROM post_likes 
          WHERE post_id = p.id AND user_id = $1
        ) as user_liked
      FROM posts p
      JOIN users u ON u.id = p.user_id
      WHERE p.user_id = $2 
        AND p.deleted_at IS NULL
        AND (p.visibility = 'PUBLIC' OR p.user_id = $1)
      ORDER BY p.created_at DESC
      LIMIT $3 OFFSET $4
      `,
      [currentUserId, userId, limit, offset]
    );
    return result.rows;
  },

  // Update like count (for triggers)
  async updateLikeCount(postId, increment = true) {
    const operation = increment ? '+' : '-';
    await query(
      `UPDATE posts 
       SET like_count = like_count ${operation} 1
       WHERE id = $1`,
      [postId]
    );
  },
};