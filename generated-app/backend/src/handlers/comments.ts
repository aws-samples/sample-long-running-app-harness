import { CreateCommentSchema } from '@canopy/shared';
import { putItem, queryItems, nowISO } from '../lib/db';

function stripDynamoKeys(item: Record<string, unknown>) {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, GSI3PK, GSI3SK, ...rest } = item;
  return rest;
}

export async function addComment(issueId: string, body: unknown) {
  const parsed = CreateCommentSchema.parse({ ...body as any, issueId });
  const id = crypto.randomUUID();
  const now = nowISO();
  const authorId = crypto.randomUUID(); // Placeholder - would come from auth

  const comment = {
    ...parsed,
    id,
    authorId,
    isEdited: false,
    createdAt: now,
    updatedAt: now,
  };

  await putItem({
    PK: `ISSUE#${issueId}`,
    SK: `COMMENT#${now}#${id}`,
    ...comment,
  });

  return { statusCode: 201, body: comment };
}

export async function listComments(issueId: string) {
  const items = await queryItems(`ISSUE#${issueId}`, 'COMMENT#');
  return { statusCode: 200, body: items.map(stripDynamoKeys) };
}
