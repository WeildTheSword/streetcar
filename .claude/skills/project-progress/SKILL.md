---
name: project-progress
description: Use when checking where the CMPS-3300 Software Studio project stands against the whole course — "project progress", "course progress", "where are we for the class", "what's left for the course", "are we on track", "what do we still need to build", or before a TA meeting or progress review. Runs the course requirement tracker against main, groups every requirement as done, overdue, due now, or on schedule for later, and says which open pull request will close each gap. Read-only. Reads the repo only, never Canvas: not for submission status or grades, not for planning a sprint (use scrum-init), and not for checking whether the code works (that is CI).
---

# Project Progress — where we stand for the whole class

Answers one question: of everything the course requires by the end of the semester, what is done,
what is late, and what is still on schedule. **Read-only** — it never writes to Jira, `docs/`, or
code.

## Steps

0. **Show the warning first.** Before running anything, print this line exactly, on its own:

   > **WARNING: This checks `main`, not your current branch. Read-only; it never writes to Jira or files.**

1. **Check `main`, not the current branch.** A feature branch shows work that has not merged yet.
   Fetch, check `origin/main` out into a temporary worktree in the scratchpad, run the tracker on
   it, then remove the worktree:

   ```bash
   git fetch -q origin
   git worktree add -q --detach <scratchpad>/progress-main origin/main
   node .claude/skills/project-progress/scripts/repo-gaps.mjs <scratchpad>/progress-main
   git worktree remove --force <scratchpad>/progress-main
   ```

   If the user asks about their branch instead, still show the warning, then say plainly that
   this run checks their branch, not `main`, and run it with no folder argument.

2. **Find the current module.** Use the module the user names. Otherwise take it from the newest
   sprint on the SCRUM board (site `streetcarnola.atlassian.net`, sprint names carry the module),
   and say that is where it came from. If neither settles it, ask.

3. **Match gaps to open pull requests.** `gh pr list --state open` — for each gap, say whether an
   open PR closes it (PR #18, for example, closed the three M2 frontend-test gaps). A gap with an
   open PR is waiting on review, not unstarted.

4. **Report it in one table, grouped:**

   | Group | Meaning |
   |---|---|
   | **Done** | MET on `main` |
   | **Overdue** | due in an earlier module, or `ongoing`, and still a GAP |
   | **Due now** | due in the current module |
   | **On schedule** | due in a later module — not a failure |

   Each row: requirement, due module, the `(n/m)` progress where the tracker gives one, and the
   open PR if there is one. Keep `[course]`, `[module]`, `[ours]` sources visible; an `[ours]` gap
   costs no points.

## Rules

- **Built is not submitted.** This reads the repo only: code, config, tests, CI workflows, `docs/`
  and the README on `main`. It never reads Canvas, submissions or grades. A requirement can be MET
  here and still score zero because nobody turned it in (Module 2 Task Completion and Sprint Review
  were both MISSING in Canvas on 2026-10-02 while their work was merged). When reporting, say so,
  and point the user at Canvas for what is still owed.
- **Never put grades in the repo.** Submission and grade status lives in Canvas and in Michael's
  personal status page outside the repo. Do not add scores, grades or submission status to any
  tracked file, including this skill's output written to `docs/`.
- **MET means "probably there", not proof.** The checks look for files and keywords. Coverage
  passes when the 70% rule exists, not when it is reached; auth passes when Spring Security is
  added. Say so whenever a MET is the reason for a decision.
- **Later-module gaps are on schedule.** Never present a `due:M5` gap as a problem in Module 3.
- **Report, do not plan.** Turning gaps into stories and tasks is `/scrum-init`'s job.
- If a check is clearly wrong (MET when the work is missing, or the reverse), say so and point at
  the check in `scripts/repo-gaps.mjs`. Fix it test-first in `scripts/repo-gaps.test.mjs` only if
  the user asks.
