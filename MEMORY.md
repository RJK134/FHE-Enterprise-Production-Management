# MEMORY.md — FHE Enterprise Production Management Centre

> Session continuity file. Updated at the end of every Claude Code session.
> Read this at the start of every session before writing any code.

---

## Active Context

**Last Updated**: 2026-05-10
**Current Phase**: Phase 1 — Live Control Tower MVP — **all line items delivered**; Phase 2 kick-off pending.
**Sprint Focus**: Wrapping Phase 1 (blocker tracker + review-state attribution) before starting Phase 2 P0 (Plan Refresh Engine, Claude Code Bridge).
**Owner**: Freddie Finn (RJK134 / Future Horizons Education)
**Primary Contact Repo**: https://github.com/RJK134/FHE-Enterprise-Production-Management

---

## Product Origin & Context

FHE-EPMC evolved from the **Perplexity Computer Production Delivery Command Centre**, which after extensive development (~13,000+ credits spent) reached an honest 62/100 enterprise readiness score. A formal UAT review on 29/04/2026 by a 15-year enterprise IT delivery professional found:

- **Strengths to preserve**: 14-step lifecycle model, governance-first pattern, capacity handoff pack structure, evidence/memory model design, human gates enumeration, Claude prompt execution policy
- **Critical gaps**: No live PR control tower, dropdown↔pane state sync bug, no RBAC, no audit log, no SSO, FutureHorizonsEducation org access blocked, no run drill-down
- **Decision**: Rebuild as GitHub-native tool with real GitHub API integrations, not a hosted iframe app

---

## Portfolio Snapshot

| Product | Repo | Readiness | Current Blocker | Active Tranche/Phase |
|---------|------|-----------|----------------|---------------------|
| SJMS 2.5 | RJK134/SJMS-2.5 | 72/100 | Branch protection gaps, plaintext webhook/session secrets, no transactional outbox/DLQ | Tranche A (P0) |
| EquiSmile | RJK134/EquiSmile | 63/100 | Multi-tenancy, identity gaps, CI/DB, dependency gaps | Phase 17 Stabilise |
| HERM Platform | RJK134/herm-platform | 70/100 | SSO/MFA, revocable sessions, Stripe webhook completeness, observability | Phase 1 Close open hardening PRs |
| FHE-EPMC | RJK134/FHE-Enterprise-Production-Management | Live signals | EPMC-B5 (GitHub Environments), EPMC-B6 (FHE org access), EPMC-B7 (portfolio onboarding pending) | Phase 1 — Live Control Tower MVP |

---

## SJMS-Agent Pattern (Universal — Proven)

The SJMS-2.5 Cursor Agent pattern is the proven foundation for all repos:
- **Lives in**: `.github/workflows/cursor-agent.yml` + `cursor-agent-manual.yml`
- **Invoked via**: `cursor` label on issue, `@cursor` / `q:` / `explain:` comment, manual `workflow_dispatch`
- **Output**: Branch `cursor/issue-N`, PR, tracking comment on issue
- **Persona**: `.cursor/agents/SJMS-Agent.md` → to become `FHE-Agent.md` (universal)
- **Guard rails**: Refuses schema migrations, auth changes, PII, CI/CD config, external integrations
- **Cost**: ~$0.30/task; set $25/month cap at https://cursor.com/settings/billing
- **Read-only mode**: `@cursor explain` / `q:` → posts answer as comment, no branch created

---

## Session Log

### 2026-05-01 — Phase 0 Foundation (Identity files)
- **Objective**: Establish FHE-EPMC repo identity files
- **Files Pushed**: README.md, CLAUDE.md, MEMORY.md, SKILLS.md
- **PRs**: Direct push to main for the initial identity batch (prior to branch protection).
- **Status**: Identity files merged; full foundation pending on branch `claude/fhe-epmc-foundation-X4L9s`.

### 2026-05-01 — Phase 0 Foundation (Full structure on `claude/fhe-epmc-foundation-X4L9s`)
- **Objective**: Land the complete Phase 0 foundation (docs, process, checklists, issue/PR templates, workflows, Cursor agent config, setup scripts) via PR.
- **Files added on this branch**:
  - `docs/PRODUCT_SPECIFICATION.md`, `docs/DELIVERY_PLAN.md`, `docs/ARCHITECTURE.md`, `docs/INTEGRATION_MAP.md`, `docs/PROMPTS_LIBRARY.md`
  - `docs/process/{review-workflow,milestone-closeout-template,evidence-model,approval-ledger}.md`
  - `docs/checklists/{pr-review,release,enterprise-readiness,uat,branch-protection}-checklist.md`
  - `.github/ISSUE_TEMPLATE/{config.yml,epic,feature,bug-or-regression,planning-output,cursor-agent-task,blocker-remediation}.yml`
  - `.github/PULL_REQUEST_TEMPLATE/{planning-pr,agent-remediation-pr}.md` and `.github/pull_request_template.md`
  - `.github/workflows/{ci,claude,claude-auto-review,cursor-agent-manual,repo-intelligence-scan}.yml`
  - `.github/dependabot.yml`
  - `.cursor/{agents/FHE-Agent.md,rules/fhe-conventions.mdc,environment.json}`
  - `scripts/{phase-0-noop.js,setup-repo-standards.{sh,ps1},setup-review-intelligence.{sh,ps1},verify-foundation.{sh,ps1}}`
  - `package.json` (Phase 0 placeholder script surface)
- **Local verification**: `bash scripts/verify-foundation.sh` PASS · `npm run lint && npm run typecheck && npm test && npm run build` PASS.
- **PR**: Opened as draft pending owner review. Auto-merge will only be enabled if branch protection requires CI + ≥ 1 approving review.
- **Next Steps**:
  1. Owner: configure `ANTHROPIC_API_KEY` and `CURSOR_API_KEY` repo secrets.
  2. Owner: install Claude Code GitHub App and Cursor GitHub App on this repo.
  3. Owner: enable branch protection on `main` per `docs/checklists/branch-protection-checklist.md`.
  4. Owner: create GitHub Environments (`development`, `staging`, `production`).
  5. Owner: review and approve the foundation PR; merge once CI is green.
  6. Phase 1 kickoff: scaffold the Next.js 14 dashboard with the typed GitHub service layer per `docs/ARCHITECTURE.md`.
  7. Run `scripts/setup-repo-standards.sh --repo RJK134/SJMS-2.5` (and EquiSmile, herm-platform) once owner approves.
  8. Resolve FutureHorizonsEducation org access for full portfolio coverage.

### 2026-05-10 — Phase 1 wrap-up — blocker tracker + review-state attribution
- **Objective**: Finish the two remaining Phase 1 items (per-repo blocker tracker, BugBot/Copilot/Claude review-state attribution) so Phase 2 can start cleanly.
- **Branch**: `claude/fhe-epmc-phase-1-wrapup`.
- **Files added — blocker tracker**:
  - `src/lib/schemas/blocker.ts` — `Blocker` schema (id, slug, severity, status, owner, openedAt, resolvedAt, etaAt, description, evidence, remediationPr).
  - `src/lib/services/blockers/registry.ts` — typed append-only registry. Seeded with the eight EPMC blockers (B1..B8) plus seven portfolio blockers across SJMS-2.5, EquiSmile, herm-platform. Phase 3 moves it to the Evidence Lake DB with the same schema.
  - `src/app/repos/[slug]/blockers/page.tsx` — drill-down route. Allowlist-gated. Three sections: Active, Deferred, Resolved. Sorted by status → severity → openedAt.
  - `src/components/blocker-card.tsx`, `src/components/blocker-summary-badge.tsx`.
- **Files added — review-state attribution**:
  - `src/lib/services/github/check-classification.ts` — pure `classifyCheckRun(name)` mapping check-run names to `claude | bugbot | copilot | codeql | dependabot | vercel | gitguardian | ci | other`; `summariseChecksBySource(runs)` aggregates with worst-state-wins.
  - `src/components/bot-states-strip.tsx` — compact strip showing per-source state on PR rows.
- **Files updated**:
  - `src/lib/schemas/pr.ts` — `PullRequestSummary.bots` added (defaults to `{}` for backwards compat).
  - `src/lib/services/github/pulls.ts` — computes both `checks` summary and `bots` map from check-runs in one pass.
  - `src/components/pr-row.tsx` — renders bot strip below the title.
  - `src/components/portfolio-card.tsx` — optional `blockerCounts` prop; renders summary badge.
  - `src/app/page.tsx` — `countActiveBlockers` per repo, passed to card.
  - `src/app/repos/[slug]/page.tsx` — readiness + blocker badges side by side; blocker badge links to the new drill-down.
- **Tests** — 3 new suites:
  - `src/lib/schemas/__tests__/blocker.test.ts` — schema acceptance/rejection.
  - `src/lib/services/blockers/__tests__/registry.test.ts` — non-empty per repo, active-count semantics, resolved/deferred exclusion.
  - `src/lib/services/github/__tests__/check-classification.test.ts` — 22 classifier cases + 4 aggregation cases.
- **Total tests**: 111/111 passing.
- **Build**: 5 routes (`/`, `/_not-found`, `/repos/[slug]`, `/repos/[slug]/blockers`, `/repos/[slug]/pulls/[number]`); middleware 34.6 kB; 102 kB shared chunks.
- **Local verification**: lint ✓ · typecheck ✓ · test 111/111 ✓ · build ✓ · `bash scripts/verify-foundation.sh` ✓.
- **Governance**: No new dependencies. No CI workflow changes. No schema migrations / auth-business-logic / payments / external integrations / secret-handling. `requires-human-review` per CLAUDE.md (>5 files).
- **Next Steps**:
  1. Owner: review and merge this PR.
  2. Triage the 10 open Dependabot npm PRs (#10..#19): safe patches (#11 autoprefixer, #16 postcss) can merge after CI; risky majors (TS 6, Tailwind 4, Zod 4, eslint-config-next 16, Octokit 22) need careful per-PR review.
  3. Phase 2 P0 kick-off — Plan Refresh Engine (programmatic `DELIVERY_PLAN.md` diff PR), then Claude Code Bridge (handoff-pack generator + MEMORY.md drift detector).

### 2026-05-06 — Phase 0 closure + Phase 1 P1 placeholder auth wall
- **Objective**: Bring the plan in line with reality (Phase 0 → Complete; Phase 1 → Active; resolved blockers ticked), close the last Phase 0 P2 gap (CodeQL workflow), update README to reflect the live dashboard, and land the Phase 1 P1 placeholder authentication wall before Phase 4 SSO arrives.
- **Branch**: `claude/fhe-epmc-phase-1-closure`.
- **Files added**:
  - `.github/workflows/codeql.yml` — JavaScript/TypeScript CodeQL with `security-and-quality` query suite, weekly cron + per-PR + per-push triggers.
  - `src/lib/auth.ts` — pure `evaluateBasicAuth(header, expected)` with constant-time compare, UTF-8 base64 decoder, comprehensive reason strings.
  - `src/middleware.ts` — Next.js Edge middleware. Fail-closed when credentials are unset (HTTP 503); WWW-Authenticate Basic challenge on missing/wrong creds; bypass via `DASHBOARD_AUTH_DISABLED=1` for local dev only. Matcher excludes Next internals + favicon.
  - `src/lib/__tests__/auth.test.ts` — 12 tests including UTF-8 username/password, password containing `:`, malformed headers, length-mismatch constant-time smoke test.
- **Files updated**:
  - `docs/DELIVERY_PLAN.md` — Phasing Summary (Phase 0 Complete, Phase 1 Active); Phase 0 P0/P1/P2 ticked; Phase 1 P0 ticked; auth wall ticked under Phase 1 P1; Active Blockers table refreshed (B1..B4 resolved with Owner-confirmed evidence; B5/B6/B7/B8 carried as Open/Deferred with explicit status column).
  - `MEMORY.md` — Active Context advanced to 2026-05-06; Sprint Focus updated; Portfolio Snapshot row for FHE-EPMC updated.
  - `README.md` — Quick Start expanded (npm install, dev server, env template); new "Dashboard" section enumerating routes, env-var table, and Vercel deploy posture.
  - `src/lib/env.ts` — `EnvSchema` extended with `DASHBOARD_BASIC_AUTH_USER` / `DASHBOARD_BASIC_AUTH_PASS` / `DASHBOARD_AUTH_DISABLED`; values plumbed through.
  - `.env.example` — three new auth env vars documented with safe-default guidance.
  - `scripts/verify-foundation.{sh,ps1}` — `codeql.yml` added to required files list.
- **Local verification (Node 22)**:
  - `npm run lint` — PASS.
  - `npm run typecheck` — PASS (strict + `noUncheckedIndexedAccess`).
  - `npm test` — PASS (73/73 across 10 suites; +12 from PR #7's 56).
  - `npm run build` — PASS; middleware compiled to 34.6 kB; 4 routes; 102 kB shared chunks.
  - `bash scripts/verify-foundation.sh` — PASS.
- **Governance**:
  - No new dependencies. No CI workflow file changes that affect required checks (codeql.yml is additive). No schema migrations / auth/RBAC business logic / payments / external integrations / secret handling beyond env-var addition.
  - `requires-human-review` requested per CLAUDE.md (>5 files).
  - Auth posture is fail-closed by default; the only way to bypass is the explicit `DASHBOARD_AUTH_DISABLED=1` env var, intended for local dev. Documented prominently in README and `.env.example`.
- **Owner manual steps after merge** (cannot be automated):
  1. Set `DASHBOARD_BASIC_AUTH_USER` and `DASHBOARD_BASIC_AUTH_PASS` in Vercel preview + production environments (not in git, not in `.env.example`).
  2. Optionally add the new `CodeQL` checks to required status checks once two consecutive runs are green.
  3. Item 5 (portfolio onboarding) and EPMC-B5 (GitHub Environments) remain owner actions.
- **Next Steps**:
  1. Per-repo blocker tracker (Phase 1 P1, last item).
  2. BugBot/Copilot/Claude review-state attribution on PR rows (Phase 1 P0 cleanup).
  3. Phase 2 P0 kick-off — Plan Refresh Engine first (ironically replacing this hand-edit), then Claude Code Bridge handoff-pack generator.

### 2026-05-04 — Phase 1 Live Control Tower MVP — readiness signals + per-PR drill-down
- **Objective**: Close Phase 1 P0 by deriving the readiness score from real signals, and open Phase 1 P1 by adding the per-PR drill-down with merge-readiness signal.
- **Branch**: `claude/fhe-epmc-phase-1-readiness`.
- **Files added**:
  - **Schemas:** `src/lib/schemas/{readiness,pull-detail,branch-protection,alerts}.ts`.
  - **Services:** `src/lib/services/github/{branch-protection,alerts,pull-detail}.ts`; `src/lib/services/readiness/score.ts`.
  - **Components:** `src/components/{readiness-badge,merge-readiness,check-run-list}.tsx`.
  - **Route:** `src/app/repos/[slug]/pulls/[number]/page.tsx`.
  - **Tests:** `__tests__/readiness.test.ts`, `__tests__/pull-detail.test.ts`, `__tests__/alerts.test.ts`, `__tests__/pull-detail.test.ts` (services), `__tests__/score.test.ts`. Total: **56 tests passing** (43 new + 13 from PR #6).
- **Files updated**:
  - `src/app/page.tsx` — fetches `computeReadiness` per repo when connected; passes snapshot to `PortfolioCard`.
  - `src/app/repos/[slug]/page.tsx` — adds the readiness badge + per-axis signals; routes PR rows to the new drill-down.
  - `src/components/portfolio-card.tsx` — accepts optional `readiness` prop; renders `ReadinessBadge` for both live and registry-estimate states.
  - `src/components/pr-row.tsx` — links to `/repos/[slug]/pulls/[number]`; secondary link to GitHub.
- **Readiness scoring** — implements the four axes GitHub answers authoritatively today (`security` via CodeQL, `governance` via branch protection, `dependencies` via Dependabot, `documentation` and `operational` deferred to Phase 3/5 with registry-estimate fallback). Snapshot is tagged `live` / `partial` / `registry-estimate` so the UI is honest about source quality.
- **Merge readiness** — composes from PR draft state, review counts, branch-protection required-checks compliance, and Octokit's `mergeable` flag. Returns reasons array so the UI can render a precise blocker list.
- **Local verification**: lint PASS · typecheck PASS · test 56/56 PASS · build PASS (4 routes; 102 kB shared chunks) · `bash scripts/verify-foundation.sh` PASS.
- **Governance**: All new services are server-only via the `server-only` import marker. No new dependencies added. `requires-human-review` label applied per CLAUDE.md (>5 files; introduces the readiness scoring surface).
- **Watch items**:
  - `next lint` deprecation — Next 16 will require migration to ESLint CLI; small follow-up.
  - Documentation and operational axes are still registry estimates pending Phase 3 (Evidence Lake) and Phase 5 (CI pass-rate ingestion).
  - Live rendering of readiness on the homepage triggers `n_repos × 2` GitHub API calls per page load. With four repos that's 8 calls — negligible. Phase 2 will add caching with `revalidate` once we hit a usage signal.
- **Next Steps**:
  1. Owner: review and merge this PR.
  2. After merge: with `GITHUB_TOKEN` configured in Vercel, the homepage will render live readiness badges and PR rows will link to a real per-PR drill-down with merge readiness.
  3. Future Claude session — Phase 1 P1 remaining: per-repo blocker tracker (append-only history), placeholder authentication wall, BugBot/Copilot/Claude review-state attribution on PR rows.

### 2026-05-03 — Phase 1 Live Control Tower MVP — dashboard scaffold
- **Objective**: Replace the Phase 0 placeholder npm script surface with the real Next.js 14 App Router dashboard, typed service layer, and tests.
- **Files added on this branch (`claude/fhe-epmc-phase-1-dashboard`)**:
  - **App + components:** `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/repos/[slug]/page.tsx`, `src/app/globals.css`, `src/components/{portfolio-card,connection-banner,pr-row}.tsx`.
  - **Typed service layer:** `src/lib/env.ts` (Zod-validated server env), `src/lib/services/portfolio/registry.ts` (typed config), `src/lib/services/github/client.ts` (Octokit factory with graceful no-token degradation), `src/lib/services/github/pulls.ts` (open PRs + check summary).
  - **Schemas:** `src/lib/schemas/repo.ts`, `src/lib/schemas/pr.ts`.
  - **Tests:** `src/lib/__tests__/env.test.ts`, `src/lib/services/portfolio/__tests__/registry.test.ts`, `src/lib/schemas/__tests__/repo.test.ts` (13 tests).
  - **Tooling:** `tsconfig.json` (strict mode + `noUncheckedIndexedAccess`), `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `.eslintrc.json`, `.gitignore`, `next-env.d.ts`, `.env.example`, `src/__mocks__/server-only.ts`.
- **Files updated**:
  - `package.json` — real Phase 1 scripts (`dev`/`build`/`start`/`lint`/`typecheck`/`test`/`test:watch`/`verify:foundation`), real deps: Next 15.5.15, React 18.3, Octokit 21.1, Zod 3.24, server-only 0.0.1; devDeps: Vitest 4.1.5, happy-dom 20.9, Tailwind 3.4, TypeScript 5.6, ESLint 8.57 + eslint-config-next 15.5.15.
  - `.github/workflows/ci.yml` — added `npm ci` before lint/typecheck/test/build; added npm cache.
  - `scripts/verify-foundation.{sh,ps1}` — removed the deleted `phase-0-noop.js` entry.
- **Files removed**: `scripts/phase-0-noop.js` (replaced by real Next.js scripts).
- **Local verification (Node 22)**:
  - `npm run lint` — PASS (no warnings or errors; `next lint` is deprecated in Next 16 — migration to ESLint CLI deferred to a future small PR).
  - `npm run typecheck` — PASS.
  - `npm test` — PASS (13/13 across 3 suites).
  - `npm run build` — PASS (3 routes; 102 kB shared chunks).
  - `bash scripts/verify-foundation.sh` — PASS.
  - `bash scripts/vercel-ignore.sh` — exits with the expected per-diff signal (Vercel will deploy once the PR is open because `next.config.mjs` and `src/**` are now present, taking the script past its Phase-0 skip).
- **Security posture**:
  - All GitHub calls server-side; client components never see tokens.
  - `server-only` import gates the env loader, the GitHub client, the registry, and the pulls service against accidental client-side import.
  - Bumped Next.js from 14.2.33 → 15.5.15 to clear the high-severity advisories on 14.x (DoS via Server Components, image-cache exhaustion, request-smuggling); only one moderate transitive remains (`next` bundles its own `postcss <8.5.10` for CSS XSS — inherited across the Next ecosystem; documented as accepted-and-watched, fix lands when Next bumps its bundled postcss).
  - No new secrets committed; `.env.example` enumerates only the variable names with empty values.
- **Risk acceptance / watch items**:
  - Transitive `postcss <8.5.10` inside `node_modules/next/node_modules/postcss` (moderate; build-time CSS XSS in the stringifier; not exploitable from runtime traffic; Next-side fix expected).
  - `next lint` deprecation warning — non-blocking on Next 15; Next 16 will require migrating to the ESLint CLI directly.
- **PR**: Draft, labelled `requires-human-review` (>5 files; introduces the application code surface).
- **Next Steps**:
  1. Owner: review and merge the Phase 1 dashboard scaffold PR.
  2. Owner: deploy to Vercel preview, set `GITHUB_TOKEN` in Vercel preview env var so the live PR list renders against `RJK134/*`.
  3. Future Claude session: extend service layer with branch-protection signal + readiness score derivation per `docs/ARCHITECTURE.md` §3.2.
  4. Future Claude session: per-PR drill-down view (PR → check runs → conversation states).
  5. Owner action item: portfolio onboarding (run `scripts/setup-repo-standards.sh` against SJMS-2.5, EquiSmile, herm-platform) — must be triggered from a session that has GitHub MCP access to those repos. Cannot be done from FHE-EPMC sessions where MCP is restricted to this repo only.

### 2026-05-01 — Phase 0 Foundation (Vercel-for-GitHub scaffolding)
- **Objective**: Add the Vercel for GitHub integration scaffolding so Phase 1 deploys are smooth out of the gate, without producing spurious empty deploys during Phase 0.
- **Files added on this branch**:
  - `vercel.json` — Next.js framework, lhr1 region, autoJobCancelation, ignoreCommand pointing at `scripts/vercel-ignore.sh`, production-only deployment for `main`.
  - `.vercelignore` — exclude docs/, .github/, .cursor/, scripts/ and identity files from deploy uploads.
  - `.nvmrc` — pin Vercel Node runtime to 20.
  - `scripts/vercel-ignore.sh` — Phase-0-aware ignore step (skip until next.config.* exists; skip docs-only diffs thereafter).
  - `docs/process/vercel-integration.md` — full Vercel runbook (one-time wiring, settings, env vars, fork protection, repository_dispatch, branch protection interaction, ledger discipline).
- **Files updated**:
  - `docs/INTEGRATION_MAP.md` — Vercel row enriched, env vars enumerated, branch-protection guidance, additional out-of-band step added.
  - `docs/ARCHITECTURE.md` — §8 Deployment now references vercel.json and the ignore step.
  - `docs/checklists/release-checklist.md` — Vercel preview gate, GitHub Environment production approval, fork authorisation.
  - `scripts/verify-foundation.{sh,ps1}` — added the four new required files.
- **Local verification**: `bash scripts/verify-foundation.sh` PASS · `npm run lint && npm run typecheck && npm test && npm run build` PASS.
- **Notes**:
  - Vercel deploys are intentionally suppressed for Phase 0 by `scripts/vercel-ignore.sh` (no `next.config.*` yet). When Phase 1 lands the Next.js app, Vercel automatically begins deploying without any further config change.
  - The `Vercel` GitHub Check is *not* added to required status checks in Phase 0 per `docs/checklists/branch-protection-checklist.md`. Owner adds it once Phase 1 deploys are stable for two consecutive merges.

---

## Known Manual Blockers

| Blocker | Impact | Resolution | Status |
|---------|--------|------------|--------|
| `ANTHROPIC_API_KEY` secret not set | Claude Code GitHub Action won't run | Settings → Secrets → Actions → New secret | ⚠️ Open |
| `CURSOR_API_KEY` secret not set | Cursor agent won't dispatch | Settings → Secrets → Actions → New secret | ⚠️ Open |
| Claude GitHub App not installed | `@claude` comments and auto-review won't trigger | Run `/install-github-app` in Claude Code CLI | ⚠️ Open |
| Cursor GitHub App not installed | BugBot won't run on PRs | cursor.com/settings/integrations → Install on repos | ⚠️ Open |
| Branch protection not enabled on main | Agents can push directly to main | Settings → Branches → Add rule | ⚠️ Open |
| GitHub Environments not created | No dev/staging/production isolation | Settings → Environments → New environment | ⚠️ Open |
| FutureHorizonsEducation org access | Cannot scan FHE org repos in dashboard | Correct org permissions | ⚠️ Open |
| Local Windows Claude history path | Cannot read C:\Users\...\claude from hosted app | Use exported history bundles, upload to evidence store | ⚠️ Open |
| PR #149 in SJMS-2.5 | Blocked: OWNER/REPO fix pushed, needs conversation resolved + 1 approving review | Resolve BugBot thread → get approval → merge | ⚠️ Open |

---

## Key Architecture Decisions

| Date | Decision | Rationale |
|------|----------|----------|
| 2026-05-01 | FHE-EPMC is GitHub-native, not Perplexity Computer iframe app | Real PR control tower requires live GitHub API, not simulated state |
| 2026-05-01 | Universal Cursor Agent pattern from SJMS-2.5 | Proven, $0.30/task, integrates with existing GitHub workflow |
| 2026-05-01 | Human gate on all merges, releases, deploys, schema changes | Non-negotiable for enterprise — GDPR, data integrity, security posture |
| 2026-05-01 | Dashboard built in Next.js 14 App Router + Tailwind | Consistent with portfolio repo stack, server-side API calls for security |
| 2026-05-01 | MEMORY.md read at start of every Claude session | Prevents context loss between sessions, maintains build continuity |
