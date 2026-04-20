import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand, UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export const TABLE_NAME = process.env.TABLE_NAME || 'canopy-table';

export async function putItem(item: Record<string, unknown>) {
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
  }));
}

export async function getItem(pk: string, sk: string) {
  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
  }));
  return result.Item;
}

export async function queryItems(pk: string, skPrefix?: string, indexName?: string) {
  const keyCondition = skPrefix
    ? '#pk = :pk AND begins_with(#sk, :skPrefix)'
    : '#pk = :pk';

  const pkAttr = indexName ? `${indexName}PK` : 'PK';
  const skAttr = indexName ? `${indexName}SK` : 'SK';

  const params: Record<string, unknown> = {
    TableName: TABLE_NAME,
    KeyConditionExpression: keyCondition,
    ExpressionAttributeNames: {
      '#pk': pkAttr,
      '#sk': skAttr,
    },
    ExpressionAttributeValues: {
      ':pk': pk,
      ...(skPrefix ? { ':skPrefix': skPrefix } : {}),
    },
    ...(indexName ? { IndexName: indexName } : {}),
  };

  const result = await docClient.send(new QueryCommand(params as any));
  return result.Items || [];
}

export async function deleteItem(pk: string, sk: string) {
  await docClient.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
  }));
}

export async function scanItems(filterExpression?: string, expressionValues?: Record<string, unknown>) {
  const params: Record<string, unknown> = {
    TableName: TABLE_NAME,
    ...(filterExpression ? { FilterExpression: filterExpression } : {}),
    ...(expressionValues ? { ExpressionAttributeValues: expressionValues } : {}),
  };

  const result = await docClient.send(new ScanCommand(params as any));
  return result.Items || [];
}

export function nowISO() {
  return new Date().toISOString();
}
