# Workspace

## Overview

pnpm workspace monorepo using TypeScript. SkillSwap Platform — a full-stack web app where users can offer and request skill swaps with each other.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: JWT (jsonwebtoken + bcryptjs)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/        # Express API server (auth, users, requests, notifications, admin, stats)
│   └── skillswap/         # React + Vite frontend (served at /)
├── lib/
│   ├── api-spec/          # OpenAPI spec + Orval codegen config
│   ├── api-client-react/  # Generated React Query hooks
│   ├── api-zod/           # Generated Zod schemas from OpenAPI
│   └── db/                # Drizzle ORM schema + DB connection
├── scripts/               # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

- `users` — id, name, email, password (hashed), role (admin/user), bio, location, profile_image, skills_offered (array), skills_wanted (array), is_blocked, created_at, updated_at
- `requests` — id, sender_id, receiver_id, skill_offered, skill_requested, message, status (pending/accepted/rejected/completed), created_at, updated_at
- `notifications` — id, user_id, message, type, related_id, is_read, created_at

## Seed Data

Admin user: shrushtipatil2905@gmail.com / Admin@123 (role: admin)
Sample users: arjun.sharma@example.com, priya.mehta@example.com, rahul.verma@example.com, sneha.nair@example.com, vikram.patel@example.com (password: Admin@123 — same hash was used for all)

## API Routes

All routes under `/api/`:
- `POST /auth/signup` — Register new user
- `POST /auth/login` — Login, returns JWT
- `GET /auth/me` — Current user (requires JWT)
- `GET /users` — Browse users with search/filter
- `GET /users/matches` — Skill match recommendations
- `GET /users/:id` — User profile
- `PUT /users/profile` — Update own profile
- `GET /requests` — User's requests (sent/received)
- `POST /requests` — Create swap request
- `POST /requests/:id/accept|reject|complete` — Update request status
- `DELETE /requests/:id` — Delete request
- `GET /notifications` — User notifications
- `POST /notifications/:id/read` — Mark notification read
- `POST /notifications/read-all` — Mark all read
- `GET /admin/users` — Admin: all users
- `POST /admin/users/:id/block|unblock` — Admin: block/unblock
- `DELETE /admin/users/:id` — Admin: delete user
- `GET /admin/requests` — Admin: all requests
- `GET /stats` — Platform statistics
- `GET /stats/recent-activity` — Recent activity feed
- `GET /stats/top-skills` — Most popular skills

## Frontend Pages

- `/` — Landing page
- `/login` — Login
- `/signup` — Signup
- `/dashboard` — User dashboard
- `/explore` — Browse users/skills
- `/matches` — Skill match recommendations
- `/requests` — Manage swap requests
- `/notifications` — Notifications
- `/profile` — Edit profile
- `/users/:id` — User public profile
- `/admin` — Admin dashboard (admin only)
