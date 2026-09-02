# ChatGPT / Codex Verification Contract

## Standard entrypoint

`npm run verify:agent`

The command runs the repository's existing syntax/data checks followed by the existing Pages build. It does not replace task-specific browser/manual checks.

## Execution rules

1. Read `AGENTS.md`, `task-list.md`, and `NEXT_WORK.md`.
2. Fix and record the verification SHA.
3. Use Node.js 22 or newer and run `npm run verify:agent`.
4. Run any additional checks required by the active task.
5. Skipped, unavailable, or failed checks are not PASS.
6. Re-run affected checks when the SHA changes.
7. GitHub Actions are not verification evidence.

## Evidence

Record verified SHA, commands/results, build result, extra task checks, blockers/unrun checks, and review result in `task-list.md`. Persist raw evidence only when cross-session readback is required.
