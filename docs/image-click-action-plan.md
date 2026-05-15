# Image Click Action Plan

## Goal

Replace the current mixed "Lightbox & Overlay Settings" and e-commerce behavior with a clearer interaction model:

- Image Click Settings: what happens when a visitor activates an image or action icon.
- Image Hover Settings: what visual content and controls appear when a visitor hovers over an image.

The purpose is to make lightbox, custom links, downloads, WooCommerce, captions, and hover overlays feel like one coherent system instead of several competing features.

## Current Codebase Findings

After reviewing the current implementation, this update should be treated as a UI/control reorganization plus a smaller set of new link behaviors, not a full rewrite.

Existing pieces already in place:

- Gallery blocks pass shared settings down to `pb-image-block` through block context.
- `pb-image-block` already renders the image lightbox, lightbox caption data, download icon, WooCommerce icon, WooCommerce product info in lightbox, and hover overlay output.
- WooCommerce product info in the lightbox already exists through `wooLightboxInfoType` with `caption` and `product` values.
- WooCommerce icon behavior already exists through `wooDefaultLinkAction` / `wooLinkAction` with `add_to_cart` and `product` values.
- Download behavior already exists through `enableDownload` and `downloadOnHover`.
- Hover overlay behavior already exists through `onHoverTitle`, `onHoverStyle`, `overlayBgColor`, `overlayTextColor`, and `wooProductPriceOnHover`.
- Premium controls are already injected through `premium.js` filters, and most premium frontend output is already guarded in render files.

This means phase one should preserve the existing attribute model wherever possible and focus on moving controls into clearer panels:

- Existing lightbox controls move into Image Click Settings.
- Existing WooCommerce controls move into Image Click Settings.
- Existing download controls move into Image Click Settings.
- Existing hover overlay controls move into Image Hover Settings.

The genuinely new frontend behavior is the new image-linking actions: open media file, open attachment page, open custom URL, and none.

## Premium Scope

These new Image Click Action features are premium features.

Exception: the existing lightbox behavior and the existing ability to show captions in the lightbox are currently free features and should remain free. We should not move existing free lightbox functionality behind the premium gate, because that would be a breaking product expectation for free users.

Editor controls must be gated through each block's `premium.js` file so free users do not see unavailable premium controls in the block inspector.

Frontend rendering must also be gated in each affected `render.php` file with the Freemius premium check:

```php
fbks_fs()->can_use_premium_code__premium_only()
```

The render layer should never output premium-only link, download, WooCommerce, or enhanced lightbox behavior unless the current installation can use premium code. Existing free lightbox behavior and existing free lightbox caption behavior should continue to render for free users.

## Core Product Model

Each block should expose an Image Click Action `SelectControl` as the first control in Image Click Settings. Selecting a value reveals only the additional controls relevant to that action.

Image Click Action values:

- Open in lightbox
- Open media file
- Open attachment page
- Open custom URL
- Download image
- WooCommerce product
- None (default)

Some actions use the whole image as the trigger. Download and WooCommerce continue to use icons for the first implementation.

There will not be any clicking actions on the overlay in this phase.

## Recommended Trigger Behavior

| Click Action | Whole Image Trigger | Icon Trigger | Notes |
| --- | --- | --- | --- |
| Open in lightbox | Yes | No | Default gallery behavior where appropriate. |
| Open media file | Yes | No | Opens the direct image file. |
| Open attachment page | Yes | No | Uses the WordPress attachment page URL. |
| Open custom URL | Yes | No | Requires per-image URL and target controls. |
| Download image | No | Yes | Preserve current icon-based implementation. Icon display supports on-hover or always. |
| WooCommerce product page | No | Yes | Preserve current icon-based implementation. Icon can open product page. |
| WooCommerce add to cart | No | Yes | Should remain icon based to prevent accidental cart additions. |
| WooCommerce lightbox with product info | Yes | No | Preserve existing lightbox/product-info behavior and present it clearly in the new controls. |
| None | No | No | Disables image click behavior. |

## Lightbox Options

When Image Click Action is "Open in lightbox", show lightbox-specific options:

- Display caption in lightbox
- If WooCommerce is enabled and caption/info is enabled, choose Lightbox Info: image caption or product info

Current implementation note:

- Regular image caption in the lightbox already exists.
- WooCommerce product info in the lightbox already exists.
- The existing `wooLightboxInfoType` attribute already controls whether the lightbox displays the image caption or product information.

The important rule: lightbox settings should only appear when the selected click action actually uses the lightbox.

Do not change the lightbox caption source in the first version. Keep the existing caption behavior for simplicity.

## WooCommerce Behavior

Move the current e-commerce settings into Image Click Settings.

When Image Click Action is "WooCommerce product", show a secondary behavior control:

- Open product page
- Add to cart
- Open in lightbox with product info, using the existing lightbox/product-info behavior

Then show display controls as appropriate:

- Icon display: on hover or always
- Product info display options for lightbox mode

If WooCommerce is not active, the WooCommerce action should be unavailable or shown with a clear disabled notice.

Current implementation note:

- The icon-based WooCommerce behavior already exists.
- `wooDefaultLinkAction` controls the gallery default icon behavior.
- `wooLinkAction` allows individual images to inherit or override the gallery default.
- The current values are `add_to_cart` and `product`.
- The current product-lightbox behavior is tied to the lightbox and `wooLightboxInfoType`, not a separate Woo action.
- In the first implementation, avoid changing the working WooCommerce frontend behavior unless required by the new panel structure.
- Preserve the current WooCommerce attributes, but rework the controls so they make sense inside Image Click Settings.

## Download Behavior

Download becomes an Image Click Action instead of a separate feature group.

Recommended first version:

- Trigger: download icon
- Icon display: on hover or always
- File source: current image URL/resolution already selected by the block

Current implementation note:

- Download behavior already exists through `enableDownload` and `downloadOnHover`.
- The first implementation should move these controls into Image Click Settings and preserve the current render behavior.
- The current implementation disables downloads when WooCommerce is enabled to avoid icon/action conflicts. If this rule changes later, plan it as a separate compatibility decision.

Whole-image download can be considered later, but it should not be the default because accidental downloads are easy.
For this update, whole-image download is out of scope.

## Image Hover Settings

Move the existing hover-only presentation controls into a separate section without adding new hover features in the initial phase.

Initial Image Hover Settings should preserve the current behavior from the existing "Lightbox & Overlay Settings" panel:

- Show overlay on hover
- When hover overlay is enabled, show the current hover style controls
- If WooCommerce is active/enabled for the block, show the current option to choose between displaying the image title in the overlay or displaying product info

This section should not decide what clicking does. It only decides what appears visually before the click.

The first implementation should be a panel reorganization only. Hover behavior should remain exactly as it works today unless a later phase explicitly expands it.

## Custom URL Requirements

When Image Click Action is "Open custom URL", each image needs link data.

Potential per-image fields:

- Custom URL
- Open in new tab
- Link rel/noopener behavior
- Optional aria label or link label

Custom URLs should be available on all affected gallery blocks in the first version.

Custom URLs should also be available on the individual Image Block. For the individual Image Block, custom URL controls should display only when the block is used outside a gallery.

New per-image link fields should likely be added to `pb-image-block`, because all affected gallery blocks use `pb-image-block` as their inner image block.

## Compatibility Rules

Only one whole-image click behavior should be active at a time.

Lightbox and direct image/page/custom URL click actions are mutually exclusive.

WooCommerce add-to-cart should not use whole-image click in the first version.

Downloads and WooCommerce integration remain mutually exclusive. A block should not allow both image downloads and WooCommerce integration to be enabled at the same time.

Downloads use the current icon-based implementation. If the selected Image Click Action is "Download image", download should be the main icon action.

Existing galleries should preserve their current behavior during migration:

- Galleries with lightbox enabled should map to Image Click Action: Open in lightbox.
- Galleries with WooCommerce enabled should map to WooCommerce product behavior according to their current settings.
- Galleries with downloads enabled should map to the new download icon behavior.

Implementation caution:

- Several current behaviors are separate but can coexist conceptually: primary image click, hover overlay, and icon actions.
- Do not collapse everything into a single attribute too early if that would break existing combinations.
- The first version can use the existing attributes as the source of truth and introduce new attributes only for genuinely new link actions.
- Overlay click actions are out of scope for this phase.

## Blocks Affected

Affected blocks:

- Image Block
- Grid Gallery Block
- Carousel Gallery Block
- Filmstrip Gallery Block
- Justified Gallery
- Masonry Gallery
- Modular Gallery

Filmstrip Gallery does not support the regular lightbox because it already has a full screen mode. Image Click Action for Filmstrip should exclude "Open in lightbox" and only expose the actions that make sense for that block.

Modular Gallery should support the full Image Click Action feature set.

## Implementation Notes

Phase one should primarily reorganize existing filter outputs and panels.

Current panel structure in most affected blocks:

- `Lightbox & Hover Overlay Settings`
- `E-Commerce Settings`

Target panel structure:

- `Image Click Settings`
- `Image Hover Settings`

Image Click Settings should begin with a `SelectControl` using the Image Click Action values. Additional controls should be conditional:

- Open in lightbox: show existing lightbox caption controls.
- Open media file: no extra controls in the initial version.
- Open attachment page: no extra controls in the initial version.
- Open custom URL: show custom URL fields and target controls.
- Download image: show existing icon display controls.
- WooCommerce product: show existing WooCommerce controls, adjusted to fit the new section.
- None: no extra controls.

Existing filter hooks that will likely be moved or reused:

- `*.lightboxControls`
- `*.downloadControls`
- `*.wooCommerceControls`
- `*.onHoverTitleToggle`

Where `*` is the block-specific prefix, for example `folioBlocks.gridGallery`.

Introduce shared helper components for Image Click Settings and Image Hover Settings if doing so reduces duplication, but avoid making the first version dependent on a broad abstraction refactor.

Likely shared helpers:

- ImageClickSettingsControl
- ImageHoverSettingsControl
- getEffectiveImageClickAction
- getCompatibleClickOptions
- getClickActionAttributes

PHP render files may eventually use shared helper functions for deriving wrapper attributes, link attributes, icon output, and lightbox data attributes. This should be considered after the panel reorganization and new link actions are clear.

Avoid adding new per-block logic where a shared rendering helper can keep behavior consistent.

## Migration Notes

The existing attributes should be mapped carefully to new attributes. A possible new attribute set:

- imageClickAction
- imageClickTrigger
- imageLinkTarget
- imageCustomUrl behavior for per-image data
- lightboxCaption
- wooClickBehavior
- wooClickTrigger
- wooIconDisplay
- downloadTrigger
- downloadIconDisplay

Existing attributes may need to remain for backward compatibility:

- lightbox
- enableWooCommerce
- wooDefaultLinkAction
- wooLinkAction
- enableDownload
- downloadOnHover
- lightboxCaption
- wooCartIconDisplay
- wooLightboxInfoType
- onHoverTitle
- onHoverStyle
- overlayBgColor
- overlayTextColor
- wooProductPriceOnHover

The block edit code can derive new defaults from old attributes and save new attributes when the user changes settings.

However, because much of the current behavior already works, the first implementation should not require a full migration to new attributes. Keep the existing attributes active and add new attributes only where needed for media file, attachment page, custom URL, and none.

## Open Questions

Resolved decisions:

- Download Image uses the existing icon-based implementation.
- Custom URLs are available on all affected gallery blocks in the first version.
- Custom URLs are also available on the individual Image Block, but only show controls when the Image Block is used outside a gallery.
- Modular Gallery supports the full Image Click Action feature set.
- Overlay click actions are out of scope for this phase.
- Lightbox caption source stays as-is for simplicity.
- WooCommerce attributes should be preserved, but controls can be reworked to fit Image Click Settings.
- Downloads and WooCommerce integration remain mutually exclusive.

Remaining questions:

- What exact attributes should store media file, attachment page, custom URL, and none?
- Should custom URL target/new-tab be configured per image only, or can a gallery-level default be added later?
- How should old blocks with `lightbox: false`, `enableDownload: false`, and `enableWooCommerce: false` map to the new default `None` without changing frontend expectations?

## Proposed First Version

1. Split the inspector UI into Image Click Settings and Image Hover Settings.
2. Move existing controls without changing behavior:
   - Lightbox controls into Image Click Settings.
   - Download controls into Image Click Settings.
   - WooCommerce controls into Image Click Settings.
   - Hover overlay controls into Image Hover Settings.
3. Preserve existing free lightbox and free lightbox caption behavior.
4. Preserve existing premium WooCommerce, download, and hover overlay behavior.
5. Add Image Click Action `SelectControl`:
   - Open in lightbox
   - Open media file
   - Open attachment page
   - Open custom URL
   - Download image
   - WooCommerce product
   - None (default)
6. Show lightbox caption/product-info settings only when the selected action uses the lightbox.
7. Add frontend render support only for the new link actions after the panel split is stable.
8. Preserve existing frontend behavior through migration defaults.
