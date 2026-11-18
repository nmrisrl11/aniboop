---
name: commit-and-push
description: Prepare, commit, and push intended Git changes with a Conventional Commit title and grouped description. Ask for confirmation by default. Supports a one-time --direct option for unattended execution.
---

# Commit and push

Invoke with `$commit-and-push` for the standard workflow. Use `$commit-and-push --direct` to skip the workflow confirmation and optional quality checks for that invocation. An explicit instruction to commit and push directly without confirmation or verification also selects direct mode. A plain request to commit and push uses the standard workflow. These are agent options, and Git never receives them.

## Inspect scope and destination

- Read the repository instructions. Identify the current branch, intended files, staged changes, and push destination. Prefer the user's explicit destination or the configured upstream. If there is no upstream, use the current named branch and the configured push remote, or the sole remote when unambiguous. If the scope or destination is ambiguous, clarify before proceeding.
- Inspect staged, unstaged, and relevant untracked changes. Leave unrelated edits and staged work intact. If unrelated staged changes or mixed hunks cannot be isolated safely, ask the user how to proceed. Check for unintended credentials, generated output, and artifacts using the project's conventions.
- If there are no changes in scope, skip creating a commit. Push existing commits only when the request covers them. Before pushing, account for any outgoing commits beyond the newly prepared one.

## Check and propose

In standard mode, run the repository's applicable formatting check, lint, tests, and build commands as defined by its instructions and tooling. Apply a formatter or fix failures only within the authorized scope. Report unresolved failures or unavailable checks in the proposal and call them out explicitly when requesting confirmation. In direct mode, skip optional checks and formatting. Both modes still inspect the Git scope and destination, honor mandatory project checks, and leave Git hooks and branch protections enabled.

Stage the intended paths or hunks explicitly and review the staged diff. Write a Conventional Commit title in the form `type(scope): imperative summary`. Omit the scope when it adds no clarity. In the body, group meaningful changes under only the applicable headings, such as **Features**, **Fixes**, **Refactors**, **Docs**, and **Chores**.

In standard mode, show the staged scope, full proposed message, check results, and target remote and branch. Ask for one explicit confirmation covering both commit and push, then wait. If the approved scope, message, or destination changes materially, confirm the revised proposal. Direct mode authorizes proceeding after scope and destination review. Required tool and repository approvals still apply.

## Commit and push

Before committing, recheck that the staged snapshot and current branch still match the reviewed proposal. Commit that snapshot with the prepared title and body. Verify the commit succeeded before pushing to the identified remote and branch. Set an upstream on the first push when using a new remote branch. If the push is rejected or blocked, preserve the local commit and report the failure. History rewrites, force pushes, and changing branches require separate authorization.

Report the commit hash and title, push destination and result, and any remaining working-tree changes. In direct mode, report that optional quality checks were skipped.
