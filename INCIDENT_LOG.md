# Incident Log

This is the durable engineering record for anything that can affect quality, project flow, or timeline. Every entry remains here after resolution so the team can learn from it. GitHub Issues remain the user-controlled case record; only the user closes a case.

| ID | Date | Category | Case | Impact | Root cause | Corrective action | Verification | Status |
|---|---|---|---|---|---|---|---|---|
| ENV-001 | 2026-09-03 | Environment | #1 | Local build work could not start. | The runtime Git installation lacked the HTTPS remote helper; Node/npm were not on the usable tool path. | Installed/repaired Node.js/npm and full Git HTTPS support. | `node --version`, `npm --version`, HTTPS clone, commit, and push succeeded. | Resolved |
| ENV-002 | 2026-09-03 | Environment | #1 | Dependency installation and repository commands could not write safely after cloning. | The installer and sandbox ran under different Windows identities, triggering Git ownership protection and folder-write restrictions. | Scoped Git safe-directory usage to the cloned repository and granted the workspace write access. | `npm install`, Git branch creation, commits, and pushes succeeded. | Resolved |
| QA-001 | 2026-09-04 | Code quality | #1 | Lint blocked the dispatch-chart update. | The session-restoration effect synchronously set state; a home navigation used a plain anchor. | Deferred restoration through a timer and used Next.js `Link`. | `npm run lint` passed. | Resolved |
| QA-002 | 2026-09-04 | Code quality | #1 | Production build blocked after chart work. | Recharts tooltip formatter declared a narrower value type than the library accepts. | Made the formatter safely handle an optional numeric value. | `npm run build` completed with exit code 0. | Resolved |
| CI-001 | 2026-09-04 | CI / verification | #1 | GitHub Actions failed: no tests were available to run; subsequent build was skipped. | A Python-oriented `lib/` ignore pattern unintentionally ignored `src/lib`, which contains the shared engine and Vitest test. | Anchored the ignore rule to `/lib/` and committed `src/lib` explicitly. | Local lint, test, and build were run; repaired commit `f6bf689` was pushed to trigger GitHub Actions again. | Monitoring |

## Entry rules

1. Log a discovered problem immediately, even when a fix is available.
2. Keep the entry after a fix; change only its status and verification evidence.
3. Use `Monitoring` until the relevant external verification (for example CI) succeeds.
4. Open or update the associated GitHub case when the problem changes scope, timeline, requirements, or needs a user decision. The user alone closes cases.
