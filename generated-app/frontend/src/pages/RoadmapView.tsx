import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useIssues, useProject } from '../hooks/useApi';
import { useApp } from '../context/AppContext';
import { ISSUE_TYPE_COLORS } from '../lib/utils';
import { Zap, CalendarDays } from 'lucide-react';

export default function RoadmapView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useProject(projectId);
  const { data: issues } = useIssues(projectId);
  const { dispatch } = useApp();

  const epics = useMemo(() => {
    if (!issues) return [];
    return issues.filter(i => i.type === 'Epic');
  }, [issues]);

  const childCounts = useMemo(() => {
    if (!issues) return {};
    const counts: Record<string, { total: number; done: number }> = {};
    for (const epic of epics) {
      const children = issues.filter(i => i.epicId === epic.id);
      counts[epic.id] = {
        total: children.length,
        done: children.filter(i => i.status === 'done').length,
      };
    }
    return counts;
  }, [issues, epics]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold">Roadmap</h1>
        {project && <p className="text-sm text-text-secondary">{project.name}</p>}
      </div>

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
        <div className="space-y-3">
          {epics.map(epic => {
            const counts = childCounts[epic.id] || { total: 0, done: 0 };
            const progress = counts.total > 0 ? (counts.done / counts.total) * 100 : 0;

            return (
              <div
                key={epic.id}
                onClick={() => dispatch({ type: 'SELECT_ISSUE', id: epic.id })}
                className="bg-card-bg rounded-lg border border-border p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-purple-500"><Zap size={16} /></span>
                  <span className="text-xs font-mono text-text-tertiary">{epic.key}</span>
                  <span className="font-display font-semibold text-sm flex-1">{epic.summary}</span>
                  {epic.dueDate && (
                    <span className="flex items-center gap-1 text-xs text-text-tertiary">
                      <CalendarDays size={12} />
                      {new Date(epic.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {counts.total > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-page-bg rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-text-tertiary font-mono">
                      {counts.done}/{counts.total}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
