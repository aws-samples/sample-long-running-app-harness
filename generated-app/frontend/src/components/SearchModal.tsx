import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Bookmark, Bug, CheckSquare, Zap, ListTodo, ArrowDown, ArrowUp, CornerDownLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSearch } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { ISSUE_TYPE_COLORS, PRIORITY_COLORS, PRIORITY_ICONS } from '../lib/utils';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Epic: <Zap size={14} />,
  Story: <Bookmark size={14} />,
  Bug: <Bug size={14} />,
  Task: <CheckSquare size={14} />,
  'Sub-task': <ListTodo size={14} />,
};

const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done',
};

export default function SearchModal() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: results } = useSearch(query);

  const allItems = useMemo(() => {
    if (!results) return [];
    const items: { type: 'project' | 'issue'; id: string; data: any }[] = [];
    results.projects.forEach(p => items.push({ type: 'project', id: p.id, data: p }));
    results.issues.forEach(i => items.push({ type: 'issue', id: i.id, data: i }));
    return items;
  }, [results]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function selectIssue(issueId: string) {
    dispatch({ type: 'SELECT_ISSUE', id: issueId });
    dispatch({ type: 'SET_SEARCH', show: false });
  }

  function selectProject(projectId: string) {
    dispatch({ type: 'SET_PROJECT', id: projectId });
    dispatch({ type: 'SET_SEARCH', show: false });
    navigate(`/project/${projectId}/board`);
  }

  function selectItem(item: typeof allItems[0]) {
    if (item.type === 'project') selectProject(item.id);
    else selectIssue(item.id);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && allItems[selectedIndex]) {
      e.preventDefault();
      selectItem(allItems[selectedIndex]);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => dispatch({ type: 'SET_SEARCH', show: false })}>
      <div className="fixed inset-0 bg-black/50 animate-fade-in" />
      <div
        className="relative bg-card-bg rounded-xl shadow-xl w-full max-w-xl animate-scale-in z-10 overflow-hidden"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={18} className="text-text-tertiary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search issues, projects..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 hover:bg-hover-bg rounded transition-colors">
              <X size={14} />
            </button>
          )}
          <kbd className="text-[10px] bg-page-bg px-1.5 py-0.5 rounded border border-border font-mono text-text-tertiary">ESC</kbd>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {!query && (
            <div className="p-8 text-center text-text-tertiary text-sm">
              Start typing to search across all issues and projects
            </div>
          )}

          {query && results && (
            <div className="py-1">
              {results.projects.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-[11px] font-medium text-text-tertiary uppercase tracking-wider">Projects</div>
                  {results.projects.map((project, pi) => {
                    const itemIdx = pi;
                    return (
                      <button
                        key={project.id}
                        onClick={() => selectProject(project.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-hover-bg transition-colors text-left ${
                          selectedIndex === itemIdx ? 'bg-selected-bg' : ''
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: project.color || '#52796F' }}
                        >
                          {project.key?.slice(0,2)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{highlightMatch(project.name, query)}</div>
                          <div className="text-xs text-text-tertiary font-mono">{project.key}</div>
                        </div>
                        {selectedIndex === itemIdx && (
                          <CornerDownLeft size={12} className="text-text-tertiary shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {results.issues.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
                    Issues ({results.issues.length})
                  </div>
                  {results.issues.map((issue, ii) => {
                    const itemIdx = results.projects.length + ii;
                    return (
                      <button
                        key={issue.id}
                        onClick={() => selectIssue(issue.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-hover-bg transition-colors text-left ${
                          selectedIndex === itemIdx ? 'bg-selected-bg' : ''
                        }`}
                      >
                        <span style={{ color: ISSUE_TYPE_COLORS[issue.type] || '#8896A6' }} className="shrink-0">
                          {TYPE_ICONS[issue.type] || <CheckSquare size={14} />}
                        </span>
                        <span className="text-xs text-text-tertiary font-mono shrink-0">{issue.key}</span>
                        <span className="text-sm flex-1 truncate">{highlightMatch(issue.summary, query)}</span>
                        <span className="text-[10px] shrink-0" style={{ color: PRIORITY_COLORS[issue.priority] }}>
                          {PRIORITY_ICONS[issue.priority]}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${
                          issue.status === 'done' ? 'bg-success/10 text-success' :
                          issue.status === 'in_progress' ? 'bg-info/10 text-info' :
                          issue.status === 'in_review' ? 'bg-warning/10 text-warning' :
                          'bg-page-bg text-text-tertiary'
                        }`}>
                          {STATUS_LABELS[issue.status] || issue.status}
                        </span>
                        {selectedIndex === itemIdx && (
                          <CornerDownLeft size={12} className="text-text-tertiary shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {results.total === 0 && (
                <div className="p-8 text-center text-text-tertiary text-sm">
                  No results found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer hints */}
        {query && results && results.total > 0 && (
          <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-[10px] text-text-tertiary">
            <span className="flex items-center gap-1"><ArrowUp size={10} /><ArrowDown size={10} /> Navigate</span>
            <span className="flex items-center gap-1"><CornerDownLeft size={10} /> Select</span>
            <span className="flex items-center gap-1">esc Close</span>
          </div>
        )}
      </div>
    </div>
  );
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-400/30 text-inherit rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}
