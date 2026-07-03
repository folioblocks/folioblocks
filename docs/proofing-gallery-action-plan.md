# Proofing Gallery Direction

## Goal

The Proofing Gallery block gives FolioBlocks users a professional proofing environment on their own website. Photographers should be able to publish a private gallery where clients can review images, mark preferences, request edits, and leave comments.

This direction replaces the earlier submission-first plan. The block should feel like a focused FolioBlocks gallery wrapper rather than a separate client portal.

## Current Product Shape

The Proofing Gallery uses a three-level nesting model:

```text
Proofing Gallery
  Grid Gallery, Justified Gallery, or Masonry Gallery
    Image Blocks
```

Only Grid, Justified, and Masonry galleries should be valid inner gallery layouts. The inner gallery should support transforms between those three layouts from the toolbar/list-view transform UI when possible.

The Proofing Gallery itself owns client/proofing settings. The inner gallery contributes only layout and imported gallery settings such as resolution, columns, row height, and gap.

## Access Model

The Proofing Gallery should be locked on the frontend by default with its own gallery password.

Site admins should be able to view the gallery without entering the password. The password belongs in the Proofing Gallery block settings, not in the FolioBlocks Page Settings panel.

FolioBlocks Page Settings should continue to expose page-level media protections such as lazy load, disable right-click, and disable drag-to-save, but page password controls should be removed from that panel.

## Initial Editor Experience

The initial placeholder should visually feel close to the existing Grid, Masonry, and Justified placeholders.

The first setup flow should ask for:

- Client email address.
- Gallery password.
- Gallery style: Grid, Justified, or Masonry.
- Images from upload or the media library.

Client email should be validated as an email-looking value before the setup action creates the nested gallery. The password should be required.

## Suppressed Gallery Features

When Grid, Justified, Masonry, and Image Blocks are inside a Proofing Gallery, most general gallery features should be hidden or suppressed.

Suppress inside Proofing Gallery:

- Gallery Click Settings.
- Gallery Hover Settings.
- Per-image overrides.
- Randomize Image Order.
- General link/download/WooCommerce behavior unless explicitly reintroduced for proofing.
- Lightbox Content controls.

Keep or import inside Proofing Gallery:

- Resolution.
- Columns or row height, depending on layout.
- Gap settings.
- Image border, radius, and drop shadow.
- Optional lightbox enablement.
- Lightbox color mode.

## Proofing Criteria

Each thumbnail can display three proofing criteria:

- Heart: click to like.
- Flag: click to cycle red, orange, and green.
- Comment bubble: click to add a comment.

Editor behavior:

- Heart and flag controls should be interactive previews.
- Heart and flag values should not be persisted across editor reloads.
- Comment bubble should not open a comment workflow in the editor.

Frontend behavior beyond password visibility is intentionally not fully specified yet. Durable values, comment storage, notifications, and submission flows should wait for the dedicated frontend direction.

## Proofing Gallery Settings Panel

Add a main settings panel for:

- Client email address, with option to change.
- Gallery password, with option to view and change.
- Gallery style switcher.
- Imported gallery settings for the selected layout.
- Toggles to disable Heart, Flag, and Comment criteria.
- Enable Lightbox.
- Lightbox color mode.

Do not include Lightbox Content here.

## Styles Panel

The Proofing Gallery styles panel should support:

- Background color.
- Margin.
- Padding.
- Image border.
- Image radius.
- Image drop shadow.

Background, margin, and padding should use standard block supports where possible. Image styles can be implemented as proofing-owned attributes and passed down to the nested gallery context.

## Implementation Notes

First implementation pass:

- Make `proofing-gallery-block` a real parent block.
- Allow exactly one inner gallery child.
- Create the selected gallery child during setup and add selected images as Image Blocks.
- Store proofing client email and password on the Proofing Gallery block.
- Remove page password controls from FolioBlocks Page Settings.
- Render a password gate on the frontend for non-admin visitors.
- Keep durable frontend proofing actions out of scope until the frontend behavior is specified.
