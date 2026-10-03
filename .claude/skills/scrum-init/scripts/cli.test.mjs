import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

// The scripts only print when run directly. A path with a space and non-ASCII characters is
// where a naive entry-point check fails silently, so run them from one.
const awkwardDir = () => {
  const dir = join(mkdtempSync(join(tmpdir(), "cli-")), "with space 桌面");
  mkdirSync(dir, { recursive: true });
  return dir;
};
const run = (dir, script, ...args) => {
  copyFileSync(join(here, script), join(dir, script));
  return spawnSync(process.execPath, [join(dir, script), ...args], { encoding: "utf8" });
};

test("repo-gaps.mjs prints its report when run as a command", () => {
  // Arrange
  const dir = awkwardDir();

  // Act
  const result = run(dir, "repo-gaps.mjs", dir);

  // Assert
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /gap\(s\) of \d+/);
});

test("submission.mjs prints the Canvas text when run as a command", () => {
  // Arrange
  const dir = awkwardDir();
  const task = (key, assignee) => ({ key, title: "T", assignee, points: 2, description: "D" });
  const plan = join(dir, "plan.json");
  writeFileSync(plan, JSON.stringify({
    sprint: "Module 3",
    team: ["A", "B"],
    stories: [{ title: "S", tasks: [task("SCRUM-1", "A"), task("SCRUM-2", "B"), task("SCRUM-3", "A")] }],
  }));

  // Act
  const result = run(dir, "submission.mjs", plan);

  // Assert
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Module 3 Sprint Planning/);
});
