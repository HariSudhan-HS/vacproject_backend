
# crave. — Online Food Ordering

A full-stack online food ordering application built with Next.js 15, TypeScript, Tailwind CSS, Express, Mongoose, and MongoDB.

## Requirements

- Node.js 20.9 or later and npm 10+
- MongoDB Atlas connection string, or Docker Desktop for the included local MongoDB service

## Quick start

1. Install all workspace dependencies from the project root:

   ```bash
   npm install
   ```

2. Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env.local` if the local environment files were not created automatically. Set `MONGODB_URI` to your Atlas connection string (or use the local MongoDB default), and replace `JWT_SECRET` with a unique random secret of at least 32 characters. `FRONTEND_URL` accepts comma-separated allowed origins if your frontend uses different ports.

3. For a local database, start MongoDB with `docker compose up -d`. Skip this step when using Atlas.

4. Seed the categories, sample menu, and initial admin user:

   ```bash
   npm run seed
   ```

   The initial admin credentials come from `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `backend/.env`; change them before using a publicly accessible deployment. The seed command updates the admin password if that account already exists.

5. Start the API and web app together:

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000). The API listens on [http://localhost:5000](http://localhost:5000), with health status at `/api/health`.

## Workspace commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start API and Next.js development servers |
| `npm run build` | Type-check/build the API and frontend |
| `npm run seed` | Insert or update initial categories, foods, and admin user |
| `npm run start` | Start both production servers after building |

The backend can also be run with `npm run dev -w backend`, `npm run build -w backend`, and `npm run seed -w backend`. Frontend-specific commands can be run with the `-w frontend` workspace selector.

## Environment

### Backend (`backend/.env`)

See [`backend/.env.example`](./backend/.env.example) for all settings. `MONGODB_URI` and `JWT_SECRET` must be configured. `FRONTEND_URL` is an allowlist of comma-separated browser origins. Admin seed credentials default to a documented local-only account; configure unique values for any real environment.

### Frontend (`frontend/.env.local`)

See [`frontend/.env.example`](./frontend/.env.example). `NEXT_PUBLIC_API_URL` defaults to `http://localhost:5000/api`.

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `GET/PATCH /api/auth/me`
- `GET /api/foods`, `GET /api/foods/:id`; admin `POST/PATCH/DELETE /api/foods`
- `GET /api/categories`; admin category create, update, and delete routes
- Authenticated cart read, item add/update/remove, and clear routes under `/api/cart`
- Customer checkout and order history under `/api/orders`; admins can manage all orders and their statuses
- Admin dashboard and user management under `/api/admin`
- `GET /api/health`

All protected endpoints require `Authorization: Bearer <token>`. The API validates request bodies, hashes passwords, checks roles and order ownership, and returns JSON errors with appropriate status codes.

## Deployment

Build with `npm run build`, then run `npm run start`. Configure the production MongoDB URI, a strong JWT secret, `FRONTEND_URL`, and seed-admin credentials through the hosting provider's secret manager. Serve the frontend and API over HTTPS, restrict database network access to the API host, and use a dedicated least-privileged database user. Never commit `.env` files.
