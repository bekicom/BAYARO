# BAYARO Frontend

## Vercel

Project settings:
- `Root Directory`: `reactsklad`

Framework:
- `Vite`

Install command:
- `npm ci`

Build command:
- `npm run build`

Output directory:
- `dist`

Environment variables:
- `VITE_API_BASE_URL=https://bayaro.ataway.uz/api`

Notes:
- `vercel.json` already includes SPA rewrites for React Router.
- The backend must stay available at `https://bayaro.ataway.uz/api`.
- PWA install is enabled with `manifest.webmanifest` and `sw.js`.
- After deploy, Chrome can install it from the address bar install icon or the sidebar `Ilovani o'rnatish` button.
