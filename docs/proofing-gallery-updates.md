# Proofing Gallery Updates

## Goal

Add a Proofing Gallery star rating feature after the 1.5.1 release.

The feature should let clients rate images from 1 to 5 stars during online proofing, while also picking up existing image ratings from photographer workflows when possible. This is especially useful when clients, creative directors, or teams make an initial pass on set in Lightroom, Bridge, Camera Raw, or Photo Mechanic, then continue the proofing process later in FolioBlocks.

This should be treated as a feature release, not a 1.5.1 patch. Recommended target: 1.6.0.

## Product Model

Add Stars as a fourth optional proofing control alongside Heart, Flags, and Comments.

Recommended behavior:

- The block inspector gets an `Enable Stars` toggle.
- When enabled, each proofing image shows a star control in the overlay controls.
- Clicking the star control opens a compact popover or modal for selecting 1 through 5 stars.
- A selected rating is visible on the image control state.
- A rating can be cleared back to unrated.
- Ratings are saved with proofing sessions and included in submitted review data.
- Ratings can be used by Proofing Gallery filters.

The interaction should feel fast and client-friendly. A popover is probably better than a full modal unless mobile testing shows the popover is cramped.

## Metadata Import

The common cross-app rating field is XMP `xmp:Rating`. IPTC Photo Metadata includes Image Rating and maps it to XMP `xmp:Rating`.

Supported source workflows should include:

- Adobe Lightroom
- Adobe Bridge
- Adobe Camera Raw
- Photo Mechanic

Recommended import behavior:

- Read a default rating from the WordPress attachment metadata when available.
- Accept only numeric values from 1 to 5 as visible star ratings.
- Treat `0`, empty, missing, or invalid values as unrated.
- Treat `-1` or reject-style ratings as unrated for the first version.
- Store imported defaults separately enough that client changes can override them.

Potential metadata keys to investigate:

- XMP `Rating`
- IPTC Image Rating if exposed by WordPress or a metadata helper.
- EXIF/IFD `Rating` only as a fallback if present and trustworthy.

Important risk: WordPress core may not reliably preserve or expose XMP ratings for all uploaded image types. The feature should degrade gracefully: if no rating can be read, the image starts unrated.

## Data Model

Add `rating` to each proofing image state.

Recommended shape:

```js
{
	attachmentId: 123,
	thumbnail: '',
	title: '',
	hearted: false,
	flag: '',
	comment: '',
	rating: 0
}
```

Recommended rules:

- `0` means unrated.
- `1` through `5` mean selected star rating.
- Save the current client-facing rating in the proofing session payload.
- Preserve backwards compatibility with sessions that do not have a `rating` key.

## Front-End UI

Add a star thumbnail control:

- Use the existing proofing overlay slot system.
- Add `enableStar` or `enableRating` as the block attribute.
- Add active state when rating is greater than 0.
- Show the selected number visually, either as filled stars or a small `3/5` style badge.
- Provide keyboard and screen-reader support.

Recommended control labels:

- `Rate image`
- `Set star rating`
- `Clear rating`
- `1 star`, `2 stars`, `3 stars`, `4 stars`, `5 stars`

Recommended first version:

- Button opens a small rating popover.
- Popover contains five star buttons and a clear button.
- Click outside or choosing a value closes the popover.
- Mobile layout keeps the popover within the image bounds or uses a fixed bottom sheet if needed.

## Filtering

Add rating filters when Stars are enabled.

Recommended filter model:

- `Rated`
- `3+ Stars`
- `4+ Stars`
- `5 Stars`

This avoids cluttering the filter bar with every exact rating. Exact filters can be added later if users ask for them.

The masonry and justified layout reflow hooks must run after rating filters change, matching heart, flag, and comment filtering.

## Admin Review

Update Proofing Sessions admin screens to show ratings.

Recommended display:

- Add rating to each image row/card in the review detail view.
- Include ratings in any selection summaries where heart, flag, and comment data already appear.
- Keep unrated images visually quiet.

If export functionality is added later, ratings should be included in exports.

## Editor Controls

Update Proofing Gallery inspector controls:

- Add `Enable Stars`.
- Include Stars in the proofing options group with Heart, Flags, and Comments.
- Update editor preview state so star filtering and star controls behave like the front end.
- Hide duplicate nested gallery controls as needed, following the existing Proofing Gallery ownership model.

## PHP Work

Recommended areas to update:

- `src/proofing-gallery-block/block.json`
- `src/proofing-gallery-block/edit.js`
- `src/proofing-gallery-block/view.js`
- `src/proofing-gallery-block/render.php`
- `src/proofing-gallery-block/style.scss`
- `src/pb-image-block/render.php`
- `includes/pro/php/proofing-gallery.php`
- `includes/pro/admin/proofing-sessions.php`

Metadata extraction needs investigation before implementation. If WordPress core metadata is not enough, consider a small internal parser or a guarded integration path. Avoid requiring server-level tools such as ExifTool for the MVP.

## Compatibility

Backwards compatibility requirements:

- Existing proofing galleries continue to work with Stars disabled by default or enabled only when the site owner opts in.
- Existing saved sessions without ratings load normally.
- Saved/submitted payloads with ratings remain compatible with older heart, flag, and comment behavior.
- Filtering must still trigger masonry and justified relayouts.
- The feature must be unavailable in free builds if Proofing Gallery remains Business/Agency only.

## Open Questions

- Should the control be called `Stars`, `Rating`, or `Star Rating` in the UI?
- Should imported metadata ratings be visible immediately, or only after enabling Stars?
- Should the default filter options be threshold-based, exact, or both?
- Should rejected XMP rating `-1` map to a future Reject filter, or remain ignored for MVP?
- Can WordPress reliably expose XMP ratings from common JPEG exports, or do we need custom extraction?

## MVP Scope

Phase one should include:

- Enable Stars toggle.
- 1 to 5 rating UI on each proofing image.
- Clear rating action.
- Save/load ratings in proofing sessions.
- Import default ratings from available image metadata.
- Rating filters.
- Editor and front-end parity.
- Admin review display.
- Translation strings.
- Build output.

Out of scope for MVP:

- Exporting ratings back into image metadata.
- Writing XMP/IPTC data.
- Reject rating support.
- Per-client rating histories.
- Multiple independent rating categories.
- Server dependency on ExifTool.
