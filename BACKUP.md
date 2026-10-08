# Jatlas legacy UI backup · 2026-10-08

This branch isolates the previous site's HTML, CSS, JavaScript, map libraries and maintenance code from production. It is based on main commit 70c3895dfc4969f003506b3bebc29bd2f88a302b.

Shared assets are deliberately excluded: `dist/images/`, `dist/photo-registry-data.js`, `dist/map-canonical-data.js`, and `dist/photo-source-registry.js`. Keep those at their original paths on main; do not duplicate or overwrite them when restoring the UI. Historical full snapshots also remain in Git history.

To restore the previous UI, make a separate worktree of main, copy only the legacy runtime files from this branch, retain the shared paths listed above, then run the content and photo guards before deploying. The exact pre-replacement source is recoverable from commit 70c3895dfc4969f003506b3bebc29bd2f88a302b.

The backup branch is not published and contains no copied image assets.
