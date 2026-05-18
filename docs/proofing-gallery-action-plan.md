# Proofing Gallery Action Plan

## Goal

Create a FolioBlocks Proofing Gallery block that lets photographers publish a private gallery where clients can review images, mark selections, leave notes, and submit the final proofing set.

The block should feel like a natural FolioBlocks gallery, not a separate client portal. It should reuse the existing image/gallery editing model where possible, while adding the proofing-specific frontend workflow clients need.

## Product Model

The Proofing Gallery is a Pro workflow block for client selection and approval.

Primary user stories:

- A photographer adds images to a proofing gallery in the block editor.
- The photographer configures proofing rules such as selection limit, notes, download availability, and submission behavior.
- A client opens the page, reviews images, marks favorites or selects approved images, optionally leaves notes, and submits the selection.
- The photographer receives the submitted selection in a usable format.

Recommended first version:

- One proofing gallery per block instance.
- Public page access controlled by WordPress page visibility, password protection, or whatever access method the site owner already uses.
- No client account system in the MVP.
- No standalone proofing dashboard in the MVP.
- Store proofing submissions in WordPress so the photographer can review/export them later.

## Current Codebase Findings

Existing pieces to build on:

- Gallery blocks already use `pb-image-block` as the inner image block.
- Gallery blocks already pass shared settings through block context.
- `pb-image-block` already owns per-image data such as ID, URL, title, caption, alt text, dimensions, filter categories, WooCommerce product mapping, and download behavior.
- Dynamic `render.php` files already output frontend data attributes and markup for gallery interactions.
- Premium controls are injected through each block's `premium.js` file.
- Existing Pro behavior is guarded in PHP with `fbks_fs()->can_use_premium_code__premium_only()`.
- Image download, lightbox, hover overlays, filtering, and WooCommerce integrations already exist and should not be rewritten for proofing.

This means Proofing Gallery should start as a new block that composes familiar gallery/image behavior, rather than trying to retrofit proofing controls into every existing gallery block.

## Recommended Block

Add a new block:

```text
src/proofing-gallery-block
```

Suggested block name:

```text
folioblocks/proofing-gallery-block
```

Suggested editor title:

```text
Proofing Gallery
```

Allowed inner blocks:

```json
["folioblocks/pb-image-block"]
```

The block should reuse the image-picker and inner block insertion pattern from the existing gallery blocks, especially `grid-gallery-block`, `masonry-gallery-block`, and `justified-gallery-block`.

## MVP Scope

The first version should focus on image selection and submission.

Include:

- Select/deselect images on the frontend.
- Optional per-image client note.
- Optional gallery-level client note.
- Selection count display.
- Optional minimum and maximum selection count.
- Submit button with client name and email fields.
- Stored submission record in WordPress.
- Admin email notification after submission.
- Simple admin list or export path for submitted selections.
- Lightbox support for reviewing larger images.
- Existing image download controls where compatible.
- Existing right-click protection where compatible.
- Existing lazy loading where compatible.

Out of scope for MVP:

- Client accounts.
- Magic links.
- Multi-round proofing.
- Payment or WooCommerce checkout.
- Watermark generation.
- Image delivery ZIP generation.
- Approval contracts or signatures.
- Comment threads.
- Real-time collaboration.
- Revisions after final submission.
- A full proofing dashboard with statuses and assignments.

## Proofing Modes

Start with one primary mode:

- Selection mode: clients choose the images they approve or want edited/delivered.

Keep room for later modes:

- Favorite mode: clients mark favorites without a required final submit.
- Reject mode: clients explicitly reject images.
- Rating mode: clients assign star ratings.
- Approval mode: clients approve the whole gallery.

For MVP, avoid supporting multiple simultaneous proofing semantics. Selection mode is enough to ship useful value and keeps rendering, storage, and email output simple.

## Editor Controls

Recommended inspector panels:

- Gallery Layout
- Proofing Settings
- Client Submission
- Image Click Settings
- Image Hover Settings
- Advanced / Protection

Proofing Settings:

- Enable proofing selection.
- Selection label, default "Select".
- Selected label, default "Selected".
- Enable per-image notes.
- Enable gallery-level note.
- Minimum required selections.
- Maximum allowed selections.
- Show selection counter.
- Lock submitted state after successful submission.

Client Submission:

- Require client name.
- Require client email.
- Optional project/session label.
- Submit button text.
- Success message.
- Notification email address.
- Store submissions in WordPress.
- Include selected image IDs, titles, filenames, and URLs in notification.

Image Click Settings:

- Use the Image Click Action model once that action plan is implemented.
- For MVP, support lightbox review without changing selection state accidentally.
- Selection should use a dedicated checkbox/button overlay, not the whole image click, unless the gallery explicitly opts into whole-image selection.

Image Hover Settings:

- Reuse existing hover title and overlay behavior where possible.
- Do not make hover overlay the only way to select an image, because touch devices need visible controls.

## Frontend Behavior

Each image should expose a visible selection control.

Recommended behavior:

- A selection button appears over each image.
- The button has a selected and unselected state.
- Keyboard users can tab to each selection button.
- Screen readers get clear image titles and selected state.
- The selection counter updates immediately.
- The submit button is disabled until minimum selection requirements are met.
- If the maximum selection count is reached, unselected images remain visible but cannot be selected until another image is deselected.
- Per-image notes appear only when enabled.
- The submission form appears below the gallery or in a compact sticky footer depending on layout.

Avoid using only color to communicate selected state. Include an icon, text, or aria state.

## Data Model

Recommended block attributes:

```json
{
  "proofingEnabled": true,
  "proofingSelectionMode": "selection",
  "proofingAllowImageNotes": false,
  "proofingAllowGalleryNote": true,
  "proofingMinSelections": 0,
  "proofingMaxSelections": 0,
  "proofingShowCounter": true,
  "proofingRequireClientName": true,
  "proofingRequireClientEmail": true,
  "proofingProjectLabel": "",
  "proofingSubmitLabel": "Submit selections",
  "proofingSuccessMessage": "Thank you. Your selections have been submitted.",
  "proofingNotificationEmail": "",
  "proofingLockAfterSubmit": true
}
```

Per-image submission data should not be saved back into the block. Client selections belong in submission records, not post content.

Submission record shape:

```json
{
  "galleryBlockId": "string",
  "postId": 123,
  "submittedAt": "ISO-8601 datetime",
  "clientName": "string",
  "clientEmail": "string",
  "projectLabel": "string",
  "galleryNote": "string",
  "selectedImages": [
    {
      "id": 123,
      "title": "Image title",
      "filename": "image.jpg",
      "url": "https://example.com/image.jpg",
      "note": "Client note"
    }
  ]
}
```

Use a generated stable gallery/block instance ID so multiple Proofing Gallery blocks on the same post can store submissions separately.

## Storage

Recommended MVP storage:

- Register a private custom post type such as `fbks_proof_submission`.
- Store submission payload as post meta.
- Store a short human-readable title such as `Proof submission - Client Name - 2026-05-17`.
- Keep submissions out of public queries.

Alternative:

- A custom database table can be considered later if submissions become high-volume or need advanced filtering.

Avoid storing proofing submissions as comments. The data is structured workflow data, not discussion content.

## REST/API Handling

Add a focused endpoint for frontend submissions.

Recommended route:

```text
folioblocks/v1/proofing-gallery/submit
```

Responsibilities:

- Validate nonce or submission token.
- Validate post ID and gallery block ID.
- Validate required client fields.
- Validate selected images against the block's image IDs.
- Enforce min/max selection limits.
- Sanitize gallery note and per-image notes.
- Store the submission.
- Send notification email if configured.
- Return a success response with the configured success message.

Do not trust image titles, URLs, or IDs sent from the browser without validating them against the rendered gallery data.

## PHP Architecture

Recommended files:

```text
includes/proofing/submissions.php
includes/proofing/rest-api.php
includes/proofing/notifications.php
includes/proofing/admin-page.php
```

Responsibilities:

- `submissions.php`: custom post type registration, meta schema, storage helpers.
- `rest-api.php`: submit endpoint, validation, sanitization, response handling.
- `notifications.php`: email formatting and delivery.
- `admin-page.php`: list/detail/export UI for submissions.

Recommended helper functions:

```php
fbks_register_proofing_submission_post_type()
fbks_create_proofing_submission($payload)
fbks_get_proofing_submission($submission_id)
fbks_validate_proofing_payload($payload, $post_id, $gallery_block_id)
fbks_send_proofing_submission_notification($submission_id)
```

## Admin UI

MVP admin can be simple.

Add a submenu:

```text
FolioBlocks > Proofing Submissions
```

The list should show:

- Submitted date.
- Client name.
- Client email.
- Project/session label.
- Source post.
- Number of selected images.

The detail view should show:

- Client details.
- Gallery note.
- Selected images with thumbnail, title, media ID, filename, URL, and note.
- Copy/export action.

Export support:

- CSV export for a single submission.
- Optional JSON export for exact structured data.

## Premium Scope

Proofing Gallery should be a Pro feature.

Editor controls, frontend behavior, REST submission handling, admin submission views, and notification emails should only be available when premium code can run.

Use the existing premium gating pattern:

```php
fbks_fs()->can_use_premium_code__premium_only()
```

If the free plugin sees the block in existing content, it should fail gracefully:

- Render a non-interactive gallery if possible.
- Do not accept submissions.
- Do not expose proofing admin screens.

## Compatibility Rules

Proofing selection is separate from image click behavior.

Rules:

- Selecting an image should not accidentally open the lightbox.
- Opening the lightbox should not accidentally select an image.
- Downloads can remain available only when enabled and compatible with proofing settings.
- WooCommerce integration should be disabled for Proofing Gallery MVP unless a later phase defines a clear proofing-commerce flow.
- Filtering can be supported, but selected images must remain selected when filters change.
- Lazy loading must not break selection state.
- Right-click protection should not block selection controls.

## Accessibility Requirements

The block should support:

- Keyboard selection and deselection.
- Visible focus states.
- `aria-pressed` or equivalent selected state on image selection buttons.
- Clear labels for image selection controls.
- Form error messages tied to fields.
- A live region for selection count changes.
- Non-color-only selected states.

## Implementation Phases

### Phase 1: Block Scaffold

- Add `src/proofing-gallery-block`.
- Register the block in the existing block registration flow.
- Reuse gallery image selection/upload behavior.
- Render a basic gallery with `pb-image-block` inner blocks.
- Add baseline styles and editor preview.

### Phase 2: Proofing Controls

- Add block attributes for proofing behavior.
- Add Proofing Settings and Client Submission panels.
- Add validation hints for min/max selection settings.
- Add premium gating in editor controls.

### Phase 3: Frontend Selection

- Add selection controls to each rendered image.
- Add frontend state handling in `view.js`.
- Add counter, min/max enforcement, notes, and submit form.
- Ensure lightbox and selection controls do not conflict.

### Phase 4: Submission Storage

- Add `fbks_proof_submission` custom post type.
- Add REST submit endpoint.
- Validate submitted image IDs against rendered gallery images.
- Store sanitized submission payload.

### Phase 5: Notifications and Admin Review

- Send notification email after successful submission.
- Add Proofing Submissions admin submenu.
- Add submission list and detail views.
- Add CSV export for selected images.

### Phase 6: Polish and Compatibility

- Verify mobile/touch behavior.
- Verify keyboard and screen reader behavior.
- Verify min/max edge cases.
- Verify private/password-protected page behavior.
- Verify existing lightbox, download, lazy load, and right-click protection compatibility.

## Testing Checklist

- Insert a Proofing Gallery block and add images.
- Configure a minimum selection count and confirm submit stays disabled until met.
- Configure a maximum selection count and confirm the limit is enforced.
- Select images, deselect images, and confirm the counter stays accurate.
- Add per-image notes and gallery note.
- Submit with missing required client fields and confirm validation messages appear.
- Submit valid selections and confirm a submission record is created.
- Confirm notification email includes client details and selected images.
- Confirm CSV export includes image ID, title, filename, URL, and note.
- Confirm selection controls work by keyboard.
- Confirm lightbox review does not toggle selection unintentionally.
- Confirm filtering does not clear selections.
- Confirm free/non-premium installs do not expose active proofing behavior.

## Open Questions

- Should the MVP use a sticky submission bar or a standard form below the gallery?
- Should selection state persist in local storage before submission, so clients can leave and come back on the same device?
- Should photographers be able to reopen a submitted proofing set for edits?
- Should proofing submission emails include thumbnails, or just text links and metadata?
- Should the block support password/token access later, or rely on WordPress page visibility for the first version?
- Should selected image order match gallery order or client selection order in exports?

## Recommended First Task

Start by scaffolding `src/proofing-gallery-block` from the most similar existing gallery block, then strip it back to the smallest useful proofing gallery:

- image upload/select,
- responsive gallery output,
- visible select buttons,
- selection counter,
- submit form placeholder.

Once that skeleton is stable, add persistent submissions and admin review as the next layer.
