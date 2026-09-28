# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Two things live side by side in one repo:

1. **A design system** (repo root) — the StreetCar brand: heritage New Orleans / playbill identity, CSS tokens, local TTF fonts, brand art, static HTML prototypes and a pitch deck. Documented in `README.md`, packaged as a Claude Code skill in `SKILL.md`.
2. **A working full-stack app** (`backend/` + `frontend/`) — a Spring Boot API and a React SPA. It implements the course-recommendation MVP from `docs/requirements.md` plus a pitch demo that deliberately goes past it.

**The React app does not use the heritage playbill brand, and that is on purpose.** It follows the `ui_kits/` product language instead — Tailwind v4 and shadcn/ui, with the mockups' own tokens (Inter, 10px radius, cream and brass) lifted into `frontend/src/index.css`. `colors_and_type.css` and the `.sc-*` utilities belong to the static pages at the repo root, not to the SPA. `DEMO.md` records the divergence; do not "fix" it by applying playbill styling to the app.

`DEMO.md` is the guide to running the pitch walkthrough, including the two demo accounts.

## Commands

### Backend (`backend/`, Java 17, Spring Boot 4.1.1, Maven wrapper)

```bash
cd backend
./mvnw spring-boot:run                                  # run API on :8080
./mvnw test                                             # all tests
./mvnw verify                                           # tests + JaCoCo coverage gate
./mvnw test -Dtest=SubmissionServiceTest                # one test class
./mvnw test -Dtest=BackendApplicationTests#contextLoads # one test method
./mvnw clean package                                    # build jar to target/
```

### Frontend (`frontend/`, React 19, Vite 8, oxlint)

```bash
cd frontend
npm install
npm run dev      # dev server on :5173
npm run lint     # oxlint
npm run build    # production build to dist/
npm run preview  # serve the built output
```

No frontend test runner is configured; `npm run lint` and `npm run build` are the only frontend gates.

### Both at once

VS Code `.vscode/launch.json` defines a **Full Stack** compound launch config that starts the Spring Boot app and `npm run dev` together. Otherwise run the two commands above in separate terminals.

### CI

`.github/workflows/ci.yml` runs on every push and pull request: a **backend** job (`./mvnw -B verify`, which includes the coverage gate, uploading the JaCoCo report as an artifact) and a **frontend** job (`npm ci`, `npm run lint`, `npm run build`).

### Static design-system pages

`index.html`, `demo.html`, `preview/*.html`, `slides/SampleSlides.html`, `ui_kits/*/*.html` are plain static files with no build step. Open them directly, or serve the repo root (`python3 -m http.server`) so the relative `fonts/` and `assets/` paths resolve.

## Architecture

### Frontend

`App.jsx` wraps everything in `AuthProvider` and `TransitionProvider` and routes with `react-router-dom`: `/sign-in`, `/welcome`, `/onboarding`, `/student`, `/advisor`, and `/profiles`. `RequireAuth` gates routes by role (`STUDENT` / `ADVISOR`); **`/profiles` sits outside it and is reachable without signing in**, which matches a backend that has no authentication on any endpoint.

All `fetch` calls stay in `services/`: `api.js` (auth, student, advisor), `courseService.js`, `submissionService.js`. `api.js` falls back to the generated fixtures in `src/data/fallback.js` when the backend is unreachable, so a dead API degrades the demo rather than ending it.

### Backend

Layering is `controller/` → `service/` → `model/`, with `config/` for cross-cutting Spring config. Endpoints: `/auth/login`, `/auth/signup`, `/auth/reset`, `/students/{id}`, `/students/{id}/fingerprint`, `/advisors/{id}/dashboard`, `/courses`, and full CRUD on `/submissions`.

**Two kinds of data live here, and they behave differently:**

- **Demo data is hardcoded.** `DemoDataService`, `CourseService`, `StudentService` and `AdvisorService` return literal objects. There is no persistence behind them.
- **Submissions are persisted.** `SubmissionService` uses `JdbcClient` against H2, created from `backend/src/main/resources/schema.sql` at startup. The default is a file database at `backend/data/streetcar` (gitignored); `backend/src/test/resources/application.properties` points tests at an in-memory one so the tests cannot collide with a running dev server or write into local demo data.

**Authentication is fake on purpose.** Passwords are plain text and the session token is a label. Nothing in `AuthService` should be reused as an auth system.

### Constraints worth knowing before you change things

- **Ports are hardcoded in several places that must stay in sync.** `api.js` and `courseService.js` hardcode `http://localhost:8080`; `submissionService.js` reads `VITE_API_URL` and falls back to the same; `config/CorsConfig.java` allows exactly `http://localhost:5173` and `http://localhost:5174`, for GET, POST, PUT and DELETE. There is no Vite proxy.
- **Env vars are opt-in and documented by example files**, `backend/.env.example` (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `SERVER_ADDRESS`) and `frontend/.env.example` (`VITE_API_URL`). Spring does not load `.env` files; export the variables yourself.
- **Coverage is gated.** JaCoCo requires 70% line coverage on `com.streetcar.backend.service`, checked in the `verify` phase. Adding service code without tests fails the build.
- **Model classes are immutable** — records or getter-only POJOs, serialized by Jackson.

### Design system

`colors_and_type.css` is the single source of truth for the static pages: `@font-face` declarations for the three local serif families, a `:root` token block (`--espresso`, `--cream`, `--brass`, `--burgundy`, `--mg-*` Mardi Gras accents, `--font-display/body/label`, `--ease-out`), and a small set of `.sc-*` utility classes. Its font URLs are relative to the repo root, so any consumer must either sit at the root or rewrite those paths.

Reference implementations, in increasing fidelity: `preview/` (one page per design-system facet), `slides/` (editorial slide templates + `deck-stage.js`), `ui_kits/navigator/NavigatorConsole.html` and `ui_kits/student/StudentPortal.html` (the high-fidelity screen mockups the React app follows).

**Brand rules are strict and enforced by review, not by tooling.** Read `README.md` before writing any user-facing markup **for the static pages**. The non-negotiables: three serifs and never sans (Playfair Display display / Cormorant Garamond italic voice / Cinzel small-caps labels); zero corner radius except pagination dots and the nav pill; no drop shadows or elevation; cream paper backgrounds with the radial gradient plus grain overlay, never solid white; 1px brass hairlines for every border; burgundy as the only UI accent; `cubic-bezier(0.16, 1, 0.3, 1)` for all easing; no emoji, no exclamation points, em-dashes not hyphens.

The prose conventions — no emoji, no exclamation points, em-dashes — apply to the React app's copy too, even though its visual language is the `ui_kits/` one.

## Product context

`docs/requirements.md` holds the personas (Alex, Sarah), user stories US-1..US-4, use cases UC-1/UC-2, an explicit MVP in/out-of-scope list, and the package and sequence diagrams. `docs/database-plan.md` covers the submissions schema, and `docs/class-diagram.png` the domain model.

Check the scope list before adding features — salary predictions, transcript integration, LinkedIn, mobile, and multi-university support are all deliberately out of scope for the graded MVP. The pitch demo shows some of them anyway; `DEMO.md` explains why that is not a licence to widen the MVP.

## Workflow conventions

Work is tracked as Jira SCRUM tickets. Branches are named `SCRUM-<n>-<kebab-summary>`, commits are `SCRUM-<n>: <Imperative summary>`, and each branch lands on `main` via a pull request. Follow this pattern for new work.

### Task lifecycle — the course checklist

This is a course project, and the instructor prescribes the lifecycle of every task. Sources: the Canvas pages **"Checklist — Working a Task: Backlog to Merge"**, **"Code Reviews"**, **"Practical Guide — Jira Setup"**, **"Practical Guide — GitHub Repository"** and **"Lecture — Scrum: Roles, Events & Artifacts"** in CMPS-3300-01Fa26 Software Studio. Follow it for every ticket, in this order.

**1. Jira — pick up the task**
- Open the active Sprint board, take an unassigned task from **To Do**, and assign it to yourself.
- Drag it to **In Progress** before starting work.

**2. Git — do the work**
- **Pull first**, so the branch starts from the latest `main`.
- **Branch**, named after the Jira key: `SCRUM-<n>-<kebab-summary>`.
- **Commit** with the key first: `SCRUM-<n>: <Imperative summary>`. Small, frequent commits beat one large one.
- **Push** the branch.

**3. GitHub — open and merge the PR**
- Open a PR into `main` with a short description of what changed and why, and **request a teammate as reviewer**.
- **At least one approving review is required**, enforced by branch protection, together with **required status checks**. The reviewer reads the **Files changed** tab and submits **Approve** or **Request changes** through **Start a review**, so queued comments post together. Reviews are specific and point at lines; approving without reading the diff defeats the requirement.
- If changes are requested, **fix on the same branch** — same Jira key in the commit message, push, and the PR updates itself. Never open a second PR for the same task.
- Resolve any conflicts.
- Merge only once **approved and status checks pass**, then **delete the branch** using GitHub's prompt.

**4. Jira — close the loop**
- Confirm the commits and PR show as linked on the ticket.
- Drag the ticket to **Done**.
- Pull the updated `main` before starting the next task.

A task is not done when the code works locally. It is done when it is merged to `main`, linked in Jira, and moved to Done.

**What this means for Claude specifically.** Do not approve a PR on the user's behalf when you wrote or amended commits on that branch — the approving review must come from a human who did not write the change, which is the entire point of the requirement. Prepare the work, push the branch, open the PR and report what needs review; leave the approval, and the Jira transitions, to the user or a teammate. Never merge before an approval and green checks exist, and delete the branch after merging.

### Jira conventions

- **The Jira link is mandatory and graded.** Every commit message starts with the task key (`SCRUM-<n>: <Imperative summary>`); that prefix is what links the commit to Jira. A key can be fixed by editing the message before pushing, never after. A task with no linked commits and PR **is not graded as complete**, however finished the code is.
- **Every task carries a title, a description, an assignee and a story-point estimate** before work starts. Points are Fibonacci (1, 2, 3, 5, 8, 13) and measure relative effort, not hours.
- **Each sprint user story is broken into at least three Jira tasks**, split so every teammate touches both backend and frontend work rather than one person owning all the Java and another all the React.
- **Ticket text follows the course's requirements format**: user stories as *As a [persona], I want to [action] so that [benefit]*, with 2–3 acceptance criteria written Given/When/Then.

### Definition of done

A task is done when the code is written, its **unit tests pass**, the PR is **reviewed and merged to `main`**, **CI is green**, the work is **linked in Jira**, and the ticket is moved to **Done**. Work that only runs locally is not done. Commented-out code, comment-only edits and deletions do not count as contribution for the graded task-completion standard.

### Sprint rhythm and deliverables

Sprints run about two weeks, one per course module. The instructor is the product owner and prescribes each sprint's user stories; the Scrum Master role rotates; the **Sprint Review is the TA demo**, not a separate event. Each sprint has four deliverables:

- **Sprint Planning** (team, Canvas text box) — the Jira task keys created for the sprint, each with title, description, assignee and estimate.
- **Task Completion** (individual, Canvas text box) — the tasks you personally finished, each with commit links visible in Jira, the PR link, and a one-to-two-sentence statement of its acceptance criteria. Graded against at least four qualifying tasks.
- **Sprint Review** (team, Canvas text box) — the completed task keys and links to the artifacts, plus a live TA demo of the working software.
- **Retrospective** — Start / Stop / Continue with at least one concrete action item, written up as `docs/sprint<n>-retro.md`.

**Code and documents go to GitHub, never to Canvas.** Canvas takes quiz answers and these text-box submissions only; attaching files or pasting code there is explicitly called out as wrong.

### Standing project requirements

These are graded across the whole semester, not per sprint: authentication and authorization with at least two roles enforced in both layers; full CRUD on a core resource through the API and the UI; a PostgreSQL database via JPA; **≥70% line coverage on service classes**; a CI pipeline running tests on every push; class, package and sequence diagrams kept **updated each module**; a refactoring log with at least five before/after entries and commit links; and a design-pattern register of at least three patterns documented in `README.md` with rationale.

Test conventions the course grades: every test is written **Arrange-Act-Assert**, backend service tests isolate the service (Mockito mocks where a dependency would otherwise be real), and frontend components get **Vitest** plus React Testing Library — one render test and one interaction test each, in a `*.test.jsx` file beside the component, run by an `npm test` script and by their own `.github/workflows/frontend.yml`. **This repo has none of the frontend half yet**: no Vitest, no `npm test`, and one workflow that only lints and builds the frontend.

Two knowing divergences from the course guides, both fine but worth not "correcting" by accident: the course toolchain guide specifies **Java 21** while this project targets **Java 17** in both `pom.xml` and CI, and the course expects **PostgreSQL via JPA** while submissions currently use **H2 via `JdbcClient`**.

`.claude/` is gitignored; this `CLAUDE.md` is not.
