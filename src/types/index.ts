// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}
export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}

// ─── Jobs ────────────────────────────────────────────────────────────────────
export interface Job {
  job_id: number;
  role: string;
  required_skills: string;
  min_experience: number;
}
export interface JobCreate {
  role: string;
  required_skills: string;
  min_experience: number;
}

// ─── Candidates ──────────────────────────────────────────────────────────────
export interface Candidate {
  candidate_id: number;
  name: string;
  email: string;
  skills: string;
  experience_years: number;
  education: string;
  projects: string;
}
export interface CandidateCreate {
  name: string;
  email: string;
  skills: string;
  experience_years: number;
  education: string;
  projects: string;
}

// ─── Applications ────────────────────────────────────────────────────────────
export type AppStatus = 'Applied' | 'Shortlisted' | 'Interviewed' | 'Hired' | 'Rejected';

export interface Application {
  application_id: number;
  candidate_id: number;
  job_id: number;
  status: AppStatus;
  application_date: string;
  // joined from client-side
  candidate?: Candidate;
  job?: Job;
}
export interface ApplicationCreate {
  candidate_id: number;
  job_id: number;
  status: AppStatus;
  application_date: string;
}

// ─── UI helpers ──────────────────────────────────────────────────────────────
export interface KanbanColumn {
  id: AppStatus;
  label: string;
  color: string;
  bg: string;
}
