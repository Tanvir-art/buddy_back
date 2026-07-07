
import { query } from '../../config/database.js';

export const UserModel = {
  // Get user by ID
  async findById(id) {
    const result = await query(
      `SELECT 
        id, first_name, last_name, email, profile_image, created_at
       FROM users 
       WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Update user profile
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

  // Update profile image
  async updateProfileImage(userId, imageUrl) {
    const result = await query(
      `UPDATE users 
       SET profile_image = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, first_name, last_name, email, profile_image`,
      [imageUrl, userId]
    );
    return result.rows[0];
  },
};