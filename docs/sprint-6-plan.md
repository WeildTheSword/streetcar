# Sprint 6 plan — Module 6, Deploy to Production

**Sprint:** Sprint 6 - Deploy to Production, Nov 16 to Dec 4, 2026 (includes Thanksgiving break) · **Goal:** put the app live on Render with Supabase Postgres and a test-gated GitHub Actions deploy, plus the Playwright, mobile, Google sign-in and additional-feature extra credit.

This is the final sprint. Story 1 is the graded one; Stories 2 to 5 are extra credit. Land Story 1 first.

## User Story 1 — Deploy to Production ([SCRUM-93](https://streetcarnola.atlassian.net/browse/SCRUM-93))

Prescribed by the Module 6 Sprint Planning assignment.

*As a team, I want our application live on the internet with a real database and an automatic deployment pipeline, so that our project actually works the way production software works — not just on our own machines.*

- **Given** the backend, **when** it is deployed, **then** it is live on Render at a public URL and reads and writes Supabase Postgres, not a local database.
- **Given** the frontend, **when** it is deployed, **then** it calls the live backend URL, not localhost.
- **Given** a passing push to `main`, **when** GitHub Actions finishes, **then** it has run the tests and then deployed automatically, and auth/authz, full CRUD, the pattern register, the refactoring log and 70%+ service coverage all still hold on the live app.

| Key | Task | Side | Assignee | Pts |
|---|---|---|---|---|
| [SCRUM-97](https://streetcarnola.atlassian.net/browse/SCRUM-97) | Containerize the backend for Render | backend | Michael | 3 |
| [SCRUM-98](https://streetcarnola.atlassian.net/browse/SCRUM-98) | Create the Render web service on Supabase | backend | Qixuan | 3 |
| [SCRUM-99](https://streetcarnola.atlassian.net/browse/SCRUM-99) | Read allowed CORS origins from configuration | backend | Qixuan | 2 |
| [SCRUM-100](https://streetcarnola.atlassian.net/browse/SCRUM-100) | Lock down the demo reset on the live app (done Nov 17, [#49](https://github.com/WeildTheSword/streetcar/pull/49)) | backend | Michael | 2 |
| [SCRUM-101](https://streetcarnola.atlassian.net/browse/SCRUM-101) | Deploy the frontend pointed at the live backend | frontend | Michael | 3 |
| [SCRUM-102](https://streetcarnola.atlassian.net/browse/SCRUM-102) | Show when the app is on fixture data or waking the server | frontend | Qixuan | 3 |
| [SCRUM-103](https://streetcarnola.atlassian.net/browse/SCRUM-103) | Deploy automatically from GitHub Actions after the tests pass | CI | Michael | 3 |
| [SCRUM-104](https://streetcarnola.atlassian.net/browse/SCRUM-104) | Verify the semester requirements on the live app and document the deployment | frontend + docs | Qixuan | 2 |
| [SCRUM-105](https://streetcarnola.atlassian.net/browse/SCRUM-105) | Update the class, package and sequence diagrams | docs | Michael | 3 |
| [SCRUM-120](https://streetcarnola.atlassian.net/browse/SCRUM-120) | Write the Sprint 5 retrospective and record the Sprint 6 plan in docs | docs | Michael | 1 |

**Why these tasks:** the backend binds `127.0.0.1` and ignores `$PORT`; `CorsConfig` allows only localhost; `api.js` silently falls back to fixtures and nothing displays `connection.live`; `/auth/reset` was `permitAll` and deleted sign-ups (fixed by SCRUM-100); `BrowserRouter` needs a host rewrite; the frontend tests live in a separate workflow that a `needs:` gate cannot see; the diagrams have not changed since Sep 20.

**Ordering:** SCRUM-97 → SCRUM-98 → SCRUM-103. SCRUM-99 before SCRUM-101 works live. SCRUM-104 last.

## User Story 2 — Playwright E2E Tests in CI, extra credit ([SCRUM-94](https://streetcarnola.atlassian.net/browse/SCRUM-94))

*As a team, we want end-to-end tests of real user flows running in CI on every push, so that a change that breaks sign-in or CRUD is caught before it deploys.*

- **Given** any push, **when** CI runs, **then** a Playwright job runs at least 6 end-to-end tests, each teammate's in a file under their name, and they pass.
- **Given** a failing E2E test on `main`, **when** CI finishes, **then** the deploy job does not run.

| Key | Task | Assignee | Pts |
|---|---|---|---|
| [SCRUM-107](https://streetcarnola.atlassian.net/browse/SCRUM-107) | Set up Playwright and a CI job that runs it against the full stack | Michael | 3 |
| [SCRUM-108](https://streetcarnola.atlassian.net/browse/SCRUM-108) | Playwright tests for the student flows | Michael | 3 |
| [SCRUM-109](https://streetcarnola.atlassian.net/browse/SCRUM-109) | Playwright tests for the advisor flows | Qixuan | 3 |

Tests run against the local stack inside CI, not the live site.

## User Story 3 — Mobile Deployment, extra credit ([SCRUM-95](https://streetcarnola.atlassian.net/browse/SCRUM-95))

*As a student, I want to use StreetCar from my phone, so that I can check my recommendations and submissions without a laptop.*

- **Given** Expo Go on a phone, **when** a student or advisor signs in, **then** the app gets a JWT from the live Render backend and shows that role's screens.
- **Given** a signed-in student, **when** they create a submission on the phone, **then** it is saved to Supabase and appears in the web app.

| Key | Task | Assignee | Pts |
|---|---|---|---|
| [SCRUM-110](https://streetcarnola.atlassian.net/browse/SCRUM-110) | Scaffold the Expo app with sign-in against the live backend | Qixuan | 5 |
| [SCRUM-111](https://streetcarnola.atlassian.net/browse/SCRUM-111) | Mobile student screens: recommendations and submissions | Michael | 5 |
| [SCRUM-112](https://streetcarnola.atlassian.net/browse/SCRUM-112) | Mobile advisor screen, sign-out on 401, and Expo Go demo instructions | Qixuan | 3 |

Built to the assignment's rubric ("Mobile app working via Expo Go, connected to the live backend"). The guide the assignment links, "Practical Guide — Turning Your Web App Into an Installable Mobile App (PWA)", describes a PWA instead; the team chose to follow the assignment.

## User Story 4 — Additional Feature Beyond MVP, extra credit ([SCRUM-96](https://streetcarnola.atlassian.net/browse/SCRUM-96))

Feature chosen Nov 17: advisors work from real student, alumni and appointment records.

*As an advisor, I want to look up any student and see real alumni, appointments and conversations from the database, so that the console reflects actual records instead of demo data.*

- **Given** an advisor signed in, **when** they open My Students, **then** every student account in the database is listed, and opening one shows that student's submissions, alumni conversations and appointments.
- **Given** the advisor console, **when** it loads, **then** today's schedule, the alumni radar and who the student is talking to come from the `appointments`, `alumni_profiles` and `conversations` tables.
- **Given** a student, advisor or alum signed in, **when** they open My Account, **then** they see their own account information, and students get 403 on every `/advisor` endpoint.

| Key | Task | Assignee | Pts |
|---|---|---|---|
| [SCRUM-113](https://streetcarnola.atlassian.net/browse/SCRUM-113) | Decide the additional feature and get instructor approval | Michael | 1 |
| [SCRUM-114](https://streetcarnola.atlassian.net/browse/SCRUM-114) | Backend: alumni, appointments and conversations tables with advisor and account endpoints | Michael | 5 |
| [SCRUM-115](https://streetcarnola.atlassian.net/browse/SCRUM-115) | Frontend: My Students, Appointments, Alumni Database and My Account pages, plus alumni sign-in | Michael | 5 |

All three were done Nov 17 in [#48](https://github.com/WeildTheSword/streetcar/pull/48). The feature was built the same day it was chosen, without the written instructor confirmation that the assignment asks for. Get that confirmation before the Dec 2 Sprint Review, or the extra credit may not count.

## User Story 5 — Google Sign-In via Supabase, extra credit ([SCRUM-106](https://streetcarnola.atlassian.net/browse/SCRUM-106))

*As a student or advisor, I want to sign in with my Google account alongside email and password, so that I can get into StreetCar without another password, with the same role rules either way.*

- **Given** the sign-in page, **when** a user chooses Google, **then** the browser really navigates to Supabase's authorize endpoint and returns to the app signed in.
- **Given** a token from either sign-in method, **when** it reaches Spring Boot, **then** it is checked by the one JWKS verification; there is no second verifier for Google.
- **Given** a Google sign-in, **when** the user calls a protected endpoint, **then** the role comes from the same Profile table and the same rules apply.

| Key | Task | Assignee | Pts |
|---|---|---|---|
| [SCRUM-116](https://streetcarnola.atlassian.net/browse/SCRUM-116) | Configure Google OAuth and Supabase Auth | Qixuan | 2 |
| [SCRUM-117](https://streetcarnola.atlassian.net/browse/SCRUM-117) | Verify every request against Supabase's JWKS, with roles in a Profile table | Michael | 8 |
| [SCRUM-119](https://streetcarnola.atlassian.net/browse/SCRUM-119) | Proxy email/password sign-up and sign-in to Supabase Auth | Qixuan | 5 |
| [SCRUM-118](https://streetcarnola.atlassian.net/browse/SCRUM-118) | Frontend Google sign-in, redirect handling, and role from /auth/me | Qixuan | 3 |

**Design for full rubric marks.** The rubric's top rating is "fully converged on the existing JWKS check", which assumes the course's "Practical Guide — Implementing Sign-Up, Sign-In & Roles" design. Sprint 5 instead stored BCrypt passwords and issued our own HS256 JWT. This story moves email/password onto that design: the backend proxies sign-up and sign-in to Supabase Auth (SCRUM-119), `spring-boot-starter-oauth2-resource-server` verifies every request against Supabase's JWKS, and roles live in a Profile keyed by the token's `sub` (SCRUM-117). Google then uses the same path with no verification code of its own.

**Order:** SCRUM-116 first (the JWKS URL must list a key), then SCRUM-117 and SCRUM-119 together, then SCRUM-118. Land this after Story 1 is live. It replaces Sprint 5's auth, so keep the full test suite and the Playwright advisor/student tests green through it. SCRUM-107's E2E job signs in through a separate Supabase dev project.

## Totals

- **Michael 45 points:** SCRUM-97, 100, 101, 103, 105, 107, 108, 111, 113, 114, 115, 117, 120 (13 already done: SCRUM-100, 113, 114, 115).
- **Qixuan 31 points:** SCRUM-98, 99, 102, 104, 109, 110, 112, 116, 118, 119.

SCRUM-100 and SCRUM-114 moved from Qixuan to Michael on Nov 17, when Michael built them for the Module 5 demo. SCRUM-120 (this plan and the Sprint 5 retro) adds 1 point. Michael's total includes it.

Each has backend and frontend work. 76 points over a sprint that includes Thanksgiving is heavy; Story 1 comes first.

**Board housekeeping done at planning:** Sprint 5 closed; Sprint 3, left in "future" with all 14 tickets Done, started and closed.

**Sprint 5 retro:** [`docs/sprint5-retro.md`](sprint5-retro.md) (SCRUM-120).
