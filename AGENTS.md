# Jatlas repository safety rules

These rules are mandatory for every edit, including edits made from another chat/session.

1. Read the latest `main` immediately before editing. Never reconstruct or replace a current file from remembered/stale chat content.
2. Modify only files required by the user's current request. Do not regenerate an entire prefecture/photo module to change a few entries.
3. Never re-add a place listed in `tools/content-guard-policy.json` tombstones.
4. Never create a second tourist spot for an attraction that already exists. Reuse/edit the existing ID.
5. Existing runtime photo mappings are protected against silent changes. Any intentional place/photo/hero change must be declared in `tools/content-change-intent.json` against the exact current parent commit.
6. `tools/content-change-intent.json` is commit-scoped. Set `baseCommit` to the immediate parent SHA and list only the IDs/scopes intentionally changed in that commit. Do not use wildcards or bulk approvals.
7. Do not remove or rewrite `dist/content-safety.js`, the regression guard, tombstones, or final photo override files as part of unrelated work.
8. Before claiming deployment is complete, verify the GitHub Pages workflow for the final commit completed successfully. Source committed != live deployment.
9. If a guard fails, fix the underlying change. Do not weaken/disable the guard to make a deployment pass.

The deployment guard intentionally prefers a failed deployment over silently rolling back user-approved photos or reintroducing deleted/duplicate attractions.
