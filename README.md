# TrackFlow

> Agile project tracker built with **Next.js 15**, **TypeScript**, **PostgreSQL** (Prisma), **Tailwind CSS** & **shadcn/ui**.

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | Next.js 15 (App Router + Turbopack) |
| Language    | TypeScript 5 (strict)               |
| Database    | PostgreSQL via Prisma 5             |
| Auth        | Auth.js v5 (NextAuth)               |
| UI          | Tailwind CSS + shadcn/ui            |
| Validation  | Zod                                 |
| DnD Board   | @hello-pangea/dnd                   |
| Hosting     | Vercel                              |

---

## Quick Start

### 1. Clone & install
```bash
git clone https://github.com/your-org/trackflow
cd trackflow
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
# Fill in DATABASE_URL and AUTH_SECRET
```

Generate an `AUTH_SECRET`:
```bash
npx auth secret
```

### 3. Set up the database
```bash
# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed demo data (optional)
npm run db:seed
```

### 4. Start development server
```bash
npm run dev
# → http://localhost:3000
```

Demo credentials (after seeding):
- **Email:** demo@trackflow.dev
- **Password:** password123

---

## Project Structure

```
trackflow/
├── app/                    # Next.js App Router
│   ├── api/                # Route Handlers (REST API)
│   ├── dashboard/          # Main dashboard
│   ├── projects/           # Project CRUD + detail
│   ├── board/              # Sprint Kanban board
│   ├── login/              # Auth page
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # Reusable UI (shadcn + custom)
│   ├── layout/             # AppShell, Sidebar
│   ├── projects/           # Project-specific components
│   └── tasks/              # KanbanBoard, TaskCard
├── lib/
│   ├── auth.ts             # Auth.js v5 config
│   ├── db.ts               # Prisma singleton
│   ├── services/           # Business logic
│   ├── validations/        # Zod schemas
│   └── utils.ts            # cn() helper
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Dev seed data
├── types/
│   └── index.ts            # Shared TypeScript types
└── middleware.ts            # Auth guard
```

---

## Next.js 15 Key Differences

| Feature | Next.js 14 | Next.js 15 |
|---------|-----------|------------|
| `params` in Route Handlers | Sync object | **Promise — must `await params`** |
| `fetch` caching | Cached by default | **Not cached by default** |
| Turbopack | Experimental | **Stable (default with `--turbopack`)** |
| React | React 18 | **React 19** |
| PPR | Not available | **Opt-in via `experimental.ppr`** |

---

## Database Schema

```
users ──< projects ──< phases ──< milestones ──< tasks
                  └──< sprints ──────────────────────┘
```

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/api/projects` | List / create projects |
| GET/PATCH/DELETE | `/api/projects/[id]` | Project detail |
| GET/POST | `/api/projects/[id]/phases` | Phase list / create |
| PATCH/DELETE | `/api/phases/[id]` | Update / delete phase |
| GET/POST | `/api/phases/[id]/milestones` | Milestones |
| PATCH/DELETE | `/api/milestones/[id]` | Update / delete milestone |
| GET/POST | `/api/milestones/[id]/tasks` | Tasks |
| PATCH/DELETE | `/api/tasks/[id]` | Update / delete task |
| GET/POST | `/api/sprints` | Sprints |
| PATCH/DELETE | `/api/sprints/[id]` | Update / delete sprint |

---

## Scrum Workflow

TrackFlow tracks Agile (Scrum) projects with 2-week sprints:

1. **Sprint Planning** — Create a sprint, pull tasks from backlog
2. **Daily work** — Move task cards across the Kanban board
3. **Sprint Review** — Check progress via the dashboard
4. **Retrospective** — Review completed vs blocked tasks, start next sprint

Status flow: `TODO → IN_PROGRESS → IN_REVIEW → DONE`
