---
name: scrum-init
description: Use when starting a new sprint for the CMPS-3300 Software Studio project — "start the sprint", "sprint planning", "set up module 3", "what should our user stories be", "we need to plan sprint 4", "scrum init", or when a module's Sprint Planning deliverable is due. Asks for auto-complete mode (Claude drives) or manual-oversight mode (the user drives while Claude explains the codebase and suggests stories with their subtasks). Opens a browser tab for the user to slide in the current module page, reads it together with the codebase, brainstorms user stories with the user, decomposes them into estimated Jira tasks, writes them to the SCRUM board, and emits the Canvas submission text. Not for working a single ticket that already exists.
---

# Scrum Init — sprint planning, end to end

Runs one sprint's planning from a blank page to a started sprint and a ready-to-paste Canvas
submission. Four stages, each ending at a gate. **Nothing is written to Jira before Stage 3's
approval.**

## Mode select (ask first, before anything else)

Ask the user, once, which mode to run in (use `AskUserQuestion`):

- **Auto-complete** — Claude drives. Runs Stages 0–4 below end to end, drafting stories and
  tasks itself. Stages 1 and 2 still present their output, but the user may approve both in one
  reply. Board writes still wait for an explicit approval in the conversation.
- **Manual oversight** — the user drives. Claude is a planning assistant: it explains the state of
  the project and suggests stories and subtasks, but the user decides what goes in the sprint.
  Follow **Manual-oversight mode** below instead of Stages 1–4.

If the user already named a mode in their request, skip the question.

## Manual-oversight mode

Run Stage 0 (preflight) as normal, then:

1. **Explain the codebase.** In plain language, summarize what changed since the last sprint
   (recent merged PRs and commits), what the app can do now, and what the last sprint left
   unfinished. Cite files and ticket keys.
2. **Explain what is left for the course.** Walk through the Stage 0 gap list grouped by due
   module: overdue, due this module, and on schedule for later. Say which ones the current module
   page makes this sprint's job (ask for the module tab as in Stage 1, step 1, if it is not open).
3. **Suggest stories one at a time.** For each suggested story, show a block:
   - the story in `As a [persona], I want to [action] so that [benefit]` form, with 2–3
     Given/When/Then acceptance criteria and the gap it closes;
   - directly beneath it, the suggested subtasks (at least three), each with title, one-line
     description, suggested assignee and Fibonacci estimate;
   - a one-line **"Would add to the sprint:"** summary (the story plus N tasks, X points).

   After each block, let the user accept, edit, or drop it, or ask for another suggestion. Take
   their wording over yours whenever they rewrite something.
4. **Show the running sprint preview.** After each decision, show what the sprint would contain
   so far: accepted stories, their tasks, and point totals per person. Check it against the rubric
   in the Stage 2 bullets and point out gaps, but do not fix them unless asked.
5. **Hand over.** When the user says the list is done, show the final preview. Write to Jira
   (Stage 3) or write `docs/sprint-<n>-plan.md` (Stage 4) **only if the user asks for it**.
   Otherwise the preview is the output, and the user enters it themselves.

In this mode Claude never writes to Jira, `docs/`, or code on its own initiative.

The course rules this follows live in `CLAUDE.md` under "Workflow conventions" — read that
section first; do not restate or re-derive it here.

## Stage 0 — Preflight (no questions yet)

Run both, in parallel:

1. `node .claude/skills/project-progress/scripts/repo-gaps.mjs` — reports which standing course
   requirements the repo does not yet meet, each tagged with its source and the module that
   schedules it. The script belongs to the `project-progress` skill; run it from there.

   **This list never decides sprint scope.** The mandatory requirements are delivered across the
   semester; a gap marked `due:M5` is on schedule, not a failure, and pulling it forward is scope
   creep. The module overview and its Sprint Planning assignment decide what a sprint contains.
   Use the list for two things only: spotting a gap the *current* module is responsible for, and
   naming leftovers from the previous module that are genuinely overdue.
2. Board state, via the Atlassian tools on site `streetcarnola.atlassian.net`, project `SCRUM`,
   board `1`:
   - `listJiraBoardSprints` with `state: "all"` — is a sprint still active past its end date?
   - JQL `project = SCRUM AND status != Done` — what is genuinely unfinished?
   - JQL `project = SCRUM AND sprint IS EMPTY AND status != Done` — work orphaned outside a sprint.

Report anything broken here **before** brainstorming. A board with an unclosed sprint or
orphaned tickets will otherwise silently corrupt the plan you are about to make.

## Stage 1 — Brainstorming (the mode this skill opens in)

1. Open a tab with `tabs_context_mcp {createIfEmpty: true}` and ask the user to **slide in the
   Canvas module page for the sprint being planned**. Wait for them. Do not guess the URL and do
   not go hunting through the course site first — the user knows which module is current.
2. Read that page and its Sprint Planning assignment, including the rubric.
   - **If the module prescribes user stories** (Module 2 did), they are the product owner's, and
     the team's job is decomposition, not invention. Use them verbatim.
   - **If it does not**, the stories are the team's to write. Continue to step 3.
3. Read the codebase before proposing anything: what the last sprint left unfinished, what the
   module's theme implies for *this* project specifically, and the Stage 0 gap list.
4. Draft candidate user stories — as `As a [persona], I want to [action] so that [benefit]`, each
   with 2–3 Given/When/Then acceptance criteria. Favor stories that satisfy the module's theme
   **and** close a real gap; say which gap each one closes.
5. Present them **once, in one message**, with a one-line rationale each. Ask for cuts and
   reshapes in a single round.

**Gate: the user approves the story list.** Iterate here as long as they want — this stage is
cheap and the next ones are not.

## Stage 2 — Decomposition

For each approved story, write tasks that satisfy the Sprint Planning rubric:

- **At least three tasks per story** — the rubric scores 6/6 only at three.
- Every task carries title, description, assignee, and a Fibonacci estimate (1, 2, 3, 5, 8, 13).
- **Split so each teammate touches both backend and frontend.** The assignment calls out
  one-person-does-all-the-Java as wrong.
- Descriptions state acceptance criteria, because Task Completion is graded on the ticket
  carrying them.

Present the full table — key placeholder, title, assignee, points, story — plus per-person point
totals, in one message.

**Gate: the user approves the task table and the assignee split.**

## Stage 3 — Write it to the board

Only after that approval, and in this order:

1. Close the ended sprint if Stage 0 found one (`manageJiraSprint`, `close`).
2. Create the new sprint, named for the module, with real start and end dates.
3. Create each task (`createJiraIssue`) with description, estimate, assignee, and a `sprint-<n>`
   label.
4. Move them into the sprint and start it.

Report every key created. If any single write fails, **stop and report** — do not continue and
leave the board half-written.

## Stage 4 — Deliverables

1. Write `docs/sprint-<n>-plan.md`: the stories, their acceptance criteria, and the task table.
   This is the team's record and the input to `scrum-close` later. Write the same plan as
   `docs/sprint-<n>-plan.json` too, in the shape documented at the top of `scripts/submission.mjs`
   — the next step reads it.
2. Print the Canvas submission text with
   `node .claude/skills/scrum-init/scripts/submission.mjs docs/sprint-<n>-plan.json`.
3. Hand it to the user to paste. **Never claim it was submitted** — Canvas submission is theirs.

## Rules

| Temptation | What to do instead |
|---|---|
| Inventing user stories before reading the module page | Ask for the page. The module decides whether stories are given or written. |
| Turning the gap list into the sprint backlog | Semester-long requirements land in the module that schedules them. Pulling `due:M5` work into M3 is scope creep dressed as diligence. |
| Writing tickets to Jira to "save a round trip" | Both gates exist because the board is shared with a teammate mid-flight. |
| Skipping the third task on a small story | The rubric scores coverage at three tasks per story, not at "enough". |
| Assigning all backend to one person because it is faster | The assignment explicitly grades against that split. |
| Estimating in hours | Story points are relative effort — Fibonacci only. |
| Saying the sprint is planned once Jira is written | It is planned when the Canvas text is in the user's hands. |

## Red flags — stop

- Started work without asking for a mode (and the user did not name one) → stop, ask.
- In manual-oversight mode, about to write a ticket or file the user did not ask for → stop.
- About to propose stories without having read the module page → stop, ask for the tab.
- A task with no assignee, no estimate, or no acceptance criteria → it loses a rubric point; fix
  it before the gate.
- Stage 0 found an unclosed sprint and you are already brainstorming → report it first.
- About to write to Jira without an explicit approval in the conversation → stop.
