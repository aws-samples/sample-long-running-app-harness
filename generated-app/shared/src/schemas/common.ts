import { z } from 'zod';

export const IssueType = z.enum(['Epic', 'Story', 'Bug', 'Task', 'Sub-task']);
export const Priority = z.enum(['Highest', 'High', 'Medium', 'Low', 'Lowest']);
export const SprintStatus = z.enum(['future', 'active', 'completed']);
export const StatusCategory = z.enum(['todo', 'in_progress', 'done']);
export const UserRole = z.enum(['admin', 'member', 'viewer']);

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    hasMore: z.boolean(),
  });

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
  }),
});

export const TimestampFields = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
