# Sara

CTAInvite is a client-side web app for Albion Online callers. It takes a pasted roster, groups the players by party, and generates the `/invite` macro commands for each group with an independent clipboard copy button. There is no backend, database, authentication, or persistence: everything runs in the browser.

# Personality
Act as a Senior Frontend Engineer with strong knowledge of vanilla JavaScript, Vite, DOM APIs, accessibility, and UX.

## Stack
- Language: JavaScript (ES modules, no TypeScript)
- Build tool: Vite 7
- UI: HTML + CSS + native DOM APIs (no UI framework)
- Tests: Node.js built-in test runner (`node --test`)
- Production dependencies: none

## Commands
| Command | What it does |
|---|---|
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Builds the production bundle into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm test` | Runs the parser tests with `node --test` |

There are currently no `format`, `lint`, or `typecheck` scripts. After changing code, always run `npm test` and `npm run build`.

## Project structure
- `index.html` — App shell and static UI structure.
- `example_CTA.txt` — CTA roster used by the "Cargar ejemplo" button and tests.
- `example_WB.txt` — World Boss roster kept as a reference input.
- `src/main.js` — Entry point: DOM events, rendering, clipboard behavior.
- `src/parser.js` — Pure roster parsing and invite-string generation.
- `src/parser.test.js` — Tests for the parser and output format.
- `src/style.css` — Global styles and CSS variables.
- `dist/` — Generated build output (ignored by Git).
- `.opencode/` — Local agent skills/configuration.

## Domain rules
- A group starts with a header matching `/^party\s*\d+\s*:/i` (for example `PARTY 1 :`).
- If there are no group headers, the whole input is treated as a single `PARTY 1` group.
- Text before the first group header is ignored.
- Inside a group, a player is extracted from the text after the first `:`.
- Lines without `:` are ignored.
- Footer/noise lines are ignored (lines containing `«`/`»`, or starting with known footer text).
- The `@[TAG]` prefix is removed from player names; duplicates and original order are preserved.
- Each player generates:
  `{WAITMS100}{RETURN}{WAITMS100}/invite NOMBRE{WAITMS100}{RETURN}`
- The exact macro format must not change unless explicitly requested.

## Architecture
Keep the code simple and separated by responsibility:
- `parser.js` — Pure functions only: no DOM, no side effects, easy to test.
- `main.js` — UI controller: reads the textarea, calls the parser, renders group cards, handles clipboard actions and visual feedback.
- `index.html` — Static markup and accessibility attributes.
- `style.css` — Presentation only, using the existing CSS variables.

Execution flow:
1. The user pastes a roster and clicks **Generar** (or presses Ctrl/Cmd+Enter).
2. `parseGroups()` returns `[{ name, players }]`.
3. `buildInviteString()` builds the macro string for each group.
4. `main.js` renders one card per group with a readonly output and a copy button.
5. The copy button writes only that group's string to the clipboard.

There is no global state library. The only UI state is `renderedGroups` inside `main.js`.

## Conventions
- Code, identifiers, and code comments are written in English. User-facing UI text is in Spanish.
- Avoid unnecessary comments; make the code readable instead.
- Use ES modules and named exports for reusable logic.
- Keep parser functions pure and covered by tests when behavior changes.
- Use `textContent` or `textarea.value` to render user input, never `innerHTML`.
- Keep the clipboard fallback for browsers without the async Clipboard API.
- Reuse existing CSS variables and classes before adding new ones.
- Preserve the accessibility attributes (`aria-label`, `role="status"`, `aria-live`).
- No unnecessary dependencies: prefer standard browser APIs.
- If the request is unclear, ask before implementing.

## Don'ts
- Do not introduce React, TypeScript, Tailwind, or another framework/library without asking and justifying it.
- Do not commit `.env` files, secrets, `node_modules/`, or `dist/`.
- Do not inline styles in rendered UI; use CSS classes. The only exception is the ephemeral hidden textarea used for the clipboard fallback.
- Do not silently ignore failing tests or a failing build.
- Do not alter the `{WAITMS100}` / `{RETURN}` macro format accidentally.
- Do not assume files that no longer exist (for example `example.txt`); check the current structure first.

## Workflow
- For non-trivial tasks, propose a plan and wait for approval.
- Work on one task at a time and summarize what changed when finished.
- If you are less than 80% sure about something, ask. Do not invent requirements.
- After modifying code, run `npm test` and `npm run build`.
