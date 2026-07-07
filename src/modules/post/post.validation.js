// src/modules/post/post.validation.js
import { z } from 'zod';

export const createPostSchema = z.object({
  content: z.string()
    .min(1, 'Content is required')
    .max(5000, 'Content cannot exceed 5000 characters'),
  
  visibility: z.enum(['PUBLIC', 'PRIVATE'])
    .default('PUBLIC')
    .optional(),
});

export const updatePostSchema = z.object({
  content: z.string()
    .min(1, 'Content is required')
    .max(5000, 'Content cannot exceed 5000 characters')
    .optional(),
  
  visibility: z.enum(['PUBLIC', 'PRIVATE'])
    .optional(),
});

export const getPostsQuerySchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(Number)
    .default('1')
    .optional(),
  
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .default('20')
    .optional(),
});