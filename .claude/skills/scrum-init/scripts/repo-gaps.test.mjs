import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkRepo } from "./repo-gaps.mjs";

const put = (root, rel, body) => {
  const path = join(root, rel);
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, body);
};
const verdict = (results, id) => results.find((r) => r.id === id).met;

test("an empty tree reports every requirement as a gap", () => {
  const root = mkdtempSync(join(tmpdir(), "gaps-"));
  const results = checkRepo(root);
  assert.ok(results.length > 0);
  assert.equal(results.every((r) => !r.met), true);
});

test("vitest in package.json alone is not a passing frontend-tests check", () => {
  const root = mkdtempSync(join(tmpdir(), "gaps-"));
  put(root, "frontend/package.json", '{"devDependencies":{"vitest":"^3.0.0"}}');
  assert.equal(verdict(checkRepo(root), "frontend-tests"), false, "needs an actual test file too");

  put(root, "frontend/src/components/Thing.test.jsx", "test('x', () => {});");
  assert.equal(verdict(checkRepo(root), "frontend-tests"), true);
});

test("a jacoco plugin without a coverage rule does not count as a gate", () => {
  const root = mkdtempSync(join(tmpdir(), "gaps-"));
  put(root, "backend/pom.xml", "<plugin><artifactId>jacoco-maven-plugin</artifactId></plugin>");
  assert.equal(verdict(checkRepo(root), "backend-coverage"), false);

  put(
    root,
    "backend/pom.xml",
    "<plugin><artifactId>jacoco-maven-plugin</artifactId><counter>LINE</counter><value>COVEREDRATIO</value></plugin>",
  );
  assert.equal(verdict(checkRepo(root), "backend-coverage"), true);
});

test("a workflow that only lints and builds does not satisfy frontend-ci", () => {
  const root = mkdtempSync(join(tmpdir(), "gaps-"));
  put(root, ".github/workflows/ci.yml", "jobs:\n  frontend:\n    - run: npm run lint\n    - run: npm run build\n");
  assert.equal(verdict(checkRepo(root), "frontend-ci"), false);
  assert.equal(verdict(checkRepo(root), "ci-pipeline"), true, "a workflow still exists");

  put(root, ".github/workflows/frontend.yml", "- run: npm test\n");
  assert.equal(verdict(checkRepo(root), "frontend-ci"), true);
});

test("docs diagrams are detected by name, both source and export", () => {
  const root = mkdtempSync(join(tmpdir(), "gaps-"));
  put(root, "docs/class-diagram.drawio", "<mxfile/>");
  assert.equal(verdict(checkRepo(root), "class-diagram"), false, "png missing");

  put(root, "docs/class-diagram.png", "");
  assert.equal(verdict(checkRepo(root), "class-diagram"), true);
});

test("every check declares where the requirement comes from", () => {
  const root = mkdtempSync(join(tmpdir(), "gaps-"));
  for (const r of checkRepo(root)) {
    assert.ok(["mandatory", "module", "team"].includes(r.source), `${r.id} has no valid source`);
  }
});

test("CRUD needs all three write verbs on the backend and PUT+DELETE on the frontend", () => {
  const root = mkdtempSync(join(tmpdir(), "gaps-"));
  put(root, "backend/src/main/java/ThingController.java", "@PostMapping @PutMapping");
  put(root, "frontend/src/services/thing.js", 'method: "PUT"');
  assert.equal(verdict(checkRepo(root), "crud"), false, "DELETE missing on both sides");

  put(root, "backend/src/main/java/ThingController.java", "@PostMapping @PutMapping @DeleteMapping");
  put(root, "frontend/src/services/thing.js", 'method: "PUT" ... method: "DELETE"');
  assert.equal(verdict(checkRepo(root), "crud"), true);
});

test("every check says which module schedules it", () => {
  const root = mkdtempSync(join(tmpdir(), "gaps-"));
  for (const r of checkRepo(root)) {
    assert.match(r.due, /^(M\d|ongoing)$/, `${r.id} has no due module`);
  }
});
