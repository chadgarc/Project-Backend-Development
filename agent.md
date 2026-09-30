# TaskMaster Backend API - Agent Checklist

## Project Overview
Build a complete RESTful API for TaskMaster, a productivity application with user authentication, project management, and task management. Target score: **300/300**

---

## Phase 1: Planning & Setup (Foundation)

### Project Initialization
- [ ] Create project directory and initialize with `npm init`
- [ ] Install dependencies: `express`, `mongoose`, `bcrypt`, `jsonwebtoken`, `dotenv`
- [ ] Create `.gitignore` excluding `node_modules` and `.env`
- [ ] Create `.env` file with:
  - `MONGO_URI` - MongoDB connection string
  - `PORT` - Server port (e.g., 5000)
  - `JWT_SECRET` - Secure random string for JWT signing

### Modular Folder Structure
```
project-root/
├── config/
│   └── db.js              # Database connection
├── models/
│   ├── User.js            # User schema
│   ├── Project.js         # Project schema
│   └── Task.js            # Task schema
├── routes/
│   └── api/
│       ├── userRoutes.js  # Auth routes
│       ├── projectRoutes.js
│       └── taskRoutes.js
├── utils/
│   └── auth.js            # Auth middleware & helpers
├── server.js              # Entry point
├── .env
├── .gitignore
├── package.json
└── README.md              # API documentation
```

### Documentation
- [ ] Create comprehensive `README.md` with:
  - Project description
  - API endpoint documentation (all routes with methods, paths, request/response examples)
  - Setup instructions
  - Environment variables needed
  - Authentication flow explanation

---

## Phase 2: Data Modeling (The Blueprint) - 30 pts

### User Model (`models/User.js`) - 20 pts (Password Security)
- [ ] Fields: `username` (String, required, unique), `email` (String, required, unique), `password` (String, required)
- [ ] **Pre-save hook**: Hash password using `bcrypt` with salt rounds ≥ 10
- [ ] Method: `comparePassword(candidatePassword)` for login validation
- [ ] Timestamps: `createdAt`, `updatedAt`

### Project Model (`models/Project.js`) - 30 pts (Relationships)
- [ ] Fields: `name` (String, required), `description` (String), `user` (ObjectId, ref: 'User', required)
- [ ] Virtual populate for tasks (optional but recommended)
- [ ] Timestamps: `createdAt`, `updatedAt`

### Task Model (`models/Task.js`) - 30 pts (Relationships)
- [ ] Fields: `title` (String, required), `description` (String), `status` (String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do'), `project` (ObjectId, ref: 'Project', required)
- [ ] Timestamps: `createdAt`, `updatedAt`

---

## Phase 3: Authentication API (The Gatekeeper) - 40 pts

### Auth Middleware (`utils/auth.js`)
- [ ] `protect` middleware: Verify JWT from Authorization header, attach `req.user`
- [ ] Error handling: 401 for missing/invalid/expired tokens

### User Routes (`routes/api/userRoutes.js`) - 40 pts

#### POST `/api/users/register` - 20 pts
- [ ] Validate required fields (username, email, password)
- [ ] Check for duplicate email → return 400
- [ ] Create user (password hashed by pre-save hook)
- [ ] Return 201 with user data (exclude password) + JWT token

#### POST `/api/users/login` - 20 pts
- [ ] Find user by email
- [ ] Compare provided password with hashed password using `comparePassword`
- [ ] On success: Generate JWT with user ID, expire in 7d/30d
- [ ] Return 200 with token and user data (exclude password)
- [ ] On failure: Return 401 with generic error message

---

## Phase 4: Projects API (Managing the Big Picture) - 70 pts

### Project Routes (`routes/api/projectRoutes.js`) - 70 pts

#### All routes protected by `protect` middleware

#### POST `/api/projects` - Create
- [ ] Get user ID from `req.user.id`
- [ ] Create project with `user: req.user.id`
- [ ] Return 201 with created project

#### GET `/api/projects` - Get All (User's only)
- [ ] Query: `Project.find({ user: req.user.id })`
- [ ] Return 200 with array of projects

#### GET `/api/projects/:id` - Get One
- [ ] Find project by ID
- [ ] **Ownership check**: `project.user.toString() === req.user.id`
- [ ] If not owner → 403 Forbidden
- [ ] If not found → 404 Not Found
- [ ] Return 200 with project

#### PUT `/api/projects/:id` - Update
- [ ] Find project by ID
- [ ] **Ownership check** (same as GET one)
- [ ] Update allowed fields (name, description)
- [ ] Return 200 with updated project

#### DELETE `/api/projects/:id` - Delete
- [ ] Find project by ID
- [ ] **Ownership check** (same as GET one)
- [ ] Delete project
- [ ] **Cascade delete**: Delete all tasks belonging to this project (optional but recommended)
- [ ] Return 200 with success message

---

## Phase 5: Tasks API (The Nitty-Gritty) - 70 pts

### Task Routes (`routes/api/taskRoutes.js`) - 70 pts

#### All routes protected by `protect` middleware

#### POST `/api/projects/:projectId/tasks` - Create Task
- [ ] Verify project exists: `Project.findById(req.params.projectId)`
- [ ] **Ownership check**: `project.user.toString() === req.user.id`
- [ ] If not owner → 403 Forbidden
- [ ] Create task with `project: req.params.projectId`
- [ ] Return 201 with created task

#### GET `/api/projects/:projectId/tasks` - Get All Tasks
- [ ] Verify project exists
- [ ] **Ownership check** on parent project
- [ ] Query: `Task.find({ project: req.params.projectId })`
- [ ] Return 200 with array of tasks

#### PUT `/api/tasks/:taskId` - Update Task
- [ ] Find task by ID: `Task.findById(req.params.taskId).populate('project')`
- [ ] **Complex authorization**: `task.project.user.toString() === req.user.id`
- [ ] If not owner → 403 Forbidden
- [ ] Update allowed fields (title, description, status)
- [ ] Return 200 with updated task

#### DELETE `/api/tasks/:taskId` - Delete Task
- [ ] Find task by ID with populated project
- [ ] **Complex authorization** (same as PUT)
- [ ] Delete task
- [ ] Return 200 with success message

---

## Security Requirements Checklist

### Authentication
- [ ] JWT tokens signed with secure secret from `.env`
- [ ] Tokens expire (recommended: 7-30 days)
- [ ] Passwords **never** returned in responses
- [ ] Passwords hashed with bcrypt (pre-save hook, not in route)

### Authorization
- [ ] All project/task routes require valid JWT
- [ ] Users can only access their own projects (403 if not owner)
- [ ] Users can only access tasks in their own projects (403 if not owner)
- [ ] No route allows cross-user data access

### Error Handling
- [ ] Consistent error response format: `{ success: false, message: "..." }`
- [ ] Proper HTTP status codes: 400, 401, 403, 404, 500
- [ ] No stack traces leaked to client
- [ ] Mongoose validation errors handled gracefully

---

## Testing Checklist (Manual via Insomnia/Postman)

### Auth Tests
- [ ] Register new user → 201, returns token
- [ ] Register duplicate email → 400
- [ ] Login with correct credentials → 200, returns token
- [ ] Login with wrong password → 401
- [ ] Login with non-existent email → 401
- [ ] Access protected route without token → 401
- [ ] Access protected route with invalid token → 401

### Project Tests
- [ ] Create project as User A → 201
- [ ] Get all projects as User A → 200, shows only User A's projects
- [ ] Get single project as owner → 200
- [ ] Get single project as non-owner (User B) → 403
- [ ] Update project as owner → 200
- [ ] Update project as non-owner → 403
- [ ] Delete project as owner → 200
- [ ] Delete project as non-owner → 403

### Task Tests
- [ ] Create task in User A's project → 201
- [ ] Create task in User B's project as User A → 403
- [ ] Get tasks in User A's project → 200
- [ ] Get tasks in User B's project as User A → 403
- [ ] Update task in own project → 200
- [ ] Update task in other user's project → 403
- [ ] Delete task in own project → 200
- [ ] Delete task in other user's project → 403

### Edge Cases
- [ ] GET/PUT/DELETE non-existent project → 404
- [ ] GET/PUT/DELETE non-existent task → 404
- [ ] Create task with invalid projectId → 404
- [ ] Malformed ObjectId in params → 400/500 handled gracefully

---

## Code Quality Standards

- [ ] No hardcoded secrets (all in `.env`)
- [ ] `.env` in `.gitignore` (never committed)
- [ ] Consistent code style (ESLint/Prettier recommended)
- [ ] Meaningful variable/function names
- [ ] Comments for complex logic
- [ ] DRY principle: Reusable middleware, helper functions
- [ ] Async/await with try/catch or express-async-errors
- [ ] Proper separation of concerns (routes, controllers, models, middleware)

---

## Submission Requirements

- [ ] GitHub repository created
- [ ] All code pushed (except `.env` and `node_modules`)
- [ ] `.gitignore` working correctly
- [ ] `README.md` complete and accurate
- [ ] Application runs with `npm start` or `node server.js`
- [ ] All endpoints tested and working

---

## Grading Rubric Mapping

| Criteria | Points | Checklist Section |
|----------|--------|-------------------|
| Project Planning & Documentation | 10 | Phase 1 - Documentation |
| Project Structure & Modularity | 15 | Phase 1 - Modular Folder Structure |
| Configuration & Env Security | 15 | Phase 1 - Project Initialization |
| Mongoose Schema Definition | 30 | Phase 2 - All Models |
| Data Model Relationships (ref) | 30 | Phase 2 - Models (ref fields) |
| Password Security (bcrypt) | 20 | Phase 2 - User Model pre-save hook |
| User Registration Endpoint | 20 | Phase 3 - POST /register |
| User Login & JWT Implementation | 20 | Phase 3 - POST /login |
| Projects API: CRUD Functionality | 30 | Phase 4 - All 5 CRUD endpoints |
| Projects API: Authorization | 40 | Phase 4 - Ownership checks |
| Tasks API: CRUD Functionality | 30 | Phase 5 - All 4 CRUD endpoints |
| Tasks API: Authorization | 40 | Phase 5 - Parent project ownership checks |
| **TOTAL** | **300** | |

---

## Implementation Order Recommendation

1. **Setup**: Project init, dependencies, folder structure, `.env`, `.gitignore`
2. **Database**: `config/db.js` connection
3. **Models**: User → Project → Task (in order of dependency)
4. **Auth Utils**: JWT middleware, password comparison
5. **Auth Routes**: Register → Login
6. **Project Routes**: All 5 CRUD with authorization
7. **Task Routes**: All 4 CRUD with nested authorization
8. **Server.js**: Wire everything together
9. **README.md**: Document all endpoints
10. **Testing**: Comprehensive manual testing
11. **Cleanup**: Verify `.gitignore`, remove console.logs, final commit

---

## Notes for Maximum Score

- **Pre-save hook for bcrypt** is mandatory (not in route handler)
- **Ownership checks** must return **403 Forbidden** (not 404 or 401)
- **Nested routes** for tasks: `/api/projects/:projectId/tasks`
- **Complex authorization** for tasks: Check task → project → user ownership
- **Cascade delete** for project tasks shows attention to detail
- **Consistent error format** and proper status codes throughout
- **README.md** must be thoughtful and complete
- **Zero hardcoded secrets** - verify `.gitignore` works