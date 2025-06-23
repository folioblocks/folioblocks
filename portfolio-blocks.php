<?php
/**
 * Plugin Name:       Portfolio Blocks
 * Description:       A collection of blocks for making photo and video galleries
 * Version:           0.6.8
 * Requires at least: 6.3
 * Requires PHP:      7.4
 * Author:            PB Team
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       portfolio-blocks
 *
 * @package PortfolioBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// Add custom category for blocks.
function portfolio_blocks_add_category( $categories ) {
    $new_category = array(
        'slug'  => 'portfolio-blocks',
        'title' => __( 'Portfolio Blocks', 'portfolio-blocks' ),
        'icon'  => 'portfolio',
    );

    $media_index = array_search('media', array_column($categories, 'slug'));

    if ($media_index !== false) {
        array_splice($categories, $media_index + 1, 0, array($new_category));
    } else {
        $categories[] = $new_category; // Fallback if Media category isn't found
    }

    return $categories;
}
add_filter( 'block_categories_all', 'portfolio_blocks_add_category', 10, 2 );

// Make context available to all blocks.
function render_portfolio_block( $attributes, $content, $block, $context ) {
	$block_name = $block->name; // e.g. "portfolio-blocks/grid-gallery-block"
	$template_path = plugin_dir_path( __FILE__ ) . 'build/' . str_replace( 'portfolio-blocks/', '', $block_name ) . '/render.php';

	if ( file_exists( $template_path ) ) {
		ob_start();
		include $template_path;
		return ob_get_clean();
	}

	return $content; // fallback
}

// Register all Portfolio Blocks blocks.
function portfolio_blocks_portfolio_blocks_block_init() {
    register_block_type( __DIR__ . '/build/pb-before-after-block' );
    register_block_type( __DIR__ . '/build/pb-image-block' );
    register_block_type( __DIR__ . '/build/pb-video-block' );
	register_block_type( __DIR__ . '/build/pb-image-row' );
	register_block_type( __DIR__ . '/build/pb-image-stack' );
    register_block_type( __DIR__ . '/build/carousel-gallery-block' );
    register_block_type( __DIR__ . '/build/grid-gallery-block' );
	register_block_type( __DIR__ . '/build/justified-gallery-block' );
	register_block_type( __DIR__ . '/build/masonry-gallery-block' );
	register_block_type( __DIR__ . '/build/modular-gallery-block' );
    register_block_type( __DIR__ . '/build/video-gallery-block' );
}
add_action( 'init', 'portfolio_blocks_portfolio_blocks_block_init' );

// Filter to load block assets on demand.
add_filter( 'should_load_block_assets_on_demand', '__return_true' );

// Add Admin settings page.
add_action( 'admin_menu', 'portfolio_blocks_register_settings_page' );
function portfolio_blocks_register_settings_page() {
    $icon_url = plugin_dir_url( __FILE__ ) . 'includes/icons/pb-icon.svg';
	add_menu_page(
		'Portfolio Blocks',        // Page title
		'Portfolio Blocks',        // Menu title
		'manage_options',          // Capability
		'portfolio-blocks-settings', // Slug
		'portfolio_blocks_render_settings_page', // Callback
		$icon_url, // Icon
		10 // Position 11 for media 80 for bottom
	);
}
require_once plugin_dir_path( __FILE__ ) . 'includes/admin/settings-page.php';
add_action( 'admin_enqueue_scripts', 'portfolio_blocks_enqueue_admin_styles' );
function portfolio_blocks_enqueue_admin_styles() {
	wp_enqueue_style(
		'portfolio-blocks-settings-css',
		plugin_dir_url( __FILE__ ) . 'includes/admin/settings-page.css',
		array(),
		'1.0'
	);
}

add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'portfolio_blocks_plugin_action_links' );

function portfolio_blocks_plugin_action_links( $links ) {
	$settings_link = '<a href="' . esc_url( admin_url( 'admin.php?page=portfolio-blocks-settings' ) ) . '">' . __( 'Settings', 'portfolio-blocks' ) . '</a>';
	array_unshift( $links, $settings_link );
	return $links;
}

// Allow SVG tags in post content.
function pb_allow_svg_tags( $tags, $context ) {
    if ( $context === 'post' ) {
        $tags['svg'] = [
            'xmlns' => true,
            'width' => true,
            'height' => true,
            'viewBox' => true,
            'fill' => true,
            'aria-hidden' => true,
        ];
        $tags['path'] = [
            'd' => true,
            'fill' => true,
        ];
    }
    return $tags;
}
add_filter( 'wp_kses_allowed_html', 'pb_allow_svg_tags', 10, 2 );