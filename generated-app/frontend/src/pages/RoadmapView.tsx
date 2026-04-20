import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useIssues, useProject } from '../hooks/useApi';
import { useApp } from '../context/AppContext';
import { ISSUE_TYPE_COLORS, PRIORITY_COLORS, STATUS_COLORS, formatRelativeDate } from '../lib/utils';
import { Zap, CalendarDays, ChevronDown, ChevronRight, Plus, Bookmark, Bug, CheckSquare, ListTodo } from 'lucide-react';
import type { Issue } from '@canopy/shared';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Epic: <Zap size={14} />,
  Story: <Bookmark size={14} />,
  Bug: <Bug size={14} />,
  Task: <CheckSquare size={14} />,
  'Sub-task': <ListTodo size={14} />,
};

const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
};

export default function RoadmapView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useProject(projectId);
  const { data: issues, isLoading } = useIssues(projectId);
  const { dispatch } = useApp();
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set());

  const epics = useMemo(() => {
    if (!issues) return [];
    return issues.filter(i => i.type === 'Epic');
  }, [issues]);

  const epicData = useMemo(() => {
    if (!issues) return {};
    const data: Record<string, { children: Issue[]; total: number; done: number; storyPoints: number; donePoints: number }> = {};
    for (const epic of epics) {
      const children = issues.filter(i => i.epicId === epic.id);
      data[epic.id] = {
        children,
        total: children.length,
        done: children.filter(i => i.status === 'done').length,
        storyPoints: children.reduce((s, i) => s + (i.storyPoints || 0), 0),
        donePoints: children.filter(i => i.status === 'done').reduce((s, i) => s + (i.storyPoints || 0), 0),
      };
    }
    return data;
  }, [issues, epics]);

  // Issues not linked to any epic
  const unlinkedIssues = useMemo(() => {
    if (!issues) return [];
    return issues.filter(i => i.type !== 'Epic' && !i.epicId);
  }, [issues]);

  function toggleEpic(id: string) {
    setExpandedEpics(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="skeleton h-8 w-48" />
        {[1,2,3].map(i => <div key={i} className="skeleton h-20 w-full rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-xl font-bold">Roadmap</h1>
          {project && <p className="text-sm text-text-secondary">{project.name}</p>}
        </div>
        <button
          onClick={() => dispatch({ type: 'SET_CREATE_ISSUE', show: true })}
          className="flex items-center gap-1.5 h-8 px-3 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium"
        >
          <Plus size={14} /> Create Epic
        </button>
      </div>

      {/* Summary stats */}
      {epics.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-card-bg rounded-lg border border-border px-4 py-3 text-center">
            <div className="text-lg font-display font-bold text-purple-500">{epics.length}</div>
            <div className="text-[10px] text-text-tertiary uppercase">Epics</div>
          </div>
          <div className="bg-card-bg rounded-lg border border-border px-4 py-3 text-center">
            <div className="text-lg font-display font-bold text-text-primary">
              {Object.values(epicData).reduce((s, d) => s + d.total, 0)}
            </div>
            <div className="text-[10px] text-text-tertiary uppercase">Linked Issues</div>
          </div>
          <div className="bg-card-bg rounded-lg border border-border px-4 py-3 text-center">
            <div className="text-lg font-display font-bold text-success">
              {Object.values(epicData).reduce((s, d) => s + d.done, 0)}
            </div>
            <div className="text-[10px] text-text-tertiary uppercase">Completed</div>
          </div>
          <div className="bg-card-bg rounded-lg border border-border px-4 py-3 text-center">
            <div className="text-lg font-display font-bold text-forest-700">
              {Object.values(epicData).reduce((s, d) => s + d.storyPoints, 0)} SP
            </div>
            <div className="text-[10px] text-text-tertiary uppercase">Total Points</div>
          </div>
        </div>
      )}

      {epics.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <Zap size={24} className="text-purple-500" />
          </div>
          <h3 className="font-display text-lg font-semibold mb-2">No epics yet</h3>
          <p className="text-sm text-text-secondary mb-4">Create Epic issues to see them on the roadmap timeline</p>
          <button
            onClick={() => dispatch({ type: 'SET_CREATE_ISSUE', show: true })}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium text-sm"
          >
            Create Epic
          </button>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {epics.map(epic => {
            const data = epicData[epic.id] || { children: [], total: 0, done: 0, storyPoints: 0, donePoints: 0 };
            const progress = data.total > 0 ? (data.done / data.total) * 100 : 0;
            const isExpanded = expandedEpics.has(epic.id);

            return (
              <div key={epic.id} className="bg-card-bg rounded-lg border border-border overflow-hidden">
                {/* Epic header */}
                <div
                  className="p-4 cursor-pointer hover:bg-hover-bg/50 transition-colors"
                  onClick={() => toggleEpic(epic.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <button className="text-text-tertiary">
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <span className="text-purple-500"><Zap size={16} /></span>
                    <span className="text-xs font-mono text-text-tertiary">{epic.key}</span>
                    <span className="font-display font-semibold text-sm flex-1 truncate">{epic.summary}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      {data.storyPoints > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-forest-700/15 text-forest-700 rounded font-medium">
                          {data.donePoints}/{data.storyPoints} SP
                        </span>
                      )}
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        style={{
                          backgroundColor: `${STATUS_COLORS[epic.status] || '#8896A6'}15`,
                          color: STATUS_COLORS[epic.status] || '#8896A6'
                        }}
                      >
                        {STATUS_LABELS[epic.status] || epic.status}
                      </span>
                      {epic.dueDate && (
                        <span className="flex items-center gap-1 text-xs text-text-tertiary">
                          <CalendarDays size={12} />
                          {new Date(epic.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3 pl-7">
                    <div className="flex-1 h-2 bg-page-bg rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-text-tertiary font-mono w-12 text-right">
                      {data.total > 0 ? `${data.done}/${data.total}` : '0'}
                    </span>
                  </div>
                </div>

                {/* Expanded children */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {data.children.length > 0 ? (
                      data.children.map(child => (
                        <div
                          key={child.id}
                          onClick={(e) => { e.stopPropagation(); dispatch({ type: 'SELECT_ISSUE', id: child.id }); }}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-hover-bg transition-colors cursor-pointer border-b border-border/50 last:border-b-0 pl-11"
                        >
                          <span style={{ color: ISSUE_TYPE_COLORS[child.type] }}>{TYPE_ICONS[child.type]}</span>
                          <span className="text-xs font-mono text-text-tertiary w-16 shrink-0">{child.key}</span>
                          <span className={`text-sm flex-1 truncate ${child.status === 'done' ? 'line-through text-text-tertiary' : ''}`}>
                            {child.summary}
                          </span>
                          {child.storyPoints != null && child.storyPoints > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-forest-700/15 text-forest-700 rounded font-medium shrink-0">
                              {child.storyPoints}
                            </span>
                          )}
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                            style={{
                              backgroundColor: `${STATUS_COLORS[child.status] || '#8896A6'}15`,
                              color: STATUS_COLORS[child.status] || '#8896A6'
                            }}
                          >
                            {STATUS_LABELS[child.status] || child.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-center text-xs text-text-tertiary">
                        No issues linked to this epic. Link issues from their detail panel.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Unlinked issues section */}
          {unlinkedIssues.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <h3 className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2">
                Issues without an Epic ({unlinkedIssues.length})
              </h3>
              <p className="text-xs text-text-tertiary mb-3">
                These issues are not linked to any epic. Link them from their detail panel.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
