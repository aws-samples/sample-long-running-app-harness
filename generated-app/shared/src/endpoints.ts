import { z } from 'zod';
import {
  CreateProjectSchema, UpdateProjectSchema, ProjectSchema,
  CreateIssueSchema, UpdateIssueSchema, IssueSchema, BulkUpdateIssuesSchema,
  CreateSprintSchema, UpdateSprintSchema, SprintSchema,
  BoardSchema, UpdateBoardSchema,
  CreateCommentSchema, CommentSchema,
  SearchQuerySchema, SearchResultSchema,
  PaginationSchema,
} from './schemas';

export const endpoints = {
  // Projects
  createProject:  { method: 'POST',   path: '/projects',              body: CreateProjectSchema,  response: ProjectSchema },
  listProjects:   { method: 'GET',    path: '/projects',              query: PaginationSchema,    response: z.array(ProjectSchema) },
  getProject:     { method: 'GET',    path: '/projects/:id',          response: ProjectSchema },
  updateProject:  { method: 'PUT',    path: '/projects/:id',          body: UpdateProjectSchema,  response: ProjectSchema },
  deleteProject:  { method: 'DELETE', path: '/projects/:id',          response: z.object({ success: z.boolean() }) },

  // Issues
  createIssue:    { method: 'POST',   path: '/projects/:id/issues',   body: CreateIssueSchema,    response: IssueSchema },
  listIssues:     { method: 'GET',    path: '/projects/:id/issues',   query: PaginationSchema,    response: z.array(IssueSchema) },
  getIssue:       { method: 'GET',    path: '/issues/:id',            response: IssueSchema },
  updateIssue:    { method: 'PUT',    path: '/issues/:id',            body: UpdateIssueSchema,    response: IssueSchema },
  deleteIssue:    { method: 'DELETE', path: '/issues/:id',            response: z.object({ success: z.boolean() }) },
  bulkUpdate:     { method: 'PUT',    path: '/issues/bulk',           body: BulkUpdateIssuesSchema, response: z.array(IssueSchema) },

  // Comments
  addComment:     { method: 'POST',   path: '/issues/:id/comments',   body: CreateCommentSchema,  response: CommentSchema },

  // Sprints
  createSprint:   { method: 'POST',   path: '/projects/:id/sprints',  body: CreateSprintSchema,   response: SprintSchema },
  listSprints:    { method: 'GET',    path: '/projects/:id/sprints',  response: z.array(SprintSchema) },
  updateSprint:   { method: 'PUT',    path: '/sprints/:id',           body: UpdateSprintSchema,   response: SprintSchema },

  // Boards
  getBoard:       { method: 'GET',    path: '/projects/:id/board',    response: BoardSchema },
  updateBoard:    { method: 'PUT',    path: '/boards/:id',            body: UpdateBoardSchema,    response: BoardSchema },

  // Search
  search:         { method: 'GET',    path: '/search',                query: SearchQuerySchema,   response: SearchResultSchema },
} as const;
