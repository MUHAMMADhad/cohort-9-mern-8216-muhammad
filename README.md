# Notes App

A full-stack notes application built with the PERN stack:

- PostgreSQL for data storage
- Express 5 and Node.js for the REST API
- React 19 and Vite for the frontend
- JWT authentication with HTTP-only cookies

## Features

- User registration, login, and logout
- Secure password hashing with bcrypt
- Cookie-based authentication
- CSRF protection when cross-site cookies are enabled
- Create, read, update, and delete personal notes
- Ownership checks on every protected note operation
- Backend and frontend automated tests
- SonarQube code-quality and coverage analysis

## Requirements

- Node.js 22 or later
- npm
- PostgreSQL 14 or later

## Project Structure

```text
.
├── backend/
│   ├── src/
│   │   ├── config/          # Environment, database, and logging setup
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Authentication middleware
│   │   ├── models/          # PostgreSQL queries
│   │   └── routes/          # API route definitions
│   └── test/                # Mocha and Supertest tests
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── context/         # Authentication state
│   │   ├── pages/            # Application pages
│   │   └── services/         # API clients
│   └── test/                # Jest and Testing Library tests
├── .github/workflows/       # GitHub Actions workflows
└── sonar-project.properties # SonarQube project configuration
```

## Database Setup

Create a PostgreSQL database, then run the following SQL. The application does
not include a migration tool, so these tables must exist before registration
or note operations are used.

```sql
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	email VARCHAR(255) UNIQUE NOT NULL,
	password TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	title VARCHAR(255) NOT NULL,
	content TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX notes_user_id_idx ON notes(user_id);
```

## Environment Configuration

### Backend

Copy the example file and fill in the PostgreSQL and JWT values:

```powershell
cd backend
Copy-Item .env.example .env
```

| Variable           | Description                      | Example                 |
| ------------------ | -------------------------------- | ----------------------- |
| `PORT`             | API port                         | `5000`                  |
| `NODE_ENV`         | Runtime environment              | `development`           |
| `FRONTEND_ORIGIN`  | Allowed frontend origin          | `http://localhost:5173` |
| `COOKIE_SAME_SITE` | Cookie policy; defaults to `lax` | `lax`                   |
| `DB_HOST`          | PostgreSQL host                  | `localhost`             |
| `DB_PORT`          | PostgreSQL port                  | `5432`                  |
| `DB_USER`          | PostgreSQL user                  | `postgres`              |
| `DB_PASSWORD`      | PostgreSQL password              | `postgres`              |
| `DB_NAME`          | PostgreSQL database              | `notes_app`             |
| `JWT_SECRET`       | Secret used to sign JWTs         | a long random value     |

`JWT_SECRET` must be set. Do not commit `.env` files or real secrets.

### Frontend

```powershell
cd frontend
Copy-Item .env.example .env
```

Set `VITE_API_URL` to the backend URL:

```env
VITE_API_URL=http://localhost:5000
```

## Installation

Install each application independently:

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

## Running Locally

Start the backend in one terminal:

```powershell
cd backend
npm run dev
```

Start the frontend in another terminal:

```powershell
cd frontend
npm run dev
```

The frontend runs on `http://localhost:5173` and the API normally runs on
`http://localhost:5000`.

## Production Build

```powershell
cd frontend
npm run build
npm run preview
```

Run the backend in production with:

```powershell
cd backend
npm start
```

## Testing and Coverage

Backend tests and LCOV coverage:

```powershell
cd backend
npm test
npm run test:coverage
```

Frontend tests with coverage:

```powershell
cd frontend
npm test -- --coverage --watchAll=false
```

HTML reports are generated at:

- `backend/coverage/lcov-report/index.html`
- `frontend/coverage/lcov-report/index.html`

Backend linting:

```powershell
cd backend
npm run lint
```

## API Reference

All endpoints use the `/api/v1` prefix. Authentication is stored in cookies.
Protected note endpoints require a valid login session.

| Method   | Endpoint                | Description                                   |
| -------- | ----------------------- | --------------------------------------------- |
| `GET`    | `/api/v1/health`        | Check API health                              |
| `POST`   | `/api/v1/auth/register` | Register with `name`, `email`, and `password` |
| `POST`   | `/api/v1/auth/login`    | Login with `email` and `password`             |
| `POST`   | `/api/v1/auth/logout`   | Clear authentication cookies                  |
| `GET`    | `/api/v1/notes`         | List the authenticated user's notes           |
| `POST`   | `/api/v1/notes`         | Create a note with `title` and `content`      |
| `GET`    | `/api/v1/notes/:id`     | Get one owned note                            |
| `PUT`    | `/api/v1/notes/:id`     | Update an owned note                          |
| `DELETE` | `/api/v1/notes/:id`     | Delete an owned note                          |

## SonarQube

SonarQube configuration is in
[sonar-project.properties](sonar-project.properties). It analyzes `backend/src`
and `frontend/src`, recognizes both test directories, and imports the backend
and frontend LCOV reports.

The GitHub Actions workflow is in
[.github/workflows/sonarqube.yml](.github/workflows/sonarqube.yml). Configure
these repository values in GitHub before using it:

- Secret: `SONAR_TOKEN`
- Repository variable: `SONAR_HOST_URL`

Create a SonarQube project with the key from `sonar-project.properties` and use
the JavaScript/TypeScript `Sonar way` quality profile. The configuration
excludes dependencies, generated assets, and coverage output while retaining
standard JavaScript rules for application code.
