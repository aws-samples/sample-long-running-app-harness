import { useApp } from '../../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, List, Kanban, Map, BarChart3, Timer, Settings,
  Tag, Component, ChevronRight, FolderOpen, Plus, PanelLeftClose
} from 'lucide-react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const projectId = state.currentProjectId;

  const planningItems: NavItem[] = projectId ? [
    { icon: <Map size={18} />, label: 'Roadmap', path: `/project/${projectId}/roadmap` },
    { icon: <List size={18} />, label: 'Backlog', path: `/project/${projectId}/backlog` },
    { icon: <Timer size={18} />, label: 'Active Sprints', path: `/project/${projectId}/sprints` },
  ] : [];

  const boardItems: NavItem[] = projectId ? [
    { icon: <Kanban size={18} />, label: 'Board', path: `/project/${projectId}/board` },
  ] : [];

  const reportItems: NavItem[] = projectId ? [
    { icon: <BarChart3 size={18} />, label: 'Reports', path: `/project/${projectId}/reports` },
  ] : [];

  const projectItems: NavItem[] = projectId ? [
    { icon: <Settings size={18} />, label: 'Settings', path: `/project/${projectId}/settings` },
    { icon: <Tag size={18} />, label: 'Labels', path: `/project/${projectId}/labels` },
    { icon: <Component size={18} />, label: 'Components', path: `/project/${projectId}/components` },
  ] : [];

  const isActive = (path: string) => location.pathname === path;

  if (state.sidebarCollapsed) {
    return (
      <aside className="w-[52px] bg-sidebar-bg border-r border-border flex flex-col items-center py-3 gap-1 shrink-0 transition-all duration-200">
        {projectId && (
          <>
            {[...planningItems, ...boardItems, ...reportItems, ...projectItems].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`p-2 rounded-md transition-colors ${
                  isActive(item.path) ? 'bg-selected-bg text-amber-600' : 'text-text-secondary hover:bg-hover-bg hover:text-text-primary'
                }`}
                title={item.label}
              >
                {item.icon}
              </button>
            ))}
          </>
        )}
        <div className="mt-auto">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-md text-text-secondary hover:bg-hover-bg transition-colors"
            title="All Projects"
          >
            <FolderOpen size={18} />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-60 bg-sidebar-bg border-r border-border flex flex-col shrink-0 transition-all duration-200 overflow-y-auto">
      <nav className="flex-1 p-2">
        {/* Home */}
        <button
          onClick={() => { dispatch({ type: 'SET_PROJECT', id: null }); navigate('/'); }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors mb-1 ${
            location.pathname === '/' ? 'bg-selected-bg text-amber-600 font-medium' : 'text-text-secondary hover:bg-hover-bg hover:text-text-primary'
          }`}
        >
          <LayoutDashboard size={18} /> Dashboard
        </button>

        {projectId && (
          <>
            <SidebarSection title="Planning" items={planningItems} isActive={isActive} navigate={navigate} />
            <SidebarSection title="Board" items={boardItems} isActive={isActive} navigate={navigate} />
            <SidebarSection title="Reports" items={reportItems} isActive={isActive} navigate={navigate} />
            <SidebarSection title="Project" items={projectItems} isActive={isActive} navigate={navigate} />
          </>
        )}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-text-secondary hover:bg-hover-bg transition-colors"
        >
          <FolderOpen size={18} /> All Projects
        </button>
        <button
          onClick={() => navigate('/projects/new')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-amber-500 hover:bg-hover-bg transition-colors"
        >
          <Plus size={18} /> Create Project
        </button>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-text-tertiary hover:bg-hover-bg transition-colors"
        >
          <PanelLeftClose size={18} /> Collapse
        </button>
      </div>
    </aside>
  );
}

function SidebarSection({
  title,
  items,
  isActive,
  navigate,
}: {
  title: string;
  items: NavItem[];
  isActive: (path: string) => boolean;
  navigate: (path: string) => void;
}) {
  return (
    <div className="mt-4">
      <div className="flex items-center gap-1 px-3 mb-1">
        <ChevronRight size={12} className="text-text-tertiary" />
        <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">{title}</span>
      </div>
      {items.map(item => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
            isActive(item.path)
              ? 'bg-selected-bg text-amber-600 font-medium'
              : 'text-text-secondary hover:bg-hover-bg hover:text-text-primary'
          }`}
        >
          {item.icon} {item.label}
        </button>
      ))}
    </div>
  );
}
