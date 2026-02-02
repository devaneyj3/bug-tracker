# Bug Tracker MVP

Minimal bug tracker with login, projects, issues, and comments. The Express API
serves the React SPA from the `client` folder.

## Getting started

1. Install dependencies

```bash
cd /Users/jordandevaney/Desktop/vibe_coded_apps/server
npm install
```

2. Start the API + frontend

```bash
npm start
```

3. Open the app

Visit `http://localhost:3001`.

## Notes

- SQLite database file lives at `server/bug_tracker.sqlite`.
- Set `JWT_SECRET` in your environment for a persistent auth secret.
