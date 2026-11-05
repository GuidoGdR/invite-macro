---
name: commit-conventional
description: Use when the user asks to commit changes, create a commit, make a commit, or "commitear". Activates when the user wants to commit staged code following Conventional Commits.
---

# Conventional Commit Generator

Apply this workflow when the user asks to commit code. Do NOT deviate from the steps below.

---

## 1. Inspect staged changes

Run:
- `git diff --cached` — inspect the actual staged diff
- `git status` — understand which files are staged and which are not

If **nothing is staged**:
- Stop the flow and ask the user what to do. Offer to:
  - `git add .` (or specific files if they name them)
  - Let them stage files manually

**Only consider staged changes.** Never analyse unstaged changes as if they would be committed.

---

## 2. Analyse the staged diff

Identify:

- **Paths / domains affected** — map changed files to contexts:
  - `internal/[domain]/` → domain name
  - `docs/` → documentation
  - `test/[domain]/` → tests for that domain
  - `cmd/[name]/` → the binary name
  - `scripts/` or CI files → tooling / CI
  - `.github/` → CI
  - Multiple domains → note each one

- **Nature of the change** — determine the correct type:
  - `feat` — new feature for the end user
  - `fix` — bug fix
  - `refactor` — code change that is neither a fix nor a feature
  - `perf` — performance improvement
  - `style` — formatting, whitespace, missing semicolons (no logic change)
  - `test` — adding or fixing tests
  - `docs` — documentation only
  - `chore` — maintenance, dependencies, tooling, CI (no production code)

- **Breaking changes** — detect automatically with emphasis on:
  - **`dto.go`** — changes in request/response structs are likely breaking the API contract (added/removed/renamed fields, changed types, new required validation)
  - `service.go` — signature changes in public methods, new required parameters
  - `repository.go` — interface changes consumed by the service
  - `handler.go` — route/method changes, removed/renamed endpoints
  - Breaking change = a commit that requires changes from consumers to work with the new version

---

## 3. Detect multiple contexts

If the staged diff touches **clearly unrelated domains** (e.g. `internal/auth/` + `docs/` + `internal/sales/`):

- **Suggest** (do not force) splitting into separate commits
- Present one proposed message per group
- Let the user decide: consolidate into one commit **or** proceed with several
- If the user picks several commits, process them **one by one**:
  - Present the first commit message → confirm → commit → repeat
  - Never batch-execute multiple commits at once

---

## 4. Generate the commit message

### Format (strict Conventional Commits)

```
<type>[optional scope][!]: <description>

[optional body]

[optional footer(s)]
```

### Rules

| Component | Rule |
|-----------|------|
| **type** | One of: feat, fix, chore, docs, refactor, style, test, perf |
| **scope** | Optional, in parentheses, inferred from the dominant path |
| **!** | After type/scope if this is a breaking change |
| **description** | English, imperative mood, lowercase after `:`, **max ~50 chars**, no trailing period |
| **body** | Optional — only when it adds real context (motivation, impact, contrast with previous behaviour). Wrap at ~72 chars. Separated by a blank line. |
| **footer** | Optional — `BREAKING CHANGE: ...` when applicable, issue references (`Closes #123`). |
| **Breaking change** | `!` in the subject line **and** `BREAKING CHANGE:` in the footer explaining the impact |

### Scope inference

| Changed path | Scope |
|---|---|
| `internal/auth/...` | `auth` |
| `internal/sales/...` | `sales` |
| `internal/products/...` | `products` |
| `internal/clients/...` | `clients` |
| Only `docs/...` | `docs` (or omit) |
| Only `test/[domain]/...` | the domain being tested |
| `cmd/[name]/...` | the binary name (e.g. `server`) |
| `scripts/`, `.github/`, CI | `ci` (or omit) |
| Multiple unrelated domains | Omit scope, let the user decide on splitting |

### Language

**Always English.** No exceptions.

---

## 5. Present to the user (do NOT commit without confirmation)

Show the proposed message in a clear format:

```
Proposed commit:

───────────────────────────────────────
<full commit message>
───────────────────────────────────────

Type:     feat (new feature for end users)
Scope:    auth (changes in internal/auth/)
Files:    internal/auth/dto.go, internal/auth/service.go
```

If a **breaking change** was detected, alert the user explicitly:

```
⚠️  BREAKING CHANGE DETECTED
  - internal/auth/dto.go: LoginRequest.Email field changed from string to int
  This means API consumers must update their payloads.
```

Then ask:

```
¿Está OK? Accept / Edit / Cancel
```

Do NOT execute the commit until the user explicitly accepts.

---

## 6. Execute the commit

- **Simple message (no body/footer):**
  ```
  git commit -m "feat(auth): add login endpoint with JWT generation"
  ```

- **Message with body/footer (use multiple -m flags to preserve blank lines):**
  ```
  git commit -m "feat(auth)!: add JWT refresh token rotation" \
             -m "Implements automatic token rotation on each refresh request
  to improve security. Old tokens are invalidated immediately." \
             -m "BREAKING CHANGE: RefreshToken() now requires a context.Context
  parameter. Update all callers accordingly."
  ```

After committing, show the user the result:
```
git log -1 --oneline
```



## Self-review checklist

Before presenting a commit message, verify:

- [ ] Only staged changes were considered
- [ ] Type is correct (feat/fix/refactor/etc.)
- [ ] Scope is meaningful and correctly inferred
- [ ] Description is imperative, ≤50 chars, English, no trailing period
- [ ] Body is present only when it adds real context
- [ ] Breaking change is marked with `!` AND has a `BREAKING CHANGE:` footer
- [ ] Breaking change was flagged to the user explicitly
- [ ] No markdown, quotes, or extra formatting in the message itself
- [ ] No explanations were mixed into the commit output — only the raw commit line(s)
