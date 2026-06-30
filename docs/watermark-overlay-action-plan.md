# Watermark Overlay Action Plan

## Goal

Add a Pro Watermark Overlay feature for FolioBlocks that lets site owners save multiple named watermarks, choose one as the default, preview them live in settings, and render them dynamically on gallery images where useful.

The strongest product model is context-aware watermarking: users can keep small gallery thumbnails clean while showing the watermark on larger image views such as the lightbox. Watermarking should be treated primarily as a block/media feature with global defaults, not as a page-level feature.

## Product Model

Watermark Overlay should be a visual protection and branding layer, not destructive image processing in the first version.

Recommended model:

- Multiple named watermarks are managed in FolioBlocks > Global Settings.
- Each saved watermark stores its own asset and display settings.
- One saved watermark can be marked as the default.
- Individual gallery blocks can use the default watermark, select another saved watermark, or disable watermark behavior.
- Thumbnail and lightbox visibility are controlled at the gallery/block level, not on the saved watermark.
- The watermark is rendered dynamically with CSS/markup on the frontend.

This keeps the feature reversible and avoids generating duplicate media files in the MVP.

## Current Codebase Fit

FolioBlocks already has several pieces this feature can build on:

- Dynamic render files output image wrappers and inline CSS variables.
- Gallery blocks pass shared behavior to `pb-image-block` through block context.
- Premium controls are injected through `premium.js` filters.
- Existing right-click/content protection already establishes a Pro protection workflow.
- Lightbox behavior is handled separately from thumbnail gallery rendering, which makes context-specific watermark display practical.
- Admin screens already exist under the FolioBlocks menu and can be extended with a watermark settings section.

The feature should integrate with the existing gallery/image model rather than creating a separate watermark-only block.

## MVP Scope

Include:

- Multiple saved watermarks.
- Watermark naming.
- Default watermark selection.
- Watermark image upload per saved watermark.
- Live preview on the settings page.
- Global default opacity.
- Global default size.
- Global default position.
- Per-block enable/disable toggle.
- Per-block use default / select watermark / disabled mode.
- Per-block saved watermark selection.
- Per-block thumbnail visibility toggle.
- Per-block lightbox visibility toggle.
- Frontend thumbnail overlay rendering.
- Lightbox overlay rendering.

Out of scope for MVP:

- Permanently modifying image files.
- Generating watermarked derivative images.
- Watermarked download files.
- Per-image watermark selection.
- Client-specific watermark text.
- Watermark analytics or deterrence tracking.
- Full DRM-style image protection.

## Global Settings Page

Add a Global Settings page under the FolioBlocks admin menu. Watermark Overlay should be the first major section, but the page should be named broadly so it can later hold global lightbox defaults, gallery defaults, protection defaults, and other plugin-wide behavior.

Recommended first navigation:

- FolioBlocks > Dashboard
- FolioBlocks > Global Settings
- FolioBlocks > Free vs Pro
- FolioBlocks > System Info

Recommended initial Global Settings sections:

- Watermarks.
- Future Global Defaults placeholder.
- Implementation notes/help text explaining that global settings are defaults and block controls can override them.

Recommended settings:

```json
{
  "watermarks": {
    "enabledByDefault": false,
    "defaultWatermarkId": "studio-white-logo",
    "items": [
      {
        "id": "studio-white-logo",
        "name": "Studio White Logo",
        "assetId": 0,
        "assetUrl": "",
        "opacity": 0.28,
        "sizeMode": "auto",
        "sizeScale": "medium",
        "size": 16,
        "position": "center",
        "inset": 4,
        "repeat": "no-repeat"
      }
    ]
  }
}
```

Recommended controls:

- Saved watermark list.
- Add watermark.
- Duplicate watermark.
- Delete watermark.
- Set as default.
- Watermark name.
- Watermark image upload.
- Remove watermark image.
- Enable watermark by default for new blocks.
- Position: center, top left, top right, bottom left, bottom right.
- Size mode: auto, small, medium, large, custom.
- Custom size as percentage of the rendered image short edge.
- Edge inset as percentage of the rendered image short edge, rendered as the same pixel inset on all sides.
- Opacity slider.
- Repeat/tile toggle.
- Compact saved watermark rows.
- Edit button/expanded editor for saved watermarks.
- Save Watermark action inside the active add/edit area.

Recommended accepted asset types:

- WordPress-supported raster image uploads, including PNG, JPEG, WebP, and GIF where the Media Library allows them.
- Transparent PNG.
- Transparent WebP.

PNG should be the safest default recommendation because transparent PNG watermarks are widely understood by non-technical users. SVG should not be part of the default upload promise because WordPress does not allow SVG uploads by default; only support SVG if the site explicitly enables and sanitizes SVG media uploads.

Avoid user-facing "preset" wording. The UI should say "watermark", "saved watermark", "default watermark", and "select watermark". Internally the saved records can behave like presets, but the product language should match the user's workflow.

## Settings Page Live Preview

The settings page should include a live preview panel for each saved watermark, or at minimum for the currently edited watermark.

Preview behavior:

- Show a neutral sample image.
- Layer the selected saved watermark over the sample image.
- Update opacity, size, position, repeat, and aspect ratio immediately as controls change.
- Update the preview as soon as the user chooses an image from the WordPress media modal, before saving.
- Keep saved watermark rows compact after saving, with an edit action that opens the full controls.
- Provide aspect-ratio preview buttons so users can test square, portrait, landscape, and wide image proportions.
- Let users click the preview to open a larger modal preview.
- Keep the watermark management screen focused on the watermark content, without the Global Settings sidebar or quick links.
- Include a light/dark sample toggle if it remains simple.

The preview should not try to reproduce every gallery layout. Its job is to help users tune the watermark visually.

Suggested preview markup:

```html
<div class="fbks-watermark-preview">
  <img class="fbks-watermark-preview__image" src="sample.jpg" alt="">
  <span class="fbks-watermark-preview__mark" aria-hidden="true"></span>
</div>
```

Suggested CSS variables:

```css
--fbks-watermark-opacity
--fbks-watermark-size
--fbks-watermark-position
--fbks-watermark-repeat
```

## Watermark Sizing Strategy

Avoid sizing watermarks from image width alone. A watermark sized as a fixed percentage of width can look too large on portrait images and too small on square or narrow images.

Recommended default:

```text
watermarkSize = renderedShortEdge * percentage
```

Suggested defaults:

- Small: 10% of short edge.
- Medium: 16% of short edge.
- Large: 22% of short edge.
- Custom: 5% to 40% of short edge.
- Inset: 4% of short edge, converted to one pixel value that is applied equally to all sides.

This keeps the watermark visually proportional across 2:3 portrait, 1:1 square, 3:4 portrait, 4:3 landscape, and wide landscape images.

Difficulty:

- Simple preview: low.
- Polished responsive preview: moderate.
- Exact preview of every block/lightbox context: not recommended for MVP.

## Block Controls

Add Pro controls to image and gallery blocks. Watermark controls should live in a dedicated Watermark inspector panel, not in the WordPress Advanced panel. Advanced already contains unrelated WordPress controls, and watermarking is visual media behavior rather than a technical block setting.

Recommended controls:

- Watermark: use default / select watermark / disabled.
- Watermark select control populated with saved watermark names.
- Show on thumbnails.
- Show in lightbox.
- Optional opacity override.
- Optional size override.
- Optional position override.

Recommended MVP control shape:

```json
{
  "watermarkMode": "default",
  "watermarkId": "",
  "watermarkShowOnThumbnails": null,
  "watermarkShowInLightbox": null
}
```

Use `default` as the default so blocks inherit the default saved watermark without cluttering each block.

If local style overrides are added later:

```json
{
  "watermarkOpacity": null,
  "watermarkSize": null,
  "watermarkPosition": ""
}
```

Keep the first block UI small. The settings page is where the detailed visual tuning should happen.

Recommended hierarchy:

- Global Settings define saved watermarks and the default watermark.
- Block Watermark panel controls use default / select watermark / disabled behavior.
- Gallery-level controls decide whether the chosen watermark appears on thumbnails, in the lightbox, or both.
- Individual image overrides can be deferred.
- Page-level controls should be limited to future broad exceptions such as disabling watermarks on a page, not the primary workflow.

## Frontend Rendering

Use a dynamic overlay layer.

Thumbnail rendering:

- Add a watermark layer inside image wrappers only when thumbnail watermarking is enabled.
- Use pointer-events none so the watermark does not block existing overlay, link, cart, download, or lightbox actions.
- Clip to the image wrapper so watermarks respect border radius and gallery layout.

Lightbox rendering:

- Add a watermark layer to the displayed lightbox image container when lightbox watermarking is enabled.
- Keep it independent of hover overlays and captions.
- Reapply it when the lightbox image changes.
- Ensure it does not interfere with zoom/navigation controls.

Suggested frontend markup:

```html
<span class="pb-watermark-overlay" aria-hidden="true"></span>
```

Suggested CSS:

```css
.pb-watermark-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: var(--pb-watermark-image);
  background-repeat: var(--pb-watermark-repeat, no-repeat);
  background-position: var(--pb-watermark-position, center);
  background-size: var(--pb-watermark-size, 24%) auto;
  opacity: var(--pb-watermark-opacity, 0.28);
}
```

For non-repeating watermarks, `background-image` on an overlay is simpler than rendering an extra `<img>` for every image. The chosen saved watermark should resolve to CSS variables for asset URL, opacity, position, repeat, size, and inset.

## Context-Aware Display

The feature should explicitly support different behavior in different viewing contexts.

Recommended MVP defaults:

- Thumbnails: off.
- Lightbox: on.

Why:

- Small gallery thumbnails often look worse with watermarks.
- The lightbox is where users inspect larger images and where watermarking is more meaningful.
- This gives users a clean gallery and protected large previews.

Future option:

- Minimum rendered width before showing thumbnail watermark.

Example:

```json
{
  "watermarkMinThumbnailWidth": 480
}
```

This can be implemented later with container queries, ResizeObserver, or a CSS class added by JavaScript.

## PHP Architecture

Recommended settings module:

```text
includes/php/watermark-settings.php
```

Recommended responsibilities:

- Define default watermark settings.
- Sanitize saved values.
- Resolve effective watermark settings for a block.
- Expose sanitized settings to editor JavaScript.
- Provide helper functions for render files.

Suggested functions:

```php
fbks_get_watermark_defaults()
fbks_sanitize_watermark_settings( $settings )
fbks_get_watermark_settings()
fbks_resolve_watermark_settings( $attributes = array(), $context = array() )
fbks_get_watermark_style_vars( $settings )
```

Sanitization:

- Asset ID should be an integer attachment ID.
- Asset URL should be derived from the attachment ID when possible.
- Opacity should clamp between `0` and `1`.
- Size should clamp to a practical range, such as `5` to `100`.
- Position should be an allowlisted string.
- Blend mode should be an allowlisted string.
- Repeat should be an allowlisted string.

## Editor Architecture

Global settings page:

- Use the WordPress media uploader.
- Store the selected attachment ID.
- Update preview immediately after media selection.
- Save through the existing admin settings pattern.

Block editor:

- Localize global watermark settings into `window.folioBlocksData`.
- Add premium controls through existing filter patterns.
- Pass gallery watermark settings through block context to image blocks.
- Show a small editor preview overlay when watermarking thumbnails is enabled.

Avoid building a large React settings app for MVP unless the existing settings page architecture already requires it.

## Lightbox Integration

Lightbox watermarking needs specific attention because lightbox markup is often built or updated in JavaScript.

Implementation options:

1. Add watermark data attributes to each image/link and let lightbox JavaScript render the overlay.
2. Add global watermark settings to the lightbox initialization payload.
3. Add a stable watermark overlay element to the lightbox image container and update its CSS variables when the active image changes.

Recommended approach:

- Use the resolved saved watermark settings for lightbox watermark styling.
- Use per-image or per-block data attributes only for visibility decisions.
- Keep one reusable overlay element inside the lightbox image container.

This avoids creating duplicate overlay nodes for each navigation event.

## Accessibility

The watermark is decorative and should not be announced.

Rules:

- Use `aria-hidden="true"` if rendering an element.
- Use CSS background images where practical.
- Keep pointer events disabled.
- Do not trap focus.
- Do not interfere with existing image alt text, captions, product info, or EXIF overlays.

## Security And Limitations

Be clear in documentation and UI copy: dynamic watermark overlays are visual deterrents, not absolute image protection.

Limitations:

- A technical user may still access original image URLs.
- Browser screenshots can capture images.
- CSS overlays can be hidden by someone with developer tools.

The feature is still valuable for:

- Client proofing.
- Preview galleries.
- Brand presentation.
- Casual copying deterrence.

For stronger protection, a future version could generate watermarked preview derivatives server-side.

## Testing Plan

Settings page:

- Upload watermark image.
- Remove watermark image.
- Preview updates before save.
- Opacity slider updates preview.
- Size control updates preview.
- Position control updates preview.
- Blend mode control updates preview.
- Repeat/tile control updates preview.
- Saved settings persist after reload.

Editor:

- New blocks use the default saved watermark when watermarking is enabled by default.
- Existing blocks can use default, select another saved watermark, or disable watermarking.
- Thumbnail watermark preview appears when enabled.
- Thumbnail watermark preview disappears when disabled.
- Gallery block context passes settings to image blocks.

Frontend thumbnails:

- Watermark appears only when thumbnail visibility is enabled.
- Watermark does not block hover overlays.
- Watermark does not block download/cart/link icons.
- Watermark respects image border radius and layout clipping.
- Watermark is not rendered when no asset exists.

Lightbox:

- Watermark appears when lightbox visibility is enabled.
- Watermark updates correctly while navigating images.
- Watermark does not block next/previous/close controls.
- Watermark does not interfere with captions, EXIF data, or product info.
- Watermark remains hidden when lightbox visibility is disabled.

Responsive:

- Watermark remains proportional on desktop, tablet, and mobile.
- Tiled watermark does not become visually overwhelming on small screens.
- Positioning remains correct for portrait and landscape images.

## Suggested Implementation Order

1. Add saved watermark settings schema and sanitization.
2. Add settings page controls for adding, naming, editing, deleting, and setting a default watermark.
3. Add live preview to the settings page.
4. Expose sanitized watermark settings to editor JavaScript.
5. Add block attributes and Pro controls for use default, select watermark, disabled, thumbnails, and lightbox visibility.
6. Pass gallery watermark settings through block context to image blocks.
7. Render thumbnail overlay when enabled.
8. Add lightbox overlay rendering and update behavior.
9. Verify interactions with hover overlays, icons, captions, EXIF, Product Info, and right-click protection.
10. Add readme/changelog copy when ready to ship.

## Future Enhancements

- Minimum thumbnail width threshold.
- Separate thumbnail and lightbox opacity/size/position.
- Tiled watermark only in lightbox.
- Per-block custom watermark settings without creating a saved watermark.
- Text-based watermark using site name, client name, or project name.
- Server-side generated watermarked preview derivatives.
- Watermarked download generation.
- Optional automatic watermark suggestions for bright or dark images.
