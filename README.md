# lynx_main

The frontend for Lynx Panel. A React + TypeScript single-page application for managing LXC servers, nodes, allocations, and users.

---

## Stack

- React 19, TypeScript, Vite 7
- TanStack Router (client-side routing)
- TanStack Query (server state)
- Tailwind CSS v4, shadcn/ui, Radix UI
- React Hook Form + Zod
- xterm.js (in-browser terminal)
- Recharts (live metric charts)

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/               Login and register pages
│   └── (dashboard)/
│       ├── admin/            Admin area (nodes, allocations, users, servers)
│       └── panel/            User server panel (general, terminal, network,
│                             backups, schedules, permissions, logs)
├── components/
│   ├── app/                  Shared app-level components (layout, terminal)
│   └── ui/                   shadcn/ui component library
├── db/
│   ├── api/                  API call functions (auth, node, server, allocation, user)
│   └── queries/              TanStack Query hooks
├── hooks/                    Shared hooks (WebSocket, resources, token, mobile)
├── http/                     Axios/xior HTTP client setup
├── middleware/               Route-level auth guard
├── routes/                   Router definition and route trees
├── types/                    Global and domain types
└── validators/               Zod schemas for all forms
```

---

## Environment Variables

```env
VITE_BACKEND_BASE_URL="http://localhost:5000"
VITE_BRAND_NAME="Lynx Panel"
VITE_TOKEN_NAME="token"
VITE_API_KEY="encrypted-api-key"
```

---

## Development

```bash
npm install
npm run dev
```

---

## Production Build

```bash
npm run build
```

Output is written to `dist/`. Serve with any static file host or the included PM2 config:

```bash
npm run preview
```

---

## PM2

An `ecosystem.config.cjs` is included for PM2 deployments.

```bash
pm2 start ecosystem.config.cjs
```
