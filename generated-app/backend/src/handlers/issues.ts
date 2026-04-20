import { CreateIssueSchema, UpdateIssueSchema, BulkUpdateIssuesSchema } from '@canopy/shared';
import { putItem, getItem, queryItems, deleteItem, nowISO } from '../lib/db';

function stripDynamoKeys(item: Record<string, unknown>) {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, GSI3PK, GSI3SK, ...rest } = item;
  return rest;
}

export async function createIssue(projectId: string, body: unknown) {
  const parsed = CreateIssueSchema.parse({ ...body as any, projectId });

  // Get the project to increment issue counter
  const project = await getItem(`PROJ#${projectId}`, 'METADATA');
  if (!project) {
    return { statusCode: 404, body: { error: { code: 'NOT_FOUND', message: 'Project not found' } } };
  }

  const issueCounter = (project.issueCounter as number || 0) + 1;
  const id = crypto.randomUUID();
  const now = nowISO();
  const key = `${project.key}-${issueCounter}`;
  const reporterId = crypto.randomUUID(); // Placeholder - would come from auth context

  const issue = {
    ...parsed,
    id,
    key,
    status: 'todo',
    reporterId,
    sortOrder: issueCounter * 1000,
    timeSpent: 0,
    createdAt: now,
    updatedAt: now,
  };

  // Save the issue
  await putItem({
    PK: `ISSUE#${id}`,
    SK: 'METADATA',
    GSI1PK: `PROJ#${projectId}`,
    GSI1SK: `ISSUE#${issue.status}#${String(issue.sortOrder).padStart(10, '0')}`,
    GSI2PK: parsed.assigneeId ? `USER#${parsed.assigneeId}` : 'UNASSIGNED',
    GSI2SK: `ISSUE#${now}`,
    GSI3PK: parsed.sprintId ? `SPRINT#${parsed.sprintId}` : 'NOSPRINT',
    GSI3SK: `ISSUE#${String(issue.sortOrder).padStart(10, '0')}`,
    ...issue,
  });

  // Update project issue counter
  await putItem({
    ...project,
    issueCounter,
    updatedAt: now,
  });

  return { statusCode: 201, body: issue };
}

export async function listIssues(projectId: string) {
  const items = await queryItems(`PROJ#${projectId}`, 'ISSUE#', 'GSI1');
  const issues = items.map(stripDynamoKeys);
  return { statusCode: 200, body: issues };
}

export async function getIssue(id: string) {
  const item = await getItem(`ISSUE#${id}`, 'METADATA');
  if (!item) {
    return { statusCode: 404, body: { error: { code: 'NOT_FOUND', message: 'Issue not found' } } };
  }
  return { statusCode: 200, body: stripDynamoKeys(item) };
}

export async function updateIssue(id: string, body: unknown) {
  const parsed = UpdateIssueSchema.parse(body);
  const existing = await getItem(`ISSUE#${id}`, 'METADATA');
  if (!existing) {
    return { statusCode: 404, body: { error: { code: 'NOT_FOUND', message: 'Issue not found' } } };
  }

  const now = nowISO();
  const updated = {
    ...stripDynamoKeys(existing),
    ...parsed,
    updatedAt: now,
  };

  // If status is done-category, set resolvedAt
  if (parsed.status === 'done' && !existing.resolvedAt) {
    (updated as any).resolvedAt = now;
  }

  const projectId = updated.projectId as string;
  const sortOrder = String(updated.sortOrder || 0).padStart(10, '0');
  const status = updated.status || 'todo';

  await putItem({
    PK: `ISSUE#${id}`,
    SK: 'METADATA',
    GSI1PK: `PROJ#${projectId}`,
    GSI1SK: `ISSUE#${status}#${sortOrder}`,
    GSI2PK: updated.assigneeId ? `USER#${updated.assigneeId}` : 'UNASSIGNED',
    GSI2SK: `ISSUE#${now}`,
    GSI3PK: updated.sprintId ? `SPRINT#${updated.sprintId}` : 'NOSPRINT',
    GSI3SK: `ISSUE#${sortOrder}`,
    ...updated,
  });

  return { statusCode: 200, body: updated };
}

export async function deleteIssue(id: string) {
  await deleteItem(`ISSUE#${id}`, 'METADATA');
  return { statusCode: 200, body: { success: true } };
}

export async function bulkUpdateIssues(body: unknown) {
  const parsed = BulkUpdateIssuesSchema.parse(body);
  const results = [];

  for (const issueId of parsed.issueIds) {
    const result = await updateIssue(issueId, parsed.update);
    if (result.statusCode === 200) {
      results.push(result.body);
    }
  }

  return { statusCode: 200, body: results };
}
