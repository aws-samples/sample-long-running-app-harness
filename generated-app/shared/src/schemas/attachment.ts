import { z } from 'zod';
import { TimestampFields } from './common';

export const CreateAttachmentSchema = z.object({
  issueId: z.string().uuid(),
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(255),
  fileSize: z.number().int().min(1).max(50 * 1024 * 1024), // max 50MB
});

export const AttachmentSchema = CreateAttachmentSchema.extend({
  id: z.string().uuid(),
  s3Key: z.string(),
  uploaderId: z.string().uuid(),
  uploadUrl: z.string().optional(),
  downloadUrl: z.string().optional(),
}).merge(TimestampFields);

export const AttachmentUploadResponseSchema = z.object({
  attachment: AttachmentSchema,
  uploadUrl: z.string().url(),
});
