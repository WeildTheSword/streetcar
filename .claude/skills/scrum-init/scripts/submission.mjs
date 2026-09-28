#!/usr/bin/env node
// Formats the Canvas Sprint Planning submission from a sprint plan JSON.
// Deterministic formatting + rubric arithmetic, so the skill never eyeballs either.
//
// Plan shape:
// { "sprint": "Module 3", "team": ["Michael Weild", "Qixuan Liu"],
//   "stories": [{ "title": "...", "tasks": [
//      { "key": "SCRUM-48", "title": "...", "assignee": "...", "points": 3, "description": "..." }]}]}

import { readFileSync } from "node:fs";

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

if (import.meta.url === `file://${process.argv[1]}`) {
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
