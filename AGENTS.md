# Jatlas repository safety rules

These rules are mandatory for every edit, including edits made from another chat/session.

1. Read the latest `main` immediately before editing. Never reconstruct or replace a current file from remembered/stale chat content.
2. Modify only files required by the user's current request. Do not regenerate an entire prefecture/photo module to change a few entries.
3. Never re-add a place listed in `tools/content-guard-policy.json` tombstones.
4. Never create a second tourist spot for an attraction that already exists. Reuse/edit the existing ID.
5. Existing runtime photo mappings are protected against silent changes. Any intentional place/photo/hero change must be declared in `tools/content-change-intent.json` against the last successfully deployed GitHub Pages commit.
6. `tools/content-change-intent.json` is deployment-baseline scoped. Set `baseCommit` to the SHA of the last successfully deployed GitHub Pages commit and list only the IDs/scopes intentionally changed since that baseline. Do not use wildcards or bulk approvals. A failed/unapproved commit never becomes the next baseline just because another commit is pushed.
7. Do not remove or rewrite `dist/content-safety.js`, the regression guard, tombstones, or final photo override files as part of unrelated work.
8. Before claiming deployment is complete, verify the GitHub Pages workflow for the final commit completed successfully. Source committed != live deployment.
9. If a guard fails, fix the underlying change. Do not weaken/disable the guard to make a deployment pass.

The deployment guard intentionally prefers a failed deployment over silently rolling back user-approved photos or reintroducing deleted/duplicate attractions.
10. For any scope present in `dist/photo-registry-data.js`, the canonical registry plus `dist/images/regions/.../` is authoritative. Legacy `commons/`, `licensed/`, `official/`, `qa/`, `regional/`, `user/` paths and old override entries are compatibility-only for that migrated scope; never edit those legacy copies to change the live photo.
11. To replace a canonical photo, keep its canonical ID and file path stable. Replace the bytes and update `sha256`, source metadata, and `revision` in `dist/photo-registry-data.js` in the same commit. Declare the exact before/after values in `allow.canonicalPhotoChanges`. Do not create `-new`, `-final`, `-v2`, or similar replacement filenames.
12. Canonical hero photos are selected only from eligible tourist spots inside the exact currently displayed prefecture/area/town. Never fall back to another area merely to fill a hero image; a one-place scope always keeps that one place.
13. Do not delete migrated legacy image copies until the nationwide canonical migration is complete and a post-migration reference audit reports zero runtime/registry/tool/workflow references. Git history is the archive; do not create new backup/old image folders.
