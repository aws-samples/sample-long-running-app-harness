import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import BoardView from './pages/BoardView';
import BacklogView from './pages/BacklogView';
import ReportsView from './pages/ReportsView';
import SettingsView from './pages/SettingsView';
import RoadmapView from './pages/RoadmapView';
import SprintsView from './pages/SprintsView';
import LabelsView from './pages/LabelsView';
import ComponentsView from './pages/ComponentsView';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="projects/new" element={<CreateProject />} />
              <Route path="project/:projectId/board" element={<BoardView />} />
              <Route path="project/:projectId/backlog" element={<BacklogView />} />
              <Route path="project/:projectId/roadmap" element={<RoadmapView />} />
              <Route path="project/:projectId/sprints" element={<SprintsView />} />
              <Route path="project/:projectId/reports" element={<ReportsView />} />
              <Route path="project/:projectId/settings" element={<SettingsView />} />
              <Route path="project/:projectId/labels" element={<LabelsView />} />
              <Route path="project/:projectId/components" element={<ComponentsView />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </QueryClientProvider>
  );
}
