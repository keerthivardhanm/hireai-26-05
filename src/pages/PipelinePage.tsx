import { useEffect, useState } from 'react';
import { ChevronDown, UserPlus, Filter, X } from 'lucide-react';
import { usePipelineStore } from '../store/pipeline.store';
import { useJobsStore } from '../store/jobs.store';
import KanbanBoard, { BulkBar } from '../components/kanban/KanbanBoard';
import CandidateDrawer from '../components/candidate/CandidateDrawer';
import { AddCandidateModal } from '../components/candidate/AddCandidateModal';
import { SearchBar } from '../components/common';

export default function PipelinePage() {
  const { fetchAll, searchQuery, setSearchQuery, filterJobId, setFilterJobId, applications, clearSelection } = usePipelineStore();
  const { jobs, fetch: fetchJobs, selected: selectedJob, select } = useJobsStore();
  const [showAddCandidate, setShowAddCandidate] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchAll();
    clearSelection();
  }, []);

  const activeJob = jobs.find(j => j.job_id === filterJobId) || selectedJob;

  const clearJobFilter = () => {
    setFilterJobId(null);
    select(null);
  };

  const visibleCount = applications.filter(a => !filterJobId || a.job_id === filterJobId).length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-slate-100 flex-wrap">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search candidates…"
          className="w-56"
        />

        {/* Job filter dropdown */}
        <div className="relative">
          <select
            value={filterJobId ?? ''}
            onChange={e => setFilterJobId(e.target.value ? Number(e.target.value) : null)}
            className="input h-9 pr-8 text-sm appearance-none w-52 cursor-pointer"
          >
            <option value="">All Jobs</option>
            {jobs.map(j => (
              <option key={j.job_id} value={j.job_id}>{j.role}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Active job chip */}
        {activeJob && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-xl text-xs font-medium text-primary-700">
            {activeJob.role}
            <button onClick={clearJobFilter} className="hover:text-primary-900 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-slate-500">
            <span className="font-semibold text-slate-900">{visibleCount}</span> candidates
          </span>
          <button
            onClick={() => setShowAddCandidate(true)}
            className="btn btn-primary btn-sm gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Candidate
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>

      {/* Floating bulk action bar */}
      <BulkBar />

      {/* Candidate drawer */}
      <CandidateDrawer />

      {/* Add candidate modal */}
      <AddCandidateModal open={showAddCandidate} onClose={() => setShowAddCandidate(false)} />
    </div>
  );
}
