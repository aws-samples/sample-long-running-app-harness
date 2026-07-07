import { SearchQuerySchema } from '@canopy/shared';
import { scanItems } from '../lib/db';

function stripDynamoKeys(item: Record<string, unknown>) {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, GSI3PK, GSI3SK, ...rest } = item;
  return rest;
}

export async function search(query: Record<string, string>) {
  const parsed = SearchQuerySchema.parse({
    q: query.q,
    projectId: query.projectId,
    type: query.type || 'all',
    limit: query.limit ? parseInt(query.limit) : 20,
  });

  const results: { issues: any[]; projects: any[]; total: number } = {
    issues: [],
    projects: [],
    total: 0,
  };

  const searchTerm = parsed.q.toLowerCase();

  if (parsed.type === 'all' || parsed.type === 'issues') {
    // Scan for matching issues
    const items = await scanItems();
    const issues = items
      .filter((item: any) =>
        item.PK?.startsWith('ISSUE#') &&
        item.SK === 'METADATA' &&
        (
          (item.summary as string)?.toLowerCase().includes(searchTerm) ||
          (item.key as string)?.toLowerCase().includes(searchTerm) ||
          (item.description as string)?.toLowerCase().includes(searchTerm)
        ) &&
        (!parsed.projectId || item.projectId === parsed.projectId)
      )
      .slice(0, parsed.limit)
      .map(stripDynamoKeys);

    results.issues = issues;
  }

  if (parsed.type === 'all' || parsed.type === 'projects') {
    const items = await scanItems();
    const projects = items
      .filter((item: any) =>
        item.PK?.startsWith('PROJ#') &&
        item.SK === 'METADATA' &&
        (
          (item.name as string)?.toLowerCase().includes(searchTerm) ||
          (item.key as string)?.toLowerCase().includes(searchTerm)
        )
      )
      .slice(0, parsed.limit)
      .map(stripDynamoKeys);

    results.projects = projects;
  }

  results.total = results.issues.length + results.projects.length;

  return { statusCode: 200, body: results };
}
