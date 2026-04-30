# CLAUDE.md — FHE Enterprise Production Management Centre

> This file is read by Claude Code at the start of every session in this repository.
> Follow all instructions here precisely before writing any code.

---

## Project Identity

- **Product**: FHE Enterprise Production Management Centre (FHE-EPMC)
- **Owner**: Freddie Finn / RJK134 / Future Horizons Education
- **Purpose**: Master orchestration layer for all FHE product development
- **Stack**: Next.js 14 (App Router), TypeScript (strict mode), React 18, Tailwind CSS, Prisma, PostgreSQL
- **Deployment**: GitHub Pages (static dashboard), Vercel (app), GitHub Actions (CI/CD)
- **Primary Repo**: https://github.com/RJK134/FHE-Enterprise-Production-Management

---

## Session Start Protocol

At the start of **every** Claude Code session in this repo:

1. Read `MEMORY.md` for context from prior sessions
2. Read `docs/DELIVERY_PLAN.md` to understand the current phase and P0 priorities
3. Check open GitHub issues for the current sprint
4. Confirm which repo/product is the focus of this session
5. State the **single objective** for this session before writing any code
6. List the files you plan to touch before touching them
7. Confirm no planned file requires the `requires-human-review` guard (see below)

---

## Session End Protocol

At the end of every Claude Code session:

1. Update `MEMORY.md` with: date, objective, files changed, PRs opened, next steps
2. Confirm all CI gates pass: `npm run lint && npm run typecheck && npm test && npm run build`
3. Open a PR with the complete description template (see below)
4. **Do NOT merge** — leave for human review
5. Post a session summary comment on the linked issue

---

## Core Build Principles

1. **Smallest coherent production-grade change** — never build more than one feature/fix per Claude session
2. **Governance-first** — every change must satisfy the production gate checklist before a PR is opened
3. **Human-gated merge** — Claude Code NEVER merges PRs; it opens PRs only
4. **Evidence-led** — every significant change must reference an issue, blocker, or delivery plan item
5. **No secrets in code** — never include API keys, tokens, passwords, or connection strings in any committed file
6. **Repo parity** — changes to agent/workflow patterns here must be replicable to all portfolio repos
7. **Single responsibility per session** — complete one thing excellently rather than many things partially

---

## Coding Standards

### TypeScript
- Strict mode always (`"strict": true` in tsconfig)
- No `any` types — use `unknown` and narrow explicitly
- Prefer `type` over `interface` for component props
- All async functions must handle errors with typed catch blocks
- No non-null assertions (`!`) — use proper null checks

### React / Next.js
- App Router only — no Pages Router patterns
- Server Components by default; `'use client'` only where interaction requires it
- No inline styles — use Tailwind utility classes only
- All interactive elements must have `aria-label` attributes (WCAG AA)
- Images must use `next/image` with explicit width/height

### Data & State
- No `localStorage`, `sessionStorage`, `cookies`, or `IndexedDB` for sensitive data
- React `useState` / `useReducer` only for UI state
- All data fetching via typed service layer — no raw `fetch()` calls in components
- All API responses validated with Zod schemas

### Testing
- New functionality must include tests in `__tests__/` adjacent to source files
- Run `npm run lint && npm run typecheck && npm test` before considering work done
- CI gates: lint + typecheck + test + build must ALL pass before opening a PR

---

## Production Gate Checklist

Before opening any PR, Claude Code must confirm **all** of the following:

- [ ] `npm run lint` passes with zero warnings
- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm test` passes — no new test failures introduced
- [ ] `npm run build` succeeds without errors
- [ ] No secrets, credentials, or API keys in any committed file
- [ ] No new high/critical security vulnerabilities introduced
- [ ] Rollback plan documented in PR description
- [ ] Only the intended files are changed — no unintended side effects
- [ ] PR description complete per template below

---

## PR Description Template

Every PR opened by Claude Code must include:

```markdown
## Summary
[What this PR does in 2-3 sentences]

## Linked Issue / Delivery Plan Item
Closes #[issue number] / Addresses: [blocker or plan item name]

## Files Changed
- `path/to/file.ts` — [reason for change]
- `path/to/other.ts` — [reason for change]

## Tests Run
- `npm run lint` — [PASS/FAIL]
- `npm run typecheck` — [PASS/FAIL]
- `npm test` — [PASS/FAIL + number of tests]
- `npm run build` — [PASS/FAIL]

## Rollback Plan
[Exact steps to revert this change safely if it causes issues in production]

## Human Review Required For
- [ ] Logic correctness
- [ ] Security implications
- [ ] Performance impact
- [ ] Any items flagged as requires-human-review
```

---

## Agent Guard Rails — STOP and add `requires-human-review` label if:

Claude Code must immediately stop, add the `requires-human-review` label, and post a comment explaining why if any of the following are detected:

- Any change to authentication, session management, or RBAC logic
- Any database schema migration (`prisma/schema.prisma` changes)
- Any change to GitHub Actions workflow files in portfolio repos (other than this repo)
- Any `.env*` file or secret configuration change
- Any external integration setup (OAuth providers, Stripe, Azure AD, SharePoint)
- Any change that touches more than 5 files in a single session
- Any change to the production gate logic or human approval flow
- Any file containing real PII, credentials, or production connection strings

---

## Portfolio Repo Conventions

When working in or generating code for portfolio repos:

| Repo | Additional Rules |
|------|------------------|
| SJMS-2.5 | HESA field naming for all student attributes; Prisma `$transaction` for multi-table writes; never log student PII (use IDs only) |
| EquiSmile | Multi-tenancy aware (tenant ID on all queries); UK dental compliance; Stripe webhook idempotency required |
| herm-platform | HERM/HE governance model; SSO/MFA compliance; audit trail on all data-changing operations |
| All repos | Branch protection on `main`; Dependabot enabled; CodeQL scanning active; no direct pushes to `main` |

---

## Key Secrets Reference (Never hardcode — always use env vars)

| Secret Name | Where Used | Stored In |
|-------------|-----------|----------|
| `ANTHROPIC_API_KEY` | Claude Code GitHub Action | GitHub repo secret |
| `CURSOR_API_KEY` | Cursor agent dispatch workflow | GitHub repo secret |
| `GITHUB_TOKEN` | GitHub Actions (auto-provided) | Auto-injected by GitHub |
| `DATABASE_URL` | Prisma / PostgreSQL | GitHub repo secret / Vercel env |
