import { Tag, Plus } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useProject } from '../hooks/useApi';
import { useState } from 'react';

const DEFAULT_LABELS = [
  { name: 'Bug', color: '#E74C3C' },
  { name: 'Feature', color: '#3498DB' },
  { name: 'Enhancement', color: '#2ECC71' },
  { name: 'Documentation', color: '#9B59B6' },
  { name: 'Design', color: '#E67E22' },
  { name: 'Performance', color: '#1ABC9C' },
  { name: 'Security', color: '#E91E63' },
  { name: 'Technical Debt', color: '#607D8B' },
];

export default function LabelsView() {
  const { projectId } = useParams();
  const { data: project } = useProject(projectId!);
  const [labels] = useState(DEFAULT_LABELS);

  return (
    <div className="p-6 max-w-4xl animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-text-primary">Labels</h1>
        {project && (
          <p className="text-sm text-text-tertiary mt-1">{project.name}</p>
        )}
      </div>

      <div className="bg-card-bg rounded-xl border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-sm text-text-secondary font-medium">
            {labels.length} labels
          </span>
          <button className="flex items-center gap-1.5 bg-forest-700 hover:bg-forest-800 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-colors">
            <Plus size={14} />
            New Label
          </button>
        </div>

        <div className="divide-y divide-border">
          {labels.map((label) => (
            <div
              key={label.name}
              className="flex items-center gap-4 px-4 py-3 hover:bg-hover-bg transition-colors group"
            >
              <span
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: label.color }}
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-text-primary">{label.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: label.color }}
                >
                  <Tag size={10} />
                  {label.name}
                </span>
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
    </div>
  );
}
