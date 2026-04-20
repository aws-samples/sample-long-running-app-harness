import { useState } from 'react';
import { X, Bookmark, Bug, CheckSquare, Zap, ListTodo, Copy, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useIssue, useUpdateIssue, useDeleteIssue, useComments, useAddComment } from '../hooks/useApi';
import { ISSUE_TYPE_COLORS, PRIORITY_COLORS, formatRelativeDate } from '../lib/utils';
import { toast } from 'sonner';
import type { Priority } from '@canopy/shared';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Epic: <Zap size={16} />,
  Story: <Bookmark size={16} />,
  Bug: <Bug size={16} />,
  Task: <CheckSquare size={16} />,
  'Sub-task': <ListTodo size={16} />,
};

const STATUSES = ['todo', 'in_progress', 'in_review', 'done'];
const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
};

const PRIORITIES: Priority[] = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];

export default function IssueDetailPanel() {
  const { state, dispatch } = useApp();
  const { data: issue, isLoading } = useIssue(state.selectedIssueId || undefined);
  const updateIssue = useUpdateIssue();
  const deleteIssue = useDeleteIssue();
  const { data: comments } = useComments(state.selectedIssueId || undefined);
  const addComment = useAddComment();

  const [commentText, setCommentText] = useState('');
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionText, setDescriptionText] = useState('');

  const close = () => dispatch({ type: 'SELECT_ISSUE', id: null });

  if (!state.selectedIssueId) return null;

  async function handleStatusChange(status: string) {
    if (!issue) return;
    try {
      await updateIssue.mutateAsync({ id: issue.id, data: { status } });
      toast.success(`Status updated to ${STATUS_LABELS[status]}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handlePriorityChange(priority: Priority) {
    if (!issue) return;
    try {
      await updateIssue.mutateAsync({ id: issue.id, data: { priority } });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleSaveSummary() {
    if (!issue || !summaryText.trim()) return;
    try {
      await updateIssue.mutateAsync({ id: issue.id, data: { summary: summaryText.trim() } });
      setEditingSummary(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleSaveDescription() {
    if (!issue) return;
    try {
      await updateIssue.mutateAsync({ id: issue.id, data: { description: descriptionText } });
      setEditingDescription(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!issue || !commentText.trim()) return;
    try {
      await addComment.mutateAsync({ issueId: issue.id, body: commentText.trim() });
      setCommentText('');
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleDelete() {
    if (!issue) return;
    try {
      await deleteIssue.mutateAsync(issue.id);
      toast.success('Issue deleted');
      close();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.origin + `?issue=${issue?.id}`);
    toast.success('Link copied to clipboard');
  }

  return (
    <div className="w-[680px] bg-card-bg border-l border-border shadow-xl animate-slide-in-right flex flex-col shrink-0 overflow-hidden">
      {isLoading ? (
        <div className="p-6 space-y-4">
          <div className="skeleton h-6 w-32" />
          <div className="skeleton h-8 w-full" />
          <div className="skeleton h-24 w-full" />
        </div>
      ) : issue ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span style={{ color: ISSUE_TYPE_COLORS[issue.type] }}>
                {TYPE_ICONS[issue.type]}
              </span>
              <span className="text-sm font-mono text-text-secondary">{issue.key}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleCopyLink} className="p-1.5 rounded hover:bg-hover-bg transition-colors" title="Copy link">
                <Copy size={15} className="text-text-tertiary" />
              </button>
              <button onClick={handleDelete} className="p-1.5 rounded hover:bg-hover-bg transition-colors text-error" title="Delete">
                <Trash2 size={15} />
              </button>
              <button onClick={close} className="p-1.5 rounded hover:bg-hover-bg transition-colors ml-2">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5">
              {/* Summary */}
              {editingSummary ? (
                <input
                  value={summaryText}
                  onChange={e => setSummaryText(e.target.value)}
                  onBlur={handleSaveSummary}
                  onKeyDown={e => e.key === 'Enter' && handleSaveSummary()}
                  className="w-full text-xl font-display font-semibold border-b-2 border-border-focus focus:outline-none mb-4 pb-1 bg-transparent"
                  autoFocus
                />
              ) : (
                <h2
                  className="text-xl font-display font-semibold mb-4 cursor-pointer hover:text-amber-600 transition-colors"
                  onClick={() => {
                    setSummaryText(issue.summary);
                    setEditingSummary(true);
                  }}
                >
                  {issue.summary}
                </h2>
              )}

              {/* Status row */}
              <div className="flex items-center gap-2 mb-6">
                {STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      issue.status === s
                        ? s === 'done' ? 'bg-success text-white' :
                          s === 'in_progress' ? 'bg-info text-white' :
                          s === 'in_review' ? 'bg-warning text-text-primary' :
                          'bg-text-tertiary/20 text-text-primary'
                        : 'bg-page-bg text-text-secondary hover:bg-hover-bg'
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6 text-sm">
                <div>
                  <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">Priority</span>
                  <select
                    value={issue.priority}
                    onChange={e => handlePriorityChange(e.target.value as Priority)}
                    className="block w-full mt-1 h-8 px-2 text-sm border border-border rounded-md bg-card-bg focus:border-border-focus focus:outline-none"
                  >
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">Story Points</span>
                  <div className="mt-1 text-sm">
                    {issue.storyPoints ? (
                      <span className="inline-block px-2 py-0.5 bg-forest-100 text-forest-700 rounded font-medium">{issue.storyPoints}</span>
                    ) : (
                      <span className="text-text-tertiary">None</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">Created</span>
                  <div className="mt-1 text-text-secondary">{formatRelativeDate(issue.createdAt)}</div>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">Updated</span>
                  <div className="mt-1 text-text-secondary">{formatRelativeDate(issue.updatedAt)}</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2">Description</h3>
                {editingDescription ? (
                  <div>
                    <textarea
                      value={descriptionText}
                      onChange={e => setDescriptionText(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button onClick={handleSaveDescription} className="px-3 py-1.5 text-xs bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors">Save</button>
                      <button onClick={() => setEditingDescription(false)} className="px-3 py-1.5 text-xs border border-border rounded-md hover:bg-hover-bg transition-colors">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="text-sm text-text-secondary leading-relaxed cursor-pointer hover:bg-page-bg rounded-md p-2 -mx-2 transition-colors min-h-[60px]"
                    onClick={() => {
                      setDescriptionText(issue.description || '');
                      setEditingDescription(true);
                    }}
                  >
                    {issue.description || <span className="text-text-tertiary italic">Click to add description...</span>}
                  </div>
                )}
              </div>

              {/* Labels */}
              {issue.labels && issue.labels.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2">Labels</h3>
                  <div className="flex gap-1.5 flex-wrap">
                    {issue.labels.map(label => (
                      <span key={label} className="px-2 py-0.5 text-xs rounded-full bg-forest-100 text-forest-700">{label}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div>
                <h3 className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-3">Activity</h3>
                <form onSubmit={handleAddComment} className="mb-4">
                  <textarea
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none resize-none"
                  />
                  {commentText.trim() && (
                    <button
                      type="submit"
                      disabled={addComment.isPending}
                      className="mt-2 px-3 py-1.5 text-xs bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors disabled:opacity-50"
                    >
                      {addComment.isPending ? 'Adding...' : 'Add Comment'}
                    </button>
                  )}
                </form>

                <div className="space-y-3">
                  {comments?.map((comment: any) => (
                    <div key={comment.id} className="bg-page-bg rounded-md p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-full bg-forest-600 text-white flex items-center justify-center text-[10px] font-bold">U</div>
                        <span className="text-xs text-text-tertiary">{formatRelativeDate(comment.createdAt)}</span>
                        {comment.isEdited && <span className="text-[10px] text-text-tertiary">(edited)</span>}
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">{comment.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-6 text-text-tertiary text-sm">Issue not found</div>
      )}
    </div>
  );
}
