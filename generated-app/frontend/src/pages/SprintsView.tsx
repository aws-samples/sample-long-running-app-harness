import { useParams } from 'react-router-dom';
import { useSprints, useIssues, useProject, useUpdateSprint } from '../hooks/useApi';
import { useApp } from '../context/AppContext';
import { ISSUE_TYPE_COLORS, formatDate } from '../lib/utils';
import { Bookmark, Bug, CheckSquare, Zap, ListTodo, Play, CheckCircle2, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import type { Sprint, Issue } from '@canopy/shared';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Epic: <Zap size={13} />,
  Story: <Bookmark size={13} />,
  Bug: <Bug size={13} />,
  Task: <CheckSquare size={13} />,
  'Sub-task': <ListTodo size={13} />,
};

export default function SprintsView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useProject(projectId);
  const { data: sprints } = useSprints(projectId);
  const { data: issues } = useIssues(projectId);
  const updateSprint = useUpdateSprint();
  const { dispatch } = useApp();

  const activeSprints = sprints?.filter(s => s.status === 'active') || [];
  const completedSprints = sprints?.filter(s => s.status === 'completed') || [];

  function getSprintIssues(sprintId: string) {
    return issues?.filter(i => i.sprintId === sprintId) || [];
  }

  async function handleCompleteSprint(sprint: Sprint) {
    try {
      await updateSprint.mutateAsync({ id: sprint.id, data: { status: 'completed' } });
      toast.success('Sprint completed');
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold">Active Sprints</h1>
        {project && <p className="text-sm text-text-secondary">{project.name}</p>}
      </div>

      {activeSprints.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-info/10 flex items-center justify-center mx-auto mb-4">
            <Play size={24} className="text-info" />
          </div>
          <h3 className="font-display text-lg font-semibold mb-2">No active sprints</h3>
          <p className="text-sm text-text-secondary">Start a sprint from the Backlog view to see it here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeSprints.map(sprint => {
            const sprintIssues = getSprintIssues(sprint.id);
            const doneIssues = sprintIssues.filter(i => i.status === 'done');
            const totalPoints = sprintIssues.reduce((s, i) => s + (i.storyPoints || 0), 0);
            const donePoints = doneIssues.reduce((s, i) => s + (i.storyPoints || 0), 0);
            const progress = sprintIssues.length > 0 ? (doneIssues.length / sprintIssues.length) * 100 : 0;

            return (
              <div key={sprint.id} className="bg-card-bg rounded-lg border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h2 className="font-display font-semibold">{sprint.name}</h2>
                      <span className="px-2 py-0.5 text-[10px] bg-info/10 text-info rounded font-medium">Active</span>
                    </div>
                    <button
                      onClick={() => handleCompleteSprint(sprint)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-success text-white rounded-md hover:bg-success/90 transition-colors"
                    >
                      <CheckCircle2 size={14} /> Complete Sprint
                    </button>
                  </div>
                  {sprint.goal && <p className="text-sm text-text-secondary mb-3">{sprint.goal}</p>}
                  <div className="flex items-center gap-4 text-xs text-text-tertiary mb-2">
                    {sprint.startDate && (
                      <span className="flex items-center gap-1"><CalendarDays size={12} /> {formatDate(sprint.startDate)}</span>
                    )}
                    <span>{sprintIssues.length} issues</span>
                    <span>{donePoints}/{totalPoints} SP</span>
                  </div>
                  <div className="h-2 bg-page-bg rounded-full overflow-hidden">
                    <div className="h-full bg-success rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div>
                  {sprintIssues.map(issue => (
                    <div
                      key={issue.id}
                      onClick={() => dispatch({ type: 'SELECT_ISSUE', id: issue.id })}
                      className="flex items-center gap-3 px-5 py-2.5 hover:bg-hover-bg transition-colors cursor-pointer border-b border-border/50 last:border-b-0"
                    >
                      <span style={{ color: ISSUE_TYPE_COLORS[issue.type] }}>{TYPE_ICONS[issue.type]}</span>
                      <span className="text-xs font-mono text-text-tertiary w-16">{issue.key}</span>
                      <span className="text-sm flex-1 truncate">{issue.summary}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        issue.status === 'done' ? 'bg-success/10 text-success' :
                        issue.status === 'in_progress' ? 'bg-info/10 text-info' :
                        'bg-page-bg text-text-tertiary'
                      }`}>
                        {issue.status === 'todo' ? 'To Do' : issue.status === 'in_progress' ? 'In Progress' : issue.status === 'in_review' ? 'In Review' : 'Done'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed sprints */}
      {completedSprints.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-semibold mb-4 text-text-secondary">Completed Sprints</h2>
          <div className="space-y-3">
            {completedSprints.map(sprint => {
              const sprintIssues = getSprintIssues(sprint.id);
              const doneIssues = sprintIssues.filter(i => i.status === 'done');
              return (
                <div key={sprint.id} className="bg-card-bg rounded-lg border border-border p-4 opacity-75">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-success" />
                    <span className="font-display font-semibold text-sm">{sprint.name}</span>
                    <span className="text-xs text-text-tertiary">{doneIssues.length}/{sprintIssues.length} completed</span>
                    {sprint.completedAt && (
                      <span className="text-xs text-text-tertiary ml-auto">{formatDate(sprint.completedAt)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
