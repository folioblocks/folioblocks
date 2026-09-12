# FolioBlocks Ratings and Color Flags Action Plan

## Goal

Build ratings and color flags as a shared FolioBlocks media-classification system rather than isolated Proofing Gallery features.

The system should:

- Preserve ratings, numeric color classes, and labels embedded in uploaded images.
- Expose editable working values in the WordPress Media Library.
- Make media ratings and color classes available to compatible FolioBlocks image blocks and galleries.
- Keep client ratings and flags separate for every Proofing Gallery session.
- Support rating- and color-class-based filtering in compatible galleries.
- Preserve existing galleries and the current red, orange, and green proofing workflow.

Target release: FolioBlocks 1.6.0.

## Current Implementation Status

- [x] Safe standard JPEG APP1/XMP packet extraction without an ExifTool dependency.
- [x] Normalization for XMP Rating, XMP Label, Photo Mechanic ColorClass and Tagged, and Photoshop Urgency fallback.
- [x] Versioned attachment storage separating Embedded and Library values.
- [x] Automatic import for new JPEG attachments using the original WordPress upload rather than a generated scaled derivative.
- [x] Authenticated, read-only attachment REST exposure.
- [x] Standalone synthetic parser fixture and regression test.
- [x] Global Settings controls and Capture One, Custom, Getty, Lightroom & Bridge, and Photo Mechanic palette presets.
- [x] Separate Media Library visibility choices for EXIF data, ratings, and color classes.
- [x] Resumable, batched scan action for existing Media Library JPEG images.
- [x] Media Library display and editing for Media Ratings, palette-derived Media Color Classes, and camera EXIF details alongside embedded originals.
- [x] Media Library section and complete reset-to-embedded interface.
- [ ] Image Block and still-gallery integration.
- [ ] Proofing Gallery client ratings and advanced flags.

## Confirmed Metadata Example

The original test JPEG `20260907-141658_MC_1829-1.jpg` contains:

| Field | Value |
| --- | --- |
| `photomechanic:ColorClass` | `2` |
| `photoshop:Urgency` | `2` |
| `xmp:Label` | `Winner Alt` |
| `xmp:Rating` | `4` |
| `photomechanic:Tagged` | `False` |

This confirms that the yellow Photo Mechanic classification is stored as numeric class `2` for the user's Getty-style palette. The color itself is not universal: applications and users can assign different colors to the same numeric slot. FolioBlocks must therefore preserve the number and interpret it through a configurable palette.

## Terminology and Ownership

Use consistent labels throughout the product:

- **Embedded Rating**: the rating read from the uploaded file. It is retained unchanged for provenance.
- **Media Rating**: the current editable rating stored for the WordPress attachment.
- **Client Rating**: a rating made in one Proofing Gallery session.
- **Embedded Color Class**: the numeric color-class value read from the file.
- **Media Color Class**: the current editable color-class value stored for the attachment.
- **Embedded Label**: a source label such as XMP `Label`; retained as source metadata.
- **Client Flag**: a flag selected in one Proofing Gallery session.

Media ratings and color classes belong to attachments. Client ratings and flags belong to proofing sessions. A client action must never silently overwrite attachment metadata.

## Product Model

### Plugin-wide media classification

Ratings and color classes should be available to all compatible FolioBlocks image experiences, including:

- Media Library attachment details.
- Image Block metadata controls.
- Still-image galleries.
- Gallery filters and sorting.
- Image overlays and lightboxes where explicitly enabled.
- Proofing Gallery as both source context and client feedback.

### Proofing Gallery annotations

Add Stars as an optional proofing control alongside Heart, Flags, and Comments.

- A client rating is `null` until the client actively chooses a value.
- Clients can select one through five stars and clear the rating.
- A client flag is `null`/empty until selected and can be cleared.
- Imported or Media Library values may be shown to administrators for comparison, but must not be recorded as client choices.
- The same attachment can have different client ratings and flags in different sessions.

### Simple and Advanced flags

Retain two flag modes:

1. **Simple Flags**: the current Red, Orange, and Green proofing system.
2. **Advanced Flags**: up to eight fixed numeric slots with configurable colors, labels, and enabled states.

Simple must remain the default for existing and newly migrated Proofing Galleries unless the gallery is explicitly switched to Advanced.

## Global Settings Information Architecture

Add a collapsed top-level **Media Metadata** card between Page/Post Defaults and Social Sharing.

Card description:

> Import, display, and manage photographic metadata used throughout FolioBlocks.

### Metadata Import

- **Import EXIF Data**
- **Import Star Ratings**
- **Import Color Classes**
- **Scan Existing Media** as an explicit manual action, not an autosaved setting

Disabling an import option affects future imports only. It must not delete stored metadata.

### Media Library

- **Show FolioBlocks Metadata**
- **Allow Metadata Editing**
- **Who Can Edit Metadata** using WordPress capabilities/roles
- **Reset to Embedded Value** actions for individual editable fields

Prefer a custom capability such as `edit_folioblocks_media_metadata` over maintaining a per-user deny list. Administrators receive it by default; role assignment can be expanded later.

### Star Ratings

- **Enable Star Ratings**
- **Unrated Label**, defaulting to `Unrated`

The scale is fixed: unrated plus one through five stars.

### Color Classes

- **Enable Color Classes**
- **Palette Preset**: Capture One, Custom, Getty, Lightroom & Bridge, or Photo Mechanic

The palette editor contains eight fixed rows:

| Value | Enabled | Color | Label |
| ---: | :---: | :---: | --- |
| 1 | Yes | Configurable | Configurable |
| 2 | Yes | Configurable | Configurable |
| 3 | Yes | Configurable | Configurable |
| 4 | Yes | Configurable | Configurable |
| 5 | Yes | Configurable | Configurable |
| 6 | Yes | Configurable | Configurable |
| 7 | Yes | Configurable | Configurable |
| 8 | Yes | Configurable | Configurable |

Numeric values must remain fixed. Users change the color and label assigned to a value rather than ambiguously reordering stored values.

Selecting a preset copies its values into the editable FolioBlocks configuration. Subsequent edits do not alter the built-in preset definition. Verify current vendor defaults against documentation and test files before hard-coding Photo Mechanic or Capture One mappings.

The initial Getty preset is:

1. Red
2. Yellow
3. Green
4. Blue
5. Orange
6. Pink
7. Black
8. White

### Proofing Gallery defaults

Keep client-specific controls in the existing **Proofing Gallery** Global Settings card under **New Gallery Defaults**:

- Enable Hearts
- Enable Star Ratings
- Enable Color Flags
- Enable Comments
- Client Flag Palette: Simple Flags or Media Metadata Palette

These values are starting defaults for new Proofing Gallery blocks only. They must not modify published galleries.

## Data Model

### Attachment metadata

Use versioned attachment metadata so the schema can evolve. The normalized shape is equivalent to:

```js
{
	version: 2,
	embedded: {
		rating: 4,
		colorClass: 2,
		label: 'Winner Alt',
		tagged: false,
		sourceFields: {
			xmpRating: 4,
			xmpLabel: 'Winner Alt',
			photoMechanicColorClass: 2,
			photoshopUrgency: 2,
		},
		exif: {
			camera: 'Canon EOS R5',
			focalLength: '119',
			shutterSpeed: '0.005',
			aperture: '5.6',
			iso: '100',
		},
	},
	library: {
		rating: 4,
		colorClass: 2,
		exif: {
			camera: 'Canon EOS R5',
			focalLength: '119',
			shutterSpeed: '0.005',
			aperture: '5.6',
			iso: '100',
		},
	},
	importedAt: '',
}
```

Rules:

- Embedded values are immutable after import unless the original file is explicitly rescanned.
- Library values initially inherit normalized embedded values.
- Editing Library values never rewrites the original image or embedded XMP/EXIF/IPTC data.
- Supported EXIF fields are Camera, Focal Length, Shutter Speed, Aperture, and ISO.
- Rating accepts `null` or integers `1` through `5`.
- Color class accepts `null` or integers `1` through `8`.
- Retain relevant raw source fields for diagnostics and future interoperability.

### Proofing session image state

Introduce a versioned client-facing model while accepting legacy sessions:

```js
{
	imageId: '',
	attachmentId: 123,
	hearted: false,
	clientRating: null,
	clientFlagId: null,
	comment: '',
	mediaSnapshot: {
		rating: 4,
		colorClass: 2,
		label: 'Winner Alt',
	},
}
```

The media snapshot records the attachment values relevant when the proofing session was created or first saved. This prevents later Media Library edits from changing the historical comparison shown in a submitted session.

### Legacy session compatibility

Current sessions store simple flags as `flag: 'red'`, `flag: 'orange'`, or `flag: 'green'`.

- Continue reading these values indefinitely.
- Normalize them internally to stable IDs such as `simple-red`, `simple-orange`, and `simple-green`.
- Do not bulk-rewrite existing sessions during plugin activation.
- When an old session is saved again, write the new versioned fields while retaining enough compatibility for existing reports during the transition.
- Existing galleries continue with Stars disabled and Simple Flags enabled according to their current attributes.

## Metadata Extraction

WordPress core metadata is insufficient for application-specific fields such as `photomechanic:ColorClass`. Build a guarded internal metadata reader that operates on the original uploaded file.

Requirements:

- Read metadata before relying on WordPress-generated scaled derivatives, which may strip XMP fields.
- Support JPEG first; add other formats only after fixtures and server support are established.
- Parse XMP without requiring ExifTool on the server.
- Use safe XML parsing with network access and external entities disabled, or a narrowly scoped parser for required attributes.
- Normalize XMP Rating, XMP Label, Photo Mechanic ColorClass, Photoshop Urgency, and supported EXIF fields.
- Define precedence rules when multiple source fields disagree.
- Preserve the source values used to make each normalized decision.
- Fail safely: an unsupported or malformed file remains usable and simply has no imported classification.

Proposed precedence for color-class number:

1. Photo Mechanic `ColorClass` when present and valid.
2. A supported application-specific numeric class.
3. Photoshop `Urgency` as a documented compatibility fallback.
4. No color class.

XMP Label is retained as a label and must not be guessed into a numeric class unless an explicit, tested mapping exists.

## Media Library Extension

Extend attachment details with a FolioBlocks metadata panel containing:

- Embedded Rating and editable Media Rating.
- Embedded Color Class and editable Media Color Class.
- Embedded Label retained as source provenance; the editable Media Color Class label and color come from the selected Global Settings palette.
- Supported EXIF fields.
- Metadata source/import status.
- Reset-to-embedded actions.

Editing is permission-gated and updates WordPress attachment metadata only. Provide compact reset-to-embedded actions and a guarded bulk scan for existing media.

Bulk scanning must be resumable/batched, report failures, and avoid long single requests.

## Image Block Integration

- Make normalized Media Rating and Media Color Class available to Image Block.
- Continue treating block content as stable by default.
- Provide **Refresh Metadata from Media Library** for updating a block snapshot.
- When a gallery explicitly enables live metadata filtering, resolve current attachment values at render time and explain that behavior in the editor.
- Do not expose editorial labels or classifications in public markup unless a block feature requires them.

## Proofing Gallery UI

### Stars

- Add an **Enable Star Ratings** block setting.
- Add a star control to each proofing image.
- Open a compact accessible popover containing one through five stars and Clear.
- Show the selected client rating on the control.
- Keep `null` distinct from a zero-like display value.
- Support keyboard navigation and screen-reader labels.

### Flags

- Keep the existing three swatches unchanged in Simple mode.
- In Advanced mode, build the popover from the gallery's palette snapshot.
- Show only enabled slots.
- Use configured colors and labels for visible UI and accessible names.
- Store the stable flag ID/value, not a CSS color string.
- Provide a Clear action.

### Palette snapshots

Global palette changes must not silently alter published Proofing Galleries. When a new gallery adopts the Media Metadata palette, copy the relevant palette configuration into block attributes. Proofing sessions should retain the palette/version needed to render historical selections consistently.

## Gallery Filtering and Sorting

Make Media Rating and Media Color Class available beyond Proofing Gallery.

Initial compatible gallery control:

- **Filter Source**: Keywords, Star Ratings, or Color Classes.

Use structured internal tokens rather than mixing classifications with keyword strings:

- `keyword:sport`
- `rating:4`
- `color:2`

Recommended rating filters:

- Rated
- 3+ Stars
- 4+ Stars
- 5 Stars

Recommended color filters:

- Generate controls from the enabled palette slots actually present in the gallery.
- Display the configured swatch and label.

Potential follow-up sorting:

- Rating high to low.
- Rating low to high.
- Color-class order.
- Unrated/unclassified last.

All filters must trigger existing masonry and justified relayout hooks. Begin with one filter source at a time; combined keyword/rating/color filtering can follow after its AND/OR behavior is explicitly designed.

Proofing filters must operate on client values. Ordinary gallery filters must operate on Media Library/block values. Do not mix those sources.

## Admin Review and Reports

Update Proofing Sessions to show media and client values separately:

- Media Rating
- Client Rating
- Media Color Class and label
- Client Flag and label

Add rated and flagged counts without treating inherited media values as client actions. Include both value types in PDF/export output where that output already exists.

A later explicit admin action may promote a client rating or flag to the Media Library value. This must never happen automatically.

## Permissions, Privacy, and Safety

- Gate metadata editing with a dedicated capability.
- Validate attachment permissions as well as the FolioBlocks capability.
- Sanitize labels and colors.
- Validate rating and color-class numeric ranges server-side.
- Protect AJAX/REST writes with existing authentication and nonce patterns.
- Avoid placing source metadata in public HTML unless the active block feature needs it.
- Never rewrite image files in the MVP.
- Do not auto-select a palette based only on the file's software field. The confirmed test file reports Adobe Photoshop while retaining Photo Mechanic metadata.

## Implementation Phases

### Phase 1: Metadata foundation

- Finalize versioned attachment schema and meta keys.
- Implement safe JPEG XMP extraction.
- Normalize rating, color class, label, and source values.
- Add upload-time import hooks.
- Add fixtures from Photo Mechanic, Capture One, and Adobe workflows.
- Add parser and normalization tests.

### Phase 2: Global Settings and palettes

- Add the Media Metadata card.
- Add autosaved import, visibility, editing, and capability settings.
- Verify and add Capture One, Custom, Getty, Lightroom & Bridge, and Photo Mechanic presets.
- Implement the eight-row palette editor.
- Add new Proofing Gallery defaults.

### Phase 3: Media Library and Image Block

- Add attachment metadata display and editing.
- Add reset and rescan actions.
- Add batched scanning for existing media.
- Expose normalized values to Image Block.
- Add manual block metadata refresh.

### Phase 4: Proofing ratings and advanced flags

- Add block attributes and context for Stars and palette choice.
- Add editor preview controls without conflating preview state with saved client data.
- Add front-end star and dynamic flag popovers.
- Version session payloads and support legacy `flag` values.
- Update REST validation, persistence, filtering, admin review, and exports.

### Phase 5: Plugin-wide gallery use

- Add rating and color-class filter sources to compatible galleries.
- Add front-end filter controls and relayout integration.
- Add optional metadata sorting.
- Validate live versus snapshot behavior.

### Phase 6: Compatibility and release QA

- Confirm existing proofing galleries and sessions are unchanged.
- Test Simple and Advanced modes on desktop and mobile.
- Test keyboard navigation and screen-reader labels.
- Test multiple proofing sessions against the same attachments.
- Test palette changes against published galleries and submitted sessions.
- Test missing, malformed, conflicting, and stripped metadata.
- Regenerate translations and build artifacts.
- Run package and release checks.

## Likely Code Areas

- `includes/pro/admin/global-settings.php`
- `includes/pro/admin/proofing-sessions.php`
- `includes/pro/php/exif-metadata.php`
- `includes/pro/php/proofing-gallery.php`
- New shared media-metadata PHP module
- Media Library admin scripts and styles
- `src/pb-image-block/block.json`
- `src/pb-image-block/edit.js`
- `src/pb-image-block/render.php`
- `src/proofing-gallery-block/block.json`
- `src/proofing-gallery-block/edit.js`
- `src/proofing-gallery-block/render.php`
- `src/proofing-gallery-block/view.js`
- `src/proofing-gallery-block/style.scss`
- Compatible still-gallery block metadata, context, editor, and view files

## Acceptance Criteria

- The confirmed sample imports Embedded Rating `4`, Embedded Color Class `2`, and Embedded Label `Winner Alt`.
- A site owner can map color-class value `2` to Yellow without altering the stored number.
- Embedded values remain recoverable after Media Library edits.
- Client ratings and flags are stored independently per proofing session.
- An unrated/unflagged client remains distinguishable from inherited media metadata.
- Existing red/orange/green sessions render correctly without migration work by the site owner.
- Global settings affect future imports and new block defaults as documented, not existing published galleries.
- Advanced palettes support up to eight fixed values with editable colors and labels.
- Ordinary galleries can filter by Media Rating or Media Color Class without reading client proofing values.
- Proofing filters use client ratings and flags and correctly reflow masonry/justified layouts.
- Media metadata editing is capability-gated and does not rewrite original files.

## Decisions to Finalize Before Implementation

- Exact attachment meta keys and schema versioning strategy.
- Verified Capture One, Lightroom & Bridge, and Photo Mechanic palettes.
- Whether Proofing Gallery should offer a per-gallery override of all eight palette rows or only choose a palette/default.
- Whether media ratings are visible to clients or admin-only during proofing.
- Exact filter availability in each still-gallery block for the first release.
- Whether metadata sorting belongs in the 1.6.0 MVP or a follow-up release.

## Out of Scope for the Initial Release

- Writing ratings, flags, XMP, IPTC, or EXIF back into image files.
- Automatically applying client feedback to Media Library metadata.
- Inferring numeric color classes from arbitrary label strings.
- Automatically choosing a palette from the software-name metadata field.
- Unlimited palette sizes or non-numeric color-class identifiers.
- Combined multi-dimensional gallery filters until their behavior is designed.
- Per-client annotation history beyond the existing proofing-session model.
