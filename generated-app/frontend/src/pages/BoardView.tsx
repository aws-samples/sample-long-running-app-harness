import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useIssues, useBoard, useUpdateIssue, useProject, useSprints, useCreateIssue } from '../hooks/useApi';
import { useApp } from '../context/AppContext';
import { ISSUE_TYPE_COLORS, PRIORITY_COLORS, PRIORITY_ICONS } from '../lib/utils';
import { MOCK_USERS_MAP } from '../lib/users';
import {
  DndContext, closestCenter, type DragEndEvent, DragOverlay, type DragStartEvent,
  PointerSensor, useSensor, useSensors, useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bookmark, Bug, CheckSquare, Zap, ListTodo, Plus, Filter, User, Calendar, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Issue } from '@canopy/shared';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Epic: <Zap size={13} />,
  Story: <Bookmark size={13} />,
  Bug: <Bug size={13} />,
  Task: <CheckSquare size={13} />,
  'Sub-task': <ListTodo size={13} />,
};

const DEFAULT_COLUMNS = [
  { id: 'todo', name: 'To Do', statusCategory: 'todo' },
  { id: 'in_progress', name: 'In Progress', statusCategory: 'in_progress' },
  { id: 'in_review', name: 'In Review', statusCategory: 'in_progress' },
  { id: 'done', name: 'Done', statusCategory: 'done' },
];

const COLUMN_COLORS: Record<string, string> = {
  todo: '#8896A6',
  in_progress: '#2196F3',
  in_review: '#E9C46A',
  done: '#40916C',
};

type FilterType = 'all' | 'Epic' | 'Story' | 'Bug' | 'Task';
type PriorityFilter = 'all' | 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';

export default function BoardView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { dispatch } = useApp();
  const { data: project } = useProject(projectId);
  const { data: issues, isLoading } = useIssues(projectId);
  const { data: board } = useBoard(projectId);
  const { data: sprints } = useSprints(projectId);
  const updateIssue = useUpdateIssue();
  const createIssue = useCreateIssue();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  const columns = board?.columns?.length ? board.columns : DEFAULT_COLUMNS;
  const activeSprint = sprints?.find(s => s.status === 'active');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const filteredIssues = useMemo(() => {
    if (!issues) return [];
    let filtered = issues;
    if (quickFilter) {
      const q = quickFilter.toLowerCase();
      filtered = filtered.filter(i =>
        i.summary.toLowerCase().includes(q) ||
        i.key?.toLowerCase().includes(q) ||
        i.labels?.some(l => l.toLowerCase().includes(q))
      );
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter(i => i.type === typeFilter);
    }
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(i => i.priority === priorityFilter);
    }
    return filtered;
  }, [issues, quickFilter, typeFilter, priorityFilter]);

  const hasActiveFilters = quickFilter || typeFilter !== 'all' || priorityFilter !== 'all';
  function clearFilters() { setQuickFilter(''); setTypeFilter('all'); setPriorityFilter('all'); }

  const issuesByStatus = useMemo(() => {
    const map: Record<string, Issue[]> = {};
    for (const col of columns) {
      const statusId = getStatusForColumn(col);
      map[statusId] = filteredIssues.filter(i => i.status === statusId);
    }
    const allAssigned = new Set(Object.values(map).flat().map(i => i.id));
    const unmatched = filteredIssues.filter(i => !allAssigned.has(i.id));
    if (unmatched.length && map['todo']) {
      map['todo'] = [...map['todo'], ...unmatched];
    }
    return map;
  }, [filteredIssues, columns]);

  const activeIssue = activeId ? filteredIssues.find(i => i.id === activeId) : null;

  function getStatusForColumn(col: any): string {
    if (col.name === 'To Do') return 'todo';
    if (col.name === 'In Progress') return 'in_progress';
    if (col.name === 'In Review') return 'in_review';
    if (col.name === 'Done') return 'done';
    return col.name.toLowerCase().replace(/\s+/g, '_');
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || !active) return;

    const issueId = active.id as string;
    const targetColumnId = over.id as string;

    const targetCol = columns.find(c => getStatusForColumn(c) === targetColumnId);
    if (!targetCol) return;

    const newStatus = getStatusForColumn(targetCol);
    const issue = filteredIssues.find(i => i.id === issueId);
    if (!issue || issue.status === newStatus) return;

    try {
      const resolvedAt = newStatus === 'done' ? new Date().toISOString() : undefined;
      await updateIssue.mutateAsync({ id: issueId, data: { status: newStatus, resolvedAt } });
      toast.success(`Moved to ${targetCol.name}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="flex gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="w-[280px] shrink-0">
              <div className="skeleton h-6 w-24 mb-3" />
              <div className="space-y-3">
                <div className="skeleton h-28 w-full rounded-lg" />
                <div className="skeleton h-28 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-xl font-bold">Board</h1>
          <div className="flex items-center gap-2 mt-0.5">
            {project && <span className="text-sm text-text-secondary">{project.name}</span>}
            {activeSprint && (
              <span className="text-[10px] px-1.5 py-0.5 bg-info/10 text-info rounded font-medium">
                {activeSprint.name}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={quickFilter}
            onChange={e => setQuickFilter(e.target.value)}
            placeholder="Filter issues..."
            className="h-8 w-48 px-3 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none"
          />
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 h-8 px-3 text-sm border rounded-md transition-colors ${
                hasActiveFilters ? 'border-amber-400 bg-amber-500/10 text-amber-600' : 'border-border hover:bg-hover-bg'
              }`}
            >
              <Filter size={14} /> Filters
              {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
            </button>
            {showFilters && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-card-bg rounded-lg shadow-lg border border-border py-1 z-10 animate-slide-down">
                <div className="px-3 py-1.5 text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Type</div>
                {(['all', 'Epic', 'Story', 'Bug', 'Task'] as FilterType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-hover-bg transition-colors flex items-center gap-2 ${
                      typeFilter === t ? 'bg-selected-bg font-medium' : ''
                    }`}
                  >
                    {t === 'all' ? 'All Types' : (
                      <>
                        <span style={{ color: ISSUE_TYPE_COLORS[t] }}>{TYPE_ICONS[t]}</span>
                        {t}
                      </>
                    )}
                  </button>
                ))}
                <div className="px-3 py-1.5 mt-1 border-t border-border text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Priority</div>
                {(['all', 'Highest', 'High', 'Medium', 'Low', 'Lowest'] as PriorityFilter[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setPriorityFilter(p)}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-hover-bg transition-colors flex items-center gap-2 ${
                      priorityFilter === p ? 'bg-selected-bg font-medium' : ''
                    }`}
                  >
                    {p === 'all' ? 'All Priorities' : (
                      <>
                        <span style={{ color: PRIORITY_COLORS[p] }}>{PRIORITY_ICONS[p]}</span>
                        {p}
                      </>
                    )}
                  </button>
                ))}
                {hasActiveFilters && (
                  <div className="mt-1 pt-1 border-t border-border px-3 py-1.5">
                    <button onClick={() => { clearFilters(); setShowFilters(false); }} className="text-xs text-amber-500 hover:underline">Clear all</button>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_CREATE_ISSUE', show: true })}
            className="flex items-center gap-1.5 h-8 px-3 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium"
          >
            <Plus size={14} /> Create
          </button>
        </div>
      </div>

      {/* Active filter indicator */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mb-3 text-xs text-text-secondary animate-slide-in-up">
          <span>Showing {filteredIssues.length} of {issues?.length || 0} issues</span>
          {typeFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 text-amber-600 rounded-full">
              <span style={{ color: ISSUE_TYPE_COLORS[typeFilter] }}>{TYPE_ICONS[typeFilter]}</span> {typeFilter}
              <button onClick={() => setTypeFilter('all')}><X size={10} /></button>
            </span>
          )}
          {priorityFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 text-amber-600 rounded-full">
              {PRIORITY_ICONS[priorityFilter]} {priorityFilter}
              <button onClick={() => setPriorityFilter('all')}><X size={10} /></button>
            </span>
          )}
          <button onClick={clearFilters} className="text-amber-500 hover:underline ml-1">Clear all</button>
        </div>
      )}

      {/* Board columns */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 240px)' }}>
          {columns.map((col, idx) => {
            const statusId = getStatusForColumn(col);
            const columnIssues = issuesByStatus[statusId] || [];

            return (
              <BoardColumn
                key={statusId}
                id={statusId}
                name={col.name}
                color={COLUMN_COLORS[statusId]}
                issues={columnIssues}
                wipLimit={(col as any).wipLimit}
                onIssueClick={(id) => dispatch({ type: 'SELECT_ISSUE', id })}
                onCreateIssue={() => dispatch({ type: 'SET_CREATE_ISSUE', show: true })}
                animDelay={idx * 50}
                projectId={projectId}
                createIssue={createIssue}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeIssue && <IssueCard issue={activeIssue} isDragging />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function BoardColumn({
  id, name, color, issues, wipLimit, onIssueClick, onCreateIssue, animDelay, projectId, createIssue
}: {
  id: string; name: string; color?: string; issues: Issue[]; wipLimit?: number;
  onIssueClick: (id: string) => void; onCreateIssue: () => void; animDelay: number;
  projectId?: string; createIssue?: any;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const overLimit = wipLimit && issues.length > wipLimit;
  const totalPoints = issues.reduce((s, i) => s + (i.storyPoints || 0), 0);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');

  async function handleQuickAdd() {
    if (!quickAddText.trim() || !projectId || !createIssue) return;
    try {
      await createIssue.mutateAsync({
        projectId,
        data: {
          type: 'Task' as const,
          summary: quickAddText.trim(),
          priority: 'Medium' as const,
          status: id,
          labels: [],
          components: [],
        },
      });
      setQuickAddText('');
      setShowQuickAdd(false);
      toast.success('Issue created');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create issue');
    }
  }

  return (
    <div className="w-[280px] shrink-0 flex flex-col animate-slide-up" style={{ animationDelay: `${animDelay}ms` }}>
      {/* Column header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color || '#8896A6' }} />
          <span className="font-display text-sm font-semibold text-text-primary">{name}</span>
          <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
            overLimit ? 'bg-error/10 text-error font-bold animate-pulse' : 'bg-page-bg text-text-tertiary'
          }`}>
            {issues.length}{wipLimit ? `/${wipLimit}` : ''}
          </span>
          {totalPoints > 0 && (
            <span className="text-[10px] text-text-tertiary font-mono">{totalPoints}sp</span>
          )}
          {overLimit && (
            <span className="text-[9px] text-error font-medium">⚠ WIP</span>
          )}
        </div>
        <button
          onClick={() => setShowQuickAdd(true)}
          className="p-1 rounded hover:bg-hover-bg transition-colors text-text-tertiary hover:text-text-primary"
          title="Quick add issue"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Column body */}
      <div
        ref={setNodeRef}
        className={`flex-1 bg-page-bg rounded-lg p-2 space-y-2 min-h-[200px] transition-all duration-200 ${
          isOver ? 'bg-selected-bg ring-2 ring-amber-400/40 scale-[1.01]' : ''
        }`}
      >
        <SortableContext items={issues.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {issues.map((issue) => (
            <SortableIssueCard key={issue.id} issue={issue} onClick={() => onIssueClick(issue.id)} />
          ))}
        </SortableContext>

        {issues.length === 0 && !isOver && !showQuickAdd && (
          <div className="text-xs text-text-tertiary text-center py-8 opacity-60">
            <p>No issues</p>
            <p className="mt-1">Drag issues here</p>
          </div>
        )}

        {/* Quick add inline */}
        {showQuickAdd && (
          <div className="bg-card-bg rounded-lg p-2.5 border border-amber-400/50 animate-scale-in">
            <textarea
              value={quickAddText}
              onChange={e => setQuickAddText(e.target.value)}
              placeholder="What needs to be done?"
              rows={2}
              className="w-full text-sm border-0 bg-transparent resize-none focus:outline-none placeholder:text-text-tertiary"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleQuickAdd(); }
                if (e.key === 'Escape') { setShowQuickAdd(false); setQuickAddText(''); }
              }}
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[9px] text-text-tertiary">Enter to create · Esc to cancel</span>
              <div className="flex gap-1">
                <button
                  onClick={() => { setShowQuickAdd(false); setQuickAddText(''); }}
                  className="text-[10px] px-2 py-1 text-text-tertiary hover:bg-hover-bg rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleQuickAdd}
                  disabled={!quickAddText.trim()}
                  className="text-[10px] px-2 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors disabled:opacity-40 font-medium"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SortableIssueCard({ issue, onClick }: { issue: Issue; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <IssueCard issue={issue} onClick={onClick} />
    </div>
  );
}

function IssueCard({ issue, isDragging, onClick }: { issue: Issue; isDragging?: boolean; onClick?: () => void }) {
  const assignee = issue.assigneeId ? MOCK_USERS_MAP[issue.assigneeId] : null;
  const isOverdue = issue.dueDate && new Date(issue.dueDate) < new Date() && issue.status !== 'done';
  const isDueSoon = issue.dueDate && !isOverdue && issue.status !== 'done' &&
    (new Date(issue.dueDate).getTime() - new Date().getTime()) < 3 * 24 * 60 * 60 * 1000;

  return (
    <div
      onClick={onClick}
      className={`bg-card-bg rounded-lg p-3 border cursor-pointer transition-all group ${
        isDragging
          ? 'shadow-lg rotate-1 scale-[1.03] border-amber-400'
          : 'border-border hover:shadow-md hover:-translate-y-0.5 hover:border-border-focus/40'
      }`}
    >
      {/* Type + Key + Priority row */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <span style={{ color: ISSUE_TYPE_COLORS[issue.type] }} className="shrink-0">
          {TYPE_ICONS[issue.type]}
        </span>
        <span className="text-[11px] font-mono text-text-tertiary">{issue.key}</span>
        <span className="flex-1" />
        <span
          className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
          style={{
            color: PRIORITY_COLORS[issue.priority] || '#8896A6',
            backgroundColor: `${PRIORITY_COLORS[issue.priority] || '#8896A6'}18`
          }}
          title={issue.priority}
        >
          {PRIORITY_ICONS[issue.priority]}
        </span>
      </div>

      {/* Summary */}
      <p className="text-sm font-medium leading-snug line-clamp-2 mb-2 group-hover:text-text-primary">{issue.summary}</p>

      {/* Labels */}
      {issue.labels && issue.labels.length > 0 && (
        <div className="flex items-center gap-1 mb-2 flex-wrap">
          {issue.labels.slice(0, 3).map(label => (
            <span key={label} className="text-[9px] px-1.5 py-0.5 bg-forest-700/10 text-forest-700 rounded-full truncate max-w-[70px]">
              {label}
            </span>
          ))}
          {issue.labels.length > 3 && (
            <span className="text-[9px] text-text-tertiary">+{issue.labels.length - 3}</span>
          )}
        </div>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {issue.storyPoints != null && issue.storyPoints > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-forest-700/12 text-forest-700 rounded-full font-semibold">
              {issue.storyPoints}
            </span>
          )}
          {issue.dueDate && (
            <span className={`text-[10px] flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
              isOverdue ? 'bg-error/10 text-error font-medium' :
              isDueSoon ? 'bg-warning/10 text-warning font-medium' :
              'text-text-tertiary'
            }`}>
              <Calendar size={9} />
              {new Date(issue.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {assignee ? (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 ring-2 ring-card-bg"
              style={{ backgroundColor: assignee.color }}
              title={assignee.name}
            >
              {assignee.initials}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-page-bg shrink-0" title="Unassigned">
              <User size={11} className="text-text-tertiary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
