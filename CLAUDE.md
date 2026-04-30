# CLAUDE.md — FHE Enterprise Production Management Centre

> This file is read by Claude Code on every session in this repository. Follow all instructions here precisely and completely before writing any code.

---

## Project Identity

- **Product**: FHE Enterprise Production Management Centre (FHE-EPMC)
- **Owner**: Freddie Finn / RJK134 / Future Horizons Education
- **Purpose**: Master orchestration and delivery management layer for all FHE product development
- **Stack**: Next.js 14 (App Router), TypeScript (strict), React 18, Tailwind CSS, Prisma, PostgreSQL
- **Deployment Target**: GitHub Pages (static dashboard), Vercel (app routes), GitHub Actions (CI/CD)
- **Repo**: https://github.com/RJK134/FHE-Enterprise-Production-Management

---

## Session Start Protocol — Do This First, Every Time

1. Read this entire CLAUDE.md file before writing a single line of code
2. Read `MEMORY.md` for context from all prior sessions
3. Read `docs/DELIVERY_PLAN.md` to understand the current phase and P0 priorities
4. Check open GitHub issues for the current sprint
5. Confirm which repo/product is the focus of this session
6. **State the single objective for this session** before writing any code
7. **State which files you plan to touch** before touching them
8. Confirm the objective is aligned with the current P0 delivery plan priority

---

## Session End Protocol — Do This Last, Every Time

1. Run the full production gate checklist (see below) — confirm all pass
2. Open a PR with the complete description per the PR template
3. **Do NOT merge** — leave for human review
4. Post a session summary comment on the linked issue
5. Update `MEMORY.md` with: date, objective, files changed, PRs opened, blockers found, next steps

---

## Core Build Principles

1. **Smallest coherent production-grade change** — never build more than one feature/fix per Claude session
2. **Governance-first** — every change must satisfy the production gate before a PR is opened
3. **Human-gated merge** — Claude Code NEVER merges PRs; it opens PRs only
4. **Evidence-led** — every significant change must reference an issue, blocker, or delivery plan item
5. **No secrets in code** — never include API keys, tokens, passwords, or connection strings in any file
6. **Repo parity** — every agent/workflow pattern created here must be replicable to all portfolio repos
7. **Transparency** — if uncertain about a design decision, add a comment in the PR asking for clarification rather than guessing

---

## TypeScript Standards

- Strict mode always (`"strict": true` in tsconfig.json)
- No `any` types — use `unknown` and narrow explicitly
- Prefer `type` over `interface` for component props
- All async functions must handle errors explicitly with try/catch or Result types
- Use `const` by default; `let` only when reassignment is required
- No implicit returns in functions with complex logic

---

## React / Next.js Standards

- App Router only — no Pages Router patterns
- Server Components by default; `'use client'` only where browser interaction is required
- No inline styles — Tailwind utility classes exclusively
- All interactive elements must have `aria-label` or `aria-labelledby`
- Forms must have proper `<label>` associations
- Images must have `alt` text
- Keyboard navigation must work for all interactive elements

---

## Data & State Standards

- No `localStorage`, `sessionStorage`, `cookies`, or `IndexedDB` for sensitive data
- React state only for UI state within components
- All data fetching via typed service layer in `src/lib/` — no raw `fetch` calls in components
- All API routes must validate input with Zod schemas
- All API routes must return consistent error shapes: `{ error: string, code: string }`

---

## Testing Standards

- New functionality requires tests in `__tests__/` adjacent to the source file
- Test file naming: `[filename].test.ts` or `[filename].test.tsx`
- Run `npm run lint && npm run typecheck && npm test` before considering work done
- Do not delete or skip existing tests without explicit justification in the PR
- Mock external API calls — never call real GitHub API or Anthropic API in tests

---

## Production Gate Checklist

Before opening any PR, Claude Code must confirm every item passes:

- [ ] `npm run lint` passes with zero errors and zero warnings
- [ ] `npm run typecheck` passes with zero TypeScript errors
- [ ] `npm test` passes — all tests green, no new failures
- [ ] `npm run build` succeeds with no errors
- [ ] No new secrets, credentials, tokens, or connection strings in any committed file
- [ ] No new high or critical security vulnerabilities introduced
- [ ] Rollback plan documented in PR description
- [ ] Only the intended files are changed — no accidental scope creep
- [ ] PR description is complete per the PR template below
- [ ] `MEMORY.md` has been updated with this session's summary

---

## PR Description Template

Every PR opened by Claude Code must use this exact structure:

```markdown
## Summary
[What this PR does in 2–3 sentences]

## Linked Issue / Delivery Plan Item
Closes #[issue number] / Addresses: [blocker or plan item name]

## Files Changed
- `path/to/file.ts` — [reason for change]
- `path/to/other.ts` — [reason for change]

## Tests Run
- `npm run lint` — [PASS / FAIL]
- `npm run typecheck` — [PASS / FAIL]
- `npm test` — [PASS / FAIL — N tests, N passing]
- `npm run build` — [PASS / FAIL]

## Rollback Plan
[Exact steps to safely revert this change if it causes issues after merge]

## Human Review Required For
- [ ] Logic correctness
- [ ] Security implications
- [ ] Performance impact
- [ ] Accessibility

## Notes for Reviewer
[Any assumptions made, open questions, or items needing clarification]
```

---

## Agent Stop Conditions — STOP and Add `requires-human-review` Label If:

Immediately stop work, add the `requires-human-review` label to the issue/PR, and post a comment explaining why:

- Any change to authentication, session management, or RBAC logic
- Any database schema migration (any change to `prisma/schema.prisma`)
- Any change to GitHub Actions workflow files in portfolio repos
- Any change to `.env*` files, secret configuration, or environment variable definitions
- Any setup of external integrations (OAuth providers, Stripe, Azure AD, external APIs)
- Any change that touches more than 5 files simultaneously
- Any change to the production gate checklist or human approval logic itself
- Any change where you are uncertain about security implications

---

## Portfolio Repo Standards

When assisting with any portfolio repo, apply these additional repo-specific rules:

### SJMS-2.5 (Student/Junior Management System)
- HESA field naming conventions for all student data fields
- All multi-table writes wrapped in `prisma.$transaction()`
- Never log PII — use IDs only, never names, DOB, or contact details
- GDPR-compliant data handling at all times

### EquiSmile (Dental / Healthcare Workflow)
- Multi-tenancy aware — never mix tenant data
- UK dental compliance standards
- Stripe webhook idempotency required
- Patient data handling: same PII rules as SJMS

### herm-platform (HE Governance Platform)
- HERM/HE governance model conventions
- SSO/MFA compliance required
- Audit trail on all data-modifying operations
- Prisma schema validation must pass in CI

### All Repos
- Branch protection on `main` must be active
- Dependabot must be enabled (security + version)
- CodeQL scanning must be active
- Secrets must use GitHub Actions secrets — never hardcoded

---

## Commit Message Format

Use conventional commits:

```
type(scope): description

Examples:
feat(dashboard): add portfolio registry panel
fix(agent): correct cursor-agent workflow trigger condition
docs(claude): update session end protocol
chore(deps): update next to 14.2.x
test(github-client): add mock for PR fetch
```

Types: `feat`, `fix`, `docs`, `test`, `chore`, `refactor`, `ci`, `style`
