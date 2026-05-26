import { useEffect } from 'react';
import { ArrowUpRight, Users, Briefcase, UserCheck, TrendingUp, Activity, Calendar } from 'lucide-react';
import { useJobsStore } from '../store/jobs.store';
import { usePipelineStore } from '../store/pipeline.store';
import { useAuthStore } from '../store/auth.store';
import { COLUMNS, STATUS_CFG, getAvatarColor, getInitials, getScoreColor, computeScore, timeAgo } from '../utils';
import { KPISkeleton, StatusBadge } from '../components/common';

export default function DashboardPage() {
  const { jobs, fetch: fetchJobs, loading: jobsLoading } = useJobsStore();
  const { applications, fetchAll, loading: pipeLoading } = usePipelineStore();
  const user = useAuthStore(s => s.user);

  useEffect(() => { fetchJobs(); fetchAll(); }, []);

  const loading = jobsLoading || pipeLoading;

  const hired       = applications.filter(a => a.status === 'Hired').length;
  const shortlisted = applications.filter(a => a.status === 'Shortlisted').length;

  const kpis = [
    { label:'Active Jobs',    value: jobs.length,          icon: Briefcase,   color:'#2563eb', bg:'#eff6ff', trend:'+2 this week' },
    { label:'Total Applicants', value: applications.length, icon: Users,      color:'#7c3aed', bg:'#f5f3ff', trend:`${applications.length} total` },
    { label:'Shortlisted',    value: shortlisted,           icon: UserCheck,   color:'#0891b2', bg:'#ecfeff', trend:'Ready to interview' },
    { label:'Hired',          value: hired,                 icon: TrendingUp,  color:'#16a34a', bg:'#f0fdf4', trend:'This cycle' },
  ];

  const recent = [...applications]
    .sort((a,b) => new Date(b.application_date).getTime() - new Date(a.application_date).getTime())
    .slice(0, 7);

  return (
    <div className="p-6 space-y-6 animate-fade-up">
      {/* Greeting */}
      <div>
        <h2 className="font-display font-bold text-slate-900 text-xl">
          Good morning, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">Here's what's happening with your hiring pipeline today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [1,2,3,4].map(i => <KPISkeleton key={i} />)
          : kpis.map(k => (
            <div key={k.label} className="card p-5 hover:shadow-card-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: k.bg }}>
                  <k.icon className="w-5 h-5" style={{ color: k.color }} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-display font-bold text-slate-900">{k.value}</p>
              <p className="text-sm font-medium text-slate-700 mt-0.5">{k.label}</p>
              <p className="text-xs text-emerald-600 mt-1">{k.trend}</p>
            </div>
          ))
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pipeline overview */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary-600" /> Pipeline Overview
          </h3>
          {loading
            ? <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-7 skeleton rounded-lg" />)}</div>
            : (
              <div className="space-y-3">
                {COLUMNS.map(col => {
                  const count = applications.filter(a => a.status === col.id).length;
                  const pct = applications.length ? Math.round((count / applications.length) * 100) : 0;
                  return (
                    <div key={col.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-600">{col.label}</span>
                        <span className="text-xs font-bold" style={{ color: col.color }}>{count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width:`${pct}%`, backgroundColor: col.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }
        </div>

        {/* Recent Applications */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-primary-600" /> Recent Applications
          </h3>
          {loading
            ? <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-12 skeleton rounded-xl" />)}</div>
            : recent.length === 0
            ? <p className="text-xs text-slate-400 text-center py-8">No applications yet</p>
            : (
              <div className="space-y-1.5">
                {recent.map(app => {
                  const cfg = STATUS_CFG[app.status];
                  return (
                    <div key={app.application_id}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: getAvatarColor(app.candidate?.name || '?') }}>
                        {getInitials(app.candidate?.name || '?')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{app.candidate?.name || '—'}</p>
                        <p className="text-xs text-slate-500 truncate">{app.candidate?.email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="badge" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                          {app.status}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(app.application_date)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }
        </div>
      </div>

      {/* Jobs Summary */}
      {!loading && jobs.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-primary-600" /> Active Job Postings
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {jobs.map(job => {
              const count = applications.filter(a => a.job_id === job.job_id).length;
              return (
                <div key={job.job_id} className="p-3.5 bg-slate-50 rounded-xl">
                  <p className="text-xs font-semibold text-slate-900 leading-tight mb-1 truncate">{job.role}</p>
                  <p className="text-xs text-slate-500 mb-2 truncate">{job.min_experience}+ yr exp</p>
                  <p className="text-xl font-display font-bold text-primary-700">{count}</p>
                  <p className="text-xs text-slate-400">applicants</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
