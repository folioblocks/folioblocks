<?php
if (! defined('ABSPATH')) {
	exit;
}

if (! function_exists('fbks_get_free_pro_sections')) {
	function fbks_get_free_pro_sections()
	{
		return array(
			array(
				'title' => __('Background Video Block', 'folioblocks'),
				'rows'  => array(
					array('feature' => __('Support for Self-Hosted & Vimeo Videos', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Place any blocks on top of the video (headings, text, buttons, galleries)', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Adjustable video position (X / Y)', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Adjustable video position (X / Y) for Tablet & Mobile', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Loop Video', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Disable Video on Mobile', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Set Backup Poster Image', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Set Custom Block Height on Desktop', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Set Custom Block Height on Tablet & Mobile', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Page-level Disable Right-Click support', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
				),
			),
			array(
				'title' => __('Before & After Block', 'folioblocks'),
				'rows'  => array(
					array('feature' => __('Set Image Resolution', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Responsive Design Ready: Works on Desktop, Tablet, and Mobile', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Custom Slider Orientation', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Custom Drag Handle Starting Position', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Show Before & After Labels', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Before/After Label Position', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Custom Border & Border Radius', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Drop Shadow Effect on Images', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Page-level Disable Right-Click support', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Page-level Lazy Load support', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Page-level Disable Drag To Save support', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),					
				),
			),
			array(
				'title' => __('Carousel Gallery Block', 'folioblocks'),
				'rows'  => array(
					array('feature' => __('Set Image resolution on Slides', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Responsive Design Ready: Works on Desktop, Tablet, and Mobile', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Drag & Drop Image Re-Ordering', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('List View Thumbnails', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Gallery Transforms: Instantly switch between FolioBlocks photo galleries', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Autoplay Carousel', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Loop Carousel Slides', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Carousel Playback Controls: With custom styling controls', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Gallery Click Actions: Link images to Downloads, WooCommerce products, Media Files, Custom URLs, and Pages/Posts', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Lightbox', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Lightbox Controls: Light/Dark Appearance, Full-Screen, Image Counter, and Zoom with cursor or trackpad panning', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Lightbox Content: Display image Title, Caption, EXIF Data, Woo Product Info, Social Media links, and/or combined layouts', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Hover Effects: Zoom In, Zoom Out, Lift, Tilt, Pop, Glare, Pan, Desaturate', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Hover Overlays: Fade Overlay, Bottom Gradient, Chip, Blur Overlay, Color Overlay, & Gradient Overlay', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Hover Overlay Content: Display image Title, Caption, Woo Product Info, EXIF Data, or Social Media links', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Hover Overlay Entrances: Default, Fade, Slide Up, Slide Down, Slide Left, Slide Right', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Per-Image Click & Hover Setting Overrides', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Slide Borders & Rounded Corners', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Slide Drop Shadows: Subtle, Soft, Elevated, and Dramatic', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Watermark Overlays: Display custom watermarks on gallery images and lightbox images', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Disable Right-Click support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Lazy Load support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Disable Drag To Save support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Password Protection support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
				),
			),
			array(
				'title' => __('Filmstrip Gallery Block', 'folioblocks'),
				'rows'  => array(
					array('feature' => __('Set Image Resolution on Slides', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Responsive Design Ready: Works on Desktop, Tablet, and Mobile', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Drag & Drop Image Re-Ordering', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('List View Thumbnails', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Gallery Transforms: Instantly switch between FolioBlocks photo galleries', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Autoplay Gallery', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Full-Screen Mode', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Multiple Layout Options', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Light Mode & Dark Mode Styles', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Randomize Image Order', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Gallery Click Actions: Link images to Downloads, WooCommerce products, Media Files, Custom URLs, and Pages/Posts', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Lightbox', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Lightbox Controls: Light/Dark Appearance, Image Counter, and Zoom with cursor or trackpad panning', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Lightbox Content: Display image Title, Caption, EXIF Data, Woo Product Info, Social Media links, and/or combined layouts', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Hover Effects: Zoom In, Zoom Out, Lift, Tilt, Pop, Glare, Pan, Desaturate', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Hover Overlays: Fade Overlay, Bottom Gradient, Chip, Blur Overlay, Color Overlay, & Gradient Overlay', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Hover Overlay Content: Display image Title, Caption, Woo Product Info, EXIF Data, or Social Media links', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Hover Overlay Entrances: Default, Fade, Slide Up, Slide Down, Slide Left, Slide Right', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Per-Image Click & Hover Setting Overrides', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Watermark Overlays: Display custom watermarks on gallery images and lightbox images', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Disable Right-Click support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Lazy Load support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Disable Drag To Save support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Password Protection support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
				),
			),
			array(
				'title' => __('Grid Gallery Block', 'folioblocks'),
				'rows'  => array(
					array('feature' => __('Set Image Resolution', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Responsive Design Ready: Works on Desktop, Tablet, and Mobile', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Set Column Amount (Desktop/Tablet/Mobile)', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Drag & Drop Image Re-Ordering', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('List View Thumbnails', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Gallery Transforms: Instantly switch between FolioBlocks photo galleries', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Randomize Image Order', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Lightbox', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Lightbox Controls: Light/Dark Appearance, Full-Screen, Image Counter, and Zoom with cursor or trackpad panning', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Lightbox Content: Display image Title, Caption, EXIF Data, Woo Product Info, Social Media links, and/or combined layouts', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Hover Effects: Zoom In, Zoom Out, Lift, Tilt, Pop, Glare, Pan, Desaturate', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Hover Overlays: Fade Overlay, Bottom Gradient, Chip, Blur Overlay, Color Overlay, & Gradient Overlay', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Hover Overlay Content: Display image Title, Caption, Woo Product Info, EXIF Data, or Social Media links', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Hover Overlay Entrances: Default, Fade, Slide Up, Slide Down, Slide Left, Slide Right', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Per-Image Click & Hover Setting Overrides', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Multi-keyword Gallery Filtering: With custom typography and filter bar styles', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Image Borders: Custom Borders & Rounded Corners', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Image Drop Shadows: Subtle, Soft, Elevated, and Dramatic', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Watermark Overlays: Display custom watermarks on gallery images and lightbox images', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Disable Right-Click support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Lazy Load support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Disable Drag To Save support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Password Protection support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
				),
			),
			array(
				'title' => __('Image Block', 'folioblocks'),
				'rows'  => array(
					array('feature' => __('Set Image Resolution', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Responsive Design Ready: Works on Desktop, Tablet, and Mobile', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Block Transforms: Between compatible image blocks', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('EXIF Metadata Support: EXIF fields displayed in the Image Block inspector', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Metadata Synchronization: Sync Image Metadata back to the WordPress Media Library', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Image Click Actions: Link images to Downloads, WooCommerce products, Media Files, Custom URLs, and Pages/Posts', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Lightbox', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Lightbox Controls: Light/Dark Appearance, Full-Screen, Image Counter, and Zoom with cursor or trackpad panning', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Lightbox Content: Display image Title, Caption, EXIF Data, Woo Product Info, Social Media links, and/or combined layouts', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Hover Effects: Zoom In, Zoom Out, Lift, Tilt, Pop, Glare, Pan, Desaturate', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Hover Overlays: Fade Overlay, Bottom Gradient, Chip, Blur Overlay, Color Overlay, & Gradient Overlay', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Hover Overlay Content: Display image Title, Caption, Woo Product Info, EXIF Data, or Social Media links', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Hover Overlay Entrances: Default, Fade, Slide Up, Slide Down, Slide Left, Slide Right', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Override Gallery Click & Hover Settings Per Image', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Image Borders: Custom Borders & Rounded Corners', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Image Drop Shadows: Subtle, Soft, Elevated, and Dramatic', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Watermark Overlays: Display custom watermarks on images', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Disable Right-Click support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Lazy Load support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Disable Drag To Save support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
				),
			),
			array(
				'title' => __('Justified Gallery Block', 'folioblocks'),
				'rows'  => array(
					array('feature' => __('Set Image Resolution', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Responsive Design Ready: Works on Desktop, Tablet, and Mobile', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Set Row Height', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Drag & Drop Image Re-Ordering', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('List View Thumbnails', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Gallery Transforms: Instantly switch between FolioBlocks photo galleries', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Remove Image Gap', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Responsive Gap Controls (Desktop/Tablet/Mobile)', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Randomize Image Order', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Gallery Click Actions: Link images to Downloads, WooCommerce products, Media Files, Custom URLs, and Pages/Posts', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Lightbox', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Lightbox Controls: Light/Dark Appearance, Full-Screen, Image Counter, and Zoom with cursor or trackpad panning', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Lightbox Content: Display image Title, Caption, EXIF Data, Woo Product Info, Social Media links, and/or combined layouts', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Hover Effects: Zoom In, Zoom Out, Lift, Tilt, Pop, Glare, Pan, Desaturate', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Hover Overlays: Fade Overlay, Bottom Gradient, Chip, Blur Overlay, Color Overlay, & Gradient Overlay', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Hover Overlay Content: Display image Title, Caption, Woo Product Info, EXIF Data, or Social Media links', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Hover Overlay Entrances: Default, Fade, Slide Up, Slide Down, Slide Left, Slide Right', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Per-Image Click & Hover Setting Overrides', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Multi-keyword Gallery Filtering: With custom typography and filter bar styles', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Image Borders: Custom Borders & Rounded Corners', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Image Drop Shadows: Subtle, Soft, Elevated, and Dramatic', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Watermark Overlays: Display custom watermarks on gallery images and lightbox images', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Disable Right-Click support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Lazy Load support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Disable Drag To Save support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Password Protection support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
				),
			),
			array(
				'title' => __('Loupe Block', 'folioblocks'),
				'rows'  => array(
					array('feature' => __('Set Image Resolution', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Responsive Design Ready: Works on Desktop, Tablet, and Mobile', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Set Magnification Strength', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Set Loupe Shape', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Set Loupe Theme (Light & Dark)', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Custom Border & Border Radius', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Drop Shadow Effect on block', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Disable Right-Click support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Lazy Load support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Disable Drag To Save support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),					
				),
			),
			array(
				'title' => __('Masonry Gallery Block', 'folioblocks'),
				'rows'  => array(
					array('feature' => __('Set Image Resolution', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Responsive Design Ready: Works on Desktop, Tablet, and Mobile', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Set Column Amount (Desktop/Tablet/Mobile)', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Drag & Drop Image Re-Ordering', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('List View Thumbnails', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Gallery Transforms: Instantly switch between FolioBlocks photo galleries', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Remove Image Gap', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Responsive Gap Controls (Desktop/Tablet/Mobile)', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Randomize Image Order', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Gallery Click Actions: Link images to Downloads, WooCommerce products, Media Files, Custom URLs, and Pages/Posts', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Lightbox', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Lightbox Controls: Light/Dark Appearance, Full-Screen, Image Counter, and Zoom with cursor or trackpad panning', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Lightbox Content: Display image Title, Caption, EXIF Data, Woo Product Info, Social Media links, and/or combined layouts', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Hover Effects: Zoom In, Zoom Out, Lift, Tilt, Pop, Glare, Pan, Desaturate', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Hover Overlays: Fade Overlay, Bottom Gradient, Chip, Blur Overlay, Color Overlay, & Gradient Overlay', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Hover Overlay Content: Display image Title, Caption, Woo Product Info, EXIF Data, or Social Media links', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Hover Overlay Entrances: Default, Fade, Slide Up, Slide Down, Slide Left, Slide Right', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Per-Image Click & Hover Setting Overrides', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Multi-keyword Gallery Filtering: With custom typography and filter bar styles', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Image Borders: Custom Borders & Rounded Corners', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Image Drop Shadows: Subtle, Soft, Elevated, and Dramatic', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Watermark Overlays: Display custom watermarks on gallery images and lightbox images', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Disable Right-Click support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Lazy Load support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Disable Drag To Save support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Password Protection support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
				),
			),
			array(
				'title' => __('Modular Gallery Block (Pro Only - All Plans)', 'folioblocks'),
				'rows'  => array(
					array('feature' => __('Set Image Resolution', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Responsive Design Ready: Works on Desktop, Tablet, and Mobile', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Drag & Drop Image Re-Ordering', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('List View Thumbnails', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Responsive Gap Controls (Desktop/Tablet/Mobile)', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Randomize Image Order', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Gallery Click Actions: Link images to Downloads, WooCommerce products, Media Files, Custom URLs, and Pages/Posts', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Lightbox', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Lightbox Controls: Light/Dark Appearance, Full-Screen, Image Counter, and Zoom with cursor or trackpad panning', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Lightbox Content: Display image Title, Caption, EXIF Data, Woo Product Info, Social Media links, and/or combined layouts', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Hover Effects: Zoom In, Zoom Out, Lift, Tilt, Pop, Glare, Pan, Desaturate', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Hover Overlays: Fade Overlay, Bottom Gradient, Chip, Blur Overlay, Color Overlay, & Gradient Overlay', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Hover Overlay Content: Display image Title, Caption, Woo Product Info, EXIF Data, or Social Media links', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Hover Overlay Entrances: Default, Fade, Slide Up, Slide Down, Slide Left, Slide Right', 'folioblocks'), 'free' => '❌', 'pro' => '✅'),
					array('feature' => __('Per-Image Click & Hover Setting Overrides', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Image Borders: Custom Borders & Rounded Corners', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Image Drop Shadows: Subtle, Soft, Elevated, and Dramatic', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Watermark Overlays: Display custom watermarks on gallery images and lightbox images', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Disable Right-Click support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Lazy Load support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Disable Drag To Save support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Password Protection support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
				),
			),
			array(
				'title' => __('Proofing Gallery Block (Pro Only - Business & Agency Plans)', 'folioblocks'),
				'pro_single' => '❌',
				'pro_business' => '✅',
				'pro_agency' => '✅',
				'rows'  => array(
					array('feature' => __('Private Client Proofing Gallerries', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Password Protection by default for security & privacy', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Switch between Grid, Justified, or Masonry layouts', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Client Proofing Tools: Hearts, Color Flags, and Image Comments', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Filter Proofing Galleries by selected liked images, commented images, and/or flag colors', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Light & Dark Proofing UI Modes: For the filter bar, flags, and comments', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Proofing Status in Page/Post Lists: See when a client is actively proofing a gallery from the admin dashboard', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Save & Continue Option: Allows clients to save their progress and continue later', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Alignment & Style Controls for Save & Continue and Submit buttons', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Receive email notifications when proofing sessions are submitted by clients', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Submitted Proofing session reports availble in Admin Dashboard', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Export Submitted Proofing session reports as PDF', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Watermark Overlays: Display custom watermarks on gallery images and lightbox images', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Disable Right-Click support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Lazy Load support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Disable Drag To Save support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Password Protection support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
				),
			),
			array(
				'title' => __('Video Block', 'folioblocks'),
				'rows'  => array(
					array('feature' => __('Support for Self-Hosted, YouTube, and Vimeo videos', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Additional video providers: Bunny Stream, Cloudflare Stream, DailyMotion, Loom, VideoPress, and Wistia', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Set Thumbnail Resolution & Aspect Ratio', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Responsive Design Ready: Works on Desktop, Tablet, and Mobile', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Block Transforms between compatible video blocks', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('List View Thumbnails', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('WooCommerce product linking for videos', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Hover Overlay Content: Play Button, Video Title, or Both', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Custom hover overlays, gradient overlays, overlay entrances, and hover effects', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Override Gallery Hover Settings Per Video', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Enable Lightbox in Editor', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Lightbox Content: Video, Video + Info, or Video + Product Info', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Video Lightbox controls: light/dark appearance and fullscreen playback', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Custom Border & Border Radius on Video Thumbnails', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Drop Shadow Effect on Video Thumbnails (Subtle, Soft, Elevated, & Dramatic)', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Disable Right-Click support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Lazy Load support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Disable Drag To Save support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
				),
			),
			array(
				'title' => __('Video Gallery Block', 'folioblocks'),
				'rows'  => array(
					array('feature' => __('Support for Self-Hosted, YouTube, and Vimeo videos', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Additional video providers: Bunny Stream, Cloudflare Stream, DailyMotion, Loom, VideoPress, and Wistia', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Set Thumbnail Resolution & Aspect Ratio', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Responsive Design Ready: Works on Desktop, Tablet, and Mobile', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Drag & Drop Video Re-Ordering', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Responsive Gap Controls (Desktop/Tablet/Mobile)', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('WooCommerce product linking for videos', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Hover Effects: Zoom In, Zoom Out, Lift, Tilt, Pop, Glare, Pan, Desaturate', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Hover Overlays: Fade Overlay, Bottom Gradient, Chip, Blur Overlay, Color Overlay, & Gradient Overlay', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Hover Overlay Content: Play Button, Video Title, or Both', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Hover Overlay Entrances: Default, Fade, Slide Up, Slide Down, Slide Left, Slide Right', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Display Filtering Categories in Video Overlays', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Per-Video Gallery Hover Setting Overrides', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Enable Lightbox in Editor', 'folioblocks'), 'free' => '✅', 'pro' => '✅'),
					array('feature' => __('Lightbox Content: Video, Video + Info, or Video + Product Info', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Video Lightbox Controls: Light/Dark Appearance and Full-Screen playback', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Multi-keyword Video Gallery Filtering with custom typography and filter bar styles', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Custom Border & Border Radius on Video Thumbnails', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Drop Shadow Effects on Video Thumbnails (Subtle, Soft, Elevated, & Dramatic)', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Disable Right-Click support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Lazy Load support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Disable Drag To Save support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
					array('feature' => __('Page-level Password Protection support', 'folioblocks'), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true),
				),
			),
		);
	}
}

if (! function_exists('fbks_get_free_pro_value')) {
	function fbks_get_free_pro_value($row, $section, $key)
	{
		if (isset($row[$key])) {
			return $row[$key];
		}

		if (isset($section[$key])) {
			return $section[$key];
		}

		return isset($row['pro']) ? $row['pro'] : '';
	}
}

if (! function_exists('fbks_render_free_pro_cell')) {
	function fbks_render_free_pro_cell($value)
	{
		$class = '❌' === $value ? ' class="unavailable"' : '';
		printf('<td%s>%s</td>', $class, esc_html($value));
	}
}

if (! function_exists('fbks_render_free_pro_plan_header')) {
	function fbks_render_free_pro_plan_header($label, $short_label)
	{
		printf(
			'<th><span class="pb-comparison-plan-label">%1$s</span><span class="pb-comparison-plan-label-short" aria-hidden="true">%2$s</span></th>',
			esc_html($label),
			esc_html($short_label)
		);
	}
}

if (! function_exists('fbks_render_free_pro_page')) {
	function fbks_render_free_pro_page()
	{
		$sections = fbks_get_free_pro_sections();
?>
		<div class="pb-wrap">
			<div class="pb-settings-header">
				<img src="<?php echo esc_url(plugin_dir_url(__DIR__) . '/icons/pb-brand-icon.svg'); ?>" alt="<?php echo esc_attr__('FolioBlocks', 'folioblocks'); ?>" class="pb-settings-logo" />
				<h1><?php esc_html_e('FolioBlocks', 'folioblocks'); ?> - <?php esc_html_e('Free vs Pro', 'folioblocks'); ?></h1>
			</div>

			<div class="settings-container">
				<div class="settings-left">
					<div class="pb-dashboard-box">
						<h2><?php esc_html_e('Compare Features', 'folioblocks'); ?></h2>
						<p><?php esc_html_e('Compare the features to find the best option for your website.', 'folioblocks'); ?></p>

						<?php foreach ($sections as $section) : ?>
							<table class="pb-comparison-table">
								<thead>
									<tr>
										<th><?php echo esc_html($section['title']); ?></th>
										<th><?php esc_html_e('Free', 'folioblocks'); ?></th>
										<?php fbks_render_free_pro_plan_header(__('Pro - Single', 'folioblocks'), __('Single', 'folioblocks')); ?>
										<?php fbks_render_free_pro_plan_header(__('Pro - Business', 'folioblocks'), __('Business', 'folioblocks')); ?>
										<?php fbks_render_free_pro_plan_header(__('Pro - Agency', 'folioblocks'), __('Agency', 'folioblocks')); ?>
									</tr>
								</thead>
								<tbody>
									<?php foreach ($section['rows'] as $row) : ?>
										<tr>
											<td><?php echo esc_html($row['feature']); ?></td>
											<?php fbks_render_free_pro_cell($row['free']); ?>
											<?php fbks_render_free_pro_cell(fbks_get_free_pro_value($row, $section, 'pro_single')); ?>
											<?php fbks_render_free_pro_cell(fbks_get_free_pro_value($row, $section, 'pro_business')); ?>
											<?php fbks_render_free_pro_cell(fbks_get_free_pro_value($row, $section, 'pro_agency')); ?>
										</tr>
									<?php endforeach; ?>
								</tbody>
							</table>
						<?php endforeach; ?>
					</div>
				</div>

				<div class="settings-right">
					<div class="pb-dashboard-box">
						<h2><?php esc_html_e('Unlock Pro', 'folioblocks'); ?></h2>
						<p><?php esc_html_e('Upgrade to Pro to unlock all of these features.', 'folioblocks'); ?></p>
						<p class="buy-button-wrapper">
							<a class="button button-primary buy-button" href="https://folioblocks.com/folioblocks-pricing/?utm_source=folioblocks-plugin&utm_medium=free-vs-pro-page&utm_campaign=upgrade" target="_blank" rel="noopener noreferrer">
								<?php esc_html_e('Upgrade Today', 'folioblocks'); ?>
							</a>
						</p>
					</div>

					<div class="pb-dashboard-box">
						<h2><?php esc_html_e('Quick Links:', 'folioblocks'); ?></h2>
						<?php fbks_render_quick_links(); ?>
					</div>
				</div>
			</div>
		</div>
<?php
	}
}
