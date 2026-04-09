# Tuition Growth Platform (Subang Jaya)

A commercial-style web application for tuition centers in Malaysia, designed to help parents and educators improve exam outcomes while keeping learning engaging.

## Key capabilities

- **Student onboarding CRM** with parent/guardian contacts and learning goals.
- **Class catalog + enrollment readiness** for tuition center operations.
- **Assessment tracking** for quizzes and exams with automatic points.
- **Gamified leaderboard** to motivate consistent progress.
- **Engagement event feed** to document organic touchpoints from market/community interactions.
- **Automation-ready daily digest job** (cron) for parent progress updates.
- **Web + mobile support** through a responsive interface and PWA setup (installable on phones/tablets).

## Tech stack

- Node.js + Express API
- SQLite database
- Vanilla JS frontend with responsive CSS
- Service Worker + Web App Manifest for mobile installation

## Run locally

```bash
npm install
npm start
```

Then open <http://localhost:3000>.

## API overview

- `GET /api/health` – platform status summary.
- `GET /api/classes` – list tuition classes.
- `GET /api/students` – list students.
- `POST /api/students` – register a student.
- `POST /api/enrollments` – enroll a student in class.
- `POST /api/assessments` – record exam score and award points.
- `GET /api/dashboard` – leaderboard, progress analytics, engagement stream.

## Data model

SQLite tables created at startup:

- `students`
- `classes`
- `enrollments`
- `assessments`
- `engagement_events`

Database file is stored in `data/tuition.db`.
