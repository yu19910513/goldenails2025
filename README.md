# ✨ GOLDENAILS2025

Elevate your beauty experience with seamless online booking.

![Last Commit](https://img.shields.io/github/last-commit/yu19910513/goldenails2025?style=flat-square)
![JavaScript](https://img.shields.io/github/languages/top/yu19910513/goldenails2025?style=flat-square&logo=javascript)
![Repo Size](https://img.shields.io/github/repo-size/yu19910513/goldenails2025?style=flat-square)
![Languages](https://img.shields.io/github/languages/count/yu19910513/goldenails2025?style=flat-square)

---

## 📚 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Run Locally](#run-locally)
- [Testing](#testing)
- [Linting](#linting)
- [Deployment](#deployment)
- [Scripts](#scripts)
- [API](#api)
- [Contributing](#contributing)
- [License](#license)

---

## 📖 Overview

Goldenails2025 is a full‑stack web app for beauty service providers featuring online booking, appointment history, notifications, and an admin workflow. The client is built with React + Vite; the server is an Express API backed by Sequelize and MySQL. In production, Express serves the built React UI.

## ✨ Features

- Booking flow for services and group sessions
- Appointment history and customer management
- Admin routes protected by JWT and role checks
- SMS notifications via Twilio and email via Gmail SMTP
- Responsive UI with Tailwind CSS and UIkit components
- Vite dev server with API proxy for smooth local development
- Jest test suites for both client and server

## 🧱 Architecture

- Client (React + Vite): served in dev, output built to `dist` for production.
- Server (Express): exposes `/api` routes, serves `/dist` for SPA in production, connects to MySQL via Sequelize. Port defaults to `8000`.
- Dev proxy: Vite proxies `/api` to the server during development.

```
Client (Vite 5173)  ↔  /api proxy  ↔  Server (Express 8000)  ↔  MySQL (Sequelize)
```

## 🛠 Tech Stack

- Frontend: React, Vite, Tailwind CSS, UIkit
- Backend: Node.js, Express, Sequelize, MySQL
- Messaging: Twilio (SMS), Nodemailer (Gmail SMTP)
- Auth: JWT with role-based authorization
- Tooling: Jest, ESLint, dotenv, concurrently, nodemon

## 📁 Project Structure

```
goldenails2025/
├─ client/                 # React app (Vite)
│  ├─ src/
│  ├─ vite.config.js       # /api proxy → http://localhost:8000
│  └─ package.json
├─ server/                 # Express API + Sequelize
│  ├─ controllers/         # /api routes
│  ├─ config/connection.js # DB connection (env-driven)
│  ├─ db/schema.sql        # Local DB bootstrap (auric_db)
│  ├─ utils/               # auth, notification, templates
│  └─ package.json
├─ Procfile                # Heroku process config
├─ package.json            # Root scripts (dev + test + build)
└─ README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x and npm ≥ 9.x
- MySQL 8+ running locally or a hosted MySQL instance

### Installation

```bash
git clone https://github.com/yu19910513/goldenails2025
cd goldenails2025
npm install
```

### Environment Variables

Create a `.env` file under `server/` with the following keys. For production you can use `DATABASE_URL`; for local development, use the discrete DB settings.

```env
# Database (choose one approach)
DATABASE_URL=
DB_NAME=auric_db
DB_USER=
DB_PW=

# JWT
JWT_SECRET=change_me
ADMIN_TOKEN_EXPIRATION=1y
CUSTOMER_TOKEN_EXPIRATION=2h

# Basic referrer guard for /api (comma-separated, lowercase; include dev)
ALLOWED_REFERRERS=http://localhost:5173,http://localhost:4173

# Twilio (SMS)
TWILIO_SID=
TWILIO_TOKEN=
TWILIO_NUMBER=

# Email (Gmail SMTP)
BUSINESS_EMAIL=
APP_PASSWORD=
```

Reference implementation details:

- DB config in server: server/config/connection.js
- JWT/auth helpers: server/utils/authentication.js
- Notifications (SMS/Email): server/utils/notification.js

### Database Setup

Option A — Quick schema:

```sql
-- server/db/schema.sql
DROP DATABASE IF EXISTS auric_db;
CREATE DATABASE auric_db;
```

Then set `DB_NAME=auric_db` and let Sequelize `sync()` create tables on first run.

Option B — Hosted MySQL:

- Provide `DATABASE_URL` (e.g., for platforms like Heroku/ClearDB/Railway) and omit discrete `DB_*` values.

### Run Locally

Start both client and server with one command:

```bash
npm run start
```

Useful scripts during development:

```bash
# Equivalent dev script (concurrently runs API and Vite)
npm run start:dev

# Run only API watcher
cd server && npm run watch

# Run only client dev server
cd client && npm run dev
```

- Client (Vite) default: http://localhost:5173
- API base URL: http://localhost:8000/api

---

## 🧪 Testing

Run all tests (server + client):

```bash
npm test
```

Coverage reports:

```bash
npm run coverage
```

## 🧹 Linting

Client ESLint:

```bash
cd client && npm run lint
```

---

## 🚢 Deployment

- Production build bundles the client into `dist` and the Express server serves it.
- Heroku compatibility via `Procfile` and `heroku-postbuild`.

Minimal steps (example):

1) Set required config vars (see .env section) in your hosting platform.
2) Ensure MySQL is reachable (use `DATABASE_URL` or `DB_*`).
3) Build client on deploy (root script `heroku-postbuild` handles this for Heroku).
4) Start server with `node server/server.js` (handled by `Procfile`).

---

## 🧰 Scripts

Root:

- `start`: chooses prod or dev based on `NODE_ENV`
- `start:dev`: runs API (nodemon) + client (Vite) concurrently
- `start:prod`: runs Express serving built client
- `test` / `coverage`: runs server and client suites in parallel
- `install`: installs server then client dependencies

Client:

- `dev`, `build`, `preview`, `test`, `test:coverage`, `lint`

Server:

- `start`, `watch`, `test`, `test:coverage`

---

## 🔌 API

- Base path: `/api`
- Note: a basic referrer guard is applied. Ensure `ALLOWED_REFERRERS` includes your dev and production origins.
- Explore routes under: server/controllers/api

---

## 🤝 Contributing

Issues and PRs are welcome. Please:

- Run tests and linters before submitting.
- Keep PRs focused and well-described.

---

## 📄 License

ISC © 2025 Goldenails2025 contributors
