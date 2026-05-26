import { useEffect, useState } from 'react';
import { Plus, Briefcase, Search } from 'lucide-react';
import { useJobsStore } from '../store/jobs.store';
import { usePipelineStore } from '../store/pipeline.store';
import { JobCard, AddJobModal } from '../components/jobs/JobCard';
import { JobCardSkel, EmptyState } from '../components/common';

export default function JobsPage() {
  const { jobs, fetch: fetchJobs, loading } = useJobsStore();
  const { fetchAll } = usePipelineStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { fetchJobs(); fetchAll(); }, []);

  const filtered = jobs.filter(j =>
    j.role.toLowerCase().includes(search.toLowerCase()) ||
    j.required_skills.toLowerCase().includes(search.toLowerCase())
  );

  const totalApplicants = jobs.reduce((s, _) => s, 0); // computed from apps
  const { applications } = usePipelineStore.getState();

  return (
    <div className="p-6 space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-slate-900 text-xl">Job Board</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {jobs.length} open position{jobs.length !== 1 ? 's' : ''} · {applications.length} total applicants
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Inline search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search jobs…"
              className="input pl-9 h-9 text-sm w-52"
            />
          </div>
          <button onClick={() => setShowAdd(true)} className="btn btn-primary gap-2">
            <Plus className="w-4 h-4" />Post Job
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Open Jobs',        value: jobs.length,                                    color: 'text-emerald-600' },
          { label: 'Total Applicants', value: applications.length,                             color: 'text-primary-600' },
          { label: 'Avg / Job',        value: jobs.length ? Math.round(applications.length / jobs.length) : 0, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <JobCardSkel key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={search ? `No jobs match "${search}"` : 'No jobs posted yet'}
          desc={search ? 'Try a different keyword' : 'Post your first job to start receiving applications'}
          action={!search ? { label: 'Post a Job', onClick: () => setShowAdd(true) } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(job => <JobCard key={job.job_id} job={job} />)}
        </div>
      )}

      <AddJobModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
