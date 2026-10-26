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

## 5. Extract one helper per list out of `DemoFixtures.morgan()`

**Smell:** [Long Method](https://refactoring.guru/smells/long-method) · **Move:** Extract Method · **Jira:** SCRUM-74 · **Commit:** [`9df6c17`](https://github.com/WeildTheSword/streetcar/commit/9df6c17)

**Before.** `morgan()` was 106 lines: one `new Student(...)` call that built eight unrelated lists inline, from career matches to weekly actions. Reading what a student is made of meant scrolling past every transcript row and alumni message, and the only way to tell where one list ended and the next began was to count parentheses.

```java
public Student morgan(Identity who, boolean onboarded) {
    return new Student(
        MORGAN_ID, who.name(), who.initials(), /* ...scalar fields... */ onboarded,
        List.of(
            new CareerMatch("Private Equity Analyst", 79),
            // ...3 more
        ),
        List.of(
            new Concern("The technical screen", /* ... */),
            // ...3 more
        ),
        // ...six more inline lists, 80 more lines
    );
}
```

**After.** Each list is a private method named for what it holds, and `morgan()` reads as a table of contents.

```java
public Student morgan(Identity who, boolean onboarded) {
    return new Student(
        MORGAN_ID, who.name(), who.initials(), /* ...scalar fields... */ onboarded,
        careerMatches(),
        concerns(),
        firms(),
        strategies(),
        transcript(),
        recommendedCourses(),
        alumniConversations(),
        weeklyActions()
    );
}

private static List<CareerMatch> careerMatches() {
    return List.of(
        new CareerMatch("Private Equity Analyst", 79),
        // ...
    );
}
```

**Result.** `morgan()` drops from 106 lines to 24 and fits on one screen. The list contents were moved, not retyped, and the JSON from `GET /students/morgan-thibodaux`, `/advisors/bill-hudlow/dashboard` and both `/auth/login` accounts is byte-identical before and after. `./mvnw verify` passes all 51 tests with the service coverage gate met.
