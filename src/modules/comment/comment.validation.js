// src/modules/comment/comment.validation.js
import { z } from 'zod';

export const createCommentSchema = z.object({
  postId: z.string()
    .uuid('Invalid post ID format'),
  
  content: z.string()
    .min(1, 'Comment content is required')
    .max(1000, 'Comment cannot exceed 1000 characters'),
});

export const updateCommentSchema = z.object({
  content: z.string()
    .min(1, 'Comment content is required')
    .max(1000, 'Comment cannot exceed 1000 characters'),
});