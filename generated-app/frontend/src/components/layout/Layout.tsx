import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import CreateIssueModal from '../CreateIssueModal';
import SearchModal from '../SearchModal';
import IssueDetailPanel from '../IssueDetailPanel';
import { useApp } from '../../context/AppContext';
import { Toaster } from 'sonner';

export default function Layout() {
  const { state } = useApp();

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
      <Toaster position="top-right" richColors />
    </div>
  );
}
