# Proofing Gallery Admin Bar Action Plan

## Goal

Add a live Proofing Gallery indicator to the WordPress admin bar after the 1.5.0 release.

The admin bar item should let site owners see, at a glance, whether a client is actively proofing a gallery. Opening the item should show the relevant proofing sessions and identify which published post or page is being proofed.

The feature should be intentionally quiet. FolioBlocks should not add permanent clutter to the WordPress admin bar; the icon should appear only when there are proofing sessions that need attention.

## Current Codebase Findings

The core presence system already exists.

Existing proofing session storage:

- `includes/pro/php/proofing-gallery.php` registers the private `fbks_proof_session` post type.
- Proofing sessions store page, gallery, client, status, presence, last seen, updated time, and image selections in post meta.
- `FBKS_PROOFING_ACTIVE_WINDOW_SECONDS` is currently `120`, so a session can be considered active when its last seen timestamp is within that window.
- The frontend sends presence updates through `folioblocks/v1/proofing-gallery/session/presence`.
- `src/proofing-gallery-block/view.js` sends active presence immediately, refreshes it every 45 seconds, and sends closed presence on page hide or hidden visibility state.

Existing admin proofing UI:

- `includes/pro/admin/proofing-sessions.php` already renders the Proofing Sessions admin page.
- `fbks_can_manage_proofing_sessions()` limits the admin proofing UI to `manage_options`, Pro, and the Business plan.
- `fbks_get_proofing_session_display_status()` already converts raw status and presence into labels such as `Viewing Now`, `Saved, Closed`, and `Window Closed`.
- `fbks_get_proofing_sessions_for_admin()` already returns admin-facing session data.

Existing admin list visibility:

- Published posts and pages already get a Proofing column when proofing sessions are available.
- `fbks_get_in_progress_proofing_sessions_by_page_ids()` is optimized for checking sessions by post/page IDs.

The main missing piece is a compact, live admin bar surface plus a polling endpoint for keeping it accurate without refreshing wp-admin.

## Recommended Product Model

Use the admin bar as a live status surface, not as a full management screen.

Recommended behavior:

- Show a Proofing Gallery admin bar item only for users who can manage proofing sessions and only when there are active or unfinished proofing sessions.
- Use the existing Proofing Gallery icon from `includes/icons/pb-proofing-gallery.svg`.
- Change the icon color when at least one session is actively being viewed.
- Include a count badge when active or unfinished sessions exist.
- Open a dropdown from the admin bar item.
- Link each row to the existing `FolioBlocks > Proofing Sessions` detail page.
- Include a link to the full Proofing Sessions page at the bottom.

Recommended row contents:

- Status label, for example `Viewing Now`, `In Progress`, or `Saved, Closed`.
- Page title.
- Client email, falling back to `Client`.
- Last seen or updated time.
- Review link.

The dropdown should prioritize active sessions first, then unfinished sessions. Submitted sessions should stay on the full Proofing Sessions page unless there is a strong product reason to include them later.

If there are no active or unfinished sessions, do not render the admin bar item at all. This avoids adding unnecessary admin bar noise when the feature has nothing useful to report.

## Visibility Qualification

The admin bar icon should appear only when FolioBlocks can provide an immediate service.

A session should qualify for the admin bar when:

- It belongs to a published proofing gallery page or post.
- Its proofing session status is `viewing` or `in_progress`.
- It has not been submitted.
- It is either actively being viewed now or still waiting for proofing completion.

A session should not qualify for the admin bar when:

- It has been submitted.
- Its source page or post is no longer published.
- It has gone stale beyond the unfinished-session window chosen for this feature.
- It exists only as historical proofing data better reviewed from the full Proofing Sessions page.

This rule is intentional: no useful proofing state means no FolioBlocks admin bar icon.

## Live Accuracy Requirements

Live accuracy should mean the admin bar updates while the user is already in wp-admin.

Recommended approach:

- Render an initial server-side admin bar item only when the initial state has active or unfinished proofing sessions.
- Enqueue a small admin script for users who can manage proofing sessions. The script should be able to insert the admin bar item later if a proofing session starts after page load.
- Poll a protected REST endpoint every 30 seconds while the document is visible.
- Pause polling when the admin page is hidden.
- Refresh immediately when the admin page becomes visible again.
- Treat a session as active only when:
  - status is not `submitted`
  - presence is `active`
  - `lastSeenAt` is within `FBKS_PROOFING_ACTIVE_WINDOW_SECONDS`
- Update icon state, count, row labels, and links from the endpoint response.
- Hide or remove the admin bar item when the endpoint reports no active or unfinished sessions.

Polling every 30 seconds is a good first version because the frontend proofing page sends presence every 45 seconds and the active window is 120 seconds. This gives a responsive admin indicator without adding heavy load.

## MVP Scope

Phase one should include:

- Conditional admin bar item registration.
- Initial server-rendered dropdown when sessions need attention.
- Live polling endpoint.
- Admin JS for polling, DOM insertion, DOM updates, and DOM removal.
- Admin bar CSS for neutral, active, and count states.
- Capability checks matching the Proofing Sessions page.
- Links to session details and the full sessions page.
- Active and unfinished sessions only.

Out of scope for MVP:

- Browser push notifications.
- WebSockets or Server-Sent Events.
- Sound alerts.
- Frontend alerts outside wp-admin.
- Listing every published proofing gallery before it has ever been viewed.
- Multi-client per-gallery presence beyond what current session storage can represent.
- Per-user admin preferences for polling frequency or notification behavior.

## PHP Architecture

Add a focused admin bar module:

```text
includes/pro/admin/proofing-admin-bar.php
```

Recommended responsibilities:

- Query current active and unfinished proofing sessions.
- Register the admin bar node only when the initial state is non-empty.
- Render the dropdown markup.
- Register the live REST endpoint.
- Enqueue admin bar CSS and JS.
- Localize endpoint URL, nonce, polling interval, and initial state.

Recommended helper functions:

```php
fbks_get_proofing_admin_bar_sessions($limit = 10)
fbks_get_proofing_admin_bar_state()
fbks_render_proofing_admin_bar_dropdown($state)
fbks_register_proofing_admin_bar($wp_admin_bar)
fbks_register_proofing_admin_bar_rest_routes()
fbks_get_proofing_admin_bar_state_response()
fbks_enqueue_proofing_admin_bar_assets()
```

Include this module only when the Business proofing admin feature is available, alongside `includes/pro/admin/proofing-sessions.php`.

## REST Endpoint

Recommended endpoint:

```text
GET /wp-json/folioblocks/v1/proofing-gallery/admin-bar
```

Permission callback:

```php
return function_exists('fbks_can_manage_proofing_sessions') && fbks_can_manage_proofing_sessions();
```

Recommended response shape:

```json
{
  "hasActive": true,
  "activeCount": 1,
  "unfinishedCount": 2,
  "sessions": [
    {
      "id": 123,
      "status": "viewing",
      "presence": "active",
      "displayStatus": "Viewing Now",
      "displayClass": "is-active",
      "clientEmail": "client@example.com",
      "pageId": 456,
      "pageTitle": "Wedding Proofing Gallery",
      "editPageUrl": "https://example.test/wp-admin/post.php?post=456&action=edit",
      "reviewUrl": "https://example.test/wp-admin/admin.php?page=folioblocks-proofing-sessions&session_id=123",
      "lastSeenAt": "2026-08-01 12:00:00",
      "updatedAt": "2026-08-01 12:00:00",
      "displayTime": "Aug 1, 2026 12:00"
    }
  ],
  "allSessionsUrl": "https://example.test/wp-admin/admin.php?page=folioblocks-proofing-sessions"
}
```

Keep the endpoint read-only and nonce-protected through `wp_create_nonce('wp_rest')`.

## Query Strategy

Use the existing `fbks_get_proofing_sessions_for_admin()` for the first version unless profiling shows it is too broad.

If optimization is needed, add a dedicated query that fetches only:

- `viewing`
- `in_progress`

Then sort sessions in PHP:

1. active `Viewing Now`
2. active `In Progress`
3. closed unfinished sessions
4. recently viewed idle sessions

Limit the dropdown to around 10 rows. The full Proofing Sessions page remains the place for complete history.

Potential cache:

- Cache the admin bar state in a short transient for 10 to 15 seconds.
- Delete or refresh that transient when presence or save endpoints update a proofing session.

Do not add caching until the first implementation is working and tested; keep the first version simpler unless the query proves expensive.

## Admin Bar UI

Recommended node ID:

```text
fbks-proofing-gallery
```

Recommended visual states:

- `has-unfinished`: neutral or amber count when unfinished sessions exist but nobody is active now.
- `has-active`: active green icon/count when at least one client is currently viewing.

There should be no empty visual state in the admin bar. Empty state means the item is absent.

Suggested dropdown structure:

```text
Proofing Gallery
Viewing Now
Client Email
Page Title
Last seen just now
Review

In Progress
Client Email
Page Title
Updated 12:00
Review

View all Proofing Sessions
```

Use regular admin bar dropdown markup where possible so the feature feels native to WordPress. Avoid a modal in the first version; modals are more intrusive and need more accessibility work.

## JavaScript Behavior

Recommended file:

```text
includes/pro/js/proofing-admin-bar.js
```

Behavior:

- Read localized settings from `window.fbksProofingAdminBar`.
- Poll the endpoint while `document.visibilityState === 'visible'`.
- Use `apiFetch` if available, otherwise `window.fetch`.
- Insert the admin bar node when the endpoint reports active or unfinished sessions and the node is not present.
- Update classes on the admin bar node.
- Update count text and dropdown HTML.
- Remove or hide the admin bar node when the endpoint reports no active or unfinished sessions.
- Show a quiet error state only in the browser console; do not surface noisy admin notices for transient polling failures.
- Stop polling if the endpoint returns `401` or `403`.

Do not store any proofing data in local storage for this admin feature.

## Styling

Recommended styles can live in the existing admin stylesheet or in a dedicated admin bar stylesheet.

Dedicated file option:

```text
includes/pro/css/proofing-admin-bar.css
```

Keep styles scoped under:

```css
#wpadminbar #wp-admin-bar-fbks-proofing-gallery
```

Important styling details:

- Fit inside the 32px desktop admin bar and 46px mobile admin bar.
- Keep count badge compact.
- Use WordPress admin colors with a FolioBlocks accent only for the active state.
- Avoid large custom panels that feel detached from the admin bar.
- Ensure text does not overflow narrow screens.

## Security And Privacy

Only expose admin bar proofing state to users who can manage proofing sessions.

Security checklist:

- Capability check before adding the admin bar item.
- Capability check before enqueueing assets.
- Capability check in REST permission callback.
- REST nonce for live polling.
- Escape all server-rendered admin bar output.
- Sanitize endpoint response data.
- Do not expose gallery passwords or gallery keys.
- Do not expose image selections in the admin bar endpoint.

Privacy note:

- The dropdown may show client email addresses in wp-admin. This matches the existing Proofing Sessions page, but the feature should remain limited to the same capability and Business plan checks.

## Testing Plan

Manual testing:

- Business plan user with `manage_options` sees the admin bar item only when there are active or unfinished proofing sessions.
- Non-Business, free, or insufficient-capability users do not see the item or endpoint data.
- No active or unfinished sessions: no admin bar item is present.
- Client opens a published proofing gallery: icon turns active after the next poll.
- Client closes the page: icon returns to unfinished state or disappears after the active window expires, depending on whether an unfinished session remains.
- Client saves progress: dropdown shows in-progress state and links to the review screen.
- Client submits: session disappears from the active/unfinished dropdown. If no other sessions need attention, the admin bar item disappears.
- Multiple active sessions: count and rows are correct.
- Admin tab hidden and shown again: polling pauses and refreshes on return.
- REST endpoint returns 403 for unauthorized users.

Automated or developer testing:

- Add unit coverage for state-shaping helper functions if a PHP test setup is available.
- Add a small smoke test for REST permission behavior if REST tests are already present.
- Run PHP lint on new PHP files.
- Run the existing build process for admin JS/CSS if the asset pipeline requires it.

## Implementation Phases

### Phase 1: Server State

- Add the admin bar module.
- Build helper functions for active/unfinished state.
- Reuse `fbks_get_proofing_session_display_status()`.
- Register the REST endpoint.
- Return sanitized state without image selections or gallery keys.

### Phase 2: Admin Bar Markup

- Add the admin bar node only when server state is non-empty.
- Render the icon, count, and dropdown from initial state.
- Link to session detail and full sessions page.
- Add scoped CSS.

### Phase 3: Live Polling

- Add admin JS polling.
- Localize endpoint URL, nonce, interval, and initial state.
- Update DOM state from endpoint response.
- Insert the item when a session starts after page load.
- Remove the item when there are no active or unfinished sessions.
- Pause when hidden and refresh when visible.

### Phase 4: QA And Polish

- Test active, closed, in-progress, and submitted transitions.
- Check mobile admin bar behavior.
- Verify no feature leakage for unauthorized users.
- Decide whether to add a short transient if repeated polling feels heavy.

## Open Product Questions

- Should unfinished but inactive sessions show an amber icon/count, or should the icon only change color for active viewing?
- Should submitted sessions briefly appear in the dropdown as `Submitted`, or should they live only on the full Proofing Sessions page?
- Should the dropdown show page edit links, public page links, or only session review links?
- Should the admin bar item appear on the frontend for logged-in admins, wp-admin only, or both?
- Should the count represent active sessions only, or active plus unfinished sessions?
- When an inactive unfinished session is older than a certain age, should it stop qualifying for the admin bar even if it remains available on the full Proofing Sessions page?

## Recommended Default Decisions

For the first version:

- Show the admin bar item in both wp-admin and frontend admin bar for authorized admins, but only when active or unfinished proofing sessions exist.
- Turn the icon green only for active proofing.
- Show a count for active plus unfinished sessions.
- Prioritize active sessions first.
- Exclude submitted sessions from the dropdown.
- Use the existing Proofing Sessions page for full review and history.
