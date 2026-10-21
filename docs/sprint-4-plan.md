# Sprint 4 plan — Module 4, Refactoring

**Sprint:** Sprint 4 - Refactoring, Oct 21 to Nov 3, 2026 · **Goal:** fix real code smells with named refactoring moves, each logged in `docs/refactoring-log.md` with tests green.

## User Story 1 — Refactor Toward Clean Code ([SCRUM-73](https://streetcarnola.atlassian.net/browse/SCRUM-73))

Prescribed by the Module 4 Sprint Planning assignment.

*As a developer, I want to identify and fix real code smells in our own project so that our codebase stays easy to understand, test, and extend as we keep building on it.*

- **Given** our project code, **when** we audit it, **then** at least 3 distinct code smells are found and each is fixed with the appropriate refactoring mechanic (Extract Method, Move Method, Replace Conditional, or an equivalent).
- **Given** each fix, **when** it is merged, **then** `docs/refactoring-log.md` has an entry with before code, after code, and a commit link (at least 3 entries).
- **Given** any single refactor, **when** it is committed, **then** the full test suite is green, with no regressions.

## Tasks

| Key | Task | Smell → move | Side | Assignee | Pts |
|---|---|---|---|---|---|
| [SCRUM-74](https://streetcarnola.atlassian.net/browse/SCRUM-74) | Break up `DemoFixtures.morgan()` | Long Method → Extract Method | backend | Qixuan | 3 |
| [SCRUM-75](https://streetcarnola.atlassian.net/browse/SCRUM-75) | `LoginPage` mode/role copy table | Repeated conditional → Replace Conditional | frontend | Qixuan | 3 |
| [SCRUM-76](https://streetcarnola.atlassian.net/browse/SCRUM-76) | Split `AdvisorDashboard` | God component → Extract Component | frontend | Qixuan | 5 |
| [SCRUM-77](https://streetcarnola.atlassian.net/browse/SCRUM-77) | Pass `Identity` instead of name + initials | Data Clumps → Introduce Parameter Object | backend | Qixuan | 3 |
| [SCRUM-78](https://streetcarnola.atlassian.net/browse/SCRUM-78) | Shared `currentMorgan()` for the two services | Feature Envy → Move Method | backend | Michael | 2 |
| [SCRUM-79](https://streetcarnola.atlassian.net/browse/SCRUM-79) | Split `StudentDashboard` | God component → Extract Component | frontend | Michael | 5 |
| [SCRUM-80](https://streetcarnola.atlassian.net/browse/SCRUM-80) | `useTranscriptReveal` hook for `OnboardingPage` | Long Method → Extract Method | frontend | Michael | 3 |
| [SCRUM-81](https://streetcarnola.atlassian.net/browse/SCRUM-81) | Trimming and not-found duplication in `SubmissionService` | Duplicated code / Feature Envy → Move + Extract Method | backend | Michael | 2 |

**Totals:** Qixuan 14 points, Michael 12 points. Each has two backend and two frontend tasks.

**Ordering:** SCRUM-74 before SCRUM-77 (both edit `DemoFixtures`). Frontend tasks write the component test first, watch it pass on the old code, then refactor.

**Carried over from Sprint 3** (open PRs #25 to #29): SCRUM-68 to SCRUM-72.
