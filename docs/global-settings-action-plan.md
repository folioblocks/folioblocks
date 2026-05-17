# Global Settings Action Plan

## Goal

Create a FolioBlocks Global Settings system that gives site owners one place to define common defaults for FolioBlocks blocks.

The system should reduce repetitive block setup while keeping individual blocks flexible. A block should be able to use the global defaults, override them locally, or reset back to the global values.

## Current Codebase Findings

FolioBlocks currently has an admin Dashboard page under `FolioBlocks > Dashboard`, rendered in PHP through `includes/admin/settings-page.php`.

Existing admin infrastructure:

- `folioblocks.php` registers the top-level FolioBlocks menu.
- `includes/admin/common.php` provides shared nonce helpers and quick links.
- `includes/admin/settings-page.css` styles the admin screens.
- `folioblocks.php` already localizes shared editor data into `window.folioBlocksData`, including Pro and WooCommerce status.
- There is no current settings persistence layer for block defaults.

Existing block behavior:

- Most gallery blocks store all behavior as block attributes.
- Gallery blocks pass shared values to `pb-image-block` through block context.
- Premium controls are injected through each block's `premium.js` filters.
- Dynamic render files already read block attributes directly and output frontend data/classes.
- The Dashboard copy currently says there are no external settings pages for blocks. This copy needs to change once Global Settings exists.

The important constraint: many current attributes have concrete defaults in `block.json`. That means existing saved blocks cannot automatically distinguish "use the old default" from "the user intentionally set this value." A reliable global inheritance model needs an explicit inheritance flag or source field.

## Recommended Product Model

Use a staged model:

1. Global Defaults: settings define the initial values for newly inserted FolioBlocks blocks.
2. Local Overrides: each block can override those values in the editor.
3. Inherit Global: selected settings can remain linked to global settings, so changes in Global Settings affect existing blocks that opted into inheritance.
4. Reset to Global: block controls can copy current global values into local attributes.

This gives a practical MVP quickly, while preserving a path to true live inheritance.

## MVP Scope

Phase one should support global defaults for newly inserted blocks and a visible admin settings page.

Recommended MVP settings:

- Lazy load images by default.
- Enable image lightbox by default.
- Display lightbox captions by default.
- Show image title on hover by default.
- Default hover overlay style.
- Overlay background and text colors.
- Border width, radius, and color.
- Drop shadow.
- Download icon defaults for Pro users.
- WooCommerce icon behavior defaults for Pro users when WooCommerce is active.

Out of scope for MVP:

- Migrating all existing blocks to inherited values.
- Per-block global presets.
- Import/export settings.
- Role-specific settings.
- Per-post or per-template settings.
- Any destructive rewrite of saved post content.

## Data Model

Store all plugin-level settings in one option:

```php
folioblocks_global_settings
```

Recommended shape:

```json
{
  "version": 1,
  "defaults": {
    "gallery": {
      "lazyLoad": false,
      "lightbox": false,
      "lightboxCaption": false,
      "onHoverTitle": false,
      "onHoverStyle": "blur-overlay",
      "overlayBgColor": "",
      "overlayTextColor": "",
      "borderWidth": 0,
      "borderRadius": 0,
      "borderColor": "#ffffff",
      "boxShadow": false
    },
    "downloads": {
      "enableDownload": false,
      "downloadOnHover": true,
      "downloadIconColor": "#000000",
      "downloadIconBgColor": "#ffffff"
    },
    "woocommerce": {
      "enableWooCommerce": false,
      "wooCartIconDisplay": "hover",
      "wooDefaultLinkAction": "add_to_cart",
      "wooLightboxInfoType": "caption",
      "wooProductPriceOnHover": true
    }
  }
}
```

Keep one canonical PHP schema of allowed keys, defaults, and sanitizers. JavaScript should consume the sanitized result rather than defining a second independent schema.

## PHP Architecture

Add a focused settings module:

```text
includes/settings/global-settings.php
```

Responsibilities:

- Define default settings.
- Sanitize submitted values.
- Merge saved settings with defaults.
- Register the option with WordPress.
- Expose helper functions for PHP render files.
- Expose sanitized settings to the block editor.

Recommended functions:

```php
fbks_get_global_settings_defaults()
fbks_sanitize_global_settings($settings)
fbks_get_global_settings()
fbks_get_global_setting($path, $fallback = null)
fbks_register_global_settings()
```

Register with:

```php
register_setting(
    'folioblocks_global_settings',
    'folioblocks_global_settings',
    array(
        'type'              => 'object',
        'sanitize_callback' => 'fbks_sanitize_global_settings',
        'default'           => fbks_get_global_settings_defaults(),
        'show_in_rest'      => false,
    )
);
```

Use a PHP-rendered admin form for the first version. The current admin pages are PHP-rendered, so a React settings app would be unnecessary complexity unless the UI grows substantially.

## Admin UI

Add a submenu:

```text
FolioBlocks > Global Settings
```

Recommended file:

```text
includes/admin/global-settings-page.php
```

The page should use the existing admin styling and nonce helpers from `includes/admin/common.php`.

Suggested sections:

- Gallery Defaults
- Lightbox Defaults
- Hover Overlay Defaults
- Image Style Defaults
- Download Defaults
- WooCommerce Defaults
- Reset Defaults

The UI should be quiet and utilitarian. These are operational controls, not a marketing page.

Important admin behavior:

- Only users with `manage_options` can save.
- All submitted values are sanitized server-side.
- Pro-only settings are visible only when `fbks_fs()->can_use_premium_code()` is true, or shown as disabled upgrade prompts if that matches the existing product pattern.
- WooCommerce defaults are shown only when WooCommerce is active, or shown with a disabled notice.
- Saving should redirect back with a success query arg to prevent duplicate form submission.

## Editor Integration

Expose settings to the editor through the existing shared data object:

```js
window.folioBlocksData.globalSettings
```

Add a JS helper:

```text
src/pb-helpers/globalSettings.js
```

Responsibilities:

- Read global defaults safely.
- Map global defaults to block attributes.
- Apply only attributes supported by a specific block.
- Avoid applying Pro-only defaults in free builds.

Suggested helpers:

```js
export function getFolioBlocksGlobalSettings()
export function getGlobalDefaultsForBlock(blockName)
export function applyGlobalDefaults(attributes, blockName)
export function pickSupportedGlobalAttributes(defaults, blockAttributes)
```

For MVP, use global defaults when a block is first inserted and still has its default values. Avoid repeatedly overwriting a block after the user edits it.

Recommended block-level attribute for tracking:

```json
"globalDefaultsApplied": { "type": "boolean", "default": false }
```

Each affected edit component can run once:

```js
if (!attributes.globalDefaultsApplied) {
  setAttributes({
    ...pickSupportedGlobalAttributes(globalDefaults, attributes),
    globalDefaultsApplied: true,
  });
}
```

This is safer than trying to infer user intent from existing concrete defaults.

## Inheritance Model

True inheritance should be phase two.

Add a small source attribute when we are ready for live inherited values:

```json
"settingsSource": {
  "type": "string",
  "enum": ["local", "global"],
  "default": "local"
}
```

Alternative, more granular model:

```json
"globalSettings": {
  "type": "object",
  "default": {
    "style": false,
    "lightbox": false,
    "hover": false,
    "downloads": false,
    "woocommerce": false
  }
}
```

Recommendation: use grouped inheritance rather than per-control inheritance. Per-control inheritance is powerful, but it would make the inspector UI noisy and the render logic harder to reason about.

When `settingsSource` or a grouped inheritance flag is active:

- Editor controls display the effective global value.
- Local controls are disabled or show an "Override" action.
- Render files resolve values from global settings first, then local attributes.

Resolution rule:

```text
effective value = inherited global value if inheritance is enabled and setting exists
effective value = local block attribute otherwise
```

## Affected Blocks

Start with the blocks that share gallery/image behavior:

- `grid-gallery-block`
- `masonry-gallery-block`
- `justified-gallery-block`
- `carousel-gallery-block`
- `filmstrip-gallery-block`
- `modular-gallery-block`
- `pb-image-block`

Then expand to:

- `video-gallery-block`
- `pb-video-block`
- `background-video-block`
- `pb-before-after-block`
- `pb-loupe-block`
- `pb-image-row`
- `pb-image-stack`

Do not force all block types into the same schema. Video and background-video settings should have their own section when they are added.

## Rendering Strategy

MVP rendering can continue using saved block attributes, because global defaults are copied into the block when inserted.

Phase two rendering should introduce effective settings helpers:

```php
fbks_resolve_block_settings($block_name, $attributes)
fbks_block_uses_global_settings($attributes, $group)
```

Render files should use resolved values instead of raw attributes only when inheritance is active.

Important rule: global settings must not unlock premium frontend behavior in the free version. Any Pro-only value must still be guarded with the Freemius premium check in PHP and JS.

## Migration Strategy

Do not migrate existing post content automatically in phase one.

For existing blocks:

- Leave saved attributes untouched.
- Add a "Reset to Global Defaults" action in the inspector later.
- Optionally add a bulk tool in the Global Settings page later, but only after a confirmation flow and clear preview of what will change.

This avoids surprising site owners by changing existing galleries after plugin update.

## Implementation Phases

### Phase 1: Settings Foundation

- Add `includes/settings/global-settings.php`.
- Define defaults, sanitization, and getters.
- Load the settings module from `folioblocks.php`.
- Add `includes/admin/global-settings-page.php`.
- Register `FolioBlocks > Global Settings` submenu.
- Update Dashboard copy so it no longer says there are no external settings pages.
- Add success/error notices for saving.

### Phase 2: Editor Defaults

- Add `src/pb-helpers/globalSettings.js`.
- Add `globalDefaultsApplied` attributes to supported gallery blocks.
- Apply global defaults once when supported blocks are inserted.
- Keep local inspector controls working exactly as they do today after defaults are applied.
- Ensure free builds ignore Pro-only defaults.

### Phase 3: Shared Control Helpers

- Identify duplicated premium controls across gallery blocks.
- Extract reusable control groups where it reduces real duplication:
  - Lightbox defaults.
  - Hover overlay defaults.
  - Image style defaults.
  - Downloads.
  - WooCommerce.
- Keep block-specific controls local where behavior differs.

### Phase 4: Optional Live Inheritance

- Add grouped inheritance flags.
- Add editor UI for "Use Global Settings" and "Override Locally."
- Resolve inherited values in editor previews.
- Resolve inherited values in PHP render files.
- Add tests around global/local precedence.

### Phase 5: Presets And Bulk Tools

- Add named presets only if users need more than one global style.
- Add import/export only after the base settings shape stabilizes.
- Consider a bulk "Apply global defaults to existing blocks" tool with a dry-run preview.

## Testing Plan

Manual test cases:

- Save every Global Settings section and reload the page.
- Confirm invalid submitted values are sanitized back to safe defaults.
- Insert each supported gallery block and confirm defaults are applied once.
- Change a block locally and confirm global settings do not overwrite it.
- Confirm existing saved blocks do not change after updating global settings.
- Confirm Pro-only settings do not appear or render in free mode.
- Confirm WooCommerce defaults behave correctly when WooCommerce is inactive.
- Confirm translated strings are picked up by the i18n workflow.

Build checks:

```bash
npm run build
npm run lint:js
npm run lint:css
npm run i18n:pot
```

## Open Decisions

- Should MVP global settings apply to newly inserted blocks only, or should we prioritize live inheritance immediately?
- Should the default mode for new blocks be "copy global values" or "inherit global values"?
- Should Global Settings be a separate submenu or a tab inside the Dashboard page?
- Should free users see disabled Pro settings as upgrade prompts, or should Pro-only settings be hidden entirely?
- Which defaults should apply to the individual Image Block when it is used outside a gallery?
- Should video block defaults be included in version one, or handled after image/gallery defaults are stable?

## Recommended First Build

Start with a conservative first build:

- Add the Global Settings submenu and option storage.
- Support image/gallery defaults only.
- Apply defaults once to newly inserted blocks.
- Do not alter existing saved blocks.
- Do not implement live inheritance until the admin UI and defaults are proven.

This gives users immediate value, keeps the update predictable, and leaves a clean path to a stronger inheritance system later.
