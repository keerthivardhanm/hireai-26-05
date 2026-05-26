import { Outlet, useLocation } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import { AppTopbar } from './AppTopbar';

const META: Record<string, { title: string; sub: string }> = {
  '/dashboard': { title: 'Dashboard',           sub: 'Your hiring pipeline at a glance'     },
  '/pipeline':  { title: 'Candidate Pipeline',  sub: 'Drag-and-drop Kanban board'           },
  '/jobs':      { title: 'Job Board',           sub: 'Open positions and applicants'        },
  '/settings':  { title: 'Settings',            sub: 'Account & workspace preferences'      },
};

export default function AppLayout() {
  const { pathname } = useLocation();
  const { title, sub } = META[pathname] || { title: 'TalentFlow', sub: '' };
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AppTopbar title={title} subtitle={sub} />
        <main className="flex-1 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}
