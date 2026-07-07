import { CreateProjectSchema, UpdateProjectSchema } from '@canopy/shared';
import { putItem, getItem, queryItems, deleteItem, nowISO } from '../lib/db';

export async function createProject(body: unknown) {
  const parsed = CreateProjectSchema.parse(body);
  const id = crypto.randomUUID();
  const now = nowISO();

  const project = {
    ...parsed,
    id,
    issueCounter: 0,
    isArchived: false,
    settings: {},
    createdAt: now,
    updatedAt: now,
  };

  await putItem({
    PK: `PROJ#${id}`,
    SK: 'METADATA',
    GSI1PK: 'PROJECTS',
    GSI1SK: `PROJ#${now}`,
    ...project,
  });

  return { statusCode: 201, body: project };
}

export async function listProjects() {
  const items = await queryItems('PROJECTS', 'PROJ#', 'GSI1');
  const projects = items.map(stripDynamoKeys);
  return { statusCode: 200, body: projects };
}

export async function getProject(id: string) {
  const item = await getItem(`PROJ#${id}`, 'METADATA');
  if (!item) {
    return { statusCode: 404, body: { error: { code: 'NOT_FOUND', message: 'Project not found' } } };
  }
  return { statusCode: 200, body: stripDynamoKeys(item) };
}

export async function updateProject(id: string, body: unknown) {
  const parsed = UpdateProjectSchema.parse(body);
  const existing = await getItem(`PROJ#${id}`, 'METADATA');
  if (!existing) {
    return { statusCode: 404, body: { error: { code: 'NOT_FOUND', message: 'Project not found' } } };
  }

  const now = nowISO();
  const updated = {
    ...stripDynamoKeys(existing),
    ...parsed,
    updatedAt: now,
  };

  await putItem({
    PK: `PROJ#${id}`,
    SK: 'METADATA',
    GSI1PK: 'PROJECTS',
    GSI1SK: `PROJ#${existing.createdAt}`,
    ...updated,
  });

  return { statusCode: 200, body: updated };
}

export async function deleteProject(id: string) {
  await deleteItem(`PROJ#${id}`, 'METADATA');
  return { statusCode: 200, body: { success: true } };
}

function stripDynamoKeys(item: Record<string, unknown>) {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, GSI3PK, GSI3SK, ...rest } = item;
  return rest;
}
