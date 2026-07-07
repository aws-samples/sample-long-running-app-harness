import { UpdateBoardSchema } from '@canopy/shared';
import { putItem, getItem, nowISO } from '../lib/db';

function stripDynamoKeys(item: Record<string, unknown>) {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, GSI3PK, GSI3SK, ...rest } = item;
  return rest;
}

const DEFAULT_COLUMNS = [
  { id: crypto.randomUUID(), name: 'To Do', statusCategory: 'todo', sortOrder: 0, color: '#8896A6' },
  { id: crypto.randomUUID(), name: 'In Progress', statusCategory: 'in_progress', sortOrder: 1, color: '#2196F3' },
  { id: crypto.randomUUID(), name: 'In Review', statusCategory: 'in_progress', sortOrder: 2, color: '#E9C46A' },
  { id: crypto.randomUUID(), name: 'Done', statusCategory: 'done', sortOrder: 3, color: '#40916C' },
];

export async function getBoard(projectId: string) {
  let item = await getItem(`PROJ#${projectId}`, 'BOARD');

  if (!item) {
    // Create default board for this project
    const now = nowISO();
    const board = {
      id: crypto.randomUUID(),
      projectId,
      name: 'Board',
      columns: DEFAULT_COLUMNS,
      swimlaneBy: 'none' as const,
      createdAt: now,
      updatedAt: now,
    };

    await putItem({
      PK: `PROJ#${projectId}`,
      SK: 'BOARD',
      ...board,
    });

    return { statusCode: 200, body: board };
  }

  return { statusCode: 200, body: stripDynamoKeys(item) };
}

export async function updateBoard(id: string, body: unknown) {
  const parsed = UpdateBoardSchema.parse(body);

  // Find the board - we need to scan or know the project
  // For now, we stored board with PK=PROJ#projectId, SK=BOARD
  // The id in the URL is the board ID, so we need a way to find it
  // Let's also store with PK=BOARD#id for direct access
  const boardItem = await getItem(`BOARD#${id}`, 'METADATA');

  if (!boardItem) {
    return { statusCode: 404, body: { error: { code: 'NOT_FOUND', message: 'Board not found' } } };
  }

  const now = nowISO();
  const updated = {
    ...stripDynamoKeys(boardItem),
    ...parsed,
    updatedAt: now,
  };

  const projectId = updated.projectId as string;

  // Update both access patterns
  await putItem({
    PK: `PROJ#${projectId}`,
    SK: 'BOARD',
    ...updated,
  });

  await putItem({
    PK: `BOARD#${id}`,
    SK: 'METADATA',
    ...updated,
  });

  return { statusCode: 200, body: updated };
}
