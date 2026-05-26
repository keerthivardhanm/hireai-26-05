import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Loader2, UserPlus } from 'lucide-react';
import { usePipelineStore } from '../../store/pipeline.store';
import { useJobsStore } from '../../store/jobs.store';
import { Modal } from '../common';

interface CandidateFormValues {
  name: string;
  email: string;
  skills: string;
  experience_years: string;
  education: string;
  projects: string;
  job_id: string;
}

export function AddCandidateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { createCandidate } = usePipelineStore();
  const { jobs } = useJobsStore();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CandidateFormValues>();

  const onSubmit: SubmitHandler<CandidateFormValues> = async (data) => {
    setSaving(true);
    await createCandidate({
      name: data.name,
      email: data.email,
      skills: data.skills,
      experience_years: Number(data.experience_years),
      education: data.education,
      projects: data.projects,
    }, Number(data.job_id));
    setSaving(false);
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Candidate">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div>
          <label className="label">Apply for Job</label>
          <select {...register('job_id', { required: 'Select a job', min: { value: 1, message: 'Select a job' } })}
            className={`input ${errors.job_id ? 'input-err' : ''}`}>
            <option value="">Select a job…</option>
            {jobs.map(j => <option key={j.job_id} value={j.job_id}>{j.role}</option>)}
          </select>
          {errors.job_id && <p className="mt-1 text-xs text-rose-600">{errors.job_id.message}</p>}
        </div>

        {([
          { name: 'name',             label: 'Full Name',           type: 'text',   placeholder: 'Jane Doe'                       },
          { name: 'email',            label: 'Email',               type: 'email',  placeholder: 'jane@email.com'                 },
          { name: 'skills',           label: 'Skills (comma-sep)',  type: 'text',   placeholder: 'React, TypeScript, Node.js'     },
          { name: 'experience_years', label: 'Experience (years)',  type: 'number', placeholder: '3'                              },
          { name: 'education',        label: 'Education',           type: 'text',   placeholder: 'B.Tech Computer Science, MIT'   },
        ] as const).map(f => (
          <div key={f.name}>
            <label className="label">{f.label}</label>
            <input
              {...register(f.name, { required: `${f.label} is required` })}
              type={f.type}
              className={`input ${errors[f.name] ? 'input-err' : ''}`}
              placeholder={f.placeholder}
            />
            {errors[f.name] && <p className="mt-1 text-xs text-rose-600">{errors[f.name]?.message}</p>}
          </div>
        ))}

        <div>
          <label className="label">Projects / Summary</label>
          <textarea
            {...register('projects', { required: 'Describe at least one project', minLength: { value: 5, message: 'Too short' } })}
            rows={3} className={`input resize-none ${errors.projects ? 'input-err' : ''}`}
            placeholder="Built a real-time chat app using React and WebSocket…" />
          {errors.projects && <p className="mt-1 text-xs text-rose-600">{errors.projects.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Adding…</> : <><UserPlus className="w-4 h-4" />Add Candidate</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}
