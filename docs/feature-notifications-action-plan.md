# WordPress Feature Notifications Adoption Plan

Prepared 2 November 2026. Status: planned integration; no runtime integration implemented.

## Product decision

Adopt WordPress Feature Notifications as soon as its functional feature-plugin release provides a supported integration API. When that plugin is active and supported, route FolioBlocks review requests and the entire Proofing toolbar notification experience into its shared hub. Do not show parallel banners, toolbar buttons, dropdowns, or counts for those notifications.

The integration is optional: FolioBlocks must continue working without the feature plugin. Detect the supported API after it initializes, rather than relying solely on an installed plugin filename. An installed but inactive plugin cannot receive notifications. Support the same capability through WordPress core when it eventually ships there.

## Upstream status and release gate

- [Design exploration, 29 October 2026](https://make.wordpress.org/core/2026/10/29/exploring-a-design-for-feature-notifications/) describes a proposed shared bell and notification rules. Its layouts, severity, intent, grouping, and preferences are evolving design concepts, not a finalized integration contract.
- [0.3.0 release plan, 10 October 2026](https://make.wordpress.org/core/2026/10/10/feature-notifications-status-update-and-plan-for-0-3-0/) targets 1 December 2026 for the first functional MVP and includes a PHP emission API, persistence, permissions, and persistent dismissal. This is a target, not a confirmed release date or core merge date.
- Follow the [upstream repository](https://github.com/WordPress/wp-feature-notifications) for the released API and compatibility requirements. Before implementation, verify its actual release, documented integration API, recipient controls, dismissal semantics, and upgrade path. Do not invent API names or assume the design prototype is the shipped feature.

## Review requests

- Route eligible requests through the shared hub; classify them as optional promotional content using the released taxonomy. Never elevate a review request to warning or critical severity.
- Preserve existing eligibility: administrators with `manage_options`, saved FolioBlocks usage at least 14 days old, and per-user completion, shown, and snooze state.
- Honor existing dismissals and completed requests. Switching delivery systems must not trigger another request. Preserve an explicit Maybe later choice where supported; only that choice may schedule a later request under the existing 30-day rule.
- Honor hub preferences, muting, and permanent dismissal. Do not recreate a dismissed notification on page loads or use the legacy banner to bypass a muted channel.
- Suppress existing Freemius review sticky notices when the shared route is supported, including notices persisted before activation. Record successful delivery only after the API confirms it; handle retries with a stable per-recipient identifier.
- Without a supported active API, retain the existing scoped Freemius presentation. Keep notification state coherent across activation and deactivation so fallback cannot resurrect a dismissed request.

## Proofing

- Move the Proofing toolbar button, count, dropdown notification list, and clear-submitted interaction into the shared notification experience when supported. Stop loading its separate polling script and stylesheet in that mode.
- Preserve the Proofing Sessions management screen and contextual Review links as destinations. The hub replaces notification presentation, not session management.
- Cover the current viewing, in-progress, and submitted session states. Emit meaningful state transitions and update or group an existing session notification where supported; heartbeat and presence polling must not create repeated notifications.
- A submitted selection is an operational notification with a direct Review action. Routine session activity must not become critical. Map types and severity to the released API once confirmed.
- Preserve proofing entitlement, `fbks_can_manage_proofing_sessions()` authorization, published/current-session checks, retention rules, and per-user cleared-submission state. Recheck access when opening linked session details; do not expose client emails or gallery data to unauthorized hub recipients.
- Preserve the user's existing `showAdminBar` opt-out during migration. Adapt its label and explanation to the active notification system, and respect hub preferences without bypassing them through the old toolbar.
- Clear or resolve obsolete notifications when sessions are removed, superseded, expire, or cease to be accessible, as supported by the released API. Use a stable session/event identifier so retries do not duplicate submissions.
- Proofing currently has a separate email-on-submit setting. Review cross-channel behavior during implementation; preserve that explicit preference unless a separate product decision changes it.

## Implementation map

| Existing source | Integration work |
| --- | --- |
| `folioblocks.php` | Load a shared optional adapter with the free plugin; keep proofing producers behind existing premium loading. |
| `includes/admin/review-request.php` | Separate eligibility and actions from presentation; select shared delivery or the Freemius fallback and reconcile persisted state. |
| `includes/pro/php/proofing-gallery.php` | Emit proofing events at authoritative session transitions; reconcile deletion and retention with hub records. |
| `includes/pro/admin/proofing-admin-bar.php` | Reuse session eligibility; suppress the legacy node, assets, and polling when the supported hub route is active. |
| `includes/pro/js/proofing-admin-bar.js` | Retain only for fallback mode. |

Keep upstream calls behind one adapter so feature-plugin and eventual core compatibility can evolve without duplicating product rules. Do not vendor the feature plugin or raise FolioBlocks' minimum PHP/WordPress requirements just to enable this optional integration. Confirm the adapter parses on FolioBlocks' supported PHP versions even when the upstream plugin requires a newer version.

## Delivery and acceptance

1. Verify the functional release and document the exact supported API/version and any missing hub features. If the first release cannot replace the entire proofing experience, document that gap before claiming complete migration.
2. Implement the adapter, review delivery, proofing events, and legacy-UI suppression together with state migration.
3. Verify plugin absent, inactive, supported, unsupported, activated after legacy notices, and deactivated after delivery. Verify eventual core detection when available.
4. Verify one delivery per recipient/event across reloads and retries, permanent dismissal and explicit snooze, muted channels, existing completed reviews, and already-cleared submissions.
5. Verify authorized recipients, entitlement changes, session deletion/retention, resubmission, no heartbeat spam, and no legacy Proofing node/assets/polling in hub mode. Verify admin, editor, and frontend hub behavior wherever upstream supports it.
6. Test against the actual released plugin, then ship the optional integration in the earliest compatible FolioBlocks release. This plan does not create a release monitor or promise an automatic future deployment.
