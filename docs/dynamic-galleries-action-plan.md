# Dynamic Galleries Action Plan

## Goal

Add a Dynamic Gallery mode to FolioBlocks that lets Business and Agency users build source-driven galleries without managing individual image inner blocks.

The feature should complement the existing curated editing model, not replace it. Curated galleries remain the best fit when the user wants deliberate per-image layout and design control. Dynamic galleries are for scale: media-library queries, external albums, folders, synced sources, and galleries that update as the source changes.

## Product Model

Use a two-mode gallery model:

```text
Curated Gallery
Dynamic Gallery
```

Curated Gallery:

- Uses inner blocks.
- Stores the selected images directly in post content.
- Supports detailed per-image design controls.
- Works best for portfolios, selected client showcases, homepage galleries, and editorial layouts.
- Remains the current default behavior for existing galleries.

Dynamic Gallery:

- Does not use image inner blocks.
- Stores a source configuration and display rules as gallery attributes.
- Resolves images at render time from WordPress or a connected provider.
- Supports layout, lightbox, hover, watermark, metadata, and pagination controls at the gallery level.
- Works best for event galleries, archive galleries, frequently updated collections, and external libraries.

The main UI distinction should be simple: users choose whether they want to select and arrange specific images, or display images from a source.

## Strategic Positioning

Dynamic Galleries should strengthen FolioBlocks around professional photography workflows, not chase every social feed feature.

Recommended positioning:

```text
Build source-driven professional galleries directly inside WordPress.
```

This keeps FolioBlocks distinct from competitors that require a separate gallery dashboard or shortcode workflow. The source may be dynamic, but the gallery still lives where the page is being built.

## Plan Access

Dynamic Galleries should be Business and Agency only.

Recommended reasons:

- The feature is most useful for professional and high-volume sites.
- External source integrations require support, maintenance, and authentication work.
- Dynamic sources pair naturally with proofing, watermark overlays, and future metadata workflows.
- Keeping this out of lower tiers protects the product value of advanced workflow features.

If needed, the free or Pro UI can show a lightweight locked source selector, but it should not interrupt the normal curated gallery experience.

## MVP Scope

Phase one should prove the architecture with WordPress-native sources before adding external providers.

Recommended MVP:

- Add a gallery mode setting: `curated` or `dynamic`.
- Keep all existing galleries in `curated` mode by default.
- Add a Dynamic Source panel for Business and Agency users.
- Support WordPress Media Library as the first source.
- Support query filters:
  - Media category or tag, if available.
  - Uploaded to current post/page.
  - Author.
  - Date range.
  - Search term.
  - Include/exclude attachment IDs.
  - Maximum image count.
  - Sort by date, title, menu order, random, or ID.
- Render dynamic results through the existing gallery layouts where possible.
- Show a realistic editor preview without converting the result into inner blocks.
- Add frontend pagination or load-more only if the source can exceed a practical render limit.

Out of scope for MVP:

- PhotoShelter, SmugMug, Google Photos, Instagram, Dropbox, or other external providers.
- Per-image block controls in Dynamic mode.
- Syncing external images into the WordPress Media Library.
- AI metadata generation.
- Easy E-Commerce for Dynamic Galleries.
- Editing external provider metadata.
- Background source indexing.

## Source Roadmap

Build the source system so providers can be added over time.

Recommended source order:

1. WordPress Media Library.
2. WordPress taxonomy and folder-plugin compatibility.
3. Dropbox folders.
4. SmugMug albums.
5. PhotoShelter galleries or collections.
6. Instagram account media.
7. Google Photos albums, only after confirming current API limitations are acceptable.

Notes:

- SmugMug and PhotoShelter are especially relevant for professional photographers, but they may already own commerce workflows.
- Instagram is useful for marketing galleries, but it should not define the architecture.
- Google Photos has API constraints that may make it less useful than users expect.
- Dropbox may be a practical bridge source for photographers who already deliver or organize client files there.

## Data Model

Add a small source configuration to gallery block attributes.

Recommended shape:

```json
{
  "galleryMode": "curated",
  "dynamicSource": {
    "provider": "wordpress_media",
    "connectionId": "",
    "collectionId": "",
    "query": {
      "taxonomy": "",
      "terms": [],
      "uploadedTo": "",
      "author": "",
      "search": "",
      "dateAfter": "",
      "dateBefore": "",
      "include": [],
      "exclude": [],
      "orderBy": "date",
      "order": "desc",
      "limit": 60
    },
    "refresh": {
      "strategy": "render",
      "cacheTtl": 300
    }
  }
}
```

Use `galleryMode: "curated"` as the default so existing saved content remains stable.

## Provider Architecture

Create a provider interface that returns normalized gallery items.

Recommended normalized item shape:

```php
array(
    'id'          => 'wp:123',
    'provider'    => 'wordpress_media',
    'source_id'   => 123,
    'title'       => '',
    'caption'     => '',
    'alt'         => '',
    'description' => '',
    'mime_type'   => 'image/jpeg',
    'width'       => 2000,
    'height'      => 1333,
    'thumb_url'   => '',
    'image_url'   => '',
    'full_url'    => '',
    'link_url'    => '',
    'metadata'    => array(),
)
```

Recommended PHP module:

```text
includes/pro/php/dynamic-galleries.php
```

Recommended helpers:

```php
fbks_is_dynamic_gallery_enabled()
fbks_get_dynamic_gallery_sources()
fbks_register_dynamic_gallery_source($provider_id, $source)
fbks_resolve_dynamic_gallery_items($attributes, $context = array())
fbks_normalize_dynamic_gallery_item($provider_id, $item)
fbks_get_dynamic_gallery_cache_key($attributes, $context = array())
```

Each provider should handle its own authentication, query validation, pagination, caching, and error messages, but the block should consume one normalized item format.

## Editor Experience

The editor should make the mode switch obvious and reversible.

Recommended UI:

- Add a segmented control near the top of the block sidebar: `Curated` and `Dynamic`.
- In Curated mode, preserve the existing image/block editing experience.
- In Dynamic mode, hide or disable inner-block image insertion controls.
- Show a source selector, query controls, result count, refresh preview button, and preview status.
- Warn before switching from Curated to Dynamic if the gallery already contains inner image blocks.
- Warn before switching from Dynamic to Curated that the dynamic source will not become editable inner blocks unless a future import action is added.

Recommended editor preview behavior:

- Fetch preview items from a protected REST endpoint.
- Limit preview results for editor performance.
- Show empty, loading, error, and permission states.
- Reuse existing gallery layout components as much as possible.

## Frontend Rendering

Dynamic galleries should render server-side, matching current dynamic block patterns.

Recommended behavior:

- Resolve source items in PHP during render.
- Cache provider results where useful.
- Output the same frontend data shape used by current gallery scripts.
- Preserve existing lightbox, hover, watermark, metadata, and responsive behavior.
- Do not expose provider credentials or private source configuration to the browser.

If a provider fails:

- Logged-in editors should see a helpful unavailable-source message.
- Public visitors should see a quiet empty state or no output, depending on the block setting.
- Errors should be logged only when debugging is enabled or when a provider has explicit diagnostics.

## REST Endpoints

Recommended endpoint:

```text
POST /wp-json/folioblocks/v1/dynamic-gallery/preview
```

Purpose:

- Return normalized preview items for the block editor.
- Validate capabilities and Business/Agency access.
- Avoid exposing provider secrets.

Future endpoints:

```text
GET /wp-json/folioblocks/v1/dynamic-gallery/sources
POST /wp-json/folioblocks/v1/dynamic-gallery/connections
DELETE /wp-json/folioblocks/v1/dynamic-gallery/connections/{id}
```

External provider connections should be added only when the first external provider is implemented.

## Caching

Use a conservative cache for dynamic source results.

Recommended MVP:

- Cache WordPress Media Library query results only if profiling shows a need.
- Cache external provider responses when those providers are added.
- Store external results in transients or a dedicated option keyed by provider, source, query, and user/site context.
- Add a manual refresh action in the editor.
- Respect a default TTL such as 5 minutes.

Avoid long-lived caching in the MVP until the invalidation rules are clear.

## Security And Privacy

Dynamic sources must be careful with private media and credentials.

Requirements:

- Check Business/Agency access before rendering Dynamic mode features.
- Validate and sanitize all source attributes server-side.
- Never print OAuth tokens, API keys, or provider secrets into post content or frontend markup.
- Do not allow arbitrary remote image fetching in the first external-provider version.
- Use provider-approved URLs or cached image records.
- Consider private gallery behavior separately for each provider.

## Testing Requirements

Minimum test coverage:

- Existing curated galleries render unchanged.
- Existing saved posts do not gain Dynamic mode unexpectedly.
- WordPress Media Library queries return expected image sets.
- Empty queries render stable empty states.
- Invalid source attributes are sanitized.
- Dynamic mode is unavailable for non-Business plans.
- Editor preview endpoint rejects unauthorized users.
- Frontend render does not leak private source config.

Manual QA:

- Test each supported gallery layout in Dynamic mode.
- Test editor switching between Curated and Dynamic.
- Test large libraries with result limits.
- Test mobile frontend rendering.
- Test lightbox, hover overlays, metadata, and watermark overlays with dynamic items.

## Rollout Plan

Recommended phases:

1. Add the internal source abstraction and WordPress Media Library provider.
2. Add Dynamic mode UI and editor preview.
3. Add frontend rendering for Dynamic mode.
4. Add limits, empty states, and plan gating.
5. Ship as Business/Agency beta with WordPress Media Library source.
6. Add one external provider after usage proves the model.

The first external provider should be chosen by customer demand, not competitor pressure.
