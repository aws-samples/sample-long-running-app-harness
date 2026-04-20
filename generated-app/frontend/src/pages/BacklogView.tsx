import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useIssues, useSprints, useProject, useUpdateIssue, useCreateSprint, useUpdateSprint } from '../hooks/useApi';
import { useApp } from '../context/AppContext';
import { ISSUE_TYPE_COLORS, PRIORITY_COLORS, PRIORITY_ICONS } from '../lib/utils';
import { Bookmark, Bug, CheckSquare, Zap, ListTodo, Plus, ChevronDown, ChevronRight, GripVertical, Play, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Issue, Sprint } from '@canopy/shared';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Epic: <Zap size={14} />,
  Story: <Bookmark size={14} />,
  Bug: <Bug size={14} />,
  Task: <CheckSquare size={14} />,
  'Sub-task': <ListTodo size={14} />,
};

export default function BacklogView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { dispatch } = useApp();
  const { data: project } = useProject(projectId);
  const { data: issues, isLoading } = useIssues(projectId);
  const { data: sprints } = useSprints(projectId);
  const createSprint = useCreateSprint();
  const updateSprint = useUpdateSprint();
  const updateIssue = useUpdateIssue();
  const [quickFilter, setQuickFilter] = useState('');
  const [expandedSprints, setExpandedSprints] = useState<Set<string>>(new Set());

  const filteredIssues = useMemo(() => {
    if (!issues) return [];
    if (!quickFilter) return issues;
    const q = quickFilter.toLowerCase();
    return issues.filter(i =>
      i.summary.toLowerCase().includes(q) ||
      i.key?.toLowerCase().includes(q)
    );
  }, [issues, quickFilter]);

  const sprintIssues = useMemo(() => {
    const map: Record<string, Issue[]> = {};
    if (sprints) {
      for (const sprint of sprints) {
        map[sprint.id] = filteredIssues.filter(i => i.sprintId === sprint.id);
      }
    }
    return map;
  }, [filteredIssues, sprints]);

  const backlogIssues = useMemo(() => {
    const sprintIds = new Set(sprints?.map(s => s.id) || []);
    return filteredIssues.filter(i => !i.sprintId || !sprintIds.has(i.sprintId));
  }, [filteredIssues, sprints]);

  function toggleSprint(id: string) {
    setExpandedSprints(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCreateSprint() {
    if (!projectId) return;
    const sprintCount = (sprints?.length || 0) + 1;
    try {
      const sprint = await createSprint.mutateAsync({
        projectId,
        data: { name: `Sprint ${sprintCount}` },
      });
      setExpandedSprints(prev => new Set([...prev, sprint.id]));
      toast.success('Sprint created');
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleStartSprint(sprint: Sprint) {
    try {
      await updateSprint.mutateAsync({ id: sprint.id, data: { status: 'active' } });
      toast.success('Sprint started');
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleCompleteSprint(sprint: Sprint) {
    try {
      await updateSprint.mutateAsync({ id: sprint.id, data: { status: 'completed' } });
      toast.success('Sprint completed');
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleMoveToSprint(issueId: string, sprintId: string | null) {
    try {
      await updateIssue.mutateAsync({ id: issueId, data: { sprintId: sprintId || undefined } });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  const totalPoints = (items: Issue[]) => items.reduce((s, i) => s + (i.storyPoints || 0), 0);

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="skeleton h-8 w-48" />
        {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-10 w-full rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-xl font-bold">Backlog</h1>
          {project && <p className="text-sm text-text-secondary">{project.name}</p>}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={quickFilter}
            onChange={e => setQuickFilter(e.target.value)}
            placeholder="Filter..."
            className="h-8 w-48 px-3 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none"
          />
          <button
            onClick={handleCreateSprint}
            className="flex items-center gap-1.5 h-8 px-3 text-sm border border-border rounded-md hover:bg-hover-bg transition-colors"
          >
            <Plus size={14} /> Create Sprint
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_CREATE_ISSUE', show: true })}
            className="flex items-center gap-1.5 h-8 px-3 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
          >
            <Plus size={14} /> Create Issue
          </button>
        </div>
      </div>

      {/* Sprint sections */}
      {sprints?.filter(s => s.status !== 'completed').map(sprint => (
        <SprintSection
          key={sprint.id}
          sprint={sprint}
          issues={sprintIssues[sprint.id] || []}
          expanded={expandedSprints.has(sprint.id)}
          onToggle={() => toggleSprint(sprint.id)}
          onStart={() => handleStartSprint(sprint)}
          onComplete={() => handleCompleteSprint(sprint)}
          onIssueClick={(id) => dispatch({ type: 'SELECT_ISSUE', id })}
          onMoveToBacklog={(issueId) => handleMoveToSprint(issueId, null)}
          totalPoints={totalPoints}
        />
      ))}

      {/* Backlog section */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-semibold">Backlog</span>
            <span className="text-xs text-text-tertiary font-mono">{backlogIssues.length} issues</span>
            <span className="text-xs text-text-tertiary">·</span>
            <span className="text-xs text-forest-700 font-medium">{totalPoints(backlogIssues)} SP</span>
          </div>
        </div>

        <div className="space-y-0.5">
          {backlogIssues.map(issue => (
            <IssueRow
              key={issue.id}
              issue={issue}
              onClick={() => dispatch({ type: 'SELECT_ISSUE', id: issue.id })}
              sprints={sprints || []}
              onMoveToSprint={(sprintId) => handleMoveToSprint(issue.id, sprintId)}
            />
          ))}
          {backlogIssues.length === 0 && (
            <div className="text-center py-12 text-text-tertiary text-sm">
              <p>Your backlog is empty</p>
              <button
                onClick={() => dispatch({ type: 'SET_CREATE_ISSUE', show: true })}
                className="mt-2 text-amber-500 hover:underline"
              >
                Create your first issue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SprintSection({
  sprint, issues, expanded, onToggle, onStart, onComplete, onIssueClick, onMoveToBacklog, totalPoints
}: {
  sprint: Sprint; issues: Issue[]; expanded: boolean; onToggle: () => void;
  onStart: () => void; onComplete: () => void; onIssueClick: (id: string) => void;
  onMoveToBacklog: (issueId: string) => void; totalPoints: (issues: Issue[]) => number;
}) {
  const doneCount = issues.filter(i => i.status === 'done').length;

  return (
    <div className="mb-3 bg-card-bg rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-hover-bg transition-colors" onClick={onToggle}>
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown size={16} className="text-text-tertiary" /> : <ChevronRight size={16} className="text-text-tertiary" />}
          <div>
            <span className="font-display text-sm font-semibold">{sprint.name}</span>
            {sprint.status === 'active' && (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-info/10 text-info rounded font-medium">Active</span>
            )}
            <div className="text-xs text-text-tertiary mt-0.5">
              {issues.length} issues · {totalPoints(issues)} SP · {doneCount}/{issues.length} done
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {sprint.status === 'future' && (
            <button onClick={onStart} className="flex items-center gap-1 px-2.5 py-1 text-xs bg-info text-white rounded-md hover:bg-info/90 transition-colors">
              <Play size={12} /> Start
            </button>
          )}
          {sprint.status === 'active' && (
            <button onClick={onComplete} className="flex items-center gap-1 px-2.5 py-1 text-xs bg-success text-white rounded-md hover:bg-success/90 transition-colors">
              <CheckCircle2 size={12} /> Complete
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border">
          {issues.map(issue => (
            <IssueRow
              key={issue.id}
              issue={issue}
              onClick={() => onIssueClick(issue.id)}
              sprints={[]}
              onMoveToSprint={() => onMoveToBacklog(issue.id)}
              moveLabel="Move to Backlog"
            />
          ))}
          {issues.length === 0 && (
            <div className="px-4 py-6 text-center text-text-tertiary text-xs">
              No issues in this sprint. Drag issues here from the backlog.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function IssueRow({
  issue, onClick, sprints, onMoveToSprint, moveLabel
}: {
  issue: Issue; onClick: () => void; sprints: Sprint[];
  onMoveToSprint: (sprintId: string) => void; moveLabel?: string;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-hover-bg transition-colors cursor-pointer border-b border-border/50 last:border-b-0 group"
      onClick={onClick}
    >
      <GripVertical size={14} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-grab" />
      <span style={{ color: ISSUE_TYPE_COLORS[issue.type] }} className="shrink-0">
        {TYPE_ICONS[issue.type]}
      </span>
      <span className="text-xs font-mono text-text-tertiary shrink-0 w-16">{issue.key}</span>
      <span className="text-sm flex-1 truncate">{issue.summary}</span>
      {issue.storyPoints && (
        <span className="text-[10px] px-1.5 py-0.5 bg-forest-100 text-forest-700 rounded font-medium shrink-0">{issue.storyPoints}</span>
      )}
      <span
        className="text-xs shrink-0"
        style={{ color: PRIORITY_COLORS[issue.priority] }}
        title={issue.priority}
      >
        {PRIORITY_ICONS[issue.priority]}
      </span>
      {sprints.length > 0 && (
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-[10px] px-2 py-0.5 border border-border rounded text-text-tertiary hover:bg-hover-bg transition-colors opacity-0 group-hover:opacity-100"
          >
            {moveLabel || '→ Sprint'}
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-card-bg rounded-lg shadow-lg border border-border py-1 z-10 animate-slide-down">
              {sprints.filter(s => s.status !== 'completed').map(s => (
                <button
                  key={s.id}
                  onClick={() => { onMoveToSprint(s.id); setShowMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-hover-bg transition-colors"
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {moveLabel && (
        <button
          onClick={e => { e.stopPropagation(); onMoveToSprint(''); }}
          className="text-[10px] px-2 py-0.5 border border-border rounded text-text-tertiary hover:bg-hover-bg transition-colors opacity-0 group-hover:opacity-100"
        >
          {moveLabel}
        </button>
      )}
    </div>
  );
}
