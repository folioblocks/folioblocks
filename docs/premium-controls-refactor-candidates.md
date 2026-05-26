# Premium Controls Refactor Candidates

This note collects repeated premium editor code found across the photo gallery blocks and Image Block. The goal is to revisit these after the Image Click Behavior work is stable and decide which repeated controls should move into shared premium-only helper files.

## Strong Candidates

### List View Thumbnail Enhancements

Used in Grid, Justified, Masonry, Modular, Carousel, and Filmstrip galleries.

Most implementations follow the same pattern:

- Run `applyThumbnails(clientId)` when the block or child is selected.
- Run a fallback pass when images exist but thumbnails have not rendered yet.

This is a good candidate for a shared registration helper.

### Disable Right-Click Toggle

Repeated across galleries and Image Block with nearly identical `ToggleControl` output.

Shared behavior:

- Attribute: `disableRightClick`
- Label: `Disable Right-Click on Page` or similar
- Help text: prevents visitors from right-clicking

This should be easy to extract.

### Lazy Load Toggle

Repeated across galleries and Image Block.

Most galleries use the same `lazyLoad` attribute and simple toggle. Image Block has parent/context behavior, so the helper may need options for inherited gallery values.

### Randomize Toggle

The visible control is mostly identical across galleries.

The actual randomize logic varies by gallery, so the safest first step is extracting only the toggle UI, not the underlying randomization behavior.

### Image Click Styles

Repeated as a `ToolsPanel` or `PanelBody` for icon colors.

Shared behavior:

- Show Download Icon colors when `enableDownload` is active.
- Show Add to Cart Icon colors when `enableWooCommerce` is active.
- Use `CompactTwoColorControl`.

This is a strong cleanup candidate because the panel is nearly the same everywhere.

### Image Hover Settings

Repeated across Grid, Justified, Masonry, Modular, Carousel, and Image Block.

Shared controls include:

- Show Overlay on Hover
- Overlay Content when WooCommerce is active
- Hover Style
- Color Overlay colors

Image Block has legacy alias attributes, so this helper would need config for standalone image behavior.

### Filtering Controls

Grid, Justified, and Masonry share a lot of filtering code.

Repeated areas:

- `getImageBlockFilterCategories`
- Filter logic
- Enable Filter controls
- Filter style `ToolsPanel`
- Filter bar rendering

This is probably the biggest cleanup opportunity, but also the highest risk because it touches filtering behavior and editor/frontend rendering.

## Already Started

### Image Click Action Premium Controls

`src/pb-helpers/imageClickActionPremiumControls.js` is already shared by Carousel, Justified, Masonry, and Modular.

Future expansion could let it support Grid, Image Block, and Filmstrip with options such as:

- `supportsLightbox`
- `syncLegacyImageLightboxAttributes`
- `showWooDefaultLinkAction`
- `isStandaloneImageBlock`

## Smaller Component Candidates

### Lightbox Caption and Info Controls

The caption/product-info Lightbox controls repeat in multiple places. These could become a small shared component used inside Image Click helpers.

### Woo Icon and Action Controls

The following controls repeat across several blocks:

- `Display Add to Cart Icon`
- `Default Add To Cart Icon Behavior`

These could become a shared component with optional support for image-block inheritance behavior.

## Suggested Cleanup Order

1. Image Click Styles
2. Disable Right-Click Toggle
3. Lazy Load Toggle
4. Image Hover Settings
5. Randomize Toggle UI
6. Filtering controls

Filtering should probably be last because it has the largest behavior surface.
