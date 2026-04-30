# SKILLS.md — FHE Enterprise Production Management Centre

> Agent capability registry. Defines what each AI agent in the FHE ecosystem can and cannot do, and how to route tasks to the right agent.

---

## Agent Registry

### 1. Claude Code (Claude Max)

**Primary Role**: Build agent, code reviewer, PR fixer, architecture planner, documentation generator

**Can Do**:
- Multi-file codebase analysis and implementation
- PR review with inline comments pushed to PR branch
- Fix commits pushed directly to open PR branches
- Generating Claude Code prompts for subsequent sessions
- Documentation generation (CLAUDE.md, README, architecture docs, MEMORY.md)
- Test generation for existing logic
- Zod schema creation for existing endpoints
- Single-file and multi-file refactoring (up to 5 files)
- GitHub Actions workflow creation (with human review gate)
- Dependency audit and vulnerability analysis

**Invocation Patterns**:
- **Interactive CLI**: `claude` inside repo directory for complex multi-file work
- **@claude on PR/Issue**: Comment `@claude [instruction]` — GitHub Action triggers
- **Automatic PR Review**: `.github/workflows/claude-auto-review.yml` on PR open/sync
- **Issue → PR**: Assign issue to Claude or comment `@claude implement this`

**Hard Limits — Requires Human Review**:
- Schema migrations (Prisma schema changes)
- Auth/RBAC/session middleware changes
- Secret configuration or credential handling
- Multi-repo coordinated changes
- Production deployments
- Any change touching >5 files
- Any GDPR/PII-adjacent logic

**Cost Control**:
- Uses `ANTHROPIC_API_KEY` from repo secrets
- Scope auto-review to `src/**` and `prisma/**` paths only
- Add `if: github.actor != 'dependabot[bot]'` guard to skip dep PRs
- Monitor token usage via Anthropic console

---

### 2. Cursor Pro+ Background Agents (Universal FHE-Agent Pattern)

**Primary Role**: Scoped, fast implementation tasks — JSDoc, lint fixes, Zod schemas, single-file tests, minor refactors

**Can Do**:
- JSDoc on exported functions
- Zod schemas for existing endpoints
- Tests for existing logic
- Single-file refactors and renames
- Lint and typecheck fixes
- Webhook handlers following existing patterns
- HESA field backfills (SJMS-2.5 only)
- README and docs updates
- Comment-driven Q&A (`@cursor explain` / `q:`) — read-only, no branch

**Invocation Patterns**:
- **Issue Template**: `Cursor Agent Task` form → `cursor` label → auto-dispatch
- **Comment**: `@cursor explain ...` / `q: ...` / `explain: ...` on any issue or PR
- **Manual Dispatch**: Actions → `cursor-agent-manual.yml` → Run workflow → fill prompt

**Hard Limits — Adds `requires-human-review` Label and Stops**:
- Prisma schema migrations
- Auth/RBAC/session middleware
- Payments, finance, marks retention
- New external integrations
- CI/CD workflow configuration
- Real PII or production credentials

**Output**:
- Branch: `cursor/issue-N` (label-triggered) or `cursor/manual-N` (dispatch)
- PR with self-review checklist filled in
- Comment on triggering issue with tracking link + cursor.com agent URL

**Cost Control**:
- ~$0.30/task average
- Hard cap: $25/month at https://cursor.com/settings/billing
- Monitor live: https://cursor.com/agents/[agent-id]

---

### 3. Cursor BugBot

**Primary Role**: Automated PR bug detection and inline review comments

**Can Do**:
- Inline PR comments flagging bugs, logic errors, security issues
- Severity classification: Low / Medium / High
- "Fix in Cursor" button (opens PR locally with context)
- "Fix in Web" button (cloud-based fix)

**Cannot Do**:
- Merge PRs
- Push fix commits autonomously
- Replace human review for auth/PII/schema changes

**Configuration**: Cursor Settings → BugBot → Enable on specific repos  
**Post-fix**: Click "Resolve conversation" after fix commit is pushed

---

### 4. GitHub Copilot

**Primary Role**: IDE-level code completion and PR review suggestions

**Can Do**:
- Inline code completion suggestions
- PR review comments (Copilot code review feature)
- Copilot Chat for repo Q&A
- Explain code, suggest tests, draft documentation

**Cannot Do**:
- Create branches or PRs autonomously
- Merge anything
- All suggestions require explicit developer acceptance

---

### 5. Dependabot

**Primary Role**: Automated dependency vulnerability and version update PRs

**Can Do**:
- Security vulnerability PRs (treat as P0 — review within 48h)
- Dependency version update PRs (review weekly in batch)
- Ecosystem support: npm, GitHub Actions, Docker

**Policy**:
- Security PRs: review and merge within 48 hours if CI passes
- Version PRs: review in weekly batch, never auto-merge without CI
- Always check breaking changes before merging major version bumps

---

## Task Routing Decision Tree

```
Task received
│
├── Is it a security/auth/schema/PII change?
│   └── YES → Claude Code interactive session + human review gate
│
├── Is it a multi-file architectural change (>5 files)?
│   └── YES → Claude Code interactive session
│
├── Is it scoped (JSDoc, lint, Zod, single-file test, minor refactor)?
│   └── YES → Cursor Background Agent via Cursor Agent Task issue template
│
├── Is it a code explanation or PR question?
│   └── YES → @cursor explain comment (read-only, no branch)
│
├── Is it a PR review comment to address?
│   └── YES → @claude address the review comments → fix commit pushed
│
├── Is it a dependency vulnerability?
│   └── YES → Review and merge Dependabot PR (check CI + breaking changes)
│
└── Is it a PR bug flagged by BugBot?
    └── YES → Fix in Cursor → push fix commit → resolve conversation → human approve
```

---

## Universal Repo Setup Checklist

Every portfolio repo must have all of these deployed to reach FHE standard:

### Core Identity Files
- [ ] `CLAUDE.md` — repo-specific Claude Code conventions
- [ ] `MEMORY.md` — session continuity file (updated each session)
- [ ] `SKILLS.md` — (optional at repo level; defer to this central file)

### GitHub Workflows
- [ ] `.github/workflows/claude.yml` — Claude Code on-demand (@claude trigger)
- [ ] `.github/workflows/claude-auto-review.yml` — automatic PR review on open/sync
- [ ] `.github/workflows/cursor-agent.yml` — Cursor agent dispatch (cursor label + comments)
- [ ] `.github/workflows/cursor-agent-manual.yml` — manual workflow_dispatch
- [ ] `.github/workflows/ci.yml` — lint + typecheck + test + build gates
- [ ] `.github/dependabot.yml` — npm + GitHub Actions ecosystems

### Issue & PR Templates
- [ ] `.github/ISSUE_TEMPLATE/config.yml` — template chooser (blank issues disabled)
- [ ] `.github/ISSUE_TEMPLATE/cursor-agent-task.yml` — Cursor Agent Task form
- [ ] `.github/ISSUE_TEMPLATE/bug-report.yml` — structured bug report
- [ ] `.github/ISSUE_TEMPLATE/feature-request.yml` — feature request form
- [ ] `.github/ISSUE_TEMPLATE/epic.yml` — epic planning form
- [ ] `.github/pull_request_template.md` — PR checklist

### Cursor Agent Config
- [ ] `.cursor/agents/FHE-Agent.md` — universal agent persona
- [ ] `.cursor/rules/fhe-conventions.mdc` — always-on coding rules
- [ ] `.cursor/environment.json` — build environment for background agents

### GitHub Settings (Manual)
- [ ] Branch protection on `main`: require PR, 1 review, CI pass, up-to-date
- [ ] Dependabot: security alerts + version updates enabled
- [ ] CodeQL scanning: enabled
- [ ] GitHub Environments: `development`, `staging`, `production`
- [ ] `production` environment: manual approval required
- [ ] Auto-merge: enabled
- [ ] Auto-delete head branches: enabled

### Secrets (Manual)
- [ ] `ANTHROPIC_API_KEY` — Settings → Secrets → Actions
- [ ] `CURSOR_API_KEY` — Settings → Secrets → Actions
