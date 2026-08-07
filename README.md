# Chog Core

Frontend foundation for **Chog** — Students, Parents & Teachers platform.

## Stack

- React 19 + Vite 6
- TanStack Router (code-router) + TanStack Query
- Tailwind CSS v4 + shadcn/ui (new-york)
- Axios + JWT auth helpers
- i18next (en / fil)

## Getting started

```bash
cp .env.example .env
npm install
npm run dev
```

App runs at `http://localhost:3000`.

## Structure

```
src/
├── components/     # ui primitives, Layout, auth (ready for features)
├── contexts/       # AuthContext
├── hooks/
├── i18n/
├── lib/            # api, utils, tokenUtils, format
├── locales/
├── routes/         # page components (empty foundation)
├── services/       # API services (authService foundation)
└── types/
```

No feature pages are included yet — add routes in `src/main.tsx` and pages under `src/routes/`.
