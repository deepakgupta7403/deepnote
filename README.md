# deepnote

> A quiet, local-first productivity workspace for tasks, notes, and checklists.
> 100% frontend. No backend, no database, no login. Your data lives in your browser.

Built with **React + Vite**, **Tailwind CSS**, **React Router**, **React Icons**, and **dnd-kit**.
Designed to deploy to **GitHub Pages** in two commands.

---

## ✨ Features

- 📊 **Dashboard** — greeting, KPI tiles, upcoming tasks, recent activity
- ✅ **Tasks** — add, edit, delete, complete, due dates, priorities, color labels, search, filter, drag-and-drop ordering
- 📝 **Notes** — create, edit, delete, search, auto-save (debounced)
- ☑️ **Checklists** — create checklists, add/edit/delete items, mark items done, rename titles
- 🌗 **Dark / light mode** with system-preference detection
- 🎨 **Modern minimal UI** — glassmorphism touches, serif display type, soft motion
- 📱 **Fully responsive** — mobile sidebar, two-pane editor, touch-friendly
- 🔔 **Toast notifications** for every action
- 🗑️ **Confirmation modals** before destructive actions
- 💾 **Local persistence** via `localStorage` — survives refreshes
- ⬆️⬇️ **Export / Import** your data as JSON
- 🧹 **Clear all data** with a single click

---

## 🧱 Tech stack

| Layer | Library |
|---|---|
| Build | Vite 5 |
| UI | React 18 + Tailwind CSS 3 |
| Routing | React Router 6 (HashRouter for GH Pages) |
| Icons | React Icons (Feather + RX) |
| Drag & drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| State | React Context API + custom hooks |
| Storage | `localStorage` (via `useLocalStorage`) |
| Deployment | `gh-pages` |

---

## 📁 Project structure

```
deepnote/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── layout/        # Sidebar, Topbar, Layout
│   │   ├── ui/            # Modal, ConfirmDialog, EmptyState, StatCard
│   │   ├── tasks/         # TaskItem, TaskForm
│   │   ├── notes/         # NoteCard, NoteEditor
│   │   └── checklists/    # ChecklistCard
│   ├── context/           # ThemeContext, ToastContext, AppContext
│   ├── hooks/             # useLocalStorage, useDebounce
│   ├── pages/             # Dashboard, Tasks, Notes, Checklists, Settings
│   ├── utils/             # storage.js, helpers.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── package.json
└── README.md
```

---

## 🚀 Getting started

### 1. Prerequisites

- **Node.js 18+** and **npm 9+**

```bash
node -v
npm -v
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

The app will be available at **http://localhost:5173**.

### 4. Build for production

```bash
npm run build
```

Output goes to `dist/`.

### 5. Preview the production build

```bash
npm run preview
```

---

## 🌐 Deploy to GitHub Pages

deepnote ships with everything wired up for GitHub Pages.

### Step 1 — Set your `base` path in `vite.config.js`

Open `vite.config.js` and replace `/deepnote/` with your repository name:

```js
export default defineConfig({
  plugins: [react()],
  base: '/YOUR_REPO_NAME/',
})
```

### Step 2 — Set the `homepage` field in `package.json`

```json
"homepage": "https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME"
```

### Step 3 — Create the repo on GitHub

Create a new empty repository on GitHub (no README, no `.gitignore` — we have ours).

### Step 4 — Initialize Git locally and push

```bash
git init
git add .
git commit -m "feat: initial commit — deepnote"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 5 — Deploy

```bash
npm run deploy
```

This runs `npm run build` (`predeploy`) and then pushes `dist/` to a `gh-pages` branch.

### Step 6 — Enable GitHub Pages

1. Open your repo on GitHub
2. Go to **Settings → Pages**
3. Under **Build and deployment**, set:
   - **Source:** *Deploy from a branch*
   - **Branch:** `gh-pages` / `(root)`
4. Save.

Wait ~1 minute, then visit:

```
https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME
```

🎉 You’re live.

---

## 📦 npm scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server at `localhost:5173` |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run predeploy` | Auto-runs `build` before `deploy` |
| `npm run deploy` | Publish `dist/` to the `gh-pages` branch |

---

## 🧯 Troubleshooting

### Blank page on GitHub Pages

You almost certainly need to fix the `base` in `vite.config.js`. It must match your repo name exactly, with a leading **and** trailing slash:

```js
base: '/my-repo-name/',
```

Then rebuild and redeploy:

```bash
npm run deploy
```

### Refreshing a route gives 404

deepnote uses **HashRouter** (URLs look like `/#/tasks`) precisely to avoid this. If you switched to `BrowserRouter`, GitHub Pages won’t handle the nested routes and you’ll get 404s on refresh. Switch back to `HashRouter` in `src/main.jsx`.

### `gh-pages` command not found

Re-install dependencies:

```bash
npm install
```

### Assets (CSS, fonts) 404 on GitHub Pages

Same root cause as the blank page: the `base` path in `vite.config.js` doesn’t match your repo URL.

### Cache showing stale UI after deploy

GitHub Pages caches aggressively. Hard refresh: **Cmd/Ctrl + Shift + R**. Or wait a couple of minutes.

### LocalStorage data gone after deploying

LocalStorage is **per-origin**. Your `localhost:5173` data lives at a different origin from `username.github.io`, so they don't share. Use **Export JSON → Import JSON** in Settings to migrate.

### Build fails with `gh-pages` permission error

Make sure your local git is authenticated with GitHub (try `git push` once first). On private repos, GitHub Pages requires a paid plan.

---

## 💡 Future feature ideas

- 🔁 **Recurring tasks** (daily, weekly, monthly)
- ⏰ **Browser notifications** for due tasks
- 🏷️ **Custom tags** with per-tag filtering across all sections
- 📂 **Folders / projects** to group notes, tasks, and checklists
- 🔍 **Global command palette** (⌘K) for quick navigation & search
- 📝 **Markdown rendering** in notes (with live preview)
- 🎯 **Pomodoro timer** integrated with tasks
- 📅 **Calendar view** for tasks with due dates
- 🌍 **IndexedDB** migration for larger payloads (attachments, images)
- ☁️ **Optional cloud sync** via WebDAV / encrypted gist
- 🔒 **Local passphrase lock** that encrypts data with the Web Crypto API
- 🌐 **i18n / multi-language support**
- 🎨 **Theme presets** (sepia, high-contrast, etc.)
- 📲 **PWA / offline-first** support with a service worker

---

## 📄 License

MIT — do anything you like.
