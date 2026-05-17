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

The genuinely new frontend behavior is the new image-linking actions: link image to media file, link image to image attachment page, link image to page/post, link image to custom URL, and none.

Implementation should be split into two passes:

1. Set up the new Image Click Settings and Image Hover Settings panels using the existing controls and existing behavior.
2. Add the new premium linking features: media file, attachment page, page/post, and custom URL.

## Premium Scope

These new Image Click Action features are premium features.

Exception: the existing lightbox behavior and the existing ability to show captions in the lightbox are currently free features and should remain free. We should not move existing free lightbox functionality behind the premium gate, because that would be a breaking product expectation for free users.

Editor controls must be gated through each block's `premium.js` file so free users do not see unavailable premium controls in the block inspector.

For free users, the Activate Image Linking `SelectControl` should only show free options:

- None
- Lightbox

When the free version is active, show a Notice below the SelectControl mentioning the Pro-only image linking features and linking to the upgrade flow. This should follow the same upgrade-notice pattern already used in the current block controls.

Frontend rendering must also be gated in each affected `render.php` file with the Freemius premium check:

```php
fbks_fs()->can_use_premium_code__premium_only()
```

The render layer should never output premium-only link, download, WooCommerce, or enhanced lightbox behavior unless the current installation can use premium code. Existing free lightbox behavior and existing free lightbox caption behavior should continue to render for free users.

## Core Product Model

Each block should expose an Activate Image Linking `SelectControl` as the first control in Image Click Settings. This control should be available in both free and Pro, but Pro-only options and their dependent controls must remain premium-gated.

Activate Image Linking values:

- None
- Lightbox
- WooCommerce Integration
- Enable Image Downloads
- Link Image to Media File
- Link Image to Image Attachment Page
- Link Image to Page/Post
- Link Image to Custom URL

Selecting a value should update the existing attributes wherever possible instead of forcing a broad migration. For example, selecting Lightbox should set `lightbox` to true, while selecting None should set `lightbox` to false and disable other click/linking features.

Some actions use the whole image as the trigger. Download and WooCommerce continue to use icons for the first implementation.

There will not be any clicking actions on the overlay in this phase.

## Recommended Trigger Behavior

| Activate Image Linking value | Whole Image Trigger | Icon Trigger | Notes |
| --- | --- | --- | --- |
| None | No | No | Default behavior. Sets `lightbox` off and disables click/linking features. |
| Lightbox | Yes | No | Sets `lightbox` on. Shows the lightbox caption option. |
| WooCommerce Integration | Mixed | Yes | Pro only. Shows WooCommerce controls when WooCommerce is installed. |
| Enable Image Downloads | No | Yes | Pro only. Preserve current icon-based implementation. |
| Link Image to Media File | Yes | No | Pro only. Opens the direct image file. |
| Link Image to Image Attachment Page | Yes | No | Pro only. Uses the WordPress attachment page URL. |
| Link Image to Page/Post | Yes | No | Pro only. Requires per-image page/post selection. |
| Link Image to Custom URL | Yes | No | Pro only. Requires per-image custom URL. |

## Lightbox Options

When Activate Image Linking is "Lightbox", set `lightbox` to true and show lightbox-specific options:

- Display caption in lightbox

When Activate Image Linking is "None", set `lightbox` to false.

Current implementation note:

- Regular image caption in the lightbox already exists.
- WooCommerce product info in the lightbox already exists.
- The existing `wooLightboxInfoType` attribute already controls whether the lightbox displays the image caption or product information.

The important rule: lightbox settings should only appear when the selected click action actually uses the lightbox.

Do not change the lightbox caption source in the first version. Keep the existing caption behavior for simplicity.

## WooCommerce Behavior

Move the current e-commerce settings into Image Click Settings.

When Activate Image Linking is "WooCommerce Integration", set `enableWooCommerce` to true and show the existing WooCommerce controls:

- Display Add to Cart Icon
- Default Add To Cart Icon

Also show a new WooCommerce-specific Enable Lightbox control. When active, show an additional Lightbox Content control:

- Caption
- Product Info

If WooCommerce is not active, the WooCommerce action should be unavailable or shown with a clear disabled notice.

Current implementation note:

- The icon-based WooCommerce behavior already exists.
- `wooDefaultLinkAction` controls the gallery default icon behavior.
- `wooLinkAction` allows individual images to inherit or override the gallery default.
- The current values are `add_to_cart` and `product`.
- The current product-lightbox behavior is tied to the lightbox and `wooLightboxInfoType`.
- In the first implementation, avoid changing the working WooCommerce frontend behavior unless required by the new panel structure.
- Preserve the current WooCommerce attributes, but rework the controls so they make sense inside Image Click Settings.

## Download Behavior

Download becomes an Activate Image Linking option instead of a separate feature group.

Recommended first version:

- Trigger: download icon
- Icon display: on hover or always
- File source: current image URL/resolution already selected by the block

Current implementation note:

- Download behavior already exists through `enableDownload` and `downloadOnHover`.
- When Activate Image Linking is "Enable Image Downloads", set `enableDownload` to true.
- Show the existing Display Image Download Icon control.
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

## New Link Action Requirements

The new Pro link actions are:

- Link Image to Media File
- Link Image to Image Attachment Page
- Link Image to Page/Post
- Link Image to Custom URL

When Activate Image Linking is "Link Image to Page/Post", each image needs page/post link data.

Potential per-image fields:

- Linked post/page ID
- Linked post/page URL
- Linked post/page title
- Open in new tab
- Link rel/noopener behavior

The selector should search posts and pages, and should exclude media attachments.

When Activate Image Linking is "Link Image to Custom URL", each image needs custom link data.

Potential per-image fields:

- Custom URL
- Open in new tab
- Link rel/noopener behavior
- Optional aria label or link label

Custom URL and page/post linking should be available on all affected gallery blocks in the first version.

Custom URL and page/post linking should also be available on the individual Image Block. For the individual Image Block, these controls should display only when the block is used outside a gallery.

New per-image link fields should likely be added to `pb-image-block`, because all affected gallery blocks use `pb-image-block` as their inner image block.

Important rendering rule: images in a gallery that do not have a selected page/post or custom URL must not output empty anchor tags.

## Compatibility Rules

Only one whole-image click behavior should be active at a time.

Lightbox and direct image/page/post/custom URL click actions are mutually exclusive.

WooCommerce add-to-cart should not use whole-image click in the first version.

Downloads and WooCommerce integration remain mutually exclusive. A block should not allow both image downloads and WooCommerce integration to be enabled at the same time.

Downloads use the current icon-based implementation. If the selected Activate Image Linking value is "Enable Image Downloads", download should be the main icon action.

Existing galleries should preserve their current behavior during migration:

- Galleries with lightbox enabled should map to Activate Image Linking: Lightbox.
- Galleries with WooCommerce enabled should map to Activate Image Linking: WooCommerce Integration.
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

Image Click Settings should begin with a `SelectControl` using the Activate Image Linking values. Additional controls should be conditional:

- None: no extra controls.
- Lightbox: set `lightbox` on and show existing lightbox caption controls.
- WooCommerce Integration: set `enableWooCommerce` on and show existing WooCommerce controls, plus WooCommerce lightbox controls.
- Enable Image Downloads: set `enableDownload` on and show existing icon display controls.
- Link Image to Media File: no extra gallery-level controls in the initial version.
- Link Image to Image Attachment Page: no extra gallery-level controls in the initial version.
- Link Image to Page/Post: show page/post search controls on each Image Block.
- Link Image to Custom URL: show custom URL controls on each Image Block.

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

However, because much of the current behavior already works, the first implementation should not require a full migration to new attributes. Keep the existing attributes active and add new attributes only where needed for media file, attachment page, page/post linking, custom URL, and none.

Compatibility-first mapping:

- Selecting None should set `lightbox`, `enableWooCommerce`, and `enableDownload` to false.
- Selecting Lightbox should set `lightbox` to true and keep the current `lightboxCaption` behavior.
- Selecting WooCommerce Integration should set `enableWooCommerce` to true and keep `wooCartIconDisplay`, `wooDefaultLinkAction`, `wooLinkAction`, and `wooLightboxInfoType`.
- Selecting Enable Image Downloads should set `enableDownload` to true and keep `downloadOnHover`.
- Selecting new link actions should disable conflicting legacy click actions.

## Open Questions

Resolved decisions:

- Download Image uses the existing icon-based implementation.
- Custom URLs are available on all affected gallery blocks in the first version.
- Page/post links are available on all affected gallery blocks in the first version.
- Custom URLs and page/post links are also available on the individual Image Block, but only show controls when the Image Block is used outside a gallery.
- Modular Gallery supports the full Image Click Action feature set.
- Overlay click actions are out of scope for this phase.
- Lightbox caption source stays as-is for simplicity.
- WooCommerce attributes should be preserved, but controls can be reworked to fit Image Click Settings.
- Downloads and WooCommerce integration remain mutually exclusive.

Remaining questions:

- What exact attributes should store media file, attachment page, page/post, custom URL, and none?
- Should page/post and custom URL target/new-tab be configured per image only, or can a gallery-level default be added later?
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
5. Add Activate Image Linking `SelectControl`:
   - None
   - Lightbox
   - WooCommerce Integration
   - Enable Image Downloads
   - Link Image to Media File
   - Link Image to Image Attachment Page
   - Link Image to Page/Post
   - Link Image to Custom URL
6. Show lightbox caption/product-info settings only when the selected action uses the lightbox.
7. Add frontend render support only for the new link actions after the panel split is stable.
8. Preserve existing frontend behavior through migration defaults.
