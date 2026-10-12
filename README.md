# crm.estate.fe

Frontend for the Estate CRM, built as micro-frontends: **single-spa** composes independently
built Vue apps at runtime, and a native browser **import map** tells the page where each app
and each shared library lives.

## Stack

| Concern         | Choice                                          |
| --------------- | ----------------------------------------------- |
| Runtime         | Node 22.23.2 (pinned in `pnpm-workspace.yaml`)  |
| Package manager | pnpm 12.1.0 (pinned in `package.json`)          |
| Monorepo        | pnpm workspaces + Nx 23 as the task runner      |
| Composition     | single-spa 6 + native import maps               |
| Framework       | Vue 3.5, ant-design-vue 4                       |
| Bundler         | Vite 8 (Rolldown), wired into Nx via `@nx/vite` |
| Styling         | Tailwind CSS 4 + SCSS                           |
| Language        | TypeScript 6, type-checked with `vue-tsc`       |

## Layout

```
crm.estate.fe/
├── apps/
│   ├── root-config/   # the page the browser opens: import map, page layout, single-spa start
│   ├── shell-host/    # header, sidebar and the page-layout CSS
│   └── leads/         # first child app
├── libs/
│   └── styles/        # @recrm/styles — shared theme variables
├── mfe.config.mjs     # MFE_MODULES, SHARED_RUNTIME and the shared Vite config
└── nx.json
```

`apps/` holds what ships as a running frontend, `libs/` holds code the apps consume.

## How the pieces fit

- **`MFE_MODULES`** (`mfe.config.mjs`) lists every app loaded through the import map, with its
  dev port. In dev the map points at each app's own Vite server
  (`http://localhost:4202/src/main.ts`); in a build it points at
  `/mfe/<name>/<version>/<name>.js`.
- **`SHARED_RUNTIME`** lists the libraries every app shares — Vue, vue-router, single-spa,
  ant-design-vue. Apps keep them external; root-config serves them from `node_modules` in dev
  and writes them to `dist/vendor/<pkg>@<version>/` in a build, together with `importmap.json`.
- **`microfrontend-layout.html`** (`apps/root-config/src`) is the single-spa-layout template:
  it places each app on the page and decides which routes mount it. root-config registers
  every app from it.
- **Child apps** (`shell-host`, `leads`) are libraries, not pages: their entry exports
  single-spa lifecycles. Each `vite.config.mts` is one call to `mfeViteConfig`, which derives
  ports and output file names from the folder name.

## Getting started

```bash
pnpm install
pnpm dev:all
```

Open **http://localhost:4200**. Ports are fixed (`strictPort`) because the dev import map
addresses each app by port:

| App         | Dev  | Preview |
| ----------- | ---- | ------- |
| root-config | 4200 | 4300    |
| shell-host  | 4201 | 4301    |
| leads       | 4202 | 4302    |

## Scripts

| Script             | What it does                                         |
| ------------------ | ---------------------------------------------------- |
| `pnpm dev:all`     | Starts every app's dev server.                       |
| `pnpm build:all`   | Builds every app into `apps/<app>/dist`.             |
| `pnpm dev:shell`   | Starts only the shell (useless without root-config). |
| `pnpm build:shell` | Builds only the shell.                               |
| `pnpm graph`       | Opens the Nx project graph.                          |

Type-check with `pnpm exec nx run-many -t typecheck`.

## Adding a child app

1. Create `apps/<name>/` with a `package.json` named `@recrm/<name>` — the folder name must
   match, since the Vite config and the import map derive file names from it.
2. Add `vite.config.mts`: `export default defineConfig(mfeViteConfig(import.meta.dirname))`.
3. Export single-spa lifecycles from `src/main.ts` (copy `apps/leads`).
4. Add `{ module: "@recrm/<name>", port: <next port> }` to `MFE_MODULES`.
5. Add a `<route>` with an `<application name="@recrm/<name>">` to
   `apps/root-config/src/microfrontend-layout.html` — write the closing tag, never `<application />`.

## Nx caching

Builds are cached. Besides each project's own files, `nx.json` marks `mfe.config.mjs`,
`pnpm-lock.yaml` and `tsconfig.base.json` as shared inputs, because every build reads them —
change one and all apps rebuild.

## Conventions

- Prettier owns formatting — no semicolons.
- Commit messages follow Conventional Commits.
- Never commit secrets. `.env` files are git-ignored; `.env.example` is the tracked template.
