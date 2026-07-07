
import { query } from '../../config/database.js';

export const AuthModel = {
  // Find user by email
  async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  // Find user by ID
  async findById(id) {
    const result = await query(
      `SELECT id, first_name, last_name, email, profile_image, created_at 
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Create new user
  async create(userData) {
    const { firstName, lastName, email, passwordHash } = userData;
    const result = await query(
      `INSERT INTO users (first_name, last_name, email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, first_name, last_name, email, profile_image, created_at`,
      [firstName, lastName, email, passwordHash]
    );
    return result.rows[0];
  },

  // Update user
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
      `UPDATE users 
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${index}
       RETURNING id, first_name, last_name, email, profile_image, created_at`,
      values
    );
    return result.rows[0];
  },

  // Save refresh token
  async saveRefreshToken(userId, token, expiresAt) {
    const result = await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, token, expires_at`,
      [userId, token, expiresAt]
    );
    return result.rows[0];
  },

  // Find refresh token
  async findRefreshToken(token) {
    const result = await query(
      'SELECT * FROM refresh_tokens WHERE token = $1',
      [token]
    );
    return result.rows[0];
  },

  // Delete refresh token
  async deleteRefreshToken(token) {
    const result = await query(
      'DELETE FROM refresh_tokens WHERE token = $1 RETURNING id',
      [token]
    );
    return result.rows[0];
  },

  // Delete all refresh tokens for user
  async deleteAllRefreshTokens(userId) {
    const result = await query(
      'DELETE FROM refresh_tokens WHERE user_id = $1',
      [userId]
    );
    return result.rowCount;
  },
};