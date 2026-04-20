import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import CreateIssueModal from '../CreateIssueModal';
import SearchModal from '../SearchModal';
import KeyboardShortcutsModal from '../KeyboardShortcutsModal';
import IssueDetailPanel from '../IssueDetailPanel';
import { useApp } from '../../context/AppContext';
import { Toaster } from 'sonner';

export default function Layout() {
  const { state, dispatch } = useApp();
  const location = useLocation();

  // Auto-detect project ID from URL path
  useEffect(() => {
    const match = location.pathname.match(/^\/project\/([^/]+)/);
    if (match && match[1] !== state.currentProjectId) {
      dispatch({ type: 'SET_PROJECT', id: match[1] });
    }
  }, [location.pathname, state.currentProjectId, dispatch]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-page-bg">
          <div className="max-w-[1400px] mx-auto p-6">
            <Outlet />
          </div>
        </main>
        {state.selectedIssueId && <IssueDetailPanel />}
      </div>
      {state.showCreateIssueModal && <CreateIssueModal />}
      {state.showSearchModal && <SearchModal />}
      <KeyboardShortcutsModal />
      <Toaster position="top-right" richColors />
    </div>
  );
}
