# project-progress

A progress tracker for the whole class: of everything CMPS-3300 requires by the end of the
semester, what is done, what is late, and what is still on schedule.

## Using it

Pull `main` and type:

```
/project-progress
```

No install step. Claude Code finds skills in `.claude/skills/`. It reads `main`, the SCRUM board
and the open pull requests, and writes nothing.

## What you get back

One table, grouped:

- **Done**: the requirement is met on `main`.
- **Overdue**: due in an earlier module (or every module) and still missing.
- **Due now**: due in the current module.
- **On schedule**: due in a later module. Not a failure.

Each row shows where the requirement comes from (`[course]` mandatory, `[module]` deliverable,
`[ours]` our own and droppable), progress such as `1/5` refactoring log entries, and the open PR
that will close it, if there is one.

## How this differs from CI

CI (`.github/workflows/ci.yml`) checks that the code we have **works**, on every push. This checks
that the things the course **requires** exist at all: diagrams, refactoring log, pattern register,
database, login, deployment. CI can be green while this still shows gaps.

## Built is not turned in

This only reads the repo. It never looks at Canvas, so it cannot tell you whether an assignment was
**submitted** or what it **scored**.

| | `/project-progress` | Canvas |
|---|---|---|
| Answers | Is the work in the repo? | Did we turn it in, and what did it get? |
| Reads | Files on `main`, open PRs, the SCRUM board | Submissions and grades |

A requirement can show **Done** here and still be worth zero because nobody submitted it. That was
the case for Module 2: the CRUD, tests and CI were merged, while Task Completion and Sprint Review
were still missing in Canvas. Check Canvas for what is owed every module.

Grades never go in this repo. They stay in Canvas and in each person's own notes.

## The script

| Script | What it does |
|---|---|
| `scripts/repo-gaps.mjs` | Prints every course requirement as MET or GAP, with source, due module and progress. `/scrum-init` also runs it during sprint planning. |

Run it by hand from the repo root:

```
node .claude/skills/project-progress/scripts/repo-gaps.mjs
```

Run its tests:

```
node --test .claude/skills/project-progress/scripts/*.test.mjs
```

## Limits

The checks look for files and keywords. A MET means "probably there", not proof: coverage passes
when the 70% rule exists, not when it is reached, and auth passes as soon as Spring Security is
added.
