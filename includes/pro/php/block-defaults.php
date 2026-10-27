<?php
/** Initial values for new blocks. Existing saved blocks keep their own attributes. */
if (!defined('ABSPATH')) { exit; }

function fbks_get_block_defaults_schema() {
    $image_sizes = [];
    foreach (get_intermediate_image_sizes() as $size) { $image_sizes[$size] = ucwords(str_replace(['-', '_'], ' ', $size)); }
    $image_sizes['full'] = __('Full Size', 'folioblocks');
    $schemas = [
        'before_after' => [
            'title' => __('Before & After Block', 'folioblocks'),
            'icon' => 'pb-before-after.svg',
            'block' => 'folioblocks/before-after-block',
            'groups' => ['slider' => __('Slider Settings', 'folioblocks'), 'labels' => __('Label Settings', 'folioblocks')],
            'fields' => [
                'sliderOrientation' => ['group' => 'slider', 'label' => __('Orientation', 'folioblocks'), 'help' => __('Choose whether the slider moves left-to-right or top-to-bottom.', 'folioblocks'), 'default' => 'horizontal', 'choices' => ['horizontal' => __('Horizontal', 'folioblocks'), 'vertical' => __('Vertical', 'folioblocks')]],
                'startingPosition' => ['group' => 'slider', 'label' => __('Starting position (%)', 'folioblocks'), 'help' => __('Set starting position for slider drag handle.', 'folioblocks'), 'default' => 50, 'min' => 0, 'max' => 100],
                'sliderColor' => ['group' => 'slider', 'label' => __('Slider color', 'folioblocks'), 'help' => __('Set the color of the slider handle and line.', 'folioblocks'), 'default' => '#ffffff', 'color' => true],
                'showLabels' => ['group' => 'labels', 'label' => __('Show labels', 'folioblocks'), 'help' => __('Display Before & After labels.', 'folioblocks'), 'default' => false],
                'labelPosition' => ['group' => 'labels', 'label' => __('Label position', 'folioblocks'), 'help' => __('Set Before & After label position.', 'folioblocks'), 'default' => 'center', 'choices' => ['center' => __('Center', 'folioblocks'), 'top' => __('Top', 'folioblocks'), 'bottom' => __('Bottom', 'folioblocks'), 'left' => __('Left', 'folioblocks'), 'right' => __('Right', 'folioblocks')]],
                'labelTextColor' => ['group' => 'labels', 'label' => __('Label text color', 'folioblocks'), 'help' => __('Set the text color for Before & After labels.', 'folioblocks'), 'default' => '#ffffff', 'color' => true],
                'labelBackgroundColor' => ['group' => 'labels', 'label' => __('Label background color', 'folioblocks'), 'help' => __('Set the background color and opacity for Before & After labels.', 'folioblocks'), 'default' => 'rgba(0, 0, 0, 0.6)', 'color' => true],
            ],
        ],
        'background_video' => [
            'title' => __('Background Video Block', 'folioblocks'),
            'icon' => 'pb-background-video.svg',
            'block' => 'folioblocks/background-video-block',
            'groups' => ['video' => __('Video Settings', 'folioblocks'), 'sizing' => __('Sizing & Focal Point', 'folioblocks'), 'overlay' => __('Background Video Overlay Styles', 'folioblocks')],
            'fields' => [
                'sourceProvider' => ['group' => 'video', 'label' => __('Video source', 'folioblocks'), 'help' => __('Choose a self-hosted video or a Vimeo video.', 'folioblocks'), 'default' => 'self', 'choices' => ['self' => __('Self-hosted', 'folioblocks'), 'vimeo' => __('Vimeo', 'folioblocks')]],
                'loop' => ['group' => 'video', 'label' => __('Loop', 'folioblocks'), 'help' => __('Automatically loop the video for continuous play.', 'folioblocks'), 'default' => true],
                'disableMobile' => ['group' => 'video', 'label' => __('Disable on mobile', 'folioblocks'), 'help' => __('Disable background video on mobile and display the poster image.', 'folioblocks'), 'default' => false],
                'heightDesktop' => ['group' => 'sizing', 'label' => __('Desktop height (vh)', 'folioblocks'), 'help' => __('Set the height (vh) for this screen size.', 'folioblocks'), 'default' => 70, 'min' => 1, 'max' => 100],
                'heightTablet' => ['group' => 'sizing', 'label' => __('Tablet height (vh)', 'folioblocks'), 'help' => __('Set the height (vh) for this screen size.', 'folioblocks'), 'default' => 60, 'min' => 1, 'max' => 100],
                'heightMobile' => ['group' => 'sizing', 'label' => __('Mobile height (vh)', 'folioblocks'), 'help' => __('Set the height (vh) for this screen size.', 'folioblocks'), 'default' => 50, 'min' => 1, 'max' => 100],
                'objectPositionXDesktop' => ['group' => 'sizing', 'label' => __('Desktop focal point X (%)', 'folioblocks'), 'help' => __('Adjust the horizontal focal point (%) for this screen size.', 'folioblocks'), 'default' => 50, 'min' => 0, 'max' => 100],
                'objectPositionXTablet' => ['group' => 'sizing', 'label' => __('Tablet focal point X (%)', 'folioblocks'), 'help' => __('Adjust the horizontal focal point (%) for this screen size.', 'folioblocks'), 'default' => 50, 'min' => 0, 'max' => 100],
                'objectPositionXMobile' => ['group' => 'sizing', 'label' => __('Mobile focal point X (%)', 'folioblocks'), 'help' => __('Adjust the horizontal focal point (%) for this screen size.', 'folioblocks'), 'default' => 50, 'min' => 0, 'max' => 100],
                'objectPositionYDesktop' => ['group' => 'sizing', 'label' => __('Desktop focal point Y (%)', 'folioblocks'), 'help' => __('Adjust the vertical focal point (%) for this screen size.', 'folioblocks'), 'default' => 50, 'min' => 0, 'max' => 100],
                'objectPositionYTablet' => ['group' => 'sizing', 'label' => __('Tablet focal point Y (%)', 'folioblocks'), 'help' => __('Adjust the vertical focal point (%) for this screen size.', 'folioblocks'), 'default' => 50, 'min' => 0, 'max' => 100],
                'objectPositionYMobile' => ['group' => 'sizing', 'label' => __('Mobile focal point Y (%)', 'folioblocks'), 'help' => __('Adjust the vertical focal point (%) for this screen size.', 'folioblocks'), 'default' => 50, 'min' => 0, 'max' => 100],
                'overlayColor' => ['group' => 'overlay', 'label' => __('Overlay color', 'folioblocks'), 'help' => __('Set the color for the Overlay.', 'folioblocks'), 'default' => '#000000', 'color' => true],
                'overlayOpacity' => ['group' => 'overlay', 'label' => __('Overlay opacity', 'folioblocks'), 'help' => __('Set the level of opacity for the Overlay.', 'folioblocks'), 'default' => 0.35, 'min' => 0, 'max' => 1, 'step' => 0.05],
            ],
        ],
        'image' => [
            'title' => __('Image Block', 'folioblocks'),
            'icon' => 'pb-image-block.svg',
            'block' => 'folioblocks/pb-image-block',
            'groups' => ['image' => __('Image Block Settings', 'folioblocks'), 'click' => __('Image Click Settings', 'folioblocks'), 'hover' => __('Image Hover Settings', 'folioblocks'), 'styles' => __('Image Styles', 'folioblocks')],
            'fields' => [
                'imageSize' => ['group' => 'image', 'label' => __('Resolution', 'folioblocks'), 'help' => __('Select the size of the source image.', 'folioblocks'), 'default' => 'large', 'choices' => $image_sizes],
                'imageClickAction' => ['label' => __('Image Click Behavior', 'folioblocks'), 'default' => 'none', 'help' => __('Choose what happens when visitors click this image.', 'folioblocks'), 'choices' => ['none' => __('None', 'folioblocks'), 'lightbox' => __('Open in Lightbox', 'folioblocks'), 'download' => __('Download', 'folioblocks'), 'media_file' => __('Media File', 'folioblocks'), 'custom_url' => __('Custom URL', 'folioblocks'), 'page_post' => __('Page or Post', 'folioblocks')], 'group' => 'click', 'uiDefault' => true],
                'imageClickTarget' => ['label' => __('Link Target', 'folioblocks'), 'default' => 'icon', 'help' => __('Choose whether the link is attached to the image or an icon.', 'folioblocks'), 'choices' => ['icon' => __('Icon', 'folioblocks'), 'thumbnail' => __('Thumbnail', 'folioblocks')], 'group' => 'click', 'condition' => 'link-target'],
                'linkIconDisplay' => ['label' => __('Display Link Target Icon', 'folioblocks'), 'default' => 'hover', 'help' => __('Choose when the link icon is displayed.', 'folioblocks'), 'choices' => ['none' => __('Never', 'folioblocks'), 'hover' => __('On Hover', 'folioblocks'), 'always' => __('Always', 'folioblocks')], 'group' => 'click', 'condition' => 'link-icon'],
                'downloadOnHover' => ['label' => __('Show Download Icon on Hover', 'folioblocks'), 'default' => true, 'help' => __('When disabled, the download icon is always displayed.', 'folioblocks'), 'group' => 'click', 'condition' => 'download-icon'],
                'downloadIconColor' => ['label' => __('Download Icon Color', 'folioblocks'), 'default' => '#000000', 'help' => __('Set the download icon color.', 'folioblocks'), 'group' => 'click', 'condition' => 'download-icon', 'color' => true],
                'downloadIconBgColor' => ['label' => __('Download Icon Background', 'folioblocks'), 'default' => '#f9f9f9', 'help' => __('Set the download icon background color.', 'folioblocks'), 'group' => 'click', 'condition' => 'download-icon', 'color' => true],
                'lightbox' => ['label' => __('Enable Lightbox Alongside Download', 'folioblocks'), 'default' => false, 'help' => __('Open the image in a lightbox when its download icon is used separately.', 'folioblocks'), 'group' => 'click', 'condition' => 'download-icon'],
                'lightboxTheme' => ['label' => __('Lightbox Appearance', 'folioblocks'), 'default' => 'dark', 'help' => __('Choose a light or dark lightbox background.', 'folioblocks'), 'choices' => ['light' => __('Light', 'folioblocks'), 'dark' => __('Dark', 'folioblocks')], 'group' => 'click', 'condition' => 'lightbox', 'uiDefault' => true],
                'lightboxContent' => ['label' => __('Lightbox Content', 'folioblocks'), 'default' => 'none', 'help' => __('Choose the information shown with the image.', 'folioblocks'), 'choices' => ['none' => __('None', 'folioblocks'), 'title' => __('Show Image Title', 'folioblocks'), 'caption' => __('Show Image Caption', 'folioblocks'), 'exif' => __('Show EXIF Data', 'folioblocks'), 'title_exif' => __('Show Image Title + EXIF Data', 'folioblocks'), 'caption_exif' => __('Show Image Caption + EXIF Data', 'folioblocks'), 'title_caption' => __('Show Image Title + Caption', 'folioblocks'), 'title_caption_exif' => __('Show Image Title + Caption + EXIF Data', 'folioblocks')], 'group' => 'click', 'condition' => 'lightbox', 'uiDefault' => true],
                'lightboxZoom' => ['label' => __('Enable Lightbox Zoom', 'folioblocks'), 'default' => false, 'help' => __('Allow visitors to zoom into the lightbox image.', 'folioblocks'), 'group' => 'click', 'condition' => 'lightbox'],
                'hoverEffect' => ['label' => __('Hover Effect', 'folioblocks'), 'default' => 'none', 'help' => __('Choose how the image itself moves or changes on hover.', 'folioblocks'), 'choices' => ['none' => __('None', 'folioblocks'), 'desaturate' => __('Desaturate', 'folioblocks'), 'glare' => __('Glare', 'folioblocks'), 'lift' => __('Lift', 'folioblocks'), 'pan' => __('Pan', 'folioblocks'), 'pop' => __('Pop', 'folioblocks'), 'tilt' => __('Tilt', 'folioblocks'), 'zoom-in' => __('Zoom In', 'folioblocks'), 'zoom-out' => __('Zoom Out', 'folioblocks')], 'group' => 'hover'],
                'onHoverStyle' => ['label' => __('Overlay Style', 'folioblocks'), 'default' => 'none', 'help' => __('Choose the visual style of the image overlay.', 'folioblocks'), 'choices' => ['none' => __('None', 'folioblocks'), 'blur-overlay' => __('Blur Overlay', 'folioblocks'), 'gradient-bottom' => __('Bottom Gradient Overlay', 'folioblocks'), 'chip-gradient' => __('Chip Gradient Overlay', 'folioblocks'), 'chip' => __('Chip Overlay', 'folioblocks'), 'color-overlay' => __('Color Overlay', 'folioblocks'), 'fade-overlay' => __('Fade Overlay', 'folioblocks'), 'gradient-overlay' => __('Gradient Overlay', 'folioblocks')], 'group' => 'hover', 'uiDefault' => true],
                'overlayEntrance' => ['label' => __('Overlay Entrance', 'folioblocks'), 'default' => 'default', 'help' => __('Choose how the overlay enters the image.', 'folioblocks'), 'choices' => ['default' => __('Default', 'folioblocks'), 'fade' => __('Fade', 'folioblocks'), 'slide-up' => __('Slide Up', 'folioblocks'), 'slide-down' => __('Slide Down', 'folioblocks'), 'slide-left' => __('Slide Left', 'folioblocks'), 'slide-right' => __('Slide Right', 'folioblocks')], 'group' => 'hover', 'condition' => 'entrance'],
                'overlayContent' => ['label' => __('Overlay Content', 'folioblocks'), 'default' => 'title', 'help' => __('Choose what appears when hovering over images.', 'folioblocks'), 'choices' => ['title' => __('Show Image Title', 'folioblocks'), 'caption' => __('Show Image Caption', 'folioblocks'), 'exif' => __('Show EXIF Data', 'folioblocks'), 'social' => __('Show Social Media', 'folioblocks')], 'group' => 'hover', 'condition' => 'overlay'],
                'hideUnknownExifFields' => ['label' => __('Hide Unknown EXIF Fields', 'folioblocks'), 'default' => false, 'help' => __('Hide EXIF fields that do not have a value.', 'folioblocks'), 'group' => 'hover', 'condition' => 'exif'],
                'overlayBgColor' => ['label' => __('Overlay Background Color', 'folioblocks'), 'default' => '#f9f9f9', 'help' => __('Choose the color for this overlay style.', 'folioblocks'), 'group' => 'hover', 'condition' => 'color', 'color' => true, 'alpha' => true],
                'overlayTextColor' => ['label' => __('Overlay Text Color', 'folioblocks'), 'default' => '#000000', 'help' => __('Choose the color for this overlay style.', 'folioblocks'), 'group' => 'hover', 'condition' => 'overlay-text', 'color' => true],
                'chipOverlayBgColor' => ['label' => __('Chip Background Color', 'folioblocks'), 'default' => '#f9f9f9', 'help' => __('Choose the color for this overlay style.', 'folioblocks'), 'group' => 'hover', 'condition' => 'chip', 'color' => true, 'alpha' => true],
                'chipOverlayTextColor' => ['label' => __('Chip Text Color', 'folioblocks'), 'default' => '#000000', 'help' => __('Choose the color for this overlay style.', 'folioblocks'), 'group' => 'hover', 'condition' => 'chip-text', 'color' => true],
                'overlayBgGradient' => ['label' => __('Overlay Background Gradient', 'folioblocks'), 'default' => '', 'help' => __('Choose the gradient colors, stops, angle, and opacity.', 'folioblocks'), 'group' => 'hover', 'condition' => 'gradient', 'gradient' => true],
                'chipOverlayBgGradient' => ['label' => __('Chip Background Gradient', 'folioblocks'), 'default' => 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(226,232,240,0.82) 100%)', 'help' => __('Choose the gradient colors, stops, angle, and opacity.', 'folioblocks'), 'group' => 'hover', 'condition' => 'chip-gradient', 'gradient' => true],
                'borderColor' => ['label' => __('Border Color', 'folioblocks'), 'default' => '#ffffff', 'help' => __('Set Image border color.', 'folioblocks'), 'group' => 'styles', 'color' => true],
                'borderWidth' => ['label' => __('Border Width (px)', 'folioblocks'), 'default' => 0, 'help' => __('Set Image border width.', 'folioblocks'), 'group' => 'styles', 'min' => 0, 'max' => 15],
                'borderRadius' => ['label' => __('Border Radius (px)', 'folioblocks'), 'default' => 0, 'help' => __('Set Image border radius.', 'folioblocks'), 'group' => 'styles', 'min' => 0, 'max' => 50],
                'shadowStyle' => ['label' => __('Drop Shadow', 'folioblocks'), 'default' => 'none', 'help' => __('Choose a drop shadow style for the image.', 'folioblocks'), 'choices' => ['none' => __('None', 'folioblocks'), 'subtle' => __('Subtle', 'folioblocks'), 'soft' => __('Soft', 'folioblocks'), 'elevated' => __('Elevated', 'folioblocks'), 'dramatic' => __('Dramatic', 'folioblocks')], 'group' => 'styles', 'uiDefault' => true],
            ],
        ],
        'video' => [
            'title' => __('Video Block', 'folioblocks'),
            'icon' => 'pb-video-block.svg',
            'block' => 'folioblocks/pb-video-block',
            'groups' => ['thumbnail' => __('Video Block Settings', 'folioblocks'), 'click' => __('Video Click Settings', 'folioblocks'), 'hover' => __('Video Hover Settings', 'folioblocks'), 'styles' => __('Video Block Styles', 'folioblocks')],
            'fields' => [
                'thumbnailSize' => ['group' => 'thumbnail', 'label' => __('Thumbnail Resolution', 'folioblocks'), 'help' => __('Set thumbnail resolution.', 'folioblocks'), 'default' => 'large', 'choices' => $image_sizes],
                'aspectRatio' => ['group' => 'thumbnail', 'label' => __('Thumbnail aspect ratio', 'folioblocks'), 'help' => __('Set video Thumbnail aspect ratio.', 'folioblocks'), 'default' => '16:9', 'choices' => ['21:9' => __('21:9', 'folioblocks'), '16:9' => __('16:9', 'folioblocks'), '9:16' => __('9:16', 'folioblocks'), '4:3' => __('4:3', 'folioblocks'), '3:2' => __('3:2', 'folioblocks'), '1:1' => __('1:1', 'folioblocks')]],
                'lightboxTheme' => ['group' => 'click', 'label' => __('Lightbox appearance', 'folioblocks'), 'help' => __('Choose the appearance of the video lightbox.', 'folioblocks'), 'default' => 'dark', 'choices' => ['light' => __('Light', 'folioblocks'), 'dark' => __('Dark', 'folioblocks')]],
                'lightboxLayout' => ['group' => 'click', 'label' => __('Lightbox content', 'folioblocks'), 'help' => __('Choose what appears with the Video in the lightbox.', 'folioblocks'), 'default' => 'video-only', 'choices' => ['video-only' => __('Video only', 'folioblocks'), 'split' => __('Video and info', 'folioblocks')]],
                'lightbox' => ['group' => 'click', 'label' => __('Enable Lightbox in Editor', 'folioblocks'), 'help' => __('Allows video to open in a Lightbox while editing.', 'folioblocks'), 'default' => false],
                'overlayStyle' => ['group' => 'hover', 'label' => __('Overlay style', 'folioblocks'), 'help' => __('Choose the visual style of the video overlay.', 'folioblocks'), 'default' => 'default', 'choices' => ['default' => __('Default', 'folioblocks'), 'blur' => __('Blur', 'folioblocks'), 'color' => __('Color', 'folioblocks'), 'gradient' => __('Gradient', 'folioblocks')]],
                'hoverEffect' => ['group' => 'hover', 'label' => __('Hover effect', 'folioblocks'), 'help' => __('Choose an effect for the thumbnail on hover.', 'folioblocks'), 'default' => 'none', 'choices' => ['none' => __('None', 'folioblocks'), 'desaturate' => __('Desaturate', 'folioblocks'), 'glare' => __('Glare', 'folioblocks'), 'lift' => __('Lift', 'folioblocks'), 'pan' => __('Pan', 'folioblocks'), 'pop' => __('Pop', 'folioblocks'), 'tilt' => __('Tilt', 'folioblocks'), 'zoom-in' => __('Zoom In', 'folioblocks'), 'zoom-out' => __('Zoom Out', 'folioblocks')]],
                'overlayEntrance' => ['group' => 'hover', 'label' => __('Overlay entrance', 'folioblocks'), 'help' => __('Choose how the overlay enters the thumbnail.', 'folioblocks'), 'default' => 'default', 'choices' => ['default' => __('Default', 'folioblocks'), 'fade' => __('Fade', 'folioblocks'), 'slide-up' => __('Slide Up', 'folioblocks'), 'slide-down' => __('Slide Down', 'folioblocks'), 'slide-left' => __('Slide Left', 'folioblocks'), 'slide-right' => __('Slide Right', 'folioblocks')]],
                'defaultOverlayContent' => ['group' => 'hover', 'label' => __('Overlay Content', 'folioblocks'), 'help' => __('Choose what appears over the video thumbnail.', 'folioblocks'), 'default' => 'title-play', 'uiDefault' => true, 'choices' => ['none' => __('None', 'folioblocks'), 'play' => __('Play Button', 'folioblocks'), 'title' => __('Video Title', 'folioblocks'), 'title-play' => __('Video Title + Play Button', 'folioblocks')]],
                'alwaysDisplayOverlay' => ['group' => 'hover', 'condition' => 'video-content', 'label' => __('Always Display Overlay', 'folioblocks'), 'help' => __('Display overlay content at all times instead of on hover.', 'folioblocks'), 'default' => false, 'uiDefault' => true],
                'overlayBgColor' => ['condition' => 'video-color', 'group' => 'hover', 'label' => __('Overlay background color', 'folioblocks'), 'help' => __('Set the background color for the overlay.', 'folioblocks'), 'default' => '#f9f9f9', 'color' => true, 'alpha' => true],
                'overlayBgGradient' => ['group' => 'hover', 'condition' => 'video-gradient', 'label' => __('Overlay Background Gradient', 'folioblocks'), 'help' => __('Choose the gradient colors, stops, angle, and opacity.', 'folioblocks'), 'default' => '', 'gradient' => true],
                'overlayTextColor' => ['condition' => 'video-text', 'group' => 'hover', 'label' => __('Overlay text color', 'folioblocks'), 'help' => __('Set the text color for the overlay.', 'folioblocks'), 'default' => '#000000', 'color' => true],
                'borderWidth' => ['group' => 'styles', 'label' => __('Border width (px)', 'folioblocks'), 'help' => __('Set the border width for the thumbnail.', 'folioblocks'), 'default' => 0, 'min' => 0, 'max' => 15],
                'borderRadius' => ['group' => 'styles', 'label' => __('Border radius (px)', 'folioblocks'), 'help' => __('Set the border radius for the thumbnail.', 'folioblocks'), 'default' => 0, 'min' => 0, 'max' => 50],
                'borderColor' => ['group' => 'styles', 'label' => __('Border color', 'folioblocks'), 'help' => __('Set the border color for the thumbnail.', 'folioblocks'), 'default' => '#ffffff', 'color' => true],
                'shadowStyle' => ['label' => __('Drop Shadow', 'folioblocks'), 'default' => 'none', 'help' => __('Choose a drop shadow style for the video thumbnail.', 'folioblocks'), 'choices' => ['none' => __('None', 'folioblocks'), 'subtle' => __('Subtle', 'folioblocks'), 'soft' => __('Soft', 'folioblocks'), 'elevated' => __('Elevated', 'folioblocks'), 'dramatic' => __('Dramatic', 'folioblocks')], 'group' => 'styles', 'uiDefault' => true],
            ],
        ],
        'loupe' => [
            'title' => __('Loupe Block', 'folioblocks'),
            'icon' => 'pb-loupe-block.svg',
            'block' => 'folioblocks/pb-loupe-block',
            'groups' => ['loupe' => __('Loupe Settings', 'folioblocks')],
            'fields' => [
                'magnification' => ['group' => 'loupe', 'label' => __('Magnification', 'folioblocks'), 'help' => __('Set the desired strength of the magnification effect.', 'folioblocks'), 'default' => 10, 'min' => 1, 'max' => 20],
                'loupeShape' => ['group' => 'loupe', 'label' => __('Shape', 'folioblocks'), 'help' => __('Change the shape of the Loupe.', 'folioblocks'), 'default' => 'circle', 'choices' => ['circle' => __('Circle', 'folioblocks'), 'square' => __('Square', 'folioblocks')]],
                'loupeTheme' => ['group' => 'loupe', 'label' => __('Theme', 'folioblocks'), 'help' => __('Change the color of the Loupe frame.', 'folioblocks'), 'default' => 'light', 'choices' => ['light' => __('Light', 'folioblocks'), 'dark' => __('Dark', 'folioblocks')]],
            ],
        ],
    ];
    foreach (['carousel', 'filmstrip'] as $key) { $schemas[$key] = fbks_get_gallery_defaults_schema($key, $schemas['image']); }
    $schemas['modular'] = fbks_get_modular_defaults_schema($schemas['carousel']);
    $schemas['video_gallery'] = fbks_get_video_gallery_defaults_schema($schemas['video']);
    $schemas['grid'] = fbks_get_grid_defaults_schema($schemas['carousel'], $schemas['video_gallery']);
    $schemas['justified'] = fbks_get_justified_defaults_schema($schemas['grid'], $schemas['carousel']);
    $schemas['masonry'] = fbks_get_masonry_defaults_schema($schemas['grid'], $schemas['carousel']);
    // Keep click and hover style sections consistent across the reviewed photo galleries.
    foreach (['grid', 'justified', 'masonry', 'modular'] as $key) {
        $grid = &$schemas[$key];
        foreach (['downloadIconColor', 'downloadIconBgColor', 'linkIconColor', 'linkIconBgColor', 'cartIconColor', 'cartIconBgColor'] as $name) { $grid['fields'][$name]['group'] = 'click_styles'; }
        foreach (['linkIconColor', 'linkIconBgColor'] as $name) { $grid['fields'][$name]['condition'] = 'link-icon-style'; }
        foreach (['overlayBgColor', 'overlayTextColor', 'chipOverlayBgColor', 'chipOverlayTextColor', 'overlayBgGradient', 'chipOverlayBgGradient'] as $name) { $grid['fields'][$name]['group'] = 'hover_styles'; }
        $filter_styles = $grid['groups']['filter_styles'] ?? null;
        unset($grid['groups']['filter_styles']);
        $grid['groups']['click_styles'] = __('Gallery Click Styles', 'folioblocks');
        $grid['groups']['hover_styles'] = __('Gallery Hover Styles', 'folioblocks');
        if (null !== $filter_styles) { $grid['groups']['filter_styles'] = $filter_styles; }
        $grid['group_conditions'] = ($grid['group_conditions'] ?? []) + ['click_styles' => 'click-styles', 'hover_styles' => 'hover-styles'];
        $ordered = [];
        foreach ($grid['groups'] as $group => $label) { foreach ($grid['fields'] as $name => $definition) { if ($group === $definition['group']) { $ordered[$name] = $definition; } } }
        $grid['fields'] = $ordered;
        unset($grid);
    }

    foreach (['video' => __('Video Hover Styles', 'folioblocks'), 'video_gallery' => __('Gallery Hover Styles', 'folioblocks')] as $key => $label) {
        $schema = &$schemas[$key];
        foreach (['overlayBgColor', 'overlayBgGradient', 'overlayTextColor'] as $name) { $schema['fields'][$name]['group'] = 'hover_styles'; }
        $groups = [];
        foreach ($schema['groups'] as $group => $title) {
            $groups[$group] = $title;
            if ('styles' === $group) { $groups['hover_styles'] = $label; }
        }
        $schema['groups'] = $groups;
        $schema['group_conditions'] = ($schema['group_conditions'] ?? []) + ['hover_styles' => 'video-text'];
        $ordered = [];
        foreach ($groups as $group => $title) { foreach ($schema['fields'] as $name => $definition) { if ($group === $definition['group']) { $ordered[$name] = $definition; } } }
        $schema['fields'] = $ordered;
        unset($schema);
    }
    $schemas['image'] = fbks_get_reviewed_image_defaults_schema($schemas['image'], $schemas['carousel']);
    foreach (['image', 'carousel', 'filmstrip', 'grid', 'justified', 'modular', 'masonry'] as $key) {
        $choices = $schemas[$key]['fields']['imageClickAction']['choices'];
        $ordered_choices = [];
        foreach ($choices as $value => $label) {
            if ('woocommerce' === $value) { $ordered_choices['video_lightbox'] = __('Play Video in Lightbox', 'folioblocks'); }
            $ordered_choices[$value] = $label;
        }
        $ordered_choices += ['video_lightbox' => __('Play Video in Lightbox', 'folioblocks')];
        $schemas[$key]['fields']['imageClickAction']['choices'] = $ordered_choices;
        $schemas[$key]['fields']['overlayContent']['choices']['video_play'] = __('Show Video Play Button', 'folioblocks');
        $schemas[$key]['fields']['lightboxZoom']['condition'] = 'lightbox-zoom';
        if ('image' !== $key) {
            $labels = [
                'none' => __('None', 'folioblocks'),
                'lightbox' => __('Open in Lightbox', 'folioblocks'),
                'download' => __('Enable Image Downloads', 'folioblocks'),
                'media_file' => __('Link Image to Media File', 'folioblocks'),
                'custom_url' => __('Link Image to Custom URL', 'folioblocks'),
                'page_post' => __('Link Image to Page/Post', 'folioblocks'),
                'video_lightbox' => __('Play Video in Lightbox', 'folioblocks'),
                'woocommerce' => __('WooCommerce Product', 'folioblocks'),
            ];
            foreach ($schemas[$key]['fields']['imageClickAction']['choices'] as $value => $label) {
                $schemas[$key]['fields']['imageClickAction']['choices'][$value] = $labels[$value] ?? $label;
            }
            $overlay_choices = $schemas[$key]['fields']['overlayContent']['choices'];
            $ordered_overlay = [];
            foreach (['title', 'caption', 'exif', 'video_play', 'product', 'social'] as $value) {
                if (isset($overlay_choices[$value])) { $ordered_overlay[$value] = $overlay_choices[$value]; }
            }
            $schemas[$key]['fields']['overlayContent']['choices'] = $ordered_overlay;
            $fields = $schemas[$key]['fields']; $ordered_fields = [];
            foreach ($fields as $name => $field) {
                if ('lightboxCounter' === $name) { continue; }
                if ('lightboxZoom' === $name) { $ordered_fields['lightboxCounter'] = $fields['lightboxCounter']; }
                $ordered_fields[$name] = $field;
            }
            $schemas[$key]['fields'] = $ordered_fields;
        }


    }
    $schemas['proofing'] = fbks_get_proofing_defaults_schema();
    uasort($schemas, static function($first, $second) { return strnatcasecmp($first['title'], $second['title']); });
    return $schemas;
}

/** Standalone image defaults share gallery conventions without sharing content destinations. */
function fbks_get_reviewed_image_defaults_schema($image, $carousel) {
    $fields = $image['fields'];
    foreach (['imageClickTarget', 'linkIconDisplay', 'downloadDisplay', 'lightbox', 'downloadIconColor', 'downloadIconBgColor', 'linkIconColor', 'linkIconBgColor', 'wooCartIconDisplay', 'cartIconColor', 'cartIconBgColor'] as $name) {
        $fields[$name] = $carousel['fields'][$name];
    }
    unset($fields['downloadOnHover']);
    $fields['downloadDisplay']['condition'] = 'download-icon';
    $fields['lightbox']['help'] = __('Open images in a lightbox when clicked.', 'folioblocks');
    $fields['imageClickAction']['choices'] = [
        'none' => __('None', 'folioblocks'),
        'lightbox' => __('Open in Lightbox', 'folioblocks'),
        'download' => __('Enable Image Downloads', 'folioblocks'),
        'media_file' => __('Link Image to Media File', 'folioblocks'),
        'custom_url' => __('Link Image to Custom URL', 'folioblocks'),
        'page_post' => __('Link Image to Page/Post', 'folioblocks'),
        'video_lightbox' => __('Play Video in Lightbox', 'folioblocks'),
        'woocommerce' => __('WooCommerce Product', 'folioblocks'),
    ];
    $fields['linkIconDisplay']['choices']['none'] = __('None', 'folioblocks');
    $fields['wooLinkAction'] = ['label' => __('Product Link Behavior', 'folioblocks'), 'help' => __('Choose what happens when visitors use the image product link.', 'folioblocks'), 'default' => 'inherit', 'group' => 'click', 'condition' => 'commerce', 'choices' => ['inherit' => __('Default (Add to Cart)', 'folioblocks'), 'add_to_cart' => __('Add to Cart', 'folioblocks'), 'product' => __('Open Product Page', 'folioblocks')]];
    $fields['lightboxContent']['choices']['product'] = __('Show Product Info', 'folioblocks');
    foreach ($fields['lightboxContent']['choices'] as $value => $label) { $fields['lightboxContent']['choices'][$value] = str_replace(' + ', ' & ', $label); }
    $fields['overlayContent']['choices'] = [
        'title' => __('Show Image Title', 'folioblocks'),
        'caption' => __('Show Image Caption', 'folioblocks'),
        'exif' => __('Show EXIF Data', 'folioblocks'),
        'video_play' => __('Show Video Play Button', 'folioblocks'),
        'product' => __('Show Product Info', 'folioblocks'),
        'social' => __('Show Social Media', 'folioblocks'),
    ];
    $fields['wooProductPriceOnHover'] = ['label' => __('Show Product Price', 'folioblocks'), 'help' => __('Show the product price with product information in the overlay.', 'folioblocks'), 'default' => false, 'group' => 'hover', 'condition' => 'product-overlay'];
    foreach (['overlayBgColor', 'overlayTextColor', 'chipOverlayBgColor', 'chipOverlayTextColor', 'overlayBgGradient', 'chipOverlayBgGradient'] as $name) { $fields[$name]['group'] = 'hover_styles'; }
    foreach (['borderWidth', 'borderRadius'] as $name) { $fields[$name]['range'] = true; }
    $first = [];
    foreach (['imageClickAction', 'wooLinkAction', 'imageClickTarget', 'linkIconDisplay', 'downloadDisplay', 'wooCartIconDisplay'] as $name) { $first[$name] = $fields[$name]; }
    $fields = $first + $fields;
    $image['groups']['click_styles'] = __('Image Click Styles', 'folioblocks');
    $image['groups']['hover_styles'] = __('Image Hover Styles', 'folioblocks');
    $image['group_conditions'] = ['click_styles' => 'click-styles', 'hover_styles' => 'hover-styles'];
    $ordered = [];
    foreach ($image['groups'] as $group => $label) { foreach ($fields as $name => $definition) { if ($group === $definition['group']) { $ordered[$name] = $definition; } } }
    $image['fields'] = $ordered;
    return $image;
}

/** Proofing-owned inspector controls only; client credentials and child layout stay local. */
function fbks_get_proofing_defaults_schema() {
    $field = static function($label, $help, $default, $group, $extra = []) {
        return array_merge(['label' => __($label, 'folioblocks'), 'help' => __($help, 'folioblocks'), 'default' => $default, 'group' => $group], $extra);
    };
    $align = ['left' => __('Left', 'folioblocks'), 'center' => __('Center', 'folioblocks'), 'right' => __('Right', 'folioblocks')];
    $palettes = ['__default' => __('Current global palette', 'folioblocks')];
    foreach (fbks_get_media_metadata_palette_presets() as $key => $preset) { $palettes[$key] = $preset['label']; }
    $fields = [
        'galleryStyle' => $field('Gallery Type', 'Choose which gallery block is used for layout. Columns, gap, row height, and resolution are edited on that nested gallery.', 'grid', 'gallery', ['choices' => ['grid' => __('Grid', 'folioblocks'), 'justified' => __('Justified', 'folioblocks'), 'masonry' => __('Masonry', 'folioblocks')]]),
        'filterAlign' => $field('Filter Bar Alignment', 'Set alignment of the proofing filter bar.', 'center', 'gallery', ['choices' => $align]),
        'enableHeart' => $field('Enable Hearts', 'Show Heart icon so clients can mark images they like.', true, 'options'),
        'enableFlag' => $field('Enable Color Flags', 'Show Flag icon so clients can assign a color status to images.', true, 'options'),
        'flagMode' => $field('Flag Mode', 'Choose simple flags or an advanced color palette.', 'simple', 'options', ['radio' => true, 'condition' => 'proofing-flags', 'choices' => ['simple' => __('Simple', 'folioblocks'), 'advanced' => __('Advanced', 'folioblocks')]]),
        'defaultFlagPalette' => $field('Palette', 'Each new gallery keeps a copy of the selected palette.', '__default', 'options', ['condition' => 'proofing-palette', 'choices' => $palettes, 'uiDefault' => true]),
        'enableStars' => $field('Enable Star Ratings', 'Let clients rate images from one to five stars.', false, 'options'),
        'enableComment' => $field('Enable Comments', 'Show Comment icon for image-specific client notes.', true, 'options'),
        'buttonAlign' => $field('Save & Submit Button Alignment', 'Set alignment of the Save & Continue and Submit buttons.', 'right', 'submit', ['choices' => $align]),
        'emailAdminOnSubmit' => $field('Email site admin on Submit', 'Send email to the site admin when the client has submitted the session on the Proofing Gallery.', (bool) (fbks_get_proofing_settings()['emailAdminOnSubmit'] ?? false), 'submit', ['uiDefault' => true]),
        'proofingTheme' => $field('Proofing UI Mode', 'Choose a light or dark appearance for the proofing interface.', 'light', 'appearance', ['choices' => ['light' => __('Light', 'folioblocks'), 'dark' => __('Dark', 'folioblocks')]]),
    ];
    foreach (['saveButtonTextColor' => ['Save Button Text Color', '#3858e9'], 'saveButtonBackgroundColor' => ['Save Button Background', '#ffffff'], 'submitButtonTextColor' => ['Submit Button Text Color', '#ffffff'], 'submitButtonBackgroundColor' => ['Submit Button Background', '#3858e9']] as $name => $settings) {
        $fields[$name] = $field($settings[0], 'Set the colors of the proofing buttons.', $settings[1], 'button_colors', ['color' => true]);
    }
    foreach (['buttonBorderRadius' => ['Border Radius', 2, 0, 40], 'buttonBorderWidth' => ['Border Width', 1, 0, 8], 'buttonPaddingVertical' => ['Vertical Padding', 6, 0, 24], 'buttonPaddingHorizontal' => ['Horizontal Padding', 12, 4, 48], 'buttonFontSize' => ['Font Size', 13, 10, 24], 'buttonGap' => ['Button Gap', 12, 0, 40]] as $name => $settings) {
        $fields[$name] = $field($settings[0] . ' (px)', 'Set the size and spacing of the proofing buttons.', $settings[1], in_array($name, ['buttonBorderRadius', 'buttonBorderWidth'], true) ? 'button_shape' : 'button_spacing', ['min' => $settings[2], 'max' => $settings[3], 'range' => true]);
    }
    return ['title' => __('Proofing Gallery Block', 'folioblocks'), 'block' => 'folioblocks/proofing-gallery-block', 'icon' => 'pb-proofing-gallery.svg', 'groups' => ['gallery' => __('Proofing Gallery Settings', 'folioblocks'), 'options' => __('Proofing Options', 'folioblocks'), 'submit' => __('Proofing Save & Submit Settings', 'folioblocks'), 'appearance' => __('Proofing Appearance', 'folioblocks'), 'button_colors' => __('Save & Submit Button Colors', 'folioblocks'), 'button_shape' => __('Button Shape', 'folioblocks'), 'button_spacing' => __('Button Size & Spacing', 'folioblocks')], 'fields' => $fields];
}

/** Capture palette definitions for each newly inserted Proofing Gallery. */
function fbks_resolve_proofing_block_defaults($values) {
    $selected = $values['defaultFlagPalette'];
    unset($values['defaultFlagPalette']);
    if ('advanced' === $values['flagMode']) {
        $settings = fbks_get_media_metadata_settings();
        $presets = fbks_get_media_metadata_palette_presets();
        $preset = '__default' === $selected ? $settings['palettePreset'] : $selected;
        $items = $preset === $settings['palettePreset'] ? $settings['palette'] : ($presets[$preset]['items'] ?? []);
        $snapshot = ['preset' => $preset, 'name' => $presets[$preset]['label'] ?? $preset, 'items' => []];
        foreach ($items as $key => $item) {
            if (!empty($item['enabled'])) { $snapshot['items'][] = ['value' => 'class-' . $key, 'label' => $item['label'], 'color' => $item['color']]; }
        }
        $values['flagPalette'] = $snapshot;
    }
    return $values;
}

/** Masonry shares Grid's controls and adds responsive image gaps. */
function fbks_get_masonry_defaults_schema($grid, $carousel) {
    $fields = [];
    foreach ($grid['fields'] as $name => $definition) {
        $fields[$name] = $definition;
        if ('mobileColumns' === $name) {
            foreach (['gap', 'tabletGap', 'mobileGap'] as $gap) {
                $fields[$gap] = $carousel['fields'][$gap];
                $fields[$gap]['help'] = __('Set the space between gallery images.', 'folioblocks');
            }
        }
    }
    $grid['title'] = __('Masonry Gallery Block', 'folioblocks');
    $grid['block'] = 'folioblocks/masonry-gallery-block';
    $grid['icon'] = 'pb-masonry-gallery.svg';
    $grid['groups']['gallery'] = __('Masonry Gallery Settings', 'folioblocks');
    $grid['fields'] = $fields;
    return $grid;
}

/** Justified replaces Grid's columns with preferred row heights and responsive gaps. */
function fbks_get_justified_defaults_schema($grid, $carousel) {
    $fields = ['resolution' => $grid['fields']['resolution']];
    foreach (['rowHeight' => ['Desktop', 250], 'tabletRowHeight' => ['Tablet', 250], 'mobileRowHeight' => ['Mobile', 250]] as $name => $settings) {
        $fields[$name] = ['group' => 'gallery', 'label' => sprintf(__('%s Row Height (px)', 'folioblocks'), $settings[0]), 'help' => __('Set the preferred row height. Rows adjust as needed to fill the gallery width.', 'folioblocks'), 'default' => $settings[1], 'min' => 100, 'max' => 1500, 'range' => true, 'uiDefault' => 'rowHeight' !== $name];
    }
    foreach (['gap', 'tabletGap', 'mobileGap'] as $name) { $fields[$name] = $carousel['fields'][$name]; $fields[$name]['help'] = __('Set the space between gallery images.', 'folioblocks'); }
    $fields['randomizeOrder'] = $grid['fields']['randomizeOrder'];
    foreach ($grid['fields'] as $name => $definition) { if ('gallery' !== $definition['group']) { $fields[$name] = $definition; } }
    $grid['title'] = __('Justified Gallery Block', 'folioblocks');
    $grid['block'] = 'folioblocks/justified-gallery-block';
    $grid['icon'] = 'pb-justified-gallery.svg';
    $grid['groups']['gallery'] = __('Justified Gallery Settings', 'folioblocks');
    $grid['fields'] = $fields;
    return $grid;
}

/** Grid's inspector combines responsive columns with the shared photo-gallery controls. */
function fbks_get_grid_defaults_schema($carousel, $video_gallery) {
    $fields = ['resolution' => $carousel['fields']['resolution']];
    foreach (['columns' => ['Desktop', 6], 'tabletColumns' => ['Tablet', 4], 'mobileColumns' => ['Mobile', 2]] as $name => $settings) {
        $fields[$name] = ['group' => 'gallery', 'label' => sprintf(__('%s Columns', 'folioblocks'), $settings[0]), 'help' => __('Set the number of columns for this screen size.', 'folioblocks'), 'default' => $settings[1], 'min' => 1, 'max' => 8, 'range' => true];
    }
    $fields['randomizeOrder'] = ['group' => 'gallery', 'label' => __('Randomize Image Order', 'folioblocks'), 'help' => __('Display gallery images in random order.', 'folioblocks'), 'default' => false];
    foreach ($carousel['fields'] as $name => $definition) {
        // Carousel's style sections remain in the original groups for galleries awaiting review.
        if ('click_styles' === $definition['group']) { $definition['group'] = 'click'; }
        if ('hover_styles' === $definition['group']) { $definition['group'] = 'hover'; }
        if ('link-icon-style' === ($definition['condition'] ?? '')) { $definition['condition'] = 'link-icon'; }
        if (in_array($definition['group'], ['click', 'hover', 'styles'], true)) { $fields[$name] = $definition; }
    }
    foreach ($video_gallery['fields'] as $name => $definition) {
        if (in_array($definition['group'], ['filter', 'filter_styles'], true)) { $fields[$name] = $definition; }
    }
    $fields['enableFilter']['label'] = __('Enable Gallery Filtering', 'folioblocks');
    $fields['enableFilter']['help'] = __('Enable image filtering with categories.', 'folioblocks');
    $groups = ['gallery' => __('Grid Gallery Settings', 'folioblocks'), 'click' => __('Gallery Click Settings', 'folioblocks'), 'hover' => __('Gallery Hover Settings', 'folioblocks'), 'filter' => __('Gallery Filtering Settings', 'folioblocks'), 'styles' => __('Gallery Image Styles', 'folioblocks'), 'filter_styles' => __('Gallery Filtering Styles', 'folioblocks')];
    $ordered = [];
    foreach ($groups as $group => $label) { foreach ($fields as $name => $definition) { if ($group === $definition['group']) { $ordered[$name] = $definition; } } }
    return ['title' => __('Grid Gallery Block', 'folioblocks'), 'block' => 'folioblocks/grid-gallery-block', 'icon' => 'pb-grid-gallery.svg', 'groups' => $groups, 'group_conditions' => ['filter_styles' => 'filter'], 'fields' => $ordered];
}

/** Modular uses rows/stacks for content; only gallery-wide controls belong in defaults. */
function fbks_get_modular_defaults_schema($carousel) {
    $fields = [];
    $fields['resolution'] = $carousel['fields']['resolution'];
    $fields['resolution']['label'] = __('Image Resolution', 'folioblocks');
    $fields['collapseOnMobile'] = ['group' => 'gallery', 'label' => __('Collapse layout on Mobile', 'folioblocks'), 'help' => __('Stack all images vertically on mobile devices.', 'folioblocks'), 'default' => false];
    foreach (['gap', 'tabletGap', 'mobileGap'] as $name) {
        $fields[$name] = $carousel['fields'][$name];
        $fields[$name]['help'] = __('Set the space between gallery images.', 'folioblocks');
    }
    foreach ($carousel['fields'] as $name => $definition) {
        // Carousel's style sections remain in the original groups for galleries awaiting review.
        if ('click_styles' === $definition['group']) { $definition['group'] = 'click'; }
        if ('hover_styles' === $definition['group']) { $definition['group'] = 'hover'; }
        if ('link-icon-style' === ($definition['condition'] ?? '')) { $definition['condition'] = 'link-icon'; }
        if (in_array($definition['group'], ['click', 'hover', 'styles'], true)) { $fields[$name] = $definition; }
    }
    return ['title' => __('Modular Gallery Block', 'folioblocks'), 'block' => 'folioblocks/modular-gallery-block', 'icon' => 'pb-modular-gallery.svg', 'groups' => ['gallery' => __('General Gallery Settings', 'folioblocks'), 'click' => __('Gallery Click Settings', 'folioblocks'), 'hover' => __('Gallery Hover Settings', 'folioblocks'), 'styles' => __('Gallery Image Styles', 'folioblocks')], 'fields' => $fields];
}

/** Video gallery inspector: responsive layout plus the shared video click/hover controls. */
function fbks_get_video_gallery_defaults_schema($video) {
    $field = static function($label, $help, $default, $extra = []) {
        return array_merge(['label' => __($label, 'folioblocks'), 'help' => __($help, 'folioblocks'), 'default' => $default, 'group' => 'gallery'], $extra);
    };
    $fields = [];
    foreach (['columns' => ['Desktop', 3], 'tabletColumns' => ['Tablet', 2], 'mobileColumns' => ['Mobile', 1]] as $name => $settings) {
        $fields[$name] = $field($settings[0] . ' Columns', 'Set the number of columns for this screen size.', $settings[1], ['min' => 1, 'max' => 8, 'range' => true]);
    }
    foreach (['gap' => 'Desktop', 'tabletGap' => 'Tablet', 'mobileGap' => 'Mobile'] as $name => $device) {
        $fields[$name] = $field($device . ' Gap Between Items (px)', 'Set the space between video thumbnails.', 10, ['min' => 0, 'max' => 50, 'range' => true, 'uiDefault' => 'gap' !== $name]);
    }
    $sizes = [];
    foreach (get_intermediate_image_sizes() as $size) { $sizes[$size] = ucwords(str_replace(['-', '_'], ' ', $size)); }
    $sizes['full'] = __('Full Size', 'folioblocks');
    $fields['thumbnailSize'] = $field('Thumbnail Resolution', 'Set thumbnail resolution.', 'large', ['choices' => $sizes]);
    foreach ($video['fields'] as $name => $definition) {
        if ('thumbnailSize' === $name) { continue; }
        if ('aspectRatio' === $name) { $definition['group'] = 'gallery'; }
        $fields[$name] = $definition;
    }
    $fields['lightboxLayout']['choices']['video-product'] = __('Video + Product Info', 'folioblocks');
    $fields['enableFilter'] = $field('Enable Video Filtering', 'Enable video filtering with categories.', false, ['group' => 'filter']);
    $fields['filterAlign'] = $field('Filter Bar Alignment', 'Set alignment of the filter bar.', 'center', ['group' => 'filter', 'condition' => 'filter', 'choices' => ['left' => __('Left', 'folioblocks'), 'center' => __('Center', 'folioblocks'), 'right' => __('Right', 'folioblocks')]]);
    $fields['defaultOverlayContent']['choices']['title-play-category'] = __('Video Title + Play Button + Filtering Category', 'folioblocks');
    foreach (['filterTextColor' => ['Filter Text Color', '#000000'], 'filterBgColor' => ['Filter Background Color', 'transparent'], 'activeFilterTextColor' => ['Active Filter Text Color', '#ffffff'], 'activeFilterBgColor' => ['Active Filter Background Color', '#000000']] as $name => $settings) {
        $fields[$name] = $field($settings[0], 'Set colors for the gallery filter bar.', $settings[1], ['group' => 'filter_styles', 'condition' => 'filter', 'color' => true, 'alpha' => true]);
    }
    $fields['enableWooCommerce'] = $field('Enable WooCommerce Integration', 'Link gallery videos to WooCommerce products.', false, ['group' => 'commerce', 'condition' => 'woocommerce']);
    $fields['wooCartIconDisplay'] = $field('Display Add to Cart Icon', 'Choose when to display the Add to Cart icon.', 'hover', ['group' => 'commerce', 'condition' => 'commerce', 'choices' => ['hover' => __('On Hover', 'folioblocks'), 'always' => __('Always', 'folioblocks')]]);
    $fields['wooDefaultLinkAction'] = $field('Default Add To Cart Icon Behavior', 'Sets the default action for Add To Cart icons in this gallery. Individual videos can override this setting.', 'add_to_cart', ['group' => 'commerce', 'condition' => 'commerce', 'choices' => ['add_to_cart' => __('Add to Cart', 'folioblocks'), 'product' => __('Open Product Page', 'folioblocks')]]);
    foreach (['cartIconColor' => ['Add to Cart Icon Color', '#000000'], 'cartIconBgColor' => ['Add to Cart Icon Background', '#ffffff']] as $name => $settings) {
        $fields[$name] = $field($settings[0], 'Set the colors of the Add to Cart icon.', $settings[1], ['group' => 'commerce_styles', 'condition' => 'commerce', 'color' => true]);
    }
    $groups = ['gallery' => __('Video Gallery Settings', 'folioblocks'), 'click' => __('Gallery Click Settings', 'folioblocks'), 'hover' => __('Gallery Hover Settings', 'folioblocks'), 'filter' => __('Gallery Filtering Settings', 'folioblocks'), 'commerce' => __('E-Commerce Settings', 'folioblocks'), 'styles' => __('Video Thumbnail Styles', 'folioblocks'), 'filter_styles' => __('Gallery Filtering Styles', 'folioblocks'), 'commerce_styles' => __('E-Commerce Styles', 'folioblocks')];
    $ordered = [];
    foreach ($groups as $group => $label) { foreach ($fields as $name => $definition) { if ($group === $definition['group']) { $ordered[$name] = $definition; } } }
    return ['title' => __('Video Gallery Block', 'folioblocks'), 'icon' => 'pb-video-gallery.svg', 'block' => 'folioblocks/video-gallery-block', 'groups' => $groups, 'group_conditions' => ['commerce' => 'woocommerce', 'filter_styles' => 'filter', 'commerce_styles' => 'commerce'], 'fields' => $ordered];
}

/** Shared inspector controls, with gallery-specific playback and layout sections. */
function fbks_get_gallery_defaults_schema($key, $image) {
    $carousel = 'carousel' === $key;
    $field = static function($label, $help, $default, $extra = []) {
        return array_merge(['label' => __($label, 'folioblocks'), 'help' => __($help, 'folioblocks'), 'default' => $default, 'group' => 'gallery'], $extra);
    };
    $sizes = [];
    foreach (get_intermediate_image_sizes() as $size) { $sizes[$size] = ucwords(str_replace(['-', '_'], ' ', $size)); }
    $sizes['full'] = __('Full Size', 'folioblocks');
    $fields = ['resolution' => $field($carousel ? 'Resolution' : 'Main Image Resolution', $carousel ? 'Select the size of the source image.' : 'Select the size of the main gallery image.', 'large', ['choices' => $sizes])];
    if ($carousel) {
        $fields['mobileOrientation'] = $field('Image Orientation (Mobile)', 'Affects layout on mobile only. Switch ONLY when all images are vertical in orientation.', 'horizontal', ['uiDefault' => true, 'choices' => ['horizontal' => __('Horizontal Images', 'folioblocks'), 'vertical' => __('Vertical Images', 'folioblocks')]]);
        foreach (['gap' => 'Desktop', 'tabletGap' => 'Tablet', 'mobileGap' => 'Mobile'] as $name => $device) {
            $fields[$name] = $field($device . ' Gap Between Items (px)', 'Set the spacing between gallery items for this screen size.', 10, ['min' => 0, 'max' => 50, 'range' => true]);
        }
    }
    $fields['autoplay'] = $field('Enable Autoplay', $carousel ? 'Automatically advance to the next image in the carousel.' : 'Automatically advance to the next image in the gallery.', false);
    $fields['autoplaySpeed'] = $field('Autoplay Speed (seconds)', $carousel ? 'Time between automatic slide transitions.' : 'Time between automatic image transitions.', 3, ['min' => 1, 'max' => 5, 'step' => 0.25, 'range' => true, 'condition' => 'autoplay']);
    if ($carousel) {
        $fields['loopSlides'] = $field('Loop Carousel Slides', 'Return to the first slide after reaching the end.', false);
        $fields['showControls'] = $field('Enable Carousel Controls', 'Toggle visibility of navigation arrows.', false);
        $fields['controlsAlignment'] = $field('Controls Alignment', 'Set the horizontal alignment of carousel controls.', 'center', ['condition' => 'controls', 'choices' => ['left' => __('Left', 'folioblocks'), 'center' => __('Center', 'folioblocks'), 'right' => __('Right', 'folioblocks')]]);
    } else {
        $fields['pauseOnHover'] = $field('Pause on Hover', 'Pause autoplay while hovering over the main image.', false, ['condition' => 'autoplay']);
        $fields['filmstripPosition'] = $field('Thumbnail Position', 'Choose where the thumbnail strip appears.', 'bottom', ['choices' => ['bottom' => __('Bottom', 'folioblocks'), 'left' => __('Left', 'folioblocks'), 'right' => __('Right', 'folioblocks')]]);
        $fields['enableFullscreen'] = $field('Enable Full-Screen Mode', 'Enable Full-Screen Mode for the gallery on the frontend.', false);
        $fields['randomizeOrder'] = $field('Randomize Image Order', 'Display gallery images in random order.', false);
    }
    // These controls use the shared gallery inspector components reviewed in edit.js/premium.js.
    foreach ($image['fields'] as $name => $definition) {
        if (in_array($definition['group'], ['styles', 'image'], true) || 'enableLightbox' === $name) { continue; }
        $fields[$name] = $definition;
    }
    unset($fields['imageClickAction']['choices']['media_file']);
    $fields['imageClickAction']['help'] = __('Choose what happens when visitors click gallery images.', 'folioblocks');
    $fields['lightboxTheme']['uiDefault'] = false;
    $fields['lightboxContent']['choices']['social'] = __('Show Social Media', 'folioblocks');
    $fields['lightboxCounter'] = $field('Show Image Counter', 'Show the current image number and total image count in gallery lightboxes.', false, ['group' => 'click', 'condition' => 'lightbox']);
    $fields['downloadDisplay'] = $field('Display Image Download Icon', 'Set display preference for Image Download icon.', 'hover', ['group' => 'click', 'condition' => 'download', 'uiDefault' => true, 'choices' => ['hover' => __('On Hover', 'folioblocks'), 'always' => __('Always', 'folioblocks')]]);
    unset($fields['downloadOnHover']);
    $fields['lightbox']['label'] = __('Enable Lightbox', 'folioblocks');
    $fields['lightbox']['condition'] = 'secondary-lightbox';
    foreach (['downloadIconColor', 'downloadIconBgColor'] as $name) {
        $fields[$name]['condition'] = 'download';
        if (!$carousel) { $fields[$name]['uiDefault'] = true; }
    }
    foreach (['linkIconColor' => ['Link Target Icon Color', '#000000'], 'linkIconBgColor' => ['Link Target Icon Background', '#f9f9f9']] as $name => $settings) {
        $fields[$name] = $field($settings[0], 'Set the color of the link target icon.', $settings[1], ['group' => 'click', 'condition' => 'link-icon', 'color' => true, 'uiDefault' => !$carousel]);
    }
    if ($carousel) {
        foreach ($image['fields'] as $name => $definition) { if ('styles' === $definition['group']) { $fields[$name] = $definition; } }
        $fields['controlsBackgroundColor'] = $field('Playback Control Background', 'Set the background color of carousel playback controls.', 'rgba(0, 0, 0, 0.5)', ['group' => 'controls', 'condition' => 'controls', 'color' => true, 'alpha' => true]);
        $fields['controlsIconColor'] = $field('Playback Control Icon Color', 'Set the icon color of carousel playback controls.', '#ffffff', ['group' => 'controls', 'condition' => 'controls', 'color' => true]);
    } else {
        $fields['colorMode'] = $field('Color Mode', 'Switch between light and dark editor themes.', 'light', ['group' => 'styles', 'choices' => ['light' => __('Light', 'folioblocks'), 'dark' => __('Dark', 'folioblocks')]]);
    }
    $fields['imageClickAction']['choices']['woocommerce'] = __('WooCommerce Product', 'folioblocks');
    $fields['wooDefaultLinkAction'] = $field('Default Product Link Behavior', 'Individual images can override this product action.', 'add_to_cart', ['group' => 'click', 'condition' => 'commerce', 'choices' => ['add_to_cart' => __('Add to Cart', 'folioblocks'), 'product' => __('Open Product Page', 'folioblocks')]]);
    $fields['wooCartIconDisplay'] = $field('Display Add to Cart Icon', 'Choose when to display the Add to Cart icon.', 'hover', ['group' => 'click', 'condition' => 'commerce', 'choices' => ['none' => __('None', 'folioblocks'), 'hover' => __('On Hover', 'folioblocks'), 'always' => __('Always', 'folioblocks')]]);
    foreach (['cartIconColor' => ['Cart Icon Color', '#000000'], 'cartIconBgColor' => ['Cart Icon Background', '#f9f9f9']] as $name => $settings) {
        $fields[$name] = $field($settings[0], 'Set the color of the cart icon.', $settings[1], ['group' => 'click_styles', 'condition' => 'cart-icon', 'color' => true, 'uiDefault' => !$carousel]);
    }
    foreach (['downloadIconColor', 'downloadIconBgColor', 'linkIconColor', 'linkIconBgColor'] as $name) { $fields[$name]['group'] = 'click_styles'; }
    $fields['linkIconColor']['condition'] = $fields['linkIconBgColor']['condition'] = 'link-icon-style';
    foreach (['overlayBgColor', 'overlayTextColor', 'chipOverlayBgColor', 'chipOverlayTextColor', 'overlayBgGradient', 'chipOverlayBgGradient'] as $name) { $fields[$name]['group'] = 'hover_styles'; }
    $fields['lightboxContent']['choices']['product'] = __('Show Product Info', 'folioblocks');
    // Place the action-specific icon display immediately after Link Target.
    $first = [];
    foreach (['imageClickAction', 'wooDefaultLinkAction', 'imageClickTarget', 'linkIconDisplay', 'downloadDisplay', 'wooCartIconDisplay'] as $name) { $first[$name] = $fields[$name]; }
    $fields = $first + $fields;
    // Keep each feature section contiguous, including controls inserted above.
    $groups = ['gallery' => $carousel ? __('Carousel Gallery Settings', 'folioblocks') : __('Filmstrip Gallery Settings', 'folioblocks'), 'click' => __('Gallery Click Settings', 'folioblocks'), 'hover' => __('Gallery Hover Settings', 'folioblocks'), 'styles' => $carousel ? __('Gallery Image Styles', 'folioblocks') : __('Gallery Styles', 'folioblocks'), 'controls' => __('Carousel Control Styles', 'folioblocks')];
    $controls = $groups['controls']; unset($groups['controls']);
    $groups['click_styles'] = __('Gallery Click Styles', 'folioblocks');
    $groups['hover_styles'] = __('Gallery Hover Styles', 'folioblocks');
    $groups['controls'] = $controls;
    $ordered = [];
    foreach ($groups as $group => $label) { foreach ($fields as $name => $definition) { if ($group === $definition['group']) { $ordered[$name] = $definition; } } }
    return ['title' => $carousel ? __('Carousel Gallery Block', 'folioblocks') : __('Filmstrip Gallery Block', 'folioblocks'), 'icon' => $carousel ? 'pb-carousel-gallery.svg' : 'pb-filmstrip-gallery.svg', 'block' => 'folioblocks/' . $key . '-gallery-block', 'groups' => $groups, 'group_conditions' => ['click_styles' => 'click-styles', 'hover_styles' => 'hover-styles'], 'fields' => $ordered];
}

function fbks_resolve_gallery_block_defaults($key, $values) {
    $carousel = 'carousel' === $key;
    $has_image_styles = in_array($key, ['carousel', 'modular', 'grid', 'justified', 'masonry'], true);
    $values['downloadOnHover'] = 'hover' === $values['downloadDisplay'];
    unset($values['downloadDisplay']);
    if ($carousel) { $values['verticalOnMobile'] = 'vertical' === $values['mobileOrientation']; unset($values['mobileOrientation']); }
    if (!$has_image_styles) { $values['shadowStyle'] = 'none'; }
    $secondary_lightbox = ($has_image_styles || 'filmstrip' === $key) && in_array($values['imageClickAction'], ['custom_url', 'page_post'], true) && 'icon' === $values['imageClickTarget'] && $values['lightbox'];
    $secondary_commerce_lightbox = $values['lightbox'];
    $values = fbks_resolve_image_block_defaults($values);
    $values['lightbox'] = $values['lightbox'] || $secondary_lightbox;
    if (in_array($key, ['carousel', 'filmstrip', 'grid', 'justified', 'masonry', 'modular'], true)) {
        $commerce = 'woocommerce' === $values['imageClickAction'];
        $values['enableWooCommerce'] = $commerce;
        if ($commerce) {
            $values['lightbox'] = 'icon' === $values['imageClickTarget'] && $secondary_commerce_lightbox;
            if ('thumbnail' === $values['imageClickTarget']) { $values['wooCartIconDisplay'] = 'none'; }
        }
        $values['wooLightboxInfoType'] = 'product' === $values['lightboxContent'] ? 'product' : 'caption';
    }
    $values['onHoverTitle'] = $values['showTitleOnHover'];
    $values['lightboxCaption'] = 'none' !== $values['lightboxContent'];
    unset($values['enableLightbox'], $values['showTitleOnHover']);
    if (!$has_image_styles) { unset($values['shadowStyle'], $values['dropShadow']); }
    if (in_array($key, ['modular', 'justified', 'masonry'], true)) { $values['noGap'] = false; }
    return $values;
}

/** Accept only gradient functions containing colors, positions, and angles. */
function fbks_sanitize_block_default_gradient($value, $fallback = '') {
    if (!is_string($value)) { return $fallback; }
    if ('' === $value) { return ''; }
    if (!preg_match('/^(linear|radial)-gradient\(.+\)$/i', $value) || preg_match('/[^a-z0-9#.,%()\s+-]/i', $value)) { return $fallback; }
    $tokens = preg_replace('/#[a-f0-9]{3,8}\b/i', '', $value);
    $tokens = preg_replace('/(?:linear-gradient|radial-gradient|rgba?|deg|circle|ellipse|at|center|left|right|top|bottom|closest-side|farthest-side|closest-corner|farthest-corner|transparent)\b/i', '', $tokens);
    if (preg_match('/[a-z]/i', $tokens)) { return $fallback; }
    return $value;
}

function fbks_resolve_image_block_defaults($values) {
    if (isset($values['downloadDisplay'])) { $values['downloadOnHover'] = 'hover' === $values['downloadDisplay']; unset($values['downloadDisplay']); }
    $action = $values['imageClickAction'];
    $video_lightbox = 'video_lightbox' === $action;
    if ($video_lightbox) { $values['lightboxZoom'] = false; if ('none' === $values['linkIconDisplay']) { $values['linkIconDisplay'] = 'hover'; } }
    $lightbox = $video_lightbox || 'lightbox' === $action || (in_array($action, ['download', 'custom_url', 'page_post', 'woocommerce'], true) && 'icon' === $values['imageClickTarget'] && $values['lightbox']);
    $values['lightbox'] = $lightbox;
    $values['enableLightbox'] = $lightbox;
    $values['enableDownload'] = 'download' === $action;
    $values['enableWooCommerce'] = 'woocommerce' === $action;
    if ('woocommerce' === $action && 'thumbnail' === $values['imageClickTarget']) { $values['wooCartIconDisplay'] = 'none'; }
    if (isset($values['wooLinkAction'])) {
        $values['wooLightboxInfoType'] = 'product' === $values['lightboxContent'] ? 'product' : 'caption';
        $values['wooProductPriceOnHover'] = $values['wooProductPriceOnHover'] && 'product' === $values['overlayContent'] && 'none' !== $values['onHoverStyle'] && $values['enableWooCommerce'];
    }
    $values['showTitleOnHover'] = 'none' !== $values['onHoverStyle'];
    if (!$values['showTitleOnHover']) { $values['onHoverStyle'] = 'blur-overlay'; }
    $values['dropShadow'] = 'none' !== $values['shadowStyle'];
    if (in_array($action, ['custom_url', 'page_post'], true) && 'thumbnail' === $values['imageClickTarget']) { $values['linkIconDisplay'] = 'none'; }
    if (in_array($values['onHoverStyle'], ['gradient-overlay', 'chip-gradient'], true)) {
        $key = 'chip-gradient' === $values['onHoverStyle'] ? 'chipOverlayBgGradient' : 'overlayBgGradient';
        if ('' === $values[$key]) { $values[$key] = 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(226,232,240,0.82) 100%)'; }
    }
    return $values;
}

/** Match the editor's combined overlay content and visibility controls. */
function fbks_resolve_video_block_defaults($values) {
    $content = $values['defaultOverlayContent'];
    $visibility = $values['alwaysDisplayOverlay'] ? 'always' : 'onHover';
    $values['titleVisibility'] = in_array($content, ['title', 'title-play'], true) ? $visibility : 'hidden';
    $values['playButtonVisibility'] = in_array($content, ['play', 'title-play'], true) ? $visibility : 'hidden';
    $values['showFilterCategory'] = !empty($values['enableFilter']) && 'title-play-category' === $content;
    if ('title-play-category' === $content) { $values['titleVisibility'] = $visibility; $values['playButtonVisibility'] = $visibility; }
    $values['dropShadow'] = 'none' !== $values['shadowStyle'];
    if ('gradient' === $values['overlayStyle'] && '' === $values['overlayBgGradient']) {
        $values['overlayBgGradient'] = 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(226,232,240,0.82) 100%)';
    }
    unset($values['defaultOverlayContent'], $values['alwaysDisplayOverlay']);
    return $values;
}

function fbks_sanitize_block_default_color($value, $fallback) {
    if (!is_string($value)) { return $fallback; }
    $value = trim($value);
    if ('transparent' === $value) { return $value; }
    if (sanitize_hex_color($value)) { return $value; }
    if (!preg_match('/^(rgb|rgba)\(([^)]+)\)$/i', $value, $match)) { return $fallback; }
    $parts = array_map('trim', explode(',', $match[2]));
    if (count($parts) !== ('rgba' === strtolower($match[1]) ? 4 : 3)) { return $fallback; }
    foreach ($parts as $index => $part) {
        if (!preg_match('/^\d*\.?\d+$/', $part) || (float) $part < 0 || (float) $part > ($index < 3 ? 255 : 1)) { return $fallback; }
    }
    return strtolower($match[1]) . '(' . implode(', ', $parts) . ')';
}

function fbks_sanitize_block_defaults($key, $raw) {
    $schema = fbks_get_block_defaults_schema()[$key] ?? null;
    if (!$schema) { return []; }
    $raw = is_array($raw) ? $raw : [];
    if ('justified' === $key) {
        foreach (['tabletRowHeight', 'mobileRowHeight'] as $name) {
            if (!isset($raw[$name]) || '' === $raw[$name]) { $raw[$name] = $raw['rowHeight'] ?? 250; }
        }
    }
    if (in_array($key, ['video', 'video_gallery'], true)) {
        if (!isset($raw['defaultOverlayContent'])) {
            $title = 'hidden' !== ($raw['titleVisibility'] ?? 'onHover');
            $play = 'hidden' !== ($raw['playButtonVisibility'] ?? 'onHover');
            $raw['defaultOverlayContent'] = $title ? ($play ? 'title-play' : 'title') : ($play ? 'play' : 'none');
            $raw['alwaysDisplayOverlay'] = 'always' === ($raw['titleVisibility'] ?? '') || 'always' === ($raw['playButtonVisibility'] ?? '');
        }
        if (!isset($raw['shadowStyle']) && !empty($raw['dropShadow'])) { $raw['shadowStyle'] = 'soft'; }
    }
    if ('image' === $key) {
        if (!isset($raw['downloadDisplay']) && isset($raw['downloadOnHover'])) { $raw['downloadDisplay'] = in_array($raw['downloadOnHover'], [true, 1, '1', 'true'], true) ? 'hover' : 'always'; }
        if (!isset($raw['imageClickAction'])) { $raw['imageClickAction'] = !empty($raw['enableLightbox']) ? 'lightbox' : 'none'; }
        if (isset($raw['showTitleOnHover']) && empty($raw['showTitleOnHover'])) { $raw['onHoverStyle'] = 'none'; }
        if (!isset($raw['shadowStyle']) && !empty($raw['dropShadow'])) { $raw['shadowStyle'] = 'soft'; }
        if ('inherit' === ($raw['lightboxTheme'] ?? '')) { $raw['lightboxTheme'] = 'dark'; }
        if ('' === ($raw['lightboxContent'] ?? null)) { $raw['lightboxContent'] = 'none'; }
    }
    $result = [];
    foreach ($schema['fields'] as $name => $field) {
        $value = $raw[$name] ?? $field['default'];
        if (isset($field['choices'])) {
            $value = is_string($value) && isset($field['choices'][$value]) ? $value : $field['default'];
        } elseif (is_bool($field['default'])) {
            $value = in_array($value, [true, 1, '1', 'true'], true);
        } elseif (isset($field['min'])) {
            $value = is_numeric($value) ? max($field['min'], min($field['max'], (isset($field['step']) && $field['step'] < 1 ? (float) $value : (int) $value))) : $field['default'];
        } elseif (!empty($field['gradient'])) {
            $value = fbks_sanitize_block_default_gradient($value, $field['default']);
        } elseif (!empty($field['color'])) {
            $value = fbks_sanitize_block_default_color($value, $field['default']);
        }
        $result[$name] = $value;
    }
    if (in_array($key, ['image', 'carousel', 'filmstrip', 'grid', 'justified', 'modular', 'masonry'], true) && 'video_lightbox' !== $result['imageClickAction'] && 'video_play' === $result['overlayContent']) { $result['overlayContent'] = 'title'; }
    if ('video_gallery' === $key && !$result['enableFilter'] && 'title-play-category' === $result['defaultOverlayContent']) { $result['defaultOverlayContent'] = 'title-play'; }
    if ('before_after' === $key) {
        $allowed = 'vertical' === $result['sliderOrientation'] ? ['left', 'center', 'right'] : ['top', 'center', 'bottom'];
        if (!in_array($result['labelPosition'], $allowed, true)) { $result['labelPosition'] = 'center'; }
    }
    return $result;
}

function fbks_get_block_defaults() {
    $saved = get_option('fbks_block_defaults', []);
    $result = [];
    foreach (fbks_get_block_defaults_schema() as $key => $schema) {
        if ('proofing' === $key && !fbks_can_use_proofing_sessions()) { continue; }
        $values = fbks_sanitize_block_defaults($key, $saved[$key] ?? []);
        $result[$schema['block']] = 'proofing' === $key ? fbks_resolve_proofing_block_defaults($values) : ('image' === $key ? fbks_resolve_image_block_defaults($values) : (in_array($key, ['video', 'video_gallery'], true) ? fbks_resolve_video_block_defaults($values) : (in_array($key, ['carousel', 'filmstrip', 'modular', 'grid', 'justified', 'masonry'], true) ? fbks_resolve_gallery_block_defaults($key, $values) : $values)));
    }
    return $result;
}

function fbks_save_block_defaults($key, $raw) {
    $saved = get_option('fbks_block_defaults', []);
    $saved = is_array($saved) ? $saved : [];
    $saved[$key] = fbks_sanitize_block_defaults($key, $raw);
    update_option('fbks_block_defaults', $saved);
}

/** Compare effective settings, including equivalent hex/RGB color representations. */
function fbks_get_block_default_changes($key, $raw) {
    $values = fbks_sanitize_block_defaults($key, $raw);
    $defaults = fbks_sanitize_block_defaults($key, []);
    $schema = fbks_get_block_defaults_schema()[$key] ?? [];
    $normalize_color = static function($value) {
        if ('transparent' === $value) { return '[0,0,0,0]'; }
        if (preg_match('/^#([a-f0-9]{3}|[a-f0-9]{6})$/i', $value, $match)) {
            $hex = $match[1];
            if (3 === strlen($hex)) { $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2]; }
            return wp_json_encode([hexdec(substr($hex, 0, 2)), hexdec(substr($hex, 2, 2)), hexdec(substr($hex, 4, 2)), 1]);
        }
        if (preg_match('/^rgba?\(([^)]+)\)$/i', $value, $match)) {
            $parts = array_map('floatval', explode(',', $match[1]));
            if (3 === count($parts)) { $parts[] = 1; }
            if (0.0 === $parts[3]) { $parts = [0, 0, 0, 0]; }
            return wp_json_encode($parts);
        }
        return $value;
    };
    $changes = [];
    foreach ($values as $name => $value) {
        if (!empty($schema['fields'][$name]['color'])) {
            if ($normalize_color($value) !== $normalize_color($defaults[$name])) { $changes[$name] = $value; }
        } elseif ($value !== $defaults[$name]) { $changes[$name] = $value; }
    }
    return $changes;
}

function fbks_block_defaults_are_customized($key, $raw) {
    return !empty(fbks_get_block_default_changes($key, $raw));
}

function fbks_render_block_defaults_panels() {
    $saved = get_option('fbks_block_defaults', []);
    foreach (fbks_get_block_defaults_schema() as $key => $schema) {
        if ('proofing' === $key && !fbks_can_use_proofing_sessions()) { continue; }
        $values = fbks_sanitize_block_defaults($key, $saved[$key] ?? []);
        ?>
        <details class="fbks-dashboard-box fbks-global-settings-panel fbks-block-default-panel" data-settings-section="block_<?php echo esc_attr($key); ?>">
            <summary class="fbks-global-settings-panel__summary"><span class="fbks-global-settings-panel__heading"><span class="fbks-block-default-icon" aria-hidden="true"><img src="<?php echo esc_url(FBKS_PLUGIN_URL . 'includes/icons/' . $schema['icon']); ?>" alt="" /></span><span class="fbks-block-default-title-group"><span class="fbks-global-settings-panel__title"><?php echo esc_html($schema['title']); ?></span><span class="fbks-block-default-customized" data-block-default-customized <?php if (!fbks_block_defaults_are_customized($key, $saved[$key] ?? [])) { echo 'hidden'; } ?>><?php esc_html_e('Customized', 'folioblocks'); ?></span></span></span><span class="fbks-global-settings-panel__status" data-autosave-status aria-live="polite"></span></summary>
            <div class="fbks-global-settings-panel__content fbks-block-default-fields">
                <?php $previous_group = null; foreach ($schema['fields'] as $name => $field) :
                    if (isset($field['group']) && $field['group'] !== $previous_group) { $previous_group = $field['group']; echo '<h3 class="fbks-block-default-group-title"' . (isset($schema['group_conditions'][$previous_group]) ? ' data-image-default-condition="' . esc_attr($schema['group_conditions'][$previous_group]) . '"' : ('carousel' === $key && 'controls' === $previous_group ? ' data-image-default-condition="controls"' : '')) . '>' . esc_html($schema['groups'][$previous_group]) . '</h3>'; }
                    $id = 'fbks-default-' . $key . '-' . $name; $input_name = 'fbks_block_defaults[' . $key . '][' . $name . ']'; ?>
                <div class="fbks-settings-field fbks-block-default-field fbks-block-default-field--<?php echo esc_attr($name); ?>"<?php if (isset($field['condition'])) : ?> data-image-default-condition="<?php echo esc_attr($field['condition']); ?>"<?php endif; ?>><label for="<?php echo esc_attr($id); ?>"><?php echo esc_html($field['label']); ?></label>
                    <?php if (!empty($field['radio'])) : ?>
                        <span class="fbks-block-default-radios" id="<?php echo esc_attr($id); ?>" role="group" aria-label="<?php echo esc_attr($field['label']); ?>">
                            <?php foreach ($field['choices'] as $value => $label) : ?><label><input type="radio" name="<?php echo esc_attr($input_name); ?>" value="<?php echo esc_attr($value); ?>" <?php checked($values[$name], $value); ?> /><?php echo esc_html($label); ?></label><?php endforeach; ?>
                        </span>
                    <?php elseif (isset($field['choices'])) : ?>
                        <select id="<?php echo esc_attr($id); ?>" aria-describedby="<?php echo esc_attr($id . '-help'); ?>" name="<?php echo esc_attr($input_name); ?>"><?php foreach ($field['choices'] as $value => $label) : ?><option value="<?php echo esc_attr($value); ?>" <?php selected($values[$name], $value); ?>><?php echo esc_html($label); ?></option><?php endforeach; ?></select>
                    <?php elseif (is_bool($field['default'])) : ?>
                        <input type="hidden" name="<?php echo esc_attr($input_name); ?>" value="0" /><input type="checkbox" id="<?php echo esc_attr($id); ?>" aria-describedby="<?php echo esc_attr($id . '-help'); ?>" name="<?php echo esc_attr($input_name); ?>" value="1" <?php checked($values[$name]); ?> />
                    <?php elseif (!empty($field['gradient'])) : ?>
                        <input type="hidden" name="<?php echo esc_attr($input_name); ?>" value="<?php echo esc_attr($values[$name]); ?>" data-block-gradient-value />
                        <div id="<?php echo esc_attr($id); ?>" role="group" aria-label="<?php echo esc_attr($field['label']); ?>" data-block-gradient-picker></div>
                    <?php elseif (!empty($field['color'])) : ?>
                        <span class="fbks-block-color-picker" data-block-color-picker>
                            <input type="hidden" name="<?php echo esc_attr($input_name); ?>" value="<?php echo esc_attr($values[$name]); ?>" data-block-color-value />
                            <input type="color" id="<?php echo esc_attr($id); ?>" aria-describedby="<?php echo esc_attr($id . '-help'); ?>" value="<?php echo esc_attr(sanitize_hex_color($values[$name]) ?: '#000000'); ?>" data-block-color-swatch />
                            <?php if ('labelBackgroundColor' === $name || !empty($field['alpha'])) : ?>
                                <span class="fbks-block-color-opacity"><span><?php esc_html_e('Opacity', 'folioblocks'); ?></span><input type="range" min="0" max="100" step="1" value="60" aria-label="<?php echo esc_attr(sprintf(__('%s opacity', 'folioblocks'), $field['label'])); ?>" data-block-color-alpha /><output data-block-color-opacity>60%</output></span>
                            <?php endif; ?>
                        </span>
                    <?php elseif (isset($field['min']) && ('background_video' === $key || 'magnification' === $name || !empty($field['range']))) : ?>
                        <span class="fbks-block-default-range">
                            <input type="range" id="<?php echo esc_attr($id); ?>" aria-describedby="<?php echo esc_attr($id . '-help'); ?>" name="<?php echo esc_attr($input_name); ?>" min="<?php echo esc_attr($field['min']); ?>" max="<?php echo esc_attr($field['max']); ?>" step="<?php echo esc_attr($field['step'] ?? 1); ?>" value="<?php echo esc_attr($values[$name]); ?>" data-block-default-range />
                            <output for="<?php echo esc_attr($id); ?>"><?php echo esc_html($values[$name]); ?></output>
                        </span>
                    <?php else : ?>
                        <input type="<?php echo isset($field['min']) ? 'number' : 'text'; ?>" id="<?php echo esc_attr($id); ?>" aria-describedby="<?php echo esc_attr($id . '-help'); ?>" name="<?php echo esc_attr($input_name); ?>" value="<?php echo esc_attr($values[$name]); ?>" <?php if (isset($field['min'])) : ?> min="<?php echo esc_attr($field['min']); ?>" max="<?php echo esc_attr($field['max']); ?>" step="1"<?php endif; ?> />
                    <?php endif; ?>
                    <?php if (!empty($field['help'])) : ?><span class="fbks-block-default-help" id="<?php echo esc_attr($id . '-help'); ?>"><?php echo esc_html($field['help']); ?></span><?php endif; ?>
                </div>
                <?php endforeach; ?>
                <div class="fbks-block-default-reset"><button type="button" class="button-link" data-reset-block-defaults="<?php echo esc_attr(wp_json_encode(array_map(static function ($field) { return $field['default']; }, $schema['fields']))); ?>"><?php esc_html_e('Reset to plugin defaults', 'folioblocks'); ?></button></div>
            </div>
        </details>
        <?php
    }
}
