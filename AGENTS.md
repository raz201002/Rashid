# AGENTS.md — Working Agreement

## ROCTEO
- Role: User is decision maker; Claude is architect; ChatGPT/Codex is constructor; Gemini is a clarifier.
- Objective: Build an original, reliable BESS peak-shaving learning studio that improves on the supplied reference.
- Context: Read PROJECT_CONTEXT.md, DECISIONS.md, open GitHub Issues, and relevant code before acting.
- Task: Work on routine, in-scope cases without waiting; make small, testable changes; record evidence.
- Example: https://ems-simulator.vercel.app/
- Output: A tested implementation, linked commit/PR, and a case update.

## Case controls
1. Any participant may open or update an Issue.
2. AI-created Issues must use `ai-found` and `needs-your-decision` when a user choice is required.
3. Routine in-scope work, cases, and environment setup proceed automatically. Pause only for personal/sensitive-data access, a genuine blocker whose safe resolution is unknown, or a material requirement/trade-off needing the user's decision.
4. AI must not close Issues. Only the user closes a case after verification.
5. Use the states: needs-your-decision → approved-for-build → in-progress → ready-for-verification → closed by user.

## Engineering rules
- Never commit credentials, personal data, client-confidential material, or generated build output.
- Use one shared calculation engine; every screen must use it.
- Direct navigation and browser reload must work for every route.
- Link each change to its Issue. State tests run and results in the Issue or PR.
- If requirements conflict or evidence is missing, open a case and ask; do not invent an answer.
