<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'fbks_get_free_pro_sections' ) ) {
	function fbks_get_free_pro_sections() {
		return array(
			array(
				'title' => __( 'Background Video Block', 'folioblocks' ),
				'rows'  => array(
					array( 'feature' => __( 'Support for Self-Hosted & Vimeo Videos', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Place any blocks on top of the video (headings, text, buttons, galleries)', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Adjustable video position (X / Y)', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Adjustable video position (X / Y) for Tablet & Mobile', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
					array( 'feature' => __( 'Loop Video', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Disable Video on Mobile', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Set Backup Poster Image', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Disable Right-Click', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
					array( 'feature' => __( 'Set Custom Block Height on Desktop', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Set Custom Block Height on Tablet & Mobile', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
				),
			),
			array(
				'title' => __( 'Before & After Block', 'folioblocks' ),
				'rows'  => array(
					array( 'feature' => __( 'Set Image Resolution', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Responsive Design works on Desktop, Tablet, and Mobile Ready', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Custom Slider Orientation', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Custom Drag Handle Starting Position', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
					array( 'feature' => __( 'Show Before & After Labels', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
					array( 'feature' => __( 'Before/After Label Position', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
					array( 'feature' => __( 'Disable Right-Click', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
					array( 'feature' => __( 'Custom Lazy Load', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
					array( 'feature' => __( 'Custom Border & Border Radius', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Drop Shadow Effect on Images', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
				),
			),
			array(
				'title' => __( 'Carousel Gallery Block', 'folioblocks' ),
				'rows'  => array(
					array( 'feature' => __( 'Set Image Resolution on Slides', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Responsive Design works on Desktop, Tablet, and Mobile', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Drag & Drop Image Re-Ordering', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Block Transforms convert to Filmstrip gallery', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'List View Thumbnails', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Enable Image Downloads', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Link to store products with WooCommerce Integration', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Disable Right-Click', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Custom Lazy Load', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Autoplay Carousel', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Carousel Playback Controls', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Lightbox', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Show Caption in Lightbox', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Show Title in Overlay on Hover', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
					array( 'feature' => __( 'Custom Hover Overlays (Blur, Fade, Gradient, Chip, & Color)', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
					array( 'feature' => __( 'Carousel Playback Control Styles', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Custom Border & Border Radius on Slides', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Drop Shadow Effect on Images', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
				),
			),
			array(
				'title' => __( 'Filmstrip Gallery Block', 'folioblocks' ),
				'rows'  => array(
					array( 'feature' => __( 'Set Image Resolution on Slides', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Responsive Design works on Desktop, Tablet, and Mobile', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Drag & Drop Image Re-Ordering', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Block Transforms convert to Carousel gallery', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'List View Thumbnails', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Multiple Layout Options', 'folioblocks' ), 'free' => '✅', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Light Mode & Dark Mode Styles', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Enable Image Downloads', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Randomize Image Order', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Link to store products with WooCommerce Integration', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Disable Right-Click', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Custom Lazy Load', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Autoplay Gallery', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Full-Screen Mode', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
					array( 'feature' => __( 'Show Title in Overlay on Hover', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
				),
			),
			array(
				'title' => __( 'Grid Gallery Block', 'folioblocks' ),
				'rows'  => array(
					array( 'feature' => __( 'Set Image Resolution', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Responsive Design works on Desktop, Tablet, and Mobile Ready', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Set Column Amount (Desktop/Tablet/Mobile)', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Drag & Drop Image Re-Ordering', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Block Transforms convert to Justified or Masonry gallery', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'List View Thumbnails', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Randomize Image Order', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Enable Image Downloads', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Link to store products with WooCommerce Integration', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Disable Right-Click', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Custom Lazy Load', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Lightbox', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Show Caption in Lightbox', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Show Title in Overlay on Hover', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
					array( 'feature' => __( 'Custom Hover Overlays (Blur, Fade, Gradient, Chip, & Color)', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
					array( 'feature' => __( 'Gallery Image Filtering', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Custom Typography & Styles on Gallery Filter Bar', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Custom Border & Border Radius', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Drop Shadow Effect on Images', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
				),
			),
			array(
				'title' => __( 'Image Block', 'folioblocks' ),
				'rows'  => array(
					array( 'feature' => __( 'Set Image Resolution', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Responsive Design works on Desktop, Tablet, and Mobile Ready', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Enable Image Downloads', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Link to store products with WooCommerce Integration', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Disable Right-Click', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Custom Lazy Load', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Lightbox', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Show Caption in Lightbox', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Show Title in Overlay on Hover', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
					array( 'feature' => __( 'Custom Hover Overlays (Blur, Fade, Gradient, Chip, & Color)', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
					array( 'feature' => __( 'Custom Border & Border Radius', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Drop Shadow Effect on Images', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
				),
			),
			array(
				'title' => __( 'Justified Gallery Block', 'folioblocks' ),
				'rows'  => array(
					array( 'feature' => __( 'Set Image Resolution', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Responsive Design works on Desktop, Tablet, and Mobile Ready', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Set Row Height', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Drag & Drop Image Re-Ordering', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Block Transforms convert to Grid or Masonry gallery', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'List View Thumbnails', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Remove Image Gap', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Randomize Image Order', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
					array( 'feature' => __( 'Enable Image Downloads', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Link to store products with WooCommerce Integration', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Disable Right-Click', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Custom Lazy Load', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Image Lightbox', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Show Caption in Lightbox', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Show Title in Overlay on Hover', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
					array( 'feature' => __( 'Custom Hover Overlays (Blur, Fade, Gradient, Chip, & Color)', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
					array( 'feature' => __( 'Gallery Image Filtering', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Custom Typography & Styles on Gallery Filter Bar', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Custom Border & Border Radius', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Drop Shadow Effect on Images', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
				),
			),
			array(
				'title' => __( 'Loupe Block', 'folioblocks' ),
				'rows'  => array(
					array( 'feature' => __( 'Set Image Resolution', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Responsive Design works on Desktop, Tablet, and Mobile Ready', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Set Magnification Strength', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Set Loupe Shape', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Set Loupe Theme (Light & Dark)', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Disable Right-Click', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Custom Border & Border Radius', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Drop Shadow Effect on block', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
				),
			),
			array(
				'title' => __( 'Masonry Gallery Block', 'folioblocks' ),
				'rows'  => array(
					array( 'feature' => __( 'Set Image Resolution', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Responsive Design works on Desktop, Tablet, and Mobile Ready', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Set Column Amount (Desktop/Tablet/Mobile)', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Drag & Drop Image Re-Ordering', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Block Transforms convert to Justified or Grid gallery', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'List View Thumbnails', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Remove Image Gap', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Randomize Image Order', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Enable Image Downloads', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Link to store products with WooCommerce Integration', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Disable Right-Click', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Custom Lazy Load', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Image Lightbox', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Show Caption in Lightbox', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Show Title in Overlay on Hover', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
					array( 'feature' => __( 'Custom Hover Overlays (Blur, Fade, Gradient, Chip, & Color)', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
					array( 'feature' => __( 'Gallery Image Filtering', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Custom Typography & Styles on Gallery Filter Bar', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Custom Border & Border Radius', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Drop Shadow Effect on Images', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
				),
			),
			array(
				'title' => __( 'Modular Gallery Block (Pro Only)', 'folioblocks' ),
				'rows'  => array(
					array( 'feature' => __( 'Set Image Resolution', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Responsive Design works on Desktop, Tablet, and Mobile Ready', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Drag & Drop Image Re-Ordering', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'List View Thumbnails', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Remove Image Gap', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Randomize Image Order', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Enable Image Downloads', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Link to store products with WooCommerce Integration', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Disable Right-Click', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Custom Lazy Load', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Image Lightbox', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Show Caption in Lightbox', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Show Title in Overlay on Hover', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Custom Hover Overlays (Blur, Fade, Gradient, Chip, & Color)', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
					array( 'feature' => __( 'Custom Border & Border Radius on Slides', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Drop Shadow Effect on Images', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
				),
			),
			array(
				'title' => __( 'Video Block', 'folioblocks' ),
				'rows'  => array(
					array( 'feature' => __( 'Support for Self-Hosted, YouTube, & Vimeo, and Bunny Stream Videos', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Set Thumbnail Resolution & Aspect Ratio', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Responsive Design works on Desktop, Tablet, and Mobile Ready', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Link to store products with WooCommerce Integration', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Disable Right-Click', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Lazy Load Images', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Hide/Display Video Title Overlay', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Hide/Display Video Play Button Overlay', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Disable Lightbox in Editor', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Show video description in Lightbox', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Custom Border & Border Radius on Slides', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Drop Shadow Effect on Video Thumbnails', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
				),
			),
			array(
				'title' => __( 'Video Gallery Block', 'folioblocks' ),
				'rows'  => array(
					array( 'feature' => __( 'Support for Self-Hosted, YouTube, & Vimeo, and Bunny Stream Videos', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Set Thumbnail Resolution & Aspect Ratio', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Responsive Design works on Desktop, Tablet, and Mobile Ready', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Drag & Drop Video Re-Ordering', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Remove Gap', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Link to store products with WooCommerce Integration', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Disable Right-Click', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Lazy Load Images', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Hide/Display Video Title & Play Button in Overlay', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Hide Play Button in Overlay', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Custom Overlay Styles', 'folioblocks' ), 'free' => '❌', 'pro' => '✅' ),
					array( 'feature' => __( 'Disable Lightbox in Editor', 'folioblocks' ), 'free' => '✅', 'pro' => '✅' ),
					array( 'feature' => __( 'Show video description in Lightbox', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Video Gallery Filtering', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Custom Typography & Styles on Gallery Filter Bar', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Custom Border & Border Radius on Slides', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
					array( 'feature' => __( 'Drop Shadow Effect on Video Thumbnails', 'folioblocks' ), 'free' => '❌', 'pro' => '✅', 'free_unavailable' => true ),
				),
			),
		);
	}
}

if ( ! function_exists( 'fbks_render_free_pro_page' ) ) {
	function fbks_render_free_pro_page() {
		$sections = fbks_get_free_pro_sections();
		?>
		<div class="pb-wrap">
			<div class="pb-settings-header">
				<img src="<?php echo esc_url( plugin_dir_url( __DIR__ ) . '/icons/pb-brand-icon.svg' ); ?>" alt="<?php echo esc_attr__( 'FolioBlocks', 'folioblocks' ); ?>" class="pb-settings-logo" />
				<h1><?php esc_html_e( 'FolioBlocks', 'folioblocks' ); ?> - <?php esc_html_e( 'Free vs Pro', 'folioblocks' ); ?></h1>
			</div>

			<div class="settings-container">
				<div class="settings-left">
					<div class="pb-dashboard-box">
						<h2><?php esc_html_e( 'Compare Features', 'folioblocks' ); ?></h2>
						<p><?php esc_html_e( 'Compare the features to find the best option for your website.', 'folioblocks' ); ?></p>

						<?php foreach ( $sections as $section ) : ?>
							<table class="pb-comparison-table">
								<thead>
									<tr>
										<th><?php echo esc_html( $section['title'] ); ?></th>
										<th><?php esc_html_e( 'Free', 'folioblocks' ); ?></th>
										<th><?php esc_html_e( 'Pro', 'folioblocks' ); ?></th>
									</tr>
								</thead>
								<tbody>
									<?php foreach ( $section['rows'] as $row ) : ?>
										<tr>
											<td><?php echo esc_html( $row['feature'] ); ?></td>
											<td<?php echo ! empty( $row['free_unavailable'] ) ? ' class="unavailable"' : ''; ?>><?php echo esc_html( $row['free'] ); ?></td>
											<td><?php echo esc_html( $row['pro'] ); ?></td>
										</tr>
									<?php endforeach; ?>
								</tbody>
							</table>
						<?php endforeach; ?>
					</div>
				</div>

				<div class="settings-right">
					<div class="pb-dashboard-box">
						<h2><?php esc_html_e( 'Unlock Pro', 'folioblocks' ); ?></h2>
						<p><?php esc_html_e( 'Upgrade to Pro to unlock all of these features.', 'folioblocks' ); ?></p>
						<p class="buy-button-wrapper">
							<a class="button button-primary buy-button" href="https://folioblocks.com/folioblocks-pricing/?utm_source=folioblocks-plugin&utm_medium=free-vs-pro-page&utm_campaign=upgrade" target="_blank" rel="noopener noreferrer">
								<?php esc_html_e( 'Upgrade Today', 'folioblocks' ); ?>
							</a>
						</p>
					</div>

					<div class="pb-dashboard-box">
						<h2><?php esc_html_e( 'Quick Links:', 'folioblocks' ); ?></h2>
						<?php fbks_render_quick_links(); ?>
					</div>
				</div>
			</div>
		</div>
		<?php
	}
}
