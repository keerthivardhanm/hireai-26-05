import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Spinner } from './index';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useAuthStore();
  const loc = useLocation();
  if (!hydrated) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <Spinner size={10} />
        <p className="text-sm text-slate-500">Loading TalentFlow…</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  return <>{children}</>;
}
