# SKILLS.md — FHE Enterprise Production Management Centre

> Agent capability registry for the FHE ecosystem.
> Defines what each AI agent can and cannot do, how to invoke it, and how to route tasks.

---

## Agent Registry

### 1. Claude Code (Claude Max)

**Primary Role**: Build agent, code reviewer, PR fixer, architecture planner, documentation generator

**Can Do**:
- Multi-file codebase analysis and implementation
- PR review with inline comments pushed to PR branch
- Fix commits in response to `@claude` mentions on PRs/issues
- Architecture planning and documentation
- CLAUDE.md, README, and technical docs generation
- Test generation for existing logic
- Zod schema creation for existing API endpoints
- Single-file refactoring
- GitHub Actions workflow creation (with human review)
- Issue triage and labelling

**Invocation**:
- Interactive: `claude` CLI in repo directory
- On-demand GitHub Action: comment `@claude [instruction]` on any PR or issue
- Automatic PR review: `.github/workflows/claude-auto-review.yml` triggers on PR open/update
- Issue → PR automation: assign issue to Claude or comment `@claude implement this`

**Cannot Do / Requires Human Review**:
- Prisma schema migrations
- Auth / RBAC / session middleware
- Secret configuration or rotation
- Changes touching >5 files in a session
- Production deployments
- PR merges
- External integration setup

**Cost Control**:
- Uses `ANTHROPIC_API_KEY` from repo secrets
- Scope `claude-auto-review.yml` to `src/**` and `prisma/**` paths only
- Add `if: github.actor != 'dependabot[bot]'` to skip dependency PRs
- Monitor: https://console.anthropic.com/usage

---

### 2. Cursor Pro+ Background Agents (Universal FHE-Agent Pattern)

**Primary Role**: Scoped implementation tasks — fast, cheap, excellent for well-defined work

**Can Do**:
- JSDoc on exported functions
- Zod schemas for existing API endpoints
- Tests for existing logic
- Single-file refactors and renames
- Lint / typecheck fixes
- Webhook handlers following existing patterns
- README and inline docs updates
- Small, well-defined feature additions to existing patterns

**Invocation (3 methods)**:
1. **Issue template**: `[REPO]/issues/new/choose` → select "Cursor Agent Task" → fill form → submit → agent dispatches within ~30s
2. **Comment-driven Q&A**: On any issue/PR, comment `@cursor explain ...` or `q: ...` — agent answers in read-only mode, no branch created
3. **Manual dispatch**: `Actions → cursor-agent-manual.yml → Run workflow` → enter prompt + optional branch prefix + optional model

**Output**:
- Branch: `cursor/issue-N` (label-triggered) or `cursor/manual-N` (dispatch-triggered)
- PR with self-review checklist filled in
- Comment on originating issue with tracking link: `https://cursor.com/agents/[id]`

**Refuses / Adds `requires-human-review` label**:
- `prisma/schema.prisma` changes (any schema migration)
- Auth, RBAC, or session middleware
- Payments, finance, marks retention logic
- New external integrations
- CI/CD or release configuration
- Real PII or production credentials

**Cost**: ~$0.30/task average
**Cap**: Set $25/month at https://cursor.com/settings/billing

---

### 3. Cursor BugBot

**Primary Role**: Automated PR bug detection — Medium/High severity inline comments

**Can Do**:
- Inline PR comments on bugs, logic errors, security issues
- "Fix in Cursor" / "Fix in Web" buttons for quick resolution
- Severity classification (Low / Medium / High)

**Limits**:
- Advisory only — cannot write code autonomously or merge
- Does not replace human review for auth/PII/schema changes
- "Resolve conversation" must be clicked manually after fix is pushed
- Placeholder issues (e.g. `OWNER/REPO` in config files) must be corrected before resolving

**Configuration**: Cursor Settings → BugBot → Enable on repo

---

### 4. GitHub Copilot

**Primary Role**: IDE-level code suggestions and PR review assistance

**Can Do**:
- Inline code completion in editor
- PR review comments via Copilot code review feature
- GitHub Copilot Chat for repo Q&A
- Workspace-aware suggestions based on open files

**Limits**:
- All accepted suggestions require developer review
- No autonomous branch creation or PR opening
- No direct code pushes

---

### 5. Dependabot

**Primary Role**: Automated dependency vulnerability detection and version updates

**Policy**:
- Security PRs: review and merge within 48 hours
- Version update PRs: review weekly in batch
- Never auto-merge without CI passing
- Add `if: github.actor != 'dependabot[bot]'` to auto-review workflows to avoid unnecessary API calls

---

## Task Routing Decision Tree

```
New task received
│
├── Is it a security / auth / schema / PII change?
│   └── YES → Claude Code interactive session + requires-human-review label + human gate
│
├── Is it a multi-file architectural change (>5 files)?
│   └── YES → Claude Code interactive session + human review on PR
│
├── Is it well-scoped (JSDoc, lint, Zod, single-file test, small feature)?
│   └── YES → Cursor Background Agent via issue template
│
├── Is it a PR review question or code explanation?
│   └── YES → @cursor explain comment (read-only, no branch created)
│
├── Is it a dependency vulnerability PR?
│   └── YES → Review and merge Dependabot PR (check CI first)
│
└── Is it a PR bug flagged by BugBot?
    └── YES → Fix in Cursor → push fix commit → resolve conversation → human approve
```

---

## Universal Repo Setup Checklist

Every portfolio repo must have all of the following to meet FHE standard:

### Files
- [ ] `CLAUDE.md` — repo-specific Claude Code conventions
- [ ] `MEMORY.md` — session continuity file
- [ ] `.github/workflows/claude.yml` — Claude Code on-demand action
- [ ] `.github/workflows/claude-auto-review.yml` — automatic PR review
- [ ] `.github/workflows/cursor-agent.yml` — Cursor agent label/comment dispatch
- [ ] `.github/workflows/cursor-agent-manual.yml` — manual Cursor workflow dispatch
- [ ] `.github/workflows/ci.yml` — lint / typecheck / test / build
- [ ] `.github/workflows/codeql.yml` — static security analysis
- [ ] `.github/dependabot.yml` — dependency updates
- [ ] `.github/ISSUE_TEMPLATE/cursor-agent-task.yml` — Cursor Agent Task form
- [ ] `.github/ISSUE_TEMPLATE/bug-report.yml` — structured bug report
- [ ] `.github/ISSUE_TEMPLATE/feature-request.yml` — feature request form
- [ ] `.github/ISSUE_TEMPLATE/config.yml` — template chooser (blank issues disabled)
- [ ] `.github/pull_request_template.md` — PR description checklist
- [ ] `.cursor/agents/FHE-Agent.md` — universal agent persona
- [ ] `.cursor/rules/fhe-conventions.mdc` — always-on coding rules
- [ ] `.cursor/environment.json` — agent build environment

### GitHub Settings
- [ ] Branch protection on `main`: require PR, 1 review, CI checks pass
- [ ] Allow auto-merge: ON
- [ ] Automatically delete head branches: ON
- [ ] Environments: `development`, `staging`, `production`
- [ ] `production` environment requires owner approval
- [ ] Secrets: `ANTHROPIC_API_KEY`, `CURSOR_API_KEY`
- [ ] Dependabot alerts: enabled
- [ ] CodeQL scanning: enabled
- [ ] Cursor GitHub App installed
- [ ] Claude GitHub App installed (via `/install-github-app`)
