# Watermark Overlay Action Plan

## Goal

Add a Pro Watermark Overlay feature for FolioBlocks that lets site owners upload one global watermark asset, preview it live in settings, and render it dynamically on gallery images where it is useful.

The strongest product model is context-aware watermarking: users can keep small gallery thumbnails clean while showing the watermark on larger image views such as the lightbox.

## Product Model

Watermark Overlay should be a visual protection and branding layer, not destructive image processing in the first version.

Recommended model:

- A global watermark asset is uploaded in a FolioBlocks settings page.
- Global defaults define how the watermark appears.
- Individual blocks can enable, disable, or override watermark behavior.
- Thumbnail and lightbox visibility are controlled separately.
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

- Global watermark image upload.
- Live preview on the settings page.
- Global default opacity.
- Global default size.
- Global default position.
- Global default blend mode.
- Global default visibility for thumbnails.
- Global default visibility for lightbox images.
- Per-block enable/disable toggle.
- Per-block thumbnail visibility toggle.
- Per-block lightbox visibility toggle.
- Frontend thumbnail overlay rendering.
- Lightbox overlay rendering.

Out of scope for MVP:

- Permanently modifying image files.
- Generating watermarked derivative images.
- Watermarked download files.
- Per-image watermark assets.
- Multiple watermark presets.
- Client-specific watermark text.
- Watermark analytics or deterrence tracking.
- Full DRM-style image protection.

## Global Settings

Add a Watermark section to the FolioBlocks settings/admin area.

Recommended settings:

```json
{
  "watermark": {
    "enabledByDefault": false,
    "assetId": 0,
    "assetUrl": "",
    "opacity": 0.28,
    "size": 24,
    "position": "center",
    "blendMode": "normal",
    "showOnThumbnails": false,
    "showInLightbox": true,
    "repeat": "no-repeat"
  }
}
```

Recommended controls:

- Watermark image upload.
- Remove watermark image.
- Enable watermark by default for new blocks.
- Show on thumbnails.
- Show in lightbox.
- Position: center, top left, top right, bottom left, bottom right.
- Size as percentage of image width.
- Opacity slider.
- Blend mode select.
- Repeat/tile toggle.

Recommended accepted asset types:

- PNG.
- SVG if the current media security posture allows it.
- WebP with transparency.

PNG should be the safest default recommendation because transparent PNG watermarks are widely understood by non-technical users.

## Settings Page Live Preview

The settings page should include a live preview panel.

Preview behavior:

- Show a neutral sample image.
- Layer the uploaded watermark over the sample image.
- Update opacity, size, position, repeat, and blend mode immediately as controls change.
- Update the preview as soon as the user chooses an image from the WordPress media modal, before saving.
- Include a light/dark sample toggle if it remains simple.

The preview should not try to reproduce every gallery layout. Its job is to help users tune the watermark visually.

Suggested preview markup:

```html
<div class="fbks-watermark-preview">
  <img class="fbks-watermark-preview__image" src="sample.jpg" alt="">
  <img class="fbks-watermark-preview__mark" src="watermark.png" alt="">
</div>
```

Suggested CSS variables:

```css
--fbks-watermark-opacity
--fbks-watermark-size
--fbks-watermark-position
--fbks-watermark-repeat
--fbks-watermark-blend-mode
```

Difficulty:

- Simple preview: low.
- Polished responsive preview: moderate.
- Exact preview of every block/lightbox context: not recommended for MVP.

## Block Controls

Add Pro controls to image and gallery blocks.

Recommended controls:

- Watermark: inherit global / enabled / disabled.
- Show on thumbnails.
- Show in lightbox.
- Optional opacity override.
- Optional size override.
- Optional position override.

Recommended MVP control shape:

```json
{
  "watermarkMode": "inherit",
  "watermarkShowOnThumbnails": null,
  "watermarkShowInLightbox": null
}
```

Use `inherit` as the default so global settings can shape behavior without cluttering each block.

If local style overrides are added later:

```json
{
  "watermarkOpacity": null,
  "watermarkSize": null,
  "watermarkPosition": ""
}
```

Keep the first block UI small. The settings page is where the detailed visual tuning should happen.

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
  mix-blend-mode: var(--pb-watermark-blend-mode, normal);
}
```

For a single non-repeating watermark, `background-image` on an overlay is simpler than rendering an extra `<img>` for every image.

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

- Use global/default settings for lightbox watermark styling.
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

- New blocks inherit global defaults.
- Existing blocks can enable or disable watermarking.
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

1. Add global watermark settings schema and sanitization.
2. Add settings page upload controls.
3. Add live preview to the settings page.
4. Expose sanitized watermark settings to editor JavaScript.
5. Add block attributes and Pro controls for enable/inherit, thumbnails, and lightbox visibility.
6. Pass gallery watermark settings through block context to image blocks.
7. Render thumbnail overlay when enabled.
8. Add lightbox overlay rendering and update behavior.
9. Verify interactions with hover overlays, icons, captions, EXIF, Product Info, and right-click protection.
10. Add readme/changelog copy when ready to ship.

## Future Enhancements

- Minimum thumbnail width threshold.
- Separate thumbnail and lightbox opacity/size/position.
- Tiled watermark only in lightbox.
- Per-block custom watermark asset.
- Text-based watermark using site name, client name, or project name.
- Server-side generated watermarked preview derivatives.
- Watermarked download generation.
- Presets for subtle, proofing, portfolio, and strong protection styles.
