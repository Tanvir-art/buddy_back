
import { query } from '../../config/database.js';

export const LikeModel = {
  // ============ POST LIKES ============
  
  async likePost(userId, postId) {
    const result = await query(
      `INSERT INTO post_likes (user_id, post_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, post_id) DO NOTHING
       RETURNING id, user_id, post_id, created_at`,
      [userId, postId]
    );
    return result.rows[0];
  },

  async unlikePost(userId, postId) {
    const result = await query(
      'DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2 RETURNING id',
      [userId, postId]
    );
    return result.rows[0];
  },

  async hasLikedPost(userId, postId) {
    const result = await query(
      'SELECT id FROM post_likes WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );
    return result.rows.length > 0;
  },

  // ============ COMMENT LIKES ============
  
  async likeComment(userId, commentId) {
    const result = await query(
      `INSERT INTO comment_likes (user_id, comment_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, comment_id) DO NOTHING
       RETURNING id, user_id, comment_id, created_at`,
      [userId, commentId]
    );
    return result.rows[0];
  },

  async unlikeComment(userId, commentId) {
    const result = await query(
      'DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2 RETURNING id',
      [userId, commentId]
    );
    return result.rows[0];
  },

  async hasLikedComment(userId, commentId) {
    const result = await query(
      'SELECT id FROM comment_likes WHERE user_id = $1 AND comment_id = $2',
      [userId, commentId]
    );
    return result.rows.length > 0;
  },

  // ============ REPLY LIKES ============
  
  async likeReply(userId, replyId) {
    const result = await query(
      `INSERT INTO reply_likes (user_id, reply_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, reply_id) DO NOTHING
       RETURNING id, user_id, reply_id, created_at`,
      [userId, replyId]
    );
    return result.rows[0];
  },

  async unlikeReply(userId, replyId) {
    const result = await query(
      'DELETE FROM reply_likes WHERE user_id = $1 AND reply_id = $2 RETURNING id',
      [userId, replyId]
    );
    return result.rows[0];
  },

  async hasLikedReply(userId, replyId) {
    const result = await query(
      'SELECT id FROM reply_likes WHERE user_id = $1 AND reply_id = $2',
      [userId, replyId]
    );
    return result.rows.length > 0;
  },

  // ============ GET LIKES ============
  
  async getPostLikes(postId, limit = 20, offset = 0) {
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
    return result.rows;
  },

  async getCommentLikes(commentId, limit = 20, offset = 0) {
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
    return result.rows;
  },

  async getReplyLikes(replyId, limit = 20, offset = 0) {
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
    return result.rows;
  },
};