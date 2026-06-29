# Overlay, Hover Effect, and Typography Action Plan

## Goal

Broaden the original gradient overlay plan into a focused next-update plan for FolioBlocks hover presentation.

This update should make the marketing promise around hover effects more accurate by adding real image hover effects, improving overlay presentation controls, and keeping the editor UI compact enough to remain usable across Image Block, gallery-level settings, and per-image overrides.

## Product Direction

Keep three concepts separate in the UI and code:

- **Hover Style** controls what kind of overlay content treatment appears: fade overlay, gradient bottom, chip, blur overlay, or color overlay.
- **Hover Effect** controls the image/media motion or visual effect underneath the overlay: none, zoom, lift, etc.
- **Overlay Styles** control the visual styling of active overlays: colors, gradient backgrounds, entrance direction, and compact typography.

This separation matters because overlays and effects should be independently useful. A user should be able to use a zoom effect without an overlay, or use a color overlay without changing the image motion.

## Current Codebase Findings

The current overlay controls are injected through:

```text
src/pb-helpers/imageHoverActionPremiumControls.js
```

Current overlay style options:

- `fade-overlay`
- `gradient-bottom`
- `chip`
- `blur-overlay`
- `color-overlay`

Current overlay style attributes include:

- `onHoverTitle`
- `showTitleOnHover`
- `hoverTitle`
- `onHoverStyle`
- `overlayContent`
- `overlayBgColor`
- `overlayTextColor`
- `chipOverlayBgColor`
- `chipOverlayTextColor`

The Image Block already has CSS hooks for several image hover classes near the end of:

```text
src/pb-image-block/style.scss
```

Existing class names seen in CSS:

- `pb-hover-zoom`
- `pb-hover-tilt`
- `pb-hover-pan`
- `pb-hover-glare`
- `pb-hover-lift`
- `pb-hover-pop`

This suggests the first implementation should check whether these classes are complete and usable before inventing new CSS names.

Typography controls for filtering currently live in:

```text
src/pb-helpers/filteringPremiumControls.js
src/pb-helpers/getThemeSettings.js
```

The filtering controls include more typography options than we want for overlays. The overlay version should reuse the theme-font helpers where possible, but expose fewer controls.

## Scope

Include:

- Add `Hover Effect` control with default `none`.
- Add the hover effect to Image Block.
- Add the hover effect to gallery-level settings.
- Add the hover effect to per-image gallery overrides.
- Add gradient support for Color Overlay and Chip Overlay background colors.
- Add overlay entrance direction for overlay types where directional motion makes sense.
- Add compact overlay typography controls in the Styles panel when overlays are active.
- Preserve existing overlay behavior for saved blocks.
- Respect reduced-motion preferences.

Out of scope for this update:

- Full animation builder controls.
- Custom duration/easing controls in the first version.
- Font size controls for overlays.
- Advanced responsive typography controls.
- Reworking lightbox typography.
- Adding hover effects to video playback controls beyond shared thumbnail/media wrappers.

## Recommended Hover Effects

Add these effects first:

- **None**: default. No image motion.
- **Zoom In**: gently scales the image up on hover. This is the safest and most expected gallery effect.
- **Zoom Out**: starts slightly zoomed and settles to normal size on hover. Good for editorial grids.
- **Lift**: raises the image/card slightly with a subtle shadow. Best for portfolio cards and product-style layouts.
- **Pan**: slowly shifts the image within its crop. Good for masonry and fixed-ratio gallery thumbnails.
- **Tilt**: small rotate/scale treatment. Use gently; it can feel playful and should remain subtle.
- **Pop**: quick scale-up with a snappier feel. Useful for thumbnails, but should not be the default.
- **Desaturate**: image starts desaturated and returns to full color on hover.
- **Brighten**: image subtly brightens on hover.

Recommended MVP set:

1. None
2. Zoom In
3. Lift
4. Pan
5. Desaturate
6. Brighten

Recommended follow-up set:

1. Zoom Out
2. Tilt
3. Pop
4. Glare

Reasoning:

- The MVP set covers the effects most users expect from a gallery plugin.
- It avoids effects that can feel gimmicky or create layout risk.
- It gives photographers and creatives useful treatments without making the UI feel crowded.
- Existing CSS already references several effect class names, so implementation may be mostly wiring plus refinement.

## Hover Effect UI

Add a select control named:

```text
Hover Effect
```

Recommended placement:

- In **Gallery Click Settings** for gallery-level controls, as requested.
- In the individual **Image Block** controls near the existing hover settings.
- In per-image gallery overrides alongside the existing hover override controls.

Recommended options:

```js
[
	{ label: __( 'None', 'folioblocks' ), value: 'none' },
	{ label: __( 'Zoom In', 'folioblocks' ), value: 'zoom-in' },
	{ label: __( 'Lift', 'folioblocks' ), value: 'lift' },
	{ label: __( 'Pan', 'folioblocks' ), value: 'pan' },
	{ label: __( 'Desaturate', 'folioblocks' ), value: 'desaturate' },
	{ label: __( 'Brighten', 'folioblocks' ), value: 'brighten' },
]
```

Potential attribute:

```json
"hoverEffect": {
	"type": "string",
	"enum": [ "none", "zoom-in", "lift", "pan", "desaturate", "brighten" ],
	"default": "none"
}
```

Potential class map:

```js
{
	'zoom-in': 'pb-hover-effect-zoom-in',
	lift: 'pb-hover-effect-lift',
	pan: 'pb-hover-effect-pan',
	desaturate: 'pb-hover-effect-desaturate',
	brighten: 'pb-hover-effect-brighten',
}
```

Use a new class prefix such as `pb-hover-effect-*` if the existing `pb-hover-*` classes are incomplete or semantically tied to old experiments. If existing classes are complete, either reuse them or alias them to the new prefix for compatibility.

## Hover Effect Inheritance

Gallery-level behavior:

- Gallery blocks store `hoverEffect`.
- Gallery context passes `folioBlocks/hoverEffect` to child Image Blocks.
- Child Image Blocks render the inherited class when they do not override gallery hover settings.

Per-image behavior:

- Per-image overrides should include `hoverEffect`.
- When `overrideGalleryHoverSettings` is enabled, the child image's `hoverEffect` should replace the gallery value.
- When per-image overrides are disabled, gallery-level `hoverEffect` should apply.

Image Block behavior:

- Standalone Image Blocks store and render their own `hoverEffect`.
- Default remains `none`.

Filmstrip behavior:

- Filmstrip needs special attention because the active image changes without a full block re-render.
- `premium-view.js` should update the hover effect class when the active image changes.

## Overlay Entrance Direction

Add entrance direction only where the overlay is a spatial layer that can enter naturally.

Recommended overlay types:

- **Color Overlay**: yes. The full overlay can slide in from top, right, bottom, or left.
- **Blur Overlay**: yes, but only if the blur layer is a distinct overlay surface. Sliding blur can look good if restrained.
- **Fade Overlay**: maybe. Fade overlay is conceptually opacity-based, but it can support `fade` plus directional content entrance.
- **Chip**: yes for the chip element itself, not for a full-image overlay. Direction could control where the chip enters from.
- **Gradient Bottom**: no for the first version. It is anchored to the bottom by design, so directional entrance fights the mental model.

Recommended MVP:

- Color Overlay: `fade`, `bottom`, `top`, `left`, `right`
- Chip: `fade`, `bottom`, `top`, `left`, `right`

Recommended follow-up:

- Blur Overlay: `fade`, `bottom`, `top`, `left`, `right`
- Fade Overlay: keep as `fade`, or allow content-only entrance

Potential attribute:

```json
"overlayEntrance": {
	"type": "string",
	"enum": [ "fade", "bottom", "top", "left", "right" ],
	"default": "fade"
}
```

Potential class map:

```js
{
	fade: 'pb-overlay-enter-fade',
	bottom: 'pb-overlay-enter-bottom',
	top: 'pb-overlay-enter-top',
	left: 'pb-overlay-enter-left',
	right: 'pb-overlay-enter-right',
}
```

UI placement:

- Add `Overlay Entrance` in the existing hover overlay style controls panel.
- Show it only when the selected overlay supports entrance controls.
- Keep `fade` as the default to preserve current behavior.

## Gradient Overlay Backgrounds

Keep the original gradient plan as the first implementation slice.

The shared picker lives in:

```text
src/pb-helpers/CompactColorControl.js
```

The first version should extend `CompactTwoColorControl` so users still see one compact control with two swatches:

- First swatch: foreground/text color only.
- Second swatch: background color or gradient.

Recommended prop:

```jsx
<CompactTwoColorControl
	secondSupportsGradient
	firstLabel={ __( 'Text', 'folioblocks' ) }
	secondLabel={ __( 'Background', 'folioblocks' ) }
/>
```

Enable gradient support for:

- Color Overlay background.
- Chip Overlay background.

Do not enable gradient support for:

- Overlay text colors.
- Icon colors.
- Icon backgrounds.
- Filter colors in this update.

The current CSS already uses `background: var(...)` for overlay backgrounds, which can render solid colors and gradients. Keep that behavior.

## Overlay Typography Controls

Add a new compact helper inspired by the filtering controls, but do not expose the full filtering typography surface.

Recommended helper:

```text
src/pb-helpers/overlayTypographyControls.js
```

Recommended attributes:

```json
"overlayFontFamily": {
	"type": "string",
	"default": ""
},
"overlayFontWeight": {
	"type": "string",
	"default": ""
},
"overlayFontStyle": {
	"type": "string",
	"enum": [ "normal", "italic" ],
	"default": "normal"
},
"overlayTextTransform": {
	"type": "string",
	"enum": [ "none", "uppercase", "lowercase", "capitalize" ],
	"default": "none"
}
```

Recommended controls:

- **Font Family**: theme font select using `getFontFamilyOptions()`.
- **Appearance**: WordPress `FontAppearanceControl` for weight and italic, if stable in this codebase.
- **Letter Case**: WordPress `TextTransformControl`.

Do not include in MVP:

- Font size.
- Line height.
- Letter spacing.
- Text decoration.

Reasoning:

- Font size is risky in dense gallery thumbnails and can easily cause overlap.
- Line height and letter spacing are useful, but they make the control feel like a full typography panel.
- Font family, weight, style, and case are enough to make overlays feel branded without crowding the UI.

Potential CSS variables:

```css
--pb-overlay-font-family
--pb-overlay-font-weight
--pb-overlay-font-style
--pb-overlay-text-transform
```

Apply these to:

- `.pb-image-block-title`
- `.pb-product-name`
- `.pb-product-price`
- `.pb-hover-exif`
- Chip overlay text

Consider whether EXIF should inherit all typography settings. It may be better to inherit font family and weight, but preserve its compact sizing and icon layout.

## Attribute and Context Updates

Add new attributes to every block that owns or passes gallery hover settings:

- Image Block
- Grid Gallery
- Masonry Gallery
- Justified Gallery
- Carousel Gallery
- Modular Gallery
- Filmstrip Gallery

New attributes:

- `hoverEffect`
- `overlayEntrance`
- `overlayFontFamily`
- `overlayFontWeight`
- `overlayFontStyle`
- `overlayTextTransform`

Context additions:

```json
"providesContext": {
	"folioBlocks/hoverEffect": "hoverEffect",
	"folioBlocks/overlayEntrance": "overlayEntrance",
	"folioBlocks/overlayFontFamily": "overlayFontFamily",
	"folioBlocks/overlayFontWeight": "overlayFontWeight",
	"folioBlocks/overlayFontStyle": "overlayFontStyle",
	"folioBlocks/overlayTextTransform": "overlayTextTransform"
}
```

Image Block `usesContext` additions:

```json
[
	"folioBlocks/hoverEffect",
	"folioBlocks/overlayEntrance",
	"folioBlocks/overlayFontFamily",
	"folioBlocks/overlayFontWeight",
	"folioBlocks/overlayFontStyle",
	"folioBlocks/overlayTextTransform"
]
```

Per-image override data should include the same keys.

## PHP Sanitization

Add or reuse shared sanitizers for CSS values before outputting inline custom properties.

Recommended location:

```text
includes/php/css-values.php
```

Recommended helper functions:

```php
fbks_sanitize_css_color_value( $value )
fbks_sanitize_css_background_value( $value )
fbks_sanitize_css_font_family_value( $value )
fbks_sanitize_css_identifier_value( $value, $allowed_values, $default )
```

Gradient background behavior:

- Accept empty strings.
- Accept normal safe colors through `sanitize_hex_color`, safe named values where needed, and safe `rgb()`, `rgba()`, `hsl()`, `hsla()` values.
- Accept safe `linear-gradient()` and `radial-gradient()` values.
- Consider `conic-gradient()` only after testing.
- Reject semicolons, braces, `url(`, `var(`, `expression(`, comments, and HTML-like characters.

Typography behavior:

- Font family should allow empty strings and safe theme preset variables if needed.
- Font weight should allow `100` through `900`, `normal`, `bold`, and empty string.
- Font style should allow `normal` and `italic`.
- Text transform should allow `none`, `uppercase`, `lowercase`, and `capitalize`.

Class-like options:

- Hover effect and overlay entrance should be enum-validated before class output.

## CSS Implementation Notes

Effects should avoid layout shift.

Recommended principles:

- Apply transforms to the image/media element, not the gallery item dimensions.
- Keep effects inside the existing overflow-hidden image wrapper.
- Use `will-change` sparingly and only on transform/opacity targets.
- Keep default transition duration around `0.35s`.
- Respect `prefers-reduced-motion: reduce` by disabling transforms and directional movement.

Recommended CSS variables:

```css
--pb-hover-duration: 0.35s;
--pb-hover-scale: 1.065;
--pb-overlay-enter-distance: 18px;
```

Effect mapping:

- `zoom-in`: image scales from `1` to `1.065`.
- `lift`: wrapper or image raises slightly with subtle shadow; no surrounding layout shift.
- `pan`: image starts slightly translated and moves toward center on hover.
- `desaturate`: image starts grayscale and returns to full color on hover.
- `brighten`: image brightness increases subtly on hover.

Reduced motion:

- Remove transform movement.
- Keep simple opacity transitions where appropriate.
- Avoid animated pan/tilt/glare effects.

## Editor Integration

Recommended changes in:

```text
src/pb-helpers/imageHoverActionPremiumControls.js
```

Add:

- Shared hover effect options.
- Shared overlay entrance options.
- Shared overlay typography ToolsPanel items.
- `secondSupportsGradient` for Color Overlay and Chip Overlay background controls.

Consider extracting helpers to keep the file from growing too much:

```text
src/pb-helpers/hoverEffectControls.js
src/pb-helpers/overlayTypographyControls.js
```

Use existing theme setting helpers:

```text
src/pb-helpers/getThemeSettings.js
```

Potential new helper:

```js
export function getOverlayTypographyCSS( attributes ) {
	return {
		'--pb-overlay-font-family': attributes?.overlayFontFamily || '',
		'--pb-overlay-font-weight': attributes?.overlayFontWeight || '',
		'--pb-overlay-font-style': attributes?.overlayFontStyle || 'normal',
		'--pb-overlay-text-transform':
			attributes?.overlayTextTransform || 'none',
	};
}
```

## Rendering Targets

Review and update:

```text
src/pb-image-block/edit.js
src/pb-image-block/render.php
src/pb-image-block/premium.js
src/pb-image-block/style.scss
src/filmstrip-gallery-block/edit.js
src/filmstrip-gallery-block/render.php
src/filmstrip-gallery-block/premium-view.js
```

Gallery block JSON and context targets:

```text
src/grid-gallery-block/block.json
src/masonry-gallery-block/block.json
src/justified-gallery-block/block.json
src/carousel-gallery-block/block.json
src/modular-gallery-block/block.json
src/filmstrip-gallery-block/block.json
```

Also review gallery edit files where Inspector panels are assembled:

```text
src/grid-gallery-block/edit.js
src/masonry-gallery-block/edit.js
src/justified-gallery-block/edit.js
src/carousel-gallery-block/edit.js
src/modular-gallery-block/edit.js
src/filmstrip-gallery-block/edit.js
```

## Backward Compatibility

Existing blocks should continue to render unchanged because:

- `hoverEffect` defaults to `none`.
- `overlayEntrance` defaults to `fade`.
- Overlay typography defaults to empty/theme default values.
- Solid color overlay values remain valid.
- Existing overlay style attributes remain unchanged.

No block deprecation or migration should be required for the MVP.

## Testing Plan

Editor checks:

- Standalone Image Block shows `Hover Effect` and defaults to `None`.
- Gallery-level `Hover Effect` applies to all child images.
- Per-image override can replace the gallery hover effect.
- Turning per-image override off returns to the gallery hover effect.
- Hover effect works with no overlay active.
- Hover effect works with each overlay style.
- Color Overlay background can be set to a solid color.
- Color Overlay background can be set to a gradient.
- Chip Overlay background can be set to a solid color.
- Chip Overlay background can be set to a gradient.
- Overlay Entrance appears only for supported overlay styles.
- Overlay typography controls appear only when overlays are active.
- Existing blocks with saved overlay colors load without UI errors.

Frontend checks:

- Image Block renders hover effects.
- Grid, Masonry, Justified, Modular, and Carousel galleries inherit hover effects.
- Filmstrip main image updates hover effect when active image changes.
- Directional overlay entrances work for Color Overlay and Chip.
- Gradients render in Color Overlay and Chip Overlay.
- Overlay typography renders on title, caption, product info, and EXIF content.
- Reduced-motion mode disables transform-heavy effects.

Security checks:

- Gradient values containing `url(` are rejected.
- Gradient values containing semicolons are rejected.
- Gradient values containing HTML-like characters are rejected.
- Hover effect values outside the enum are ignored.
- Overlay entrance values outside the enum are ignored.
- Typography enum values outside their allowed set are ignored.

Build checks:

- `npm run build`
- `npm run lint:js` if the current codebase lint state allows it.
- `npm run lint:css` if the current codebase lint state allows it.

## Suggested Implementation Order

1. Audit existing `pb-hover-*` CSS classes and decide whether to reuse or replace with `pb-hover-effect-*`.
2. Add `hoverEffect` attributes, context, class mapping, and CSS for the MVP effect set.
3. Add per-image override support for `hoverEffect`.
4. Add `overlayEntrance` attributes, context, controls, class mapping, and CSS for Color Overlay and Chip.
5. Add shared CSS value sanitizers and wire them into overlay render paths.
6. Extend `CompactTwoColorControl` with opt-in gradient support for the second swatch.
7. Enable gradient backgrounds for Color Overlay and Chip Overlay.
8. Add compact overlay typography attributes, controls, CSS variables, and PHP output.
9. Verify editor previews and frontend output across Image Block and gallery contexts.
10. Run the build and available lint checks.
11. Add changelog/readme entries when the implementation is ready to ship.

## Open Questions

- Should the UI label stay `Hover Style` for overlay type, or should it be renamed to `Overlay Style` to reduce confusion with the new `Hover Effect` control?
- Should `Hover Effect` live in `Gallery Click Settings`, `Gallery Hover Settings`, or both? The requested location is Gallery Click Settings, but conceptually it may belong with hover settings.
- Should Filmstrip apply hover effects to the main active image only, or also to thumbnails if thumbnails become interactive later?
- Should `Desaturate` start grayscale and reveal color on hover, or start normal and desaturate on hover?
- Should theme preset font family values using `var(--wp--preset--font-family--*)` be allowed in frontend sanitization?
- Should Background Video overlays receive gradient backgrounds and typography controls in this update, or remain a follow-up?
