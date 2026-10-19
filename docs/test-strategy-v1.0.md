# Personal Expense Manager — Test Strategy

| | |
|---|---|
| **Document status** | TEST STRATEGY BASELINE v1.0 |
| **Date** | 2026-09-01 |
| **Builds on** | requirements-baseline-v1.0.md, use-case-model-v1.0.md, architecture-baseline-v1.0.md (document status v1.5), database-design-baseline-v1.0.md, api-contract-v1.0.md |
| **Scope** | MVP only (Required + Recommended FRs) — Future Enhancement FRs (FR-22–26) are explicitly out of scope until they're built |
| **Actual Result / Status** | The original 90-case plan catalog below remains unexecuted as a complete matrix: Actual Result = "—", Status = "Not Run". This does not describe the separate, smaller regression suite summarized in the implementation-status note below. |
| **Implementation status (added later, not part of the original baseline)** | What actually got built is a much smaller, focused subset of this plan — 25 frontend utility/i18n tests (run under 3 time zones) + 10 backend tests (8 focused regression tests and 2 HTTP integration tests for Express 5 query sanitization) targeting selected regression risks (date/timezone handling, money representation, field-whitelisting, and password-reset-token logging), not the full 90-case matrix below. They run on Node's built-in test runner (`node --test`), not Vitest. The repository currently uses Node’s built-in test runner; the Vitest/Supertest/React Testing Library/Playwright tooling in the original plan is not present in the package manifests. Tests live in `frontend/tests/` and `backend/tests/`, run via `npm test` in each package. The frontend test command executes its 25 test cases three times under different time zones; the backend suite is intended to contain 10 test cases after adding HTTP integration coverage for the Express 5 sanitizer compatibility fix. These integration tests must pass in CI / on a dependency-complete machine before claiming the full backend test command passes. The full Supertest/API matrix and React Testing Library/component-level coverage described below were never implemented; the two added HTTP checks are narrow smoke/regression tests using Node’s built-in fetch and node:test. This document is kept as-is below as the original plan, not rewritten to match — treat it as aspirational scope for whoever picks this up next, not a description of what exists today. |

---

## 1. Test Strategy Overview

**Objective:** verify that the implementation matches the four frozen baselines exactly — every FR behaves as specified, every business rule is enforced, no user can ever see another user's data, and the app performs acceptably (NFR-01).

**Priority levels** (used throughout — this is what "prioritize critical paths" means concretely, not just in prose):

| Priority | Meaning | Examples |
|---|---|---|
| **P0 — Critical** | Must pass before any release. Auth, data isolation, core create/read paths, password security. | Login, ownership checks, register hashing |
| **P1 — High** | Core functional correctness and important edge cases. | Edit/delete flows, most validation |
| **P2 — Medium** | Secondary features, UI polish, less critical validation. | UI empty states, budget edit scope |
| **P3 — Low** | Nice-to-have coverage, cosmetic. | Currency formatting, health check |

**Test levels** (mapped to your 12 categories, with tooling — chosen for ESM/Vite consistency across the stack, nothing redundant):

| # | Category | What it verifies | Tooling |
|---|---|---|---|
| 1 | Unit | A single function, in isolation, no DB/network | Vitest |
| 2 | Integration | Multiple layers together (Controller→Service→Model→real test DB), or a frontend hook+component pair | Vitest + a dedicated `expense-manager-test` MongoDB database |
| 3 | API | Black-box HTTP contract compliance — status code, response envelope shape | Supertest + Vitest |
| 4 | Authentication | Login/session mechanics specifically | Supertest |
| 5 | Authorization | Ownership/access-control specifically — the highest-stakes category given "never expose another user's data" | Supertest, two seeded users |
| 6 | CRUD | Functional correctness of Create/Read/Update/Delete per resource | Supertest |
| 7 | Validation | Bad input is rejected with 400 + correct field messages | Supertest |
| 8 | Error handling | Non-validation failures return correct codes/shapes (404/409/500) | Supertest |
| 9 | UI | Component rendering and interaction | Vitest + React Testing Library |
| 10 | Responsive | Layout correctness across viewport sizes | Playwright (viewport emulation) |
| 11 | Security | Attack surface beyond basic auth/authz | Supertest, manual inspection |
| 12 | Performance | NFR-01 (≤2s) and query efficiency | Playwright/Supertest with timing assertions, `explain()` for indexes |

Categories 1–3 and 7–8 exercise the backend directly; 4–6 and 11 cut across backend endpoints; 9–10 exercise the frontend; 12 exercises both.

**Out of scope for this baseline:** Future Enhancement features (FR-22–26); load/stress testing beyond the single-request timing checks in §2.12; formal penetration testing. NFR-05 (Scalability) and NFR-06 (Maintainability) are validated through architecture/code review, not runtime test cases — they're not the kind of thing a test assertion checks. NFR-08 (Backup/Recovery) is validated by manually running the `mongodump`/`mongorestore` runbook, not an automated test.

**Test environment:** a separate `expense-manager-test` MongoDB database — never the seeded dev database — reset between integration test runs.

**Entry criteria:** the feature being tested is implemented and its backend module is mounted in `app.js`. **Exit criteria:** 100% of P0 cases pass; no open P0/P1 defects; P2/P3 failures are logged but don't block.

---

## 2. Test Case Catalog

### 2.1 Unit Testing

| Test ID | Req ID | Feature | Precondition | Steps | Input | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| UNIT-01 | FR-08 | Amount validation | None | Call `validateAmount()` directly | `0`, `-5`, `"abc"`, `""` | Each returns a non-empty error string | P1 |
| UNIT-02 | FR-18 / BR-06 | Budget status | None | Call `getBudgetStatus()` at boundary values | `79`, `80`, `99`, `100` | Returns `under, near, near, over` respectively | P0 |
| UNIT-03 | FR-18 / BR-02 | Spent calculation | A mixed array of income + expense transactions | Call `computeSpent()` | Array with 3 expenses + 2 income for the month | Sum includes only the 3 expenses | P0 |
| UNIT-04 | FR-01 / NFR-02 | Password hashing | None | Hash a password, then compare | `"Test1234!"` | Hash ≠ plaintext; `bcrypt.compare()` true for correct password, false for wrong one | P0 |
| UNIT-05 | FR-02 / NFR-02 | JWT round-trip | `JWT_SECRET` set | Sign a payload, verify it; then verify a tampered token | `{userId}` | Verify returns the original payload; tampered token throws | P0 |
| UNIT-06 | — (utility) | Currency formatting | None | Call `formatVND()` | `1988000` | Returns a correctly formatted VND string | P3 |
| UNIT-07 | BR-01 / BR-03 | Category ownership logic | Default, own-custom, and other-user's-custom category objects | Run the ownership check against all three | 3 category objects | Default: read-only rejection; own: allowed; other's: 403-equivalent rejection | P0 |
| UNIT-08 | FR-07 / BR-09 | Reset token expiry | A user with an expired `passwordResetExpires` | Attempt reset with the correct token hash | Correct token, expired timestamp | Rejected — expiry check fails independently of hash match | P1 |

### 2.2 Integration Testing

| Test ID | Req ID | Feature | Precondition | Steps | Input | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| INT-01 | FR-01 | Registration persistence | Test DB empty | POST register, then query MongoDB directly | Valid registration payload | `passwordHash` field is a bcrypt hash, never the plaintext password | P0 |
| INT-02 | FR-08 / FR-11 | Transaction persistence | User + category exist | POST a transaction, then GET the list | Valid transaction payload | Created transaction appears in the list with matching fields | P0 |
| INT-03 | FR-16 | Category deletion (unused) | Custom category with 0 transactions | DELETE the category, then GET categories | Category id | 200; category no longer in the list | P1 |
| INT-04 | FR-16 / BR-04 | Category deletion (in use) | Custom category with ≥1 transaction | DELETE the category, then GET categories and transactions | Category id | 409; category AND its transactions still exist unchanged (no partial deletion) | P0 |
| INT-05 | FR-17 / BR-05 | Budget uniqueness at DB level | A budget already exists for month+category | Attempt to create a duplicate directly via the Model, bypassing the service check | Same (userId, month, categoryId) | MongoDB rejects via the unique index, not just application logic | P0 |
| INT-06 | FR-11 | Frontend data hook | `useTransactions` mounted against the real (mocked) service | Trigger fetch, observe state transitions | — | State moves `loading:true → loading:false, transactions:[...]` correctly | P1 |

### 2.3 API Testing

| Test ID | Req ID | Feature | Precondition | Steps | Input | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| API-01 | FR-01 | Register contract | None | `POST /api/auth/register` | Valid payload | 201; `{success:true, data:{id,email,name,createdAt}}` | P0 |
| API-02 | FR-08 | Create transaction contract | Authenticated | `POST /api/transactions` | Valid payload | 201; response matches request fields plus `id`, timestamps | P0 |
| API-03 | FR-11 | Filter combination | ≥5 transactions across types/categories | `GET /api/transactions?type=expense&categoryId=X` | — | Only expense transactions in category X returned | P1 |
| API-04 | FR-17 (gap-fill) | Budget edit scope | A budget exists | `PUT /api/budgets/:id` with `{month, categoryId, limitAmount}` | Attempt to change `month` | Only `limitAmount` is applied; `month`/`categoryId` in the body are ignored | P2 |
| API-05 | FR-10 | Delete response shape | A transaction exists | `DELETE /api/transactions/:id` | — | 200 (not 204) with `{success:true,data:{message}}` | P2 |
| API-06 | — (cross-cutting) | Error envelope consistency | Any failure condition | Trigger a 400, a 404, and a 409 across different modules | — | All three use the identical `{success:false,message,errors}` shape | P0 |
| API-07 | — (ops) | Health check | Server running | `GET /health` with no auth header | — | 200, no 401 | P3 |
| API-08 | FR-21 | Compare validation | Authenticated | `GET /api/stats/compare` missing `period2End` | 3 of 4 required params | 400, names the missing param | P1 |
| API-09 | FR-04 | Get own profile | Authenticated as User A | `GET /api/users/me` | — | Returns User A's own `{id,email,name,createdAt}` | P2 |
| API-10 | FR-12 | Search | Transactions with varied notes | `GET /api/transactions?q=cà phê` | — | Only transactions with matching notes returned | P1 |
| API-11 | FR-13 | Default categories for new user | Brand-new user, no customs created | `GET /api/categories` | — | All 6 default categories returned even though the user owns none | P1 |

### 2.4 Authentication Testing

| Test ID | Req ID | Feature | Precondition | Steps | Input | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| AUTH-01 | FR-02 | Successful login | Registered user | `POST /api/auth/login` | Correct email + password | 200; valid JWT returned | P0 |
| AUTH-02 | FR-02 / NFR-02 | Wrong password | Registered user | `POST /api/auth/login` | Correct email, wrong password | 401, generic message | P0 |
| AUTH-03 | FR-02 / NFR-02 | Unknown email | None | `POST /api/auth/login` | Unregistered email | 401, **same** generic message as AUTH-02 (no enumeration) | P0 |
| AUTH-04 | — (E-AUTH-1) | Missing token | None | `GET /api/transactions` with no Authorization header | — | 401 | P0 |
| AUTH-05 | BR-08 | Expired token | A JWT signed with `expiresIn:'-1s'` | `GET /api/transactions` with that token | Expired JWT | 401 | P1 |
| AUTH-06 | NFR-02 | Tampered token | A JWT signed with a different secret | `GET /api/transactions` with that token | Invalid-signature JWT | 401 | P0 |
| AUTH-07 | FR-06 / BR-10 | Forgot-password anti-enumeration | One registered, one unregistered email | `POST /api/auth/forgot-password` for each | Registered vs. unregistered email | Both return the identical success message | P0 |
| AUTH-08 | FR-07 / BR-09 | Reset with expired token | Reset requested >45 min ago | `POST /api/auth/reset-password` | Expired token | 401 | P1 |
| AUTH-09 | FR-03 | Logout | Logged in | Click Logout, then attempt a protected page load | — | Token cleared client-side; protected route redirects to Login | P1 |

### 2.5 Authorization Testing

*(Every test in this section: User A and User B are both registered; the target resource belongs to User A; the request is made as User B.)*

| Test ID | Req ID | Feature | Precondition | Steps | Input | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| AUTHZ-01 | BR-01 | Read another user's transaction | User A's transaction id known to User B | `GET /api/transactions/:id` as User B | User A's transaction id | 403, not the data | P0 |
| AUTHZ-02 | BR-01 | Edit another user's transaction | Same | `PUT /api/transactions/:id` as User B | Same | 403 | P0 |
| AUTHZ-03 | BR-01 | Delete another user's transaction | Same | `DELETE /api/transactions/:id` as User B | Same | 403; transaction still exists afterward | P0 |
| AUTHZ-04 | BR-01 | List isolation | Both users have transactions | `GET /api/transactions` as User B | — | Response contains zero of User A's transactions | P0 |
| AUTHZ-05 | BR-01 | Another user's category | User A's custom category | Edit + delete attempts as User B | Category id | 403 for both | P0 |
| AUTHZ-06 | BR-01 | Another user's budget | User A's budget | Edit + delete attempts as User B | Budget id | 403 for both | P0 |
| AUTHZ-07 | BR-01 (Data Isolation Guarantee) | Client-supplied userId ignored | Authenticated as User B | `POST /api/transactions` with `userId` field set to User A's id in the body | Forged `userId` | Created transaction's actual `userId` is User B's, not the forged value | P0 |
| AUTHZ-08 | BR-03 | Default categories readable, not writable | Any authenticated user | `GET` succeeds; `PUT`/`DELETE` on a default category attempted | Default category id | GET returns it; PUT/DELETE both 403 | P0 |

### 2.6 CRUD Testing

| Test ID | Req ID | Feature | Precondition | Steps | Input | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| CRUD-01 | FR-08 | Create transaction | Authenticated | Submit valid transaction | All required fields | 201, persisted | P0 |
| CRUD-02 | FR-11 | Read (list) transactions | ≥3 transactions exist | `GET /api/transactions` | — | All of the user's transactions returned | P0 |
| CRUD-03 | FR-09 | Update transaction (partial) | A transaction exists | `PUT` with only `{note}` changed | New note only | Note updates; amount/date/category/type unchanged | P1 |
| CRUD-04 | FR-10 | Delete transaction | A transaction exists | `DELETE` it | — | Removed permanently; subsequent GET 404s | P0 |
| CRUD-05 | FR-14 | Create category | Authenticated | Submit a new category name | `"Sách vở"` | 201, appears in `GET /api/categories` | P1 |
| CRUD-06 | FR-15 | Update category | A custom category exists | `PUT` with a new name | New name | Name updates; existing transactions keep their link | P1 |
| CRUD-07 | FR-16 | Delete category (unused) | Custom category, 0 transactions | `DELETE` it | — | Removed | P1 |
| CRUD-08 | FR-17 | Create budget | Authenticated | Submit month + optional category + limit | Valid payload | 201; `GET /api/budgets` shows it with computed `spentAmount`/`status` | P0 |
| CRUD-09 | FR-17 (gap-fill) | Update budget | A budget exists | `PUT` with a new `limitAmount` | New limit | Limit updates; next `GET` reflects the new percentage immediately | P1 |
| CRUD-10 | FR-17 (gap-fill) | Delete budget | A budget exists, has associated transactions | `DELETE` the budget | — | Budget removed; the transactions themselves are untouched | P2 |
| CRUD-11 | FR-05 | Update profile | Authenticated | `PUT /api/users/me` with new name | `{name:"New Name"}` | 200; profile reflects the change on next `GET /me` | P2 |

### 2.7 Validation Testing

| Test ID | Req ID | Feature | Precondition | Steps | Input | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| VAL-01 | BR-07 | Short password | None | Register | `password:"abc123"` (6 chars) | 400, field error on `password` | P0 |
| VAL-02 | FR-01 | Password mismatch | None | Register | `password` ≠ `confirmPassword` | 400, field error on `confirmPassword` | P1 |
| VAL-03 | FR-01 | Invalid email format | None | Register | `email:"not-an-email"` | 400, field error on `email` | P1 |
| VAL-04 | FR-08 | Non-positive amount | Authenticated | Create transaction | `amount:0` and `amount:-100` (two runs) | Both 400 | P0 |
| VAL-05 | FR-08 | Nonexistent category | Authenticated | Create transaction | Random valid-format ObjectId not in DB | 400 | P1 |
| VAL-06 | FR-08 | Invalid date | Authenticated | Create transaction | `date:"not-a-date"` | 400 | P1 |
| VAL-07 | FR-17 | Malformed month | Authenticated | Create budget | `month:"2026-13"` and `month:"August"` | Both 400 | P1 |
| VAL-08 | FR-09 | Empty update body | A transaction exists | `PUT` with `{}` | Empty object | 400, "at least one field required" | P2 |

### 2.8 Error Handling

| Test ID | Req ID | Feature | Precondition | Steps | Input | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| ERR-01 | — (cross-cutting) | Not found | Well-formed but nonexistent id | `GET /api/transactions/:id` | Valid ObjectId format, no matching doc | 404 | P1 |
| ERR-02 | — (cross-cutting) | Malformed id | — | `GET /api/transactions/:id` | `id:"not-an-object-id"` | 400 (CastError handled), not a 500 | P1 |
| ERR-03 | BR-05 | Duplicate budget | Budget already exists for month+category | Create the same one again | Same month/categoryId | 409, clear message | P0 |
| ERR-04 | BR-04 | In-use category deletion | Category with N transactions | `DELETE` it | — | 409, message states the transaction count and how to resolve | P0 |
| ERR-05 | NFR-04 | Unexpected server error | Simulated DB disconnect | Any request during outage | — | 500, generic message, no stack trace or internal detail leaked to client | P1 |
| ERR-06 | NFR-04 | Frontend surfaces API errors | API returns an error | Trigger any failing mutation from the UI | — | A visible, readable error/toast appears — not a blank screen or silent console-only failure | P0 |

### 2.9 UI Testing

| Test ID | Req ID | Feature | Precondition | Steps | Input | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| UI-01 | FR-02 | Login validation | LoginPage rendered | Submit with both fields empty | — | Inline errors on both fields, no request sent | P1 |
| UI-02 | FR-08 | Add transaction end-to-end | TransactionsPage rendered | Fill and submit the Add Transaction modal | Valid data | Modal closes; new row appears at the top of the list | P0 |
| UI-03 | FR-10 | Delete confirmation | A transaction row rendered | Click its delete icon | — | Confirmation dialog appears; deletion does not occur until confirmed | P1 |
| UI-04 | FR-12 | Search empty state | Transactions loaded | Search a term matching nothing | Nonsense keyword | Empty-state message shown, not a blank list | P2 |
| UI-05 | FR-18 / BR-06 | Budget bar color | Budgets at under/near/over | Render BudgetsPage | Three budgets at ~50%, ~90%, ~110% | Bar colors match income/warn/expense respectively | P1 |
| UI-06 | BR-03 | Default category controls hidden | CategoriesPage rendered | Inspect a default category row | — | No edit/delete icons rendered for it (only the "Default" badge) | P1 |
| UI-07 | — (UX) | Toast auto-dismiss | Any successful mutation | Perform the action, wait | — | Toast appears, then disappears on its own after ~3s | P2 |
| UI-08 | FR-19 | Overview chart renders | ≥2 months of data | Load DashboardPage/StatisticsPage | — | Chart shows one bar-pair per month present in the data | P2 |
| UI-09 | FR-20 | Category breakdown totals | Expenses across ≥3 categories | Load the category pie chart | — | Displayed percentages sum to 100% (±rounding) | P2 |

### 2.10 Responsive Testing

| Test ID | Req ID | Feature | Precondition | Steps | Input | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| RESP-01 | NFR-03 | Mobile nav | App loaded | Set viewport to 375px wide | — | Sidebar hidden, bottom tab bar visible | P1 |
| RESP-02 | NFR-03 | Desktop nav | App loaded | Set viewport to 1280px wide | — | Sidebar visible, bottom tab bar hidden | P1 |
| RESP-03 | NFR-03 | Dashboard grid collapse | Dashboard loaded | Compare 375px vs. 1280px | — | Chart panels stack to one column on mobile, two on desktop | P2 |
| RESP-04 | NFR-03 | Modal usability on small screens | A modal open | Set viewport to 375px wide | — | No content cut off; modal scrolls internally if taller than viewport | P1 |
| RESP-05 | NFR-07 | Cross-browser core flow | — | Run login → add transaction → view dashboard in Chrome, Firefox, Edge, Safari | — | Identical behavior in all four | P2 |

### 2.11 Security Testing

| Test ID | Req ID | Feature | Precondition | Steps | Input | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| SEC-01 | NFR-02 | No plaintext passwords | A registered user | Inspect the `users` collection directly | — | `passwordHash` is a bcrypt hash (`$2a$...` or `$2b$...`), never plaintext | P0 |
| SEC-02 | NFR-02 | NoSQL injection attempt | None | `POST /api/auth/login` | `{"email":{"$ne":null},"password":{"$ne":null}}` | Rejected by input validation (not a valid email string), no auth bypass | P0 |
| SEC-03 | NFR-02 | Secret hygiene | Repository | Search the git history and codebase for `JWT_SECRET` values | — | No real secret value committed anywhere; only `.env.example` with a placeholder | P1 |
| SEC-04 | — (rate limiting) | Brute-force throttling | None | Submit 21 login attempts within 15 minutes | Wrong password, repeated | The 21st returns 429, not 401 | P1 |
| SEC-05 | NFR-02 | Sensitive fields never leak | Any endpoint returning a user object | Inspect every response containing user data | — | `passwordHash`, `passwordResetToken`, `passwordResetExpires` absent from all of them | P0 |
| SEC-06 | — (CORS) | Origin allow-list | — | Send a request with `Origin: https://evil.example` | — | CORS rejects it; only the configured `CLIENT_ORIGIN` is allowed | P2 |

### 2.12 Performance Testing

| Test ID | Req ID | Feature | Precondition | Steps | Input | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| PERF-01 | NFR-01 | List performance at scale | User seeded with 500+ transactions | Time `GET /api/transactions` | — | Response in <2s | P1 |
| PERF-02 | NFR-01 | Aggregation performance | A year of transaction data | Time `GET /api/stats/overview` | — | Response in <2s | P1 |
| PERF-03 | NFR-01 | Write latency | Normal load | Time `POST /api/transactions` | — | Response in <500ms | P2 |
| PERF-04 | NFR-01 | Index effectiveness | Transactions collection populated | Run `.explain()` on the filtered list query | `{userId, date range, category}` filter | Query plan shows an index scan (`IXSCAN`), not a collection scan (`COLLSCAN`) | P2 |

---

## Requirement → Test Case Traceability Matrix

| Req ID | Requirement (short) | Test Case(s) |
|---|---|---|
| FR-01 | Register | UNIT-04, INT-01, API-01, VAL-01, VAL-02, VAL-03, SEC-01 |
| FR-02 | Login | UNIT-05, AUTH-01, AUTH-02, AUTH-03, UI-01 |
| FR-03 | Logout | AUTH-09 |
| FR-04 | View profile | API-09 |
| FR-05 | Update profile | CRUD-11 |
| FR-06 | Request password reset | AUTH-07 |
| FR-07 | Reset password | UNIT-08, AUTH-08 |
| FR-08 | Add transaction | INT-02, API-02, CRUD-01, VAL-04, VAL-05, VAL-06, UI-02 |
| FR-09 | Edit transaction | CRUD-03, VAL-08 |
| FR-10 | Delete transaction | CRUD-04, API-05, UI-03 |
| FR-11 | List/filter transactions | INT-02, INT-06, API-03, CRUD-02 |
| FR-12 | Search transactions | API-10, UI-04 |
| FR-13 | View default categories | API-11 |
| FR-14 | Create category | CRUD-05 |
| FR-15 | Edit category | CRUD-06, AUTHZ-05 |
| FR-16 | Delete category | INT-03, INT-04, CRUD-07, ERR-04 |
| FR-17 | Budget set/edit/delete | INT-05, CRUD-08, CRUD-09, CRUD-10, API-04, ERR-03, VAL-07 |
| FR-18 | Budget status | UNIT-02, UNIT-03, UI-05 |
| FR-19 | Statistics overview | UI-08, PERF-02 |
| FR-20 | Category breakdown | UI-09 |
| FR-21 | Compare periods | API-08 |
| FR-27 | English/Vietnamese UI preference and persistence | TC-22 (manual acceptance; not yet automated in a browser) |
| BR-01 | Data ownership/isolation | AUTHZ-01–07 |
| BR-03 | Default categories read-only | UNIT-07, AUTHZ-08, UI-06 |
| BR-04 | Category deletion guard | INT-04, ERR-04 |
| BR-05 | Budget uniqueness | INT-05, ERR-03 |
| BR-06 | Budget thresholds | UNIT-02, UI-05 |
| BR-09 | Reset token expiry | UNIT-08, AUTH-08 |
| BR-10 | Account enumeration protection | AUTH-03, AUTH-07 |
| NFR-01 | Performance | PERF-01–04 |
| NFR-02 | Security | UNIT-04, UNIT-05, AUTH-04–06, SEC-01–05 |
| NFR-03 | Responsive | RESP-01–04 |
| NFR-04 | Reliability/error handling | ERR-01, ERR-02, ERR-05, ERR-06 |
| NFR-05 | Scalability | *Validated by architecture review, not test cases (see §1)* |
| NFR-06 | Maintainability | *Validated by code review/lint, not test cases (see §1)* |
| NFR-07 | Compatibility | RESP-05 |
| NFR-08 | Backup & Recovery | *Validated by manual DR drill, not test cases (see §1)* |

Every MVP FR (FR-01–FR-21 and FR-27) has at least one test case; the most critical paths — registration security, login/session integrity, and cross-user data isolation — each have multiple, spanning several of the 12 categories rather than relying on a single test.

---

## TEST STRATEGY BASELINE v1.0

| | |
|---|---|
| **Status** | Original planned test catalog; only the separately listed focused regression subset has implementation, and its newest HTTP checks still require a real dependency-complete run |
| **Scope covered** | Original catalog of 90 planned test cases across all 12 categories plus the separate TC-22 localization acceptance check; 22/22 MVP FRs traced (FR-01–FR-21 and FR-27); 8/8 NFRs addressed (3 explicitly as review-based, not test-based) |
| **Priority distribution** | Roughly a third P0 (critical paths: auth, authorization, core writes, security) — concentrated exactly where "never expose another user's data" and NFR-02 matter most |
| **Traceability** | Every test case's Req ID matches an FR/BR/NFR already in the other four baselines — nothing here introduces new scope |
| **Planned tooling in the original 90-case catalog** | Vitest (unit/integration) + Supertest (API) + React Testing Library (components) + Playwright (responsive/cross-browser). These are planned tools, not current dependencies; the implemented subset uses `node:test` and built-in `fetch`. |
| **Current follow-up** | Run the new Express 5 HTTP tests with real dependencies, then expand the suite from P0 requirements; do not report unimplemented rows as passed |
