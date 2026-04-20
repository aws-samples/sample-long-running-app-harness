import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject, useUpdateProject, useDeleteProject } from '../hooks/useApi';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Archive } from 'lucide-react';

const PROJECT_COLORS = ['#1B4332', '#2D6A4F', '#52796F', '#D4A373', '#BC6C25', '#9B59B6', '#2196F3', '#E9C46A'];

export default function SettingsView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useProject(projectId);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { dispatch } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (project && !initialized) {
    setName(project.name);
    setDescription(project.description || '');
    setColor(project.color || PROJECT_COLORS[0]);
    setInitialized(true);
  }

  async function handleSave() {
    if (!projectId) return;
    try {
      await updateProject.mutateAsync({
        id: projectId,
        data: { name, description: description || undefined, color },
      });
      toast.success('Project updated');
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleDelete() {
    if (!projectId) return;
    try {
      await deleteProject.mutateAsync(projectId);
      dispatch({ type: 'SET_PROJECT', id: null });
      toast.success('Project deleted');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-lg space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-10 w-full" />
        <div className="skeleton h-10 w-full" />
        <div className="skeleton h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-lg animate-fade-in">
      <h1 className="font-display text-xl font-bold mb-6">Project Settings</h1>

      {project && (
        <div className="space-y-5">
          <div>
            <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Project Key</label>
            <input
              type="text"
              value={project.key}
              disabled
              className="w-32 h-10 px-3 text-sm border border-border rounded-md font-mono bg-page-bg text-text-tertiary cursor-not-allowed"
            />
            <p className="text-xs text-text-tertiary mt-1">Cannot be changed after creation</p>
          </div>

          <div>
            <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
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

          <button
            onClick={handleSave}
            disabled={updateProject.isPending}
            className="h-10 px-5 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium disabled:opacity-50"
          >
            {updateProject.isPending ? 'Saving...' : 'Save Changes'}
          </button>

          {/* Danger zone */}
          <div className="mt-10 pt-6 border-t border-border">
            <h3 className="font-display font-semibold text-error mb-3">Danger Zone</h3>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 h-9 px-4 text-sm border border-error/30 text-error rounded-md hover:bg-error/5 transition-colors"
              >
                <Trash2 size={14} /> Delete Project
              </button>
            ) : (
              <div className="bg-error/5 border border-error/20 rounded-lg p-4">
                <p className="text-sm text-error mb-3">
                  Are you sure? This will permanently delete the project and all its issues. This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleteProject.isPending}
                    className="h-9 px-4 text-sm bg-error text-white rounded-md hover:bg-error/90 transition-colors font-medium"
                  >
                    {deleteProject.isPending ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="h-9 px-4 text-sm border border-border rounded-md hover:bg-hover-bg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
