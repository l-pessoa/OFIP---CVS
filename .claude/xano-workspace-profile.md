---
workspace: lucas's Workspace
workspace_id: 163423
instance: x8ki-letl-twmt.n7.xano.io
cli_profile: default
generated: 2026-09-28
---

# Xano Development Playbook: lucas's Workspace

## Quick Reference

| Key | Value |
|-----|-------|
| Workspace ID | 163423 |
| Instance | x8ki-letl-twmt.n7.xano.io (Free Instance) |
| CLI Profile | `default` |
| App Status | In active development (not yet live) |
| Branch | single/live branch (no dev branch on Free plan) |
| Deploy Method | `workspace push` (sandbox workflow is **not available on the Free plan** — confirmed via `xano sandbox get` → "Access Denied. Not supported with Free plan.") |
| Data Source | single (no test/live split set up) |
| Local copy | `~/OFIP-&-CVS/backend-xano` (git-initialized) |

## Development Rules

1. There's no sandbox isolation on this plan — `workspace push` changes (including schema) hit the real database immediately. Review the push preview output before confirming.
2. Always pull before editing (`xano workspace pull -d ./backend-xano --workspace 163423`) to avoid clobbering changes made via the Xano UI.
3. Edit `.xs` files locally, then push with `xano workspace push --workspace 163423 --force` (non-interactive; `--force` is required since there's no TTY for the confirmation prompt).
4. Table reference fields use `int field_name? { table = "target_table" }` inside `schema { }` — not `dbtable` (confirmed by reading `table/event_log.xs`, a real example already in this workspace).
5. Don't touch `table/user.xs`, `table/recado.xs`, `table/album.xs`, `table/event_log.xs`, or their APIs — pre-existing tutorial/test data unrelated to this project (Petrus/Coral).
6. Solo-ish team (Lucas + Vini) — no branching/PR process needed yet at this stage.
7. The Xano Developer MCP (`claude mcp add xano ...`) was registered this session but needs a Claude Code restart to actually load its tools (docs/validation) — until then, keep using the CLI directly.

## How to Deploy Changes

1. `cd "~/OFIP-&-CVS/backend-xano"`
2. `xano workspace pull --workspace 163423` (refresh local copy)
3. Edit the relevant `.xs` file(s)
4. `xano workspace push --workspace 163423` (review the preview — table/schema changes are called out explicitly)
5. `xano workspace push --workspace 163423 --force` (confirm, since this environment has no interactive TTY)
6. `git add -A && git commit -m "..."` in `backend-xano/` to keep history of backend changes

## No-Go Zones

- **Tables:** `user`, `recado`, `album`, `event_log` (pre-existing, unrelated to this project)
- **Endpoints/Functions:** anything outside the `catalogo` API group and `hino`/`parte` tables
- **Env Vars:** none set yet

## Troubleshooting

- `workspace push` refused non-interactively → add `--force` (this is expected on this environment, not a sign of a real problem — always read the preview first).
- Sandbox commands (`xano sandbox *`) will always fail here — Free plan doesn't support them. Don't try to use the sandbox workflow on this project.
