# SyncSpace — REST API v1 Documentation

Base URL: `/api/v1`

---

## 1. System Health
- **`GET /api/v1/health`**
  - **Description**: Verifies application health and PostgreSQL database connectivity.
  - **Auth**: None
  - **Response 200**:
    ```json
    {
      "status": "healthy",
      "timestamp": "2026-10-29T12:00:00.000Z",
      "database": "connected",
      "uptime": 120,
      "version": "1.0.0"
    }
    ```

---

## 2. Authentication & User Profile
- **`POST /api/v1/auth/register`**
  - **Body**: `{ "name": "Alex", "email": "alex@example.com", "password": "Password123!" }`
  - **Response 201**: `{ "success": true, "data": { "user": { ... }, "token": "...", "defaultWorkspaceId": "..." } }`
  - **Cookies**: Sets secure HTTP-only `syncspace_token`.

- **`POST /api/v1/auth/login`**
  - **Body**: `{ "email": "alex@example.com", "password": "Password123!" }`
  - **Response 200**: `{ "success": true, "data": { "user": { ... }, "token": "..." } }`

- **`POST /api/v1/auth/logout`**
  - **Response 200**: Clears `syncspace_token` cookie.

- **`GET /api/v1/auth/me`**
  - **Auth**: Required
  - **Response 200**: Authenticated user details, memberships, and owned workspaces.

- **`PATCH /api/v1/auth/profile`**
  - **Auth**: Required
  - **Body**: `{ "name": "New Name", "avatarUrl": "https://..." }`

- **`POST /api/v1/auth/forgot-password`**
  - **Body**: `{ "email": "alex@example.com" }`
  - **Response 200**: `{ "message": "...", "devResetUrl": "/reset-password?token=..." }`

- **`POST /api/v1/auth/reset-password`**
  - **Body**: `{ "token": "...", "newPassword": "NewPassword123!" }`

---

## 3. Workspaces
- **`GET /api/v1/workspaces`**
  - **Auth**: Required
  - **Response 200**: List of workspaces the user is a member of, with memberCount and projectCount.

- **`POST /api/v1/workspaces`**
  - **Auth**: Required
  - **Body**: `{ "name": "Acme Core", "description": "..." }`
  - **Response 201**: Newly created workspace with OWNER role.

- **`GET /api/v1/workspaces/:workspaceId`**
  - **Auth**: Required (Member of workspace)
  - **Response 200**: Detailed workspace info, members, and projects.

- **`PATCH /api/v1/workspaces/:workspaceId`**
  - **Auth**: Required (ADMIN or OWNER)
  - **Body**: `{ "name": "Updated Name", "description": "..." }`

- **`DELETE /api/v1/workspaces/:workspaceId`**
  - **Auth**: Required (OWNER only)

- **`GET /api/v1/workspaces/:workspaceId/members`**
  - **Auth**: Required (Member)
  - **Response 200**: Workspace members list with roles.

- **`POST /api/v1/workspaces/:workspaceId/invitations`**
  - **Auth**: Required (ADMIN or OWNER)
  - **Body**: `{ "email": "colleague@example.com", "role": "MEMBER" }`
  - **Response 201**: `{ "invitation": { ... }, "invitationToken": "...", "invitationUrl": "..." }`

- **`POST /api/v1/workspaces/invitations/accept`**
  - **Auth**: Required
  - **Body**: `{ "token": "..." }`

- **`DELETE /api/v1/workspaces/:workspaceId/members/:userId`**
  - **Auth**: Required (ADMIN or OWNER or self-leaving)

- **`PATCH /api/v1/workspaces/:workspaceId/members/:userId/role`**
  - **Auth**: Required (OWNER only)
  - **Body**: `{ "role": "ADMIN" }`

---

## 4. Projects
- **`GET /api/v1/workspaces/:workspaceId/projects`**
  - **Auth**: Required (Member)
  - **Query Params**: `search`, `status`, `sortBy`, `sortOrder`
  - **Response 200**: Projects with progress calculated from actual task data.

- **`POST /api/v1/workspaces/:workspaceId/projects`**
  - **Auth**: Required (Member)
  - **Body**: `{ "name": "Mobile Client", "description": "...", "color": "#6366f1", "status": "ACTIVE" }`
  - **Response 201**: Created project.

- **`GET /api/v1/projects/:projectId`**
  - **Auth**: Required (Project Member)

- **`PATCH /api/v1/projects/:projectId`**
  - **Auth**: Required (ADMIN or OWNER)

- **`DELETE /api/v1/projects/:projectId`**
  - **Auth**: Required (ADMIN or OWNER)

---

## 5. Tasks & Kanban Operations
- **`GET /api/v1/projects/:projectId/tasks`**
  - **Auth**: Required
  - **Query Params**: `status`, `priority`, `assigneeId`, `search`
  - **Response 200**: Tasks sorted by position ascending for Kanban board columns.

- **`POST /api/v1/projects/:projectId/tasks`**
  - **Auth**: Required
  - **Body**:
    ```json
    {
      "title": "Design layout",
      "description": "...",
      "status": "TODO",
      "priority": "HIGH",
      "assigneeId": "uuid-or-null",
      "dueDate": "2026-11-15T00:00:00Z",
      "labels": [{ "name": "UI", "color": "#6366f1" }]
    }
    ```
  - **Real-time**: Emits `task:created` to `project:<projectId>`.

- **`GET /api/v1/tasks/:taskId`**
  - **Auth**: Required
  - **Response 200**: Task details, comments with authors, activity history, labels.

- **`PATCH /api/v1/tasks/:taskId`**
  - **Auth**: Required
  - **Body**: Partial task update. Records audit activity automatically.
  - **Real-time**: Emits `task:updated`.

- **`PATCH /api/v1/tasks/:taskId/move`**
  - **Auth**: Required
  - **Body**: `{ "status": "IN_PROGRESS", "newPosition": 2500.0, "targetColumnTaskIds": [...] }`
  - **Real-time**: Emits `task:moved`.

- **`DELETE /api/v1/tasks/:taskId`**
  - **Auth**: Required
  - **Real-time**: Emits `task:deleted`.

- **`POST /api/v1/tasks/:taskId/comments`**
  - **Auth**: Required
  - **Body**: `{ "content": "Updated PR link" }`
  - **Real-time**: Emits `comment:created`.

- **`GET /api/v1/tasks/my`**
  - **Auth**: Required
  - **Query Params**: `status`, `priority`, `sortBy`, `sortOrder`
  - **Response 200**: Tasks assigned to the authenticated user.

---

## 6. Notifications
- **`GET /api/v1/notifications`**
  - **Auth**: Required
  - **Query Params**: `limit`, `unreadOnly`
  - **Response 200**: `{ "notifications": [...], "unreadCount": 3 }`

- **`PATCH /api/v1/notifications/:notificationId/read`**
  - **Auth**: Required

- **`POST /api/v1/notifications/read-all`**
  - **Auth**: Required
