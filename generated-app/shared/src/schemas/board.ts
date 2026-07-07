import { z } from 'zod';
import { StatusCategory, TimestampFields } from './common';

export const BoardColumnSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  statusCategory: StatusCategory,
  sortOrder: z.number(),
  wipLimit: z.number().int().min(0).optional(),
  color: z.string().optional(),
});

export const BoardSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().default('Board'),
  columns: z.array(BoardColumnSchema),
  filterQuery: z.string().optional(),
  swimlaneBy: z.enum(['none', 'assignee', 'epic', 'priority']).default('none'),
}).merge(TimestampFields);

export const UpdateBoardSchema = z.object({
  name: z.string().optional(),
  columns: z.array(BoardColumnSchema).optional(),
  filterQuery: z.string().optional(),
  swimlaneBy: z.enum(['none', 'assignee', 'epic', 'priority']).optional(),
});
