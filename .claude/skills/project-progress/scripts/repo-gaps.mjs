#!/usr/bin/env node




// DESCRIPTION: CMPS3300 Class Project Progress Tracker
  // This script allows the user to understand which course requirements have 
  // not been met different than our .yml file. It's not the CI pipeline, it is for understanding 
  // our project progress for the entire class. So we are using this script as a progress tracker.

  // It is the script behind the /project-progress skill, and /scrum-init runs it from here
  // during preflight. One copy, so a fix to a check reaches both.
  
  // Usage: node .claude/skills/project-progress/scripts/repo-gaps.mjs [repo folder]

  // Every check carries its SOURCE, because they do not all carry the same weight:
  //   "mandatory" — Session 1 — Course Overview, "Mandatory Project Requirements (all groups)"
  //   "module"    — a module's own deliverables or practical guide
  //   "team"      — our own ticket, not the course's. Droppable without losing a point.
  //
  // Each check also carries DUE: the module that schedules it ("ongoing" = every module). The
  // mandatory requirements are delivered ACROSS the semester, so a gap due in a later module is
  // on schedule, not a failure. The module overview and its Sprint Planning assignment decide
// what a sprint contains; this list never does.

// Attribution: Michael Weild & Claude
// SCRUM (NA): This was for project tracking. Fun use of skills.
// Date: 9/20/2026



import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : "");
const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
      )
    : [];

// Entries in the refactoring log are its "## " headings (the "# " title is not an entry).
const countLogEntries = (text) => (text.match(/^## /gm) ?? []).length;

// Patterns are the table rows under the README's "Design pattern register" heading, stopping at
// the next heading so a later section's table is not counted. Header and |---| rows are skipped.
const countRegisterRows = (readme) => {
  const section = readme.split(/^#{1,6} .*design pattern.*$/im)[1];
  if (section === undefined) return 0;
  const rows = section.split(/^#{1,6} /m)[0].split("\n").filter((l) => l.trim().startsWith("|"));
  return Math.max(rows.filter((l) => !/^\|[\s|:-]+\|$/.test(l.trim())).length - 1, 0);
};

export function checkRepo(root) {
  const pkg = read(join(root, "frontend/package.json"));
  const pom = read(join(root, "backend/pom.xml"));
  const readme = read(join(root, "README.md"));
  const docs = existsSync(join(root, "docs")) ? readdirSync(join(root, "docs")) : [];
  const workflows = existsSync(join(root, ".github/workflows"))
    ? readdirSync(join(root, ".github/workflows"))
    : [];
  const frontendFiles = walk(join(root, "frontend/src"));
  const backendMain = walk(join(root, "backend/src/main/java"));
  const logFile = docs.find((d) => /refactor/i.test(d));
  const logEntries = logFile ? countLogEntries(read(join(root, "docs", logFile))) : 0;
  const patterns = countRegisterRows(readme);

  return [
    {
      id: "crud",
      due: "M2",
      requirement: "Full CRUD on a core resource, REST API and UI",
      source: "mandatory",
      met:
        backendMain.some((f) => /Controller\.java$/.test(f) &&
          /@PostMapping/.test(read(f)) && /@PutMapping/.test(read(f)) && /@DeleteMapping/.test(read(f))) &&
        frontendFiles.some((f) => /"PUT"|'PUT'/.test(read(f)) && /"DELETE"|'DELETE'/.test(read(f))),
    },
    {
      id: "frontend-tests",
      due: "M2",
      requirement: "Vitest component tests (render + interaction per component)",
      source: "module",
      met: pkg.includes("vitest") && frontendFiles.some((f) => /\.test\.jsx?$/.test(f)),
    },
    {
      id: "frontend-ci",
      due: "M2",
      requirement: "Frontend tests run in CI",
      source: "module",
      met: workflows.some((w) => /npm test|vitest/.test(read(join(root, ".github/workflows", w)))),
    },
    {
      id: "backend-coverage",
      due: "M2",
      requirement: "Unit tests, >=70% line coverage on service classes",
      source: "mandatory",
      met: pom.includes("jacoco") && pom.includes("COVEREDRATIO"),
    },
    {
      id: "ci-pipeline",
      due: "M2",
      requirement: "CI pipeline (GitHub Actions) on every push",
      source: "mandatory",
      met: workflows.length > 0,
    },
    {
      id: "ci-badge",
      due: "M2",
      requirement: "CI status badge in README",
      source: "team",
      met: /workflows\/.*badge\.svg|actions\/workflows/.test(readme),
    },
    {
      id: "class-diagram",
      due: "ongoing",
      requirement: "Class diagram in docs/ (.drawio + .png), updated each module",
      source: "mandatory",
      met: docs.includes("class-diagram.drawio") && docs.includes("class-diagram.png"),
    },
    {
      id: "package-diagram",
      due: "ongoing",
      requirement: "Package diagram in docs/, updated each module",
      source: "mandatory",
      met: docs.some((d) => d.startsWith("package-diagram")),
    },
    {
      id: "sequence-diagram",
      due: "ongoing",
      requirement: "Sequence diagram in docs/, updated each module",
      source: "mandatory",
      met: docs.some((d) => d.startsWith("sequence-diagram")),
    },
    {
      id: "retro",
      due: "ongoing",
      requirement: "Sprint retrospective write-ups in docs/",
      source: "module",
      met: docs.some((d) => /retro/i.test(d)),
    },
    {
      id: "refactoring-log",
      due: "M3",
      requirement: "Refactoring log, 5+ entries with before/after code and commit links",
      source: "mandatory",
      met: logEntries >= 5,
      progress: `${logEntries}/5`,
    },
    {
      id: "pattern-register",
      due: "M3",
      requirement: "Design pattern register (3+) in README with rationale",
      source: "mandatory",
      met: patterns >= 3,
      progress: `${patterns}/3`,
    },
    {
      id: "persistence",
      due: "M5",
      requirement: "PostgreSQL database via JPA/Hibernate",
      source: "mandatory",
      met: pom.includes("spring-boot-starter-data-jpa") && pom.includes("postgresql"),
    },
    {
      id: "auth-roles",
      due: "M5",
      requirement: "Register/login with JWT, 2+ roles, enforced in backend and frontend",
      source: "mandatory",
      met: pom.includes("spring-boot-starter-security"),
    },
    {
      id: "deployment",
      due: "M6",
      requirement: "Deployed and publicly reachable (Render + Supabase), live URL",
      source: "mandatory",
      met: /render\.com|onrender\.com|supabase\.co/i.test(readme),
    },
  ];
}

// pathToFileURL, not a hand-built "file://" string: that never matches on Windows, or in a
// path with spaces or non-ASCII characters, and the script would silently print nothing.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = process.argv[2] ?? process.cwd();
  const results = checkRepo(root);
  const gaps = results.filter((r) => !r.met);
  const label = { mandatory: "[course]", module: "[module]", team: "[ours]  " };
  for (const r of results) {
    console.log(
      `${r.met ? "MET " : "GAP "} ${label[r.source]} due:${r.due.padEnd(7)} ${r.id} — ${r.requirement}` +
        (r.progress ? ` (${r.progress})` : ""),
    );
  }
  const bySource = (s) => gaps.filter((g) => g.source === s).length;
  console.log(
    `\n${gaps.length} gap(s) of ${results.length}: ` +
      `${bySource("mandatory")} course-mandatory, ${bySource("module")} module-level, ${bySource("team")} our own.`,
  );
}
