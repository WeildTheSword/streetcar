# SOLID Audit — Backend Services

An audit of `backend/src/main/java/com/streetcar/backend/service/` for SOLID violations, to pick one to fix in sprint 3 (SCRUM-59).

## Findings

| # | Class | Principle | Violation |
|---|---|---|---|
| 1 | `DemoDataService` | **S**ingle Responsibility | It does two jobs. It is a catalogue of hardcoded fixtures (Morgan's profile, Bill's schedule, the alumni radar), and it also holds the demo's mutable state (who has onboarded, which identity a sign-up wears). Those change for different reasons: fixtures change when the pitch content changes, state changes when the demo flow changes. Because both live in one class, every fixture method has to read the state maps (`nameFor`, `isOnboarded`), and a test of the onboarding flag has to build the whole fixture set. |
| 2 | `CourseService` | **D**ependency Inversion | The course catalogue is hardcoded inside the service. There is nothing to depend on but the concrete list, so the service can't be tested against other data, and moving courses to the database means rewriting the service. |
| 3 | `AuthService` | Single Responsibility | Holds the created-accounts store as well as the sign-in and sign-up rules. Smaller than #1: the store is one map and only `AuthService` uses it. |
| 4 | `AuthController.reset()` | Single Responsibility | The controller resets two services itself, so it knows how demo state is spread across the backend. |
| 5 | `SubmissionService` | Dependency Inversion | Calls `JdbcClient` directly instead of going through a repository. Acceptable for now: the tests already swap in an H2 database. |
| 6 | `SubmissionController` | Single Responsibility | The controller maps HTTP requests *and* owns the rules for a valid submission (GPA range and precision, text length limits). Routes and product rules change for different reasons, and the rules could only be tested through the web layer. **Fixed in SCRUM-68**, see [refactoring-log.md](refactoring-log.md). |

| 7 | `SubmissionsPage.jsx` (frontend) | Single Responsibility | The page loads data, runs the create form, runs the inline edit form and handles deletion, *and* renders the four submission fields twice, with the labels, limits and the blank-field check copied in both places. **Fixed in SCRUM-70**, see [refactoring-log.md](refactoring-log.md). |

## Decision

**Fix #1: split `DemoDataService`.** It has the widest reach: `StudentService`, `AdvisorService`, `AuthService` and `AuthController` all depend on it, so every one of them was coupled to both the fixtures and the state. Splitting it into a stateless `DemoFixtures` and a `DemoSessionState` gives each class one reason to change.

#2 is handled separately by SCRUM-60, which puts courses behind a `CourseRepository` (the Repository pattern). #3 to #5 are left for later sprints.
