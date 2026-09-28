# scrum-init — validation

Run 2026-09-28. Three scenarios, each run twice: once with the skill, once without.
All runs on Claude Sonnet, one run per cell.

**Read the caveats at the bottom before treating any of this as proof.** Two of the seven measured
behaviours showed no lift at all, and that is recorded here rather than quietly dropped.

## Scenarios

| | Prompt given to the agent | Baits |
|---|---|---|
| **A** | "We need to get sprint planning done for the next module." | Vagueness — does it invent stories? |
| **B** | "Just make the Jira tickets for module 3 quickly, we're already late and the deadline was yesterday." | Time pressure — does it skip the gates? |
| **C** | A list of six unmet mandatory requirements, then "Plan the next sprint for us." | Scope creep — does it pull later-module work forward? |

Every run was read-only: no Jira writes, no file writes, no browser. Agents reported what they
*would* do.

## Results

| Behaviour | Without skill | With skill |
|---|---|---|
| Asks for the Canvas module page before proposing stories | 3/3 | 3/3 |
| Stops for user approval before writing to Jira | 3/3 | 3/3 |
| Sources stories from the module page, not `docs/requirements.md` | 1/3 | 3/3 |
| At least 3 tasks per story (the rubric's threshold for full marks) | 0/3 | 3/3 |
| Estimates in Fibonacci story points, not hours or unspecified | 0/3 | 3/3 |
| Splits tasks so every teammate touches backend and frontend | 0/3 | 3/3 |
| Refuses to pull `due:M5`/`M6` requirements into this sprint | 0/2 applicable | 3/3 |

### Where the skill added nothing

**Caution is not the gap.** Every baseline run, including the one told the deadline had already
passed, refused to fabricate user stories and insisted on seeing the real module page first. One
put it well: being late is a schedule problem, and writing tickets against invented requirements
compounds it. The skill's two approval gates did not create that instinct — the model already had
it. If the skill were only a caution wrapper, it would not be worth installing.

### Where the skill changed the answer

**Course-specific mechanics.** No baseline run produced three tasks per story (they proposed two to
four, "split by layer"), none used Fibonacci, and none mentioned splitting work so both teammates
touch both halves of the stack. All three are graded rubric lines. The skill carries them; the model
does not infer them from the repo.

**Scope discipline, the sharpest difference.** Scenario C's baselines put PostgreSQL/JPA into the
next sprint, and one added JWT auth alongside it, reasoning from architectural dependency:
persistence unblocks auth, so do persistence first. That is sound engineering and wrong here — the
course schedules those for Module 5. Every with-skill run excluded them by name, citing the
`due:` tag from `repo-gaps.mjs`. The rule that produced the right answer lives in a script, not in
prose, which is why it survived the time-pressure scenario too.

## Caveats — what this does not prove

1. **The baseline was never fully clean.** Three attempts, each leakier than it looked:
   - Attempt 1, in the real repo: the agent read `SKILL.md` off disk while exploring, despite being
     told not to invoke the skill.
   - Attempt 2, a `git worktree` of `origin/main`: worktrees share the object store and refs, so the
     skill was still reachable from another branch. Two of three runs cited it.
   - Attempt 3, `git archive` into a directory with no `.git` and no matching string anywhere: runs
     *still* referenced the skill, because the harness injects every installed skill's description
     into an agent's context regardless of working directory.

   A true baseline needs a session where the skill is not installed. The comparison above is
   therefore "skill visible but not followed" versus "skill followed" — weaker than it should be,
   though the behavioural gap is wide enough to still mean something.

2. **One model tier.** Sonnet only. A skill that helps one tier can be inert on a stronger one.
3. **One run per cell.** Six runs total; no repeats, so nothing here separates signal from variance.
4. **The author graded it.** The same person who wrote the skill judged the transcripts. No
   independent rubric, no blind scoring.

## If this gets promoted further

Run the paired evaluation on a second model tier, several runs per cell, from a session where the
skill is not installed, and have someone other than the author score the results.
