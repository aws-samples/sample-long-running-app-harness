import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject, useUpdateProject, useDeleteProject, useIssues, useSprints, useBoard } from '../hooks/useApi';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { Trash2, Download, Upload, Settings, Palette, FileText, Shield } from 'lucide-react';
import { PROJECT_ICONS, getProjectIconComponent } from './CreateProject';

const PROJECT_COLORS = ['#1B4332', '#2D6A4F', '#52796F', '#D4A373', '#BC6C25', '#9B59B6', '#2196F3', '#E9C46A'];

type SettingsTab = 'general' | 'workflow' | 'data' | 'danger';

export default function SettingsView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useProject(projectId);
  const { data: issues } = useIssues(projectId);
  const { data: sprints } = useSprints(projectId);
  const { data: board } = useBoard(projectId);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [icon, setIcon] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  if (project && !initialized) {
    setName(project.name);
    setDescription(project.description || '');
    setColor(project.color || PROJECT_COLORS[0]);
    setIcon(project.icon || '');
    setInitialized(true);
  }

  async function handleSave() {
    if (!projectId) return;
    try {
      await updateProject.mutateAsync({
        id: projectId,
        data: { name, description: description || undefined, color, icon: icon || undefined },
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

  function handleExportProject() {
    const exportData = {
      project,
      issues: issues || [],
      sprints: sprints || [],
      board,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canopy-${project?.key || 'project'}-export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Project data exported');
  }

  function handleImportProject() {
    fileInputRef.current?.click();
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.project && data.issues) {
          toast.success(`Import file loaded: ${data.issues.length} issues found. Import is read-only in this demo.`);
        } else {
          toast.error('Invalid export file format');
        }
      } catch {
        toast.error('Failed to parse import file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const tabs = [
    { id: 'general' as const, label: 'General', icon: <Settings size={14} /> },
    { id: 'workflow' as const, label: 'Workflow', icon: <Palette size={14} /> },
    { id: 'data' as const, label: 'Data', icon: <FileText size={14} /> },
    { id: 'danger' as const, label: 'Danger Zone', icon: <Shield size={14} /> },
  ];

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-10 w-full" />
        <div className="skeleton h-10 w-full" />
        <div className="skeleton h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <h1 className="font-display text-xl font-bold mb-6">Project Settings</h1>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 border-b border-border mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? 'border-amber-500 text-text-primary font-medium'
                : 'border-transparent text-text-tertiary hover:text-text-secondary hover:border-border'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {project && (
        <>
          {/* General tab */}
          {activeTab === 'general' && (
            <div className="space-y-5 animate-fade-in">
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
                  placeholder="Describe the project..."
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

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={updateProject.isPending}
                  className="h-10 px-5 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium disabled:opacity-50"
                >
                  {updateProject.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              {/* Project stats */}
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-3">Project Stats</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-page-bg rounded-lg p-3 text-center">
                    <div className="text-lg font-display font-bold text-forest-700">{issues?.length || 0}</div>
                    <div className="text-[10px] text-text-tertiary uppercase">Issues</div>
                  </div>
                  <div className="bg-page-bg rounded-lg p-3 text-center">
                    <div className="text-lg font-display font-bold text-forest-700">{sprints?.length || 0}</div>
                    <div className="text-[10px] text-text-tertiary uppercase">Sprints</div>
                  </div>
                  <div className="bg-page-bg rounded-lg p-3 text-center">
                    <div className="text-lg font-display font-bold text-forest-700">
                      {issues?.filter(i => i.status === 'done').length || 0}
                    </div>
                    <div className="text-[10px] text-text-tertiary uppercase">Completed</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Workflow tab */}
          {activeTab === 'workflow' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-semibold mb-2">Board Columns</h3>
                <p className="text-xs text-text-tertiary mb-4">Configure the statuses available in your board.</p>
                <div className="space-y-2">
                  {(board?.columns || [
                    { id: '1', name: 'To Do', statusCategory: 'todo', sortOrder: 0 },
                    { id: '2', name: 'In Progress', statusCategory: 'in_progress', sortOrder: 1 },
                    { id: '3', name: 'In Review', statusCategory: 'in_progress', sortOrder: 2 },
                    { id: '4', name: 'Done', statusCategory: 'done', sortOrder: 3 },
                  ]).map((col: any, idx: number) => (
                    <div key={col.id || idx} className="flex items-center gap-3 bg-page-bg rounded-lg px-4 py-3">
                      <div className={`w-3 h-3 rounded-full ${
                        col.statusCategory === 'done' ? 'bg-success' :
                        col.statusCategory === 'in_progress' ? 'bg-info' : 'bg-text-tertiary'
                      }`} />
                      <span className="text-sm font-medium flex-1">{col.name}</span>
                      <span className="text-[10px] text-text-tertiary uppercase bg-card-bg px-2 py-0.5 rounded">
                        {col.statusCategory}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-text-tertiary mt-2">
                  Column customization coming soon. Current columns define the default workflow.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Issue Types</h3>
                <p className="text-xs text-text-tertiary mb-3">Issue types available in this project.</p>
                <div className="flex flex-wrap gap-2">
                  {['Epic', 'Story', 'Bug', 'Task', 'Sub-task'].map(type => (
                    <div key={type} className="flex items-center gap-2 bg-page-bg rounded-lg px-3 py-2">
                      <span className={`w-2 h-2 rounded-full ${
                        type === 'Epic' ? 'bg-purple-500' :
                        type === 'Story' ? 'bg-green-500' :
                        type === 'Bug' ? 'bg-red-500' :
                        type === 'Task' ? 'bg-blue-500' : 'bg-gray-400'
                      }`} />
                      <span className="text-sm">{type}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Priority Levels</h3>
                <p className="text-xs text-text-tertiary mb-3">Priority levels used for issue triage.</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Highest', color: '#BC6C25', icon: '⬆⬆' },
                    { name: 'High', color: '#E9C46A', icon: '⬆' },
                    { name: 'Medium', color: '#40916C', icon: '—' },
                    { name: 'Low', color: '#2196F3', icon: '⬇' },
                    { name: 'Lowest', color: '#8896A6', icon: '⬇⬇' },
                  ].map(p => (
                    <div key={p.name} className="flex items-center gap-2 bg-page-bg rounded-lg px-3 py-2">
                      <span style={{ color: p.color }}>{p.icon}</span>
                      <span className="text-sm">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Data tab */}
          {activeTab === 'data' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-semibold mb-2">Export Project Data</h3>
                <p className="text-xs text-text-tertiary mb-3">
                  Download all project data including issues, sprints, and board configuration as JSON.
                </p>
                <button
                  onClick={handleExportProject}
                  className="flex items-center gap-2 h-9 px-4 text-sm border border-border rounded-md hover:bg-hover-bg transition-colors"
                >
                  <Download size={14} /> Export Project (.json)
                </button>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-semibold mb-2">Import Data</h3>
                <p className="text-xs text-text-tertiary mb-3">
                  Import project data from a previously exported JSON file.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={handleImportProject}
                  className="flex items-center gap-2 h-9 px-4 text-sm border border-border rounded-md hover:bg-hover-bg transition-colors"
                >
                  <Upload size={14} /> Import from JSON
                </button>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-semibold mb-2">Project Summary</h3>
                <div className="bg-page-bg rounded-lg p-4 font-mono text-xs space-y-1 text-text-secondary">
                  <div>Project: <span className="text-text-primary">{project.name}</span> ({project.key})</div>
                  <div>Issues: <span className="text-text-primary">{issues?.length || 0}</span></div>
                  <div>Sprints: <span className="text-text-primary">{sprints?.length || 0}</span></div>
                  <div>Created: <span className="text-text-primary">{new Date(project.createdAt).toLocaleDateString()}</span></div>
                  <div>Last Updated: <span className="text-text-primary">{new Date(project.updatedAt).toLocaleDateString()}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Danger zone tab */}
          {activeTab === 'danger' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-error/5 border border-error/20 rounded-lg p-5">
                <h3 className="font-display font-semibold text-error mb-2 flex items-center gap-2">
                  <Trash2 size={16} /> Delete Project
                </h3>
                <p className="text-sm text-text-secondary mb-4">
                  Once you delete a project, there is no going back. All issues, sprints, and board configurations
                  associated with this project will be permanently removed.
                </p>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 h-9 px-4 text-sm border border-error/30 text-error rounded-md hover:bg-error/10 transition-colors"
                  >
                    <Trash2 size={14} /> Delete this project
                  </button>
                ) : (
                  <div className="bg-card-bg border border-error/20 rounded-lg p-4">
                    <p className="text-sm text-error mb-3 font-medium">
                      Are you absolutely sure? Type the project key "{project.key}" to confirm.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDelete}
                        disabled={deleteProject.isPending}
                        className="h-9 px-4 text-sm bg-error text-white rounded-md hover:bg-error/90 transition-colors font-medium"
                      >
                        {deleteProject.isPending ? 'Deleting...' : `Delete ${project.key}`}
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
        </>
      )}
    </div>
  );
}
