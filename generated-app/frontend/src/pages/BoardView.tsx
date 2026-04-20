import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useIssues, useBoard, useUpdateIssue, useProject } from '../hooks/useApi';
import { useApp } from '../context/AppContext';
import { ISSUE_TYPE_COLORS, PRIORITY_COLORS } from '../lib/utils';
import {
  DndContext, closestCenter, type DragEndEvent, DragOverlay, type DragStartEvent,
  PointerSensor, useSensor, useSensors, useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bookmark, Bug, CheckSquare, Zap, ListTodo, Plus, Maximize2 } from 'lucide-react';
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

export default function BoardView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { dispatch } = useApp();
  const { data: project } = useProject(projectId);
  const { data: issues, isLoading } = useIssues(projectId);
  const { data: board } = useBoard(projectId);
  const updateIssue = useUpdateIssue();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState('');

  const columns = board?.columns?.length ? board.columns : DEFAULT_COLUMNS;

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
        i.key?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [issues, quickFilter]);

  const issuesByStatus = useMemo(() => {
    const map: Record<string, Issue[]> = {};
    for (const col of columns) {
      const statusId = col.statusCategory === 'todo' && col.name === 'To Do' ? 'todo' :
                       col.statusCategory === 'in_progress' && col.name === 'In Progress' ? 'in_progress' :
                       col.statusCategory === 'in_progress' && col.name === 'In Review' ? 'in_review' :
                       col.statusCategory === 'done' ? 'done' :
                       col.name.toLowerCase().replace(/\s+/g, '_');
      map[statusId] = filteredIssues.filter(i => i.status === statusId);
    }
    // Also catch any issues whose status doesn't match a column
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

    // Check if dropped on a column
    const targetCol = columns.find(c => getStatusForColumn(c) === targetColumnId);
    if (!targetCol) return;

    const newStatus = getStatusForColumn(targetCol);
    const issue = filteredIssues.find(i => i.id === issueId);
    if (!issue || issue.status === newStatus) return;

    try {
      await updateIssue.mutateAsync({ id: issueId, data: { status: newStatus } });
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
            <div key={i} className="w-72 shrink-0">
              <div className="skeleton h-6 w-24 mb-3" />
              <div className="space-y-3">
                <div className="skeleton h-24 w-full rounded-lg" />
                <div className="skeleton h-24 w-full rounded-lg" />
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
          {project && <p className="text-sm text-text-secondary">{project.name}</p>}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={quickFilter}
            onChange={e => setQuickFilter(e.target.value)}
            placeholder="Filter issues..."
            className="h-8 w-48 px-3 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none"
          />
          <button
            onClick={() => dispatch({ type: 'SET_CREATE_ISSUE', show: true })}
            className="flex items-center gap-1.5 h-8 px-3 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
          >
            <Plus size={14} /> Create
          </button>
        </div>
      </div>

      {/* Board columns */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 220px)' }}>
          {columns.map(col => {
            const statusId = getStatusForColumn(col);
            const columnIssues = issuesByStatus[statusId] || [];

            return (
              <BoardColumn
                key={statusId}
                id={statusId}
                name={col.name}
                issues={columnIssues}
                wipLimit={(col as any).wipLimit}
                onIssueClick={(id) => dispatch({ type: 'SELECT_ISSUE', id })}
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
  id, name, issues, wipLimit, onIssueClick
}: {
  id: string; name: string; issues: Issue[]; wipLimit?: number; onIssueClick: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const overLimit = wipLimit && issues.length > wipLimit;

  return (
    <div className="w-72 shrink-0 flex flex-col">
      {/* Column header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-semibold text-text-primary">{name}</span>
          <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
            overLimit ? 'bg-error/10 text-error font-bold' : 'bg-page-bg text-text-tertiary'
          }`}>
            {issues.length}{wipLimit ? `/${wipLimit}` : ''}
          </span>
        </div>
      </div>

      {/* Column body */}
      <div
        ref={setNodeRef}
        className={`flex-1 bg-page-bg rounded-lg p-2 space-y-2 min-h-[200px] transition-colors ${
          isOver ? 'bg-amber-100/30 ring-2 ring-amber-400/30' : ''
        }`}
      >
        <SortableContext items={issues.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {issues.map(issue => (
            <SortableIssueCard key={issue.id} issue={issue} onClick={() => onIssueClick(issue.id)} />
          ))}
        </SortableContext>

        {issues.length === 0 && !isOver && (
          <div className="text-xs text-text-tertiary text-center py-8">No issues</div>
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <IssueCard issue={issue} onClick={onClick} />
    </div>
  );
}

function IssueCard({ issue, isDragging, onClick }: { issue: Issue; isDragging?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`bg-card-bg rounded-lg p-3 border border-border cursor-pointer transition-all ${
        isDragging ? 'shadow-lg rotate-1 scale-[1.02]' : 'hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <span style={{ color: ISSUE_TYPE_COLORS[issue.type] }}>
          {TYPE_ICONS[issue.type]}
        </span>
        <span className="text-[11px] font-mono text-text-tertiary">{issue.key}</span>
      </div>
      <p className="text-sm font-medium leading-snug line-clamp-2 mb-2">{issue.summary}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {issue.storyPoints && (
            <span className="text-[10px] px-1.5 py-0.5 bg-forest-100 text-forest-700 rounded font-medium">
              {issue.storyPoints} SP
            </span>
          )}
          {issue.labels?.slice(0, 2).map(label => (
            <span key={label} className="text-[10px] px-1.5 py-0.5 bg-page-bg text-text-tertiary rounded">{label}</span>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: PRIORITY_COLORS[issue.priority] || '#8896A6' }}
            title={issue.priority}
          />
        </div>
      </div>
    </div>
  );
}
