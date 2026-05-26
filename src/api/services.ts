import api from './client';
import type {
  RegisterRequest, LoginRequest,
  JobCreate, CandidateCreate, ApplicationCreate,
  AppStatus,
} from '../types';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (body: RegisterRequest) => api.post('/api/auth/register', body),
  login:    (body: LoginRequest)    => api.post('/api/auth/login',    body),
  me:       ()                      => api.get('/api/auth/me'),
};

// ─── Jobs ────────────────────────────────────────────────────────────────────
export const jobsApi = {
  list:   ()                  => api.get('/api/jobs'),
  create: (body: JobCreate)   => api.post('/api/jobs', body),
  update: (id: number, body: Partial<JobCreate>) => api.patch(`/api/jobs/${id}`, body),
};

// ─── Candidates ──────────────────────────────────────────────────────────────
export const candidatesApi = {
  list:   ()                           => api.get('/api/candidates'),
  create: (body: CandidateCreate)      => api.post('/api/candidates', body),
  update: (id: number, body: Partial<CandidateCreate>) => api.patch(`/api/candidates/${id}`, body),
};

// ─── Applications ────────────────────────────────────────────────────────────
export const applicationsApi = {
  list:   (params?: { job_id?: number; status?: string }) => api.get('/api/applications', { params }),
  create: (body: ApplicationCreate)                        => api.post('/api/applications', body),
  update: (id: number, body: { status?: AppStatus })       => api.patch(`/api/applications/${id}`, body),
};
