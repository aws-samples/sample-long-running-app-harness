import { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCreateIssue } from '../hooks/useApi';
import { toast } from 'sonner';
import type { IssueType, Priority } from '@canopy/shared';

const ISSUE_TYPES: IssueType[] = ['Story', 'Bug', 'Task', 'Epic', 'Sub-task'];
const PRIORITIES: Priority[] = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];

export default function CreateIssueModal() {
  const { state, dispatch } = useApp();
  const createIssue = useCreateIssue();

  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<IssueType>('Task');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [storyPoints, setStoryPoints] = useState('');
  const [createAnother, setCreateAnother] = useState(false);

  const projectId = state.currentProjectId;

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
          labels: [],
          components: [],
        },
      });
      toast.success('Issue created successfully');
      if (createAnother) {
        setSummary('');
        setDescription('');
        setStoryPoints('');
      } else {
        dispatch({ type: 'SET_CREATE_ISSUE', show: false });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create issue');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" onClick={() => dispatch({ type: 'SET_CREATE_ISSUE', show: false })}>
      <div className="fixed inset-0 bg-black/50 animate-fade-in" />
      <div
        className="relative bg-card-bg rounded-xl shadow-xl w-full max-w-lg p-6 animate-scale-in z-10"
        onClick={e => e.stopPropagation()}
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
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider block mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add details, context, or acceptance criteria..."
                rows={4}
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none resize-none"
              />
            </div>

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
                className="w-32 h-9 px-3 text-sm border border-border rounded-md focus:border-border-focus focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
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
          </form>
        )}
      </div>
    </div>
  );
}
