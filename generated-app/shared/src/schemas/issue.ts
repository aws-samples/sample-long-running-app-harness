import { z } from 'zod';
import { IssueType, Priority, TimestampFields } from './common';

export const CreateIssueSchema = z.object({
  projectId: z.string().uuid(),
  type: IssueType,
  summary: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: Priority.default('Medium'),
  assigneeId: z.string().uuid().optional(),
  epicId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  sprintId: z.string().uuid().optional(),
  storyPoints: z.number().min(0.5).max(100).optional(),
  labels: z.array(z.string()).default([]),
  components: z.array(z.string()).default([]),
  dueDate: z.string().datetime().optional(),
  timeEstimate: z.number().int().min(0).optional(),
});

export const UpdateIssueSchema = CreateIssueSchema.partial().extend({
  status: z.string().optional(),
  sortOrder: z.number().optional(),
  resolvedAt: z.string().datetime().optional(),
  timeSpent: z.number().int().min(0).optional(),
});

export const IssueSchema = CreateIssueSchema.extend({
  id: z.string().uuid(),
  key: z.string(), // e.g. "CAN-123"
  status: z.string().default('todo'),
  reporterId: z.string().uuid(),
  sortOrder: z.number().default(0),
  resolvedAt: z.string().datetime().optional(),
  timeSpent: z.number().int().default(0),
}).merge(TimestampFields);

export const BulkUpdateIssuesSchema = z.object({
  issueIds: z.array(z.string().uuid()).min(1),
  update: UpdateIssueSchema,
});
