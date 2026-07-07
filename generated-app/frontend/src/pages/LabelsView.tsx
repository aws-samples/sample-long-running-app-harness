import { Tag, Plus, Search, Pencil, Trash2, X, Check } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useProject, useIssues } from '../hooks/useApi';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';

interface ProjectLabel {
  id: string;
  name: string;
  color: string;
}

const COLOR_OPTIONS = [
  '#E74C3C', '#3498DB', '#2ECC71', '#9B59B6', '#E67E22',
  '#1ABC9C', '#E91E63', '#607D8B', '#FF9800', '#00BCD4',
  '#1B4332', '#D4A373', '#2D6A4F', '#BC6C25',
];

const DEFAULT_LABELS: ProjectLabel[] = [
  { id: 'l1', name: 'Bug', color: '#E74C3C' },
  { id: 'l2', name: 'Feature', color: '#3498DB' },
  { id: 'l3', name: 'Enhancement', color: '#2ECC71' },
  { id: 'l4', name: 'Documentation', color: '#9B59B6' },
  { id: 'l5', name: 'Design', color: '#E67E22' },
  { id: 'l6', name: 'Performance', color: '#1ABC9C' },
  { id: 'l7', name: 'Security', color: '#E91E63' },
  { id: 'l8', name: 'Technical Debt', color: '#607D8B' },
  { id: 'l9', name: 'UX', color: '#FF9800' },
  { id: 'l10', name: 'Accessibility', color: '#00BCD4' },
];

function getStorageKey(projectId: string) {
  return `canopy-labels-${projectId}`;
}

export default function LabelsView() {
  const { projectId } = useParams();
  const { data: project } = useProject(projectId!);
  const { data: issues } = useIssues(projectId);
  const [labels, setLabels] = useState<ProjectLabel[]>([]);
  const [search, setSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState(COLOR_OPTIONS[0]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load from localStorage or defaults
  useEffect(() => {
    if (!projectId) return;
    const stored = localStorage.getItem(getStorageKey(projectId));
    if (stored) {
      try { setLabels(JSON.parse(stored)); }
      catch { setLabels(DEFAULT_LABELS); }
    } else {
      setLabels(DEFAULT_LABELS);
    }
  }, [projectId]);

  // Persist
  useEffect(() => {
    if (!projectId || labels.length === 0) return;
    localStorage.setItem(getStorageKey(projectId), JSON.stringify(labels));
  }, [labels, projectId]);

  const labelCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (issues) {
      issues.forEach(issue => {
        (issue.labels || []).forEach((label: string) => {
          counts[label] = (counts[label] || 0) + 1;
        });
      });
    }
    return counts;
  }, [issues]);

  const filteredLabels = labels.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalUsage = Object.values(labelCounts).reduce((s, c) => s + c, 0);

  function resetForm() {
    setFormName('');
    setFormColor(COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)]);
  }

  function handleCreate() {
    if (!formName.trim()) {
      toast.error('Label name is required');
      return;
    }
    if (labels.some(l => l.name.toLowerCase() === formName.trim().toLowerCase())) {
      toast.error('A label with this name already exists');
      return;
    }
    const newLabel: ProjectLabel = {
      id: `l-${Date.now()}`,
      name: formName.trim(),
      color: formColor,
    };
    setLabels(prev => [...prev, newLabel]);
    setShowCreateForm(false);
    resetForm();
    toast.success(`Label "${newLabel.name}" created`);
  }

  function startEdit(label: ProjectLabel) {
    setEditingId(label.id);
    setFormName(label.name);
    setFormColor(label.color);
  }

  function handleSaveEdit() {
    if (!formName.trim() || !editingId) return;
    setLabels(prev => prev.map(l =>
      l.id === editingId ? { ...l, name: formName.trim(), color: formColor } : l
    ));
    setEditingId(null);
    resetForm();
    toast.success('Label updated');
  }

  function handleDelete(id: string) {
    const label = labels.find(l => l.id === id);
    setLabels(prev => prev.filter(l => l.id !== id));
    setDeleteConfirmId(null);
    toast.success(`Label "${label?.name}" deleted`);
  }

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-xl font-bold">Labels</h1>
          {project && <p className="text-sm text-text-secondary">{project.name}</p>}
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateForm(true); }}
          className="flex items-center gap-1.5 h-8 px-3 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium btn-press"
        >
          <Plus size={14} /> New Label
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card-bg rounded-lg border border-border px-4 py-3 text-center card-glow">
          <div className="text-lg font-display font-bold">{labels.length}</div>
          <div className="text-[10px] text-text-tertiary uppercase tracking-wider">Labels</div>
        </div>
        <div className="bg-card-bg rounded-lg border border-border px-4 py-3 text-center card-glow">
          <div className="text-lg font-display font-bold text-info">{totalUsage}</div>
          <div className="text-[10px] text-text-tertiary uppercase tracking-wider">Total Uses</div>
        </div>
        <div className="bg-card-bg rounded-lg border border-border px-4 py-3 text-center card-glow">
          <div className="text-lg font-display font-bold text-success">
            {Object.keys(labelCounts).length}
          </div>
          <div className="text-[10px] text-text-tertiary uppercase tracking-wider">Active Labels</div>
        </div>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="bg-card-bg rounded-lg border-2 border-amber-400/50 p-4 mb-4 animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-display font-semibold">New Label</h3>
            <button onClick={() => setShowCreateForm(false)} className="p-1 hover:bg-hover-bg rounded transition-colors">
              <X size={14} className="text-text-tertiary" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1">Name</label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="Label name"
                className="w-full h-8 px-3 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none bg-card-bg"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c}
                    onClick={() => setFormColor(c)}
                    className={`w-7 h-7 rounded-full transition-all ${formColor === c ? 'ring-2 ring-offset-2 ring-amber-400 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-white"
                style={{ backgroundColor: formColor }}
              >
                <Tag size={10} />
                {formName || 'Preview'}
              </span>
              <span className="text-xs text-text-tertiary">Preview</span>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleCreate}
                className="px-4 py-1.5 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium"
              >
                Create Label
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
          placeholder="Filter labels..."
          className="w-full h-9 pl-9 pr-3 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none bg-card-bg"
        />
      </div>

      {/* Labels list */}
      <div className="bg-card-bg rounded-lg border border-border overflow-hidden">
        <div className="divide-y divide-border stagger-children">
          {filteredLabels.map((label) => {
            const count = labelCounts[label.name] || 0;
            const isEditing = editingId === label.id;
            const isDeleting = deleteConfirmId === label.id;

            if (isEditing) {
              return (
                <div key={label.id} className="px-4 py-3 bg-selected-bg animate-scale-in">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      className="flex-1 h-8 px-3 text-sm border border-border-focus rounded-md bg-card-bg focus:outline-none"
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') setEditingId(null); }}
                    />
                    <div className="flex gap-1.5">
                      {COLOR_OPTIONS.slice(0, 7).map(c => (
                        <button
                          key={c}
                          onClick={() => setFormColor(c)}
                          className={`w-5 h-5 rounded-full transition-all ${formColor === c ? 'ring-2 ring-offset-1 ring-amber-400' : ''}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <button onClick={handleSaveEdit} className="p-1.5 text-success hover:bg-success/10 rounded transition-colors">
                      <Check size={14} />
                    </button>
                    <button onClick={() => { setEditingId(null); resetForm(); }} className="p-1.5 text-text-tertiary hover:bg-hover-bg rounded transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={label.id}
                className="flex items-center gap-4 px-4 py-3 hover:bg-hover-bg transition-colors group"
              >
                <span
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: label.color }}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-text-primary">{label.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-white"
                    style={{ backgroundColor: label.color }}
                  >
                    <Tag size={10} />
                    {label.name}
                  </span>
                  <span className="text-xs text-text-tertiary font-mono w-12 text-right">
                    {count} {count === 1 ? 'issue' : 'issues'}
                  </span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  {isDeleting ? (
                    <div className="flex items-center gap-1 animate-scale-in">
                      <button
                        onClick={() => handleDelete(label.id)}
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
                        onClick={() => startEdit(label)}
                        className="p-1.5 text-text-tertiary hover:text-text-primary rounded hover:bg-page-bg transition-colors"
                        title="Edit label"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(label.id)}
                        className="p-1.5 text-text-tertiary hover:text-error rounded hover:bg-page-bg transition-colors"
                        title="Delete label"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredLabels.length === 0 && (
          <div className="py-8 text-center text-sm text-text-tertiary">
            {search ? `No labels matching "${search}"` : 'No labels yet'}
          </div>
        )}
      </div>
    </div>
  );
}
