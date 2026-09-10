# crm.estate.fe

Frontend for the Estate CRM, built as a micro-frontend (MFE) architecture.

> **Status:** bootstrapping. The workspace holds one application (`@recrm/shell-host`) and
> one shared library (`@recrm/layout`). Dev server, type-check and production build all
> work; the MFE composition mechanism has not been chosen yet.

## Stack

| Concern         | Choice                                         |
| --------------- | ---------------------------------------------- |
| Runtime         | Node 22.23.2 (pinned in `pnpm-workspace.yaml`) |
| Package manager | pnpm 12.1.0 (pinned in `package.json`)         |
| Monorepo        | pnpm workspaces + Nx 23 as the task runner     |
| Framework       | Vue 3.5                                        |
| Bundler         | Vite 8, wired into Nx via `@nx/vite`           |
| Styling         | SCSS (`sass`)                                  |
| Language        | TypeScript 6, type-checked with `vue-tsc`      |
| Formatting      | Prettier 3 (`semi: false`)                     |

The MFE composition mechanism (Module Federation, native federation, or something else)
has not been decided yet. `@recrm/shell-host` is the future shell; no remotes exist.

## Repository layout

```
crm.estate.fe/
├── apps/                          # deployable micro-frontends
│   └── shell-host/                # @recrm/shell-host — the shell application
│       ├── src/
│       │   ├── app/App.vue        # renders AppLayout from @recrm/layout
│       │   ├── main.ts            # mounts the app on #root
│       │   ├── styles.scss
│       │   └── vue-shims.d.ts
│       ├── index.html
│       ├── vite.config.mts        # dev :4200, preview :4300
│       ├── project.json           # explicit dev + build targets
│       ├── tsconfig.json
│       └── tsconfig.app.json
├── libs/                          # shared code the apps consume
│   └── layout/                    # @recrm/layout
│       ├── src/
│       │   ├── lib/AppLayout.vue  # header + sidebar + content slot
│       │   ├── index.ts
│       │   └── vue-shims.d.ts
│       ├── project.json
│       ├── tsconfig.json
│       └── tsconfig.lib.json
├── nx.json                        # target defaults + @nx/vite plugin
├── package.json                   # root scripts and shared devDependencies
├── pnpm-workspace.yaml            # workspace globs + pinned Node version
├── tsconfig.base.json             # shared compiler options + @recrm/* aliases
├── .prettierrc / .prettierignore
└── pnpm-lock.yaml
```

Which directory a package belongs in is decided by deployability: if it ships as a running
frontend it goes in `apps/`, otherwise in `libs/`.

## Packages

| Package             | Location          | Type        | Purpose                                                  |
| ------------------- | ----------------- | ----------- | -------------------------------------------------------- |
| `@recrm/shell-host` | `apps/shell-host` | application | The shell. Renders `AppLayout` with placeholder content. |
| `@recrm/layout`     | `libs/layout`     | library     | Shared application shell: header, sidebar, content slot. |

## Getting started

```bash
pnpm install
pnpm dev:shell
```

The shell serves on **http://localhost:4200**. If that port is taken, Vite falls back to
the next free one and prints the URL it chose.

## Scripts

Run from the repository root:

| Script             | Command                      | What it does                                    |
| ------------------ | ---------------------------- | ----------------------------------------------- |
| `pnpm graph`       | `nx graph`                   | Opens the interactive project dependency graph. |
| `pnpm dev:shell`   | `nx dev @recrm/shell-host`   | Starts the shell dev server on :4200.           |
| `pnpm build:shell` | `nx build @recrm/shell-host` | Builds the shell to `dist/apps/shell-host`.     |
| `pnpm dev:all`     | `nx run-many -t dev`         | Starts the `dev` target of every project.       |
| `pnpm build:all`   | `nx run-many -t build`       | Builds every project.                           |

## Task running

Targets come from two places.

**`nx.json` target defaults** — inherited by every project, so they are not repeated per
package:

| Target    | Cached | Depends on | Notes                                        |
| --------- | ------ | ---------- | -------------------------------------------- |
| `build`   | yes    | `^build`   | dependencies build first; output is `dist/`  |
| `preview` | no     | `build`    | continuous target — Nx forbids caching these |
| `lint`    | yes    | —          | does not need dependencies built             |
| `dev`     | no     | —          | a dev server is long-running, never replayed |

**`@nx/vite/plugin`** — registered under `plugins` in `nx.json`, it infers targets for any
project holding a `vite.config.*`: `build`, `dev`, `serve`, `preview`, `serve-static`,
`typecheck`, `build-deps` and `watch-deps`. `apps/shell-host/project.json` additionally
declares `dev` and `build` explicitly, which take precedence. `@recrm/layout` has no Vite
config and declares no targets, so it contributes nothing runnable.

To see what a project actually resolves to:

```bash
pnpm exec nx show project @recrm/shell-host --web
```

## Build output

`pnpm build:shell` writes to `dist/apps/shell-host`:

```
dist/apps/shell-host/
├── index.html
├── shell-host.js              # entry — fixed name, no content hash
└── assets/index-<hash>.css
```

`apps/shell-host/vite.config.mts` pins the entry filename through
`build.rolldownOptions.output.entryFileNames` and emits ES modules targeting `es2022`. The
unhashed, predictable filename is what a host needs to load a remote at a stable URL, so
this is the shape an MFE remote entry takes — even though no federation plugin is wired up
yet. CSS keeps its content hash, since nothing loads it by name.

## Path aliases

Workspace packages are imported by name, resolved through `tsconfig.base.json`:

```ts
import { AppLayout } from "@recrm/layout"
```

| Alias           | Resolves to                |
| --------------- | -------------------------- |
| `@recrm/layout` | `libs/layout/src/index.ts` |

`apps/shell-host/vite.config.mts` sets `resolve: { tsconfigPaths: true }`, so the bundler
honours the same aliases without repeating them.

Importing a library across package boundaries also requires the consuming app's
`tsconfig.app.json` to set `"rootDir": "../../"`. Without it `vue-tsc` rejects the import
with `TS6059: … is not under 'rootDir'`, because the library's sources sit outside the app
directory. `apps/shell-host` already does this.

## Known issues

The repository is mid-bootstrap. These are known and not yet fixed:

1. **The Nx Vite executors are deprecated.** `apps/shell-host/project.json` calls
   `@nx/vite:dev-server` and `@nx/vite:build` directly; Nx removes both in v24 and warns on
   every run. `@nx/vite/plugin` is already registered in `nx.json` and infers equivalent
   targets — migrate with `nx g @nx/vite:convert-to-inferred` and drop the explicit block.

2. **No linting is configured.** `nx.json` defines a `lint` target default, but no project
   provides a `lint` target and no ESLint config exists.

3. **No tests.** There is no test runner — Vitest is not in `devDependencies` and no spec
   files exist.

4. **`@recrm/layout` has no targets.** It has no Vite config and declares `"targets": {}`,
   so it is never built or type-checked on its own; it is only compiled as part of an app
   that imports it.

## Conventions

- Prettier owns formatting — no semicolons. Run `pnpm exec prettier --write .` before
  committing.
- Commit messages follow Conventional Commits; `.vscode/settings.json` seeds the `repo`
  scope.
- Never commit secrets. `.env` files are git-ignored; `.env.example` is the tracked
  template.
