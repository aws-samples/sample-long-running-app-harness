import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProject } from '../hooks/useApi';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft, ArrowRight, Eye, TreePine, Rocket, Zap, Flame,
  Target, Wrench, BarChart3, Construction, Lightbulb, Palette,
  Smartphone, Lock
} from 'lucide-react';
import { toast } from 'sonner';

const PROJECT_COLORS = ['#1B4332', '#2D6A4F', '#52796F', '#D4A373', '#BC6C25', '#9B59B6', '#2196F3', '#E9C46A'];

const PROJECT_ICONS = [
  { name: 'tree', icon: TreePine, label: 'Tree' },
  { name: 'rocket', icon: Rocket, label: 'Rocket' },
  { name: 'zap', icon: Zap, label: 'Lightning' },
  { name: 'flame', icon: Flame, label: 'Fire' },
  { name: 'target', icon: Target, label: 'Target' },
  { name: 'wrench', icon: Wrench, label: 'Tools' },
  { name: 'chart', icon: BarChart3, label: 'Chart' },
  { name: 'build', icon: Construction, label: 'Build' },
  { name: 'idea', icon: Lightbulb, label: 'Idea' },
  { name: 'design', icon: Palette, label: 'Design' },
  { name: 'mobile', icon: Smartphone, label: 'Mobile' },
  { name: 'security', icon: Lock, label: 'Security' },
];

function getProjectIconComponent(iconName: string) {
  const found = PROJECT_ICONS.find(i => i.name === iconName);
  if (!found) return null;
  const Icon = found.icon;
  return <Icon size={16} />;
}

export default function CreateProject() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const createProject = useCreateProject();

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [icon, setIcon] = useState('');

  function handleNameChange(v: string) {
    setName(v);
    if (!key || key === name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4)) {
      setKey(v.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !key.trim()) return;

    try {
      const project = await createProject.mutateAsync({
        name: name.trim(),
        key: key.toUpperCase(),
        description: description.trim() || undefined,
        color,
        icon: icon || undefined,
      });
      dispatch({ type: 'SET_PROJECT', id: project.id });
      toast.success('Project created!');
      navigate(`/project/${project.id}/board`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project');
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-slide-in-up">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="font-display text-2xl font-bold mb-2">Create New Project</h1>
      <p className="text-sm text-text-secondary mb-8">Set up a new project to start tracking issues and sprints.</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-3">
          <div>
            <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. My Awesome Project"
              className="w-full h-10 px-3 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none"
              autoFocus
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Project Key *</label>
            <input
              type="text"
              value={key}
              onChange={e => setKey(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 10))}
              placeholder="e.g. MAP"
              className="w-32 h-10 px-3 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none font-mono uppercase"
              required
            />
            <p className="text-xs text-text-tertiary mt-1">2-10 uppercase letters. Used in issue keys like {key || 'KEY'}-1</p>
          </div>

          <div>
            <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's this project about?"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-2">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {PROJECT_ICONS.map(({ name: iconName, icon: IconComp, label }) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(icon === iconName ? '' : iconName)}
                  title={label}
                  className={`w-9 h-9 rounded-md flex items-center justify-center transition-all border ${
                    icon === iconName
                      ? 'border-amber-500 bg-amber-500/10 text-amber-600 scale-110'
                      : 'border-border text-text-secondary hover:border-border-focus hover:text-text-primary hover:scale-105'
                  }`}
                >
                  <IconComp size={18} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-2">Color</label>
            <div className="flex gap-2">
              {PROJECT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-amber-500 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-10 px-5 text-sm border border-border rounded-md hover:bg-hover-bg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !key.trim() || key.length < 2 || createProject.isPending}
              className="h-10 px-5 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
            >
              {createProject.isPending ? 'Creating...' : (
                <>Create Project <ArrowRight size={14} /></>
              )}
            </button>
          </div>
        </form>

        {/* Live preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-6">
            <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary uppercase tracking-wider mb-3">
              <Eye size={12} /> Preview
            </div>
            <div className="bg-card-bg rounded-lg border border-border p-5 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0 transition-colors"
                  style={{ backgroundColor: color }}
                >
                  {icon ? getProjectIconComponent(icon) : (key?.slice(0, 2) || '??')}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-display font-semibold truncate">
                    {name || 'Project Name'}
                  </div>
                  <div className="text-xs text-text-tertiary font-mono">{key || 'KEY'}</div>
                </div>
              </div>
              {(description || !name) && (
                <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                  {description || 'Your project description will appear here...'}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-text-tertiary">
                <span>0 issues</span>
                <span>·</span>
                <span>Created just now</span>
              </div>
            </div>
            <p className="text-[10px] text-text-tertiary mt-2 text-center">
              This is how your project will look on the dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { PROJECT_ICONS, getProjectIconComponent };
