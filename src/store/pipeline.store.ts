import { create } from 'zustand';
import { applicationsApi, candidatesApi } from '../api/services';
import type { Application, Candidate, AppStatus, CandidateCreate } from '../types';
import { toast } from 'sonner';
import { TODAY } from '../utils';

interface PipelineState {
  applications:  Application[];
  candidates:    Candidate[];
  selected:      number[];          // application_ids selected for bulk
  active:        Application | null;// for drawer
  filterJobId:   number | null;
  searchQuery:   string;
  loading:       boolean;
  drawerLoading: boolean;

  fetchAll:          (jobId?: number)                       => Promise<void>;
  fetchCandidates:   ()                                     => Promise<void>;
  moveApp:           (appId: number, status: AppStatus)     => Promise<void>;
  bulkMove:          (appIds: number[], status: AppStatus)  => Promise<void>;
  createCandidate:   (body: CandidateCreate, jobId: number) => Promise<void>;
  openDrawer:        (app: Application)                     => void;
  closeDrawer:       ()                                     => void;
  toggleSelect:      (appId: number)                        => void;
  selectAllInCol:    (appIds: number[])                     => void;
  clearSelection:    ()                                     => void;
  setFilterJobId:    (id: number | null)                    => void;
  setSearchQuery:    (q: string)                            => void;
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
  applications: [], candidates: [], selected: [], active: null,
  filterJobId: null, searchQuery: '', loading: false, drawerLoading: false,

  fetchAll: async (jobId) => {
    set({ loading: true });
    try {
      const params = jobId ? { job_id: jobId } : undefined;
      const [appRes, canRes] = await Promise.all([
        applicationsApi.list(params),
        candidatesApi.list(),
      ]);
      const candidates: Candidate[] = canRes.data;
      const applications: Application[] = (appRes.data as Application[]).map(a => ({
        ...a,
        candidate: candidates.find(c => c.candidate_id === a.candidate_id),
      }));
      set({ applications, candidates, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchCandidates: async () => {
    try {
      const res = await candidatesApi.list();
      set({ candidates: res.data });
    } catch {}
  },

  moveApp: async (appId, status) => {
    // Optimistic
    const prev = get().applications;
    set(s => ({
      applications: s.applications.map(a =>
        a.application_id === appId ? { ...a, status } : a
      ),
    }));
    try {
      await applicationsApi.update(appId, { status });
      toast.success(`Moved to ${status}`);
    } catch {
      set({ applications: prev });
      toast.error('Failed to update status');
    }
  },

  bulkMove: async (appIds, status) => {
    const prev = get().applications;
    set(s => ({
      applications: s.applications.map(a =>
        appIds.includes(a.application_id) ? { ...a, status } : a
      ),
      selected: [],
    }));
    try {
      await Promise.all(appIds.map(id => applicationsApi.update(id, { status })));
      toast.success(`${appIds.length} candidate${appIds.length > 1 ? 's' : ''} → ${status}`);
    } catch {
      set({ applications: prev });
      toast.error('Bulk update failed');
    }
  },

  createCandidate: async (body, jobId) => {
    try {
      const cRes = await candidatesApi.create(body);
      const candidate: Candidate = cRes.data;
      const aRes = await applicationsApi.create({
        candidate_id: candidate.candidate_id,
        job_id: jobId,
        status: 'Applied',
        application_date: TODAY,
      });
      const app: Application = { ...aRes.data, candidate };
      set(s => ({
        candidates: [candidate, ...s.candidates],
        applications: [app, ...s.applications],
      }));
      toast.success('Candidate added & applied!');
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed to add candidate');
    }
  },

  openDrawer:     (app)  => set({ active: app }),
  closeDrawer:    ()     => set({ active: null }),
  toggleSelect:   (id)   => set(s => ({
    selected: s.selected.includes(id) ? s.selected.filter(x => x !== id) : [...s.selected, id],
  })),
  selectAllInCol: (ids)  => set({ selected: ids }),
  clearSelection: ()     => set({ selected: [] }),
  setFilterJobId: (id)   => set({ filterJobId: id }),
  setSearchQuery: (q)    => set({ searchQuery: q }),
}));
