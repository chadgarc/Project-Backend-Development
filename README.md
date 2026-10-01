# 📋 TaskMaster API

> A secure RESTful backend for a productivity suite — users, projects & tasks with JWT auth and ownership-based authorization.

![Node](https://img.shields.io/badge/Node-18%2B-green)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Status](https://img.shields.io/badge/Tests-Postman-blue)

---

## 📚 Table of Contents

- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Authentication Flow](#-authentication-flow)
- [Task Status Values](#-task-status-values)
- [API Endpoints](#-api-endpoints)
  - [Users](#users)
  - [Projects](#projects)
  - [Tasks](#tasks)
- [Error Handling](#-error-handling)
- [Testing with Postman](#-testing-with-postman)

---

## 🛠 Tech Stack

| Layer     | Technology                           |
| --------- | ------------------------------------ |
| Runtime   | Node.js (ESM, `"type": "module"`)    |
| Framework | Express 4                            |
| Database  | MongoDB + Mongoose 8                 |
| Auth      | JWT (`jsonwebtoken`), bcrypt hashing |
| Config    | `dotenv` (`.env` never committed)    |

---

## 🚀 Getting Started

### 1. Requirements

- Node.js 18+
- A running MongoDB instance (local or Atlas)

### 2. Install

```bash
npm install
```

### 3. Configure environment

```bash
PORT=3000
MONGO_URI=mongodb:URI
JWT_SECRET=your_super_secure_secret_here
JWT_EXPIRE=7d
```

### 4. Run

```bash
npm start   # node server.js
```

Server → `http://localhost:3000`, API base → `/api`

---

## 🗂 Project Structure

```
├── config/connection.js     # MongoDB connection (side-effect import)
├── models/
│   ├── User.js              # username/email/password + bcrypt pre-save hook
│   ├── Project.js           # name/description + ref → User
│   └── Task.js              # title/description/status(setter+enum) + ref → Project
├── routes/
│   ├── index.js             # mounts /users, /projects, /tasks under /api
│   └── api/
│       ├── userRoutes.js    # register + login (public)
│       ├── projectRoutes.js # 5 project CRUD + 2 nested task routes (protect)
│       └── taskRoutes.js    # PUT/DELETE task via parent ownership (protect)
├── utils/auth.js            # generateToken + protect middleware
├── server.js                # dotenv → json parser → routes → 404 → listen
├── agent.md                 # build checklist & design decisions
└── README.md                # you are here 📍
```

---

## 🔐 Authentication Flow

```
1. POST /api/users/register  →  { token, user }
2. POST /api/users/login     →  { token, user }
3. Client stores token, sends on every protected request:
     Authorization: Bearer <token>
4. `protect` middleware verifies signature + expiry (401 if missing/invalid/expired),
   loads the user (without password) onto `req.user`.
```

- Tokens expire (`JWT_EXPIRE`, default `7d`) — re-login afterwards.
- Passwords are hashed with **bcrypt (pre-save hook, 10 salt rounds)** and **never** returned in responses or embedded in tokens.

---

## 📌 Task Status Values

Canonical values stored in the DB (spaceless slugs):

| Canonical     | Accepted aliases                            |
| ------------- | ------------------------------------------- |
| `todo`        | `todo`, `to_do`, `to do`, `To Do`           |
| `in_progress` | `in_progress`, `in progress`, `In Progress` |
| `completed`   | `completed`, `done`, `Done`, `Completed`    |

> A Mongoose `set()` on `models/Task.js` normalizes aliases (case-insensitive) to the canonical value **before** `enum` validation, so clients/tests may send either form.

---

## 📡 API Endpoints

All responses follow `{ success: true|false, ... }`.
Protected routes require `Authorization: Bearer <token>`.

### Users

| Method | Path                  | Description       |
| ------ | --------------------- | ----------------- |
| POST   | `/api/users/register` | Register new user |
| POST   | `/api/users/login`    | Login, get token  |

**POST `/api/users/register`** → `201`

```jsonc
// Body
{
  "username": "userA",
  "email": "userA@test.com",
  "password": "password123"
}
// Response
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": { "id": "...", "username": "userA", "email": "userA@test.com" }
}
```

Duplicate email → `400`.

**POST `/api/users/login`** → `200`

```jsonc
// Body
{
  "email": "userA@test.com",
  "password": "password123"
}
// Response
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": { "id": "...", "username": "userA", "email": "userA@test.com" }
}
```

Wrong credentials → `401 { success: false, message: "Invalid credentials" }` (generic on purpose — no email enumeration).

---

### Projects

| Method | Path                | Auth | Description                          |
| ------ | ------------------- | ---- | ------------------------------------ |
| POST   | `/api/projects`     | ✅   | Create project (owner = token user)  |
| GET    | `/api/projects`     | ✅   | List only my projects                |
| GET    | `/api/projects/:id` | ✅   | Get one (owner only, 403 otherwise)  |
| PUT    | `/api/projects/:id` | ✅   | Update (owner only, partial allowed) |
| DELETE | `/api/projects/:id` | ✅   | Delete + cascade tasks (owner only)  |

**POST `/api/projects`** → `201`

```jsonc
// Body
{
  "name": "Website Redesign",
  "description": "Q4 homepage overhaul"
}
// Response
{ "success": true, "project": { "_id": "...", "name": "...", "user": "..." } }
```

**PUT `/api/projects/:id`** → `200` (partial updates supported)

```jsonc
// Body — any subset
{
  "description": "Scope updated",
}
```

**DELETE `/api/projects/:id`** → `200`

```jsonc
{ "success": true, "message": "Project deleted successfully" }
```

> Cascade: all `Task`s with `project === id` are deleted first, then the project.

---

### Tasks

| Method | Path                             | Auth | Description                        |
| ------ | -------------------------------- | ---- | ---------------------------------- |
| POST   | `/api/projects/:projectId/tasks` | ✅   | Create task (parent owner only)    |
| GET    | `/api/projects/:projectId/tasks` | ✅   | List tasks (parent owner only)     |
| PUT    | `/api/tasks/:taskId`             | ✅   | Update (parent-project owner only) |
| DELETE | `/api/tasks/:taskId`             | ✅   | Delete (parent-project owner only) |

**POST `/api/projects/:projectId/tasks`** → `201`

```jsonc
// Body
{
  "title": "Design mockups",
  "description": "Figma first draft",
  "status": "todo", // or "To Do" — alias accepted
}
```

**PUT `/api/tasks/:taskId`** → `200` (partial updates supported)

```jsonc
// Body — any subset
{
  "status": "completed",
}
```

> Authorization for `PUT`/`DELETE /api/tasks/:taskId` resolves ownership **through the parent**: `task → populate('project') → project.user === req.user.id`, else `403`. Orphaned tasks (missing parent) return `404`.

---

## ⚠️ Error Handling

Consistent shape: `{ "success": false, "message": "..." }` — stack traces never leak to clients.

| Code | Meaning                         | Example                                                                        |
| ---- | ------------------------------- | ------------------------------------------------------------------------------ |
| 400  | Bad request / validation        | Missing fields, `ValidationError`, `CastError` (malformed ID), duplicate email |
| 401  | Unauthenticated                 | No/invalid/expired token, bad login                                            |
| 403  | Authenticated but not the owner | Accessing another user's project/task                                          |
| 404  | Not found                       | Unknown project/task ID, orphan parent                                         |
| 500  | Server error                    | Unexpected failures                                                            |

> **401 vs 403 rule:** no token (or bad token) → `401`. Valid token, another user's resource → `403`. Non-existent resource → `404` (checked before ownership).

---

## 🧪 Testing with Postman

Set a `{{token}}` environment variable from the login response and send it as `Authorization: Bearer {{token}}` on protected requests. Suggested order:

1. `POST /api/users/register` (userA + userB) → `201`
2. `POST /api/users/login` → `200`, save both tokens
3. `POST /api/projects` (A) → `201`, save `{{projectId}}`
4. `GET /api/projects` (A) → only A's projects
5. `GET /api/projects/:id` — A → `200`, B → `403`, no token → `401`, bad ID → `400`
6. `PUT /api/projects/:id` partial `{ "description": "..." }` — A → `200`, B → `403`
7. `POST /api/projects/:id/tasks` — A → `201` (try `"status": "To Do"`), B → `403`
8. `GET /api/projects/:id/tasks` — A → `200`, B → `403`
9. `PUT /api/tasks/:taskId { "status": "completed" }` — A → `200`, B → `403`
10. `DELETE /api/tasks/:taskId` — B → `403`, then A → `200`
11. `DELETE /api/projects/:id` — A → `200`; verify cascade (tasks gone)

### 🎬 End-to-End Scenario (copy-paste in order)

> Save IDs as you go: `{{tokenA}}`, `{{tokenB}}`, `{{project1}}`, `{{project2}}`, `{{task1}}`, `{{task2}}`, `{{task3}}`.

**Step 1 — Register User A** · `POST /api/users/register` → `201`

```json
{
  "username": "alice",
  "email": "alice@test.com",
  "password": "password123"
}
```

Repeat for User B (`bob` / `bob@test.com`), save both tokens.

**Step 2 — Login User A** · `POST /api/users/login` → `200`

```json
{
  "email": "alice@test.com",
  "password": "password123"
}
```

**Step 3 — Create Project 1 (Alice)** · `POST /api/projects` (`Bearer {{tokenA}}`) → `201`

```json
{
  "name": "Website Redesign",
  "description": "Q4 homepage overhaul"
}
```

Save `_id` as `{{project1}}`.

**Step 4 — Create Project 2 (Alice)** · `POST /api/projects` (`Bearer {{tokenA}}`) → `201`

```json
{
  "name": "Mobile App",
  "description": "iOS and Android MVP"
}
```

Save `_id` as `{{project2}}`.

**Step 5 — Create 2 tasks in Project 1** · `POST /api/projects/{{project1}}/tasks` (`Bearer {{tokenA}}`) → `201`

```json
{
  "title": "Design mockups",
  "description": "Figma first draft",
  "status": "todo"
}
```

Save as `{{task1}}`. Then:

```json
{
  "title": "Write copy",
  "description": "Hero section text",
  "status": "To Do"
}
```

Save as `{{task2}}` (tests the `To Do` → `todo` alias).

**Step 6 — Create 1 task in Project 2** · `POST /api/projects/{{project2}}/tasks` (`Bearer {{tokenA}}`) → `201`

```json
{
  "title": "Setup repo",
  "description": "Init React Native",
  "status": "in_progress"
}
```

Save as `{{task3}}`.

**Step 7 — Delete a single task** · `DELETE /api/tasks/{{task2}}` (`Bearer {{tokenA}}`) → `200`

Verify: `GET /api/projects/{{project1}}/tasks` lists only `{{task1}}` — the sibling survives.

**Step 8 — Delete Project 2 with cascade** · `DELETE /api/projects/{{project2}}` (`Bearer {{tokenA}}`) → `200`

Verify cascade: `GET /api/projects/{{project2}}/tasks` → `404` (parent gone, `{{task3}}` deleted with it).

**Step 9 — Cross-user security** · all with `Bearer {{tokenB}}` → `403`

- `GET /api/projects/{{project1}}`
- `DELETE /api/tasks/{{task1}}`
