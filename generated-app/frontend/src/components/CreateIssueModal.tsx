import { useState } from 'react';
import { X, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCreateIssue, useSprints, useIssues } from '../hooks/useApi';
import { MOCK_USERS } from '../lib/users';
import { toast } from 'sonner';
import type { IssueType, Priority } from '@canopy/shared';

const ISSUE_TYPES: IssueType[] = ['Story', 'Bug', 'Task', 'Epic', 'Sub-task'];
const PRIORITIES: Priority[] = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];

const AVAILABLE_LABELS = [
  { name: 'frontend', color: '#2196F3' },
  { name: 'backend', color: '#40916C' },
  { name: 'bug-fix', color: '#BC6C25' },
  { name: 'tech-debt', color: '#9B59B6' },
  { name: 'urgent', color: '#E74C3C' },
  { name: 'documentation', color: '#E9C46A' },
  { name: 'design', color: '#F472B6' },
  { name: 'testing', color: '#8896A6' },
];

export default function CreateIssueModal() {
  const { state, dispatch } = useApp();
  const createIssue = useCreateIssue();

  const projectId = state.currentProjectId;
  const { data: sprints } = useSprints(projectId || undefined);
  const { data: allIssues } = useIssues(projectId || undefined);

  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<IssueType>('Task');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [storyPoints, setStoryPoints] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [sprintId, setSprintId] = useState('');
  const [epicId, setEpicId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [createAnother, setCreateAnother] = useState(false);
  const [showLabels, setShowLabels] = useState(false);

  const activeSprints = sprints?.filter(s => s.status !== 'completed') || [];
  const epics = allIssues?.filter(i => i.type === 'Epic') || [];

  function toggleLabel(label: string) {
    setSelectedLabels(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !summary.trim()) return;

    try {
      await createIssue.mutateAsync({
        projectId,
        data: {
          type,
          summary: summary.trim(),
          description: description.trim() || undefined,
          priority,
          storyPoints: storyPoints ? parseFloat(storyPoints) : undefined,
          labels: selectedLabels,
          components: [],
          sprintId: sprintId || undefined,
          epicId: epicId || undefined,
          assigneeId: assigneeId || undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        },
      });
      toast.success('Issue created successfully');
      if (createAnother) {
        setSummary('');
        setDescription('');
        setStoryPoints('');
        setDueDate('');
      } else {
        dispatch({ type: 'SET_CREATE_ISSUE', show: false });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create issue');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" onClick={() => dispatch({ type: 'SET_CREATE_ISSUE', show: false })}>
      <div className="fixed inset-0 bg-black/50 animate-fade-in" />
      <div
        className="relative bg-card-bg rounded-xl shadow-xl w-full max-w-lg p-6 animate-scale-in z-10 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold">Create Issue</h2>
          <button
            onClick={() => dispatch({ type: 'SET_CREATE_ISSUE', show: false })}
            className="p-1 rounded hover:bg-hover-bg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {!projectId ? (
          <p className="text-text-secondary text-sm">Please select a project first.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as IssueType)}
                  className="w-full h-9 px-3 text-sm bg-card-bg border border-border rounded-md focus:border-border-focus focus:outline-none"
                >
                  {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                  className="w-full h-9 px-3 text-sm bg-card-bg border border-border rounded-md focus:border-border-focus focus:outline-none"
                >
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Summary *</label>
              <input
                type="text"
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full h-9 px-3 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none"
                autoFocus
                required
                maxLength={255}
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add details, context, or acceptance criteria..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Assignee</label>
                <select
                  value={assigneeId}
                  onChange={e => setAssigneeId(e.target.value)}
                  className="w-full h-9 px-3 text-sm bg-card-bg border border-border rounded-md focus:border-border-focus focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {MOCK_USERS.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full h-9 px-3 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none bg-card-bg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Story Points</label>
                <input
                  type="number"
                  value={storyPoints}
                  onChange={e => setStoryPoints(e.target.value)}
                  placeholder="e.g. 3"
                  min="0.5"
                  max="100"
                  step="0.5"
                  className="w-full h-9 px-3 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Sprint</label>
                <select
                  value={sprintId}
                  onChange={e => setSprintId(e.target.value)}
                  className="w-full h-9 px-3 text-sm bg-card-bg border border-border rounded-md focus:border-border-focus focus:outline-none"
                >
                  <option value="">Backlog</option>
                  {activeSprints.map(s => (
                    <option key={s.id} value={s.id}>{s.name}{s.status === 'active' ? ' (Active)' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Epic selection (for non-epic types) */}
            {type !== 'Epic' && epics.length > 0 && (
              <div>
                <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Epic</label>
                <select
                  value={epicId}
                  onChange={e => setEpicId(e.target.value)}
                  className="w-full h-9 px-3 text-sm bg-card-bg border border-border rounded-md focus:border-border-focus focus:outline-none"
                >
                  <option value="">None</option>
                  {epics.map(epic => (
                    <option key={epic.id} value={epic.id}>{epic.key} – {epic.summary}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Labels */}
            <div>
              <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Labels</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLabels(!showLabels)}
                  className="w-full min-h-9 px-3 py-1.5 text-sm border border-border rounded-md bg-card-bg hover:bg-hover-bg transition-colors text-left flex items-center gap-1.5 flex-wrap"
                >
                  {selectedLabels.length > 0 ? (
                    selectedLabels.map(label => {
                      const labelInfo = AVAILABLE_LABELS.find(l => l.name === label);
                      return (
                        <span key={label} className="px-1.5 py-0.5 text-[10px] rounded-full font-medium"
                          style={{
                            backgroundColor: `${labelInfo?.color || '#8896A6'}22`,
                            color: labelInfo?.color || '#8896A6'
                          }}
                        >
                          {label}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-text-tertiary">Select labels...</span>
                  )}
                </button>
                {showLabels && (
                  <div className="absolute left-0 top-full mt-1 w-full bg-card-bg rounded-lg shadow-lg border border-border py-1 z-10 animate-slide-down max-h-48 overflow-y-auto">
                    {AVAILABLE_LABELS.map(label => {
                      const isSelected = selectedLabels.includes(label.name);
                      return (
                        <button
                          key={label.name}
                          type="button"
                          onClick={() => toggleLabel(label.name)}
                          className={`w-full text-left px-3 py-1.5 text-sm hover:bg-hover-bg transition-colors flex items-center gap-2 ${
                            isSelected ? 'bg-selected-bg' : ''
                          }`}
                        >
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: label.color }} />
                          <span className="flex-1">{label.name}</span>
                          {isSelected && <span className="text-amber-500 text-xs">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={createAnother}
                  onChange={e => setCreateAnother(e.target.checked)}
                  className="accent-amber-500"
                />
                Create another
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_CREATE_ISSUE', show: false })}
                  className="h-9 px-4 text-sm border border-border rounded-md hover:bg-hover-bg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!summary.trim() || createIssue.isPending}
                  className="h-9 px-4 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {createIssue.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>

            <p className="text-[10px] text-text-tertiary text-right">
              Tip: Press {navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}+Enter to create
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
