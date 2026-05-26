import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Briefcase, MapPin, UserCheck, UserX, X, CheckCheck } from 'lucide-react';
import { usePipelineStore } from '../../store/pipeline.store';
import { useJobsStore } from '../../store/jobs.store';
import { COLUMNS, STATUS_CFG, getAvatarColor, getInitials, getScoreColor, computeScore, timeAgo } from '../../utils';
import type { Application, AppStatus } from '../../types';
import { CardSkeleton } from '../common';

// ── Candidate Card ─────────────────────────────────────────────────────────────
function CandidateCard({ app, index }: { app: Application; index: number }) {
  const { selected, toggleSelect, openDrawer } = usePipelineStore();
  const { jobs } = useJobsStore();
  const isSelected = selected.includes(app.application_id);
  const c = app.candidate;
  const job = jobs.find(j => j.job_id === app.job_id);
  const score = c && job ? computeScore(c, job) : null;
  const skillsList = c ? c.skills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3) : [];

  return (
    <Draggable draggableId={String(app.application_id)} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
          className={`bg-white rounded-xl border transition-all duration-150 select-none ${
            snapshot.isDragging ? 'shadow-card-lg border-primary-300 rotate-1 scale-[1.03] cursor-grabbing'
            : isSelected ? 'border-primary-300 bg-primary-50/30 shadow-card ring-2 ring-primary-100'
            : 'border-slate-100 shadow-card hover:shadow-card-md hover:border-slate-200 cursor-grab'}`}>
          <div className="p-3">
            {/* Row 1 */}
            <div className="flex items-start gap-2 mb-2">
              <input type="checkbox" checked={isSelected}
                onChange={e => { e.stopPropagation(); toggleSelect(app.application_id); }}
                onClick={e => e.stopPropagation()}
                className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 accent-primary-600 cursor-pointer shrink-0" />
              <button onClick={() => openDrawer(app)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 hover:ring-2 hover:ring-offset-1 transition-all"
                style={{ backgroundColor: getAvatarColor(c?.name || '?'), outlineColor: getAvatarColor(c?.name || '?') }}>
                {getInitials(c?.name || '?')}
              </button>
              <button onClick={() => openDrawer(app)} className="flex-1 text-left min-w-0">
                <p className="text-[13px] font-semibold text-slate-900 leading-tight truncate">{c?.name || 'Unknown'}</p>
                <p className="text-[11px] text-slate-500 truncate">{c?.email}</p>
              </button>
              {score && (
                <button onClick={() => openDrawer(app)} className="shrink-0 text-right">
                  <span className="text-xs font-bold" style={{ color: getScoreColor(score.overall) }}>{score.overall}</span>
                  <p className="text-[9px] text-slate-400">score</p>
                </button>
              )}
            </div>
            {/* Row 2 */}
            {c && (
              <div className="flex items-center gap-3 mb-2 ml-[22px]">
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Briefcase className="w-3 h-3" />{c.experience_years}yr
                </span>
              </div>
            )}
            {/* Skills */}
            <div className="flex flex-wrap gap-1 ml-[22px]">
              {skillsList.map(s => (
                <span key={s} className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">{s}</span>
              ))}
              {(c?.skills.split(',').length || 0) > 3 && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-400">
                  +{(c?.skills.split(',').length || 0) - 3}
                </span>
              )}
            </div>
            {/* Time */}
            <div className="mt-1.5 ml-[22px]">
              <span className="text-[10px] text-slate-400">{timeAgo(app.application_date)}</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

// ── Bulk Action Bar ────────────────────────────────────────────────────────────
export function BulkBar() {
  const { selected, bulkMove, clearSelection } = usePipelineStore();
  if (!selected.length) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
      <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700">
        <CheckCheck className="w-4 h-4 text-primary-400" />
        <span className="text-sm font-medium">{selected.length} selected</span>
        <div className="w-px h-5 bg-slate-700" />
        <button onClick={() => bulkMove(selected, 'Shortlisted')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold transition-colors">
          <UserCheck className="w-3.5 h-3.5" /> Shortlist
        </button>
        <button onClick={() => bulkMove(selected, 'Rejected')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold transition-colors">
          <UserX className="w-3.5 h-3.5" /> Reject
        </button>
        <button onClick={clearSelection} className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Kanban Board ───────────────────────────────────────────────────────────────
export default function KanbanBoard() {
  const { applications, loading, moveApp, filterJobId, searchQuery } = usePipelineStore();

  const visible = applications.filter(a => {
    const matchJob = !filterJobId || a.job_id === filterJobId;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q
      || a.candidate?.name.toLowerCase().includes(q)
      || a.candidate?.email.toLowerCase().includes(q)
      || a.candidate?.skills.toLowerCase().includes(q);
    return matchJob && matchSearch;
  });

  const onDragEnd = ({ draggableId, destination, source }: DropResult) => {
    if (!destination || destination.droppableId === source.droppableId) return;
    moveApp(Number(draggableId), destination.droppableId as AppStatus);
  };

  if (loading) return (
    <div className="flex gap-4 p-5 overflow-x-auto">
      {COLUMNS.map(c => (
        <div key={c.id} className="w-[268px] shrink-0 space-y-2.5">
          <div className="skeleton h-5 w-24 rounded mb-3" />
          {[1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ))}
    </div>
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 p-5 overflow-x-auto pb-10 min-h-[calc(100vh-130px)]">
        {COLUMNS.map(col => {
          const colApps = visible.filter(a => a.status === col.id);
          return (
            <div key={col.id} className="w-[268px] shrink-0 flex flex-col">
              {/* Col header */}
              <div className="flex items-center justify-between mb-3 px-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                  <span className="text-[13px] font-semibold text-slate-700">{col.label}</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ color: col.color, backgroundColor: col.bg }}>{colApps.length}</span>
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}
                    className={`flex-1 flex flex-col gap-2.5 p-2 rounded-2xl min-h-[460px] transition-all duration-150 ${snapshot.isDraggingOver ? 'drag-over' : 'col-idle'}`}>
                    {colApps.map((app, i) => <CandidateCard key={app.application_id} app={app} index={i} />)}
                    {provided.placeholder}
                    {colApps.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-xs text-slate-300 text-center">Drop candidates here</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
