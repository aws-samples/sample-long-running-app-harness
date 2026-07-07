import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useIssues, useSprints, useProject } from '../hooks/useApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { ISSUE_TYPE_COLORS, PRIORITY_COLORS, STATUS_COLORS } from '../lib/utils';
import { TrendingUp, CheckCircle2, Clock, Zap, AlertTriangle } from 'lucide-react';

const STATUS_BAR_COLORS: Record<string, string> = {
  'To Do': '#8896A6',
  'In Progress': '#2196F3',
  'In Review': '#E9C46A',
  'Done': '#40916C',
};

export default function ReportsView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useProject(projectId);
  const { data: issues, isLoading } = useIssues(projectId);
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
      fill: STATUS_BAR_COLORS[name === 'todo' ? 'To Do' : name === 'in_progress' ? 'In Progress' : name === 'in_review' ? 'In Review' : name === 'done' ? 'Done' : name] || '#8896A6',
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

  // Creation trend data (issues created per day, last 14 days)
  const creationTrend = useMemo(() => {
    if (!issues) return [];
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = 0;
    }
    issues.forEach(issue => {
      const key = new Date(issue.createdAt).toISOString().slice(0, 10);
      if (key in days) days[key]++;
    });
    return Object.entries(days).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      issues: count,
    }));
  }, [issues]);

  const totalIssues = issues?.length || 0;
  const doneIssues = issues?.filter(i => i.status === 'done').length || 0;
  const inProgressIssues = issues?.filter(i => i.status === 'in_progress' || i.status === 'in_review').length || 0;
  const totalPoints = issues?.reduce((s, i) => s + (i.storyPoints || 0), 0) || 0;
  const completionRate = totalIssues > 0 ? Math.round((doneIssues / totalIssues) * 100) : 0;
  const highPriorityOpen = issues?.filter(i => (i.priority === 'Highest' || i.priority === 'High') && i.status !== 'done').length || 0;

  const tooltipStyle = {
    backgroundColor: 'var(--color-card-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    color: 'var(--color-text-primary)',
    fontSize: '12px',
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-20 rounded-lg" />)}
        </div>
        <div className="grid grid-cols-2 gap-6">
          {[1,2].map(i => <div key={i} className="skeleton h-64 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold">Reports</h1>
        {project && <p className="text-sm text-text-secondary">{project.name}</p>}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8 stagger-children">
        <StatCard
          icon={<TrendingUp size={16} />}
          label="Total Issues"
          value={String(totalIssues)}
          color="text-text-primary"
          bgColor="bg-page-bg"
        />
        <StatCard
          icon={<CheckCircle2 size={16} />}
          label="Completed"
          value={String(doneIssues)}
          color="text-success"
          bgColor="bg-success/10"
        />
        <StatCard
          icon={<Clock size={16} />}
          label="In Progress"
          value={String(inProgressIssues)}
          color="text-info"
          bgColor="bg-info/10"
        />
        <StatCard
          icon={<Zap size={16} />}
          label="Story Points"
          value={String(totalPoints)}
          color="text-amber-500"
          bgColor="bg-amber-500/10"
        />
        <StatCard
          icon={<AlertTriangle size={16} />}
          label="High Priority"
          value={String(highPriorityOpen)}
          color="text-error"
          bgColor="bg-error/10"
        />
      </div>

      {/* Completion rate bar */}
      <div className="bg-card-bg rounded-lg border border-border p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-sm">Completion Rate</h3>
          <span className="text-2xl font-display font-bold text-success">{completionRate}%</span>
        </div>
        <div className="h-3 bg-page-bg rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${completionRate}%`,
              background: `linear-gradient(90deg, #40916C, #52796F)`,
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-text-tertiary">
          <span>{doneIssues} done</span>
          <span>{totalIssues - doneIssues} remaining</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Issues by Type */}
        <div className="bg-card-bg rounded-lg border border-border p-5">
          <h3 className="font-display font-semibold text-sm mb-4">Issues by Type</h3>
          {issuesByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={issuesByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {issuesByType.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-text-tertiary text-sm">No data</div>
          )}
          {/* Legend */}
          {issuesByType.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2">
              {issuesByType.map(entry => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                  {entry.name} ({entry.value})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Issues by Priority */}
        <div className="bg-card-bg rounded-lg border border-border p-5">
          <h3 className="font-display font-semibold text-sm mb-4">Issues by Priority</h3>
          {issuesByPriority.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={issuesByPriority}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  animationBegin={200}
                  animationDuration={800}
                >
                  {issuesByPriority.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-text-tertiary text-sm">No data</div>
          )}
          {issuesByPriority.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2">
              {issuesByPriority.map(entry => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                  {entry.name} ({entry.value})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Issues by Status */}
        <div className="bg-card-bg rounded-lg border border-border p-5">
          <h3 className="font-display font-semibold text-sm mb-4">Issues by Status</h3>
          {issuesByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={issuesByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={800}>
                  {issuesByStatus.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-text-tertiary text-sm">No data</div>
          )}
        </div>

        {/* Sprint Velocity */}
        <div className="bg-card-bg rounded-lg border border-border p-5">
          <h3 className="font-display font-semibold text-sm mb-4">Sprint Velocity</h3>
          {velocityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="committed" fill="#D4A373" name="Committed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#40916C" name="Completed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex flex-col items-center justify-center text-text-tertiary text-sm gap-2">
              <Clock size={24} className="opacity-50" />
              <span>Complete a sprint to see velocity</span>
            </div>
          )}
        </div>
      </div>

      {/* Issue creation trend */}
      <div className="bg-card-bg rounded-lg border border-border p-5">
        <h3 className="font-display font-semibold text-sm mb-4">Issue Creation Trend (Last 14 Days)</h3>
        {creationTrend.some(d => d.issues > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={creationTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <defs>
                <linearGradient id="issueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#52796F" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#52796F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="issues"
                stroke="#52796F"
                fill="url(#issueGradient)"
                strokeWidth={2}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-text-tertiary text-sm">
            No recent issue creation activity
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, bgColor }: {
  icon: React.ReactNode; label: string; value: string; color: string; bgColor: string;
}) {
  return (
    <div className="bg-card-bg rounded-lg border border-border p-4 flex items-center gap-3">
      <div className={`w-9 h-9 ${bgColor} rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <div className={`text-xl font-display font-bold ${color}`}>{value}</div>
        <div className="text-[10px] text-text-tertiary uppercase">{label}</div>
      </div>
    </div>
  );
}
