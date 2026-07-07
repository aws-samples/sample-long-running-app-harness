import { CreateSprintSchema, UpdateSprintSchema } from '@canopy/shared';
import { putItem, getItem, queryItems, nowISO } from '../lib/db';

function stripDynamoKeys(item: Record<string, unknown>) {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, GSI3PK, GSI3SK, ...rest } = item;
  return rest;
}

export async function createSprint(projectId: string, body: unknown) {
  const parsed = CreateSprintSchema.parse({ ...body as any, projectId });
  const id = crypto.randomUUID();
  const now = nowISO();

  const sprint = {
    ...parsed,
    id,
    status: 'future' as const,
    velocity: 0,
    createdAt: now,
    updatedAt: now,
  };

  await putItem({
    PK: `SPRINT#${id}`,
    SK: 'METADATA',
    GSI1PK: `PROJ#${projectId}`,
    GSI1SK: `SPRINT#${now}`,
    ...sprint,
  });

  return { statusCode: 201, body: sprint };
}

export async function listSprints(projectId: string) {
  const items = await queryItems(`PROJ#${projectId}`, 'SPRINT#', 'GSI1');
  const sprints = items.map(stripDynamoKeys);
  return { statusCode: 200, body: sprints };
}

export async function updateSprint(id: string, body: unknown) {
  const parsed = UpdateSprintSchema.parse(body);
  const existing = await getItem(`SPRINT#${id}`, 'METADATA');
  if (!existing) {
    return { statusCode: 404, body: { error: { code: 'NOT_FOUND', message: 'Sprint not found' } } };
  }

  const now = nowISO();
  const updated = {
    ...stripDynamoKeys(existing),
    ...parsed,
    updatedAt: now,
  };

  // Handle status transitions
  if (parsed.status === 'active' && existing.status !== 'active') {
    (updated as any).startDate = (updated as any).startDate || now;
  }
  if (parsed.status === 'completed' && existing.status !== 'completed') {
    (updated as any).completedAt = now;
  }

  const projectId = updated.projectId as string;

  await putItem({
    PK: `SPRINT#${id}`,
    SK: 'METADATA',
    GSI1PK: `PROJ#${projectId}`,
    GSI1SK: `SPRINT#${existing.createdAt}`,
    ...updated,
  });

  return { statusCode: 200, body: updated };
}
