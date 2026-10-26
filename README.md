# ScamShield AI — Login & Signup module

```
scamshield/
├── backend/    Node.js + Express + MongoDB (Mongoose) + JWT
└── frontend/   React (Vite) + React Router, plain CSS
```

## Run

Requirements: Node 18+, MongoDB running locally (or an Atlas URI).

**Backend**
```bash
cd backend
npm install
cp .env.example .env      # then set JWT_SECRET to a long random string
npm run dev               # http://localhost:5000
```

**Frontend** (second terminal)
```bash
cd frontend
npm install
npm run dev               # http://localhost:5173  (proxies /api -> :5000)
```

## API

| Method | Route | Body | Notes |
|---|---|---|---|
| POST | /api/auth/register | name, email, password | returns `{ token, user }` |
| POST | /api/auth/login | email, password, remember | `remember` => 30d token |
| GET | /api/auth/me | — | `Authorization: Bearer <token>` |

## Test checklist
1. Open /signup, submit empty form -> inline validation errors.
2. Register with a valid account -> redirected to /dashboard.
3. Sign out, open /login with a wrong password -> "Invalid email or password."
4. Sign in correctly; tick "Remember me" and refresh -> still signed in.
5. Register the same email again -> "already registered".
6. Visit /dashboard while signed out -> redirected to /login.

## Notes
- Passwords are hashed with bcrypt (12 rounds); never logged or returned.
- Auth routes are rate limited (50 requests / 15 min / IP).
- "Forgot password?" is a placeholder; password reset is not in this release.
- /dashboard is a placeholder to replace with the scan UI.
- Role field (`user` / `admin`) is included for the later admin dashboard.
