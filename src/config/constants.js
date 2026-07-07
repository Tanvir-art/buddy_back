
export const CONSTANTS = {
   
  VISIBILITY: {
    PUBLIC: 'PUBLIC',
    PRIVATE: 'PRIVATE',
  },
  
  // Table names
  TABLES: {
    USERS: 'users',
    POSTS: 'posts',
    COMMENTS: 'comments',
    REPLIES: 'replies',
    POST_LIKES: 'post_likes',
    COMMENT_LIKES: 'comment_likes',
    REPLY_LIKES: 'reply_likes',
    REFRESH_TOKENS: 'refresh_tokens',
  },
  
  // Error messages
  ERRORS: {
    USER_NOT_FOUND: 'User not found',
    USER_EXISTS: 'User already exists',
    INVALID_CREDENTIALS: 'Invalid email or password',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'You do not have permission',
    NOT_FOUND: 'Resource not found',
    TOKEN_EXPIRED: 'Token expired',
    INVALID_TOKEN: 'Invalid token',
    FILE_TOO_LARGE: 'File too large',
    INVALID_FILE_TYPE: 'Invalid file type',
  },
  
  // Success messages
  SUCCESS: {
    REGISTERED: 'User registered successfully',
    LOGIN: 'Login successful',
    LOGOUT: 'Logged out successfully',
    TOKEN_REFRESHED: 'Token refreshed successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
    POST_CREATED: 'Post created successfully',
    POST_UPDATED: 'Post updated successfully',
    POST_DELETED: 'Post deleted successfully',
    COMMENT_CREATED: 'Comment added successfully',
    COMMENT_UPDATED: 'Comment updated successfully',
    COMMENT_DELETED: 'Comment deleted successfully',
    REPLY_CREATED: 'Reply added successfully',
    REPLY_UPDATED: 'Reply updated successfully',
    REPLY_DELETED: 'Reply deleted successfully',
    LIKED: 'Liked successfully',
    UNLIKED: 'Unliked successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
  },
};