import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProject } from '../hooks/useApi';
import { useApp } from '../context/AppContext';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const PROJECT_COLORS = ['#1B4332', '#2D6A4F', '#52796F', '#D4A373', '#BC6C25', '#9B59B6', '#2196F3', '#E9C46A'];

export default function CreateProject() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const createProject = useCreateProject();

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);

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
      });
      dispatch({ type: 'SET_PROJECT', id: project.id });
      toast.success('Project created!');
      navigate(`/project/${project.id}/board`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project');
    }
  }

  return (
    <div className="max-w-lg mx-auto animate-slide-in-up">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="font-display text-2xl font-bold mb-6">Create New Project</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
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
            disabled={!name.trim() || !key.trim() || createProject.isPending}
            className="h-10 px-5 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors disabled:opacity-50 font-medium"
          >
            {createProject.isPending ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
