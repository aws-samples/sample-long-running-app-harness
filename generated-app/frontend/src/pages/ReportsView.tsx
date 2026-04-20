import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useIssues, useSprints, useProject } from '../hooks/useApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ISSUE_TYPE_COLORS, PRIORITY_COLORS } from '../lib/utils';

export default function ReportsView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useProject(projectId);
  const { data: issues } = useIssues(projectId);
  const { data: sprints } = useSprints(projectId);

  const issuesByType = useMemo(() => {
    if (!issues) return [];
    const counts: Record<string, number> = {};
    issues.forEach(i => { counts[i.type] = (counts[i.type] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value, color: ISSUE_TYPE_COLORS[name] || '#8896A6' }));
  }, [issues]);

  const issuesByPriority = useMemo(() => {
    if (!issues) return [];
    const counts: Record<string, number> = {};
    issues.forEach(i => { counts[i.priority] = (counts[i.priority] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value, color: PRIORITY_COLORS[name] || '#8896A6' }));
  }, [issues]);

  const issuesByStatus = useMemo(() => {
    if (!issues) return [];
    const counts: Record<string, number> = {};
    issues.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({
      name: name === 'todo' ? 'To Do' : name === 'in_progress' ? 'In Progress' : name === 'in_review' ? 'In Review' : name === 'done' ? 'Done' : name,
      value,
    }));
  }, [issues]);

  const velocityData = useMemo(() => {
    if (!sprints || !issues) return [];
    return sprints
      .filter(s => s.status === 'completed')
      .map(sprint => {
        const sprintIssues = issues.filter(i => i.sprintId === sprint.id);
        const completed = sprintIssues.filter(i => i.status === 'done');
        return {
          name: sprint.name,
          committed: sprintIssues.reduce((s, i) => s + (i.storyPoints || 0), 0),
          completed: completed.reduce((s, i) => s + (i.storyPoints || 0), 0),
        };
      });
  }, [sprints, issues]);

  const totalIssues = issues?.length || 0;
  const doneIssues = issues?.filter(i => i.status === 'done').length || 0;
  const totalPoints = issues?.reduce((s, i) => s + (i.storyPoints || 0), 0) || 0;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold">Reports</h1>
        {project && <p className="text-sm text-text-secondary">{project.name}</p>}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8 stagger-children">
        <div className="bg-card-bg rounded-lg border border-border p-4">
          <div className="text-2xl font-display font-bold">{totalIssues}</div>
          <div className="text-xs text-text-tertiary">Total Issues</div>
        </div>
        <div className="bg-card-bg rounded-lg border border-border p-4">
          <div className="text-2xl font-display font-bold text-success">{doneIssues}</div>
          <div className="text-xs text-text-tertiary">Completed</div>
        </div>
        <div className="bg-card-bg rounded-lg border border-border p-4">
          <div className="text-2xl font-display font-bold text-info">{totalIssues - doneIssues}</div>
          <div className="text-xs text-text-tertiary">In Progress / To Do</div>
        </div>
        <div className="bg-card-bg rounded-lg border border-border p-4">
          <div className="text-2xl font-display font-bold text-amber-500">{totalPoints}</div>
          <div className="text-xs text-text-tertiary">Story Points</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues by Type */}
        <div className="bg-card-bg rounded-lg border border-border p-5">
          <h3 className="font-display font-semibold text-sm mb-4">Issues by Type</h3>
          {issuesByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={issuesByType} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {issuesByType.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-text-tertiary text-sm">No data</div>
          )}
        </div>

        {/* Issues by Priority */}
        <div className="bg-card-bg rounded-lg border border-border p-5">
          <h3 className="font-display font-semibold text-sm mb-4">Issues by Priority</h3>
          {issuesByPriority.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={issuesByPriority} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {issuesByPriority.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-text-tertiary text-sm">No data</div>
          )}
        </div>

        {/* Issues by Status */}
        <div className="bg-card-bg rounded-lg border border-border p-5">
          <h3 className="font-display font-semibold text-sm mb-4">Issues by Status</h3>
          {issuesByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={issuesByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E1DB" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#52796F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-text-tertiary text-sm">No data</div>
          )}
        </div>

        {/* Velocity Chart */}
        <div className="bg-card-bg rounded-lg border border-border p-5">
          <h3 className="font-display font-semibold text-sm mb-4">Sprint Velocity</h3>
          {velocityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E1DB" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="committed" fill="#D4A373" name="Committed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#40916C" name="Completed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-text-tertiary text-sm">Complete a sprint to see velocity</div>
          )}
        </div>
      </div>
    </div>
  );
}
