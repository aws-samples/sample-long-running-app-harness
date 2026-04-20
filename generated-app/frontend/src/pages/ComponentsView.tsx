import { Component, Plus, FolderOpen, Search, Users } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useProject, useIssues } from '../hooks/useApi';
import { useState, useMemo } from 'react';

const COMPONENT_COLORS = ['#1B4332', '#2D6A4F', '#52796F', '#D4A373', '#BC6C25', '#9B59B6', '#2196F3', '#1ABC9C'];

const DEFAULT_COMPONENTS = [
  { name: 'Frontend', description: 'UI components, pages, and client-side logic', lead: 'Unassigned' },
  { name: 'Backend', description: 'API endpoints and server-side logic', lead: 'Unassigned' },
  { name: 'Database', description: 'Data models, schemas, and migrations', lead: 'Unassigned' },
  { name: 'Infrastructure', description: 'Cloud infrastructure, CI/CD, and DevOps', lead: 'Unassigned' },
  { name: 'Authentication', description: 'User authentication and authorization', lead: 'Unassigned' },
  { name: 'Design System', description: 'Shared components, tokens, and patterns', lead: 'Unassigned' },
];

export default function ComponentsView() {
  const { projectId } = useParams();
  const { data: project } = useProject(projectId!);
  const { data: issues } = useIssues(projectId);
  const [components] = useState(DEFAULT_COMPONENTS);
  const [search, setSearch] = useState('');

  // Count issues that mention component name in labels or summary (simulated)
  const componentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (issues) {
      components.forEach(comp => {
        const name = comp.name.toLowerCase();
        counts[comp.name] = issues.filter(i =>
          (i.labels || []).some((l: string) => l.toLowerCase().includes(name)) ||
          i.summary.toLowerCase().includes(name)
        ).length;
      });
    }
    return counts;
  }, [issues, components]);

  const filteredComponents = components.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const totalIssues = Object.values(componentCounts).reduce((s, c) => s + c, 0);

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-xl font-bold">Components</h1>
          {project && <p className="text-sm text-text-secondary">{project.name}</p>}
        </div>
        <button className="flex items-center gap-1.5 h-8 px-3 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium">
          <Plus size={14} /> New Component
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card-bg rounded-lg border border-border px-4 py-3 text-center">
          <div className="text-lg font-display font-bold">{components.length}</div>
          <div className="text-[10px] text-text-tertiary uppercase">Components</div>
        </div>
        <div className="bg-card-bg rounded-lg border border-border px-4 py-3 text-center">
          <div className="text-lg font-display font-bold text-info">{totalIssues}</div>
          <div className="text-[10px] text-text-tertiary uppercase">Linked Issues</div>
        </div>
        <div className="bg-card-bg rounded-lg border border-border px-4 py-3 text-center">
          <div className="text-lg font-display font-bold text-forest-700">
            {components.filter(c => componentCounts[c.name] > 0).length}
          </div>
          <div className="text-[10px] text-text-tertiary uppercase">Active</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter components..."
          className="w-full h-9 pl-9 pr-3 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none bg-card-bg"
        />
      </div>

      {/* Components list */}
      <div className="space-y-3 stagger-children">
        {filteredComponents.map((comp, idx) => {
          const count = componentCounts[comp.name] || 0;
          const color = COMPONENT_COLORS[idx % COMPONENT_COLORS.length];

          return (
            <div
              key={comp.name}
              className="bg-card-bg rounded-lg border border-border p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: color + '20' }}
                >
                  <Component size={18} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-display font-semibold">{comp.name}</span>
                    {count > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-info/10 text-info rounded-full font-medium">
                        {count} {count === 1 ? 'issue' : 'issues'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-tertiary">{comp.description}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                      <Users size={12} />
                      {comp.lead}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-text-tertiary mt-1">
                      <FolderOpen size={12} />
                      {count} issues
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button className="text-xs text-text-tertiary hover:text-text-primary px-2 py-1 rounded hover:bg-page-bg transition-colors">
                      Edit
                    </button>
                    <button className="text-xs text-error hover:text-red-600 px-2 py-1 rounded hover:bg-page-bg transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredComponents.length === 0 && search && (
          <div className="text-center py-12 text-sm text-text-tertiary">
            No components matching "{search}"
          </div>
        )}
      </div>

      {components.length === 0 && (
        <div className="bg-card-bg rounded-lg border border-border p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-forest-100 flex items-center justify-center mx-auto mb-4">
            <Component size={24} className="text-forest-600" />
          </div>
          <h3 className="font-display text-lg font-semibold mb-2">No components yet</h3>
          <p className="text-sm text-text-secondary mb-4">
            Components help organize issues by area of your project.
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium text-sm">
            <Plus size={16} /> Create First Component
          </button>
        </div>
      )}
    </div>
  );
}
