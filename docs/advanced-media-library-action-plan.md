# FolioBlocks 1.7 Advanced Media Library Action Plan

## Goal And Status

Build a modern media organization workspace at **Media > Advanced**, inside the traditional WordPress administration shell. Retain the WordPress toolbar and admin sidebar; modernize the content area with a custom organization sidebar and a DataViews-powered collection.

Status: implementation plan, not implemented functionality. Prepared 28 October 2026. Confirmed decisions below come from the “Friendly greeting” conversation and the current project request. Proposed defaults are explicitly identified and can be refined during the prototype milestone.

The feature is for Business and Agency plans. Its native attachment organization layer should support future Dynamic Galleries and an optional enhanced media picker without coupling either to this screen.

## Repository Findings And Conventions

- The plugin root is `folioblocks/`; the correct documentation directory is `docs/` relative to that root.
- Existing plans use descriptive kebab-case Markdown filenames, a goal, scope, architecture, UI, testing, and rollout sections. This document follows that pattern.
- `package.json` and `folioblocks.php` identify the current version as 1.6.0. The plugin header declares WordPress 6.5 and PHP 7.4 minimums. This plan does not change those versions.
- `package.json` uses `@wordpress/scripts` 32.5-compatible tooling and currently declares API Fetch, Icons, and Interactivity dependencies. DataViews is not a declared dependency; a working build and dependency strategy must be proven before implementation proceeds.
- `folioblocks.php` owns menu registration, premium module loading, and shared editor data. Existing premium PHP, admin, JS, and CSS files live under `includes/pro/`.
- `includes/pro/php/proofing-gallery.php` provides an existing Business/Agency entitlement pattern: premium access plus explicit `business` or `agency` plan checks. Reuse the pattern through a media-specific helper rather than assuming generic Pro access is sufficient.
- Existing media metadata code is in `includes/pro/php/media-metadata.php` and `includes/pro/admin/media-metadata.php`. Audit its attachment hooks and fields before adding a second editing surface.
- [Dynamic Galleries Action Plan](dynamic-galleries-action-plan.md) already proposes Business/Agency native media sources. Share query semantics with that roadmap; this release does not imply that Dynamic Galleries already exist.
- Preserve existing unrelated working changes. No implementation or synced reference files need modification to deliver this plan.

## Confirmed Product Decisions

| Area | Decision |
| --- | --- |
| Entry point | Add Media > Advanced; preserve Media Library and Add New behavior. |
| Shell | Keep the traditional WordPress admin sidebar and toolbar visible. No full-screen Site Editor replacement. |
| Organization sidebar | File Types first, Categories second, Tags third. |
| File Types | All, Images, Video, Audio, Documents, each with an icon before the label. These are MIME filters, not taxonomy terms or sorting modes. |
| Categories | User-defined hierarchical virtual folders, nested at arbitrary supported depth; configurable folder colors. |
| Tags | Separate, flat user-defined taxonomy. |
| Membership | Attachments may belong to multiple categories and multiple tags. |
| Parent selection | Include attachments assigned directly to that category or any descendant. Deduplicate by attachment ID. |
| Counts | Display file counts beside categories and tags. Category totals include descendants and count each attachment once. Tags have no descendants. |
| Collection | DataViews grid and table/list presentation, search, filters, sorting, pagination, multi-selection. |
| Assignment | Drag one or multiple selected files onto a category or tag to add that relationship. Preserve existing relationships. |
| Storage | Native attachments, attachment taxonomies, term metadata, and a protected REST layer. No physical directory moves, URL rewrites, or duplicate uploads. |
| Roadmap | Reuse organization and queries for Dynamic Galleries and an optional media-picker replacement later. |
| Access | Business and Agency premium entitlement, enforced server-side as well as in the UI. |

## Release Scope

### FolioBlocks 1.7 MVP

- New Advanced screen, both collection presentations, upload entry point, attachment details editing, and responsive organization navigation.
- Category/tag creation, rename, removal, category parent editing, category colors, and safe assignment/removal operations.
- Recursive filtering and exact unique counts, combined MIME/taxonomy/search/date/author filtering, stable sorting, paged server results.
- Multi-selection, accessible bulk assignment, pointer drag-and-drop, feedback, retry, and compensating undo for assignments.
- Business/Agency gating, permission enforcement, scoped assets, translations, accessibility, regression and performance coverage.

### Deferred

- Default replacement of the native Media Library or WordPress media modal.
- Dynamic Gallery block rendering, external providers, cloud sync, physical file organization, AI tagging, and external folder-plugin migration.
- Dragging categories to reparent them; use an explicit parent field first.
- Saved shared views, global “select all matching” jobs, and background indexing unless profiling makes them necessary.
- A destructive “move to category” command. A future move must explicitly name source assignments being removed; the MVP drop action always adds.

## UX Specification And Mockup Preservation

The earlier conversation contained two interactive conceptual layouts: a general DataViews workspace and the refined File Types / Categories / Tags layout. Retrieved conversation text preserves their structure and describes simulated assignment by selecting an item and clicking a target. Executable mockup assets and exact visual measurements were not available in the retrieved history. The wireframes and reconstruction instructions here preserve the known design intent; measurements below are proposed defaults, not recovered original values.

### Desktop Workspace

```text
+----------------------+---------------------------------------------------------+
| WordPress admin      | WordPress toolbar                                       |
| Dashboard            +---------------------------------------------------------+
| Posts                | Media Library / Advanced                  [Add Media]   |
| Media                | Manage and organize your media                          |
|   Library            +----------------------+----------------------------------+
|   Add New            | FILE TYPES           | Portfolio                        |
| > Advanced           | [stack] All          | Includes subcategories           |
| Pages                | [image] Images       | [Search media...] [Filters]      |
| FolioBlocks          | [video] Video        | [Newest first v] [Grid | List]   |
| ...                  | [audio] Audio        | Images x  Portfolio x  Clear all |
|                      | [file] Documents     +----------------------------------+
|                      |                      | [ ] photo   [ ] photo  [ ] video |
|                      | CATEGORIES       [+] |     title       title      title |
|                      | v [blue] Portfolio 5 |                                  |
|                      |     [green] Sports 3 | [ ] photo   [ ] audio  [ ] doc   |
|                      |     [gold] Portraits 2|    title       title      title |
|                      | > [gray] Clients   1 |                                  |
|                      |                      +----------------------------------+
|                      | TAGS             [+] | 1–40 of 125          [<] 1 [>]   |
|                      | [tag] Featured     2 |                                  |
|                      | [tag] Getty        1 |                                  |
+----------------------+----------------------+----------------------------------+
```

Counts in this wireframe are illustrative library totals. The main result total reflects all active filters and may differ; the count policy is specified below. Folder labels represent colored folder icons, not color-only text. Keep the organization sidebar distinct from the outer WordPress sidebar.

Proposed layout defaults:

- Header with one h1, concise description, and Add Media button. The active collection title appears above the result controls.
- Organization sidebar approximately 240 px wide on desktop, with a divider, readable labels, right-aligned counts, and independently scrollable long term lists. Main content flexes to remaining width without overlapping the admin menu.
- Section headings in subtle uppercase styling. File types use consistent WordPress icons; folders use color swatches on the folder glyph; tags use a tag glyph.
- Selected rows use background, visible focus/selection treatment, and accessible current-state labeling. Expansion chevron and row selection are separate controls.
- Grid cards use generated thumbnails, contained placeholders for non-images, filename/title, type indication, and a checkbox. Do not download full originals to render thumbnails.
- List view uses the DataViews table layout with thumbnail, title/filename, type, categories, tags, upload date, and author. Optional size/dimensions columns can follow verified metadata availability.
- Default sort: upload date descending with attachment ID as a deterministic tie-breaker. Title ascending/descending and oldest/newest are MVP options. Only expose sorts the server actually supports.

### Selection And Assignment State

```text
Portfolio                         3 selected [Clear selection]
[Assign categories] [Add tags] [Remove assignment...]

[checked photo] [checked photo] [checked photo]
                 drag preview: “3 files”
                         |
                         v
  [folder] Sports   3    <- highlighted valid target: “Add to Sports”

Notice: Added 3 files to Sports. [Undo]
```

- A title/thumbnail opens attachment details; checkbox selection is a separate action. Keyboard and screen-reader users can select and assign without dragging.
- Dragging an already selected item carries the current selection. Dragging an unselected item carries only that item, with a clear preview; it does not silently include unrelated selections.
- Start dragging only after a movement threshold; ordinary clicks remain navigation or selection. Escape cancels. Highlight only valid category/tag targets, never File Types or section headings.
- A drop adds membership to exactly the target term. Assigning Sports does not persist a second Portfolio relationship merely because Portfolio is its parent.
- Existing membership is a successful no-op. Duplicate drops/retries do not create duplicate relationships. Report added, already assigned, skipped, and failed totals honestly.
- Hovering a collapsed parent may expand it after a short delay; expansion alone does not assign. Include sidebar autoscroll for long lists, subject to accessibility QA.
- Term clicks normally filter. Do not carry the conceptual mockup's “select then click target to assign” shortcut into production; explicit bulk actions and drag targets avoid ambiguous navigation.
- Proposed MVP selection scope: explicit IDs across pages of the same query, with a persistent selected count. Changing search or filters clears selection with an announcement; changing presentation does not. “Select page” selects only visible results. No implicit selection of unseen matching files.
- While a mutation is pending, prevent duplicate action submission and expose progress. If a response is partial, keep failed IDs available for retry and reconcile successful rows and counts.
- Undo removes only relationships created by that operation, never pre-existing membership. Concurrent changes require revalidation; do not promise transactional restoration of another editor's work.

### Category And Tag Management

```text
Create category                         Edit category: Sports
Name [Sports________________]           Name [Sports________________]
Parent [Portfolio          v]           Parent [Portfolio          v]
Color  [blue][green][gold][gray][custom]  Color  [green] [Reset]
[Cancel] [Create category]               [Cancel] [Save changes]
```

- Category creation offers name, optional parent, and folder color. Tag creation offers a name only. Use term IDs in storage and full ancestor paths in ambiguous labels.
- Context menus offer Rename/Edit, Add subcategory (categories), and Delete. Make menus keyboard reachable and usable without hover.
- Validate empty names, duplicates under native taxonomy rules, invalid parents, cycles, missing terms, and permitted color format on the server. Color is decorative; retain names, folder glyphs, focus contrast, and system default fallback.
- Proposed deletion policy: confirmation explicitly states that files remain in the library, target relationships are removed, and direct children are reparented to the deleted category's parent. Preserve children's relationships. Implement and test this policy explicitly rather than relying on an unspecified side effect.
- Reparenting changes recursive results/counts immediately but does not rewrite attachment memberships. Editing a color must not trigger a media requery.
- Removing assignment is an explicit action with named terms. In a parent view, distinguish a direct Portfolio relationship from membership inherited through Sports; removing a direct parent relationship does not remove Sports.

### Search, Filters, And Navigation

- Maintain one canonical query state for sidebar, active chips, DataViews controls, result count, and REST requests. File Type, category, tag, date, author, and search intersect (AND between dimensions).
- Proposed MVP: one category navigation target, one tag navigation target, and one file-type target at a time. Selecting another target replaces only that dimension; All clears only the MIME filter. Clear all resets the complete query. More complex multi-term OR/AND builders are deferred.
- Category selection uses the full descendant closure; tag selection matches the exact tag. Expansion state never changes the active query.
- Search is server-side; proposed scope is title, caption, and description using supported WordPress search behavior. Filename search requires an explicit compatibility implementation and test before the UI claims it. Label any narrower scope clearly.
- Debounce typing (proposed 300 ms), cancel/ignore superseded requests, reset page on query changes, and retain stable pagination on successful assignment where possible.
- Encode shareable query state in the screen URL and support browser Back/Forward. Store layout, density/columns, sort, and tree expansion per user/site, with versioned validation. Do not persist selection.
- Documents uses an explicit reviewed allowlist of supported document MIME types, not “everything that is not an image.” All includes other allowed uploads even when they have no dedicated type row. Do not change WordPress upload permissions or enable SVG through this feature.

### Counts And Empty States

- Proposed MVP count policy: sidebar numbers are stable totals for the current user's accessible, non-trashed library, independent of search, MIME, date, category, and tag filters. The main result total is the exact active-query total. Add help text: “Library totals; category counts include subcategories.” This policy needs product sign-off before UI freeze.
- Categories count DISTINCT attachment IDs in the union of the category and its descendants. Never sum child totals. Tags count DISTINCT attachments assigned to that exact tag. Do not add tag counts together as a library total.
- Use identical visibility/status rules for counts and results. Counts must not reveal inaccessible media. Do not show zero as a placeholder while counts load; use a skeleton or unavailable indicator.
- Empty library: Add Media action. Empty filtered result: show active scope and Clear filters. Empty category/tag: explain assignment and offer upload/assign guidance. Retain zero-count terms so users can organize before uploading.
- Distinguish loading, network failure, permission denial, entitlement loss, deleted active term, missing thumbnail, and malformed query. Supply retry where useful and avoid replacing the whole admin shell with an error.

### Details, Upload, Responsive Behavior, And Accessibility

- Attachment details panel/dialog shows preview, filename, MIME, dimensions/size when available, date/author, and editable title, alt text (images), caption, description, categories, and tags. Reuse existing metadata behavior without reprocessing metadata unnecessarily.
- Use DataForm where verified compatible; provide explicit Save/Cancel, dirty-state warning, validation, focus return, and server errors. Do not treat DataForm as storage or authorization.
- Add Media opens a native upload flow initially. Refresh queries/counts after completion. Proposed MVP uploads remain unassigned until explicitly assigned; automatic assignment to the active category is an open decision.
- On narrow screens, keep the WordPress shell's native behavior and place organization navigation in a labeled drawer. Show active scope chips after closing it. Use fewer grid columns or a compact list without horizontal page overflow.
- Keyboard bulk assignment provides full parity with dropping. Follow native component semantics, visible focus, labeled controls, accessible dialogs, live announcements, reduced-motion preference, RTL, and high-contrast support. Avoid nested clickable card controls with conflicting keyboard behavior.

### Prototype Reconstruction And Review Deliverables

1. Build a disposable interactive prototype inside the traditional admin shell; do not create a stand-alone full-screen app.
2. Reproduce the refined sidebar order, icons, nested colored folders, counts, grid/list toggle, search, filters, active chips, and Add Media position from the wireframe.
3. Include fixtures Portfolio > Sports / Portraits, Clients > Nike, and flat tags Featured / Getty; include overlapping memberships, zero-count terms, and non-image files.
4. Demonstrate filtering separately from assignment, multi-select drops, additive membership, undo, list view, details editing, category color/parent editing, and responsive navigation.
5. Capture normal, selected, drop-target, empty, loading, partial failure, and mobile states. Save prototype source and annotated screenshots under a future `docs/advanced-media-library/` directory and link them here when created.
6. Review with the product owner before production styling. Record deviations from these specifications and approve changes explicitly. This document delivers reconstruction directions; it does not claim to contain the original executable demos.

## Data Model And Query Semantics

Proposed identifiers (confirm collision checks before registering):

```text
attachment taxonomy: fbks_media_category (hierarchical)
attachment taxonomy: fbks_media_tag      (nonhierarchical)
category term meta:  fbks_folder_color  (validated hex color or empty/default)
REST namespace:     folioblocks/v1
```

- Register on `init` for `attachment`, with explicit capabilities and REST schema. Use `show_in_rest` where native term/attachment endpoints are appropriate. Keep these taxonomies separate from post categories/tags and existing gallery filter labels.
- Proposed defaults: no public taxonomy archive/rewrite; organization metadata is editorial data, not a public collection API. Audit core REST exposure, embedded media responses, and term metadata auth rather than assuming `public: false` alone protects data.
- Use WordPress term relationships and term meta, not a serialized master folder option or filesystem paths. A schema/version option may track migrations; no custom table initially.
- Parent matching uses `WP_Tax_Query` with `include_children: true`; tag matching is exact. Centralize allowed MIME mapping, statuses, visibility, and sorting in reusable PHP query helpers.
- Do not infer visible sidebar totals from the stored `term.count`: direct term counts do not provide the required recursive unique union. Attachment count callbacks also require care with unattached uploads. Implement a distinct-ID aggregation with explicit status and permission rules; choose a native direct-count callback only for its separate documented purpose.
- Relationships survive deactivation/downgrade. No uninstall deletion by default; any future cleanup must be an explicit documented opt-in.

Example count fixture (all files visible and non-trashed):

| Attachment | Direct categories | Tags |
| --- | --- | --- |
| A | Portfolio, Sports | Featured |
| B | Sports, Portraits | Featured, Getty |
| C | Portraits | None |
| D | Sports, Clients | None |
| E | Portfolio | None |

Expected: Portfolio = 5; Sports = 3; Portraits = 2; Clients = 1; Featured = 2; Getty = 1. Portfolio results contain A–E once each. With Images active and only A/B images, the main Portfolio result is 2 while its stable sidebar total remains 5. Repeat with a grandchild, an unattached upload, a trashed file, and a restricted attachment.

## Architecture And Integration

```text
Traditional WP admin shell
  Media > Advanced
    Custom organization sidebar + DataViews + details form
                     |
            Canonical query/selection state
                     |
          API adapter / normalized attachment records
                     |
   REST permissions + entitlement + query/mutation services
                     |
     Native attachments / term relationships / term meta
                     |
       Future Dynamic Galleries and optional picker adapters
```

### Component Responsibilities

- **DataViews:** collection presentation, field definitions, controls, selection integration, actions, and pagination UI. Server queries remain authoritative; do not load all media and use client-only filtering on a single page.
- **DataForm:** candidate for attachment/term detail editing using normalized field definitions. Keep custom hierarchy/color controls where necessary and a native-components fallback if the chosen version cannot support the required form.
- **DataViewsPicker:** future optional selection surface, not the management workspace and not a drop-in replacement for `wp.media`. Later work must bridge selected IDs, ordering, MIME restrictions, upload, cancellation, and caller contracts.
- **Custom React sidebar:** hierarchy, icons, colors, term menus, counts, and drop targets using WordPress components and design conventions.
- **Independent PHP services:** query normalization, descendant filtering, counts, assignment, permissions, and entitlement reusable without any DataViews dependency.

Current official [DataViews documentation](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dataviews/) describes these three component roles. Version-specific exports, layouts, styling, and import paths must be verified against the pinned package; documentation for the latest package is not proof of WordPress 6.5 availability. Limit the initial UI to APIs demonstrated by the compatibility spike.

### Proposed Modules

```text
includes/pro/admin/advanced-media-library.php       screen registration/render/enqueue
includes/pro/php/media-library-taxonomies.php      taxonomy/meta registration
includes/pro/php/media-library-query.php           normalized query/count helpers
includes/pro/php/media-library-rest.php            protected endpoint controllers
includes/pro/php/media-library-access.php          entitlement/capability helpers
src/advanced-media-library/                        proposed app entry/components/store/styles
build/advanced-media-library/                      proposed generated release assets
```

These are proposed additions, not existing files. Confirm how a non-block entry is built with the current scripts setup. Update premium package stripping rules for generated app assets, not only `includes/pro/`. Enqueue JS/CSS only on this screen using the returned screen hook. Scope all app styles and load appropriate WordPress/component styles without changing other admin pages.

### REST Contract

Prefer native attachment reads/updates and taxonomy controllers where their permissions/query shape match requirements. Add focused custom routes where needed; avoid two conflicting write paths. Proposed contract:

| Route | Purpose |
| --- | --- |
| GET `/folioblocks/v1/media-library/items` | Normalized paged results, total items/pages, allowed query fields. |
| GET `/folioblocks/v1/media-library/organization` | Term tree, flat tags, colors, visibility-scoped counts. Paginate/search large term sets as required. |
| POST `/folioblocks/v1/media-library/assignments` | Bounded list of attachment IDs, term IDs, taxonomy, and explicit add/remove operation. |
| Term CRUD via core REST or dedicated protected routes | Create/edit/delete terms, validate parents and color metadata. Choose one route family during the spike. |

- Return normalized attachment IDs, editable fields, thumbnail URL, MIME, direct term IDs, relevant metadata, and permitted actions. Return pagination independently of the page array.
- Validate IDs, limits, sort enums, taxonomy, MIME filters, and hierarchy. Use bounded pages (proposed 40 default, 100 maximum) and bounded mutation batches (proposed 100 IDs), with client chunking/progress above that limit.
- Every route has a permission callback. Require authenticated REST nonce/cookie behavior, feature entitlement, and object/term capabilities. Nonces do not replace capability checks.
- Query and count visibility must mirror applicable core attachment permissions and site restrictions. Do not fetch everything as an administrator and filter afterward in JavaScript.
- Read access to the screen starts with `upload_files`; changing each attachment requires its `edit_post` capability. Term manage/edit/delete/assign capabilities must be mapped intentionally; proposed creation/deletion is restricted to users allowed to manage this organization taxonomy, not all uploaders automatically.
- Return per-item mutation outcomes for partial failures; do not claim atomic multi-file updates. Use append semantics for adds and targeted removal semantics for removes. Guard read-modify-write races when preserving unrelated assignments.
- Escape output and sanitize names/colors. Use prepared SQL if aggregation needs custom queries. Do not expose private URLs, hidden terms, counts, or metadata through unauthorized requests.

## Licensing And Lifecycle

- Add a central helper such as `fbks_can_use_advanced_media_library()` following the existing premium plus Business/Agency pattern. Keep license entitlement and WordPress user permission checks separate.
- Enforce entitlement at page rendering, custom REST reads/writes, taxonomy management exposure, and premium asset loading. Test direct requests as well as hidden controls.
- Free and lower-tier Pro builds retain the native library. An unobtrusive upgrade link/locked entry is optional; do not insert blocking promotions into native upload workflows.
- On entitlement loss, preserve attachments, term relationships, and colors; disable premium management with an explanatory screen and native-library link. Decide and document whether read-only taxonomy registration remains in premium code so data can recover cleanly on renewal.
- Audit core taxonomy/attachment REST routes: custom-route gating alone cannot protect equivalent writes exposed through core routes. Specify intended metadata read access separately from premium write access.
- Define the downgrade behavior of future live Dynamic Galleries separately before that feature ships; do not silently remove existing gallery content as a side effect of this release.

## Performance And Compatibility

- Run an early compatibility spike on WordPress 6.5 and the latest stable version available at implementation time, with and without Gutenberg. Record the exact tested package/core versions.
- Determine whether to bundle the required DataViews dependencies or use available registered scripts; verify `@wordpress/scripts` dependency extraction and generated asset files on the minimum core. Do not assume a global `wp.dataviews` exists. If necessary, choose a compatible pinned package or make a separately approved minimum-version change.
- Maintain PHP 7.4-compatible syntax unless the project explicitly raises its minimum. Validate production builds, CSS dependencies, RTL assets, translations, and premium/free ZIP contents.
- Avoid one count query per term and N+1 thumbnail/meta requests. Batch relationships/metadata, cache descendant closures, and use bounded payloads. Lazy-load deep branches or term searches when large trees require it.
- Cache counts by site, visibility scope, taxonomy generation, and relevant permission context. Never reuse an administrator's counts for restricted users. Prefer exact uncached queries over an incorrectly scoped cache.
- Invalidate on relationship add/remove, term create/delete/reparent, attachment upload/delete/trash/restore/status changes, and external changes through core/plugin hooks. Validate cross-tab refresh and reload behavior.
- Use generated image sizes, native lazy loading where appropriate, and request cancellation. Keep details/selection state independent of unloaded result pages.
- Benchmark 1k, 10k, and 100k attachments with shallow/deep terms and overlapping memberships; include 1k+ terms. Proposed budgets on a documented reference environment: warm first-page query under 1 second p95, warm counts under 1 second p95, UI interaction feedback within 100 ms excluding network. Measure cold-cache behavior separately and record hardware, database, query count, payload, and browser metrics. Budgets are targets, not guarantees.
- Check multisite isolation, collapsed admin menu, classic/block editors, supported browsers, media offload URLs, MIME plugins, object caches, media permission plugins, and existing folder/taxonomy plugins. No automatic taxonomy merging or physical folder migration.

## Phased Implementation Milestones

### M0 — Compatibility And UX Proof

Tasks:

- [ ] Audit exact build/lockfile setup, premium packaging, attachment metadata integrations, and entitlement lifecycle.
- [ ] Prove a production-built non-block app with real attachments, server pagination, DataViews grid/table, and minimum-core styling.
- [ ] Evaluate DataForm and future DataViewsPicker separately; record supported APIs and fallback choices.
- [ ] Reconstruct and review the interactive prototype and capture the specified states.
- [ ] Resolve count policy, document MIME map, selection policy, term permissions, and dependency/minimum-version strategy.

Exit criteria: approved visual/behavior specification, recorded compatibility matrix, demonstrated build on minimum/latest core, and no unverified package export assumptions in the implementation design.

### M1 — Native Organization And Protected API

Tasks:

- [ ] Add taxonomy/term-meta registration and schema versioning without converting existing media.
- [ ] Implement canonical query normalization and recursive unique result handling.
- [ ] Implement visibility-correct count aggregation and invalidation.
- [ ] Add protected reads, term CRUD, bounded additive/removal mutations, and per-item outcomes.
- [ ] Add entitlement/capability checks across custom and equivalent core routes.
- [ ] Add integration tests for overlap, descendants, permissions, status changes, and idempotency.

Exit criteria: fixture totals match exactly; arbitrary-depth descendants are included once; inaccessible media cannot be inferred; native file paths and URLs remain unchanged after organization changes.

### M2 — Complete Browsing Workspace

Tasks:

- [ ] Register Media > Advanced and load assets only there.
- [ ] Build the ordered sidebar, tree navigation, colors, tag rows, and counts.
- [ ] Connect grid/list, fields, server search/filters/sort, pagination, active chips, and URL navigation.
- [ ] Add per-user preferences, upload refresh, attachment details, and term editing dialogs.
- [ ] Implement loading/empty/error/locked states and responsive drawer.

Exit criteria: both views show identical query results; filter combinations and Back/Forward work; details save/reload accurately; WordPress admin navigation and native library remain functional.

### M3 — Selection And Assignment

Tasks:

- [ ] Implement explicit selection scope, cross-page IDs, and page selection.
- [ ] Add bulk category/tag assignment and explicit targeted removal.
- [ ] Add drag preview, valid target highlighting, additive drop behavior, cancel, progress, and retry.
- [ ] Implement compensating undo with operation-specific relationship tracking.
- [ ] Reconcile rows, selection, counts, and active-query changes after mutations.
- [ ] Complete keyboard, touch, screen-reader, and concurrent-update QA.

Exit criteria: three selected files can be added to a nested category/tag without removing any prior membership; duplicate drops are safe; partial failures are accurate; equivalent actions work without dragging.

### M4 — Hardening And Business/Agency Beta

Tasks:

- [ ] Execute the compatibility/security/accessibility/performance matrix and resolve release blockers.
- [ ] Verify free, Pro, Business, Agency, expired/downgraded, and renewed access states.
- [ ] Validate release ZIPs, scoped assets, translation extraction, upgrade/deactivation recovery, and no gallery regressions.
- [ ] Publish feature help, limitations, count semantics, release notes, and support diagnostics without sensitive media data.
- [ ] Run a controlled Business/Agency beta using real large libraries and review measured results.

Exit criteria: no critical permission/data-loss defects; agreed performance budgets met or documented scope adjustments approved; native workflows pass; prototype deviations are reviewed; release checklist is signed off.

### M5 — Future Reuse (Separate Scope)

- [ ] Connect Dynamic Gallery native sources to the same query service, recursive defaults, deduplication, and invalidation contract.
- [ ] Build an opt-in picker adapter with DataViewsPicker only after callers' selection contracts are proven.
- [ ] Evaluate saved views, select-all jobs, external sources, and interoperability based on measured demand.

Exit criteria: future features reuse organization semantics without importing the management app or changing existing curated gallery behavior.

## Acceptance And Testing Matrix

| Scenario | Required result |
| --- | --- |
| Open Advanced | Outer WordPress sidebar/toolbar remain; File Types, Categories, Tags appear in order. |
| Select Images + Portfolio + Featured | Server returns the intersection, including descendants, once per attachment. |
| Parent/direct/child overlap | Fixture Portfolio count is 5, not the sum of overlapping child/direct counts. |
| Grandchild/unattached upload | Included under each ancestor if visible and non-trashed. |
| Add same assignment twice | Second operation is a no-op; other category/tag memberships persist. |
| Drag selected files to Sports | Only explicit selection is added to Sports; files stay at original URLs/paths. |
| Undo an add | Removes only new relationships introduced by that operation. |
| Remove direct Portfolio from A | A remains visible under Portfolio through Sports. |
| Rename/color/reparent/delete | UI and counts reconcile; files survive; documented child reparenting policy holds. |
| Trash/restore/delete externally | Counts/results update correctly after invalidation/refresh. |
| Page/filter/view changes | Explicit selection rules apply; server totals and pagination remain accurate. |
| Restricted author or role | Results, totals, term counts, and mutations respect object permissions. |
| Unauthorized/core-route request | No bypass of taxonomy writes, private data, or entitlement restrictions. |
| Partial batch/concurrent edit | Accurate per-file outcomes; no wholesale replacement of unrelated relationships. |
| Entitlement downgrade/renewal | No data deletion; management gates correctly; organization returns after renewal. |
| Keyboard/touch/RTL | Navigation, details, assignment, dialogs, and focus are usable without pointer dragging. |
| Native Media Library/editor/gallery | Upload, wp.media selection, metadata editing, and existing gallery output regressions absent. |

Automated coverage should include PHP query/count/capability integration tests with real attachment fixtures, REST schema/nonce/permission tests, JS query/selection/mutation state tests, and end-to-end browsing/assignment/details flows. Add adversarial IDs, invalid parent cycles, unsupported MIME values, HTML names, huge batches, stale terms, out-of-order responses, and color sanitization cases.

Manual QA should cover visible focus, screen-reader announcements, touch assignment, small screens, zoom, high contrast, reduced motion, translations, long names/deep trees, broken thumbnails, network failures, uploads while filtered, and performance traces. Use the repository's relevant build/lint/release checks at implementation time; documentation delivery does not require changing dependencies or building the plugin.

## Risks And Mitigations

| Risk | Mitigation / release gate |
| --- | --- |
| DataViews changes or missing core dependencies | Pin and isolate UI adapters; prove minimum-core bundle before committing to APIs. |
| Inflated or leaked counts | DISTINCT aggregation, shared visibility policy, scoped caches, overlap and restricted-user fixtures. |
| Lost memberships during bulk writes | Append/targeted remove operations, bounded batches, concurrency tests, operation-specific undo. |
| Folder metaphor implies physical movement | Use “Add to category” language and brief virtual-folder guidance. |
| Premium route bypass | Audit native REST exposure and taxonomy capability mapping, not only custom controllers. |
| Large media/term libraries | Server pagination, batched counts, lazy term loading, measured profiling before custom tables. |
| Third-party taxonomy/offload conflicts | Unique names, no implicit imports, core attachment IDs and URLs, targeted compatibility matrix. |
| Global admin styling regressions | Screen-specific assets and scoped selectors; compare native library/editor before release. |
| Scope grows into picker/gallery rebuild | Ship the management workspace first; keep future consumers as separate milestones. |

## Open Decisions And Proposed Defaults

Resolve before the relevant milestone exits; do not treat these as already approved conversation decisions.

1. **Count context (M0):** adopt stable permission-scoped library totals, with a separate filtered result total, or make sidebar counts contextual? Contextual counts require an explicit facet definition and cache/performance review.
2. **Dependencies/minimum core (M0):** choose exact pinned versions, supported exports/imports, bundling strategy, and whether WordPress 6.5 can remain supported without UI compromises.
3. **MIME/search details (M0):** finalize Documents allowlist, filename-search behavior, supported date/author filters, and sort fields.
4. **Term permissions (M0/M1):** determine who can create/edit/delete shared categories/tags versus assign existing terms; document role defaults and customization hooks.
5. **Selection (M0):** approve explicit cross-page IDs within a query and clear-on-filter-change behavior. Global select-all remains deferred.
6. **Deletion/reparenting (M0/M1):** approve child reparenting to the deleted parent's parent and whether deeper nesting needs a practical UI guardrail.
7. **Upload context (M2):** leave new uploads unassigned by default or offer an explicit “Add uploads to current category” checkbox?
8. **Colors/order (M2):** approve palette/custom colors, default fallback, alphabetical sibling/tag order, and whether manual ordering is needed later.
9. **Downgrade exposure (M1/M4):** settle read-only taxonomy registration and metadata access after entitlement loss; preserve data in every case.
10. **Release capacity (M0):** assign owners and estimates after the compatibility spike; do not promise a calendar date before its results.
11. **Future consumers (M5):** decide which FolioBlocks picker callers receive the first opt-in replacement and how dynamic gallery licensing behaves on downgrade.

## Reference Notes

- Product source: “Friendly greeting,” conversation `6ae1c581-cce0-83eb-ab54-69ff57a3d88f`; retrieved decisions and mockup descriptions, plus the current implementation-plan request.
- [WordPress DataViews package documentation](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dataviews/) — component roles and version-specific integration reference; checked 28 October 2026.
- [WordPress register_taxonomy reference](https://developer.wordpress.org/reference/functions/register_taxonomy/) — attachment registration and count-callback caveats; checked 28 October 2026. Recursive visible unique totals still require the explicit service specified above.
- [Dynamic Galleries Action Plan](dynamic-galleries-action-plan.md) and [Global Settings Action Plan](global-settings-action-plan.md) — local roadmap and documentation conventions; proposed files in older plans should not be mistaken for current implementation.
