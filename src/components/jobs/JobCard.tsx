import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { Clock, Building2, Plus, Loader2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJobsStore } from '../../store/jobs.store';
import { usePipelineStore } from '../../store/pipeline.store';
import { DEPT_CFG } from '../../utils';
import { Modal } from '../common';
import type { Job } from '../../types';

export function JobCard({ job }: { job: Job }) {
  const { selected, select } = useJobsStore();
  const { setFilterJobId } = usePipelineStore();
  const nav = useNavigate();
  const isSelected = selected?.job_id === job.job_id;
  const deptKey = Object.keys(DEPT_CFG).find(k => job.role.toLowerCase().includes(k.toLowerCase())) || 'default';
  const dept = DEPT_CFG[deptKey];

  const handleClick = () => {
    select(job);
    setFilterJobId(job.job_id);
    nav('/pipeline');
  };

  return (
    <div onClick={handleClick}
      className={`card-hover p-5 transition-all duration-200 ${isSelected ? 'border-primary-300 ring-2 ring-primary-100' : ''}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: dept.bg }}>
          {dept.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 leading-tight truncate">{job.role}</h3>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{job.required_skills.split(',').slice(0,2).join(', ')}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-y-1.5 gap-x-4 mb-4">
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" /> {job.min_experience}+ yr
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Building2 className="w-3.5 h-3.5" /> Tech
        </span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-500 truncate flex-1 mr-2">
          <span className="font-medium text-slate-700">Skills: </span>
          {job.required_skills.length > 28 ? job.required_skills.slice(0,28)+'…' : job.required_skills}
        </p>
        <ChevronRight className="w-4 h-4 text-primary-600 shrink-0" />
      </div>
    </div>
  );
}

// ── Add Job Modal ─────────────────────────────────────────────────────────────
interface JobFormValues {
  role: string;
  required_skills: string;
  min_experience: string;
}

export function AddJobModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { create } = useJobsStore();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<JobFormValues>();

  const onSubmit: SubmitHandler<JobFormValues> = async (data) => {
    setSaving(true);
    const job = await create({
      role: data.role,
      required_skills: data.required_skills,
      min_experience: Number(data.min_experience),
    });
    setSaving(false);
    if (job) { reset(); onClose(); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Post New Job">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Job Role / Title</label>
          <input {...register('role', { required: 'Role is required', minLength: { value: 2, message: 'Too short' } })}
            className={`input ${errors.role ? 'input-err' : ''}`} placeholder="e.g. Senior React Developer" />
          {errors.role && <p className="mt-1 text-xs text-rose-600">{errors.role.message}</p>}
        </div>
        <div>
          <label className="label">Required Skills <span className="text-slate-400 font-normal">(comma-separated)</span></label>
          <input {...register('required_skills', { required: 'Skills are required' })}
            className={`input ${errors.required_skills ? 'input-err' : ''}`} placeholder="React, TypeScript, Node.js" />
          {errors.required_skills && <p className="mt-1 text-xs text-rose-600">{errors.required_skills.message}</p>}
        </div>
        <div>
          <label className="label">Min. Experience (years)</label>
          <input {...register('min_experience', { required: 'Required', min: { value: 0, message: 'Min 0' } })}
            type="number" min="0" className={`input ${errors.min_experience ? 'input-err' : ''}`} placeholder="3" />
          {errors.min_experience && <p className="mt-1 text-xs text-rose-600">{errors.min_experience.message}</p>}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Posting…</> : <><Plus className="w-4 h-4" />Post Job</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}
