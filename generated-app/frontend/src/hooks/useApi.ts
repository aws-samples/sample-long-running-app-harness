import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { CreateProject, UpdateProject, CreateIssue, UpdateIssue, CreateSprint, UpdateSprint } from '@canopy/shared';

// ==================== Projects ====================
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: api.listProjects,
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => api.getProject(id!),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProject) => api.createProject(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProject }) => api.updateProject(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['project', id] });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// ==================== Issues ====================
export function useIssues(projectId: string | undefined) {
  return useQuery({
    queryKey: ['issues', projectId],
    queryFn: () => api.listIssues(projectId!),
    enabled: !!projectId,
  });
}

export function useIssue(id: string | undefined) {
  return useQuery({
    queryKey: ['issue', id],
    queryFn: () => api.getIssue(id!),
    enabled: !!id,
  });
}

export function useCreateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: Omit<CreateIssue, 'projectId'> }) =>
      api.createIssue(projectId, data),
    onSuccess: (_, { projectId }) => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      qc.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}

export function useUpdateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIssue }) => api.updateIssue(id, data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['issues'] });
      qc.invalidateQueries({ queryKey: ['issue', result.id] });
    },
  });
}

export function useDeleteIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteIssue(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues'] });
    },
  });
}

// ==================== Sprints ====================
export function useSprints(projectId: string | undefined) {
  return useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => api.listSprints(projectId!),
    enabled: !!projectId,
  });
}

export function useCreateSprint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: Omit<CreateSprint, 'projectId'> }) =>
      api.createSprint(projectId, data),
    onSuccess: (_, { projectId }) => {
      qc.invalidateQueries({ queryKey: ['sprints', projectId] });
    },
  });
}

export function useUpdateSprint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSprint }) => api.updateSprint(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sprints'] });
    },
  });
}

// ==================== Board ====================
export function useBoard(projectId: string | undefined) {
  return useQuery({
    queryKey: ['board', projectId],
    queryFn: () => api.getBoard(projectId!),
    enabled: !!projectId,
  });
}

// ==================== Comments ====================
export function useComments(issueId: string | undefined) {
  return useQuery({
    queryKey: ['comments', issueId],
    queryFn: () => api.listComments(issueId!),
    enabled: !!issueId,
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ issueId, body }: { issueId: string; body: string }) =>
      api.addComment(issueId, { body }),
    onSuccess: (_, { issueId }) => {
      qc.invalidateQueries({ queryKey: ['comments', issueId] });
    },
  });
}

// ==================== Attachments ====================
export function useAttachments(issueId: string | undefined) {
  return useQuery({
    queryKey: ['attachments', issueId],
    queryFn: () => api.listAttachments(issueId!),
    enabled: !!issueId,
  });
}

export function useCreateAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ issueId, data }: { issueId: string; data: { filename: string; contentType: string; fileSize: number } }) =>
      api.createAttachment(issueId, data),
    onSuccess: (_, { issueId }) => {
      qc.invalidateQueries({ queryKey: ['attachments', issueId] });
    },
  });
}

export function useDeleteAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, issueId }: { id: string; issueId: string }) => api.deleteAttachment(id),
    onSuccess: (_, { issueId }) => {
      qc.invalidateQueries({ queryKey: ['attachments', issueId] });
    },
  });
}

export function useDownloadUrl() {
  return useMutation({
    mutationFn: (id: string) => api.getDownloadUrl(id),
  });
}

// ==================== Search ====================
export function useSearch(q: string, projectId?: string) {
  return useQuery({
    queryKey: ['search', q, projectId],
    queryFn: () => api.search(q, projectId),
    enabled: q.length > 0,
  });
}
