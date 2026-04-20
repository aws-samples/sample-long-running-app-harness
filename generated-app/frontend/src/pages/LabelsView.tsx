import { Tag, Plus, Search } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useProject, useIssues } from '../hooks/useApi';
import { useState, useMemo } from 'react';

const DEFAULT_LABELS = [
  { name: 'Bug', color: '#E74C3C' },
  { name: 'Feature', color: '#3498DB' },
  { name: 'Enhancement', color: '#2ECC71' },
  { name: 'Documentation', color: '#9B59B6' },
  { name: 'Design', color: '#E67E22' },
  { name: 'Performance', color: '#1ABC9C' },
  { name: 'Security', color: '#E91E63' },
  { name: 'Technical Debt', color: '#607D8B' },
  { name: 'UX', color: '#FF9800' },
  { name: 'Accessibility', color: '#00BCD4' },
];

export default function LabelsView() {
  const { projectId } = useParams();
  const { data: project } = useProject(projectId!);
  const { data: issues } = useIssues(projectId);
  const [labels] = useState(DEFAULT_LABELS);
  const [search, setSearch] = useState('');

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

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-xl font-bold">Labels</h1>
          {project && <p className="text-sm text-text-secondary">{project.name}</p>}
        </div>
        <button className="flex items-center gap-1.5 h-8 px-3 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium">
          <Plus size={14} /> New Label
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card-bg rounded-lg border border-border px-4 py-3 text-center">
          <div className="text-lg font-display font-bold">{labels.length}</div>
          <div className="text-[10px] text-text-tertiary uppercase">Labels</div>
        </div>
        <div className="bg-card-bg rounded-lg border border-border px-4 py-3 text-center">
          <div className="text-lg font-display font-bold text-info">{totalUsage}</div>
          <div className="text-[10px] text-text-tertiary uppercase">Total Uses</div>
        </div>
        <div className="bg-card-bg rounded-lg border border-border px-4 py-3 text-center">
          <div className="text-lg font-display font-bold text-success">
            {Object.keys(labelCounts).length}
          </div>
          <div className="text-[10px] text-text-tertiary uppercase">Active Labels</div>
        </div>
      </div>

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
            return (
              <div
                key={label.name}
                className="flex items-center gap-4 px-4 py-3 hover:bg-hover-bg transition-colors group"
              >
                <span
                  className="w-4 h-4 rounded-full shrink-0 ring-2 ring-offset-1"
                  style={{ backgroundColor: label.color, ringColor: label.color + '40' }}
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
                  <button className="text-xs text-text-tertiary hover:text-text-primary px-2 py-1 rounded hover:bg-page-bg transition-colors">
                    Edit
                  </button>
                  <button className="text-xs text-error hover:text-red-600 px-2 py-1 rounded hover:bg-page-bg transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredLabels.length === 0 && (
          <div className="py-8 text-center text-sm text-text-tertiary">
            No labels matching "{search}"
          </div>
        )}
      </div>
    </div>
  );
}
