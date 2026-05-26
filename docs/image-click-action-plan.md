# Image Click and Hover Action Plan

## Goal

FolioBlocks 1.3.0 reorganizes image interactions into two clearer inspector panels:

- Image Click Settings: what happens when a visitor clicks an image, action icon, or thumbnail.
- Image Hover Settings: what appears visually when a visitor hovers over an image.

The goal is to make lightbox, links, downloads, WooCommerce, captions, and hover overlays feel like one coherent system instead of several competing feature groups.

## Implemented in 1.3.0

### Image Click Settings

The old Lightbox, Image Download, and WooCommerce controls have been consolidated behind a single Image Click Behavior select control.

Current values:

- None
- Open in Lightbox
- Enable Image Downloads
- Link Image to Media File
- Link Image to Custom URL
- Link Image to Page/Post
- WooCommerce Product, when WooCommerce is active

Implemented behavior:

- Lightbox and the Show Image Caption in Lightbox option remain free features.
- Media file, custom URL, page/post, downloads, and WooCommerce actions are premium features.
- Free users see only None and Open in Lightbox, plus an upgrade notice naming the missing Pro click actions.
- WooCommerce and Image Downloads remain mutually exclusive.
- WooCommerce and Image Downloads can target either the thumbnail or an icon.
- Custom URL and Page/Post links can target either the thumbnail or a Link Target icon.
- When a Custom URL or Page/Post link uses the icon target, the thumbnail can still use the lightbox.
- Empty custom URL and Page/Post values do not output empty links.
- Attachment page linking was intentionally removed because modern WordPress disables attachment pages by default and block themes may not provide usable attachment templates.

### Image Click Styles

The old E-Commerce Styles panels have been renamed to Image Click Styles.

Implemented style controls:

- Download icon color and background.
- WooCommerce/Add to Cart icon color and background.
- Link Target icon color and background.

### Image Hover Settings

Image Block and Grid Gallery now use a shared Image Hover Style control model.

Current Hover Style values:

- None
- Fade Overlay
- Gradient Bottom
- Chip
- Blur Overlay
- Color Overlay

Implemented behavior:

- None maps to overlay off.
- Choosing any overlay style enables the overlay.
- The Hover Style help message changes based on the selected style.
- Overlay Content is available whenever an overlay style is active.
- Overlay Content values are:
  - Show Image Title
  - Show Image Caption
  - Show Product Info, only when Image Click Behavior is WooCommerce Product
- Color Overlay defaults to black text on a white background when selected.
- Color Overlay text/background colors are configured in a styles tools panel named Image Overlay Styles.

### Shared Helpers

Implemented shared premium helpers:

- `src/pb-helpers/imageClickActionPremiumControls.js`
- `src/pb-helpers/imageHoverActionPremiumControls.js`

These helpers reduce duplicated premium controls and should be reused as the remaining galleries are brought into the same hover model.

## Premium and Free Rules

Premium-only controls must stay in `premium.js` or helper modules imported only by `premium.js`, so Freemius can remove them from the free build.

Premium frontend behavior must be gated in PHP using:

```php
fbks_fs()->can_use_premium_code__premium_only()
```

Free behavior to preserve:

- Open in Lightbox.
- Show Image Caption in Lightbox.

Premium behavior:

- Image downloads.
- WooCommerce product linking.
- Media file links.
- Page/Post links.
- Custom URL links.
- Link Target icon controls and styles.
- Advanced hover overlay controls.

## Current Block Coverage

Image Click Behavior has been applied to:

- Image Block
- Grid Gallery
- Carousel Gallery
- Justified Gallery
- Masonry Gallery
- Modular Gallery
- Filmstrip Gallery

Filmstrip Gallery excludes Open in Lightbox because it has its own fullscreen mode.

Image Hover Style's new select-control model has been applied to:

- Image Block
- Grid Gallery

The remaining hover update pass should apply the same shared helper to:

- Carousel Gallery
- Justified Gallery
- Masonry Gallery
- Modular Gallery

Filmstrip Gallery should be reviewed separately because its visual model and fullscreen behavior are different.

## Compatibility Rules

Existing galleries should preserve their behavior after upgrading:

- Existing lightbox galleries map to Open in Lightbox.
- Existing WooCommerce galleries map to WooCommerce Product.
- Existing WooCommerce plus lightbox galleries map to WooCommerce Product with nested lightbox enabled.
- Existing download galleries map to Enable Image Downloads.
- Existing hover overlays map to the correct Hover Style.
- Existing WooCommerce hover product info maps to Show Product Info.

Do not require a save/migration step just to display the correct selected option in the editor. The editor should derive the effective state from existing attributes where possible.

Preserve existing values when modes are turned off:

- WooCommerce product assignments.
- WooCommerce default product link behavior.
- WooCommerce icon display.
- WooCommerce lightbox info type.
- Download icon display.
- Icon and overlay colors.
- Custom URL and Page/Post destination fields.

## Phase Two: Per-Image Overrides

Per-image overrides should be treated as the next focused phase, likely after the initial 1.3.0 launch unless testing shows they are needed immediately.

The goal is to let a gallery define a default behavior while individual Image Blocks inside the gallery can opt out or choose a different action.

### Image Click Overrides

Add an Image Click Override control to Image Blocks when they are used inside galleries.

Suggested values:

- Inherit Gallery Setting
- None
- Open in Lightbox
- Enable Image Downloads
- Link Image to Media File
- Link Image to Custom URL
- Link Image to Page/Post
- WooCommerce Product, when WooCommerce is active

Default value:

- Inherit Gallery Setting

Important behavior:

- If an image inherits, it uses the parent gallery's Image Click Behavior, Link Target, icon display, lightbox, and WooCommerce/download settings.
- If an image overrides, that image's override takes precedence in editor preview and frontend render.
- Custom URL and Page/Post destination controls should show when the inherited or overridden effective action requires them.
- Toolbar shortcuts for Custom URL and Page/Post should use the effective action.
- Empty Custom URL or Page/Post destinations must not output empty links.
- WooCommerce product assignment fields should continue to work per image.
- WooCommerce product action should preserve the existing per-image `wooLinkAction` inherit/product/add-to-cart behavior.

Potential attributes on `pb-image-block`:

- `imageClickOverrideAction`
- `imageClickOverrideTarget`
- `imageClickOverrideLinkIconDisplay`
- Optional override booleans if needed for lightbox/download/Woo controls

Recommended first pass:

- Add only `imageClickOverrideAction`, with `inherit` as the default.
- Reuse gallery context for Link Target and icon display unless the selected override requires its own target controls.
- Add more granular per-image click target/icon display overrides only if the initial override UI feels too limited.

### Image Hover Overrides

Add an Image Hover Override control to Image Blocks when they are used inside galleries.

Suggested Hover Style override values:

- Inherit Gallery Setting
- None
- Fade Overlay
- Gradient Bottom
- Chip
- Blur Overlay
- Color Overlay

Suggested Overlay Content override values:

- Inherit Gallery Setting
- Show Image Title
- Show Image Caption
- Show Product Info, when the effective click action is WooCommerce Product

Default values:

- Hover Style: Inherit Gallery Setting
- Overlay Content: Inherit Gallery Setting

Important behavior:

- If an image inherits, it uses the parent gallery hover style and overlay content.
- If an image overrides Hover Style, the override controls the class used in editor preview and frontend render.
- If an image overrides Overlay Content, the override controls title/caption/product output.
- Color Overlay colors can inherit from the gallery in the first version.
- Per-image Color Overlay color overrides can be added later if there is enough demand.

Potential attributes on `pb-image-block`:

- `imageHoverOverrideStyle`
- `imageHoverOverrideContent`
- Optional `imageHoverOverrideTextColor`
- Optional `imageHoverOverrideBgColor`

Recommended first pass:

- Add style/content overrides only.
- Keep color overrides inherited from the gallery to avoid an overly dense first UI.

## Phase Two: Video Lightbox

Video lightbox support should be built on top of per-image click overrides.

Recommended explicit action:

- Open Video in Lightbox

Do not make Custom URL automatically parse and open videos. Custom URL should remain a normal link action so users can predict what happens when entering a URL.

Primary use case:

- Gallery default is Open in Lightbox.
- Most images inherit and open as normal images.
- A small number of images override to Open Video in Lightbox.
- Those image blocks expose a Video URL field.

Video URL support should reuse the existing FolioBlocks video provider logic where possible:

- YouTube
- Vimeo
- Bunny Stream, if supported by the existing helper
- Self-hosted video

Potential per-image video fields:

- Video URL
- Optional video title override
- Optional video caption/description
- Optional lightbox layout/content setting if needed later

Implementation cautions:

- The Image Block lightbox must distinguish image items from video items.
- Mixed image/video galleries should keep keyboard navigation and close behavior consistent.
- Existing image-only lightbox behavior must not regress.

## Follow-Up Implementation Order

1. Apply the shared Image Hover Style helper to Carousel, Justified, Masonry, and Modular.
2. Review Filmstrip Gallery hover behavior separately.
3. Stabilize and test the 1.3.0 Image Click and Image Hover model.
4. Add per-image Image Click overrides.
5. Add per-image Image Hover overrides.
6. Add Open Video in Lightbox as a per-image click override.

## Testing Checklist

For each affected block:

- Existing lightbox content upgrades without changing behavior.
- Existing WooCommerce content upgrades without losing product assignments.
- Existing downloads upgrade without losing icon display settings.
- None disables click behavior.
- Custom URL and Page/Post do not output empty links when unset.
- Thumbnail and icon targets behave correctly.
- Add to Cart works with AJAX cart refresh and does not inject View Cart links under images.
- Hover Style None disables overlays.
- Hover Style choices update editor preview and frontend output.
- Overlay Content can show title, caption, and product info where supported.
- Color Overlay colors render in editor and frontend.
- Free version shows only free controls and appropriate upgrade notices.
