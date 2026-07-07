import { z } from 'zod';
import { TimestampFields } from './common';

export const CreateCommentSchema = z.object({
  issueId: z.string().uuid(),
  body: z.string().min(1),
});

export const CommentSchema = CreateCommentSchema.extend({
  id: z.string().uuid(),
  authorId: z.string().uuid(),
  isEdited: z.boolean().default(false),
}).merge(TimestampFields);
