# CLAUDE.md — FHE Enterprise Production Management Centre

> This file is read by Claude Code on every session in this repository. Follow all instructions here precisely before writing a single line of code.

---

## Project Identity

- **Product**: FHE Enterprise Production Management Centre (FHE-EPMC)
- **Owner**: Freddie Finn / RJK134 / Future Horizons Education
- **Purpose**: Master orchestration layer for all FHE product development
- **Stack**: Next.js 14 (App Router), TypeScript (strict mode), React 18, Tailwind CSS, Prisma, PostgreSQL
- **Deployment**: GitHub Pages (static dashboard), Vercel (full app), GitHub Actions (CI/CD)
- **Repo**: https://github.com/RJK134/FHE-Enterprise-Production-Management

---

## Session Start Protocol — Do This First, Every Time

1. Read `MEMORY.md` — understand context from prior sessions
2. Read `docs/DELIVERY_PLAN.md` — understand current phase and P0 priorities
3. Check open GitHub issues for the current sprint focus
4. Confirm which repo/product is the focus of this session
5. State in plain language the **single objective** for this session before writing any code
6. State **which files** you plan to touch before touching them
7. Confirm you are NOT about to touch: schema migrations, auth middleware, secrets, CI/CD pipelines, or >5 files simultaneously

---

## Session End Protocol — Do This Last, Every Time

1. Run `npm run lint && npm run typecheck && npm test && npm run build` — all must pass
2. Update `MEMORY.md` with: date, objective, files changed, PRs opened, next steps
3. Open PR with complete description per template in this file
4. Post a session summary comment on the linked issue
5. **Do NOT merge** — leave for human review
6. State clearly what the next Claude session should continue with

---

## Core Build Principles

1. **Smallest coherent production-grade change** — never build more than one feature/fix per session
2. **Governance-first** — every change must satisfy the production gate checklist before a PR is opened
3. **Human-gated merge** — Claude Code NEVER merges PRs; it opens PRs only
4. **Evidence-led** — every significant change must reference an issue, blocker, or plan item
5. **No secrets in code** — never include API keys, tokens, passwords, or connection strings in any file
6. **Repo parity** — every change to agent/workflow patterns here must be replicable to all portfolio repos
7. **Honest uncertainty** — if a change might affect security, data integrity, or >5 files, stop and flag it

---

## TypeScript Standards

- Strict mode always: `"strict": true` in tsconfig.json
- No `any` types — use `unknown` and narrow explicitly
- Prefer `type` over `interface` for component props
- All async functions must handle errors explicitly with try/catch or Result types
- All exported functions must have JSDoc comments

---

## React / Next.js Standards

- App Router only — no Pages Router patterns
- Server Components by default; `'use client'` only where interaction requires it
- No inline styles — Tailwind utility classes only
- All interactive elements must have `aria-label` attributes
- Data fetching via typed service layer only — no raw fetch calls in components

---

## Data & State Standards

- No `localStorage`, `sessionStorage`, `cookies`, or `IndexedDB` for sensitive data
- React state only for UI state within a session
- All GitHub API calls must be server-side (API routes), never expose tokens client-side
- Never render secret values in any UI component, log, or comment

---

## Testing Standards

- New functionality must include tests in `__tests__/` adjacent to source files
- Run `npm run lint && npm run typecheck && npm test && npm run build` before opening any PR
- CI gates: lint + typecheck + test + build must all pass — no exceptions

---

## Production Gate Checklist

Before opening any PR, Claude Code must confirm every item:

- [ ] `npm run lint` passes with zero warnings
- [ ] `npm run typecheck` passes with zero errors  
- [ ] `npm test` passes — no new test failures
- [ ] `npm run build` succeeds
- [ ] No new secrets or credentials in any file
- [ ] No high/critical security vulnerabilities introduced
- [ ] Rollback plan documented in PR description
- [ ] Only the intended files are changed (no accidental scope creep)
- [ ] PR description includes: what changed, why, files touched, tests run, rollback steps

---

## PR Description Template

Every PR opened by Claude Code must use this exact structure:

```markdown
## Summary
[What this PR does — 2-3 sentences maximum]

## Linked Issue / Blocker
Closes #[issue number] / Addresses blocker: [blocker name]

## Files Changed
- `path/to/file.ts` — [why this file was changed]

## Tests Run
- [test name] — [PASS/FAIL]

## Production Gate
- [ ] lint: PASS
- [ ] typecheck: PASS  
- [ ] test: PASS
- [ ] build: PASS
- [ ] No secrets in code
- [ ] No security regressions

## Rollback Plan
[Exact steps to revert this change safely]

## Human Review Required For
- [ ] Logic correctness
- [ ] Security implications  
- [ ] Performance impact
```

---

## Agent Stop Conditions — Add `requires-human-review` Label and STOP if:

- Any change to authentication, session management, or RBAC logic
- Any database schema migration (Prisma schema changes)
- Any change to GitHub Actions workflow files in portfolio repos
- Any change to `.env*` files, secret configuration, or credential handling
- Any external integration setup (OAuth, Stripe, Azure AD, external APIs)
- Any change that touches more than 5 files simultaneously
- Any change to the production gate, approval logic, or human gate enforcement
- Any uncertainty about whether a change might violate GDPR or data protection requirements

---

## Portfolio Repo Conventions

When working on any portfolio repo, apply these additional repo-specific rules:

### SJMS-2.5
- HESA field naming conventions for all student data attributes
- Prisma `$transaction` for all multi-table writes
- Never log PII (student names, DOB, contact details) — use IDs only
- Branch protection on main required before any schema changes

### EquiSmile
- Multi-tenancy aware — always scope queries to `tenantId`
- UK dental compliance requirements apply
- Stripe webhook idempotency required on all payment handlers

### herm-platform
- HERM/HE governance model — audit trail on all data changes
- SSO/MFA compliance required for all auth flows
- Revocable session tokens only

### All Portfolio Repos
- Branch protection on `main` must be enabled
- Dependabot must be enabled (security + version)
- CodeQL scanning must be active
- `CLAUDE.md`, `MEMORY.md` must be present and current
