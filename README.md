# SyncSpace — Real-Time Collaborative Workspace

> *"Your team. One shared space."*

SyncSpace is a production-quality, real-time collaborative workspace web application combining the core workflows of Notion, Trello, and modern project management software. It provides multi-tenant workspaces, drag-and-drop Kanban boards, granular role-based authorization, task commenting, activity auditing, live notifications, and instantaneous multi-user WebSocket synchronization.

---

## Features

- **Multi-Tenant Workspaces**: Create, switch, rename, and manage independent workspaces.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions (`OWNER`, `ADMIN`, `MEMBER`) strictly validated in PostgreSQL.
- **Fluid Kanban Boards**: Draggable task cards with `@dnd-kit`, status columns (`BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`), fractional position sorting, and overdue date alerts.
- **Real-Time Collaboration**: Instantaneous updates using authenticated Socket.IO rooms (`task:created`, `task:moved`, `task:updated`, `comment:created`, etc.). Changes persist to PostgreSQL before broadcasting.
- **Task Management**: Priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), assignees, tags/labels, due dates, task details drawer, and discussions.
- **Activity & Auditing**: Automated timeline logs for task creation, movement, assignment, and commenting.
- **Live Notifications**: In-app notifications with unread counts and real-time push for task assignments and mentions.
- **Invitation System**: Secure, expiring, single-use invitation tokens with a built-in development fallback.
- **Polished Dark Aesthetic**: Refined dark charcoal SaaS design with an optional light theme toggle.

---

## Technology Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + custom dark surfaces
- **Routing**: React Router v6
- **State & Server Cache**: TanStack Query v5
- **HTTP Client**: Axios with credentialed cookies
- **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Real-Time**: Socket.IO Client v4
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library + JSDOM

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database & ORM**: PostgreSQL + Prisma ORM
- **Real-Time**: Socket.IO v4
- **Security**: Helmet, HTTP-only JWT cookies, bcryptjs, CORS, express-rate-limit
- **Validation**: Zod
- **Testing**: Vitest + Supertest

---

## Project Structure

```text
syncspace/
├── frontend/                         # React + Vite application
│   ├── public/
│   ├── src/
│   │   ├── components/               # Reusable modular UI components
│   │   │   ├── ui/                   # Button, Input, Modal, Badge, Skeleton
│   │   │   ├── layout/               # Sidebar, Topbar, AppLayout
│   │   │   ├── common/               # Avatar, ConfirmDialog, EmptyState
│   │   │   ├── dashboard/            # StatCard, RecentProjects, UrgentTasks
│   │   │   ├── workspaces/           # WorkspaceModal, InviteMemberModal, MemberList
│   │   │   ├── projects/             # ProjectCard, ProjectModal, ProjectFilterBar
│   │   │   ├── tasks/                # TaskCard, TaskDetailDrawer, TaskModal, TaskFilterBar
│   │   │   ├── boards/               # KanbanBoard, KanbanColumn
│   │   │   └── notifications/        # NotificationDropdown, NotificationItem
│   │   ├── pages/                    # Route-level screens
│   │   │   ├── auth/                 # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── dashboard/            # Dashboard
│   │   │   ├── workspaces/           # WorkspaceMembers, WorkspaceSettings, AcceptInvitation
│   │   │   ├── projects/             # ProjectList, ProjectBoard
│   │   │   ├── tasks/                # MyTasks
│   │   │   ├── settings/             # ProfileSettings
│   │   │   ├── Landing.jsx           # Landing page
│   │   │   └── NotFound.jsx          # 404 page
│   │   ├── contexts/                 # AuthContext, ThemeContext, ToastContext, WorkspaceContext
│   │   ├── hooks/                    # useAuth, useWorkspaces, useProjects, useTasks, useNotifications
│   │   ├── services/                 # API (Axios modules) & Socket client
│   │   ├── routes/                   # AppRoutes, ProtectedRoute
│   │   ├── test/                     # Vitest frontend tests
│   │   ├── styles/                   # Tailwind entry styles
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── backend/                          # Express API and business logic
│   ├── prisma/
│   │   ├── schema.prisma             # PostgreSQL Prisma Schema
│   │   ├── migrations/               # Database migrations
│   │   └── seed.js                   # Development seed script
│   ├── src/
│   │   ├── config/                   # env.js, prisma.js
│   │   ├── constants/                # roles.js, statuses.js, events.js
│   │   ├── controllers/              # auth, workspace, project, task, notification
│   │   ├── errors/                   # AppError and custom error classes
│   │   ├── middleware/               # requireAuth, requireWorkspaceRole, validateRequest, rateLimiter
│   │   ├── routes/                   # REST API routes under /api/v1
│   │   ├── services/                 # Business logic, transactions, auditing
│   │   ├── sockets/                  # Socket.IO auth, rooms, and emitters
│   │   ├── utils/                    # token.js, response.js
│   │   ├── validators/               # Zod validation schemas
│   │   ├── app.js                    # Express app configuration
│   │   └── server.js                 # Server listener & socket attachment
│   ├── tests/
│   │   ├── integration/              # Supertest integration tests
│   │   └── helpers/
│   ├── .env.example
│   └── package.json
│
├── docs/                             # Architecture & API documentation
│   ├── architecture.md
│   └── api.md
│
├── scripts/                          # Automated setup and startup scripts
│   └── start-db.ps1
├── .gitignore
├── package.json                      # Monorepo workspace configuration
└── README.md
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+ (tested on npm 11)
- **PostgreSQL**: Local PostgreSQL 18 instance running on port 5433 (or standard 5432).

### 2. Database Setup
A dedicated PostgreSQL cluster is initialized for this project. If needed, start it using:
```bash
npm run db:start
```
Or execute the PowerShell script:
```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/start-db.ps1
```

### 3. Environment Variables
Both frontend and backend include ready-to-run `.env` and `.env.example` configurations.

**Backend (`backend/.env`)**:
```env
PORT=3000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL="postgresql://postgres@localhost:5433/syncspace?schema=public"
TEST_DATABASE_URL="postgresql://postgres@localhost:5433/syncspace_test?schema=public"
JWT_SECRET=dev-jwt-super-secret-key-at-least-32-chars-long-12345
COOKIE_NAME=syncspace_token
COOKIE_SECRET=dev-cookie-secret-key-32-chars-syncspace-2026
```

**Frontend (`frontend/.env`)**:
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
```

### 4. Database Migrations & Seeding
Run the Prisma migrations and seed realistic demo personas, workspaces, projects, and Kanban cards:
```bash
npm run db:migrate
npm run db:seed
```

### 5. Running the Application
Start both the backend server and frontend development server concurrently:
```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1
- **API Health Check**: http://localhost:3000/api/v1/health

---

## Seed Accounts / Demo Personas

All seeded accounts use password: `Password123!`

| Persona | Email | Workspace Role | Notes |
|---|---|---|---|
| **Alex Morgan** | `alex@syncspace.dev` | `OWNER` | Workspace owner of Acme Workspace |
| **Elena Rostova** | `elena@syncspace.dev` | `ADMIN` | Product Admin |
| **David Chen** | `david@syncspace.dev` | `MEMBER` | Lead Engineer |
| **Maya Lin** | `maya@syncspace.dev` | `MEMBER` | Designer |

*Tip: The login page includes 1-click persona quick-fill buttons for rapid testing.*

---

## Testing & Quality Verification

Run all test suites across the monorepo:
```bash
# Run both backend and frontend tests
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Build frontend production bundle
npm run build
```

---

## Security Highlights

1. **HTTP-Only Cookies**: Authentication session tokens are stored in HTTP-only, SameSite cookies to protect against XSS token extraction.
2. **Resource Authorization**: Every API request checks whether the authenticated user has access to the target workspace and project.
3. **Socket Room Verification**: Sockets must be authenticated, and room joins (`project:<id>`, `workspace:<id>`) require verified database membership.
4. **Input Validation**: All requests are strictly typed and sanitized using Zod schemas.
5. **Database Parameterization**: All queries use Prisma parameterized prepared statements, mitigating SQL injection risks.
