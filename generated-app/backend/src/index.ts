import { createProject, listProjects, getProject, updateProject, deleteProject } from './handlers/projects';
import { createIssue, listIssues, getIssue, updateIssue, deleteIssue, bulkUpdateIssues } from './handlers/issues';
import { createSprint, listSprints, updateSprint } from './handlers/sprints';
import { getBoard, updateBoard } from './handlers/boards';
import { addComment, listComments } from './handlers/comments';
import { search } from './handlers/search';

interface APIGatewayEvent {
  httpMethod: string;
  requestContext?: {
    http?: {
      method: string;
      path: string;
    };
  };
  rawPath?: string;
  path?: string;
  pathParameters?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  body?: string;
  headers?: Record<string, string>;
}

interface RouteMatch {
  params: Record<string, string>;
}

function matchRoute(pattern: string, path: string): RouteMatch | null {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }

  return { params };
}

function parseBody(event: APIGatewayEvent): unknown {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}

function response(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
    },
    body: JSON.stringify(body),
  };
}

export async function handler(event: APIGatewayEvent) {
  const method = event.requestContext?.http?.method || event.httpMethod || 'GET';
  const path = event.requestContext?.http?.path || event.rawPath || event.path || '/';
  const query = event.queryStringParameters || {};
  const body = parseBody(event);

  console.log(`${method} ${path}`, JSON.stringify({ query, bodyKeys: body ? Object.keys(body as any) : [] }));

  try {
    let match: RouteMatch | null;
    let result: { statusCode: number; body: unknown };

    // Projects
    if (method === 'POST' && (match = matchRoute('/projects', path))) {
      result = await createProject(body);
    } else if (method === 'GET' && (match = matchRoute('/projects', path))) {
      result = await listProjects();
    } else if (method === 'GET' && (match = matchRoute('/projects/:id', path))) {
      result = await getProject(match.params.id);
    } else if (method === 'PUT' && (match = matchRoute('/projects/:id', path))) {
      result = await updateProject(match.params.id, body);
    } else if (method === 'DELETE' && (match = matchRoute('/projects/:id', path))) {
      result = await deleteProject(match.params.id);
    }

    // Issues
    else if (method === 'POST' && (match = matchRoute('/projects/:id/issues', path))) {
      result = await createIssue(match.params.id, body);
    } else if (method === 'GET' && (match = matchRoute('/projects/:id/issues', path))) {
      result = await listIssues(match.params.id);
    } else if (method === 'GET' && (match = matchRoute('/issues/:id', path))) {
      result = await getIssue(match.params.id);
    } else if (method === 'PUT' && (match = matchRoute('/issues/:id', path))) {
      result = await updateIssue(match.params.id, body);
    } else if (method === 'DELETE' && (match = matchRoute('/issues/:id', path))) {
      result = await deleteIssue(match.params.id);
    } else if (method === 'PUT' && (match = matchRoute('/issues/bulk', path))) {
      result = await bulkUpdateIssues(body);
    }

    // Comments
    else if (method === 'POST' && (match = matchRoute('/issues/:id/comments', path))) {
      result = await addComment(match.params.id, body);
    } else if (method === 'GET' && (match = matchRoute('/issues/:id/comments', path))) {
      result = await listComments(match.params.id);
    }

    // Sprints
    else if (method === 'POST' && (match = matchRoute('/projects/:id/sprints', path))) {
      result = await createSprint(match.params.id, body);
    } else if (method === 'GET' && (match = matchRoute('/projects/:id/sprints', path))) {
      result = await listSprints(match.params.id);
    } else if (method === 'PUT' && (match = matchRoute('/sprints/:id', path))) {
      result = await updateSprint(match.params.id, body);
    }

    // Boards
    else if (method === 'GET' && (match = matchRoute('/projects/:id/board', path))) {
      result = await getBoard(match.params.id);
    } else if (method === 'PUT' && (match = matchRoute('/boards/:id', path))) {
      result = await updateBoard(match.params.id, body);
    }

    // Search
    else if (method === 'GET' && (match = matchRoute('/search', path))) {
      result = await search(query);
    }

    // Health check
    else if (method === 'GET' && path === '/health') {
      result = { statusCode: 200, body: { status: 'ok', timestamp: new Date().toISOString() } };
    }

    // Not found
    else {
      result = { statusCode: 404, body: { error: { code: 'NOT_FOUND', message: `Route not found: ${method} ${path}` } } };
    }

    return response(result.statusCode, result.body);
  } catch (err: any) {
    console.error('Handler error:', err);

    if (err.name === 'ZodError') {
      return response(400, {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body',
          details: err.errors,
        },
      });
    }

    return response(500, {
      error: {
        code: 'INTERNAL_ERROR',
        message: err.message || 'Internal server error',
      },
    });
  }
}
