# Personal Expense Manager — REST API Contract

| | |
|---|---|
| **Document status** | API CONTRACT v1.0 — baseline; changes must be versioned and reconciled with the implementation |
| **Date** | 2026-09-01 |
| **Builds on** | requirements-baseline-v1.0.md, use-case-model-v1.0.md, architecture-baseline-v1.0.md (document status v1.5), database-design-baseline-v1.0.md |
| **Base URL** | `/api` (no version segment — see architecture-baseline §7) |

---

## Standard Response Format

**Every** response, from every endpoint, uses one of exactly two shapes. Nothing below repeats this — only the `data` shape and status code vary per endpoint.

**Success:**
```json
{
  "success": true,
  "data": { }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Human-readable summary of what went wrong",
  "errors": []
}
```
`errors` is `[]` for a single/general failure (the `message` carries the whole story — e.g. 404, 409). It's populated with per-field objects for multi-field validation failures (400s from the validation layer):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "amount", "message": "Amount must be greater than 0" },
    { "field": "date", "message": "Date must be a valid date" }
  ]
}
```

## Authentication

Every endpoint except the four under `/auth` requires a header:
```
Authorization: Bearer <JWT>
```
Missing, malformed, or expired → **401**, `{ success: false, message: "Authentication required" }` (E-AUTH-1). This is stated once here and not repeated in every endpoint's error list below — assume 401 is always possible on every authenticated route.

## Data Isolation Guarantee

Every endpoint that touches Transaction, custom Category, or Budget data enforces isolation through two independent mechanisms:

1. **Every query is scoped server-side to `req.user.id`**, taken only from the verified JWT. No endpoint below accepts a `userId` from the client — in the request body, query string, or path — in any form. If one is sent, it's ignored.
2. **Every single-resource operation (`GET`/`PUT`/`DELETE` by `:id`) re-checks ownership after lookup.** A request for another user's transaction, custom category, or budget returns **403** — not the data, not a hint that the ID exists (E-AUTH-2). Default categories (`isDefault: true`) are the one explicit, by-design exception — shared by every user, per BR-03.

There is no endpoint, and no parameter combination, in this contract that returns another user's private financial data.

## Common Error Codes

| Code | Meaning | Typical cause |
|---|---|---|
| 400 | Bad Request | Input fails validation, or a business rule is violated on write (e.g. duplicate budget) |
| 401 | Unauthorized | Missing/invalid/expired JWT, or wrong login credentials |
| 403 | Forbidden | Valid auth, but not allowed — not the resource owner, or the resource is read-only (default category) |
| 404 | Not Found | Resource ID doesn't exist |
| 409 | Conflict | Uniqueness violated — duplicate email, duplicate category name, duplicate budget |
| 500 | Server Error | Unexpected failure — not documented per-endpoint below, always possible |

---

## `/auth`

#### `POST /api/auth/register`
**Auth:** None
**Params:** none
**Request body:**
```
{ email: string, password: string, confirmPassword: string, name: string }
```
**Success `201`:**
```
{ success: true, data: { id, email, name, createdAt } }
```
**Errors:** `400` — invalid email/password/name, or `password !== confirmPassword`; `409` — email already registered
**Validation:** `email` required, valid format; `password` required, ≥8 chars (BR-07); `confirmPassword` required, must equal `password`; `name` required, 1–100 chars, trimmed

#### `POST /api/auth/login`
**Auth:** None
**Request body:**
```
{ email: string, password: string }
```
**Success `200`:**
```
{ success: true, data: { token: string, user: { id, email, name } } }
```
**Errors:** `400` — missing fields; `401` — invalid credentials (generic message, doesn't reveal which field, per NFR-02)
**Validation:** `email` required valid format; `password` required

#### `POST /api/auth/forgot-password`
**Auth:** None
**Request body:**
```
{ email: string }
```
**Success `200`** (always — see BR-10):
```
{ success: true, data: { message: "If that email is registered, a reset link has been sent." } }
```
**Errors:** `400` — invalid email format
**Validation:** `email` required, valid format. *No 404 for an unknown email* — that would leak account existence (E4/BR-10).

#### `POST /api/auth/reset-password`
**Auth:** None (the token itself is the one-time credential)
**Request body:**
```
{ token: string, newPassword: string, confirmNewPassword: string }
```
**Success `200`:**
```
{ success: true, data: { message: "Password updated. Please log in." } }
```
**Errors:** `400` — password invalid or doesn't match confirmation; `401` — token missing, invalid, expired, or already used (E5/BR-09)
**Validation:** `token` required; `newPassword` required, ≥8 chars; `confirmNewPassword` must equal `newPassword`

---

## `/users`

#### `GET /api/users/me`
**Auth:** Required
**Params:** none
**Success `200`:**
```
{ success: true, data: { id, email, name, createdAt } }
```
**Errors:** *(only the universal 401)*
**Validation:** none (no input)

#### `PUT /api/users/me`
**Auth:** Required
**Request body** (partial — at least one field):
```
{ name?: string, email?: string }
```
**Success `200`:**
```
{ success: true, data: { id, email, name, updatedAt } }
```
**Errors:** `400` — invalid format, or empty body; `409` — email already in use by another account
**Validation:** `name` 1–100 chars if present; `email` valid format if present; at least one field required
> **Scope note:** password is intentionally *not* changeable here — the README separates "update profile" (§2.1) from "reset password" (§2.1) as distinct capabilities; password changes always go through `/auth/forgot-password` → `/auth/reset-password`, never this endpoint.

---

## `/transactions`

#### `GET /api/transactions`
**Auth:** Required
**Params (query, all optional, combinable):** `startDate` (ISO date), `endDate` (ISO date), `categoryId` (ObjectId), `type` (`income`|`expense`), `q` (keyword)
**Success `200`:**
```
{ success: true, data: [ { id, categoryId, type, amount, date, note, createdAt, updatedAt }, ... ] }
```
Sorted `date` descending by default. `q` is trimmed and matched as a case-insensitive literal substring of `note`; a multi-word phrase must appear in the note in that order (FR-12).
**Errors:** `400` — malformed date, invalid `type` value, or invalid `categoryId` format
**Validation:** `startDate`/`endDate` valid dates if present; `type` must be exactly `income` or `expense` if present; `categoryId` valid ObjectId format if present

#### `GET /api/transactions/:id`
**Auth:** Required
**Params (path):** `id`
**Success `200`:**
```
{ success: true, data: { id, categoryId, type, amount, date, note, createdAt, updatedAt } }
```
**Errors:** `403` — not the owner (E-AUTH-2); `404` — no such transaction
**Validation:** `id` must be a valid ObjectId format

#### `POST /api/transactions`
**Auth:** Required
**Request body:**
```
{ categoryId: string, type: "income"|"expense", amount: number, date: string, note?: string }
```
**Success `201`:**
```
{ success: true, data: { id, categoryId, type, amount, date, note, createdAt, updatedAt } }
```
**Errors:** `400` — invalid amount/date/type, or category doesn't exist / isn't accessible to this user (E6/E7)
**Validation:** `categoryId` required, valid ObjectId, must exist and be either default or owned by this user; `type` required, enum; `amount` required, number `> 0`; `date` required, valid date; `note` optional, ≤500 chars, trimmed

#### `PUT /api/transactions/:id`
**Auth:** Required
**Params (path):** `id`
**Request body** (partial — at least one field):
```
{ categoryId?: string, type?: "income"|"expense", amount?: number, date?: string, note?: string }
```
**Success `200`:**
```
{ success: true, data: { id, categoryId, type, amount, date, note, createdAt, updatedAt } }
```
**Errors:** `400` — same per-field rules as create, or empty body; `403` — not the owner (E-AUTH-2); `404` — not found
**Validation:** same as `POST`, all fields optional individually, but at least one required

#### `DELETE /api/transactions/:id`
**Auth:** Required
**Params (path):** `id`
**Success `200`:**
```
{ success: true, data: { message: "Transaction deleted." } }
```
*(200 with a body, not 204 — kept consistent with every other endpoint's envelope rather than breaking it for REST purism on this one verb.)*
**Errors:** `403` — not the owner (E-AUTH-2); `404` — not found
**Validation:** `id` must be a valid ObjectId format

---

## `/categories`

#### `GET /api/categories`
**Auth:** Required
**Params:** none
**Success `200`:**
```
{ success: true, data: [ { id, userId, isDefault, name, icon, color, createdAt, updatedAt }, ... ] }
```
Returns system defaults (`userId: null`) **union** this user's own customs — never another user's customs.
**Errors:** *(only the universal 401)*
**Validation:** none

#### `POST /api/categories`
**Auth:** Required
**Request body:**
```
{ name: string, icon?: string, color?: string }
```
**Success `201`:**
```
{ success: true, data: { id, userId, isDefault: false, name, icon, color, createdAt, updatedAt } }
```
**Errors:** `400` — invalid name; `409` — duplicate name for this user (E9)
**Validation:** `name` required, 1–50 chars, trimmed; `icon` optional string; `color` optional, hex pattern (`#RRGGBB`)

#### `PUT /api/categories/:id`
**Auth:** Required
**Params (path):** `id`
**Request body** (partial — at least one field):
```
{ name?: string, icon?: string, color?: string }
```
**Success `200`:**
```
{ success: true, data: { id, userId, isDefault, name, icon, color, createdAt, updatedAt } }
```
**Errors:** `400` — invalid field, or empty body; `403` — target is a default category (E10/BR-03), or not the owner (E-AUTH-2); `404` — not found; `409` — new name duplicates an existing one for this user
**Validation:** same as create, all optional, at least one required; **must not** be `isDefault: true`

#### `DELETE /api/categories/:id`
**Auth:** Required
**Params (path):** `id`
**Success `200`:**
```
{ success: true, data: { message: "Category deleted." } }
```
**Errors:** `403` — default category (E10/BR-03), or not the owner (E-AUTH-2); `404` — not found; `409` — ≥1 transaction still references it (E11/BR-04)
**Validation:** `id` valid ObjectId; must not be default; must have zero referencing transactions

---

## `/budgets`

#### `GET /api/budgets`
**Auth:** Required
**Params (query):** `month?` (`YYYY-MM` — if omitted, returns all months)
**Success `200`:**
```
{ success: true, data: [ { id, month, categoryId, categoryName, limitAmount, spentAmount, percentageUsed, status: "under"|"near"|"over", createdAt, updatedAt }, ... ] }
```
One enriched endpoint serves both a "manage my budgets" list (raw fields, for editing) and the Dashboard status widget (computed fields) — implements FR-18/UC-16; replaces the separate `/budgets/status` sketched in the requirements RTM as this contract's more complete version of the same requirement.
**Errors:** `400` — malformed `month`
**Validation:** `month` must match `YYYY-MM` if provided

#### `POST /api/budgets`
**Auth:** Required
**Request body:**
```
{ month: string, categoryId?: string, limitAmount: number }
```
**Success `201`:**
```
{ success: true, data: { id, month, categoryId, limitAmount, createdAt, updatedAt } }
```
**Errors:** `400` — invalid `month`/`limitAmount`, or `categoryId` doesn't exist/isn't accessible; `409` — a budget already exists for this (month, category) pair, including two "overall" budgets for the same month (E12/BR-05)
**Validation:** `month` required, `YYYY-MM`; `categoryId` optional, must exist and be accessible if provided; `limitAmount` required, `> 0`

#### `PUT /api/budgets/:id` *(gap-fill — see note below)*
**Auth:** Required
**Params (path):** `id`
**Request body:**
```
{ limitAmount: number }
```
Only `limitAmount` is editable. Changing `month` or `categoryId` changes *which* budget this is (they form its unique identity, BR-05) — delete and create a new one instead.
**Success `200`:**
```
{ success: true, data: { id, month, categoryId, limitAmount, updatedAt } }
```
**Errors:** `400` — invalid `limitAmount`; `403` — not the owner (E-AUTH-2); `404` — not found
**Validation:** `limitAmount` required, `> 0`

#### `DELETE /api/budgets/:id` *(gap-fill — see note below)*
**Auth:** Required
**Params (path):** `id`
**Success `200`:**
```
{ success: true, data: { message: "Budget deleted." } }
```
**Errors:** `403` — not the owner (E-AUTH-2); `404` — not found
**Validation:** `id` valid ObjectId

---

## `/stats`

#### `GET /api/stats/overview`
**Auth:** Required
**Params (query):** `granularity?` (`day`|`week`|`month`|`year`, default `month`), `startDate?`, `endDate?` (default: current year)
**Success `200`:**
```
{ success: true, data: [ { period: string, income: number, expense: number }, ... ] }
```
**Errors:** `400` — invalid `granularity` or malformed dates
**Validation:** `granularity` one of the 4 values if present; dates valid if present

#### `GET /api/stats/by-category`
**Auth:** Required
**Params (query):** `startDate?`, `endDate?` (default: current month), `type?` (`income`|`expense`, default `expense`)
**Success `200`:**
```
{ success: true, data: [ { categoryId, categoryName, total: number, percentage: number }, ... ] }
```
**Errors:** `400` — malformed dates or invalid `type`
**Validation:** dates valid if present; `type` enum if present

#### `GET /api/stats/compare`
**Auth:** Required
**Params (query, all required):** `period1Start`, `period1End`, `period2Start`, `period2End`
**Success `200`:**
```
{ success: true, data: { period1: { income, expense }, period2: { income, expense }, delta: { income, expense }, percentChange: { income, expense } } }
```
**Errors:** `400` — any of the four date params missing or invalid
**Validation:** all four required, valid dates

---

## Gaps Filled At This Phase

Flagged explicitly, not silently added — both are completions of already-scoped features, not new ones:

| Addition | Why it wasn't already there | Why it belongs |
|---|---|---|
| `PUT /api/budgets/:id`, `DELETE /api/budgets/:id` | The original FR list gave Transactions and Categories full CRUD but only gave Budget "Set" (FR-17) and "View status" (FR-18) — an under-decomposition, not a deliberate exclusion | Without these, a wrong budget amount could never be corrected or removed — not a viable MVP |
| `GET /api/transactions/:id` | Not in the original RTM's endpoint list, which only had the list endpoint | RESTful completeness for a resource the frontend may navigate to directly (bookmark, refresh on an edit URL) — cheap to add, meaningfully more robust |

Neither changes any FR's intent or adds a feature; both complete CRUD surfaces that "manage transactions/budgets" already implied.

---

## API CONTRACT v1.0

| | |
|---|---|
| **Status** | Baseline v1.0. Changes to method, path, request field, response field, or status code must be versioned and checked against the running implementation. |
| **Scope** | 22 endpoints across `/auth` (4), `/users` (2), `/transactions` (5), `/categories` (4), `/budgets` (4), `/stats` (3) |
| **Response envelope** | `{ success, data }` / `{ success, message, errors }` — universal, no exceptions |
| **Data isolation design** | The contract requires server-derived `userId` scoping and per-resource ownership checks; confirm with the security regression/manual ownership checklist rather than treating this document alone as proof of runtime behavior |
| **Amends** | `architecture-baseline-v1.0.md` §7 → v1.1 (response envelope changed to match this contract) |
| **Gaps filled here** | Budget `PUT`/`DELETE`, Transaction single-`GET` — both flagged above, not silent |
| **Change control** | Any change to this contract after this point is a new version (v1.1, v1.2…), never a silent edit — UI, backend implementation, and tests will all be built directly against what's written here |
| **Current follow-up** | Verify runtime conformance against the implemented routes and the final-review checklist; version any actual contract changes explicitly |
