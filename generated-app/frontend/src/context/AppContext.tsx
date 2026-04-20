import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';

interface AppState {
  currentProjectId: string | null;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  selectedIssueId: string | null;
  showCreateIssueModal: boolean;
  showSearchModal: boolean;
  showShortcutsModal: boolean;
}

type AppAction =
  | { type: 'SET_PROJECT'; id: string | null }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; collapsed: boolean }
  | { type: 'SET_THEME'; theme: 'light' | 'dark' }
  | { type: 'SELECT_ISSUE'; id: string | null }
  | { type: 'TOGGLE_CREATE_ISSUE' }
  | { type: 'SET_CREATE_ISSUE'; show: boolean }
  | { type: 'TOGGLE_SEARCH' }
  | { type: 'SET_SEARCH'; show: boolean }
  | { type: 'SET_SHORTCUTS_MODAL'; show: boolean };

const initialState: AppState = {
  currentProjectId: localStorage.getItem('canopy_currentProject') || null,
  sidebarCollapsed: localStorage.getItem('canopy_sidebarCollapsed') === 'true',
  theme: (localStorage.getItem('canopy_theme') as 'light' | 'dark') || 'light',
  selectedIssueId: null,
  showCreateIssueModal: false,
  showSearchModal: false,
  showShortcutsModal: false,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PROJECT':
      if (action.id) localStorage.setItem('canopy_currentProject', action.id);
      else localStorage.removeItem('canopy_currentProject');
      return { ...state, currentProjectId: action.id };
    case 'TOGGLE_SIDEBAR': {
      const collapsed = !state.sidebarCollapsed;
      localStorage.setItem('canopy_sidebarCollapsed', String(collapsed));
      return { ...state, sidebarCollapsed: collapsed };
    }
    case 'SET_SIDEBAR':
      localStorage.setItem('canopy_sidebarCollapsed', String(action.collapsed));
      return { ...state, sidebarCollapsed: action.collapsed };
    case 'SET_THEME':
      localStorage.setItem('canopy_theme', action.theme);
      return { ...state, theme: action.theme };
    case 'SELECT_ISSUE':
      return { ...state, selectedIssueId: action.id };
    case 'TOGGLE_CREATE_ISSUE':
      return { ...state, showCreateIssueModal: !state.showCreateIssueModal };
    case 'SET_CREATE_ISSUE':
      return { ...state, showCreateIssueModal: action.show };
    case 'TOGGLE_SEARCH':
      return { ...state, showSearchModal: !state.showSearchModal };
    case 'SET_SEARCH':
      return { ...state, showSearchModal: action.show };
    case 'SET_SHORTCUTS_MODAL':
      return { ...state, showShortcutsModal: action.show };
    default:
      return state;
  }
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<AppAction> } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Escape closes in priority order
      if (e.key === 'Escape') {
        if (state.showShortcutsModal) {
          dispatch({ type: 'SET_SHORTCUTS_MODAL', show: false });
          return;
        }
        if (state.showSearchModal) {
          dispatch({ type: 'SET_SEARCH', show: false });
          return;
        }
        if (state.showCreateIssueModal) {
          dispatch({ type: 'SET_CREATE_ISSUE', show: false });
          return;
        }
        if (state.selectedIssueId) {
          dispatch({ type: 'SELECT_ISSUE', id: null });
          return;
        }
        return;
      }

      // Don't trigger other shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_SEARCH' });
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '[') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_SIDEBAR' });
      }
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
        dispatch({ type: 'SET_CREATE_ISSUE', show: true });
      }
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        dispatch({ type: 'SET_SHORTCUTS_MODAL', show: true });
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const filterInput = document.querySelector('input[placeholder*="Filter"]') as HTMLInputElement;
        if (filterInput) filterInput.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.showShortcutsModal, state.showSearchModal, state.showCreateIssueModal, state.selectedIssueId]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
