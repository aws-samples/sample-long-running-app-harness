import type {
  Project, CreateProject, UpdateProject,
  Issue, CreateIssue, UpdateIssue,
  Sprint, CreateSprint, UpdateSprint,
  Board, UpdateBoard,
  SearchResult,
} from '@canopy/shared';

const API_URL = import.meta.env.VITE_API_URL || '';

export const isApiConfigured = (): boolean => !!API_URL;

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_URL) {
    throw new Error('API not configured. Set VITE_API_URL environment variable.');
  }

  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new ApiError(res.status, body?.error?.message || `Request failed: ${res.status}`, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Projects
  listProjects: () => request<Project[]>('/projects'),
  getProject: (id: string) => request<Project>(`/projects/${id}`),
  createProject: (data: CreateProject) => request<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateProject: (id: string, data: UpdateProject) => request<Project>(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteProject: (id: string) => request<{ success: boolean }>(`/projects/${id}`, {
    method: 'DELETE',
  }),

  // Issues
  listIssues: (projectId: string) => request<Issue[]>(`/projects/${projectId}/issues`),
  getIssue: (id: string) => request<Issue>(`/issues/${id}`),
  createIssue: (projectId: string, data: Omit<CreateIssue, 'projectId'>) =>
    request<Issue>(`/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateIssue: (id: string, data: UpdateIssue) => request<Issue>(`/issues/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteIssue: (id: string) => request<{ success: boolean }>(`/issues/${id}`, {
    method: 'DELETE',
  }),
  bulkUpdateIssues: (data: { issueIds: string[]; update: UpdateIssue }) =>
    request<Issue[]>('/issues/bulk', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Comments
  addComment: (issueId: string, data: { body: string }) =>
    request<any>(`/issues/${issueId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  listComments: (issueId: string) => request<any[]>(`/issues/${issueId}/comments`),

  // Sprints
  listSprints: (projectId: string) => request<Sprint[]>(`/projects/${projectId}/sprints`),
  createSprint: (projectId: string, data: Omit<CreateSprint, 'projectId'>) =>
    request<Sprint>(`/projects/${projectId}/sprints`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSprint: (id: string, data: UpdateSprint) => request<Sprint>(`/sprints/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Boards
  getBoard: (projectId: string) => request<Board>(`/projects/${projectId}/board`),
  updateBoard: (id: string, data: UpdateBoard) => request<Board>(`/boards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Search
  search: (q: string, projectId?: string) => {
    const qs = new URLSearchParams({ q });
    if (projectId) qs.set('projectId', projectId);
    return request<SearchResult>(`/search?${qs.toString()}`);
  },
};

export { ApiError };
export default api;
