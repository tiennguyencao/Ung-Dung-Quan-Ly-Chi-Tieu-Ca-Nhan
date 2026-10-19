# Personal Expense Manager — Software Requirements Specification

| | |
|---|---|
| **Document status** | REQUIREMENTS BASELINE v1.0 (implementation-reconciled; final stakeholder/author sign-off still pending) |
| **Date** | 2026-08-31 |
| **Project** | Personal Expense Manager — Software Engineering Midterm |
| **Prepared for** | Nguyễn Cao Tiến — 22012834 |
| **Source of truth** | Current source code + README.md for implemented behavior; this SRS records intended scope and traceability |

**ID legend:** `FR` Functional Requirement · `NFR` Non-Functional Requirement · `UC` Use Case · `BR` Business Rule · `TC` Test Case (Appendix B)

**Contents:** [1. Functional Requirements](#1-functional-requirements) · [2. Non-Functional Requirements](#2-non-functional-requirements) · [3. Actors](#3-actors) · [4. System Boundaries](#4-system-boundaries) · [5. Use Cases](#5-use-cases) · [6. Preconditions](#6-preconditions) · [7. Main Success Scenarios](#7-main-success-scenarios) · [8. Alternative Flows](#8-alternative-flows) · [9. Exception Flows](#9-exception-flows) · [10. Business Rules](#10-business-rules) · [11. MVP Requirements](#11-mvp-requirements) · [12. Future Requirements](#12-future-requirements) · [Requirement Traceability Matrix](#requirement-traceability-matrix) · [Appendix A — Assumptions Log](#appendix-a--assumptions-log) · [Appendix B — Test Case Reference](#appendix-b--test-case-reference)

---

## 1. Functional Requirements

| ID | Requirement | Tier | README Ref | Notes |
|---|---|---|---|---|
| FR-01 | Register a new account with email + password | Required | §2.1 | |
| FR-02 | Log in with email + password, receive a session (JWT) | Required | §2.1 | |
| FR-03 | Log out (end the session) | Required | §2.1 | ASSUMPTION #12 |
| FR-04 | View own profile information | Required | §2.1 | |
| FR-05 | Update own profile information | Required | §2.1 | |
| FR-06 | Request a password reset | Recommended | §2.1 | ASSUMPTION #2 |
| FR-07 | Reset password using a valid token | Recommended | §2.1 | ASSUMPTION #2 |
| FR-08 | Create a transaction (amount, date, category, type, note) | Required | §2.2 | |
| FR-09 | Edit an existing transaction | Required | §2.2 | |
| FR-10 | Delete an existing transaction | Required | §2.2 | |
| FR-11 | List transactions, filterable by date, category, type | Required | §2.2 | |
| FR-12 | Search transactions by keyword/note | Recommended | §2.2 | |
| FR-13 | View default system categories | Required | §2.3 | |
| FR-14 | Create a custom category | Required | §2.3 | |
| FR-15 | Edit a custom category | Required | §2.3 | ASSUMPTION #4 |
| FR-16 | Delete a custom category | Required | §2.3 | ASSUMPTION #5 |
| FR-17 | Set a budget limit (monthly and/or per category) | Required | §2.4 | ASSUMPTION #1, #6 |
| FR-18 | View budget status with a near/over-limit indicator | Required | §2.4 | ASSUMPTION #1, #7 |
| FR-19 | View income/expense overview chart (day/week/month/year) | Required | §2.5 | |
| FR-20 | View spending breakdown by category (pie/donut) | Required | §2.5 | |
| FR-21 | Compare income/expense across two periods | Recommended | §2.5 | |
| FR-22 | Auto-generate recurring transactions | Future | §2.6 | |
| FR-23 | Export transactions/reports to Excel or PDF | Future | §2.7 | |
| FR-24 | User-facing backup/restore of personal data | Future | §2.7 | |
| FR-25 | Daily expense-entry reminder | Future | §2.8 | |
| FR-26 | Scheduled/push budget-exceeded notification | Future | §2.8 | |
| FR-27 | Switch interface language between English and Vietnamese; persist choice in the same browser | Required | Cross-cutting UI preference | UC-25 / TC-22 |

> **Decomposition note:** The original requirements FR-01–FR-26 decompose capabilities from the original product scope into atomic actions. FR-27 is a finalization addition explicitly requested for this release: selecting English/Vietnamese with a browser-local persisted preference. It is mapped to UC-25 and TC-22 below; it does not change financial data or API payloads.

## 2. Non-Functional Requirements

| ID | Requirement | README Ref | Solo-Dev Note |
|---|---|---|---|
| NFR-01 | Response time ≤ 2s for basic operations | §3.1 | Achievable by default at this scale; index `userId`, `date`, `category` |
| NFR-02 | Password hashing, JWT auth, per-user data isolation | §3.2 | bcrypt + JWT, both standard, low risk |
| NFR-03 | Intuitive, responsive UI (desktop + mobile) | §3.3 | Tailwind responsive utilities, built mobile-first |
| NFR-04 | Stable operation, reasonable error handling | §3.4 | One centralized Express error middleware |
| NFR-05 | Architecture extensible (multi-currency, shared wallets) | §3.5 | Modeling discipline now (e.g. every doc carries `userId`); no feature built now |
| NFR-06 | Modular, commented, convention-following code | §3.6 | Concrete conventions defined in Phase 2 |
| NFR-07 | Works on Chrome, Firefox, Edge, Safari | §3.7 | Free with standard React/Tailwind, no exotic APIs |
| NFR-08 | Periodic backup + recovery capability | §3.8 | ASSUMPTION #3 — manual runbook, not automated infra |

## 3. Actors

| Actor | Type | Description |
|---|---|---|
| **Guest** | Primary, human | Unauthenticated visitor. Can register, log in, request a password reset. No access to any financial data. |
| **User** | Primary, human | Authenticated account holder. Owns and operates on their own transactions, categories, budgets, and statistics only (BR-01). |
| **Email Service** | Secondary, external system | Third-party mail transport, invoked only by UC-05 to deliver the reset link. Outside the system boundary. |

No Admin or moderator actor is defined — the README describes no administrative role, so none is introduced.

## 4. System Boundaries

**In scope (inside the system):**
- Web client — React SPA (presentation layer)
- REST API — Node.js/Express (application logic)
- MongoDB (persistence)
- JWT auth module (cross-cutting, lives inside the API layer)

**Out of scope (external to the system):**
- Email/SMTP provider — invoked, not owned, by UC-05 only
- Browser runtime / end-user device — execution environment, not application logic
- Hosting/deployment platform (Vercel/Netlify, Render/Railway) — infrastructure, not logical scope
- Bank/financial-institution integration, payment processing, third-party accounting sync — **not mentioned anywhere in the README**, so explicitly not in scope, not even as a Future item

## 5. Use Cases

| UC | Name | Primary Actor | Linked FR |
|---|---|---|---|
| UC-01 | Register Account | Guest | FR-01 |
| UC-02 | Login | Guest | FR-02 |
| UC-03 | Logout | User | FR-03 |
| UC-04 | View/Update Profile | User | FR-04, FR-05 |
| UC-05 | Reset Password | Guest (+ Email Service) | FR-06, FR-07 |
| UC-06 | Add Transaction | User | FR-08 |
| UC-07 | Edit Transaction | User | FR-09 |
| UC-08 | Delete Transaction | User | FR-10 |
| UC-09 | View/Filter Transactions | User | FR-11 |
| UC-10 | Search Transactions | User | FR-12 |
| UC-11 | View Categories | User | FR-13 |
| UC-12 | Create Category | User | FR-14 |
| UC-13 | Edit Category | User | FR-15 |
| UC-14 | Delete Category | User | FR-16 |
| UC-15 | Set Budget Limit | User | FR-17 |
| UC-16 | View Budget Status | User | FR-18 |
| UC-17 | View Statistics Overview | User | FR-19 |
| UC-18 | View Category Breakdown | User | FR-20 |
| UC-19 | Compare Periods | User | FR-21 |
| UC-20 | Manage Recurring Transactions *(Future)* | User | FR-22 |
| UC-21 | Export Report *(Future)* | User | FR-23 |
| UC-22 | Backup/Restore Data *(Future)* | User | FR-24 |
| UC-23 | Receive Daily Reminder *(Future)* | User | FR-25 |
| UC-24 | Receive Budget Alert Notification *(Future)* | User | FR-26 |
| UC-25 | Change Interface Language | Guest / User | FR-27 |

## 6. Preconditions

| Group | Applies to | Precondition |
|---|---|---|
| P-GUEST | UC-01, UC-02, UC-05 | Actor is not required to be authenticated |
| P-AUTH | UC-03 through UC-19 | Actor holds a valid, unexpired JWT |
| P-OWN | UC-07, UC-08, UC-13, UC-14, UC-15, UC-16 | The target record (transaction / category / budget) belongs to the authenticated user |
| P-CAT-EXISTS | UC-06, UC-07 | The referenced category already exists (default or custom) |
| P-EMAIL-VALID | UC-05 | Actor supplies a syntactically valid email address (existence is not required — see BR-10) |

## 7. Main Success Scenarios

**UC-01 Register**
1. Guest submits email + password (+ confirm).
2. System validates format and password policy (BR-07).
3. System checks the email isn't already registered.
4. System hashes the password and creates the User record.
5. System confirms success; Guest is routed to Login.

**UC-02 Login**
1. Guest submits email + password.
2. System verifies credentials against the stored hash.
3. System issues a JWT.
4. Client stores the token and routes to Dashboard.

**UC-03 Logout**
1. User selects Logout.
2. Client discards the stored JWT and routes to Login (ASSUMPTION #12).

**UC-04 View/Update Profile**
1. User opens Profile.
2. System returns current profile data.
3. User edits fields and submits.
4. System validates and persists the change.

**UC-05 Reset Password**
1. Guest submits their email to request a reset.
2. System generates a time-limited token (BR-09) and sends it via Email Service.
3. Guest opens the emailed link and submits a new password.
4. System validates the token, updates the password hash, and invalidates the token.

**UC-06 Add Transaction**
1. User opens the Add Transaction form.
2. User enters amount, date, category, type (income/expense), optional note.
3. System validates required fields and that the category exists and belongs to the user (or is default).
4. System persists the transaction under the authenticated user.
5. UI updates the list and any affected budget/stat widgets.

**UC-07 Edit Transaction**
1. User selects an existing transaction.
2. User modifies one or more fields.
3. System validates ownership (P-OWN) and input.
4. System persists the change; UI reflects it.

**UC-08 Delete Transaction**
1. User selects a transaction and confirms deletion.
2. System validates ownership.
3. System removes the record; dependent stats/budget recalculate.

**UC-09 View/Filter Transactions**
1. User opens the Transactions list.
2. System returns the user's transactions, most recent first, by default.
3. User applies filters (date range, category, type).
4. System returns the filtered subset.

**UC-10 Search Transactions**
1. User enters a keyword.
2. System returns transactions whose note matches, case-insensitive.

**UC-11 View Categories**
1. User opens Categories.
2. System returns default categories + the user's custom categories.

**UC-12 Create Category**
1. User submits a new category name.
2. System validates it's non-empty and not a duplicate for that user.
3. System persists it under the user.

**UC-13 Edit Category**
1. User selects a custom category and edits its name.
2. System validates ownership and that it isn't a default category (BR-03).
3. System persists the change.

**UC-14 Delete Category**
1. User selects a custom category and confirms deletion.
2. System checks whether any transaction references it (BR-04).
3. If none do, system deletes it; if some do, deletion is rejected (see §9).

**UC-15 Set Budget Limit**
1. User opens Budget Settings.
2. User enters a limit amount, a month, and optionally a category.
3. System validates input and that no duplicate budget exists for that (month, category) pair (BR-05).
4. System persists the budget.

**UC-16 View Budget Status**
1. User opens Dashboard or Budget page.
2. System sums the user's expense transactions for the relevant month(+category).
3. System compares the total to the limit and derives a state: under / near / over (BR-06).
4. UI renders the corresponding indicator.

**UC-17 View Statistics Overview**
1. User opens Statistics.
2. User selects a granularity (day/week/month/year).
3. System aggregates income and expense totals for that granularity.
4. UI renders the chart.

**UC-18 View Category Breakdown**
1. User opens the category view of Statistics.
2. System aggregates expense totals grouped by category for the selected period.
3. UI renders a pie/donut chart.

**UC-19 Compare Periods**
1. User selects two periods.
2. System aggregates totals for each.
3. System computes the difference / percentage change.
4. UI renders the comparison.

## 8. Alternative Flows

| # | Applies to | Alternative |
|---|---|---|
| A1 | UC-09 | User filters by only one of date/category/type, or clears all filters to return to the unfiltered list |
| A2 | UC-09, UC-10 | User combines a keyword search with a date/category/type filter simultaneously |
| A3 | UC-06 | User records an income transaction rather than expense — same flow, `type` differs, changes the sign used in BR-02 |
| A4 | UC-15 | User sets an overall monthly budget with no category (BR-05), or several per-category budgets for the same month |
| A5 | UC-16 | No budget exists yet for the current month → UI shows a "no budget set" prompt instead of a status bar (valid state, not an error) |
| A6 | UC-17, UC-18, UC-19 | No transactions exist in the selected period → chart renders an empty/zero state rather than failing |
| A7 | UC-05 | Guest re-requests a reset link before the previous token expires → system issues a new token and invalidates the old one |

## 9. Exception Flows

**Cross-cutting (applies to every authenticated use case, UC-03 through UC-19):**

| # | Condition | Result |
|---|---|---|
| E-AUTH-1 | Missing, expired, or invalid JWT | 401 Unauthorized → redirect to Login |
| E-AUTH-2 | Requested resource exists but belongs to another user | 403 Forbidden (BR-01, NFR-02) |

**Use-case-specific:**

| # | Applies to | Condition | Result |
|---|---|---|---|
| E1 | UC-01 | Email already registered | 409 Conflict, no account created |
| E2 | UC-01 | Password fails policy (BR-07) or a required field is missing | 400 Bad Request |
| E3 | UC-02 | Wrong password or unknown email | 401, generic "invalid credentials" message (doesn't reveal which field was wrong) |
| E4 | UC-05 | Reset requested for a non-existent email | System still returns a generic success message but sends no email (BR-10) |
| E5 | UC-05 | Token expired, invalid, or already used | 400/401, user must request a new one |
| E6 | UC-06, UC-07 | Invalid amount (non-numeric/negative) or invalid date | 400 |
| E7 | UC-06, UC-07 | Referenced category doesn't exist or isn't the user's | 400/404 |
| E8 | UC-08 | Transaction ID doesn't exist | 404 |
| E9 | UC-12 | Duplicate category name for the same user | 409 |
| E10 | UC-13, UC-14 | Attempt to edit or delete a default category | 403 (BR-03) |
| E11 | UC-14 | Category still referenced by ≥1 transaction | 409, deletion blocked (BR-04) |
| E12 | UC-15 | Duplicate budget for the same (month, category), or non-positive limit | 409 / 400 (BR-05) |

## 10. Business Rules

| ID | Rule |
|---|---|
| BR-01 | Every Transaction, custom Category, and Budget belongs to exactly one User; a user may only read/modify their own records |
| BR-02 | A transaction's `type` (`income`/`expense`) determines its sign in statistics; only `expense` counts against a budget (ASSUMPTION #8) |
| BR-03 | Default categories are read-only — cannot be edited or deleted by any user (ASSUMPTION #4) |
| BR-04 | A custom category cannot be deleted while ≥1 transaction still references it (ASSUMPTION #5) |
| BR-05 | A Budget has a required `month` and optional `category`; omitting `category` means an overall monthly limit; at most one Budget per (`month`, `category`) pair (ASSUMPTION #6) |
| BR-06 | Budget status is "near limit" at ≥80% consumed and "over limit" at ≥100% (ASSUMPTION #7) |
| BR-07 | Minimum password length: 8 characters (ASSUMPTION #9) |
| BR-08 | A JWT access token is valid for a fixed period (assumed 7 days); no refresh-token rotation in MVP (ASSUMPTION #10) |
| BR-09 | A password-reset token is valid for a limited window (assumed 30–60 minutes) and single-use (ASSUMPTION #11) |
| BR-10 | A password-reset request always returns a generic success response, regardless of whether the email is registered, so the API never reveals which emails have accounts |

## 11. MVP Requirements

**Required:** FR-01–05, FR-08–11, FR-13–20 (Auth core, Transactions CRUD+filter, Categories, Budget, core Statistics)
**Recommended (build once the above is demo-stable):** FR-06, FR-07 (password reset), FR-12 (search), FR-21 (period comparison)

## 12. Future Requirements

FR-22 Recurring transactions · FR-23 Export to Excel/PDF · FR-24 User-facing backup/restore · FR-25 Daily reminder · FR-26 Scheduled/push budget notification — all explicitly deferred by README §5, out of scope for this baseline.

---

## REQUIREMENT TRACEABILITY MATRIX

Grouped by Module (the module name is the group heading, so it isn't repeated as a column). **Module, DB Entity, API, and UI Screen values below are preliminary labels for traceability only** — full schema/endpoint/UI design happens in Phase 2 (Architecture) and Phase 3 (Database).

### Module: AUTH

| FR | Requirement | Use Case | DB Entity | API | UI Screen | Test |
|---|---|---|---|---|---|---|
| FR-01 | Register | UC-01 | User | `POST /api/auth/register` | Register Page | TC-01 |
| FR-02 | Login | UC-02 | User | `POST /api/auth/login` | Login Page | TC-02 |
| FR-03 | Logout | UC-03 | — (client-side) | N/A — client discards JWT | Navbar logout control | TC-03 |
| FR-04 | View profile | UC-04 | User | `GET /api/users/me` | Profile Page | TC-04 |
| FR-05 | Update profile | UC-04 | User | `PUT /api/users/me` | Profile Page | TC-05 |
| FR-06 | Request reset | UC-05 | User | `POST /api/auth/forgot-password` | Forgot Password Page | TC-06 |
| FR-07 | Reset w/ token | UC-05 | User | `POST /api/auth/reset-password` | Reset Password Page | TC-07 |

### Module: TXN (Transactions)

| FR | Requirement | Use Case | DB Entity | API | UI Screen | Test |
|---|---|---|---|---|---|---|
| FR-08 | Add transaction | UC-06 | Transaction | `POST /api/transactions` | Add Transaction Form | TC-08 |
| FR-09 | Edit transaction | UC-07 | Transaction | `PUT /api/transactions/:id` | Edit Transaction Form | TC-09 |
| FR-10 | Delete transaction | UC-08 | Transaction | `DELETE /api/transactions/:id` | Transactions List (delete action) | TC-10 |
| FR-11 | List/filter | UC-09 | Transaction | `GET /api/transactions?...` | Transactions List Page | TC-11 |
| FR-12 | Search | UC-10 | Transaction | `GET /api/transactions?q=...` | Transactions List (search bar) | TC-12 |

### Module: CAT (Categories)

| FR | Requirement | Use Case | DB Entity | API | UI Screen | Test |
|---|---|---|---|---|---|---|
| FR-13 | View categories | UC-11 | Category | `GET /api/categories` | Categories Page | TC-13 |
| FR-14 | Create category | UC-12 | Category | `POST /api/categories` | Categories Page (add form) | TC-14 |
| FR-15 | Edit category | UC-13 | Category | `PUT /api/categories/:id` | Categories Page (edit form) | TC-15 |
| FR-16 | Delete category | UC-14 | Category | `DELETE /api/categories/:id` | Categories Page (delete action) | TC-16 |

### Module: BUD (Budget)

| FR | Requirement | Use Case | DB Entity | API | UI Screen | Test |
|---|---|---|---|---|---|---|
| FR-17 | Set budget | UC-15 | Budget | `POST /api/budgets` | Budget Settings Page | TC-17 |
| FR-18 | Budget status | UC-16 | Budget + Transaction (aggregation) | `GET /api/budgets/status` | Dashboard (budget widget) | TC-18 |

### Module: STA (Statistics)

| FR | Requirement | Use Case | DB Entity | API | UI Screen | Test |
|---|---|---|---|---|---|---|
| FR-19 | Overview chart | UC-17 | Transaction (aggregation) | `GET /api/stats/overview` | Statistics Page | TC-19 |
| FR-20 | Category breakdown | UC-18 | Transaction (aggregation) | `GET /api/stats/by-category` | Statistics Page | TC-20 |
| FR-21 | Compare periods | UC-19 | Transaction (aggregation) | `GET /api/stats/compare` | Statistics Page | TC-21 |

### Future modules (RECUR / EXPORT / BACKUP / NOTIFY) — deferred

| FR | Requirement | Use Case | DB Entity | API | UI Screen | Test |
|---|---|---|---|---|---|---|
| FR-22 | Recurring transactions | UC-20 | Deferred | Deferred | Deferred | Deferred |
| FR-23 | Export report | UC-21 | Deferred | Deferred | Deferred | Deferred |
| FR-24 | Backup/restore | UC-22 | Deferred | Deferred | Deferred | Deferred |
| FR-25 | Daily reminder | UC-23 | Deferred | Deferred | Deferred | Deferred |
| FR-26 | Budget notification | UC-24 | Deferred | Deferred | Deferred | Deferred |

### Cross-cutting requirement — Interface localization

| FR | Requirement | Tier | Use Case | State / Storage | UI | Test reference |
|---|---|---|---|---|---|---|
| FR-27 | Switch interface language between English and Vietnamese; restore the last choice in the same browser | Required | UC-25 | `localStorage` key `pem-language`; no backend field or API call | Auth shell + authenticated top bar and all primary screens | TC-22 |

The localization preference is presentation-only. It must not mutate transaction records, custom category names, notes, amounts, or database schema.

---

## Appendix A — Assumptions Log

1. **Budget management kept as Required** (FR-17, FR-18) despite not being named in README §5's scope sentence — justified by the intro paragraph naming budgeting as a headline feature. *(Phase 1 flag a.)*
2. **Password reset is a lightweight implementation** (FR-06, FR-07) — real token/expiry logic, minimal email delivery rather than production email infrastructure. *(Phase 1 flag b.)*
3. **NFR-08 satisfied via a manual `mongodump`/`mongorestore` runbook** — confirmed MongoDB Atlas's free (M0) tier has no built-in automated backup; that starts at M10. *(Phase 1 flag c.)*
4. **Default categories are read-only** (BR-03) — only custom categories support edit/delete.
5. **Category deletion is blocked while referenced by a transaction** (BR-04), rather than cascading or reassigning to "Uncategorized."
6. **Budget scope semantics** (BR-05): category optional; omitted = overall monthly limit; max one budget per (month, category).
7. **Budget status thresholds** (BR-06): 80% = near limit, 100% = over limit — README doesn't specify a percentage.
8. **Budgets constrain expenses only** (BR-02) — income doesn't count against a limit.
9. **Minimum password length: 8 characters** (BR-07) — README doesn't specify a policy.
10. **JWT access-token lifetime: ~7 days, single token, no refresh rotation** (BR-08) — README doesn't specify session length.
11. **Password-reset token lifetime: 30–60 minutes, single-use** (BR-09) — README doesn't specify.
12. **Logout is client-side only** (FR-03) — JWT discarded on the client, no server-side session/blacklist endpoint.
13. **Chart library:** Recharts is selected and used by the current frontend implementation; the original open decision is resolved.

## Appendix B — Test Case Reference

| TC | Verifies |
|---|---|
| TC-01 | Register succeeds with valid data; duplicate email and invalid fields are rejected |
| TC-02 | Login returns a JWT on correct credentials; wrong password/unknown email rejected |
| TC-03 | Logout clears the session; protected routes become inaccessible afterward |
| TC-04 | Authenticated user retrieves own profile; unauthenticated request is rejected |
| TC-05 | Profile update persists; invalid data rejected |
| TC-06 | Reset request for a valid email issues a token; unknown email returns generic success (BR-10) |
| TC-07 | Reset with a valid token updates the password; expired/invalid token rejected |
| TC-08 | Valid transaction persists and appears in the list; missing required fields rejected |
| TC-09 | Editing updates the correct record; editing another user's transaction returns 403 |
| TC-10 | Deleting removes the record; deleting another user's transaction returns 403 |
| TC-11 | Filters (date/category/type) return only matching transactions, individually and combined |
| TC-12 | Keyword search matches note text; no match returns an empty list, not an error |
| TC-13 | A newly registered user has the default category set pre-populated |
| TC-14 | Creating a custom category persists it and it appears in the transaction form |
| TC-15 | Editing a custom category updates it; editing a default category returns 403 |
| TC-16 | Deleting an unused category succeeds; deleting one with transactions is blocked (BR-04) |
| TC-17 | Setting a budget persists correctly; duplicate (month, category) is rejected (BR-05) |
| TC-18 | Budget status correctly reflects under/near/over based on actual expense totals |
| TC-19 | Overview chart aggregates correctly for each granularity (day/week/month/year) |
| TC-20 | Category breakdown percentages sum to 100% of the period total |
| TC-21 | Period comparison computes the correct delta between two selected ranges |

---

## REQUIREMENTS BASELINE v1.0

| | |
|---|---|
| **Status** | Implementation-reconciled baseline; Appendix A assumptions still require author confirmation before declaring the requirements formally approved |
| **Scope covered** | 27 Functional Requirements · 8 Non-Functional Requirements · 3 Actors · 25 Use Cases · 10 Business Rules |
| **Traceability** | Requirements are mapped across Use Case → Module → DB Entity → API → UI Screen → planned Test Case; this matrix is not proof that every path is implemented or automatically tested |
| **Supersedes** | The informal Phase 1 chat classification — same conclusions, now IDed and versioned |
| **Change control** | Any change to a Required/Recommended item after this point should increment the version (v1.1, v1.2…) rather than silently overwrite it, so Architecture/DB/API/UI/Test stay traceable back to a requirement |
| **Current follow-up** | Review the 13 assumptions in Appendix A and record author sign-off or overrides; architecture, database design, API, UI and test artifacts now exist and must remain aligned with the source |
