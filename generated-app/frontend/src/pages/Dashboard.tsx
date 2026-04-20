import { useProjects } from '../hooks/useApi';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { TreePine, Plus, FolderOpen, ArrowRight } from 'lucide-react';
import { formatRelativeDate } from '../lib/utils';

export default function Dashboard() {
  const { data: projects, isLoading } = useProjects();
  const { dispatch } = useApp();
  const navigate = useNavigate();

  const activeProjects = projects?.filter(p => !p.isArchived) || [];

  function selectProject(id: string) {
    dispatch({ type: 'SET_PROJECT', id });
    navigate(`/project/${id}/board`);
  }

  return (
    <div className="animate-fade-in">
      {/* Hero section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-forest-900 flex items-center justify-center">
            <TreePine size={22} className="text-forest-300" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary">Welcome to Canopy</h1>
            <p className="text-sm text-text-secondary">Manage your projects with clarity and focus</p>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 stagger-children">
        <StatCard label="Active Projects" value={String(activeProjects.length)} color="bg-forest-700" />
        <StatCard label="Total Issues" value={String(activeProjects.reduce((s, p) => s + (p.issueCounter || 0), 0))} color="bg-info" />
        <StatCard label="Last Updated" value={activeProjects.length > 0 ? formatRelativeDate(activeProjects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0].updatedAt) : 'N/A'} color="bg-amber-500" />
      </div>

      {/* Projects */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <FolderOpen size={20} className="text-text-tertiary" />
            Projects
          </h2>
          <button
            onClick={() => navigate('/projects/new')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium"
          >
            <Plus size={14} /> New Project
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-card-bg rounded-lg border border-border p-5 space-y-3">
                <div className="skeleton h-5 w-24" />
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-4 w-20" />
              </div>
            ))}
          </div>
        ) : activeProjects.length === 0 ? (
          <div className="bg-card-bg rounded-lg border border-border p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-forest-100 flex items-center justify-center mx-auto mb-4">
              <TreePine size={28} className="text-forest-600" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-sm text-text-secondary mb-4">Create your first project to get started managing tasks</p>
            <button
              onClick={() => navigate('/projects/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium text-sm"
            >
              <Plus size={16} /> Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {activeProjects.map(project => (
              <button
                key={project.id}
                onClick={() => selectProject(project.id)}
                className="bg-card-bg rounded-lg border border-border p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ backgroundColor: project.color || '#52796F' }}
                  >
                    {project.key?.slice(0,2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-semibold truncate">{project.name}</div>
                    <div className="text-xs text-text-tertiary font-mono">{project.key}</div>
                  </div>
                  <ArrowRight size={16} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {project.description && (
                  <p className="text-sm text-text-secondary line-clamp-2 mb-3">{project.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-text-tertiary">
                  <span>{project.issueCounter || 0} issues</span>
                  <span>·</span>
                  <span>Updated {formatRelativeDate(project.updatedAt)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-card-bg rounded-lg border border-border p-4 flex items-center gap-4">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center text-white font-display font-bold text-sm`}>
        {value.length <= 3 ? value : '#'}
      </div>
      <div>
        <div className="text-xl font-display font-bold">{value}</div>
        <div className="text-xs text-text-tertiary">{label}</div>
      </div>
    </div>
  );
}
