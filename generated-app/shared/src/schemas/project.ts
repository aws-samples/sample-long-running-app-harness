import { z } from 'zod';
import { TimestampFields } from './common';

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  key: z.string().min(2).max(10).regex(/^[A-Z]+$/, 'Must be uppercase letters'),
  description: z.string().optional(),
  leadUserId: z.string().uuid().optional(),
  defaultAssigneeId: z.string().uuid().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

export const ProjectSchema = CreateProjectSchema.extend({
  id: z.string().uuid(),
  issueCounter: z.number().int().default(0),
  isArchived: z.boolean().default(false),
  settings: z.record(z.unknown()).default({}),
}).merge(TimestampFields);
