import { z } from 'zod';
import * as schemas from './schemas';

// Common
export type IssueType = z.infer<typeof schemas.IssueType>;
export type Priority = z.infer<typeof schemas.Priority>;
export type SprintStatus = z.infer<typeof schemas.SprintStatus>;
export type StatusCategory = z.infer<typeof schemas.StatusCategory>;
export type Pagination = z.infer<typeof schemas.PaginationSchema>;
export type ErrorResponse = z.infer<typeof schemas.ErrorResponseSchema>;

// Project
export type CreateProject = z.infer<typeof schemas.CreateProjectSchema>;
export type UpdateProject = z.infer<typeof schemas.UpdateProjectSchema>;
export type Project = z.infer<typeof schemas.ProjectSchema>;

// Issue
export type CreateIssue = z.infer<typeof schemas.CreateIssueSchema>;
export type UpdateIssue = z.infer<typeof schemas.UpdateIssueSchema>;
export type Issue = z.infer<typeof schemas.IssueSchema>;
export type BulkUpdateIssues = z.infer<typeof schemas.BulkUpdateIssuesSchema>;

// Sprint
export type CreateSprint = z.infer<typeof schemas.CreateSprintSchema>;
export type UpdateSprint = z.infer<typeof schemas.UpdateSprintSchema>;
export type Sprint = z.infer<typeof schemas.SprintSchema>;

// Board
export type BoardColumn = z.infer<typeof schemas.BoardColumnSchema>;
export type Board = z.infer<typeof schemas.BoardSchema>;
export type UpdateBoard = z.infer<typeof schemas.UpdateBoardSchema>;

// Comment
export type CreateComment = z.infer<typeof schemas.CreateCommentSchema>;
export type Comment = z.infer<typeof schemas.CommentSchema>;

// Search
export type SearchQuery = z.infer<typeof schemas.SearchQuerySchema>;
export type SearchResult = z.infer<typeof schemas.SearchResultSchema>;
