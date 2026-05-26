import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Kanban, Briefcase, Settings, LogOut, Zap, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useUIStore } from '../../store/ui.store';
import { getInitials, getAvatarColor } from '../../utils';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pipeline',  icon: Kanban,          label: 'Pipeline'  },
  { to: '/jobs',      icon: Briefcase,        label: 'Jobs'      },
  { to: '/settings',  icon: Settings,         label: 'Settings'  },
];

function Inner({ collapsed, onClose }: { collapsed: boolean; onClose?: () => void }) {
  const { user, logout } = useAuthStore();
  const nav = useNavigate();
  const doLogout = () => { logout(); nav('/login'); };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center h-14 px-4 border-b border-slate-100 shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!collapsed && <span className="font-display font-bold text-[15px] tracking-tight text-slate-900">TalentFlow</span>}
        </div>
        {onClose && <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg ml-auto"><X className="w-4 h-4" /></button>}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={onClose} title={collapsed ? label : undefined}
            className={({ isActive }) => `${isActive ? 'nav-active' : 'nav-link'} ${collapsed ? 'justify-center px-2' : ''}`}>
            <Icon className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-2.5 border-t border-slate-100 space-y-0.5 shrink-0">
        <button onClick={doLogout} title={collapsed ? 'Logout' : undefined}
          className={`nav-link w-full hover:bg-rose-50 hover:text-rose-700 ${collapsed ? 'justify-center px-2' : ''}`}>
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && 'Logout'}
        </button>
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl mt-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: getAvatarColor(user.name) }}>
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate capitalize">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppSidebar() {
  const { collapsed, toggle, mobileOpen, closeMobile } = useUIStore();
  return (
    <>
      {/* Desktop */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-slate-100 h-screen sticky top-0 shrink-0 transition-all duration-300 relative ${collapsed ? 'w-[60px]' : 'w-56'}`}>
        <Inner collapsed={collapsed} />
        <button onClick={toggle}
          className="absolute -right-3 top-[72px] z-10 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-all">
          {collapsed ? <ChevronRight className="w-3 h-3 text-slate-500" /> : <ChevronLeft className="w-3 h-3 text-slate-500" />}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden" onClick={closeMobile} />
          <aside className="fixed left-0 top-0 h-screen w-56 bg-white border-r border-slate-100 z-50 md:hidden shadow-xl animate-slide-in">
            <Inner collapsed={false} onClose={closeMobile} />
          </aside>
        </>
      )}
    </>
  );
}
