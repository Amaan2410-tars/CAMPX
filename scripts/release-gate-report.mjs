import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function hasJUnitFailures(xml) {
  const testsAttr = xml.match(/tests="(\d+)"/);
  const failuresAttr = xml.match(/failures="(\d+)"/);
  const errorsAttr = xml.match(/errors="(\d+)"/);
  const skippedAttr = xml.match(/skipped="(\d+)"/);

  return {
    tests: Number(testsAttr?.[1] ?? 0),
    failures: Number(failuresAttr?.[1] ?? 0),
    errors: Number(errorsAttr?.[1] ?? 0),
    skipped: Number(skippedAttr?.[1] ?? 0),
  };
}

const outDir = resolve("artifacts");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const lines = [];
lines.push("# Release Gate Report");
lines.push("");
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push("");

const checks = [
  ["lint", process.env.LINT_EXIT_CODE ?? "1"],
  ["unit_tests", process.env.UNIT_EXIT_CODE ?? "1"],
  ["build", process.env.BUILD_EXIT_CODE ?? "1"],
  ["e2e", process.env.E2E_EXIT_CODE ?? "1"],
];

let allGreen = true;
for (const [name, code] of checks) {
  const pass = code === "0";
  if (!pass) allGreen = false;
  lines.push(`- ${name}: ${pass ? "PASS" : "FAIL"} (exit_code=${code})`);
}

const junitPath = resolve("artifacts", "e2e-junit.xml");
if (existsSync(junitPath)) {
  const junit = readFileSync(junitPath, "utf8");
  const stats = hasJUnitFailures(junit);
  lines.push("");
  lines.push("## E2E Summary");
  lines.push(`- tests: ${stats.tests}`);
  lines.push(`- failures: ${stats.failures}`);
  lines.push(`- errors: ${stats.errors}`);
  lines.push(`- skipped: ${stats.skipped}`);
  if (stats.failures > 0 || stats.errors > 0) allGreen = false;
}

lines.push("");
lines.push(`## Verdict: ${allGreen ? "GO" : "NO-GO"}`);
lines.push("");
lines.push("If NO-GO, inspect workflow logs and Playwright report artifact.");

writeFileSync(resolve(outDir, "release-gate-report.md"), `${lines.join("\n")}\n`, "utf8");
