# SyncSpace — System Architecture & Data Flow

SyncSpace is designed around a clean separation of concerns, strict multi-tenant authorization, transactional persistence, and real-time event distribution.

---

## 1. High-Level System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   React + Vite SPA                     │
│  - Tailwind CSS       - TanStack Query     - dnd-kit   │
│  - Socket.IO Client   - Contexts (Auth/WS) - Axios     │
└───────────────▲────────────────────────▲───────────────┘
                │ HTTP (REST)            │ WebSocket (WSS)
                ▼                        ▼
┌────────────────────────────────────────────────────────┐
│               Node.js + Express Server                 │
│  - Helmet & CORS       - Cookie Session   - Rate Limit │
│  - Centralized Error   - Zod Validation   - Socket.IO  │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│                     Prisma ORM                         │
│  - Safe parameterized queries  - Relational joins      │
│  - Multi-step ACID transactions                        │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                   │
│  - Relational tables  - Foreign keys  - Indexes        │
└────────────────────────────────────────────────────────┘
```

---

## 2. Request Data Flow (REST API)

Every data-modifying or data-retrieval action follows a unidirectional 7-layer lifecycle:

```text
React Component
      │
      ▼
API Service Layer (frontend/src/services/api/*.js)
      │ Axios instance with credentials
      ▼
Express Route (backend/src/routes/*.js)
      │
      ▼
Middleware Pipeline
  ├─ requireAuth (Extracts and validates JWT from secure HTTP-only cookie)
  ├─ requireWorkspaceRole (Verifies DB membership and role: OWNER / ADMIN / MEMBER)
  ├─ validateRequest (Zod schema validation of request body/query)
      │
      ▼
Controller (backend/src/controllers/*.js)
  ├─ Unpacks validated parameters
  ├─ Delegates to Service
      │
      ▼
Service Layer (backend/src/services/*.js)
  ├─ Enforces business rules and authorization policies
  ├─ Manages database transactions
      │
      ▼
Prisma ORM → PostgreSQL
  ├─ Persists changes transactionally
      │
      ▼
Controller returns standard JSON response (sendResponse helper)
      │
      ▼
TanStack Query updates cache / invalidates queries
```

---

## 3. Real-Time Collaboration Flow (Socket.IO)

SyncSpace guarantees that **no real-time event is broadcast until the change is safely committed to PostgreSQL**.

```text
Client A (e.g. moves task)
      │
      ▼
REST API: PATCH /api/v1/tasks/:id/move
      │
      ▼
PostgreSQL Transaction
  ├─ Update Task status & position
  ├─ Write TaskActivity audit record
  ├─ Commit transaction
      │
      ▼
Backend Socket Emitter (backend/src/sockets/socketEmitter.js)
  ├─ emitToProject(projectId, 'task:moved', updatedTask)
      │
      ▼
Authorized Project Room: "project:<projectId>"
  (Only clients who have verified workspace membership can join)
      │
      ▼
Client B receives 'task:moved'
      │
      ▼
TanStack Query cache updated / re-rendered without page reload
```

### Socket Security & Authorization Rules
1. **Authenticated Handshake**: Sockets authenticate during connection using HTTP-only cookies or JWT tokens. Anonymous sockets are rejected.
2. **Authorized Room Subscriptions**: When a client requests `join:project` or `join:workspace`, the backend looks up the project in PostgreSQL to confirm the user is an active member of that workspace. Unauthorized clients cannot eavesdrop on private project events.
3. **No Client Trust**: Client-sent workspace IDs or roles are never trusted. All permissions are verified on the server against the authenticated user ID.

---

## 4. Multi-Tenant Role Hierarchy

SyncSpace defines three primary workspace roles:

| Role | Permissions |
|---|---|
| **OWNER** | Full control. Manage workspace settings, delete workspace, transfer ownership, assign admin roles, manage projects and tasks. |
| **ADMIN** | Manage projects (create, edit, delete), invite new collaborators, remove non-owner members, manage all tasks. |
| **MEMBER** | Access permitted workspace projects, create tasks, move cards on Kanban board, add comments, view team members. |

---

## 5. Scaling to Multiple Server Instances

SyncSpace is currently configured for single-node development with Socket.IO's default in-memory adapter. To scale horizontally across multiple instances in production:
1. **Socket.IO Redis Adapter**: Replace the default adapter with `@socket.io/redis-adapter` to distribute room broadcasts across server clusters.
2. **Session / JWT Statelessness**: SyncSpace uses signed JWTs stored in HTTP-only cookies, making the API stateless and naturally load-balancer friendly.
3. **Connection Pooling**: Use Prisma connection pooling or PgBouncer in front of PostgreSQL for high concurrent database connections.
