import { test } from "node:test";
import assert from "node:assert/strict";
import { formatSubmission, rubricWarnings } from "./submission.mjs";

const plan = {
  sprint: "Module 3",
  team: ["Michael Weild", "Qixuan Liu"],
  stories: [
    {
      title: "User Story 1 — SOLID audit",
      tasks: [
        { key: "SCRUM-48", title: "Audit services", assignee: "Michael Weild", points: 3, description: "d" },
        { key: "SCRUM-49", title: "Audit React", assignee: "Qixuan Liu", points: 2, description: "d" },
        { key: "SCRUM-50", title: "Write log", assignee: "Michael Weild", points: 1, description: "d" },
      ],
    },
  ],
};

test("totals are summed per assignee, not per task", () => {
  const out = formatSubmission(plan);
  assert.match(out, /Michael Weild 4 points/);
  assert.match(out, /Qixuan Liu 2 points/);
});

test("every task's key, assignee, points and description reach the output", () => {
  const out = formatSubmission(plan);
  for (const key of ["SCRUM-48", "SCRUM-49", "SCRUM-50"]) assert.match(out, new RegExp(key));
  assert.match(out, /Assigned to: Qixuan Liu/);
});

test("a story with fewer than three tasks is flagged", () => {
  const thin = { ...plan, stories: [{ title: "Thin", tasks: plan.stories[0].tasks.slice(0, 2) }] };
  assert.match(rubricWarnings(thin).join(" "), /at least 3/);
});

test("a zero-point estimate is a real estimate, not a missing field", () => {
  const zero = {
    ...plan,
    stories: [
      { title: "S", tasks: [{ key: "A", title: "t", assignee: "M", points: 0, description: "d" }] },
    ],
  };
  assert.equal(
    rubricWarnings(zero).some((w) => w.includes("missing")),
    false,
  );
});

test("a task missing its assignee is named in the warning", () => {
  const broken = {
    ...plan,
    stories: [{ title: "S", tasks: [{ key: "SCRUM-99", title: "t", points: 2, description: "d" }] }],
  };
  assert.match(rubricWarnings(broken).join(" "), /SCRUM-99 is missing: assignee/);
});

test("a plan where only one teammate has work is flagged", () => {
  const solo = {
    ...plan,
    stories: [
      {
        title: "S",
        tasks: plan.stories[0].tasks.map((t) => ({ ...t, assignee: "Michael Weild" })),
      },
    ],
  };
  assert.match(rubricWarnings(solo).join(" "), /Not every teammate/);
});
