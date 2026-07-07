// src/modules/reply/reply.validation.js
import { z } from 'zod';

export const createReplySchema = z.object({
  commentId: z.string()
    .uuid('Invalid comment ID format'),
  
  content: z.string()
    .min(1, 'Reply content is required')
    .max(500, 'Reply cannot exceed 500 characters'),
});

export const updateReplySchema = z.object({
  content: z.string()
    .min(1, 'Reply content is required')
    .max(500, 'Reply cannot exceed 500 characters'),
});