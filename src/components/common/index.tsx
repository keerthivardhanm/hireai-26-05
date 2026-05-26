import { Search, X, AlertCircle, Users, RefreshCw } from 'lucide-react';
import type { AppStatus } from '../../types';
import { STATUS_CFG } from '../../utils';

// ── StatusBadge ───────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: AppStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span className="badge" style={{ color: c.color, backgroundColor: c.bg }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
      {status}
    </span>
  );
}

// ── SearchBar ─────────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search…', className = '' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="input pl-9 pr-8 h-9 text-sm" />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ── Skeleton shapes ───────────────────────────────────────────────────────────
export function SkLine({ w = 'w-full', h = 'h-3' }: { w?: string; h?: string }) {
  return <div className={`skeleton ${w} ${h}`} />;
}
export function CardSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full skeleton shrink-0" />
        <div className="flex-1 space-y-2"><SkLine w="w-32" h="h-3.5" /><SkLine w="w-44" /></div>
      </div>
      <div className="flex gap-1.5"><div className="skeleton h-5 w-14 rounded-full" /><div className="skeleton h-5 w-16 rounded-full" /></div>
      <SkLine w="w-20" h="h-2.5" />
    </div>
  );
}
export function KPISkeleton() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex justify-between"><div className="skeleton w-10 h-10 rounded-xl" /><div className="skeleton w-12 h-4 rounded" /></div>
      <div className="space-y-2"><SkLine w="w-16" h="h-7" /><SkLine w="w-28" /></div>
    </div>
  );
}
export function JobCardSkel() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start gap-3"><div className="skeleton w-10 h-10 rounded-xl" /><div className="flex-1 space-y-2"><SkLine w="w-40" h="h-4" /><SkLine w="w-24" /></div></div>
      <div className="space-y-2"><SkLine /><SkLine w="w-3/4" /></div>
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────────
export function Spinner({ size = 4, cls = '' }: { size?: number; cls?: string }) {
  return <div className={`w-${size} h-${size} border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin ${cls}`} />;
}

// ── Empty & Error ─────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon = Users, title, desc, action }: {
  icon?: React.ComponentType<{ className?: string }>; title: string; desc?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-800 mb-1">{title}</h3>
      {desc && <p className="text-sm text-slate-500 max-w-xs leading-relaxed">{desc}</p>}
      {action && <button onClick={action.onClick} className="btn btn-primary btn-sm mt-5">{action.label}</button>}
    </div>
  );
}

export function ErrorBanner({ msg, retry }: { msg?: string; retry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-rose-500" />
      </div>
      <p className="text-sm font-semibold text-slate-800 mb-1">Something went wrong</p>
      <p className="text-xs text-slate-500 mb-5">{msg || 'Failed to load. Please try again.'}</p>
      {retry && <button onClick={retry} className="btn btn-secondary btn-sm gap-1.5"><RefreshCw className="w-3.5 h-3.5" />Retry</button>}
    </div>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-lg p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-slate-900 text-lg">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
