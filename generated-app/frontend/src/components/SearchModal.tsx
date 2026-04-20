import { useState, useEffect, useRef } from 'react';
import { Search, X, Bookmark, Bug, CheckSquare, Zap, ListTodo } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSearch } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { ISSUE_TYPE_COLORS } from '../lib/utils';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Epic: <Zap size={14} />,
  Story: <Bookmark size={14} />,
  Bug: <Bug size={14} />,
  Task: <CheckSquare size={14} />,
  'Sub-task': <ListTodo size={14} />,
};

export default function SearchModal() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: results } = useSearch(query);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function selectIssue(issueId: string) {
    dispatch({ type: 'SELECT_ISSUE', id: issueId });
    dispatch({ type: 'SET_SEARCH', show: false });
  }

  function selectProject(projectId: string) {
    dispatch({ type: 'SET_PROJECT', id: projectId });
    dispatch({ type: 'SET_SEARCH', show: false });
    navigate(`/project/${projectId}/board`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => dispatch({ type: 'SET_SEARCH', show: false })}>
      <div className="fixed inset-0 bg-black/50 animate-fade-in" />
      <div
        className="relative bg-card-bg rounded-xl shadow-xl w-full max-w-xl animate-scale-in z-10 overflow-hidden"
        onClick={e => e.stopPropagation()}
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
                  {results.projects.map(project => (
                    <button
                      key={project.id}
                      onClick={() => selectProject(project.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-hover-bg transition-colors text-left"
                    >
                      <span
                        className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: project.color || '#52796F' }}
                      >
                        {project.key?.slice(0,2)}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{project.name}</div>
                        <div className="text-xs text-text-tertiary">{project.key}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.issues.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-[11px] font-medium text-text-tertiary uppercase tracking-wider">Issues</div>
                  {results.issues.map(issue => (
                    <button
                      key={issue.id}
                      onClick={() => selectIssue(issue.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-hover-bg transition-colors text-left"
                    >
                      <span style={{ color: ISSUE_TYPE_COLORS[issue.type] || '#8896A6' }}>
                        {TYPE_ICONS[issue.type] || <CheckSquare size={14} />}
                      </span>
                      <span className="text-xs text-text-tertiary font-mono shrink-0">{issue.key}</span>
                      <span className="text-sm truncate">{issue.summary}</span>
                    </button>
                  ))}
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
      </div>
    </div>
  );
}
