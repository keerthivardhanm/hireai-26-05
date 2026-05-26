import { Bell, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useUIStore } from '../../store/ui.store';
import { usePipelineStore } from '../../store/pipeline.store';
import { getAvatarColor, getInitials } from '../../utils';
import { SearchBar } from '../common';

export function AppTopbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const user = useAuthStore(s => s.user);
  const { toggleMobile } = useUIStore();
  const { searchQuery, setSearchQuery } = usePipelineStore();
  return (
    <header className="flex items-center h-14 px-4 md:px-6 bg-white border-b border-slate-100 shrink-0 gap-3 sticky top-0 z-30">
      <button onClick={toggleMobile} className="btn-ghost p-2 rounded-xl md:hidden">
        <Menu className="w-5 h-5 text-slate-600" />
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="font-display font-bold text-slate-900 text-[15px] leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 leading-tight truncate hidden sm:block">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search…" className="hidden sm:block w-52" />
        <button className="relative btn-ghost p-2 rounded-xl">
          <Bell style={{ width:18, height:18 }} className="text-slate-500" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary-600 rounded-full ring-2 ring-white" />
        </button>
        {user && (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 cursor-pointer hover:ring-2 hover:ring-primary-300 transition-all"
            style={{ backgroundColor: getAvatarColor(user.name) }} title={user.name}>
            {getInitials(user.name)}
          </div>
        )}
      </div>
    </header>
  );
}
