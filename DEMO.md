# Streetcar — concept demo

**This is a pitch artifact, not the graded MVP.**

It is a clickable walkthrough of what Streetcar could become. It deliberately goes past the
scope in [`docs/requirements.md`](docs/requirements.md), which remains the source of truth for
what the course project is actually assessed against. Specifically, this demo shows career
prediction, an advisor persona, and alumni outcome data — all of which that document lists as
out of scope, and none of which should be read back into the MVP.

## The walkthrough

1. **Sign in** — a fake auth portal, two demo accounts.
2. **Fingerprint onboarding** — a student's first sign-in assembles their career fingerprint.
   Shown once; completing it is remembered server side.
3. **Student dashboard** — target role and match score, adjacent paths, courses ranked by fit
   to the goal rather than popularity, alumni conversations, the week's actions.
4. **Sign out**, then sign in as the advisor.
5. **Advisor console** — the same student seen from the other side: an auto-assembled pre-brief
   for the upcoming 11:30 appointment, what the student is worried about, who they are talking
   to, today's schedule, and an alumni radar.

## Running it

```bash
cd backend  && ./mvnw spring-boot:run    # :8080
cd frontend && npm install && npm run dev # :5173, or :5174 if 5173 is taken
```

VS Code's **Full Stack** compound launch config starts both together.

| Account | Email | Password |
|---|---|---|
| Student — Morgan A. Thibodaux | `morgan@tulane.edu` | `streetcar` |
| Advisor — Bill Hudlow | `bill.hudlow@tulane.edu` | `streetcar` |

The sign-in page has one-click buttons for both, so no typing during a demo. The account menu at
the bottom of the sidebar has **Restart demo**, which resets onboarding server side so the
fingerprint splash plays again on the next run-through.

## How it is built

The React app renders the two high-fidelity mockups in [`ui_kits/`](ui_kits/) — Tailwind v4 plus
shadcn/ui, with the mockups' own tokens (Inter, 10px radius, cream and brass) lifted into a theme
layer. Note this follows the `ui_kits/` product language, **not** the heritage playbill brand
documented in [`README.md`](README.md); that divergence is deliberate.

Spring Boot serves the demo data — `/auth/login`, `/students/{id}`, `/advisors/{id}/dashboard` —
alongside the original `/courses`. There is no database and no real authentication: passwords are
plain text and the session token is a label, both on purpose. Nothing here should be reused as an
auth system.

The frontend keeps a generated copy of the fixtures and falls back to them if the API is
unreachable, so a dead backend degrades the demo rather than ending it mid-pitch.
