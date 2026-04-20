import { Component, Plus, FolderOpen } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useProject } from '../hooks/useApi';
import { useState } from 'react';

const DEFAULT_COMPONENTS = [
  { name: 'Frontend', description: 'UI components and pages', lead: 'Unassigned', issueCount: 0 },
  { name: 'Backend', description: 'API and server logic', lead: 'Unassigned', issueCount: 0 },
  { name: 'Database', description: 'Data models and migrations', lead: 'Unassigned', issueCount: 0 },
  { name: 'Infrastructure', description: 'Cloud infrastructure and DevOps', lead: 'Unassigned', issueCount: 0 },
  { name: 'Authentication', description: 'User auth and permissions', lead: 'Unassigned', issueCount: 0 },
];

export default function ComponentsView() {
  const { projectId } = useParams();
  const { data: project } = useProject(projectId!);
  const [components] = useState(DEFAULT_COMPONENTS);

  return (
    <div className="p-6 max-w-4xl animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-text-primary">Components</h1>
        {project && (
          <p className="text-sm text-text-tertiary mt-1">{project.name}</p>
        )}
      </div>

      <div className="bg-card-bg rounded-xl border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-sm text-text-secondary font-medium">
            {components.length} components
          </span>
          <button className="flex items-center gap-1.5 bg-forest-700 hover:bg-forest-800 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-colors">
            <Plus size={14} />
            New Component
          </button>
        </div>

        <div className="divide-y divide-border">
          {components.map((comp) => (
            <div
              key={comp.name}
              className="flex items-center gap-4 px-4 py-4 hover:bg-hover-bg transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center shrink-0">
                <Component size={18} className="text-forest-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary">{comp.name}</div>
                <div className="text-xs text-text-tertiary mt-0.5">{comp.description}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-text-tertiary">{comp.lead}</div>
                <div className="text-xs text-text-tertiary mt-0.5 flex items-center gap-1 justify-end">
                  <FolderOpen size={10} />
                  {comp.issueCount} issues
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button className="text-xs text-text-tertiary hover:text-text-primary px-2 py-1 rounded hover:bg-hover-bg transition-colors">
                  Edit
                </button>
                <button className="text-xs text-error hover:text-red-600 px-2 py-1 rounded hover:bg-hover-bg transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {components.length === 0 && (
        <div className="text-center py-16">
          <Component size={48} className="mx-auto text-text-tertiary mb-4 opacity-50" />
          <h3 className="text-lg font-display font-semibold text-text-primary mb-2">No components yet</h3>
          <p className="text-text-tertiary text-sm mb-6">
            Components help organize issues by area of your project.
          </p>
          <button className="inline-flex items-center gap-2 bg-forest-700 hover:bg-forest-800 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
            <Plus size={14} />
            Create First Component
          </button>
        </div>
      )}
    </div>
  );
}
