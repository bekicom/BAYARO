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

## Windows Installer

Build installer:
- `npm run dist:win`

Output:
- `release/BAYARO Setup 0.1.0.exe`

Send this `.exe` file to the client. It installs BAYARO as a desktop app and uses the live backend:
- `https://bayaro.ataway.uz/api`
