#!/usr/bin/env node

// DESCRIPTION: CMPS3300 Class Sprint Plan Formatter
  // This script takes our sprint plan (user stories, their tasks, who owns each task, the
  // story points and a description) and turns it into the text that we can use to give us the 
  // basic bones for each of the canvas submissions... This just allows us to save time instead
  // of having to copy and paste each of the stories and tasks into the canvas submission form.
  
  // Before it writes anything, it grades the plan against the Sprint Planning rubric, so we
  // find lost points before the TA does:
  //   - every user story has at least 3 tasks
  //   - every task has an assignee, a story point estimate and a description
  //   - every teammate has at least one task
  // Any miss prints as a RUBRIC WARNING and the script exits with an error, so the skill
  // stops and we fix the plan instead of submitting it.
  //
  // It also totals the story points per person. The formatting and the math are done in code,
  // not by Claude, so the same plan always produces the same submission.
  //
  // Usage: node submission.mjs plan.json
  //
  // Plan shape:
// { "sprint": "Module 3", "team": ["Michael Weild", "Qixuan Liu"],
//   "stories": [{ "title": "...", "tasks": [
//      { "key": "SCRUM-48", "title": "...", "assignee": "...", "points": 3, "description": "..." }]}]}

// Attribution: Michael Weild & Claude
// SCRUM (NA): Decrease sprint write-up time. Fun use of skills.
// Date: 9/20/2026

import { readFileSync, realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";

export function formatSubmission(plan) {
  const lines = [`${plan.sprint} Sprint Planning — Jira tasks`];
  if (plan.team?.length) lines.push(`Team: ${plan.team.join(", ")}`);

  const totals = new Map();
  for (const story of plan.stories ?? []) {
    lines.push("", story.title);
    for (const t of story.tasks ?? []) {
      lines.push(
        "",
        `${t.key} — ${t.title}`,
        `- Assigned to: ${t.assignee}`,
        `- Story points: ${t.points}`,
        `- Description: ${t.description}`,
      );
      totals.set(t.assignee, (totals.get(t.assignee) ?? 0) + t.points);
    }
  }

  const totalLine = [...totals].map(([who, pts]) => `${who} ${pts} points`).join(", ");
  lines.push("", `Totals: ${totalLine}`);
  return lines.join("\n");
}




// The Sprint Planning rubric: 6 pts only when EVERY story has >= 3 tasks; 4 pts only when every
// task has an assignee, a description and an estimate.
export function rubricWarnings(plan) {
  const warnings = [];
  for (const story of plan.stories ?? []) {
    const tasks = story.tasks ?? [];
    if (tasks.length < 3) {
      warnings.push(`"${story.title}" has ${tasks.length} task(s); the rubric wants at least 3.`);
    }
    for (const t of tasks) {
      const missing = ["assignee", "points", "description"].filter((f) => !t[f] && t[f] !== 0);
      if (missing.length) warnings.push(`${t.key ?? t.title} is missing: ${missing.join(", ")}.`);
    }
  }
  const assignees = new Set(
    (plan.stories ?? []).flatMap((s) => (s.tasks ?? []).map((t) => t.assignee)),
  );
  if (plan.team && assignees.size < plan.team.length) {
    warnings.push("Not every teammate has a task; the assignment grades the split.");
  }
  return warnings;
}

// pathToFileURL, not a hand-built "file://" string: that never matches on Windows, or in a
// path with spaces or non-ASCII characters, and the script would silently print nothing.
// realpathSync because Node resolves symlinks in import.meta.url but not in argv[1]: on a Mac,
// /var and /tmp are links into /private, so a script run from there would also print nothing.
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const plan = JSON.parse(readFileSync(process.argv[2], "utf8"));
  const warnings = rubricWarnings(plan);
  if (warnings.length) {
    console.error("RUBRIC WARNINGS — fix before submitting:");
    for (const w of warnings) console.error(`  ! ${w}`);
    console.error("");
  }
  console.log(formatSubmission(plan));
  process.exitCode = warnings.length ? 1 : 0;
}
