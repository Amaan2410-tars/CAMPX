# AI release gate automation

This project now has an automated release gate workflow at:

- `.github/workflows/release-gate.yml`

## What it runs automatically

- `npm run lint`
- `npm run test`
- `npm run build`
- Playwright smoke tests: `npx playwright test -c playwright.release.config.ts`
- GO/NO-GO summary generation: `npm run release:report`

## Required GitHub secrets

Set these repository secrets for authenticated billing smoke checks:

- `RELEASE_TEST_EMAIL`
- `RELEASE_TEST_PASSWORD`

If these are missing, the authenticated E2E test is skipped, but the workflow still runs all non-auth checks.

## Outputs

Each run uploads an artifact bundle:

- `artifacts/release-gate-report.md` (GO/NO-GO)
- `artifacts/e2e-junit.xml`
- `playwright-report-release/` (HTML report)
- `test-results/` (traces/screenshots/videos on failure)
