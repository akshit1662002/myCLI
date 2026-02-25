#!/usr/bin/env node

import { cac } from "cac";
import prompts from "prompts";
import { green, cyan } from "kleur/colors";
import { execa } from "execa";
import fs from "fs";
import path from "path";

const cli = cac("mycli");

/* ---------------- HELLO COMMAND ---------------- */
cli
  .command("hello", "Say hello")
  .option("--name <name>", "Your name")
  .action(async (options) => {
    console.log(green("👋 Hello"), cyan(options.name || "World"));
  });

/* ---------------- INIT COMMAND ---------------- */
cli
  .command("init", "Create React + TS project")
  .action(async () => {
    const { projectName } = await prompts({
      type: "text",
      name: "projectName",
      message: "Project name?",
      initial: "my-react-app",
    });

    if (!projectName) {
      console.log("❌ Project name required");
      return;
    }

    console.log(green("🚀 Creating project:"), cyan(projectName));

    /* 1️⃣ Create Vite React + TS */
    await execa("npm", [
      "create",
      "vite@6",  
      projectName,
      "--",
      "--template",
      "react-ts",
    ], { stdio: "inherit" });

    const projectPath = path.join(process.cwd(), projectName);

    /* 2️⃣ Install dependencies */
    console.log(green("📦 Installing dependencies..."));
    await execa("npm", [
      "install",
      "react-router-dom",
      "@reduxjs/toolkit",
      "react-redux",
      "axios",
    ], { cwd: projectPath, stdio: "inherit" });

    // Install @types/node as devDependency for path alias in vite.config.ts
    await execa("npm", [
      "install",
      "-D",
      "@types/node",
    ], { cwd: projectPath, stdio: "inherit" });

    /* 3️⃣ Create folder structure */
    const folders = [
      "src/app",
      "src/api",
      "src/assets",
      "src/components/common",
      "src/components/ui",
      "src/features/auth/api",
      "src/features/auth/pages",
      "src/features/auth/types",
      "src/features/users/api",
      "src/features/users/pages",
      "src/features/users/types",
      "src/hooks",
      "src/layouts",
      "src/routes",
      "src/utils",
      "src/types",
    ];

    folders.forEach((folder) => {
      fs.mkdirSync(path.join(projectPath, folder), { recursive: true });
    });

    /* 4️⃣ Write all boilerplate files */

    // ─── vite.config.ts ───
    fs.writeFileSync(
      path.join(projectPath, "vite.config.ts"),
      `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // @ points to src/ — so @/features/auth = src/features/auth
      '@': path.resolve(__dirname, './src'),
    },
  },
});
`
    );

    // ─── tsconfig.json ───
    fs.writeFileSync(
      path.join(projectPath, "tsconfig.json"),
      `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path alias — @ maps to src/ */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
`
    );

    // ─── src/api/axiosInstance.ts ───
    fs.writeFileSync(
      path.join(projectPath, "src/api/axiosInstance.ts"),
      `// Axios instance with base URL from .env
// Usage: import { axiosInstance } from '@/api/axiosInstance'

import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
`
    );

    // ─── src/app/store.ts ───
    fs.writeFileSync(
      path.join(projectPath, "src/app/store.ts"),
      `// Redux store — add your reducers here
// Usage: import { store } from '@/app/store'

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/auth.slice';
import usersReducer from '@/features/users/users.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
  },
});

// Infer RootState and AppDispatch from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
`
    );

    // ─── src/features/auth/auth.slice.ts ───
    fs.writeFileSync(
      path.join(projectPath, "src/features/auth/auth.slice.ts"),
      `// Auth slice — manages authentication state (user, token, loading, error)
// Add more fields to AuthState as needed

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: null | { id: string; name: string; email: string };
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Call this to manually clear auth state (e.g. on logout)
    logout(state) {
      state.user = null;
      state.token = null;
    },
    // Call this to set error manually if needed
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
  },
});

export const { logout, setError } = authSlice.actions;
export default authSlice.reducer;
`
    );

    // ─── src/features/auth/auth.thunks.ts ───
    fs.writeFileSync(
      path.join(projectPath, "src/features/auth/auth.thunks.ts"),
      `// Auth thunks — async actions for login, register, logout API calls
// Usage: dispatch(loginThunk({ email, password }))

import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/api/axiosInstance';

// Login thunk — POST /auth/login
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      return response.data; // { user, token }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);
`
    );

    // ─── src/features/auth/auth.selectors.ts ───
    fs.writeFileSync(
      path.join(projectPath, "src/features/auth/auth.selectors.ts"),
      `// Auth selectors — read auth state from the Redux store
// Usage: const user = useAppSelector(selectAuthUser)

import { RootState } from '@/app/store';

// Select the current logged-in user
export const selectAuthUser = (state: RootState) => state.auth.user;

// Select the auth token
export const selectAuthToken = (state: RootState) => state.auth.token;

// Select loading state (useful for showing spinners)
export const selectAuthLoading = (state: RootState) => state.auth.loading;

// Select error message
export const selectAuthError = (state: RootState) => state.auth.error;
`
    );

    // ─── src/features/users/users.slice.ts ───
    fs.writeFileSync(
      path.join(projectPath, "src/features/users/users.slice.ts"),
      `// Users slice — manages the list of users state
// Add more fields to UsersState as needed

import { createSlice } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UsersState {
  list: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  list: [],
  loading: false,
  error: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Add custom reducers here
  },
});

export default usersSlice.reducer;
`
    );

    // ─── src/features/users/users.thunks.ts ───
    fs.writeFileSync(
      path.join(projectPath, "src/features/users/users.thunks.ts"),
      `// Users thunks — async actions for fetching/creating/updating users
// Usage: dispatch(fetchUsersThunk())

import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/api/axiosInstance';

// Fetch all users — GET /users
export const fetchUsersThunk = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/users');
      return response.data; // array of users
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);
`
    );

    // ─── src/features/users/users.selectors.ts ───
    fs.writeFileSync(
      path.join(projectPath, "src/features/users/users.selectors.ts"),
      `// Users selectors — read users state from the Redux store
// Usage: const users = useAppSelector(selectAllUsers)

import { RootState } from '@/app/store';

// Select the full list of users
export const selectAllUsers = (state: RootState) => state.users.list;

// Select users loading state
export const selectUsersLoading = (state: RootState) => state.users.loading;

// Select users error message
export const selectUsersError = (state: RootState) => state.users.error;
`
    );

    // ─── src/hooks/useAppDispatch.ts ───
    fs.writeFileSync(
      path.join(projectPath, "src/hooks/useAppDispatch.ts"),
      `// Typed dispatch hook — use this instead of plain useDispatch
// Usage: const dispatch = useAppDispatch()

import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/app/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
`
    );

    // ─── src/hooks/useAppSelector.ts ───
    fs.writeFileSync(
      path.join(projectPath, "src/hooks/useAppSelector.ts"),
      `// Typed selector hook — use this instead of plain useSelector
// Usage: const user = useAppSelector(selectAuthUser)

import { useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState } from '@/app/store';

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
`
    );

    // ─── src/routes/AppRoutes.tsx ───
    fs.writeFileSync(
      path.join(projectPath, "src/routes/AppRoutes.tsx"),
      `// AppRoutes — define all your app routes here
// Usage: <AppRoutes /> inside App.tsx

import { Routes, Route } from 'react-router-dom';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Add your routes here */}
      {/* <Route path="/" element={<HomePage />} /> */}
      {/* <Route path="/login" element={<LoginPage />} /> */}
    </Routes>
  );
};

export default AppRoutes;
`
    );

    // ─── src/App.tsx ───
    fs.writeFileSync(
      path.join(projectPath, "src/App.tsx"),
      `// App.tsx — root component, wraps router and global providers
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '@/routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      {/* Add global layouts, nav, toasts etc. here */}
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
`
    );

    // ─── src/main.tsx (override Vite default to include Redux Provider) ───
    fs.writeFileSync(
      path.join(projectPath, "src/main.tsx"),
      `// Entry point — mounts the React app with Redux Provider
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Redux Provider wraps the whole app so all components can access the store */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
`
    );

    console.log(green("✅ Project setup complete!"));
    console.log(cyan(`👉 cd ${projectName}`));
    console.log(cyan(`👉 npm run dev`));
  });

cli.help();
cli.parse();
