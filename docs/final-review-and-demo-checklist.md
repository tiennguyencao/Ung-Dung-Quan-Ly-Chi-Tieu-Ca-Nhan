# Final Review & Demo Checklist

**Purpose:** Record the release-oriented fixes and provide a short, honest checklist before the Software Engineering midterm submission.

## 1. Changes in this finalization pass

- Updated the root README so it describes the actual React/Vite + Express + MongoDB implementation instead of presenting the selected stack as alternatives.
- Distinguished the current MVP from future/deferred functionality (recurring transactions, exports, backup/restore, reminders, and offline write synchronization).
- Added consistent local setup, environment-variable, seed, run, test, lint, build, and mobile-browser demo instructions.
- Added a manual `mongodump`/`mongorestore` runbook for the documented backup/recovery non-functional requirement; user-facing backup/restore remains out of scope.
- Corrected stale architecture-version references, the resolved Recharts decision, and the historical UI prototype note.
- Expanded the root `.gitignore` to exclude local secrets, dependencies, generated build output, and coverage files while keeping `.env.example` files tracked.
- Added an Express 5 compatibility bridge before `express-mongo-sanitize@2.2.0`, which otherwise tries to assign to the Express 5 read-only `req.query` getter. Added two real-HTTP regression checks: sanitizer operator-key removal and app `/health` reachability.
- Updated CI to Node.js 24 and the backend engine requirement to Node.js `>=22`; added a dedicated MacBook Air M2 verification guide. This is an architecture/configuration target, not a claim of benchmarking on an actual M2 device.
- Hardened the password-reset mailer: a raw reset URL may be logged only when `NODE_ENV=development`; when SMTP is absent outside development, the app emits a generic warning without the recipient or reset token.
- Added regression tests for development-only reset-link logging and for preventing reset-token/recipient leakage outside development.
- Added English/Vietnamese interface selection without an extra i18n dependency. The preference is stored in browser `localStorage`; navigation, common messages, forms, dates/currency labels, and charts are localized. Built-in category labels are translated for display only; user-entered names/notes and stored data are not rewritten.

## 2. Verification performed while preparing this archive (2026-10-11)

| Check | Result | Qualification |
|---|---|---|
| Frontend utility/i18n tests | Passed: 25/25 in each of 3 time-zone runs (75 test executions) using `TZ=UTC`, `TZ=Asia/Ho_Chi_Minh`, and `TZ=America/New_York` with Node's built-in test runner. | Ran `TZ=... node --test tests/*.test.js` directly. The full npm lint/build commands were not verified here. |
| Backend test suite | Not run end-to-end for this revision | This archive adds two HTTP integration tests to the eight existing regression tests. A clean dependency installation did not complete in this environment (`npm ci` timed out; an earlier attempt returned registry `EAI_AGAIN`), so the new tests could not be executed here with the real dependencies. Run `npm ci && npm test` in `backend/` on a networked machine or in CI before submission. The earlier eight-test run used a temporary local `nodemailer` stub; no stub is included here and SMTP delivery remains untested. |
| Backend JS syntax | Passed | Checked JavaScript files with `node --check`. |
| Package and lockfile JSON | Passed | The four package/lock files parsed as valid JSON. |
| Clean dependency install, backend integration suite, frontend lint/build | Not verified | Dependencies could not be fully installed in this environment, so do not infer install/test/lint/build success. |
| Real-browser, MongoDB-backed integration, and phone demo | Not verified here | Follow the manual checklist below on the target machine/device. |

The automated tests in this repository are a focused regression suite, not a complete end-to-end acceptance suite. The new Express 5 integration checks are added to the test suite but still require a real dependency-complete run before they can be reported as passing. The broader tables in `test-strategy-v1.0.md` remain a test plan; a listed test case is not evidence that it has already been automated or executed.

Use the following commands after installing dependencies:

| Package | Command | Purpose |
|---|---|---|
| Backend | `cd backend && npm test` | Security / field-whitelist regression tests plus Express 5 sanitizer HTTP smoke tests |
| Frontend | `cd frontend && npm test` | Financial utility regressions across multiple time zones |
| Frontend | `cd frontend && npm run lint` | Static code checks |
| Frontend | `cd frontend && npm run build` | Production build smoke check |

Record the actual terminal result before submission. Do not report a check as passed if dependencies were unavailable or the command did not finish.

## 3. Pre-submission manual acceptance checklist

Mark an item only after testing it against the running app and database.

### Account and session

- [ ] Register a new demo account; confirm an invalid email/password input is rejected.
- [ ] Log in, refresh a protected page, then log out and confirm the protected route returns to login.
- [ ] Request a password reset. In local `development` without SMTP, retrieve the link from the backend terminal; verify it opens the reset page and the token cannot be reused after a successful reset.
- [ ] Confirm reset URL / raw reset token does not appear in logs when `NODE_ENV` is not `development`; configure SMTP before claiming production email delivery works.

### Ownership and validation

- [ ] Create two separate demo accounts and add different transactions to each.
- [ ] Verify one account cannot view, edit, or delete the other account's transaction by changing a record ID in a request.
- [ ] Try invalid amounts, malformed dates, and an invalid category ID; confirm the API rejects them and the UI presents a useful error.

### Core product workflow

- [ ] Add an expense and an income; edit one and delete one after confirming the prompt.
- [ ] Search and filter transactions by keyword, date, category, and transaction type.
- [ ] Add/edit a custom category; confirm a default category cannot be edited or deleted.
- [ ] Set a monthly category budget; compare amount spent, percentage, and status to the seeded transactions.
- [ ] Confirm Dashboard and Statistics numbers respond consistently to the transactions entered.

### Localization

- [ ] Switch between EN and VI on the auth page and authenticated shell; confirm the preference survives refresh.
- [ ] Verify navigation, forms, errors, toasts, date labels, budget cards and both charts change language.
- [ ] Confirm custom category names, transaction notes and stored values are not changed by language switching.

### Mobile and demo readiness

- [ ] Check a narrow mobile viewport: navigation, form controls, dialogs, charts, and page scrolling remain usable.
- [ ] Open the deployed URL on the actual phone browser and test one full workflow while connected to the API.
- [ ] If demonstrating PWA installation, verify the site uses HTTPS and the installation option is available on the chosen browser/device.
- [ ] Keep a fallback demo account and a small set of synthetic transactions ready; do not depend on live email or fragile network conditions unless tested beforehand.

## 4. Known limitations to disclose accurately

- The Express 5 query-sanitizer compatibility bridge and its two HTTP regression tests were added during this pass; their actual runtime result is **not verified in this environment** because dependencies could not be installed. Treat the release as pending until `cd backend && npm test` passes with real dependencies.

- Recurring transactions, Excel/PDF export, in-app backup/restore, daily reminders/push notifications, and offline write synchronization are outside the current MVP.
- Password-reset email requires working SMTP configuration. Development console-link behavior is only for local testing, not for deployment.
- The frontend utility/i18n tests cover selected date and locale formatting, amount, budget-status and translation behavior; the full requirement-to-test matrix has not been implemented as a complete automated integration/UI suite. UI language switching still needs a real-browser manual check.
- PWA installation and service-worker behavior depend on the target hosting setup, HTTPS and browser support; source configuration alone is not proof that each device/browser has been verified.

## 5. Suggested demo sequence (5–7 minutes)

1. Sign in and show the dashboard.
2. Add a synthetic expense and income; edit one transaction.
3. Show search/filter and the custom category workflow.
4. Set a monthly budget and show its current status.
5. Show the statistics update from the data entered.
6. Briefly explain the architecture diagram and demonstrate one test or security design decision (for example, user data ownership or development-only reset-token logging).

**Submission rule:** screenshots, test counts, browser compatibility, and performance figures should be reported only if personally observed or produced by a completed test run.
