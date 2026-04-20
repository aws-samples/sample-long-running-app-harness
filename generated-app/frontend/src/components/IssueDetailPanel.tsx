import { useState, useEffect, useRef } from 'react';
import { X, Bookmark, Bug, CheckSquare, Zap, ListTodo, Copy, Trash2, User, Calendar, Tag, Clock, Hash, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useIssue, useUpdateIssue, useDeleteIssue, useComments, useAddComment, useSprints, useIssues } from '../hooks/useApi';
import { ISSUE_TYPE_COLORS, PRIORITY_COLORS, PRIORITY_ICONS, formatRelativeDate, formatDate } from '../lib/utils';
import { MOCK_USERS, MOCK_USERS_MAP, CURRENT_USER } from '../lib/users';
import { toast } from 'sonner';
import type { Priority, IssueType } from '@canopy/shared';

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
const STATUS_COLORS: Record<string, string> = {
  todo: 'bg-text-tertiary/20 text-text-primary',
  in_progress: 'bg-info text-white',
  in_review: 'bg-warning text-text-primary',
  done: 'bg-success text-white',
};

const PRIORITIES: Priority[] = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
const ISSUE_TYPES: IssueType[] = ['Epic', 'Story', 'Bug', 'Task', 'Sub-task'];

const AVAILABLE_LABELS = [
  { name: 'frontend', color: '#2196F3' },
  { name: 'backend', color: '#40916C' },
  { name: 'bug-fix', color: '#BC6C25' },
  { name: 'tech-debt', color: '#9B59B6' },
  { name: 'urgent', color: '#E74C3C' },
  { name: 'documentation', color: '#E9C46A' },
  { name: 'design', color: '#F472B6' },
  { name: 'testing', color: '#8896A6' },
];

export default function IssueDetailPanel() {
  const { state, dispatch } = useApp();
  const { data: issue, isLoading } = useIssue(state.selectedIssueId || undefined);
  const updateIssue = useUpdateIssue();
  const deleteIssue = useDeleteIssue();
  const { data: comments } = useComments(state.selectedIssueId || undefined);
  const addComment = useAddComment();
  const { data: sprints } = useSprints(issue?.projectId);
  const { data: allIssues } = useIssues(issue?.projectId);

  const [commentText, setCommentText] = useState('');
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionText, setDescriptionText] = useState('');
  const [editingStoryPoints, setEditingStoryPoints] = useState(false);
  const [storyPointsText, setStoryPointsText] = useState('');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showLabelsDropdown, setShowLabelsDropdown] = useState(false);
  const [showSprintDropdown, setShowSprintDropdown] = useState(false);
  const [showEpicDropdown, setShowEpicDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
  const panelRef = useRef<HTMLDivElement>(null);

  const close = () => dispatch({ type: 'SELECT_ISSUE', id: null });

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) return;
      // Close dropdowns handled by individual components
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!state.selectedIssueId) return null;

  const assignedUser = issue?.assigneeId ? MOCK_USERS.find(u => u.id === issue.assigneeId) : null;
  const reporterUser = issue?.reporterId ? MOCK_USERS.find(u => u.id === issue.reporterId) : MOCK_USERS[0];
  const epics = allIssues?.filter(i => i.type === 'Epic') || [];
  const linkedEpic = issue?.epicId ? allIssues?.find(i => i.id === issue.epicId) : null;
  const childIssues = issue?.type === 'Epic' ? allIssues?.filter(i => i.epicId === issue.id) || [] : [];
  const subTasks = issue && issue.type !== 'Epic' ? allIssues?.filter(i => i.parentId === issue.id) || [] : [];
  const activeSprints = sprints?.filter(s => s.status !== 'completed') || [];
  const currentSprint = issue?.sprintId ? sprints?.find(s => s.id === issue.sprintId) : null;

  async function handleStatusChange(status: string) {
    if (!issue) return;
    try {
      const resolvedAt = status === 'done' ? new Date().toISOString() : undefined;
      await updateIssue.mutateAsync({ id: issue.id, data: { status, resolvedAt } });
      toast.success(`Status updated to ${STATUS_LABELS[status]}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handlePriorityChange(priority: Priority) {
    if (!issue) return;
    try {
      await updateIssue.mutateAsync({ id: issue.id, data: { priority } });
      toast.success(`Priority set to ${priority}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleTypeChange(type: IssueType) {
    if (!issue) return;
    try {
      await updateIssue.mutateAsync({ id: issue.id, data: { type } });
      setShowTypeDropdown(false);
      toast.success(`Type changed to ${type}`);
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
      toast.success('Description saved');
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleSaveStoryPoints() {
    if (!issue) return;
    try {
      const sp = storyPointsText ? parseFloat(storyPointsText) : undefined;
      await updateIssue.mutateAsync({ id: issue.id, data: { storyPoints: sp } });
      setEditingStoryPoints(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleAssigneeChange(userId: string | null) {
    if (!issue) return;
    try {
      await updateIssue.mutateAsync({ id: issue.id, data: { assigneeId: userId || undefined } });
      setShowAssigneeDropdown(false);
      toast.success(userId ? 'Assignee updated' : 'Assignee removed');
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleToggleLabel(label: string) {
    if (!issue) return;
    const currentLabels = issue.labels || [];
    const newLabels = currentLabels.includes(label)
      ? currentLabels.filter(l => l !== label)
      : [...currentLabels, label];
    try {
      await updateIssue.mutateAsync({ id: issue.id, data: { labels: newLabels } });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleSprintChange(sprintId: string | null) {
    if (!issue) return;
    try {
      await updateIssue.mutateAsync({ id: issue.id, data: { sprintId: sprintId || undefined } });
      setShowSprintDropdown(false);
      toast.success(sprintId ? 'Moved to sprint' : 'Removed from sprint');
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleEpicChange(epicId: string | null) {
    if (!issue) return;
    try {
      await updateIssue.mutateAsync({ id: issue.id, data: { epicId: epicId || undefined } });
      setShowEpicDropdown(false);
      toast.success(epicId ? 'Linked to epic' : 'Unlinked from epic');
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
      toast.success('Comment added');
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
    <div ref={panelRef} className="w-[680px] bg-card-bg border-l border-border shadow-xl animate-slide-in-right flex flex-col shrink-0 overflow-hidden">
      {isLoading ? (
        <div className="p-6 space-y-4">
          <div className="skeleton h-6 w-32" />
          <div className="skeleton h-8 w-full" />
          <div className="skeleton h-4 w-48" />
          <div className="skeleton h-24 w-full" />
        </div>
      ) : issue ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              {/* Type selector */}
              <div className="relative">
                <button
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="flex items-center gap-1 p-1 rounded hover:bg-hover-bg transition-colors"
                  style={{ color: ISSUE_TYPE_COLORS[issue.type] }}
                >
                  {TYPE_ICONS[issue.type]}
                  <ChevronDown size={10} />
                </button>
                {showTypeDropdown && (
                  <div className="absolute left-0 top-full mt-1 w-36 bg-card-bg rounded-lg shadow-lg border border-border py-1 z-20 animate-slide-down">
                    {ISSUE_TYPES.map(t => (
                      <button
                        key={t}
                        onClick={() => handleTypeChange(t)}
                        className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 hover:bg-hover-bg transition-colors ${issue.type === t ? 'bg-selected-bg' : ''}`}
                      >
                        <span style={{ color: ISSUE_TYPE_COLORS[t] }}>{TYPE_ICONS[t]}</span>
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-sm font-mono text-text-secondary">{issue.key}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleCopyLink} className="p-1.5 rounded hover:bg-hover-bg transition-colors" title="Copy link">
                <Copy size={15} className="text-text-tertiary" />
              </button>
              <button onClick={handleDelete} className="p-1.5 rounded hover:bg-hover-bg transition-colors text-error" title="Delete issue">
                <Trash2 size={15} />
              </button>
              <button onClick={close} className="p-1.5 rounded hover:bg-hover-bg transition-colors ml-2">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex">
              {/* Main content area */}
              <div className="flex-1 p-5 min-w-0">
                {/* Summary */}
                {editingSummary ? (
                  <input
                    value={summaryText}
                    onChange={e => setSummaryText(e.target.value)}
                    onBlur={handleSaveSummary}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveSummary(); if (e.key === 'Escape') setEditingSummary(false); }}
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
                    title="Click to edit"
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
                        issue.status === s ? STATUS_COLORS[s] : 'bg-page-bg text-text-secondary hover:bg-hover-bg'
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
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
                        className="w-full px-3 py-2 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none resize-y bg-card-bg"
                        autoFocus
                        placeholder="Add details, context, or acceptance criteria... (Markdown supported)"
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={handleSaveDescription} className="px-3 py-1.5 text-xs bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium">Save</button>
                        <button onClick={() => setEditingDescription(false)} className="px-3 py-1.5 text-xs border border-border rounded-md hover:bg-hover-bg transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="text-sm text-text-secondary leading-relaxed cursor-pointer hover:bg-page-bg rounded-md p-2 -mx-2 transition-colors min-h-[60px] whitespace-pre-wrap"
                      onClick={() => {
                        setDescriptionText(issue.description || '');
                        setEditingDescription(true);
                      }}
                      title="Click to edit"
                    >
                      {issue.description || <span className="text-text-tertiary italic">Click to add description...</span>}
                    </div>
                  )}
                </div>

                {/* Child issues section (for Epics) */}
                {issue.type === 'Epic' && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
                        Child Issues ({childIssues.length})
                      </h3>
                      {childIssues.length > 0 && (
                        <span className="text-[10px] text-forest-700 bg-forest-700/10 px-1.5 py-0.5 rounded font-medium">
                          {childIssues.filter(i => i.status === 'done').reduce((s, i) => s + (i.storyPoints || 0), 0)}/
                          {childIssues.reduce((s, i) => s + (i.storyPoints || 0), 0)} SP
                        </span>
                      )}
                    </div>
                    {childIssues.length > 0 && (
                      <div className="mb-2">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="flex-1 h-2 bg-page-bg rounded-full overflow-hidden">
                            <div
                              className="h-full bg-success rounded-full transition-all"
                              style={{ width: `${(childIssues.filter(i => i.status === 'done').length / childIssues.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-text-tertiary">
                            {childIssues.filter(i => i.status === 'done').length}/{childIssues.length}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="space-y-1">
                      {childIssues.map(child => (
                        <button
                          key={child.id}
                          onClick={() => dispatch({ type: 'SELECT_ISSUE', id: child.id })}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-hover-bg transition-colors text-left"
                        >
                          <span style={{ color: ISSUE_TYPE_COLORS[child.type] }}>{TYPE_ICONS[child.type]}</span>
                          <span className="text-xs font-mono text-text-tertiary">{child.key}</span>
                          <span className={`flex-1 truncate ${child.status === 'done' ? 'line-through text-text-tertiary' : ''}`}>{child.summary}</span>
                          {child.storyPoints != null && child.storyPoints > 0 && (
                            <span className="text-[9px] px-1 py-0.5 bg-forest-700/10 text-forest-700 rounded-full font-medium shrink-0">{child.storyPoints}</span>
                          )}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[child.status] || 'bg-page-bg text-text-tertiary'}`}>
                            {STATUS_LABELS[child.status] || child.status}
                          </span>
                        </button>
                      ))}
                    </div>
                    {childIssues.length === 0 && (
                      <p className="text-xs text-text-tertiary italic">No linked child issues. Link issues to this epic from their detail panel.</p>
                    )}
                  </div>
                )}

                {/* Sub-tasks section (for non-Epic issues) */}
                {issue.type !== 'Epic' && subTasks.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2">
                      Sub-tasks ({subTasks.length})
                    </h3>
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="flex-1 h-2 bg-page-bg rounded-full overflow-hidden">
                          <div
                            className="h-full bg-success rounded-full transition-all"
                            style={{ width: `${(subTasks.filter(i => i.status === 'done').length / subTasks.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-tertiary">
                          {subTasks.filter(i => i.status === 'done').length}/{subTasks.length}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {subTasks.map(st => (
                        <button
                          key={st.id}
                          onClick={() => dispatch({ type: 'SELECT_ISSUE', id: st.id })}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-hover-bg transition-colors text-left"
                        >
                          <span style={{ color: ISSUE_TYPE_COLORS[st.type] }}>{TYPE_ICONS[st.type]}</span>
                          <span className="text-xs font-mono text-text-tertiary">{st.key}</span>
                          <span className={`flex-1 truncate ${st.status === 'done' ? 'line-through text-text-tertiary' : ''}`}>{st.summary}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Activity section */}
                <div>
                  <div className="flex items-center gap-4 border-b border-border mb-3">
                    <button
                      onClick={() => setActiveTab('comments')}
                      className={`text-[11px] font-medium uppercase tracking-wider pb-2 border-b-2 transition-colors ${
                        activeTab === 'comments' ? 'border-amber-500 text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary'
                      }`}
                    >
                      Comments
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`text-[11px] font-medium uppercase tracking-wider pb-2 border-b-2 transition-colors ${
                        activeTab === 'history' ? 'border-amber-500 text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary'
                      }`}
                    >
                      History
                    </button>
                  </div>

                  {activeTab === 'comments' && (
                    <>
                      <form onSubmit={handleAddComment} className="mb-4">
                        <textarea
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          placeholder="Add a comment..."
                          rows={3}
                          className="w-full px-3 py-2 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none resize-none bg-card-bg"
                        />
                        {commentText.trim() && (
                          <button
                            type="submit"
                            disabled={addComment.isPending}
                            className="mt-2 px-3 py-1.5 text-xs bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors disabled:opacity-50 font-medium"
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
                              <span className="text-xs font-medium text-text-primary">User</span>
                              <span className="text-xs text-text-tertiary">{formatRelativeDate(comment.createdAt)}</span>
                              {comment.isEdited && <span className="text-[10px] text-text-tertiary italic">(edited)</span>}
                            </div>
                            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{comment.body}</p>
                          </div>
                        ))}
                        {(!comments || comments.length === 0) && (
                          <p className="text-xs text-text-tertiary italic text-center py-4">No comments yet</p>
                        )}
                      </div>
                    </>
                  )}

                  {activeTab === 'history' && (
                    <div className="space-y-2">
                      <div className="flex items-start gap-3 text-xs text-text-tertiary py-2">
                        <div className="w-5 h-5 rounded-full bg-success/20 text-success flex items-center justify-center mt-0.5">✓</div>
                        <div>
                          <span className="text-text-primary font-medium">Issue created</span>
                          <p className="mt-0.5">{formatRelativeDate(issue.createdAt)}</p>
                        </div>
                      </div>
                      {issue.resolvedAt && (
                        <div className="flex items-start gap-3 text-xs text-text-tertiary py-2">
                          <div className="w-5 h-5 rounded-full bg-success/20 text-success flex items-center justify-center mt-0.5">✓</div>
                          <div>
                            <span className="text-text-primary font-medium">Issue resolved</span>
                            <p className="mt-0.5">{formatRelativeDate(issue.resolvedAt)}</p>
                          </div>
                        </div>
                      )}
                      {issue.updatedAt !== issue.createdAt && (
                        <div className="flex items-start gap-3 text-xs text-text-tertiary py-2">
                          <div className="w-5 h-5 rounded-full bg-info/20 text-info flex items-center justify-center mt-0.5">✎</div>
                          <div>
                            <span className="text-text-primary font-medium">Last updated</span>
                            <p className="mt-0.5">{formatRelativeDate(issue.updatedAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right sidebar */}
              <div className="w-[200px] p-4 border-l border-border bg-page-bg/50 space-y-4 shrink-0">
                {/* Assignee */}
                <div className="relative">
                  <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Assignee</span>
                  <button
                    onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                    className="w-full flex items-center gap-2 h-8 px-2 text-sm border border-border rounded-md bg-card-bg hover:bg-hover-bg transition-colors text-left"
                  >
                    {assignedUser ? (
                      <>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0" style={{ backgroundColor: assignedUser.color }}>
                          {assignedUser.initials}
                        </div>
                        <span className="truncate">{assignedUser.name}</span>
                      </>
                    ) : (
                      <>
                        <User size={14} className="text-text-tertiary shrink-0" />
                        <span className="text-text-tertiary">Unassigned</span>
                      </>
                    )}
                  </button>
                  {showAssigneeDropdown && (
                    <div className="absolute left-0 top-full mt-1 w-full bg-card-bg rounded-lg shadow-lg border border-border py-1 z-20 animate-slide-down max-h-48 overflow-y-auto">
                      <button
                        onClick={() => handleAssigneeChange(null)}
                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-hover-bg transition-colors text-text-tertiary"
                      >
                        Unassigned
                      </button>
                      {MOCK_USERS.map(user => (
                        <button
                          key={user.id}
                          onClick={() => handleAssigneeChange(user.id)}
                          className={`w-full text-left px-3 py-1.5 text-sm hover:bg-hover-bg transition-colors flex items-center gap-2 ${
                            issue.assigneeId === user.id ? 'bg-selected-bg' : ''
                          }`}
                        >
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: user.color }}>
                            {user.initials}
                          </div>
                          {user.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reporter */}
                <div>
                  <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Reporter</span>
                  <div className="flex items-center gap-2 h-8 px-2 text-sm">
                    {reporterUser && (
                      <>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0" style={{ backgroundColor: reporterUser.color }}>
                          {reporterUser.initials}
                        </div>
                        <span className="truncate text-text-secondary">{reporterUser.name}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Priority</span>
                  <select
                    value={issue.priority}
                    onChange={e => handlePriorityChange(e.target.value as Priority)}
                    className="w-full h-8 px-2 text-sm border border-border rounded-md bg-card-bg focus:border-border-focus focus:outline-none"
                  >
                    {PRIORITIES.map(p => (
                      <option key={p} value={p}>{PRIORITY_ICONS[p]} {p}</option>
                    ))}
                  </select>
                </div>

                {/* Story Points */}
                <div>
                  <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Story Points</span>
                  {editingStoryPoints ? (
                    <input
                      type="number"
                      value={storyPointsText}
                      onChange={e => setStoryPointsText(e.target.value)}
                      onBlur={handleSaveStoryPoints}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveStoryPoints(); if (e.key === 'Escape') setEditingStoryPoints(false); }}
                      min="0.5"
                      max="100"
                      step="0.5"
                      className="w-full h-8 px-2 text-sm border border-border-focus rounded-md bg-card-bg focus:outline-none"
                      autoFocus
                      placeholder="Enter points"
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setStoryPointsText(issue.storyPoints?.toString() || '');
                        setEditingStoryPoints(true);
                      }}
                      className="w-full h-8 px-2 text-sm border border-border rounded-md bg-card-bg hover:bg-hover-bg transition-colors text-left flex items-center gap-1"
                    >
                      <Hash size={12} className="text-text-tertiary" />
                      {issue.storyPoints ? (
                        <span className="text-forest-700 font-medium">{issue.storyPoints} SP</span>
                      ) : (
                        <span className="text-text-tertiary">None</span>
                      )}
                    </button>
                  )}
                </div>

                {/* Sprint */}
                <div className="relative">
                  <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Sprint</span>
                  <button
                    onClick={() => setShowSprintDropdown(!showSprintDropdown)}
                    className="w-full h-8 px-2 text-sm border border-border rounded-md bg-card-bg hover:bg-hover-bg transition-colors text-left flex items-center gap-1 truncate"
                  >
                    <Clock size={12} className="text-text-tertiary shrink-0" />
                    <span className={currentSprint ? '' : 'text-text-tertiary'}>
                      {currentSprint ? currentSprint.name : 'None'}
                    </span>
                  </button>
                  {showSprintDropdown && (
                    <div className="absolute left-0 top-full mt-1 w-full bg-card-bg rounded-lg shadow-lg border border-border py-1 z-20 animate-slide-down max-h-48 overflow-y-auto">
                      <button
                        onClick={() => handleSprintChange(null)}
                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-hover-bg transition-colors text-text-tertiary"
                      >
                        None
                      </button>
                      {activeSprints.map(s => (
                        <button
                          key={s.id}
                          onClick={() => handleSprintChange(s.id)}
                          className={`w-full text-left px-3 py-1.5 text-sm hover:bg-hover-bg transition-colors flex items-center gap-2 ${
                            issue.sprintId === s.id ? 'bg-selected-bg' : ''
                          }`}
                        >
                          {s.name}
                          {s.status === 'active' && <span className="text-[9px] px-1 py-0.5 bg-info/10 text-info rounded">Active</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Epic link (for non-epic issues) */}
                {issue.type !== 'Epic' && (
                  <div className="relative">
                    <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Epic</span>
                    <button
                      onClick={() => setShowEpicDropdown(!showEpicDropdown)}
                      className="w-full h-8 px-2 text-sm border border-border rounded-md bg-card-bg hover:bg-hover-bg transition-colors text-left flex items-center gap-1 truncate"
                    >
                      <Zap size={12} className="text-purple-500 shrink-0" />
                      <span className={linkedEpic ? '' : 'text-text-tertiary'}>
                        {linkedEpic ? linkedEpic.summary : 'None'}
                      </span>
                    </button>
                    {showEpicDropdown && (
                      <div className="absolute left-0 top-full mt-1 w-56 bg-card-bg rounded-lg shadow-lg border border-border py-1 z-20 animate-slide-down max-h-48 overflow-y-auto">
                        <button
                          onClick={() => handleEpicChange(null)}
                          className="w-full text-left px-3 py-1.5 text-sm hover:bg-hover-bg transition-colors text-text-tertiary"
                        >
                          None
                        </button>
                        {epics.map(epic => (
                          <button
                            key={epic.id}
                            onClick={() => handleEpicChange(epic.id)}
                            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-hover-bg transition-colors flex items-center gap-2 ${
                              issue.epicId === epic.id ? 'bg-selected-bg' : ''
                            }`}
                          >
                            <Zap size={12} className="text-purple-500 shrink-0" />
                            <span className="truncate">{epic.key} – {epic.summary}</span>
                          </button>
                        ))}
                        {epics.length === 0 && (
                          <p className="px-3 py-2 text-xs text-text-tertiary">No epics in this project</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Labels */}
                <div className="relative">
                  <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Labels</span>
                  <button
                    onClick={() => setShowLabelsDropdown(!showLabelsDropdown)}
                    className="w-full min-h-8 px-2 py-1 text-sm border border-border rounded-md bg-card-bg hover:bg-hover-bg transition-colors text-left flex items-center gap-1 flex-wrap"
                  >
                    <Tag size={12} className="text-text-tertiary shrink-0" />
                    {issue.labels && issue.labels.length > 0 ? (
                      issue.labels.map(label => {
                        const labelInfo = AVAILABLE_LABELS.find(l => l.name === label);
                        return (
                          <span key={label} className="px-1.5 py-0.5 text-[10px] rounded-full font-medium"
                            style={{
                              backgroundColor: `${labelInfo?.color || '#8896A6'}22`,
                              color: labelInfo?.color || '#8896A6'
                            }}
                          >
                            {label}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-text-tertiary">None</span>
                    )}
                  </button>
                  {showLabelsDropdown && (
                    <div className="absolute left-0 top-full mt-1 w-48 bg-card-bg rounded-lg shadow-lg border border-border py-1 z-20 animate-slide-down max-h-56 overflow-y-auto">
                      {AVAILABLE_LABELS.map(label => {
                        const isSelected = issue.labels?.includes(label.name);
                        return (
                          <button
                            key={label.name}
                            onClick={() => handleToggleLabel(label.name)}
                            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-hover-bg transition-colors flex items-center gap-2 ${
                              isSelected ? 'bg-selected-bg' : ''
                            }`}
                          >
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: label.color }} />
                            <span className="flex-1">{label.name}</span>
                            {isSelected && <span className="text-amber-500">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Due Date</span>
                  <div className="relative">
                    <input
                      type="date"
                      value={issue.dueDate ? new Date(issue.dueDate).toISOString().slice(0, 10) : ''}
                      onChange={async (e) => {
                        try {
                          const dueDate = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                          await updateIssue.mutateAsync({ id: issue.id, data: { dueDate } });
                          toast.success('Due date updated');
                        } catch (err: any) { toast.error(err.message); }
                      }}
                      className={`w-full h-8 px-2 text-sm border rounded-md bg-card-bg focus:border-border-focus focus:outline-none ${
                        issue.dueDate && new Date(issue.dueDate) < new Date() && issue.status !== 'done'
                          ? 'border-error text-error'
                          : 'border-border'
                      }`}
                    />
                    {issue.dueDate && new Date(issue.dueDate) < new Date() && issue.status !== 'done' && (
                      <span className="text-[9px] text-error mt-0.5 block">Overdue</span>
                    )}
                  </div>
                </div>

                {/* Time Tracking */}
                <div>
                  <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Time Tracking</span>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-text-tertiary w-16">Estimate</span>
                      <input
                        type="text"
                        defaultValue={issue.timeEstimate ? `${Math.floor(issue.timeEstimate / 60)}h ${issue.timeEstimate % 60}m` : ''}
                        placeholder="e.g. 2h 30m"
                        onBlur={async (e) => {
                          const val = e.target.value.trim();
                          if (!val) return;
                          const hours = (val.match(/(\d+)h/) || [])[1] || '0';
                          const mins = (val.match(/(\d+)m/) || [])[1] || '0';
                          const totalMins = parseInt(hours) * 60 + parseInt(mins);
                          if (totalMins > 0) {
                            try {
                              await updateIssue.mutateAsync({ id: issue.id, data: { timeEstimate: totalMins } });
                              toast.success('Time estimate updated');
                            } catch (err: any) { toast.error(err.message); }
                          }
                        }}
                        className="flex-1 h-7 px-2 text-xs border border-border rounded-md bg-card-bg focus:border-border-focus focus:outline-none font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-text-tertiary w-16">Logged</span>
                      <span className="text-xs font-mono text-text-secondary">
                        {issue.timeSpent ? `${Math.floor(issue.timeSpent / 60)}h ${issue.timeSpent % 60}m` : '0h'}
                      </span>
                    </div>
                    {issue.timeEstimate && issue.timeEstimate > 0 && (
                      <div className="h-1.5 bg-page-bg rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            (issue.timeSpent || 0) > issue.timeEstimate ? 'bg-error' : 'bg-info'
                          }`}
                          style={{ width: `${Math.min(((issue.timeSpent || 0) / issue.timeEstimate) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-text-tertiary">Created</span>
                    <span className="text-text-secondary">{formatRelativeDate(issue.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-text-tertiary">Updated</span>
                    <span className="text-text-secondary">{formatRelativeDate(issue.updatedAt)}</span>
                  </div>
                  {issue.resolvedAt && (
                    <div className="flex justify-between text-[10px]">
                      <span className="text-text-tertiary">Resolved</span>
                      <span className="text-text-secondary">{formatRelativeDate(issue.resolvedAt)}</span>
                    </div>
                  )}
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
