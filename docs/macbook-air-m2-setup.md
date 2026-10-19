# MacBook Air M2 — Setup and Verification Guide

**Purpose:** Give a reproducible local setup path on Apple Silicon. This guide is not a performance benchmark; no MacBook Air M2 run was available while preparing this archive.

## 1. Verify the runtime architecture

Install a currently supported Node.js LTS build for macOS Apple Silicon (arm64), then open a new Terminal window and run:

```bash
node -v
npm -v
node -p 'process.arch'
```

Expected architecture for a native Apple Silicon Node runtime: `arm64`. If this prints `x64`, check whether the Intel Node build is running under Rosetta. The repository CI uses Node.js 24; backend `package.json` declares Node.js `>=22`.

Official reference: <https://nodejs.org/en/about/previous-releases>

## 2. Prepare MongoDB

Choose one of the supported options:

- **MongoDB Atlas:** create a development database, allow your current development IP, create a database user, and put its connection string in `backend/.env` as `MONGODB_URI`.
- **Local MongoDB:** install a MongoDB Community version that supports your macOS release and Apple Silicon, start the service, and use `mongodb://localhost:27017/expense-manager`.

Official MongoDB macOS installation guide: <https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/>

The local backend defaults to port `5001`, and Vite proxies `/api` to that same port. This avoids the port-`5000` AirTunes conflict observed on the Mac used for the project smoke test. If you change `PORT`, update `frontend/vite.config.js`'s proxy target to match.

Do not commit credentials, a real `.env`, database exports, or production data to the project ZIP or repository.

## 3. Install clean dependencies

From the repository root:

```bash
cd backend
npm ci
cd ../frontend
npm ci
```

Use `npm ci` rather than `npm install` for this release verification because it installs from the committed lockfiles and helps reveal lockfile/dependency problems.

## 4. Run verification commands

From the repository root, run each package's checks:

```bash
cd backend
npm test
cd ../frontend
npm test
npm run lint
npm run build
```

Do not mark the release ready if `npm ci`, backend tests, lint, or build fails. The backend has an HTTP regression test for the Express 5 query-sanitizer compatibility bridge; it must pass with real dependencies installed.

## 5. Start and smoke-test the app

1. Configure `backend/.env` from `.env.example`; set a long random `JWT_SECRET`, the correct `MONGODB_URI`, and `CLIENT_ORIGIN=http://localhost:5173` for local development.
2. Run the backend from `backend/` using `npm run dev`.
3. In a second terminal, run the frontend from `frontend/` using `npm run dev`.
4. Open <http://localhost:5173> and verify login, transaction CRUD, categories, budgets, and Statistics with synthetic data.
5. Open <http://localhost:5001/health>; a healthy backend returns JSON with `status: "ok"`.
6. For a phone-browser demo on the same Wi-Fi, use the laptop's LAN IP and allow the Vite port through the local firewall if prompted. The phone cannot use `localhost` to reach the laptop. Do not expose the development server to untrusted networks.

## 6. Verify English / Vietnamese localization

1. Open the sign-in screen and switch between `EN` and `VI`.
2. Sign in and confirm the selected language is still active in the authenticated shell.
3. Refresh the page; the stored browser preference (`pem-language` in `localStorage`) should be restored.
4. Check navigation, form labels/errors, empty states, transaction date headings, budget cards, charts, and confirmation/toast messages.
5. Add a custom category and a transaction note, then switch languages. Custom category names and user-entered notes must remain unchanged; localization must not rewrite MongoDB records.

## 7. What “optimized for M2” means for this app

This is a React/Node/MongoDB web application, not an on-device AI workload. The practical targets are native `arm64` Node, successful clean installs, acceptable browser bundle size, indexed database queries, low enough memory/CPU use for local development, and reliable browser demo behavior. Do not claim an M2-specific performance result without recording measurements on the actual machine.

For an optional lightweight baseline, record:

- `node -v` and `process.arch`;
- whether `npm ci`, tests, lint and build passed;
- approximate build completion time;
- browser developer-tools console errors and network failures during one representative workflow.

These are reproducibility observations, not a formal load/performance benchmark.
