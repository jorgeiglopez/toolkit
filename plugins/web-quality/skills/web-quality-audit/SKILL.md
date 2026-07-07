---
name: web-quality-audit
description: Run a full web quality audit (performance, Core Web Vitals, accessibility, SEO) and produce one scored report. Use when asked to audit a site, review web quality, run a Lighthouse-style audit, check page quality, or optimize a website end to end.
---

# Web quality audit

Orchestrator skill. Fans out to the four dimension skills in parallel, then consolidates their findings into one scored report. Based on Google Lighthouse's audit categories.

## Announce first

Before spawning any subagent, send one line:

> Using the `web-quality-audit` skill to run a full quality pass.

## Order of work

### 1. Scope the target

Identify what's being audited: a live URL, a local dev build, or a codebase without a running instance. If it's a codebase, the dimension agents review source and markup statically rather than running Lighthouse.

### 2. Fan out, one agent per dimension

Spawn four subagents in parallel, one per dimension skill. Each agent should load the matching skill before starting:

| Dimension | Skill | Weight (typical issue share) |
|---|---|---|
| Performance | `performance` | 40% |
| Accessibility | `accessibility` | 30% |
| SEO | `seo` | 15% |
| Core Web Vitals | `core-web-vitals` | 15% |

Give each agent the same scoping context (URL/build/codebase) and ask it to return findings tagged by severity.

### 3. Consolidate

Merge the four findings lists. Do not re-derive or second-guess a dimension agent's severity call; pass it through.

## Severity levels

| Level | Description | Action |
|-------|-------------|--------|
| **Critical** | Security vulnerabilities, complete failures | Fix immediately |
| **High** | Core Web Vitals failures, major a11y barriers | Fix before launch |
| **Medium** | Performance opportunities, SEO improvements | Fix within sprint |
| **Low** | Minor optimizations, code quality | Fix when convenient |

## Report format

```markdown
## Audit results

### Critical issues (X found)
- **[Category]** Issue description. File: `path/to/file.js:123`
  - **Impact:** Why this matters
  - **Fix:** Specific code change or recommendation

### High priority (X found)
...

### Summary
- Performance: X issues (Y critical)
- Accessibility: X issues (Y critical)
- SEO: X issues
- Core Web Vitals: X issues

### Recommended priority
1. First fix this because...
2. Then address...
3. Finally optimize...
```

## Quick checklist

### Before every deploy
- [ ] Core Web Vitals passing
- [ ] No accessibility errors (axe/Lighthouse)
- [ ] No console errors
- [ ] HTTPS working
- [ ] Meta tags present

### Weekly review
- [ ] Check Search Console for issues
- [ ] Review Core Web Vitals trends
- [ ] Update dependencies
- [ ] Test with screen reader

### Monthly deep dive
- [ ] Full Lighthouse audit
- [ ] Performance profiling
- [ ] Accessibility audit with real users
- [ ] SEO keyword review

## Sibling skills

- [performance](../performance/SKILL.md)
- [core-web-vitals](../core-web-vitals/SKILL.md)
- [accessibility](../accessibility/SKILL.md)
- [seo](../seo/SKILL.md)
