---
name: sync-documentation
description: Audit and synchronize repository documentation against code and configuration. Use for documentation drift reviews, read-only audits, or updating affected guides after changes to behavior, commands, dependencies, or project status.
---

# Sync documentation

Invoke `$sync-documentation` to fix evidence-backed documentation drift. Use `$sync-documentation --check` or ask for an audit to get read-only findings. A named directory, feature, or set of changes scopes either mode. For a repository-wide sync, include maintained guides in the root and any workspaces. Discover the project's layout and tooling each time.

## Establish the facts

1. Read the applicable repository instructions. Inventory the README, agent instructions, maintained docs, and any package guides within scope. Use a documentation index when one exists. Identify whose job each guide serves before updating it.
2. Use the request, working diff, or supplied baseline to identify claims likely to have changed. Compare claims about behavior and status with the implementation and relevant tests. Verify commands, versions, configuration, paths, and examples against manifests, lockfiles, CI, schemas, or other project sources. Use the project's defined version policy when checking related packages.
3. Treat plans and proposals as evidence of intent. If a document and the implementation disagree and the intended behavior is unclear, report the discrepancy with references. Keep open decisions and unverified deployment claims explicit.

## Update and verify

In update mode, make the smallest docs edits needed. Update the owning guide first and use links or short summaries in other files. Preserve unrelated edits, document voice, and generated blocks. For schema- or tool-generated docs, identify the source and use the documented generator only when regeneration is in scope. Runtime fixes, version bumps, and release actions require separate authorization.

Verify changed local links and anchors, compare edited commands and examples with their sources, and run relevant repository docs checks when available. In check mode, use read-only inspection and checks. Report each finding with the document, supporting evidence, and proposed correction. In update mode, summarize the files changed, the checks run, and any unresolved discrepancies.
