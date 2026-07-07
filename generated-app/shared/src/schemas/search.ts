import { z } from 'zod';
import { IssueSchema } from './issue';
import { ProjectSchema } from './project';

export const SearchQuerySchema = z.object({
  q: z.string().min(1),
  projectId: z.string().uuid().optional(),
  type: z.enum(['issues', 'projects', 'all']).default('all'),
  limit: z.number().int().min(1).max(50).default(20),
});

export const SearchResultSchema = z.object({
  issues: z.array(IssueSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  total: z.number(),
});
