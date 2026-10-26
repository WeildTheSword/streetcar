# Refactoring Log

Before/after entries for each refactoring, with the commit that made it.

## 1. Split `DemoDataService` into fixtures and session state

**Principle:** Single Responsibility · **Jira:** SCRUM-59 (SCRUM-61 to SCRUM-64) · **Commit:** [`fec28c0`](https://github.com/WeildTheSword/streetcar/commit/fec28c0)

**Before.** `DemoDataService` held the hardcoded demo fixtures *and* the demo's mutable state (the onboarding flags and the identities that sign-ups wear). Every fixture method read the state maps, so the class had two reasons to change, and all four of its callers depended on both jobs. See [solid-audit.md](solid-audit.md) for why this one was picked.

```mermaid
classDiagram
    class DemoDataService {
        -onboarded: Map~String, Boolean~
        -identities: Map~String, String[]~
        +users() List~DemoUser~
        +morgan() Student
        +bill() Advisor
        +schedule() List~Appointment~
        +updates() List~FeedItem~
        +alumniRadar() List~AlumniRadarRow~
        +isOnboarded(studentId) boolean
        +completeOnboarding(studentId) void
        +setIdentity(profileId, name, initials) void
        +resetOnboarding() void
    }
    StudentService --> DemoDataService
    AdvisorService --> DemoDataService
    AuthService --> DemoDataService
    AuthController --> DemoDataService
```

**After.** `DemoFixtures` is stateless: each method is a pure function of the identity and onboarding flag passed in. `DemoSessionState` owns the two maps. The services read the state, then ask the fixtures for the matching record. `AuthController` only needs the state to reset the demo, so it no longer sees the fixtures at all. The `String[]` identity pair became an `Identity` record.

```mermaid
classDiagram
    class DemoFixtures {
        +MORGAN_ID: String
        +BILL_ID: String
        +MORGAN: Identity
        +BILL: Identity
        +users() List~DemoUser~
        +morgan(who, onboarded) Student
        +bill(who) Advisor
        +schedule(morgan) List~Appointment~
        +updates() List~FeedItem~
        +alumniRadar() List~AlumniRadarRow~
    }
    class DemoSessionState {
        -onboarded: Map~String, Boolean~
        -identities: Map~String, Identity~
        +isOnboarded(studentId) boolean
        +completeOnboarding(studentId) void
        +setIdentity(profileId, identity) void
        +identityOr(profileId, fallback) Identity
        +reset() void
    }
    class Identity {
        <<record>>
        +name: String
        +initials: String
    }
    StudentService --> DemoFixtures
    StudentService --> DemoSessionState
    AdvisorService --> DemoFixtures
    AdvisorService --> DemoSessionState
    AuthService --> DemoFixtures
    AuthService --> DemoSessionState
    AuthController --> DemoSessionState
    DemoSessionState ..> Identity
    DemoFixtures ..> Identity
```

**Result.** The API responses are unchanged. The fixtures and the state are now tested separately (`DemoFixturesTest`, `DemoSessionStateTest`), and a state test no longer builds the fixture set.

## 2. Move submission validation out of `SubmissionController`

**Principle:** Single Responsibility · **Jira:** SCRUM-68 · **Commit:** [`7bfd8d8`](https://github.com/WeildTheSword/streetcar/commit/7bfd8d8)

**Before.** `SubmissionController` mapped the `/submissions` routes and also decided what a valid submission is. The GPA range, its two-decimal limit and the 2000 / 120 / 200 character limits were private methods on the controller, and the error message repeated the same numbers by hand. The rules had no test of their own: the only way to exercise them was through an HTTP request.

```java
// SubmissionController
private void validate(Submission input) {
    if (input.gpa() == null || input.gpa().compareTo(BigDecimal.ZERO) < 0
            || input.gpa().compareTo(new BigDecimal("4")) > 0
            || input.gpa().stripTrailingZeros().scale() > 2
            || !validText(input.completedCourses(), 2000)
            || !validText(input.major(), 120) || !validText(input.careerGoal(), 200)) {
        throw new IllegalArgumentException();
    }
}
```

**After.** `SubmissionValidator` owns the rules, the limits as named constants, and the message built from those constants. The controller is injected with it and only maps requests and errors.

```java
// SubmissionController
public Submission create(@RequestBody Submission input) {
    validator.validate(input);
    return service.create(input);
}
```

**Result.** `POST` and `PUT /submissions` answer exactly as before, including the 400 message. The rules now have their own unit tests (`SubmissionValidatorTest`, eight cases including the GPA boundaries and trimmed lengths), and a limit lives in one place instead of two.

## 3. Move the demo reset out of `AuthController`

**Principle:** Single Responsibility · **Jira:** SCRUM-69 · **Commit:** [`3c542ed`](https://github.com/WeildTheSword/streetcar/commit/3c542ed)

**Before.** `POST /auth/reset` reset the demo inside the controller. `AuthController` depended on `DemoSessionState` only for this, so an HTTP class had to know every place demo state lives. Any new piece of demo state would have meant editing the controller.

```java
// AuthController
public ResponseEntity<Void> reset() {
    session.reset();
    authService.clearCreatedAccounts();
    return ResponseEntity.noContent().build();
}
```

**After.** `DemoResetService` owns "put the demo back to its opening state". The controller depends on `AuthService` and `DemoResetService` only, and `reset()` makes one call.

```java
// AuthController
public ResponseEntity<Void> reset() {
    demoReset.reset();
    return ResponseEntity.noContent().build();
}
```

**Result.** `/auth/reset` behaves as before: it was checked against the running API by signing up, onboarding, resetting, and confirming the created account is refused and onboarding is cleared. `DemoResetServiceTest` covers the reset directly with four cases, and `AuthController` no longer imports `DemoSessionState`.

## 4. Extract the shared submission form fields out of `SubmissionsPage`

**Principle:** Single Responsibility · **Jira:** SCRUM-70 · **Commit:** [`215e9b1`](https://github.com/WeildTheSword/streetcar/commit/215e9b1)

**Before.** `SubmissionsPage.jsx` rendered the four submission fields twice, once in the create form and once in the inline edit form. The labels, the 2000 / 120 / 200 `maxLength` limits, the "fill in every field" check and its message were all written out in both places. Changing one field meant editing two copies and keeping them in step by hand.

```jsx
// create form                                   // edit form
<label htmlFor="major">Major</label>             <label htmlFor={`major-${record.id}`}>Major</label>
<input id="major" name="major"                   <input id={`major-${record.id}`} name="major"
  maxLength={120} required />                      maxLength={120} defaultValue={record.major} required />
```

**After.** `components/SubmissionFields.jsx` renders the four fields once and takes an id suffix and default values. The blank-field check, its message, and reading a form into the API shape live in `lib/submissionForm.js`. The page uses both in each form.

```jsx
<SubmissionFields />                                            // create
<SubmissionFields idSuffix={record.id} values={record} />       // edit
```

**Result.** The rendered page is the same, and both existing `SubmissionsPage` test files pass unchanged. `SubmissionFields.test.jsx` adds a render test and an interaction test for the new component. The page drops from 147 to 135 lines, and the field markup now exists in one place.

## 5. Give `StudentService` and `AdvisorService` one shared way to build the current Morgan

**Smell:** [Duplicate Code](https://refactoring.guru/smells/duplicate-code), [Feature Envy](https://refactoring.guru/smells/feature-envy) · **Move:** Move Method · **Jira:** SCRUM-78 · **Commit:** [`1e4d0b0`](https://github.com/WeildTheSword/streetcar/commit/1e4d0b0)

**Before.** Both services rebuilt "Morgan as of right now" themselves: look up the identity a sign-up gave the profile, look up the onboarding flag, and pass both to the fixture. The logic was more interested in `DemoSessionState` than in either service, and any new piece of per-session state would have meant editing both copies in step.

```java
// StudentService.getStudent()
fixtures.morgan(session.identityOr(MORGAN_ID, MORGAN), session.isOnboarded(MORGAN_ID))
// AdvisorService.getDashboard()
Identity morgan = session.identityOr(MORGAN_ID, MORGAN);
fixtures.morgan(morgan, session.isOnboarded(MORGAN_ID))
```

**After.** `CurrentProfiles` is the one place where the session state is laid over the fixtures. Both services ask it for the profile they need, and `AdvisorService` no longer depends on `DemoSessionState` at all.

```java
// StudentService
return Optional.of(profiles.morgan());
// AdvisorService
List<Appointment> schedule = fixtures.schedule(profiles.morganIdentity());
new AdvisorDashboard(profiles.bill(), profiles.morgan(), schedule.get(0), ...)
```

**Result.** Neither service calls `identityOr` or `isOnboarded` itself. Two tests were added before the change and passed on the old code: one per service, covering a sign-up name and onboarding. They pass unchanged after it, and `CurrentProfilesTest` adds three cases. Against the running API, `/students/morgan-thibodaux` and `/advisors/bill-hudlow/dashboard` return byte-identical JSON before and after, both fresh and after onboarding plus a sign-up that renames Morgan. `./mvnw verify` passes.
