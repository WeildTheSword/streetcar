# Sprint 5 retrospective — Module 5, Real Database and Sign-In

**Sprint:** Sprint 5, Nov 2 to Nov 16, 2026 · **Team:** Michael Weild, Qixuan Liu · **Sprint Review (TA demo):** Nov 17 with Christian, temporary score 22/25

## What happened

Both user stories shipped. SCRUM-83 (Supabase + JPA) landed through SCRUM-85, 86, 87 and 88; SCRUM-84 (sign-in and roles) landed through SCRUM-89, 90, 91 and 92. Eight PRs ([#40](https://github.com/WeildTheSword/streetcar/pull/40)–[#47](https://github.com/WeildTheSword/streetcar/pull/47)) merged, CI stayed green, and service coverage stayed over 70%.

At the demo the app ran against Supabase: data survived a backend restart, sign-up and sign-in went through the backend only, a missing token got 401, a student got 403 on delete and an advisor got 204. The demo lost 3 of 6 points on **"Entities and repositories correctly modeled with JPA relationships"**, because the only relationship was `Submission` → `User`. The tables added the same day in [#48](https://github.com/WeildTheSword/streetcar/pull/48) (student and alumni profiles, appointments, conversations, all keyed to `users`) are the fix, and they are linked from the Canvas submission.

Preparing the demo also showed that **Restart demo deleted every account created by sign-up**, so a student made during the demo vanished from the advisor's list. [#49](https://github.com/WeildTheSword/streetcar/pull/49) (SCRUM-100) stopped that and made the reset require a signed-in user.

## Start

- **Check the Sprint Review rubric against `main`, line by line, two days before the TA demo.** The relationships gap was visible in the rubric from the start of the sprint. It was found on demo day.
- **Order dependent tickets on the board.** SCRUM-88 needed SCRUM-89's `User` entity, so Qixuan had to add a placeholder `User` (`04122cb`) and later replace it (`f7126a5`). Land the ticket that owns a shared entity first, or agree on the entity's shape before both branches start.
- **Run the demo script against the real database before the demo**, not just the test suite. Deleting sign-ups on reset was deliberate pitch-demo behavior and had its own passing test. It only became a bug once advisors needed to see every student, and only a run on Supabase showed that.

## Stop

- **Leaving PRs open for days.** Qixuan's four PRs were opened Nov 4 and merged Nov 13. Michael's four landed in between, and SCRUM-87 and SCRUM-91 each needed a "merge main and resolve conflicts" commit.
- **Merging without a review.** All ten PRs from #40 to #49 merged with no approving review. Prof. Shirvani allowed this when a reviewer is busy, but the course grades reviews, and this sprint the exception became the rule.

## Continue

- One branch, one PR, one Jira key per task, with the key first in every commit. Every Sprint 5 task shows its commits and PR in Jira.
- Arrange-Act-Assert tests with Mockito for services and MockMvc for the API, and the JaCoCo gate in CI.
- H2 for tests and CI, so CI needs no Supabase credentials, with Supabase as the real database.

## Action items

| # | Action | Owner | Due |
|---|---|---|---|
| 1 | Walk the Module 6 Sprint Review rubric against `main` and the live app, and record each line as met or not met in the PR for SCRUM-104 | Qixuan | Nov 30 |
| 2 | Review each other's PRs within one day of opening. Merge without approval only when the other person has said they can't review, and say so in the PR | Michael and Qixuan | every PR from Nov 18 |
| 3 | Land SCRUM-97 (containerize) before starting SCRUM-98 and SCRUM-103, which depend on it, as the Sprint 6 plan orders | Michael | Nov 21 |
