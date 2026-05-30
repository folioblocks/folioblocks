# Image Metadata Sync Action Plan

## Goal

Add explicit controls that let users sync FolioBlocks image metadata back to the WordPress Media Library.

FolioBlocks image blocks currently keep editable metadata as block attributes. This is useful because the same attachment can have different captions or titles in different galleries, but it also means block-level changes do not automatically update the attachment record in the Media Library.

The new feature should keep that flexible per-block behavior by default, while giving users a clear one-way action when they want the block metadata to become the library metadata.

This is a Pro-only feature.

## Current Codebase Findings

Image metadata is edited in `src/pb-image-block/edit.js`.

Current image block metadata attributes:

- `id`: WordPress attachment ID.
- `alt`: block-level alternative text.
- `title`: block-level image title.
- `caption`: block-level image caption.

The shared metadata UI is currently handled by `ImageMetadataControls` in `src/pb-image-block/edit.js`.

The image block can be used in two important contexts:

- As an individual standalone Image Block.
- As an inner `folioblocks/pb-image-block` inside gallery blocks.

Gallery blocks create image blocks with the original WordPress attachment ID, so both individual image blocks and gallery image blocks can sync metadata back to the corresponding Media Library item when permissions allow it.

## Product Model

Use explicit one-way sync actions.

The block attributes remain the source for the current block instance until the user chooses to sync. Clicking sync writes the current block metadata to the WordPress attachment.

Do not automatically sync on every metadata edit. Automatic syncing would be surprising when the same attachment appears in multiple blocks or galleries with different captions, titles, or alt text.

## Pro-Only Rules

Image metadata sync should be available only in FolioBlocks Pro.

Pro behavior:

- Show the per-image Sync to Media Library button when the user has permission to update the attachment.
- Show the gallery-wide Sync Gallery Metadata to Media Library button when at least one gallery image can be updated by the current user.
- Run the sync requests through the WordPress REST API.

Free behavior:

- Do not render sync buttons.
- Do not register free-build sync controls.
- Keep block-level metadata editing unchanged.

Implementation rule:

- Place UI wiring for sync controls in Pro-only editor code, or inject it through filters from `premium.js`, so Freemius can remove the feature from the free build.
- Any shared helper that remains in the free build must not expose a visible free sync UI by itself.

## Per-Image Sync

Add a Sync to Media Library button beneath the metadata section in the Image Block.

This button must appear in both contexts:

- Individual standalone Image Block.
- Image Block selected inside any gallery.

Recommended placement:

- Directly beneath `ImageMetadataControls`.
- In the normal inspector panel for older WordPress versions.
- In the content inspector panel when `shouldUseContentInspector` is true.

Button behavior:

- Sync `alt`, `title`, and `caption` from the selected image block to its Media Library attachment.
- Disable or hide the button when the block has no attachment `id`.
- Show a busy/loading state while the request is running.
- Show a success notice when the sync completes.
- Show an error notice if WordPress rejects the request.

Recommended REST request:

```js
apiFetch( {
	path: `/wp/v2/media/${ id }`,
	method: 'POST',
	data: {
		alt_text: alt || '',
		title: title || '',
		caption: caption || '',
	},
} );
```

## Permissions

Only show sync controls when the current user can update the target media item.

Recommended editor permission check:

```js
const canSyncMedia = useSelect(
	( select ) =>
		id ? select( 'core' ).canUser( 'update', 'media', id ) : false,
	[ id ]
);
```

Render the per-image button only when `canSyncMedia === true`.

Important behavior:

- Treat `undefined` as loading, not as permission granted.
- Hide the button when the user lacks permission.
- Still handle REST errors because permission can change, attachments can be deleted, or third-party code can block updates.

## Gallery-Wide Sync

Add a gallery-wide metadata sync button in each gallery block's Advanced settings.

The goal is to let users quickly sync metadata for every image in a gallery without selecting each inner image block one at a time.

Recommended control:

- Label: Sync Gallery Metadata to Media Library.
- Location: Advanced settings panel for gallery blocks.
- Availability: only when at least one inner image has an attachment `id` and the current user can update at least one of those attachments.

Affected gallery blocks:

- Grid Gallery.
- Carousel Gallery.
- Justified Gallery.
- Masonry Gallery.
- Modular Gallery.
- Filmstrip Gallery.

The gallery-wide sync should iterate over inner `folioblocks/pb-image-block` blocks and sync each image block's local metadata to the matching attachment.

Recommended synced fields per image:

- `alt` to `alt_text`.
- `title` to `title`.
- `caption` to `caption`.

Recommended behavior:

- Skip images with no attachment `id`.
- Skip images the current user cannot update.
- Run requests sequentially or with a small concurrency limit to avoid overwhelming the REST API on large galleries.
- Show a summary notice after completion.
- Include counts for synced, skipped, and failed images.
- Do not fail the entire gallery sync because one image fails.

Suggested summary copy:

- `Synced metadata for 12 images.`
- `Synced 10 images. Skipped 2 images without permission.`
- `Synced 8 images. 2 failed.`

## Gallery Permission Model

The gallery-wide button should not expose media update actions the user cannot perform.

Recommended first pass:

- Collect all inner image attachment IDs.
- Use `select( 'core' ).canUser( 'update', 'media', id )` for each ID.
- Show the gallery-wide button only if at least one attachment returns `true`.
- During sync, skip every image whose permission check is not explicitly `true`.

This lets users with partial media permissions still sync the images they own or can edit, while silently protecting restricted attachments.

## Shared Helper Recommendation

Create a small shared editor helper for metadata sync so individual image sync and gallery-wide sync use the same mapping and request behavior.

Possible file:

```text
src/pb-helpers/syncImageMetadata.js
```

Possible exports:

```js
export const getImageMetadataSyncPayload = ( attributes ) => ( {
	alt_text: attributes.alt || '',
	title: attributes.title || '',
	caption: attributes.caption || '',
} );

export const syncImageMetadataToMedia = ( id, attributes ) =>
	apiFetch( {
		path: `/wp/v2/media/${ id }`,
		method: 'POST',
		data: getImageMetadataSyncPayload( attributes ),
	} );
```

Using a helper keeps the field mapping consistent between the per-image button and gallery-wide sync controls.

## UI Details

Per-image button:

- Use a normal secondary button.
- Keep the label action-oriented: Sync to Media Library.
- Add a short help message or notice only after interaction.
- Avoid showing the button to users who cannot perform the action.

Gallery-wide button:

- Use a secondary button in Advanced settings.
- Consider a short confirmation text or help copy because this updates multiple Media Library records.
- The button should clearly say it updates the Media Library, not only the current gallery.

Recommended warning/help copy:

```text
Writes this gallery's image titles, captions, and alt text back to the WordPress Media Library.
```

## Out Of Scope

Do not include these in the first pass:

- Automatic syncing while typing.
- Two-way syncing from the Media Library back into existing block attributes.
- Bulk rewriting saved post content.
- Syncing EXIF fields.
- Syncing custom WooCommerce or link metadata.
- Syncing image file names, slugs, descriptions, or attachment post content unless a later product decision adds them.

## Implementation Phases

### Phase 1: Per-Image Sync

- Add the shared sync helper.
- Add Pro-only permission checks for the selected attachment.
- Add the Pro-only per-image Sync to Media Library button under `ImageMetadataControls`.
- Add loading, success, and error notices.
- Verify the button appears for standalone image blocks and selected gallery image blocks.
- Verify the button is hidden for users without media update permission.
- Verify the button is absent in the free build.

### Phase 2: Gallery-Wide Sync

- Add a gallery sync helper that reads inner image blocks from the selected gallery.
- Add Pro-only permission checks for each inner image attachment.
- Add a Pro-only gallery-wide sync button in Advanced settings.
- Apply the control to all gallery blocks.
- Add completion summary notices with synced, skipped, and failed counts.
- Verify the gallery-wide button is absent in the free build.

### Phase 3: Polish And Testing

- Test single images, galleries, and mixed galleries with missing attachment IDs.
- Test a user role that can edit posts but cannot edit the relevant media item.
- Test large galleries to confirm the editor remains responsive.
- Confirm REST failures are shown without corrupting block attributes.
- Confirm synced library metadata appears in the Media Library after refresh.
