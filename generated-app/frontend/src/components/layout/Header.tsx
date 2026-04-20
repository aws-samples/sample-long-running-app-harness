import { Search, Plus, TreePine, ChevronDown, Menu, Moon, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useProjects } from '../../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const { state, dispatch } = useApp();
  const { data: projects } = useProjects();
  const navigate = useNavigate();
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentProject = projects?.find(p => p.id === state.currentProjectId);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProjectDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="h-14 bg-forest-900 text-text-inverse flex items-center px-4 gap-3 sticky top-0 z-50 shrink-0">
      {/* Logo */}
      <button
        onClick={() => { dispatch({ type: 'SET_PROJECT', id: null }); navigate('/'); }}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity mr-1"
      >
        <TreePine size={22} className="text-forest-300" />
        <span className="font-display font-bold text-lg tracking-tight hidden sm:inline">Canopy</span>
      </button>

      {/* Sidebar toggle */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
      >
        <Menu size={18} />
      </button>

      {/* Search */}
      <button
        onClick={() => dispatch({ type: 'SET_SEARCH', show: true })}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/15 rounded-md px-3 py-1.5 text-sm text-white/70 flex-1 max-w-md transition-colors"
      >
        <Search size={15} />
        <span>Search issues...</span>
        <kbd className="ml-auto text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
      </button>

      {/* Project Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowProjectDropdown(!showProjectDropdown)}
          className="flex items-center gap-2 hover:bg-white/10 rounded-md px-3 py-1.5 transition-colors text-sm"
        >
          {currentProject ? (
            <>
              <span className="w-5 h-5 rounded bg-amber-500 flex items-center justify-center text-[10px] font-bold">{currentProject.key?.slice(0,2)}</span>
              <span className="font-medium hidden md:inline">{currentProject.name}</span>
            </>
          ) : (
            <span className="text-white/70">Select Project</span>
          )}
          <ChevronDown size={14} />
        </button>

        {showProjectDropdown && (
          <div className="absolute top-full right-0 mt-1 w-72 bg-card-bg rounded-lg shadow-lg border border-border z-50 animate-slide-down overflow-hidden">
            <div className="p-2 border-b border-border">
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full px-3 py-1.5 text-sm text-text-primary bg-page-bg rounded-md border border-border focus:border-border-focus focus:outline-none"
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto py-1">
              {projects?.filter(p => !p.isArchived).map(project => (
                <button
                  key={project.id}
                  onClick={() => {
                    dispatch({ type: 'SET_PROJECT', id: project.id });
                    setShowProjectDropdown(false);
                    navigate(`/project/${project.id}/board`);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-hover-bg transition-colors text-text-primary ${
                    project.id === state.currentProjectId ? 'bg-selected-bg' : ''
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                    style={{ backgroundColor: project.color || '#52796F' }}
                  >
                    {project.key?.slice(0,2)}
                  </span>
                  <div className="text-left min-w-0">
                    <div className="font-medium truncate">{project.name}</div>
                    <div className="text-text-tertiary text-xs">{project.key}</div>
                  </div>
                </button>
              ))}
              {(!projects || projects.length === 0) && (
                <div className="px-3 py-4 text-sm text-text-tertiary text-center">No projects yet</div>
              )}
            </div>
            <div className="border-t border-border p-1">
              <button
                onClick={() => { setShowProjectDropdown(false); navigate('/projects/new'); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-500 hover:bg-hover-bg rounded transition-colors"
              >
                <Plus size={14} /> Create New Project
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={() => dispatch({ type: 'SET_THEME', theme: state.theme === 'dark' ? 'light' : 'dark' })}
        className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
        title={state.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {state.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      {/* Create button */}
      <button
        onClick={() => dispatch({ type: 'SET_CREATE_ISSUE', show: true })}
        className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md px-3 py-1.5 text-sm font-medium transition-colors active:scale-[0.98]"
      >
        <Plus size={15} />
        <span className="hidden sm:inline">Create</span>
      </button>
    </header>
  );
}
