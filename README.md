## 🚀 Quick Start

```bash
npm install
npm run dev
# open http://localhost:5173
```

**Register** a new account or use the Register page — JWT is stored in localStorage and auto-validated on load.

---

## 🔌 Real API Endpoints Used

| Endpoint | Used For |
|----------|----------|
| `POST /api/auth/register` | Register new account |
| `POST /api/auth/login` | Login + receive JWT |
| `GET /api/auth/me` | Validate token on hydrate |
| `GET /api/jobs` | Load Job Board |
| `POST /api/jobs` | Post a new job |
| `GET /api/candidates` | Load all candidates |
| `POST /api/candidates` | Add a new candidate |
| `GET /api/applications?job_id=` | Load pipeline per job |
| `GET /api/applications?status=` | Filter by status |
| `POST /api/applications` | Apply candidate to job |
| `PATCH /api/applications/:id` | Move card (drag-and-drop / bulk) |

---

## 🏗 Architecture

```
src/
├── api/
│   ├── client.ts          # Axios + JWT interceptor + 401 redirect
│   └── services.ts        # All API call functions
├── store/
│   ├── auth.store.ts      # JWT login/register/hydrate/logout
│   ├── jobs.store.ts      # Jobs fetch/create
│   ├── pipeline.store.ts  # Applications + candidates + optimistic DnD
│   └── ui.store.ts        # Sidebar collapse / mobile
├── types/index.ts         # Exact TypeScript types matching API schema
├── utils/index.ts         # Helpers, AI score engine, XAI engine
├── components/
│   ├── layout/            # Sidebar, Topbar, AppLayout
│   ├── auth/              # Login & Register forms
│   ├── kanban/            # KanbanBoard, CandidateCard, BulkBar
│   ├── jobs/              # JobCard, AddJobModal
│   ├── candidate/         # CandidateDrawer, AddCandidateModal
│   └── common/            # StatusBadge, SearchBar, Skeletons, Modal, EmptyState
└── pages/
    ├── LoginPage.tsx       # Split-screen auth
    ├── RegisterPage.tsx    # Registration form
    ├── DashboardPage.tsx   # KPIs + pipeline chart + recent apps
    ├── PipelinePage.tsx    # Full Kanban + filters + bulk actions
    ├── JobsPage.tsx        # Job board + post job
    └── SettingsPage.tsx    # Profile / security / notifications / appearance
```

---

## 🎯 Features

- **JWT Auth** — real token from API, validated on every load via `/api/auth/me`
- **Kanban** — 5 columns, drag-and-drop via `@hello-pangea/dnd`, persisted via `PATCH /api/applications/:id`
- **Bulk Actions** — select multiple cards → Shortlist / Reject all at once
- **Job Board** — click a job to filter pipeline to that job's candidates
- **AI Score** — computed client-side from skills/experience match against job requirements
- **XAI Analysis** — strengths, weaknesses, skill gaps, recommendation
- **Add Candidate** — POST to `/api/candidates` then POST to `/api/applications`
- **Post Job** — POST to `/api/jobs`
- **Search** — live filter across name, email, skills
- **Skeleton loaders** — every data section has shimmer skeletons
- **Error toasts** — all API errors surfaced via Sonner
- **Responsive** — mobile sidebar drawer, horizontal kanban scroll
- **Settings** — profile, security, notifications, appearance tabs
