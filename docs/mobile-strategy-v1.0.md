# Mobile Strategy Baseline v1.0

**Status:** implemented
**Decision:** Progressive Web App (PWA). Capacitor and React Native evaluated and rejected for now.

---

## 1. Decision

The app is delivered as an installable PWA. No native shell, no rewrite, no
change to the React application's architecture, and no change to the backend.

## 2. Evaluation

| Criterion | PWA | Capacitor | React Native rewrite |
|---|---|---|---|
| Development effort | Config + assets only | Native toolchains, build/signing pipeline | Full UI rewrite |
| Code reuse | 100% of existing React | ~100% of React, plus a native shell to maintain | ~0% of UI; only the backend survives |
| Android support | Installable, near-native | Play Store distribution | Play Store distribution |
| iOS support | Add to Home Screen; no App Store, no push | App Store distribution | App Store distribution |
| Offline | App shell only (see §4) | Same, plus native storage | Same, plus native storage |
| Native APIs | Limited (camera/files via web APIs) | Full plugin access | Full access |
| Maintainability | One codebase, one deploy | Three build targets, two store review processes | Two entire frontends |
| Solo-student fit | Strong | Weak — store accounts, certificates, device testing | Very weak |

**Why PWA:** it is the only option that satisfies "maximum reuse, minimum
rewrite" literally — the existing React app *is* the mobile app. Everything
requested under mobile behaviour (installability, standalone launch, safe
areas, touch, mobile forms) is achievable without native code.

**Why not Capacitor (yet):** it is the correct *next* step, not this step. It
would be justified by a concrete requirement this project does not currently
have — App Store distribution, push notifications, biometric unlock. Adopting
it now would add native build toolchains, signing certificates and two store
review processes to maintain, for no user-visible gain. Because Capacitor
wraps this same React build, **choosing PWA now does not foreclose it** — the
migration remains open and cheap.

**Why not React Native:** it discards the entire working frontend and produces
two UIs to keep in sync. Nothing here justifies that cost. The backend would be
the only reusable part, and it is already reusable by every option above.

## 3. What was implemented

- `vite-plugin-pwa` (`generateSW` mode) wired into the existing Vite build
- Web app manifest: standalone display, portrait, brand theme/background colours
- Icon set generated from the existing brand ink colour: 192, 512, maskable 512,
  Apple touch icon, favicon
- iOS standalone meta tags (iOS ignores the manifest for launch behaviour)
- Service worker precaching the app shell, with `autoUpdate`
- `interactive-widget=resizes-content` so the on-screen keyboard shrinks the
  layout instead of covering focused inputs
- Offline banner (`OfflineBanner.jsx`) driven by `useOnlineStatus`
- Global CSS: no horizontal overflow, no tap-highlight flash, contained
  overscroll, and 16px form controls on phones to stop iOS focus-zoom

## 4. Offline policy — deliberately narrow

**The app shell is cached. Financial data is not. Writes are never queued.**

- All `/api` traffic is `NetworkOnly` in the service worker.
- `navigateFallbackDenylist` keeps `/api` from ever being answered with the
  HTML shell.
- No background sync, no write replay, no optimistic local persistence.

This is a correctness decision, not an unfinished feature. A queued transaction
replayed later can double-post, or overwrite server state that changed in the
meantime. Showing a cached balance that is hours stale is worse than showing an
honest error. Offline therefore means: the app opens and navigates, and tells
you plainly that figures cannot be loaded or saved.

**Do not add offline write queuing without a conflict-resolution design and a
server-side idempotency mechanism.** Neither exists today.

## 5. Deployment requirements

Installability depends on the host, not the code:

1. **HTTPS is mandatory.** Service workers do not register over plain HTTP
   (`localhost` is exempt for development).
2. **SPA history fallback.** The host must serve `index.html` for unknown
   paths, or a hard refresh on `/transactions` 404s. The service worker's
   `navigateFallback` covers repeat visits only — the first load still needs
   correct server config.
3. **Do not cache `index.html` at the CDN/proxy layer**, or clients can be
   pinned to a stale shell.
4. Serve the frontend and `/api` on the same origin, or keep `CLIENT_ORIGIN`
   correct for CORS. The service worker's `/api` rule matches by path.

## 6. Authentication and finalization note

The mobile/PWA approach does not require a backend rewrite or API contract
change. The JWT continues to live in `localStorage` and is attached by the
Axios interceptor; the service worker never reads, caches, or intercepts it.

A separate release-hardening change limits password-reset URL logging to
`NODE_ENV=development`. If SMTP is absent outside development, the reset token
is not logged; a deployed environment must configure SMTP for email delivery.
See `final-review-and-demo-checklist.md` for the test and demo checklist.
