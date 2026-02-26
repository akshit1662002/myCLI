# mycliakki100 🚀

> Scaffold a production-ready **React + TypeScript** project in under 60 seconds.

[![npm version](https://img.shields.io/npm/v/mycliakki100.svg)](https://www.npmjs.com/package/mycliakki100)
[![npm downloads](https://img.shields.io/npm/dm/mycliakki100.svg)](https://www.npmjs.com/package/mycliakki100)
[![license](https://img.shields.io/npm/l/mycliakki100.svg)](https://github.com/akshit1662002/myCLI/blob/master/LICENSE)

---

## Demo

[![asciicast](https://asciinema.org/a/YOUR_ASCIINEMA_ID.svg)](https://asciinema.org/a/YOUR_ASCIINEMA_ID)

---

## What Gets Set Up Automatically

- ⚡ **Vite + React + TypeScript** — latest stable version
- 🗂️ **Feature-based folder structure** — `auth`, `users` with slice, thunks, selectors
- 🔄 **Redux Toolkit** — pre-configured store, typed hooks
- 🌐 **Axios instance** — reads `VITE_API_BASE_URL` from `.env`
- 🔗 **`@/` path alias** — configured in both `vite.config.ts` and `tsconfig.json`
- 🪝 **Typed Redux hooks** — `useAppDispatch` and `useAppSelector` ready to use
- 🛣️ **React Router v6** — `AppRoutes.tsx` scaffold with commented examples

---

## Install

```bash
npm install -g mycliakki100
```

## Usage

```bash
mycliakki100 init
```

Follow the prompt → enter your project name → everything scaffolds automatically!

```bash
cd your-project-name
npm run dev
```

---

## Generated Folder Structure

```
src/
├── app/
│   └── store.ts                  # Redux store
├── api/
│   └── axiosInstance.ts          # Axios with base URL
├── components/
│   ├── common/
│   └── ui/
├── features/
│   ├── auth/
│   │   ├── auth.slice.ts         # Redux slice
│   │   ├── auth.thunks.ts        # Async thunks
│   │   ├── auth.selectors.ts     # Selectors
│   │   ├── api/
│   │   ├── pages/
│   │   └── types/
│   └── users/
│       ├── users.slice.ts
│       ├── users.thunks.ts
│       ├── users.selectors.ts
│       ├── api/
│       ├── pages/
│       └── types/
├── hooks/
│   ├── useAppDispatch.ts         # Typed dispatch hook
│   └── useAppSelector.ts         # Typed selector hook
├── layouts/
├── routes/
│   └── AppRoutes.tsx             # React Router setup
├── utils/
├── types/
├── App.tsx
└── main.tsx                      # Redux Provider wrapped
```

---

## Tech Stack

| Tool | Version |
|---|---|
| React | 18+ |
| TypeScript | 5+ |
| Vite | 6 (stable) |
| Redux Toolkit | latest |
| React Router | v6 |
| Axios | latest |

---

## Author

Made with ❤️ by [Akshit Tyagi](https://github.com/akshit1662002)
