import { useEffect, useRef, useState } from 'react';
import { X, Mail, Briefcase, BookOpen, Code2, UserCheck, UserX, CalendarCheck } from 'lucide-react';
import { usePipelineStore } from '../../store/pipeline.store';
import { useJobsStore } from '../../store/jobs.store';
import { computeScore, computeXAI, getAvatarColor, getInitials, getScoreColor, getScoreLabel, fmtDate } from '../../utils';
import { StatusBadge, Spinner } from '../common';
import type { AppStatus } from '../../types';

// Circular progress ring
function Ring({ value, size = 88 }: { value: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = getScoreColor(value);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={9} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={9}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transform:'rotate(-90deg)', transformOrigin:'50% 50%', transition:'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold leading-none" style={{ color }}>{value}</span>
        <span className="text-[10px] text-slate-400 mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const c = getScoreColor(value);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold" style={{ color: c }}>{value}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width:`${value}%`, backgroundColor:c }} />
      </div>
    </div>
  );
}

const TABS = ['Profile','AI Score','Analysis'] as const;
type Tab = typeof TABS[number];

export default function CandidateDrawer() {
  const { active, closeDrawer, moveApp } = usePipelineStore();
  const { jobs } = useJobsStore();
  const [tab, setTab] = useState<Tab>('Profile');

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  useEffect(() => { if (active) setTab('Profile'); }, [active?.application_id]);

  if (!active) return null;

  const candidate = active.candidate;
  const job = jobs.find(j => j.job_id === active.job_id);
  const score = candidate && job ? computeScore(candidate, job) : null;
  const xai   = candidate && job && score ? computeXAI(candidate, job, score) : null;
  const skillsList = candidate?.skills.split(',').map(s => s.trim()).filter(Boolean) || [];

  const quickActions: { label: string; status: AppStatus; cls: string }[] = [
    { label: 'Shortlist',  status: 'Shortlisted', cls: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100' },
    { label: 'Interview',  status: 'Interviewed', cls: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
    { label: 'Hire',       status: 'Hired',       cls: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
    { label: 'Reject',     status: 'Rejected',    cls: 'bg-rose-50 text-rose-700 hover:bg-rose-100' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40" onClick={closeDrawer} />
      <aside className="fixed right-0 top-0 h-screen w-full max-w-[420px] bg-white z-50 flex flex-col shadow-drawer animate-slide-in">

        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-slate-100 shrink-0">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-[15px] shrink-0"
            style={{ backgroundColor: getAvatarColor(candidate?.name || 'U') }}>
            {getInitials(candidate?.name || 'Unknown')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2">
              <h2 className="font-display font-bold text-slate-900 text-base leading-tight">{candidate?.name}</h2>
              <StatusBadge status={active.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{candidate?.email}</p>
            {job && <p className="text-xs text-primary-600 mt-0.5 font-medium truncate">→ {job.role}</p>}
          </div>
          <button onClick={closeDrawer} className="btn-ghost p-1.5 rounded-lg shrink-0">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 px-5 py-3 border-b border-slate-100 shrink-0 overflow-x-auto">
          {quickActions.map(a => (
            <button key={a.status} onClick={() => moveApp(active.application_id, a.status)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${a.cls}`}>
              {a.label}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-5 shrink-0">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all duration-150 ${tab === t ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Profile ── */}
          {tab === 'Profile' && candidate && (
            <div className="p-5 space-y-5">
              <section>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Contact & Details</h3>
                <div className="space-y-2.5">
                  {[
                    { icon: Mail, val: candidate.email },
                    { icon: Briefcase, val: `${candidate.experience_years} year${candidate.experience_years !== 1 ? 's' : ''} experience` },
                    { icon: BookOpen, val: candidate.education },
                    { icon: CalendarCheck, val: `Applied ${fmtDate(active.application_date)}` },
                  ].map(({ icon: Icon, val }) => (
                    <div key={val} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <Icon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{val}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {skillsList.length > 0 ? skillsList.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-50 text-primary-700">{s}</span>
                  )) : <span className="text-xs text-slate-400">{candidate.skills}</span>}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" /> Projects
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3">{candidate.projects}</p>
              </section>
            </div>
          )}

          {/* ── AI Score ── */}
          {tab === 'AI Score' && (
            <div className="p-5 space-y-5">
              {score ? (
                <>
                  <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-2xl">
                    <Ring value={score.overall} />
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Overall Match Score</p>
                      <p className="text-2xl font-display font-bold" style={{ color: getScoreColor(score.overall) }}>{score.overall}<span className="text-base font-medium text-slate-400">/100</span></p>
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">{getScoreLabel(score.overall)}</p>
                    </div>
                  </div>
                  <div className="space-y-3.5">
                    <ScoreBar label="Technical Skills" value={score.technical} />
                    <ScoreBar label="Experience Match" value={score.experience} />
                    <ScoreBar label="Communication"    value={score.communication} />
                    <ScoreBar label="Cultural Fit"     value={score.cultural} />
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">Score computed from skills, experience & education match against job requirements</p>
                </>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm text-slate-400">Select a job to compute score</p>
                </div>
              )}
            </div>
          )}

          {/* ── Analysis ── */}
          {tab === 'Analysis' && (
            <div className="p-5 space-y-4">
              {xai ? (
                <>
                  <div className="p-3 bg-blue-50 rounded-xl flex items-center gap-2">
                    <span className="text-blue-600 text-sm font-semibold">AI Confidence</span>
                    <span className="ml-auto text-blue-700 font-bold text-sm">{Math.round(xai.confidence)}%</span>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl">
                    <p className="text-xs font-bold text-amber-700 mb-2 uppercase tracking-wide">💡 Recommendation</p>
                    <p className="text-sm text-amber-900 leading-relaxed">{xai.recommendation}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-emerald-700 mb-2.5 uppercase tracking-wide flex items-center gap-1.5">✅ Strengths</p>
                    <ul className="space-y-2">
                      {xai.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />{s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-amber-600 mb-2.5 uppercase tracking-wide">⚠️ Areas to Probe</p>
                    <ul className="space-y-2">
                      {xai.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />{w}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {xai.skillGaps.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-rose-600 mb-2.5 uppercase tracking-wide">❌ Skill Gaps</p>
                      <div className="flex flex-wrap gap-1.5">
                        {xai.skillGaps.map(g => (
                          <span key={g} className="text-xs px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-medium">{g}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm text-slate-400">AI analysis requires a matched job</p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
