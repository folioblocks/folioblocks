# Changelog
All notable changes to the FolioBlocks project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2026-06-29
### Added
- Added full Gradient Overlay support for Image Block, Video Block, image galleries, Video Gallery, and Filmstrip Gallery.
- Added a dedicated Gradient Overlay style for full-cover gradient backgrounds while preserving the existing Bottom Gradient image overlay behavior.
- Added Hover Effect controls with Zoom In, Zoom Out, Lift, Tilt, Pop, Glare, Pan, and Desaturate effects.
- Added pointer-aware Tilt hover behavior so image and video surfaces tilt based on cursor position.
- Added Overlay Entrance controls for supported overlays, including fade and slide directions.
- Added overlay typography controls for Image Block and image gallery overlays, including theme font family plus weight and style.
- Added gradient overlay support to gallery defaults and per-image or per-video hover overrides.
- Added gradient-safe CSS background sanitization for overlay backgrounds.
- Added support for Image Rows inside Modular Gallery Image Stacks.
- Added an Image Stack toolbar button for inserting a nested Image Row.
- Added an initial FolioBlocks Global Settings page with saved watermark management.
- Added multiple named saved watermarks with upload/select image controls, default watermark selection, and compact editable saved watermark rows.
- Added live watermark previews with aspect-ratio preview buttons and a larger modal preview.
- Added Pro Watermark Overlay controls for Image Block and image gallery blocks, with editor previews and frontend rendering on gallery images, lightbox images, or both.

### Changed
- Renamed Gradient Bottom to Bottom Gradient in the editor while preserving the existing `gradient-bottom` saved value for backwards compatibility.
- Renamed Hover Style controls to Overlay Style for clearer editor wording.
- Split overlay background controls so Color Overlay uses solid colors and Gradient Overlay uses gradient backgrounds.
- Updated Video Block and Video Gallery overlays to use separate Color Overlay and Gradient Overlay styles.
- Improved Tilt, Pop, Glare, and related hover effects so they apply consistently across image and video blocks.
- Updated Modular Gallery Image Rows and Image Stacks so empty placeholder Image Blocks are removed automatically when a populated Image Block is dragged in.
- Improved Modular Gallery editor layout recalculation after dragging images into large galleries.
- Simplified saved watermark settings to focus on image, opacity, size, inset, position, and repeat controls.
- Updated watermark preview inset handling so the inset is calculated from the preview short edge and applied equally on all sides.
- Updated watermark overlay layering so watermarks sit above images while remaining beneath hover overlays, links, cart, download, and lightbox controls.
- Updated watermark overlay sizing to use one shared short-edge formula across dashboard previews, editor overlays, frontend gallery images, and lightbox images.
- Removed the sidebar and quick links from the initial watermark settings experience to give the content more room.

### Fixed
- Fixed Modular Gallery layouts sometimes requiring an extra image move before recalculating after newly dragged images finished loading.
- Fixed redundant Image Row editor layout application that could reuse the first row layout across other rows in large Modular Galleries.
- Fixed nested Modular Gallery Image Rows inside Image Stacks so increasing the gallery gap preserves each image's natural aspect ratio.
- Fixed Image Block lightbox sizing so smaller source images can expand correctly in fullscreen mode while keeping watermark overlays aligned to the rendered image.

## [1.4.0] - 2026-06-25
### Added
- Added responsive desktop, tablet, and mobile gap controls to Masonry, Justified, Modular, and Video Galleries.
- Added a fullscreen control to Video Block and Video Gallery lightboxes that expands the playing video.
- Added the same drop shadow style presets to Video Block and Video Gallery thumbnails.
- Added Subtle, Soft, Elevated, and Dramatic drop shadow presets for Image Block and photo galleries.
- Added tap-to-hide Lightbox controls and captions for distraction-free image viewing, plus swipe navigation on touch devices.
- Added Dark and Light appearance options for image lightboxes, with per-image overrides able to inherit future gallery appearance changes.
- Added combined Image Title, Image Caption, and EXIF Data display options for image lightboxes.
- Added optional WooCommerce and Page/URL link icons when thumbnail linking is enabled.
- Added a Pro-only fullscreen button to Image Block lightboxes, positioned at the bottom right and available with the `F` keyboard shortcut.
- Added a Pro-only, permission-aware per-image action for syncing Image Block titles, captions, and alternative text to the WordPress Media Library, with loading, success, and error feedback.
- Added Pro-only per-image click and hover overrides for Grid, Justified, Masonry, Carousel, and Modular gallery Image Blocks, including effective-action destination controls for WooCommerce products, custom URLs, and Page/Post links.
- Added shared Gallery Click Settings, Gallery Click Styles, Gallery Hover Settings, and per-image click and hover overrides to Filmstrip Gallery.
- Added Image Block lightbox support to Filmstrip Gallery, including scoped Filmstrip image navigation, inherited and per-image lightbox appearance/content settings, and EXIF display.
- Added Filmstrip Lightbox-to-fullscreen handoff, with the Lightbox fullscreen control hidden when Filmstrip fullscreen is disabled.
- Added optional Pro seamless front-end looping to Carousel Gallery, with the first image centered beside the preceding last image and continuous arrow, keyboard, swipe, and autoplay navigation.
- Added native WordPress password protection controls to the FolioBlocks Page Settings panel for Posts and Pages.
- Added Video Title, Play Button, and Filtering Category combinations to Video Block and Video Gallery Overlay Content controls.
- Added Pro-only per-video Gallery Hover Settings overrides to Video Blocks inside Video Galleries, including per-video hover styles, overlay content, visibility, and Color Overlay colors.

### Changed
- Made responsive image gap controls for Masonry and Justified Galleries a FolioBlocks Pro feature while retaining the free Remove Image Gap option.
- Improved Justified Gallery row balancing so completed rows stay closer to the preferred row height.
- Consolidated image and video border, radius, color, and drop shadow controls into a shared Image Style control with consistent 15px border width and 50px radius limits.
- Moved Pro Lazy Load and Disable Right-Click controls from individual block settings into a conditional FolioBlocks panel in the editor Page & Post settings.
- Moved gallery, Image Block, and Video Block transforms into FolioBlocks Pro.
- Moved per-image gallery filtering categories into the WordPress 7.0 Content inspector while preserving their Settings inspector location on older WordPress versions.
- Renamed the per-image filtering panel to Gallery Filtering Categories.
- Restyled Image Block EXIF metadata as a compact read-only card with clearer spacing and visual separation from editable image metadata.
- Updated WooCommerce Product Info lightbox and hover-overlay content so images without linked products display no fallback caption or title.
- Updated Filmstrip Gallery editor previews and front-end hover overlays to follow the same no-fallback Product Info behavior.
- Reworked Filmstrip Gallery editor and front-end main-image markup to use the shared Image Block media and overlay structure, keeping overlays and action controls aligned to the displayed image.
- Updated Filmstrip Gallery front-end image switching to resolve effective gallery or per-image click actions, destinations, icon styles, hover overlays, and Lightbox settings.
- Updated Filmstrip fullscreen mode to quietly inherit the active image's effective Lightbox Dark or Light appearance when Lightbox is enabled.
- Styled native WordPress password forms with a simple, neutral, responsive layout on password-protected Posts and Pages.
- Split Video Gallery and Video Block click and hover settings into dedicated inspector panels.
- Added Dark and Light appearance modes for Video Gallery and standalone Video Block lightboxes.
- Moved Video Block thumbnail, video URL, title, description, and conditional gallery filtering categories into the WordPress 7.0 Content inspector while preserving their existing Settings inspector locations on older WordPress versions.
- Reworked Video Block and Video Gallery hover controls to use Hover Style, Overlay Content, and Always Display Overlay controls consistent with the photo galleries.
- Moved Video Block and Video Gallery Color Overlay color controls into Gallery Hover Styles tools panels and added neutral default overlay colors.
- Updated Video Block and Video Gallery play buttons with a circular border that inherits the effective overlay text color.
- Added responsive Desktop, Tablet, and Mobile gap controls to Carousel Gallery.
- Renamed Video Block and Video Gallery Lightbox Layout controls to Lightbox Content and reordered Lightbox Appearance choices to list Light before Dark.
- Reworked free-version Pro feature notices across image, video, gallery, Before & After, Loupe, and Background Video blocks with clearer feature summaries and consistent Get FolioBlocks Pro actions.
- Updated the Free vs Pro settings page with FolioBlocks 1.4 features and current control names.

### Fixed
- Fixed Image Block and Video Block transforms disappearing when premium scripts loaded before their block registrations, restoring transforms from core Image, Video, YouTube, and Vimeo blocks.
- Fixed gallery transforms dropping matching responsive column and gap settings.
- Fixed Justified Gallery rows sometimes stopping short of the gallery edge when using larger image gaps.
- Fixed Hide Unknown EXIF Fields failing when missing metadata was stored using a different site locale.
- Fixed image Lightbox navigation arrows overlapping captions on mobile devices.
- Fixed Video Block and Video Gallery lightbox titles retaining dark-mode text colors when using Light appearance.
- Fixed Video Block and Video Gallery lightboxes appearing beneath theme headers and other high-stacking elements by mounting them at the document root.
- Fixed Carousel Galleries occasionally appearing too small when reopening a page in the block editor.
- Fixed Elevated and Dramatic image shadows being clipped by Carousel Gallery containers.
- Improved Safari reliability for large gallery blur overlays and added a direct-filter fallback for Carousel Lightbox backgrounds.
- Fixed an Image Block editor crash when changing gallery overlay content from EXIF Data to Product Info.
- Fixed the Filmstrip Gallery `useSelect` capabilities warning caused by unstable selector return values.
- Fixed Filmstrip Gallery horizontal-image overlays extending beyond the displayed image in the editor and front end.
- Fixed Filmstrip Gallery per-image hover overrides not rendering on the front end.
- Fixed Filmstrip Gallery WooCommerce-linked images rendering at a different size than their overlay wrapper.
- Fixed Filmstrip Gallery action controls and links retaining stale WooCommerce, download, Custom URL, or Page/Post behavior when switching images.
- Fixed stray control syntax text appearing in Gallery Click Settings when Image Downloads were enabled.
- Fixed YouTube videos failing to preview in the Video Block and Video Gallery editor in Chromium browsers by using the WordPress oEmbed preview flow.
- Fixed Color Overlay titles, filtering categories, and play buttons inheriting the text shadow used by image-based hover styles.
- Fixed Video Block, Video Gallery, Background Video, and custom image URL fields accepting arbitrary text instead of requiring valid URLs.
- Fixed Pro gallery transforms sometimes being unavailable when premium scripts loaded before their gallery block registrations.

## [1.3.1] - 2026-06-03
### Added
- Added shared premium control helpers for repeated Image Click Styles, simple gallery toggles, List View thumbnails, and gallery filtering editor controls.
- Added shared editor-side filtering support for Grid, Justified, Masonry, and Video Gallery blocks, including active-filter reset behavior when selected child items are hidden by the current filter.

### Changed
- Refactored Grid, Justified, Masonry, Modular, Carousel, Filmstrip, Image Block, and Video Gallery premium controls to reduce duplicated inspector and editor enhancement code.
- Updated gallery List View thumbnail registration to use a shared helper for gallery containers while preserving Image Block and Video Block thumbnail-producing behavior.
- Updated randomize order editor behavior so gallery transforms do not immediately reshuffle copied media on mount.
- Replaced deprecated WordPress `getMedia` selector usage with `getEntityRecord( 'postType', 'attachment', id )`.
- Cleaned up redundant legacy lightbox style filter registrations now handled by the shared Image Click Styles helper.

### Fixed
- Fixed randomized gallery order on the front end so randomized galleries reshuffle on refresh instead of preserving the editor order.
- Fixed block transform nested update errors caused by randomize-order effects firing during transformed block mount.
- Fixed Carousel Gallery randomize markup so front-end randomization is enabled consistently with the other galleries.
- Fixed duplicate Grid Gallery editor enhancement registration that could mount incomplete premium enhancement props.
- Fixed import casing and removed leftover debug/dead premium control code.

## [1.3.0] - 2026-06-01
### Added
- Added a Pro-only image metadata sync action plan for syncing Image Block and gallery image metadata back to the WordPress Media Library.
- Added a Hide Unknown EXIF Fields toggle when Show EXIF Data is selected for Lightbox Content or Overlay Content in shared gallery controls.
- Added gallery context support for hiding unknown EXIF fields in Grid, Carousel, Justified, Masonry, and Modular galleries.
- Added a FolioBlocks REST metadata fallback for attachment shutter speed values so Image Blocks can read shutter speed data when WordPress core stores it as `0`.
- Added dedicated PHP include files for EXIF metadata helpers and SVG allowed HTML helpers.

### Changed
- Updated Image Block front-end rendering so EXIF lightbox captions and hover overlays omit unknown fields when the new Hide Unknown EXIF Fields option is enabled.
- Updated Image Block editor previews so EXIF hover overlays do not fall back to title text when all EXIF fields are hidden.
- Improved EXIF hover overlay sizing with container-query based padding, icon, gap, ISO, and value sizing.
- Added a Grid Gallery-specific EXIF overlay sizing floor so vertical images display metadata at a more readable size without changing Masonry or Justified gallery sizing.
- Moved SVG sanitization helper functions out of `folioblocks.php` and into `includes/php/svg-allowed-html.php`.

### Fixed
- Fixed 30-second shutter speed values being displayed as Unknown by reading both `ExposureTime` and `ShutterSpeedValue` EXIF fields.
- Fixed stored Unknown EXIF attributes preventing Image Blocks from refreshing metadata when the attachment has updated values available.
- Fixed Carousel Gallery controls disappearing after resetting icon and background colors by normalizing empty saved color values to front-end defaults.
- Fixed Carousel Gallery control button sizing so play and chevron icons remain visible and centered after style resets.
- Fixed EXIF hover overlays rendering empty overlay containers when all fields are hidden.

## [1.3.0] - 2026-05-29
### Added
- Added a WooCommerce product toolbar shortcut to Image Blocks when WooCommerce linking is active, including standalone Image Blocks and Image Blocks inside galleries.

### Changed
- Renamed gallery click and hover control panels to Gallery Click Settings and Gallery Hover Settings, with matching Gallery Click Styles and Gallery Hover Styles labels.
- Renamed Image Block hover controls to Image Hover Settings and Image Hover Styles.
- Moved per-image gallery filtering categories into the Image Block settings inspector below Image Click Settings, and renamed the panel to Image Filtering Settings.

### Fixed
- Fixed Masonry Gallery front-end column handling so desktop, tablet, and mobile column settings respect saved user values instead of falling back to defaults.
- Fixed gradient hover overlays remaining visible when macOS Reduce Motion is enabled.
- Fixed Image Block filtering category controls disappearing when gallery filtering is enabled.

## [1.3.0] - 2026-05-27
### Added
- Added WordPress 7.0 List View inspector support to all FolioBlocks gallery container blocks.
- Added List View thumbnail previews for standalone FolioBlocks Image Blocks and Video Blocks.

### Changed
- Improved List View thumbnail previews so image and video gallery children display stable thumbnails in both the editor List View and the List View inspector tab.

### Fixed
- Fixed bug in Masonry Gallery that prevented correct column count from being used. 
- Fixed Masonry Gallery front-end layouts so multiple Masonry galleries on the same page initialize independently instead of only laying out the first gallery.
- Fixed Justified Gallery front-end layouts so multiple Justified galleries on the same page initialize independently instead of leaving later galleries hidden or unloaded.
- Fixed Justified Gallery front-end filtering so each gallery filter bar only updates its own gallery instance.
- Fixed the FolioBlocks WordPress admin menu icon so it displays at the correct size and color when the FolioBlocks menu item is not selected.

## [1.3.0] - 2026-05-26
### Added
- Added a new Image Click Behavior control model for Image Block and all photo galleries.
- Added premium image linking support for Image Block and all photo galleries, including Media File, Custom URL, and Page/Post link actions.
- Added per-image Custom URL and Page/Post link controls for Image Blocks used inside galleries.
- Added toolbar shortcuts for editing Custom URL and Page/Post links on Image Blocks when those click behaviors are active.
- Added a shared premium helper for repeated Image Click Behavior controls used by multiple gallery blocks.
- Added a shared premium helper for repeated Image Hover Style controls.
- Added WordPress 7.0 Content inspector support for Image Block metadata controls.
- Added EXIF metadata capture for Image Blocks, including camera model, focal length, shutter speed, aperture, and ISO.
- Added Show EXIF Data as a premium Lightbox Content option for Image Block and photo galleries.
- Added Show EXIF Data as a premium Overlay Content option for Image Block and photo galleries, including Filmstrip Gallery.
- Added compact EXIF icon/value displays for lightbox captions and hover overlays.
- Added separate Chip Overlay color controls in the Image Hover Style tools panel.
- Added documentation for future premium control refactor candidates.

### Changed
- Replaced separate Lightbox, Image Download, and WooCommerce toggles with a single Image Click Behavior select control.
- Replaced the Image Hover Settings toggle flow with a single Hover Style select control for Image Block and Grid Gallery.
- Added Image Title, Image Caption, and conditional WooCommerce Product Info choices to Image Hover Settings overlay content.
- Moved custom Color Overlay colors into an Image Overlay Styles tools panel for Image Block and Grid Gallery.
- Renamed E-Commerce style panels to Image Click Styles.
- Updated Filmstrip Gallery to use Image Click Behavior without a Lightbox option, preserving its fullscreen-focused behavior.
- Updated Filmstrip Gallery front-end rendering to support Media File, Custom URL, and Page/Post links while avoiding empty image links.
- Updated Filmstrip Gallery hover overlays to support Image Title, Image Caption, Product Info, and EXIF Data from the same Overlay Content model.
- Reordered Image Download and WooCommerce secondary controls so the selected click behavior settings appear before optional Lightbox settings.
- Repositioned standalone Image Block WooCommerce product linking controls and added contextual Image Click Behavior help text.
- Improved Page/Post link control styling with a compact selected-link preview, inline remove control, and better spacing around new-tab toggles.
- Moved Image Block caption, title, and alternative text controls into the WordPress 7.0 Content inspector while preserving the existing layout for older WordPress versions.
- Updated Carousel Gallery to use the same Image Click Settings and Image Hover Settings panel structure as the other photo galleries.
- Updated Grid Gallery to use the shared premium Image Click controls used by the other photo galleries.
- Replaced the Lightbox caption toggle with a premium Lightbox Content select control for title, caption, product info, and EXIF display options.
- Kept the base Lightbox action available to free users while moving Lightbox Content display options into premium controls.
- Moved Image Block EXIF data display behind premium controls so free users see a Pro notice instead of the metadata panel.
- Refined the FolioBlocks admin Dashboard with a more premium branded header, constrained layout, and softer panel treatment.
- Updated Available Blocks cards with dark premium styling, FolioBlocks blue icon buttons, and improved icon alignment.
- Improved Dashboard Quick Links with SVG icon panels, unified button styling, and branded Feedback coloring.
- Limited the Dashboard changelog panel height with an internal scroll area for a cleaner right column.

### Fixed
- Fixed a typo in the Filmstrip Gallery Image Hover Settings panel title.
- Fixed Image Block inspector panel regressions where Image Hover Settings disappeared and Lazy Load appeared inside Image Click Settings.
- Fixed gallery Image Click Settings so WooCommerce, Download, Custom URL, and Page/Post secondary controls display when selected.
- Fixed WordPress 7.0 Image Block Content inspector layout by wrapping metadata controls in an Image Content panel.
- Fixed Fade Overlay inheriting custom Color Overlay background colors when switching hover styles.
- Fixed Gradient Overlay EXIF text and icons to render in white for better contrast.
- Fixed EXIF Lightbox output so missing metadata displays Unknown values instead of hiding the EXIF panel.
- Fixed FolioBlocks admin Dashboard stylesheet cache busting so updated dashboard styling loads correctly after plugin updates.

## [1.2.9] - 2026-05-18
### Added 
- Added Block Transforms support to convert WordPress Video, YouTube Embed, and Vimeo Embed blocks into a FolioBlocks Video Block.  

### Fixed
- Added attribute parity in Block Transforms feature
- Fixed Vimeo private link support in Video Block and Video Gallery lightboxes by preserving Vimeo privacy hashes in embed URLs.
- Fixed Video Block and Video Gallery lightbox sizing so 16:9 videos are not clipped in Chromium-based browsers.
- Improved Video Block and Video Gallery split lightbox sizing so videos with descriptions use more of the available viewport.

## [1.2.8] - 2026-05-14
### Added
- Support to transform a WordPress gallery into a FolioBlocks gallery. 

### Changed
- Updated existing block transforms so all galleries, except Modular, can transform into one another. 

### Fixed
- General secuirty improvements based on code audit. 
- Fixed a bug that prevented custom image sizes from registered by galleries. 

## [1.2.7] - 2026-04-27
### Fixed
- Fixed a bug in Video Gallery that cause the block to crash in WordPress 7.0 
- Fixed deprecation warnings raised by WordPress 7.0 in our CompactTwoColorControl component. 

### Changed
- Updated Swedish translations. 
- Changed Dashboard icon to better follow WordPress standards. 

## [1.2.6] - 2026-04-24
### Fixed
- Fixed a bug in Modular Gallery that prevented the correct image resolution from being used in the front-end. 

## [1.2.5] - 2026-04-16
### Removed 
- Removes support for coverting legacy (Portfolio Blocks) blocks into FolioBlocks blocks. 

### Changed
- Improves Swedish translations 

## [1.2.4] - 2026-03-25
### Changed 
- Server configuration information is no longer wrapped for translation. 

### Added
- Added initial translation support for the admin screens and block settings. 
- Added Swedish, Italian, Spanish, and French langauge traslations. 
- Added support for block transform on Image Block to allow conversion into core/image block when used outside of galleries. 
- Added support to core/image blocks to allow them to transform into FolioBlocks Image Blocks. 

### Fixed
- Fixed a bug on the settings page that prevent fetching images from FolioBlocks website. 

## [1.2.3] - 2026-03-17

### Fixed
- Fixed bug that caused undefined variable warning in Grid Gallery

## [1.2.2] - 2026-03-11

### Added
- Added responsive settings to Row Height slider in Justified Gallery Block.

### Changed  
- Updated Lightbox on Image Block to fill more of the viewport when exapnded. 
- Increased maximum row height value on Justifed gallery block. 

## [1.2.1] - 2026-02-24

### Added
- Added support for videos from Bunny Stream to the Video Block and Video Gallery. 

### Changed 
- Moved video parsing logic from block into seperate helper file. 

## [1.2.0] - 2026-02-18

### Released
- Public release of Filmstrip Gallery & Background Video Block. 
- Public release of Block Transforms. 
- Public release of new Custom Color Overlay in all galeries. 
- Public release of Overlay Styles on Video Block and Video Gallery. 
- Public release of multi-category filtering in all galleries.

### Fixed
- Layout bugs in Background Video Block. 

### Changed 
- Updated Free Vs Pro Page.

## [1.1.8] - 2026-02-18

### Fixed 
- Bug that prevented Play/Pause and Full Screen from being accessed when overlay was enabled on Filmstrip Gallery.

## [1.1.7] - 2026-02-17

### Changed
- Prevent Filmstirp Gallery coming into focus when autoplay is enabled in the editor.

### Added 
- Added support for setting Add To Cart icon behavior when using WooCommerce integration on Video Block & Video Gallery. 
- Added Randomize Image Order feature to Filmstrip Gallery. 

### Fixed
- Fixed a bug in Add To Cart icon on Video Block and Video Gallery that prevent Hover display. 
- Fixed a bug in Image Block that prevent drop shadow from being applied when used individually. 

## [1.1.6] - 2026-02-16

### Fixed
- Layout related bugs on Background Video Block. 
- Fixed a bug on Video Block and Video Gallery Block that threw up warning on the free verion of FolioBlocks. 
- Fixed a bug on Video Block that displayed an empty PanelBody. 
- Fixed bugs on Carousel, Grid, Justified, Masonry, and Video Gallery blocks that displayed a Notice out of alignment.   

## [1.1.5] - 2026-02-14

### Added
- Added support for setting multiple categories per image when filtering in Grid, Justified, and Masonry Galleries. 
- Added support for setting multiple categories per video when filtering in Video Gallery. 
- MediaPlaceholder for initial state on Background Video Block. 

### Fixed
- Moved Enable Full Screen into premium.js 
- Fixed visual layout bugs in Filmstrip Gallery. 

### Changed
- Updated Filmstrip Gallery to set image ID and srcset size. 
- Updated Carousel Gallery to use custom CompactTwoColorControl. 

## [1.1.4] - 2026-02-11

### Added
- Build initial render.php file for Filmstrip Gallery.
- Added support for Block Transforms for Carousel Gallery and Filmstrip Gallery. 
- Filmstrip Gallery block now supports setting image resolution. 
- Filmstrip Gallery now supports showing title on hover. 

## [1.1.3] - 2026-02-09

### Added
- Added new Filmstrip Gallery block. 
- Added Overlay styles (Default, Blur, & Color) to Video Block & Video Gallery.

### Fixed
- Bug in Color and Fade Overlay that affected image title rendering. 
- Moved wooCartIcon into new icons helper file. 

### Changed
- Merged Title and Play button visibility into one control on Video Block & Video Gallery. 
- Replaced Play button icon on Video Block with SVG variant. 
- Combined all icon helper files into one file. 

## [1.1.2] - 2026-02-06

### Added 
- Added keyboard full-screen support (F) for the Video Lightbox. 
- Added support for Disable Right Click to Background Video Block. 
- Added block transforms on Grid Gallery, Justified Gallery, and Masonry Gallery. 

### Changed
- Updated the Free Vs Pro page to include new blocks and new features.
- Prevent all blocks from transforming into Groups, Columns, or Details blocks. 

## [1.1.1] - 2026-02-05

### Added 
- Added a new Background Video Block. 
- Added a new Color Overlay where you can select the Color of the Overlay & Text

## [1.1.0] - 2026-01-21

### Added
- Added style controls to set icon color and background color on Add To Cart and Download icons. 
- Added Drop Shadow control to Image Block. 
- Added new compact Border color component.
- WooCommerce Add To Cart Links now uses Ajax. 
- Images linked with WooCommerce can now select if the Add To Cart button Adds Product to Shopping Cart or leads to Product Page. 

### Fixed
- Visual bug in Modular gallery where margin bottom in stacked images created gap between image and the selection outline. 

### Changed
- Gallery Image Styles now all inside of a single filter. 

## [1.0.10] - 2025-12-23
### Fixed
- Bug in Modular Gallery border controls.
- Bug in playback controls on Carousel Gallery Block.

## [1.0.9] - 2025-12-18
### Fixed 
- Bug in Masonry Gallery Image Filtering 

## [1.0.8] - 2025-12-17
### Fixed 
- Bug in Grid Gallery layout logic
- Bug in Image block when using border-radius. 

### Changed
- Reduced availble border-width in all galleries to a maximum of 15px. 
- Reduced available border-radius on all galleries to a maximum of 50px. 
- Changed label names on all Gallery blocks to ensure matching language.
- Changed default setting for Image Downloads to "On Hover" to match default in WooCommerce Integration.

## [1.0.7] - 2025-12-15
### Fixed 
- Fixed bug in Grid Gallery that clipped images when set to content width.

## [1.0.6] - 2025-12-07
### Fixed 
- Fixed bug in Before & After block where slider could hide block outline.
- Fixed bug in Safari with Blur Overlay.
- Fixed layout issue with Justified Gallery when using Gallery Filtering.
- Fixed block previews on Image Block and Video Block.
- Fixed escaping issue on Loupe block.
- Fixed a layout issue with the final row on Justified Gallery.

### Added
- Add controls to access new Hover styles to Carousel, Grid, Justified, Masonery, and Modular galleries.
- Additional Hover Styles built into Image Block. 
- Adds Image Block and Video Block as standalone blocks. 
- Adds Lightbox, WooCommerce, Lazy Load, and Disable Right-click options to Video Block when used individually. 
- Adds Resolution, Lightbox, Hover, WooCommerce, Image Download, Lazy Load, Disable Right-Click options to Image Block when used individually.
- Added API Version to migration script in deprecated.js to prevent false warnings in WordPress 6.9. 

### Changed
- Updated Grid Gallery layout logic. 
- Removed pb-image-block-wrapper from Image Block except for on Masonry Gallery to improve dragability. 
- Updates the organization of controls on all bblocks. 

## [1.0.5] - 2025-11-27
### Added
- New Loupe Block introduced.

### Fixed 
- Fixed bug that prevented Disable Right-Click on Carousel Gallery.
- Fixed issue where Beofre & After Block placeholder would inherit color from parent.

### Changed
- Changed variable prefixes to comply with WordPress standards.

## [1.0.4] - 2025-11-25
### Changed
- Changed variable prefixes to comply with WordPress standards.

### Fixed
- Fixed escaping issues on dashboard pages.

## [1.0.3] - 2025-11-23
### Changed
- Improved loading method for premium scripts.
- Upgrade page now redirects to the FolioBlocks website pricing page.

## [1.0.2] - 2025-11-21
### Fixed
- Minor bugs in Grid, Justified, and Masonry galleries.

## [1.0.1] - 2025-11-20
### Added
- `is-loading` spinner added to Carousel, Grid, Justified, and Masonry galleries.

### Fixed
- Carousel height calculation bug.
- Issues related to FolioBlocks domain name switch.
- Confirmed WordPress 6.9 compatibility.

## [1.0.0] - 2025-11-18
### Added
- Public release.

### Changed
- Admin Dashboard rebuilt.

## [0.9.9] - 2025-11-16
### Changed
- Modular Gallery Block is now Pro only.
- Lightbox Caption and Show Title on Hover moved to Pro features.

## [0.9.8] - 2025-11-13
### Fixed
- Compliance fixes for WordPress.org requirements.

## [0.9.7] - 2025-11-11
### Changed
- Updated all block slugs; Portfolio Blocks renamed to FolioBlocks.

## [0.9.6] - 2025-11-09
### Changed
- Removed premium code from all free-version blocks.
- Updated PB Image Block and PB Video Block to remove premium code.

### Fixed
- Rebuilt PB Video Block Lightbox to match PB Image Block.

## [0.9.5] - 2025-10-28
### Changed
- Updated plugin slug for WordPress.org compliance.
- Added `deprecated.js` to all blocks to help beta testers transition to new slug.

## [0.9.4] - 2025-10-26
### Added
- Improved icon adjustment with border & border radius.

### Fixed
- TypeError issues across all blocks.
- Removed title tag from PB Image Block.
- Safari hover blur bug in Carousel Gallery.
- Grid Gallery filtering bug.
- Additional WordPress.org compliance fixes.

## [0.9.3] - 2025-XX-XX
### Added
- WooCommerce toggle now only appears when WooCommerce is active.

### Fixed
- Carousel icon sizing bug.
- Modular Gallery Add To Cart icon sizing bug.
- PB Image Block Add To Cart icon border bug.

## [0.9.2] - 2025-10-21
### Added
- WooCommerce integration to PB Video Block.
- WooCommerce integration to Video Gallery Block.

## [0.9.1] - 2025-10-20
### Changed
- Replaced front-end icons with PNG files for consistent sizing.

### Fixed
- Grid Gallery layout issue when icons were present.

## [0.9.0] - 2025-10-20
### Added
- WooCommerce integration to Carousel, Justified, Masonry, and Modular galleries.

## [0.8.9] - 2025-10-19
### Added
- WooCommerce integration to Grid Gallery.
- WooCommerce integration to PB Image Block.

## [0.8.8] - 2025-10-19
### Changed
- Rebuilt premium filters for consistency across blocks.

## [0.8.7] - 2025-10-19
### Fixed
- Bugs introduced in 0.8.6.
- Image Overlay coverage issue.

## [0.8.6] - 2025-10-18
### Added
- Improved entrance animations for all galleries.

### Fixed
- Video Block rendering bug when thumbnail missing.

## [0.8.5] - 2025-10-17
### Fixed
- Script loading bug.

## [0.8.4] - 2025-10-13
### Added
- Lazy Load & Disable Right Click for Video Gallery.
- Lazy Load & Disable Right Click for Before & After Block.

### Fixed
- Focus state bug in Carousel Gallery.

## [0.8.3] - 2025-10-10
### Added
- Title & Description in Lightbox for Video Gallery.

### Changed
- Improved accessibility of lightboxes with keyboard navigation.
- Disabled Image Gallery Lightbox inside editor.

### Fixed
- Carousel navigation sync bug.

## [0.8.2] - 2025-10-09
### Added
- FAQ section to readme.txt.
- 15 image/video limit to free version galleries.
- Alternate admin screen for premium users.
- Carousel Gallery icon update.

### Fixed
- Carousel centering issue.
- Carousel vertical orientation bug.

## [0.8.1] - 2025-XX-XX
### Fixed
- Additional WordPress Plugin Check issues.
- Premium script loading.

## [0.8.0] - 2025-XX-XX
### Added
- Required WordPress.org repository assets.

### Fixed
- Additional Plugin Check issues.

## [0.7.9] - 2025-XX-XX
### Added
- Lazy Load to all galleries.

### Changed
- Improved Modular Gallery layout performance.

## [0.7.8] - 2025-XX-XX
### Added
- Upgrade links for all locked free-version features.
- Auto-loading changelog from readme.txt in admin.

## [0.7.7] - 2025-XX-XX
### Added
- Lazy Load hooks to all galleries.

### Fixed
- Freemius bugs.

## [0.7.6] - 2025-XX-XX
### Fixed
- Freemius bugs.

## [0.7.5] - 2025-XX-XX
### Fixed
- Freemius bugs.

## [0.7.4] - 2025-XX-XX
### Added
- Freemius premium feature logic to Video Gallery Block.

## [0.7.3] - 2025-XX-XX
### Added
- Freemius premium feature logic to Carousel and Before & After blocks.

## [0.7.2] - 2025-XX-XX
### Added
- Freemius premium feature logic to Masonry & Modular galleries.

## [0.7.1] - 2025-XX-XX
### Added
- Freemius SDK.
- Freemius premium feature logic to Grid & Justified galleries.

## [0.7.0] - 2025-XX-XX
### Changed
- Moved Modular Gallery layout logic to parent block for performance.
- Updated preliminary screens for Modular & Video Gallery blocks.

## [0.6.9] - 2025-XX-XX
### Added
- Before & After comparison block.

### Fixed
- Block previews.
- Carousel resizing bug before saving.

## [0.6.8] - 2025-XX-XX
### Improved
- Stability when injecting thumbnails into List View.

## [0.6.7] - 2025-XX-XX
### Added
- Completed Carousel `render.php`.

### Fixed
- Container-type bug in PB Image Block.

## [0.6.6] - 2025-XX-XX
### Added
- Began building Carousel Gallery Block.

## [0.6.5] - 2025-XX-XX
### Added
- Custom icons to all blocks.

## [0.6.4] - 2025-XX-XX
### Fixed
- Download icon in Lightbox across galleries.
- Mobile arrow placement in Lightbox.

### Changed
- Adjusted download icon styles.

## [0.6.3] - 2025-XX-XX
### Changed
- Organized gallery settings.

## [0.6.2] - 2025-XX-XX
### Added
- Right-Click Prevention to Grid, Justified, Masonry, Modular Galleries.

## [0.6.1] - 2025-XX-XX
### Fixed
- Masonry border-related layout bug.
- Justified gallery mobile margin bug.

## [0.6.0] - 2025-XX-XX
### Added
- Image Download support to all image galleries.
- Updated hover behavior: titles shown instead of captions.

## [0.5.5] - 2025-XX-XX
### Added
- Border & border-radius support to PB Image Block and all galleries.

### Changed
- Moved Grid Gallery layout logic out of PB Image Block.

## [0.5.4] - 2025-XX-XX
### Added
- Responsive column control component.

### Fixed
- Masonry column count bug.

## [0.5.3] - 2025-XX-XX
### Added
- Began scaffolding Modular Gallery and Image Row blocks.
- Moved Filter Bar color settings into Styles panel.

## [0.5.2] - 2025-XX-XX
### Added
- License management UI.
