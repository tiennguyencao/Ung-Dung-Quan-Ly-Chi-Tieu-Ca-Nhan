# Update Notes — 17 October 2026

These changes are based on the local MacBook Air M2 smoke test of Personal Expense Manager.

## Fixes

- **Transaction note search:** changed from MongoDB `$text` token search to an escaped, case-insensitive literal substring search on `note`. A phrase such as `đi xem phim` no longer matches a note such as `Đi làm muộn` merely because both contain `đi`.
- **Search request volume:** the input waits 250 ms after typing pauses before requesting results, avoiding a request for every keystroke.
- **Categories page title:** `/categories` now shows the translated `Manage categories` title instead of falling back to the Home/Dashboard title.
- **Local backend port:** the backend default, `.env.example`, frontend example, Vite proxy and local setup docs now consistently use port `5001`. The proxy was already targeting `5001` in the source archive.
- **Development API rate limit:** the global API limit is finite but raised to 1,000 requests per 15 minutes in development to avoid throttling normal manual QA. It remains 300 per 15 minutes outside development. The separate authentication limiter remains enabled.
- **Session recovery:** a transient network, 429, or server error while restoring a session no longer permanently removes the stored JWT. A 401 still clears an invalid/expired token.
- **Fast Refresh/lint structure:** context values were separated from provider components and `useLanguage` was moved to its own hook, addressing the React Fast Refresh export warnings without disabling the lint rule.

## Checks completed in the review environment

- New note-search unit tests: **3/3 passed**.
- Existing frontend tests: **25/25 passed** in each of UTC, `Asia/Ho_Chi_Minh`, and `America/New_York` (75 successful test executions total).
- Backend JavaScript syntax checks: passed.
- Frontend JavaScript/JSX syntax parsing and relative-import resolution checks: passed.

A full clean dependency install, full backend integration suite, ESLint run and Vite production build could not be completed in this review environment because requests to `registry.npmjs.org` failed with DNS error `EAI_AGAIN`. Please rerun the package checks on the Mac after applying this update.
