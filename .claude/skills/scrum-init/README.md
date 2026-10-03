# scrum-init

Sprint planning for this course project, from a blank page to a started sprint and a ready-to-paste Canvas submission.

## Using it 
Pull `main` and type:

```
/scrum-init
```

No install step — Claude Code finds skills in `.claude/skills/`, and this one is tracked in git.
You need the Atlassian tools connected for the Jira half; the rest works without them.

## Two modes

It asks which mode you want before it starts:

- **Auto-complete**: Claude runs the whole pipeline below and drafts the stories and tasks
  itself. It still waits for your approval before writing anything to Jira.
- **Manual oversight**: you drive. Claude explains what changed in the codebase and what the
  course still requires. Then it suggests user stories one at a time, each with its subtasks and
  a "would add to the sprint" summary, and you accept, edit, or drop each one. It shows a running
  sprint preview and writes to Jira or `docs/` only if you ask.

## What happens, stage by stage (auto-complete)

**0. Preflight.** Checks the board for a sprint left open past its end date and for tickets sitting
outside any sprint, and runs the `project-progress` skill's `repo-gaps.mjs` for the standing course requirements the repo
does not meet. Every gap is tagged with its source — `[course]` from the mandatory list in Session 1,
`[module]` from a module's own deliverables, `[ours]` from a ticket we raised ourselves — and with
the module that schedules it. **A gap due in a later module is on schedule, not a failure.**

**1. Brainstorming.** Opens a browser tab and asks you to drag in the Canvas module page for the
sprint you are planning. It will not guess which module is current, and it will not go hunting the
course site. Then it reads the page and the codebase:

- If the module **prescribes** user stories, as Module 2 did, they are the product owner's and get
  used verbatim.
- If it does not, the stories are ours to write, and it drafts candidates in
  `As a [persona], I want to [action] so that [benefit]` form with Given/When/Then criteria.

**It stops here until you approve the story list.**

**2. Decomposition.** At least three Jira tasks per story, each with title, description, acceptance
criteria, assignee and a Fibonacci estimate, split so both of us touch backend and frontend work.
Then it prints the table with per-person point totals.

**It stops again until you approve the table.**

**3. Board writes.** Closes the ended sprint, creates and starts the new one, creates the tickets
and moves them in. If any single write fails it stops rather than leaving the board half-written.

**4. Deliverables.** Writes the sprint plan to `docs/`, then prints the Canvas submission text.
**It never submits to Canvas** — that is yours to paste.

## The scripts

Deterministic checks live in scripts, not in prose, so they cannot be re-derived differently each run.

| Script | What it does |
|---|---|
| `scripts/submission.mjs` | Formats the Canvas Sprint Planning text from a plan JSON, and **warns against the rubric** — a story with fewer than three tasks, a task missing an assignee, estimate or description, or a plan where only one teammate holds work. |
| `../project-progress/scripts/repo-gaps.mjs` | Prints every standing requirement as MET or GAP, with source and due module. It lives in the `project-progress` skill, so you can check course progress any time with `/project-progress` without starting sprint planning. |

Run the tests for both skills with:

```
node --test .claude/skills/*/scripts/*.test.mjs
```

## What it will not do

- Approve a pull request. Branch protection requires a human who did not write the change.
- Submit anything to Canvas.
- Move your Jira tickets through the workflow for you after planning.
- Treat the gap list as the sprint backlog. The module overview and its Sprint Planning assignment
  decide scope; pulling a Module 5 requirement into a Module 3 sprint is scope creep.

## Validation

See `VALIDATION.md` for the with/without comparison, including what it does and does not prove.

## Related

The course process this follows is written up in `CLAUDE.md`, under "Workflow conventions".
