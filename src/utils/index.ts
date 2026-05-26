import type { AppStatus, KanbanColumn, Job, Candidate, Application } from '../types';

export const COLUMNS: KanbanColumn[] = [
  { id: 'Applied',     label: 'Applied',     color: '#6366f1', bg: '#eef2ff' },
  { id: 'Shortlisted', label: 'Shortlisted', color: '#0891b2', bg: '#ecfeff' },
  { id: 'Interviewed', label: 'Interviewed', color: '#d97706', bg: '#fffbeb' },
  { id: 'Hired',       label: 'Hired',       color: '#16a34a', bg: '#f0fdf4' },
  { id: 'Rejected',    label: 'Rejected',    color: '#dc2626', bg: '#fef2f2' },
];

export const STATUS_CFG: Record<AppStatus, { color: string; bg: string }> = {
  Applied:     { color: '#6366f1', bg: '#eef2ff' },
  Shortlisted: { color: '#0891b2', bg: '#ecfeff' },
  Interviewed: { color: '#d97706', bg: '#fffbeb' },
  Hired:       { color: '#16a34a', bg: '#f0fdf4' },
  Rejected:    { color: '#dc2626', bg: '#fef2f2' },
};

export const DEPT_CFG: Record<string, { color: string; bg: string; icon: string }> = {
  Engineering:    { color: '#2563eb', bg: '#eff6ff', icon: '⚙️' },
  Analytics:      { color: '#7c3aed', bg: '#f5f3ff', icon: '📊' },
  Product:        { color: '#0891b2', bg: '#ecfeff', icon: '🚀' },
  Infrastructure: { color: '#059669', bg: '#ecfdf5', icon: '🔧' },
  Design:         { color: '#db2777', bg: '#fdf2f8', icon: '🎨' },
  default:        { color: '#64748b', bg: '#f8fafc', icon: '💼' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#0ea5e9','#10b981','#f59e0b','#ef4444','#14b8a6'];
export const getAvatarColor = (s: string): string => {
  let h = 0; for (const c of s) h = c.charCodeAt(0) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
};

export const getScoreColor = (s: number) => s >= 80 ? '#16a34a' : s >= 60 ? '#d97706' : '#dc2626';
export const getScoreLabel = (s: number) => s >= 85 ? 'Excellent' : s >= 70 ? 'Good' : s >= 55 ? 'Average' : 'Below Avg';

export const timeAgo = (d: string): string => {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ─── AI Score Engine (deterministic, client-side XAI) ─────────────────────────
export interface AIScore {
  overall: number;
  technical: number;
  communication: number;
  experience: number;
  cultural: number;
}
export interface XAI {
  strengths: string[];
  weaknesses: string[];
  skillGaps: string[];
  recommendation: string;
  confidence: number;
}

export function computeScore(candidate: Candidate, job: Job): AIScore {
  const cSkills = candidate.skills.toLowerCase().split(/[,\s]+/).filter(Boolean);
  const jSkills = job.required_skills.toLowerCase().split(/[,\s]+/).filter(Boolean);
  const matched = jSkills.filter(s => cSkills.some(c => c.includes(s) || s.includes(c)));
  const skillMatch = jSkills.length > 0 ? Math.round((matched.length / jSkills.length) * 100) : 50;
  const expScore = Math.min(100, Math.round((candidate.experience_years / Math.max(job.min_experience, 1)) * 80) + 20);
  const eduBonus = candidate.education.toLowerCase().includes('bachelor') ? 5
    : candidate.education.toLowerCase().includes('master') ? 10
    : candidate.education.toLowerCase().includes('phd') ? 15 : 0;
  const projBonus = candidate.projects.length > 50 ? 8 : 4;
  const technical = Math.min(100, skillMatch + eduBonus);
  const experience = Math.min(100, expScore);
  const overall = Math.min(100, Math.round((technical * 0.45) + (experience * 0.35) + ((50 + projBonus) * 0.2)));
  return {
    overall,
    technical,
    experience,
    communication: Math.min(100, 55 + (candidate.candidate_id * 7) % 38),
    cultural:      Math.min(100, 60 + (candidate.candidate_id * 3) % 35),
  };
}

export function computeXAI(candidate: Candidate, job: Job, score: AIScore): XAI {
  const cSkills = candidate.skills.split(/[,]+/).map(s => s.trim()).filter(Boolean);
  const jSkills = job.required_skills.split(/[,]+/).map(s => s.trim()).filter(Boolean);
  const matched = jSkills.filter(js => cSkills.some(cs => cs.toLowerCase().includes(js.toLowerCase()) || js.toLowerCase().includes(cs.toLowerCase())));
  const gaps    = jSkills.filter(js => !cSkills.some(cs => cs.toLowerCase().includes(js.toLowerCase()) || js.toLowerCase().includes(cs.toLowerCase())));

  const strengths: string[] = [];
  if (matched.length > 0) strengths.push(`Proficient in ${matched.slice(0,3).join(', ')} — key requirements for this role`);
  if (candidate.experience_years >= job.min_experience) strengths.push(`${candidate.experience_years} years experience meets the ${job.min_experience}yr minimum`);
  if (candidate.projects.length > 60) strengths.push('Demonstrates hands-on project portfolio aligned to role');
  if (strengths.length === 0) strengths.push('Shows potential and willingness to learn');

  const weaknesses: string[] = [];
  if (candidate.experience_years < job.min_experience) weaknesses.push(`${job.min_experience - candidate.experience_years} year(s) short of required experience`);
  if (gaps.length > 2) weaknesses.push(`Limited exposure to ${gaps.slice(0,2).join(' and ')}`);
  if (weaknesses.length === 0) weaknesses.push('Resume lacks quantified impact metrics');

  const rec = score.overall >= 75
    ? `Strong match. Recommend scheduling a technical interview immediately.`
    : score.overall >= 55
    ? `Moderate match. Worth a screening call to probe skill depth and culture fit.`
    : `Below threshold for ${job.role}. Consider for a junior variant or pipeline for future roles.`;

  return {
    strengths,
    weaknesses,
    skillGaps: gaps.slice(0, 4),
    recommendation: rec,
    confidence: Math.min(95, 60 + score.overall * 0.35),
  };
}

// ─── Mock data seeder (used when no data exists) ──────────────────────────────
export const TODAY = new Date().toISOString().split('T')[0];
