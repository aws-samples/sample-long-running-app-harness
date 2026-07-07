import { Component, Plus, FolderOpen, Search, Users, X, Pencil, Trash2, Check } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useProject, useIssues } from '../hooks/useApi';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';

const COMPONENT_COLORS = ['#1B4332', '#2D6A4F', '#52796F', '#D4A373', '#BC6C25', '#9B59B6', '#2196F3', '#1ABC9C'];

interface ProjectComponent {
  id: string;
  name: string;
  description: string;
  lead: string;
  color: string;
}

const DEFAULT_COMPONENTS: ProjectComponent[] = [
  { id: 'c1', name: 'Frontend', description: 'UI components, pages, and client-side logic', lead: 'Unassigned', color: '#1B4332' },
  { id: 'c2', name: 'Backend', description: 'API endpoints and server-side logic', lead: 'Unassigned', color: '#2D6A4F' },
  { id: 'c3', name: 'Database', description: 'Data models, schemas, and migrations', lead: 'Unassigned', color: '#52796F' },
  { id: 'c4', name: 'Infrastructure', description: 'Cloud infrastructure, CI/CD, and DevOps', lead: 'Unassigned', color: '#D4A373' },
  { id: 'c5', name: 'Authentication', description: 'User authentication and authorization', lead: 'Unassigned', color: '#BC6C25' },
  { id: 'c6', name: 'Design System', description: 'Shared components, tokens, and patterns', lead: 'Unassigned', color: '#9B59B6' },
];

const MOCK_LEADS = ['Unassigned', 'Alice Chen', 'Bob Smith', 'Carol Davis', 'Dan Wilson', 'Eve Johnson'];

function getStorageKey(projectId: string) {
  return `canopy-components-${projectId}`;
}

export default function ComponentsView() {
  const { projectId } = useParams();
  const { data: project } = useProject(projectId!);
  const { data: issues } = useIssues(projectId);
  const [components, setComponents] = useState<ProjectComponent[]>([]);
  const [search, setSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLead, setFormLead] = useState('Unassigned');
  const [formColor, setFormColor] = useState(COMPONENT_COLORS[0]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load from localStorage or use defaults
  useEffect(() => {
    if (!projectId) return;
    const stored = localStorage.getItem(getStorageKey(projectId));
    if (stored) {
      try {
        setComponents(JSON.parse(stored));
      } catch {
        setComponents(DEFAULT_COMPONENTS);
      }
    } else {
      setComponents(DEFAULT_COMPONENTS);
    }
  }, [projectId]);

  // Persist to localStorage
  useEffect(() => {
    if (!projectId || components.length === 0) return;
    localStorage.setItem(getStorageKey(projectId), JSON.stringify(components));
  }, [components, projectId]);

  // Count issues that mention component name in labels or summary
  const componentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (issues) {
      components.forEach(comp => {
        const name = comp.name.toLowerCase();
        counts[comp.id] = issues.filter(i =>
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

  function resetForm() {
    setFormName('');
    setFormDescription('');
    setFormLead('Unassigned');
    setFormColor(COMPONENT_COLORS[components.length % COMPONENT_COLORS.length]);
  }

  function handleCreate() {
    if (!formName.trim()) {
      toast.error('Component name is required');
      return;
    }
    if (components.some(c => c.name.toLowerCase() === formName.trim().toLowerCase())) {
      toast.error('A component with this name already exists');
      return;
    }
    const newComponent: ProjectComponent = {
      id: `c-${Date.now()}`,
      name: formName.trim(),
      description: formDescription.trim(),
      lead: formLead,
      color: formColor,
    };
    setComponents(prev => [...prev, newComponent]);
    setShowCreateForm(false);
    resetForm();
    toast.success(`Component "${newComponent.name}" created`);
  }

  function startEdit(comp: ProjectComponent) {
    setEditingId(comp.id);
    setFormName(comp.name);
    setFormDescription(comp.description);
    setFormLead(comp.lead);
    setFormColor(comp.color);
  }

  function handleSaveEdit() {
    if (!formName.trim() || !editingId) return;
    setComponents(prev => prev.map(c =>
      c.id === editingId
        ? { ...c, name: formName.trim(), description: formDescription.trim(), lead: formLead, color: formColor }
        : c
    ));
    setEditingId(null);
    resetForm();
    toast.success('Component updated');
  }

  function handleDelete(id: string) {
    const comp = components.find(c => c.id === id);
    setComponents(prev => prev.filter(c => c.id !== id));
    setDeleteConfirmId(null);
    toast.success(`Component "${comp?.name}" deleted`);
  }

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-xl font-bold">Components</h1>
          {project && <p className="text-sm text-text-secondary">{project.name}</p>}
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateForm(true); }}
          className="flex items-center gap-1.5 h-8 px-3 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium btn-press"
        >
          <Plus size={14} /> New Component
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card-bg rounded-lg border border-border px-4 py-3 text-center card-glow">
          <div className="text-lg font-display font-bold">{components.length}</div>
          <div className="text-[10px] text-text-tertiary uppercase tracking-wider">Components</div>
        </div>
        <div className="bg-card-bg rounded-lg border border-border px-4 py-3 text-center card-glow">
          <div className="text-lg font-display font-bold text-info">{totalIssues}</div>
          <div className="text-[10px] text-text-tertiary uppercase tracking-wider">Linked Issues</div>
        </div>
        <div className="bg-card-bg rounded-lg border border-border px-4 py-3 text-center card-glow">
          <div className="text-lg font-display font-bold text-forest-700">
            {components.filter(c => componentCounts[c.id] > 0).length}
          </div>
          <div className="text-[10px] text-text-tertiary uppercase tracking-wider">Active</div>
        </div>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="bg-card-bg rounded-lg border-2 border-amber-400/50 p-4 mb-4 animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-display font-semibold">New Component</h3>
            <button onClick={() => setShowCreateForm(false)} className="p-1 hover:bg-hover-bg rounded transition-colors">
              <X size={14} className="text-text-tertiary" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1">Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Component name"
                  className="w-full h-8 px-3 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none bg-card-bg"
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
                />
              </div>
              <div className="w-32">
                <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1">Lead</label>
                <select
                  value={formLead}
                  onChange={e => setFormLead(e.target.value)}
                  className="w-full h-8 px-2 text-sm border border-border rounded-md bg-card-bg focus:border-border-focus focus:outline-none"
                >
                  {MOCK_LEADS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1">Description</label>
              <input
                type="text"
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                placeholder="Brief description"
                className="w-full h-8 px-3 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none bg-card-bg"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1">Color</label>
              <div className="flex gap-2">
                {COMPONENT_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setFormColor(c)}
                    className={`w-7 h-7 rounded-md transition-all ${formColor === c ? 'ring-2 ring-offset-1 ring-amber-400 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleCreate}
                className="px-4 py-1.5 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium"
              >
                Create Component
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-1.5 text-sm border border-border rounded-md hover:bg-hover-bg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
        {filteredComponents.map((comp) => {
          const count = componentCounts[comp.id] || 0;
          const isEditing = editingId === comp.id;
          const isDeleting = deleteConfirmId === comp.id;

          if (isEditing) {
            return (
              <div key={comp.id} className="bg-card-bg rounded-lg border-2 border-border-focus p-4 animate-scale-in">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1">Name</label>
                      <input
                        type="text"
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        className="w-full h-8 px-3 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none bg-card-bg"
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') setEditingId(null); }}
                      />
                    </div>
                    <div className="w-32">
                      <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1">Lead</label>
                      <select
                        value={formLead}
                        onChange={e => setFormLead(e.target.value)}
                        className="w-full h-8 px-2 text-sm border border-border rounded-md bg-card-bg focus:border-border-focus focus:outline-none"
                      >
                        {MOCK_LEADS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1">Description</label>
                    <input
                      type="text"
                      value={formDescription}
                      onChange={e => setFormDescription(e.target.value)}
                      className="w-full h-8 px-3 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none bg-card-bg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1">Color</label>
                    <div className="flex gap-2">
                      {COMPONENT_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setFormColor(c)}
                          className={`w-6 h-6 rounded-md transition-all ${formColor === c ? 'ring-2 ring-offset-1 ring-amber-400 scale-110' : 'hover:scale-105'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveEdit} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium">
                      <Check size={12} /> Save
                    </button>
                    <button onClick={() => { setEditingId(null); resetForm(); }} className="px-3 py-1.5 text-xs border border-border rounded-md hover:bg-hover-bg transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={comp.id}
              className="bg-card-bg rounded-lg border border-border p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group card-glow"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: comp.color + '20' }}
                >
                  <Component size={18} style={{ color: comp.color }} />
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
                    {isDeleting ? (
                      <div className="flex items-center gap-1 animate-scale-in">
                        <button
                          onClick={() => handleDelete(comp.id)}
                          className="text-[10px] text-white bg-error hover:bg-red-600 px-2 py-1 rounded transition-colors font-medium"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-[10px] text-text-tertiary hover:text-text-primary px-2 py-1 rounded hover:bg-page-bg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(comp)}
                          className="p-1.5 text-text-tertiary hover:text-text-primary rounded hover:bg-page-bg transition-colors"
                          title="Edit component"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(comp.id)}
                          className="p-1.5 text-text-tertiary hover:text-error rounded hover:bg-page-bg transition-colors"
                          title="Delete component"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
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

      {components.length === 0 && !showCreateForm && (
        <div className="bg-card-bg rounded-lg border border-border p-12 text-center animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-forest-100 flex items-center justify-center mx-auto mb-4">
            <Component size={24} className="text-forest-600" />
          </div>
          <h3 className="font-display text-lg font-semibold mb-2">No components yet</h3>
          <p className="text-sm text-text-secondary mb-4">
            Components help organize issues by area of your project.
          </p>
          <button
            onClick={() => { resetForm(); setShowCreateForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium text-sm"
          >
            <Plus size={16} /> Create First Component
          </button>
        </div>
      )}
    </div>
  );
}
