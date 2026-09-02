# crm.estate.fe

Frontend for the Estate CRM, built as a micro-frontend (MFE) architecture.

> **Status:** bootstrapping. The workspace is configured but holds no packages yet —
> `apps/` and `libs/` are empty.

## Stack

- **Node:** 22.23.2 (pinned in `pnpm-workspace.yaml`)
- **Package manager:** pnpm 12.1.0 (pinned in `package.json`; a mismatched version is
  downloaded automatically)
- **Monorepo:** pnpm workspaces, with Nx 23 as the task runner

The framework, the bundler and the MFE composition mechanism are all still to be decided.

## Repository layout

```
crm.estate.fe/
├── apps/                    # deployable micro-frontends — the shell and its remotes
├── libs/                    # shared code the apps consume
├── .vscode/settings.json
├── .gitignore
├── nx.json
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── README.md
```

Both directories are declared in `pnpm-workspace.yaml` and both are empty, so
`nx show projects` returns nothing.

Which directory a package belongs in is decided by deployability: if it ships as a running
frontend it goes in `apps/`, otherwise in `libs/`.

## Task running

`nx.json` sets the defaults every project inherits, rather than repeating them per package:

| Target    | Cached | Depends on | Notes                                        |
| --------- | ------ | ---------- | -------------------------------------------- |
| `build`   | yes    | `^build`   | dependencies build first; output is `dist/`  |
| `preview` | yes    | `build`    | serving a build implies the build exists     |
| `lint`    | yes    | —          | does not need dependencies built             |
| `dev`     | no     | —          | a dev server is long-running, never replayed |

These are defaults waiting for projects — no package defines any of these targets, because
there are no packages.

## Getting started

```bash
pnpm install
```

There is nothing to run yet — no app, no dev server.

## Documentation

- [Setup log](.docs/SETUP.md) — how this repository was built, step by step, and why each
  choice was made.
