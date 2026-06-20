## Goal

Stop the dashboard sidebar and top header from rendering on the public pages (`/` landing and `/login`). Keep them on all authenticated app routes (`/dashboard`, `/products`, `/deals`, etc.).

## Approach

The root route (`src/routes/__root.tsx`) currently always renders the sidebar + header chrome around `<Outlet />`. We'll make that chrome conditional on the current pathname so public routes render bare.

### Change: `src/routes/__root.tsx`

- Read `location.pathname` (already available via `useLocation()`).
- Define `const isPublicRoute = pathname === "/" || pathname.startsWith("/login");`
- When `isPublicRoute` is true, return a minimal shell:
  ```
  <GlobalStoreProvider>
    <Outlet />
    <CookieConsentBanner />
    <UniversalInAppHelpDrawer />
    <ClientErrorConsole />
  </GlobalStoreProvider>
  ```
- Otherwise return the existing sidebar + header + `<Outlet />` layout unchanged.
- Skip the `getMe()` user fetch on public routes (no point hitting the auth endpoint before login).

No other files need to change. Route definitions, the login page, and the landing page all stay as-is — they'll just render without the app chrome around them.

## Verification

1. Headless Chromium check:
   - `GET /login` → renders only the login form (no "Dashboard / My Products / Deal Hub" sidebar text in body).
   - `GET /` → renders only the landing hero (no sidebar).
   - `GET /dashboard` → still renders sidebar + header + dashboard content.
2. Screenshot each of the three to confirm visually.
3. Confirm no new console errors.
