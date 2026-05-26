import { create } from 'zustand';
import { jobsApi } from '../api/services';
import type { Job, JobCreate } from '../types';
import { toast } from 'sonner';

interface JobsState {
  jobs: Job[];
  selected: Job | null;
  loading: boolean;
  fetch:   ()                               => Promise<void>;
  create:  (b: JobCreate)                  => Promise<Job | null>;
  update:  (id: number, b: Partial<JobCreate>) => Promise<void>;
  select:  (j: Job | null)                 => void;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [], selected: null, loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const res = await jobsApi.list();
      set({ jobs: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  create: async (body) => {
    try {
      const res = await jobsApi.create(body);
      const job: Job = res.data;
      set(s => ({ jobs: [job, ...s.jobs] }));
      toast.success('Job posted!');
      return job;
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed to create job');
      return null;
    }
  },

  update: async (id, body) => {
    try {
      const res = await jobsApi.update(id, body);
      set(s => ({ jobs: s.jobs.map(j => j.job_id === id ? res.data : j) }));
    } catch { toast.error('Update failed'); }
  },

  select: (j) => set({ selected: j }),
}));
