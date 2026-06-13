# Pro Feature Notices Action Plan

## Goal

Improve the free FolioBlocks editor experience by replacing generic premium-feature notices with useful, contextual previews of what FolioBlocks Pro unlocks.

The notices should help users understand the value of the unavailable controls without making the block inspector feel crowded or overly promotional. A shared component should provide consistent presentation, copy structure, upgrade links, accessibility, and future maintenance across all blocks.

## Current Codebase Findings

The free editor currently repeats the same general pattern:

```jsx
<Notice status="info" isDismissible={ false }>
	<strong>{ __( 'Feature Name', 'folioblocks' ) }</strong>
	<br />
	{ __( 'This is a premium feature. Unlock all features:', 'folioblocks' ) }{ ' ' }
	<a href={ checkoutUrl } target="_blank" rel="noopener noreferrer">
		{ __( 'Upgrade to Pro', 'folioblocks' ) }
	</a>
</Notice>
```

This pattern is used as the default value passed into WordPress filters. In the Pro build, premium filter callbacks replace the notice with active controls.

Current audit:

- 73 generic premium notices across 12 block editor files.
- Each affected block defines or reads its own `checkoutUrl`.
- Notice markup, spacing, link behavior, and generic upgrade copy are duplicated.
- Most notices name only the unavailable control and do not explain its benefit or related Pro features.
- Several gallery blocks repeat nearly identical notices for randomization, linking, hover settings, filtering, protection, image styles, and filter styles.
- Shared premium-control helpers already exist under `src/pb-helpers`, making that the natural home for the shared notice component.

Affected editor files:

| Block | Current Generic Notices |
| --- | ---: |
| Video Gallery | 11 |
| Grid Gallery | 8 |
| Masonry Gallery | 8 |
| Justified Gallery | 8 |
| Carousel Gallery | 8 |
| Filmstrip Gallery | 8 |
| Before/After Block | 5 |
| Modular Gallery | 4 |
| Image Block | 4 |
| Video Block | 4 |
| Loupe Block | 3 |
| Background Video Block | 2 |

## Product Principles

The notices should:

- Explain the result a user can achieve, not merely state that a feature is premium.
- List only features relevant to the current inspector panel.
- Use short, scannable copy with no more than three or four feature bullets.
- Preserve the existing filter fallback model so Pro controls continue replacing notices.
- Use one consistent upgrade action and URL resolution strategy.
- Remain useful when viewed repeatedly across different blocks.
- Avoid displaying large marketing cards in every panel.
- Be fully translatable and accessible.

The notices should not:

- List every FolioBlocks Pro feature in every notice.
- Use fear-based, urgent, or disruptive sales language.
- Automatically open external pages.
- Make free controls appear disabled when they are actually available.
- Replace useful free controls with promotional content.

## Recommended Shared Component

Add:

```text
src/pb-helpers/ProFeatureNotice.js
```

Suggested component API:

```jsx
<ProFeatureNotice
	title={ __( 'Gallery Hover Settings', 'folioblocks' ) }
	description={ __(
		'Create richer gallery interactions with customizable hover content.',
		'folioblocks'
	) }
	features={ [
		__( 'Choose gradient, blur, color, or chip hover styles.', 'folioblocks' ),
		__( 'Display image titles, captions, product details, or EXIF data.', 'folioblocks' ),
		__( 'Override hover settings for individual gallery images.', 'folioblocks' ),
	] }
	campaign="gallery-hover-settings"
/>
```

Recommended props:

```text
title        Required contextual heading.
description Optional one-sentence benefit statement.
features    Optional array of up to four short feature strings.
campaign    Required stable identifier for upgrade-link analytics.
ctaLabel    Optional override; default "Explore FolioBlocks Pro".
compact     Optional reduced presentation for narrow or secondary locations.
className   Optional additional class.
```

The component should resolve the upgrade URL internally:

```js
window.folioBlocksData?.checkoutUrl
```

Use the existing FolioBlocks pricing URL as a safe fallback. Append stable campaign information only if it can be done without discarding existing query parameters.

## Recommended Presentation

Continue using the WordPress `Notice` component for the first implementation, but give its contents a consistent internal structure:

```text
Feature title
Short benefit statement
- Relevant capability
- Relevant capability
- Relevant capability
[Explore FolioBlocks Pro]
```

Recommended UI details:

- Use `Notice` with `status="info"` and `isDismissible={ false }`.
- Use a WordPress `Button` component for the CTA instead of a plain inline link.
- Render the feature list only when features are supplied.
- Keep the CTA visually secondary rather than using an oversized primary button.
- Add modest internal spacing through a shared stylesheet or scoped component classes.
- Keep compact notices short enough to fit naturally inside inspector panels.

Suggested supporting stylesheet:

```text
src/pb-helpers/pro-feature-notice.scss
```

Suggested classes:

```text
pb-pro-feature-notice
pb-pro-feature-notice__description
pb-pro-feature-notice__features
pb-pro-feature-notice__actions
pb-pro-feature-notice--compact
```

## Copy Strategy

Use a small contextual copy catalog rather than writing unrelated prose in every block file.

Recommended feature groups:

### Gallery Layout

- Randomize image or video order.
- Add seamless Carousel looping.
- Configure advanced responsive layout behavior.

### Click Actions

- Link images to media files, custom URLs, Pages, or Posts.
- Offer image downloads.
- Connect gallery images to WooCommerce products.
- Override click behavior for individual images.

### Hover Settings

- Choose advanced hover styles.
- Display titles, captions, filtering categories, product information, or EXIF data.
- Customize overlay colors.
- Override hover settings for individual images or videos.

### Filtering

- Add visitor-facing gallery filters.
- Assign multiple filtering categories.
- Customize filter-bar typography and colors.

### Image And Video Styles

- Configure borders, corner radius, and shadows.
- Customize overlay, action-icon, and filtering colors.

### Protection And Performance

- Disable right-click on displayed media.
- Lazy-load images or videos.

### Lightbox

- Choose light or dark appearance.
- Display titles, captions, EXIF data, video information, or product information.
- Add fullscreen viewing where supported.

### WooCommerce

- Link media to WooCommerce products.
- Add product and cart actions.
- Display product information in overlays or lightboxes.

### Block-Specific Features

- Before/After Block: orientation, divider, labels, and comparison styling.
- Loupe Block: magnification behavior and loupe styling.
- Background Video Block: playback, responsive behavior, and advanced video settings.

Do not put this catalog into a large runtime configuration immediately unless it clearly reduces duplication. The shared component should own presentation; block files may continue owning their translated contextual copy during the first migration.

## Filter Compatibility

The existing filter pattern must remain intact:

```jsx
applyFilters(
	'folioBlocks.gridGallery.onHoverTitleToggle',
	<ProFeatureNotice ... />,
	{ attributes, setAttributes }
)
```

This preserves current behavior:

- Free build: the contextual notice renders.
- Pro build: the premium filter replaces the notice with active controls.
- No changes are required to premium filter hook names.
- Existing third-party filter integrations continue receiving the same hook and props.

The shared component must not contain premium gating logic. It is only the free fallback UI.

## Recommended Migration Order

### Phase 1: Shared Foundation

- Add `ProFeatureNotice.js`.
- Add scoped notice styles.
- Centralize checkout URL resolution and CTA behavior.
- Add translation-ready title, description, feature list, and CTA rendering.
- Confirm the component behaves correctly without `window.folioBlocksData`.

### Phase 2: Pilot Migration

Migrate Video Block and Video Gallery first.

Reasons:

- Their inspector controls were recently reorganized.
- Their free notices are currently fresh and easy to evaluate.
- Video Gallery has the largest number of repeated notices.
- Beta testing can validate the new notice presentation before broad rollout.

Pilot notice groups:

- Video Hover Settings.
- Video Gallery Filtering.
- Lightbox Content and Appearance.
- WooCommerce video features.
- Lazy Load and Disable Right-Click.
- Video and gallery styles.

### Phase 3: Shared Image And Gallery Migration

Migrate:

- Image Block.
- Grid Gallery.
- Masonry Gallery.
- Justified Gallery.
- Carousel Gallery.
- Filmstrip Gallery.
- Modular Gallery.

Use consistent copy for features shared across galleries while allowing block-specific wording where behavior differs.

### Phase 4: Specialist Block Migration

Migrate:

- Before/After Block.
- Loupe Block.
- Background Video Block.

These blocks need more tailored copy because their premium capabilities do not map directly to gallery feature groups.

### Phase 5: Cleanup

- Remove repeated local `checkoutUrl` declarations when no longer used elsewhere.
- Remove generic “This is a premium feature. Unlock all features” strings.
- Confirm no raw upgrade links remain where the shared component should be used.
- Regenerate translation files.
- Review inspector panels for excessive notice density.

## Notice Consolidation Rules

Not every existing notice should necessarily remain a separate notice.

Recommended rules:

- Use one notice per inspector panel when the unavailable controls form one coherent feature group.
- Keep separate notices when they appear in separate inspector groups or describe meaningfully different outcomes.
- Do not combine Click Settings, Hover Settings, Filtering, and Styles into one generic gallery notice.
- In Advanced, consider one compact “Protection and Performance” notice instead of separate Lazy Load and Disable Right-Click notices when both are unavailable in the same location.
- In Styles, avoid showing multiple large notices consecutively. Prefer one relevant notice per tools panel or one combined compact notice.

This should reduce the total number of rendered notices even if the same number of filter fallbacks remains in code.

## Analytics And Links

Each notice should receive a stable `campaign` identifier, such as:

```text
gallery-hover-settings
gallery-filtering
image-click-actions
video-lightbox
woocommerce-gallery
media-protection
```

Recommended URL parameters:

```text
utm_source=folioblocks
utm_medium=block-editor
utm_campaign={campaign}
```

Do not include post titles, site URLs, block content, media names, or other user data in upgrade links.

If `window.folioBlocksData.checkoutUrl` already includes tracking parameters, merge parameters safely rather than blindly appending a second query string.

## Accessibility And Translation

- Use semantic list markup for feature bullets.
- Ensure the CTA has clear standalone text.
- Keep the external-link behavior communicated consistently if needed.
- Preserve visible focus styles from the WordPress Button component.
- Do not rely on color alone to distinguish the notice.
- Pass every user-facing string through `__()` or the appropriate WordPress i18n helper.
- Avoid constructing translated sentences by concatenating fragments.
- Regenerate POT and locale files after migration.

## Testing Plan

Manual editor tests:

- Open every affected block in the free build.
- Confirm each unavailable feature shows the correct contextual notice.
- Confirm Pro controls still replace notices in the Pro build.
- Confirm no inspector panel contains unrelated feature claims.
- Confirm notices remain readable in narrow inspector widths.
- Confirm CTA links open the intended FolioBlocks page in a new tab.
- Confirm campaign parameters are correct and contain no user data.
- Confirm notices do not appear when the related feature is available for free.
- Confirm notice consolidation does not leave empty inspector panels.
- Confirm styles do not affect unrelated WordPress notices.

Accessibility tests:

- Navigate each notice and CTA by keyboard.
- Confirm feature lists and CTA labels are understandable with a screen reader.
- Confirm focus indicators remain visible.

Build checks:

```bash
npm run build
npm run lint:js
npm run lint:css
npm run i18n:pot
```

Audit checks:

```bash
rg "This is a premium feature|Unlock all features|Upgrade to Pro" src
rg "checkoutUrl" src/*/edit.js
```

## Open Decisions

- Should the default CTA say “Explore FolioBlocks Pro” or “Upgrade to FolioBlocks Pro”?
- Should notices link to the pricing page or to feature-specific landing pages when available?
- Should Protection and Performance notices be consolidated into one compact notice?
- Should free users see disabled previews of selected premium controls beneath notices?
- Should a compact notice variant omit feature bullets when the same feature group was already explained elsewhere in the selected block?
- Should campaign identifiers be defined centrally or remain beside each notice usage?

## Recommended First Build

Start with a small beta-ready pilot:

- Build the shared `ProFeatureNotice` component.
- Use the WordPress Notice and Button components.
- Migrate Video Block and Video Gallery notices.
- Consolidate notices only where the current inspector clearly feels repetitive.
- Test free and Pro builds before migrating all image galleries.

This establishes the shared pattern without delaying the 1.4 beta or creating a large late-release inspector rewrite.
