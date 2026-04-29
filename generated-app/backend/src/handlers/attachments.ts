import { CreateAttachmentSchema } from '@canopy/shared';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { putItem, getItem, queryItems, deleteItem, nowISO } from '../lib/db';

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const BUCKET_NAME = process.env.ATTACHMENT_BUCKET_NAME || 'canopy-attachments';

function stripDynamoKeys(item: Record<string, unknown>) {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, GSI3PK, GSI3SK, ...rest } = item;
  return rest;
}

export async function createAttachment(issueId: string, body: unknown) {
  const parsed = CreateAttachmentSchema.parse({ ...body as any, issueId });

  // Verify issue exists
  const issue = await getItem(`ISSUE#${issueId}`, 'METADATA');
  if (!issue) {
    return { statusCode: 404, body: { error: { code: 'NOT_FOUND', message: 'Issue not found' } } };
  }

  const id = crypto.randomUUID();
  const now = nowISO();
  const s3Key = `attachments/${issueId}/${id}/${parsed.filename}`;
  const uploaderId = crypto.randomUUID(); // Placeholder - would come from auth context

  const attachment = {
    id,
    issueId,
    filename: parsed.filename,
    contentType: parsed.contentType,
    fileSize: parsed.fileSize,
    s3Key,
    uploaderId,
    createdAt: now,
    updatedAt: now,
  };

  // Save attachment metadata to DynamoDB
  await putItem({
    PK: `ATTACHMENT#${id}`,
    SK: 'METADATA',
    GSI1PK: `ISSUE#${issueId}`,
    GSI1SK: `ATTACHMENT#${now}`,
    ...attachment,
  });

  // Generate pre-signed URL for upload
  const uploadUrl = await getSignedUrl(s3Client, new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    ContentType: parsed.contentType,
  }), { expiresIn: 3600 }); // 1 hour expiry

  return { statusCode: 201, body: { attachment, uploadUrl } };
}

export async function listAttachments(issueId: string) {
  const items = await queryItems(`ISSUE#${issueId}`, 'ATTACHMENT#', 'GSI1');
  const attachments = items.map(stripDynamoKeys);
  return { statusCode: 200, body: attachments };
}

export async function deleteAttachment(attachmentId: string) {
  const item = await getItem(`ATTACHMENT#${attachmentId}`, 'METADATA');
  if (!item) {
    return { statusCode: 404, body: { error: { code: 'NOT_FOUND', message: 'Attachment not found' } } };
  }

  // Delete from S3
  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: item.s3Key as string,
    }));
  } catch (err) {
    console.warn('Failed to delete S3 object:', err);
    // Continue with DynamoDB deletion even if S3 deletion fails
  }

  // Delete from DynamoDB
  await deleteItem(`ATTACHMENT#${attachmentId}`, 'METADATA');

  return { statusCode: 200, body: { success: true } };
}

export async function getDownloadUrl(attachmentId: string) {
  const item = await getItem(`ATTACHMENT#${attachmentId}`, 'METADATA');
  if (!item) {
    return { statusCode: 404, body: { error: { code: 'NOT_FOUND', message: 'Attachment not found' } } };
  }

  const downloadUrl = await getSignedUrl(s3Client, new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: item.s3Key as string,
  }), { expiresIn: 3600 }); // 1 hour expiry

  return { statusCode: 200, body: { downloadUrl } };
}
