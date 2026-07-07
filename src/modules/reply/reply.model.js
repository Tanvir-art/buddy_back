
import { query } from '../../config/database.js';

export const ReplyModel = {
  // Create reply
  async create(replyData) {
    const { commentId, userId, content } = replyData;
    const result = await query(
      `INSERT INTO replies (comment_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, comment_id, user_id, content, like_count, created_at`,
      [commentId, userId, content]
    );
    return result.rows[0];
  },

  // Get replies by comment
  async getByComment(commentId, userId, limit = 20, cursor = null) {
    let queryText = `
      SELECT 
        r.id, r.content, r.like_count, r.created_at,
        u.id as user_id, u.first_name, u.last_name, u.profile_image,
        EXISTS(
          SELECT 1 FROM reply_likes 
          WHERE reply_id = r.id AND user_id = $1
        ) as user_liked
      FROM replies r
      JOIN users u ON u.id = r.user_id
      WHERE r.comment_id = $2
    `;

    const params = [userId, commentId];

    if (cursor) {
      queryText += ` AND r.created_at < $3`;
      params.push(cursor);
    }

    queryText += `
      ORDER BY r.created_at ASC
      LIMIT $${params.length + 1}
    `;
    params.push(limit);

    const result = await query(queryText, params);
    return result.rows;
  },

  // Get single reply
  async findById(id) {
    const result = await query(
      `SELECT 
        r.*, 
        u.id as user_id, u.first_name, u.last_name, u.profile_image
       FROM replies r
       JOIN users u ON u.id = r.user_id
       WHERE r.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Update reply
  async update(id, content) {
    const result = await query(
      `UPDATE replies 
       SET content = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, content, updated_at`,
      [content, id]
    );
    return result.rows[0];
  },

  // Delete reply
  async delete(id) {
    const result = await query(
      'DELETE FROM replies WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  },

  // Check if user owns reply
  async isOwner(replyId, userId) {
    const result = await query(
      'SELECT id FROM replies WHERE id = $1 AND user_id = $2',
      [replyId, userId]
    );
    return result.rows.length > 0;
  },

  // Get reply count for comment
  async getCountByComment(commentId) {
    const result = await query(
      'SELECT COUNT(*) FROM replies WHERE comment_id = $1',
      [commentId]
    );
    return parseInt(result.rows[0].count);
  },
};