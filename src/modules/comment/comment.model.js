// src/modules/comment/comment.model.js
import { query } from '../../config/database.js';

export const CommentModel = {
  // Create comment
  async create(commentData) {
    const { postId, userId, content } = commentData;
    const result = await query(
      `INSERT INTO comments (post_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, post_id, user_id, content, reply_count, like_count, created_at`,
      [postId, userId, content]
    );
    return result.rows[0];
  },

  // Get comments by post
  async getByPost(postId, userId, limit = 20, cursor = null) {
    let queryText = `
      SELECT 
        c.id, c.content, c.reply_count, c.like_count, c.created_at,
        u.id as user_id, u.first_name, u.last_name, u.profile_image,
        EXISTS(
          SELECT 1 FROM comment_likes 
          WHERE comment_id = c.id AND user_id = $1
        ) as user_liked
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.post_id = $2
    `;

    const params = [userId, postId];

    if (cursor) {
      queryText += ` AND c.created_at < $3`;
      params.push(cursor);
    }

    queryText += `
      ORDER BY c.created_at DESC
      LIMIT $${params.length + 1}
    `;
    params.push(limit);

    const result = await query(queryText, params);
    return result.rows;
  },

  // Get single comment
  async findById(id) {
    const result = await query(
      `SELECT 
        c.*, 
        u.id as user_id, u.first_name, u.last_name, u.profile_image
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Update comment
  async update(id, content) {
    const result = await query(
      `UPDATE comments 
       SET content = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, content, updated_at`,
      [content, id]
    );
    return result.rows[0];
  },

  // Delete comment
  async delete(id) {
    const result = await query(
      'DELETE FROM comments WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  },

  // Check if user owns comment
  async isOwner(commentId, userId) {
    const result = await query(
      'SELECT id FROM comments WHERE id = $1 AND user_id = $2',
      [commentId, userId]
    );
    return result.rows.length > 0;
  },

  // Get comment count for post
  async getCountByPost(postId) {
    const result = await query(
      'SELECT COUNT(*) FROM comments WHERE post_id = $1',
      [postId]
    );
    return parseInt(result.rows[0].count);
  },
};