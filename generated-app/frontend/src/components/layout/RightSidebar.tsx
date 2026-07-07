import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useProjects, useIssues } from '../../hooks/useApi';
import { MOCK_USERS } from '../../lib/users';
import {
  Activity, Users, StickyNote, CalendarDays, PanelRightClose, PanelRightOpen,
  Circle, CheckCircle2, AlertCircle, Clock, ArrowRight, Plus, Trash2
} from 'lucide-react';

type TabId = 'activity' | 'team' | 'notes' | 'calendar';

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  { id: 'activity', label: 'Activity', icon: <Activity size={16} /> },
  { id: 'team', label: 'Team', icon: <Users size={16} /> },
  { id: 'notes', label: 'Notes', icon: <StickyNote size={16} /> },
  { id: 'calendar', label: 'Calendar', icon: <CalendarDays size={16} /> },
];

export default function RightSidebar() {
  const { state, dispatch } = useApp();
  const { rightSidebarOpen, rightSidebarTab, selectedIssueId } = state;

  // Don't show right sidebar when issue detail panel is open
  if (selectedIssueId) return null;

  if (!rightSidebarOpen) {
    return (
      <aside
        data-testid="right-sidebar-collapsed"
        className="w-[52px] bg-sidebar-bg border-l border-border flex flex-col items-center py-3 gap-1 shrink-0 transition-all duration-200"
      >
        <button
          onClick={() => dispatch({ type: 'TOGGLE_RIGHT_SIDEBAR' })}
          className="p-2 rounded-md text-text-secondary hover:bg-hover-bg transition-colors mb-2"
          title="Expand panel"
        >
          <PanelRightOpen size={18} />
        </button>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => dispatch({ type: 'SET_RIGHT_SIDEBAR_TAB', tab: tab.id })}
            className={`p-2 rounded-md transition-colors ${
              rightSidebarTab === tab.id
                ? 'bg-selected-bg text-amber-600'
                : 'text-text-secondary hover:bg-hover-bg hover:text-text-primary'
            }`}
            title={tab.label}
          >
            {tab.icon}
          </button>
        ))}
      </aside>
    );
  }

  return (
    <aside
      data-testid="right-sidebar"
      className="w-[280px] bg-sidebar-bg border-l border-border flex flex-col shrink-0 transition-all duration-200 overflow-hidden"
    >
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
        <div className="flex items-center gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: 'SET_RIGHT_SIDEBAR_TAB', tab: tab.id })}
              className={`flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-medium transition-all rounded-md ${
                rightSidebarTab === tab.id
                  ? 'text-amber-600 bg-amber-500/10'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-hover-bg'
              }`}
              title={tab.label}
              data-testid={`right-tab-${tab.id}`}
            >
              {tab.icon}
              {rightSidebarTab === tab.id && <span>{tab.label}</span>}
            </button>
          ))}
        </div>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_RIGHT_SIDEBAR' })}
          className="p-1.5 rounded-md text-text-tertiary hover:bg-hover-bg transition-colors shrink-0"
          title="Collapse panel"
          data-testid="right-sidebar-collapse"
        >
          <PanelRightClose size={14} />
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {rightSidebarTab === 'activity' && <ActivityTab />}
        {rightSidebarTab === 'team' && <TeamTab />}
        {rightSidebarTab === 'notes' && <NotesTab />}
        {rightSidebarTab === 'calendar' && <CalendarTab />}
      </div>
    </aside>
  );
}

// ==================== Activity Tab ====================
function ActivityTab() {
  const { state } = useApp();
  const { data: issues } = useIssues(state.currentProjectId || undefined);

  // Generate activity from issues
  const activities = generateActivities(issues || []);

  return (
    <div className="p-3">
      <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Recent Activity</h3>
      {activities.length === 0 ? (
        <div className="text-center py-8 text-text-tertiary text-xs">
          <Activity size={24} className="mx-auto mb-2 opacity-40" />
          <p>No recent activity</p>
          <p className="mt-1 text-text-tertiary/60">Activity will appear here as you work</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {activities.map((activity, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-2 rounded-md hover:bg-hover-bg transition-colors group"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <div className={`mt-0.5 shrink-0 ${activity.color}`}>
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-primary leading-relaxed line-clamp-2">
                  {activity.message}
                </p>
                <p className="text-[10px] text-text-tertiary mt-0.5">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ActivityItem {
  icon: React.ReactNode;
  message: string;
  time: string;
  color: string;
}

function generateActivities(issues: any[]): ActivityItem[] {
  const activities: ActivityItem[] = [];
  const now = Date.now();

  // Sort issues by updatedAt or createdAt
  const sorted = [...issues].sort((a, b) => {
    const aDate = new Date(a.updatedAt || a.createdAt).getTime();
    const bDate = new Date(b.updatedAt || b.createdAt).getTime();
    return bDate - aDate;
  });

  for (const issue of sorted.slice(0, 12)) {
    const created = new Date(issue.createdAt).getTime();
    const updated = issue.updatedAt ? new Date(issue.updatedAt).getTime() : created;
    const timeDiff = now - updated;

    if (issue.status === 'done') {
      activities.push({
        icon: <CheckCircle2 size={14} />,
        message: `${issue.key || 'Issue'} "${issue.summary}" completed`,
        time: formatTimeAgo(timeDiff),
        color: 'text-emerald-500',
      });
    } else if (issue.status === 'in_progress') {
      activities.push({
        icon: <ArrowRight size={14} />,
        message: `${issue.key || 'Issue'} "${issue.summary}" moved to In Progress`,
        time: formatTimeAgo(timeDiff),
        color: 'text-blue-500',
      });
    } else if (issue.priority === 'Highest' || issue.priority === 'High') {
      activities.push({
        icon: <AlertCircle size={14} />,
        message: `${issue.key || 'Issue'} "${issue.summary}" marked ${issue.priority}`,
        time: formatTimeAgo(timeDiff),
        color: 'text-rose-500',
      });
    } else {
      activities.push({
        icon: <Circle size={14} />,
        message: `${issue.key || 'Issue'} "${issue.summary}" created`,
        time: formatTimeAgo(timeDiff),
        color: 'text-text-tertiary',
      });
    }
  }

  return activities.slice(0, 10);
}

function formatTimeAgo(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

// ==================== Team Tab ====================
function TeamTab() {
  const { state } = useApp();
  const { data: issues } = useIssues(state.currentProjectId || undefined);

  // Count issues per user
  const userStats = MOCK_USERS.map(user => {
    const assigned = (issues || []).filter(i => i.assigneeId === user.id);
    const completed = assigned.filter(i => i.status === 'done');
    const inProgress = assigned.filter(i => i.status === 'in_progress');
    return { user, total: assigned.length, completed: completed.length, inProgress: inProgress.length };
  });

  return (
    <div className="p-3">
      <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Team Members</h3>
      <div className="space-y-1">
        {userStats.map(({ user, total, completed, inProgress }, idx) => (
          <div
            key={user.id}
            className="flex items-center gap-2.5 p-2 rounded-md hover:bg-hover-bg transition-colors"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
              style={{ backgroundColor: user.color }}
            >
              {user.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">{user.name}</p>
              <p className="text-[10px] text-text-tertiary">{user.role}</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              {inProgress > 0 && (
                <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-600 rounded-full font-medium">
                  {inProgress} active
                </span>
              )}
              {total > 0 && (
                <span className="px-1.5 py-0.5 bg-page-bg text-text-tertiary rounded-full">
                  {completed}/{total}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Team summary */}
      <div className="mt-4 p-3 bg-page-bg rounded-lg border border-border">
        <h4 className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">Summary</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center">
            <p className="text-lg font-bold text-text-primary font-display">{MOCK_USERS.length}</p>
            <p className="text-[10px] text-text-tertiary">Members</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-amber-600 font-display">
              {userStats.reduce((s, u) => s + u.inProgress, 0)}
            </p>
            <p className="text-[10px] text-text-tertiary">Active Tasks</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Notes Tab ====================
interface Note {
  id: string;
  text: string;
  createdAt: string;
}

function NotesTab() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const stored = localStorage.getItem('canopy_quick_notes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    localStorage.setItem('canopy_quick_notes', JSON.stringify(notes));
  }, [notes]);

  function addNote() {
    if (!newNote.trim()) return;
    const note: Note = {
      id: crypto.randomUUID(),
      text: newNote.trim(),
      createdAt: new Date().toISOString(),
    };
    setNotes(prev => [note, ...prev]);
    setNewNote('');
  }

  function deleteNote(id: string) {
    setNotes(prev => prev.filter(n => n.id !== id));
  }

  return (
    <div className="p-3">
      <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Quick Notes</h3>

      {/* Add note input */}
      <div className="flex gap-1.5 mb-3">
        <input
          type="text"
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addNote(); }}
          placeholder="Add a quick note..."
          className="flex-1 h-8 px-2.5 text-xs border border-border rounded-md focus:border-amber-400 focus:outline-none bg-card-bg"
          data-testid="notes-input"
        />
        <button
          onClick={addNote}
          disabled={!newNote.trim()}
          className="h-8 w-8 flex items-center justify-center bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors disabled:opacity-40"
          title="Add note"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="text-center py-8 text-text-tertiary text-xs">
          <StickyNote size={24} className="mx-auto mb-2 opacity-40" />
          <p>No notes yet</p>
          <p className="mt-1 text-text-tertiary/60">Jot down quick thoughts here</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {notes.map((note, idx) => (
            <div
              key={note.id}
              className="group flex items-start gap-2 p-2 bg-card-bg rounded-md border border-border hover:border-amber-400/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-primary leading-relaxed">{note.text}</p>
                <p className="text-[9px] text-text-tertiary mt-1">
                  {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <button
                onClick={() => deleteNote(note.id)}
                className="shrink-0 p-1 rounded text-text-tertiary opacity-0 group-hover:opacity-100 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                title="Delete note"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== Calendar Tab ====================
function CalendarTab() {
  const { state } = useApp();
  const { data: issues } = useIssues(state.currentProjectId || undefined);

  const now = new Date();
  const upcomingIssues = (issues || [])
    .filter(i => i.dueDate && i.status !== 'done')
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 10);

  // Group by relative time
  const overdue = upcomingIssues.filter(i => new Date(i.dueDate!) < now);
  const thisWeek = upcomingIssues.filter(i => {
    const due = new Date(i.dueDate!);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return due >= now && due <= weekEnd;
  });
  const later = upcomingIssues.filter(i => {
    const due = new Date(i.dueDate!);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return due > weekEnd;
  });

  return (
    <div className="p-3">
      <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Upcoming Deadlines</h3>

      {upcomingIssues.length === 0 ? (
        <div className="text-center py-8 text-text-tertiary text-xs">
          <CalendarDays size={24} className="mx-auto mb-2 opacity-40" />
          <p>No upcoming deadlines</p>
          <p className="mt-1 text-text-tertiary/60">Issues with due dates will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {overdue.length > 0 && (
            <CalendarSection title="Overdue" items={overdue} color="text-rose-500" bgColor="bg-rose-500/10" />
          )}
          {thisWeek.length > 0 && (
            <CalendarSection title="This Week" items={thisWeek} color="text-amber-600" bgColor="bg-amber-500/10" />
          )}
          {later.length > 0 && (
            <CalendarSection title="Later" items={later} color="text-text-secondary" bgColor="bg-page-bg" />
          )}
        </div>
      )}

      {/* Mini month view */}
      <div className="mt-4 p-3 bg-page-bg rounded-lg border border-border">
        <MiniCalendar issues={upcomingIssues} />
      </div>
    </div>
  );
}

function CalendarSection({ title, items, color, bgColor }: { title: string; items: any[]; color: string; bgColor: string }) {
  const { dispatch } = useApp();
  return (
    <div>
      <div className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${color}`}>{title}</div>
      <div className="space-y-1">
        {items.map(issue => (
          <button
            key={issue.id}
            onClick={() => dispatch({ type: 'SELECT_ISSUE', id: issue.id })}
            className={`w-full flex items-center gap-2 p-2 rounded-md ${bgColor} hover:bg-hover-bg transition-colors text-left`}
          >
            <Clock size={12} className={color} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-primary truncate">{issue.summary}</p>
              <p className="text-[10px] text-text-tertiary">
                {new Date(issue.dueDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {issue.key && ` · ${issue.key}`}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MiniCalendar({ issues }: { issues: any[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  // Dates with due issues
  const dueDates = new Set(
    issues
      .filter(i => {
        const d = new Date(i.dueDate!);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .map(i => new Date(i.dueDate!).getDate())
  );

  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div>
      <p className="text-[10px] font-semibold text-text-secondary text-center mb-2">{monthName}</p>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {dayNames.map(d => (
          <div key={d} className="text-[8px] text-text-tertiary font-medium py-0.5">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = day === today;
          const hasDue = dueDates.has(day);
          return (
            <div
              key={day}
              className={`text-[9px] py-0.5 rounded-sm relative ${
                isToday
                  ? 'bg-amber-500 text-white font-bold'
                  : hasDue
                  ? 'bg-rose-500/15 text-rose-600 font-medium'
                  : 'text-text-secondary'
              }`}
            >
              {day}
              {hasDue && !isToday && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-rose-500 rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
