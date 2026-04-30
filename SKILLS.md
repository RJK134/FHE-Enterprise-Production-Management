# SKILLS.md — FHE Enterprise Production Management Centre

> Agent capability registry. Defines what each AI agent in the FHE ecosystem can and cannot do, how to invoke each, and how to route tasks to the right agent.

---

## Agent Registry

### 1. Claude Code (Claude Max)

**Primary Role**: Build agent, multi-file code reviewer, PR fixer, architecture planner, documentation generator

**Capabilities**:
- Multi-file codebase analysis and full implementation
- PR review with inline comments pushed directly to the PR branch
- Fix commits pushed to existing PR branches in response to review comments
- Generating rigorous Claude Code prompts for subsequent sessions
- Documentation generation: CLAUDE.md, README, architecture docs, delivery plans
- Test generation for existing logic
- Zod schema creation for existing API endpoints
- Single-file and multi-file refactoring
- GitHub Actions workflow creation (requires human review before merge)
- Dependency audit and remediation planning

**Invocation Methods**:
- **Interactive CLI**: `claude` command in repo directory — for complex multi-file work
- **GitHub Action — on-demand**: Comment `@claude [instruction]` on any issue or PR
- **GitHub Action — automatic**: Triggers on PR open/synchronize via `claude-auto-review.yml`
- **GitHub Action — issue-driven**: Assign issue to Claude or include `@claude` in issue body

**Files Claude Code Reads Every Session**:
- `CLAUDE.md` — build conventions and session protocols
- `MEMORY.md` — prior session context
- `docs/DELIVERY_PLAN.md` — current phase and priorities

**Hard Limits — Stop and Add `requires-human-review` Label**:
- Schema migrations
- Auth/RBAC/session middleware
- Secret or credential configuration
- Changes touching more than 5 files
- Production deployments
- Any change with unclear security implications

**Cost Notes**:
- Uses `ANTHROPIC_API_KEY` from repo secrets
- Scope `claude-auto-review.yml` to `src/**` and `prisma/**` paths only to control cost
- Add `if: github.actor != 'dependabot[bot]'` guard to skip dependency update PRs

---

### 2. Cursor Pro+ Background Agents — Universal FHE-Agent Pattern

**Primary Role**: Scoped, fast implementation tasks — JSDoc, lint fixes, Zod schemas, test coverage, single-file refactors

**Capabilities**:
- JSDoc comments on all exported functions in a file
- Zod validation schemas for existing endpoints
- Unit tests for existing logic
- Single-file refactors and renames
- Lint and TypeScript error fixes
- Webhook handlers following an existing established pattern
- HESA field backfills on existing data models
- README and inline documentation updates

**Invocation Methods**:
1. **Issue template** (primary — use 90% of the time):
   - Go to `github.com/RJK134/[REPO]/issues/new/choose`
   - Click "Cursor Agent Task"
   - Fill in: Action / Scope / Acceptance Criteria / Out of Scope / Persona pre-check
   - Submit → `cursor` label auto-applied → agent dispatches within 30 seconds
   - PR appears 5–15 minutes later on branch `cursor/issue-N`
2. **Comment-driven Q&A** (read-only, no PR created):
   - Comment `@cursor explain [question]` on any issue or PR
   - Comment `q: [question]` on any issue or PR
   - Agent posts markdown answer back — no branch created
3. **Manual workflow dispatch** (no issue required):
   - Go to `Actions → cursor-agent-manual.yml → Run workflow`
   - Fill in: prompt / branch_prefix / model
   - PR appears 5–15 minutes later on branch `cursor/manual-N`

**Guard Rails — Agent Adds `requires-human-review` and Stops If It Detects**:
- Any change to `prisma/schema.prisma` (schema migrations)
- Auth, RBAC, or session middleware changes
- Anything in payments, finance, marks retention, or grade data
- New external integrations (Moodle, Azure AD, OAuth providers, Stripe setup)
- CI/CD workflow or release configuration changes
- Real PII or production credentials

**Cost Control**:
- ~$0.30 average per task
- Set $25/month hard cap: https://cursor.com/settings/billing
- Monitor live at: `https://cursor.com/agents/[agent-id]` (link posted in issue comment)

**Output**:
- Branch: `cursor/issue-N` (label-triggered) or `cursor/manual-N` (dispatch-triggered)
- PR opened automatically with self-review checklist
- Comment posted on source issue with tracking link

---

### 3. Cursor BugBot

**Primary Role**: Automated PR code review — bug detection, logic errors, security issues

**Capabilities**:
- Inline PR review comments with severity classification (Low / Medium / High)
- Detects: bugs, logic errors, security vulnerabilities, type errors, placeholder text
- "Fix in Cursor" button — opens PR locally in Cursor IDE with context
- "Fix in Web" button — cloud-based fix

**Configuration**: Cursor settings → Integrations → GitHub → Enable BugBot per repo

**Post-Fix Process**:
1. Push fix commit to the PR branch
2. Verify `OWNER/REPO` and similar placeholders are resolved
3. Click "Resolve conversation" on the BugBot comment thread
4. Wait for checks to re-run on the new commit
5. Proceed to human review and merge

**Limits**:
- Advisory only — cannot merge, cannot write code autonomously
- Does not replace human review for auth, PII, schema, or financial code
- Comment threads must be manually resolved after fixes are pushed

---

### 4. GitHub Copilot

**Primary Role**: IDE-level code completion and inline PR review suggestions

**Capabilities**:
- Real-time inline code suggestions in Cursor/VS Code
- PR review comments via GitHub Copilot code review feature
- GitHub Copilot Chat for codebase Q&A

**Limits**:
- Suggestions only — all accepted changes require developer review
- No autonomous branch creation or PR opening
- Quality lower than Claude Code for complex architectural changes

---

### 5. Dependabot

**Primary Role**: Automated dependency vulnerability detection and version update PRs

**Capabilities**:
- Security vulnerability PRs — flag and fix known CVEs in dependencies
- Version update PRs — keep dependencies current
- Configurable via `.github/dependabot.yml` per repo

**Policy**:
- **Security PRs**: review and merge within 48 hours — treat as P0
- **Version update PRs**: review and merge in weekly batch
- Never auto-merge — always requires CI pass + human review
- Add `if: github.actor != 'dependabot[bot]'` to Claude auto-review workflow to avoid unnecessary AI review of dep updates

---

## Skill Routing Decision Tree

```
New task arrives
│
├── Security / auth / schema / PII change?
│   └── YES → Claude Code interactive session + mandatory human review gate
│
├── Multi-file architectural change or complex implementation?
│   └── YES → Claude Code interactive session
│
├── Multi-file but @claude comment sufficient? (PR fix, review response)
│   └── YES → @claude comment on the PR
│
├── Scoped single-file task (JSDoc, lint, Zod schema, test for existing logic)?
│   └── YES → Cursor Agent via issue template (Way 1)
│
├── Code explanation or Q&A needed on existing PR/issue?
│   └── YES → @cursor explain comment (Way 3, read-only)
│
├── Dependency vulnerability PR open?
│   └── YES → Review Dependabot PR → merge if CI passes
│
└── BugBot found a bug in a PR?
    └── YES → Fix in Cursor → push fix commit → resolve BugBot thread → human approve
```

---

## Universal Repo Setup Checklist

For every portfolio repo to meet FHE enterprise standard, the following must be deployed:

### Files to Create
- [ ] `CLAUDE.md` — repo-specific Claude Code conventions (use Claude Code Prompt from PROMPTS_LIBRARY.md)
- [ ] `MEMORY.md` — session continuity file
- [ ] `.github/workflows/claude.yml` — Claude Code on-demand action
- [ ] `.github/workflows/claude-auto-review.yml` — automatic PR review on open/synchronize
- [ ] `.github/workflows/cursor-agent.yml` — Cursor agent label/comment dispatch
- [ ] `.github/workflows/cursor-agent-manual.yml` — manual Cursor workflow dispatch
- [ ] `.github/workflows/ci.yml` — lint / typecheck / test / build pipeline
- [ ] `.github/ISSUE_TEMPLATE/config.yml` — template chooser (blank issues disabled)
- [ ] `.github/ISSUE_TEMPLATE/cursor-agent-task.yml` — Cursor task form
- [ ] `.github/ISSUE_TEMPLATE/bug-report.yml` — structured bug report
- [ ] `.github/ISSUE_TEMPLATE/feature-request.yml` — feature request form
- [ ] `.github/pull_request_template.md` — PR checklist
- [ ] `.github/dependabot.yml` — npm + GitHub Actions security scanning
- [ ] `.cursor/agents/FHE-Agent.md` — universal agent persona
- [ ] `.cursor/rules/fhe-conventions.mdc` — always-on coding rules

### GitHub Settings to Enable
- [ ] Branch protection on `main`: require PR + 1 review + CI pass + no bypass
- [ ] Allow auto-merge: ON
- [ ] Automatically delete head branches: ON
- [ ] GitHub Environments: `development`, `staging`, `production`
- [ ] `production` environment protection: require owner approval before deploy

### Secrets to Add
- [ ] `ANTHROPIC_API_KEY` — Settings → Secrets and variables → Actions
- [ ] `CURSOR_API_KEY` — Settings → Secrets and variables → Actions

### Apps to Install
- [ ] Claude GitHub App (via `/install-github-app` in Claude Code CLI)
- [ ] Cursor GitHub App (via cursor.com/settings/integrations)
- [ ] Dependabot enabled (security + version updates)
- [ ] CodeQL scanning enabled (Security → Code scanning → Set up CodeQL)
