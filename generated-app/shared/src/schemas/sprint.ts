import { z } from 'zod';
import { SprintStatus, TimestampFields } from './common';

export const CreateSprintSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(100),
  goal: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const UpdateSprintSchema = CreateSprintSchema.partial().extend({
  status: SprintStatus.optional(),
});

export const SprintSchema = CreateSprintSchema.extend({
  id: z.string().uuid(),
  status: SprintStatus.default('future'),
  completedAt: z.string().datetime().optional(),
  velocity: z.number().default(0),
}).merge(TimestampFields);
