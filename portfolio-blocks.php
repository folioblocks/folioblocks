<?php
/**
 * Plugin Name:       Portfolio Blocks
 * Description:       A collection of blocks for making photo and video galleries
 * Version:           0.8.1
 * Requires at least: 6.3
 * Requires PHP:      7.4
 * Author:            PB Team
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       portfolio-blocks
 *
 * @package PortfolioBlocks
 * 
 * @fs_premium_only /build/carousel-gallery-block/premium.asset.php, /build/carousel-gallery-block/premium.js, /build/grid-gallery-block/premium.asset.php, /build/grid-gallery-block/premium.js, /build/justified-gallery-block/premium.asset.php, /build/justified-gallery-block/premium.js, /build/masonry-gallery-block/premium.asset.php, /build/masonry-gallery-block/premium.js, /build/modular-gallery-block/premium.asset.php, /build/modular-gallery-block/premium.js, /build/pb-before-after-block/premium.asset.php, /build/pb-before-after-block/premium.js, /build/video-gallery-block/premium.asset.php, /build/video-gallery-block/premium.js
 */


if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( function_exists( 'pb_fs' ) ) {
    pb_fs()->set_basename( true, __FILE__ );
} else {

    /**
     * DO NOT REMOVE THIS IF, IT IS ESSENTIAL FOR THE
     * `function_exists` CALL ABOVE TO PROPERLY WORK.
     */

    if ( ! function_exists( 'pb_fs' ) ) {
        if ( ! function_exists( 'pb_fs' ) ) {
            // Create a helper function for easy SDK access.
            function pb_fs() {
            global $pb_fs;

            if ( ! isset( $pb_fs ) ) {
                // Include Freemius SDK.
                require_once dirname( __FILE__ ) . '/vendor/freemius/start.php';
                $pb_fs = fs_dynamic_init( array(
                    'id'                  => '19558',
                    'slug'                => 'portfolio-blocks',
                    'premium_slug'        => 'portfolio-blocks-pro',
                    'type'                => 'plugin',
                    'public_key'          => 'pk_9719a603d337d33af1a1193508cdf',
                    'is_premium'          => true,
                    'premium_suffix'      => 'Pro',
                    // If your plugin is a serviceware, set this option to false.
                    'has_premium_version' => true,
                    'has_addons'          => false,
                   'has_paid_plans'      => true,
                    // Automatically removed in the free version. If you're not using the
                    // auto-generated free version, delete this line before uploading to wp.org.
                     'wp_org_gatekeeper'   => 'OA7#BoRiBNqdf52FvzEf!!074aRLPs8fspif$7K1#4u4Csys1fQlCecVcUTOs2mcpeVHi#C2j9d09fOTvbC0HloPT7fFee5WdS3G',
                    'menu'                => array(
                    'slug'           => 'portfolio-blocks-settings',
                
                ),
            ) );
        }

        return $pb_fs;
        }

        // Init Freemius.
        pb_fs();
        // Signal that SDK was initiated.
        do_action( 'pb_fs_loaded' );

        pb_fs()->add_filter( 'pricing/show_annual_in_monthly', '__return_false' );
        
        // Use custom icon in Freemius 
        function pb_fs_custom_icon() {
            return dirname( __FILE__ ) . '/includes/icons/pb-icon.svg';
        }
        pb_fs()->add_filter( 'plugin_icon', 'pb_fs_custom_icon' );
    
        // Make url available to JS for Upgrade links
        add_action( 'enqueue_block_editor_assets', function () {
            $data = [
                'checkoutUrl' => pb_fs()->pricing_url(),
                'siteUrl'     => site_url(),
            ];

            wp_register_script(
                'portfolio-blocks-shared-data',
                false,               // no external src; this handle is for inline data only
                array(),             // no deps
                filemtime( __FILE__ ), // version for cache-busting (plugin file mtime)
                true                 // load in footer
            );
            wp_add_inline_script(
                'portfolio-blocks-shared-data',
                'window.portfolioBlocksData = ' . wp_json_encode( $data ) . ';',
                'before'
            );
            wp_enqueue_script( 'portfolio-blocks-shared-data' );
        } );

    }
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

}

// Enqueue premium block scripts if premium is active.
add_action( 'enqueue_block_editor_assets', 'portfolio_blocks_enqueue_premium_scripts' );
function portfolio_blocks_enqueue_premium_scripts() {
	if ( ! function_exists( 'pb_fs' ) || ! pb_fs()->can_use_premium_code() ) {
		return;
	}

	$blocks_dir = plugin_dir_path( __FILE__ ) . 'build/';
	$blocks_url = plugins_url( 'build/', __FILE__ );

	foreach ( glob( $blocks_dir . '*', GLOB_ONLYDIR ) as $block_path ) {
		$block_name = basename( $block_path );
		$premium_js_path = $block_path . '/premium.js';

		if ( file_exists( $premium_js_path ) ) {
			wp_enqueue_script(
				"portfolio-blocks-{$block_name}-premium",
				$blocks_url . "{$block_name}/premium.js",
				[ 'wp-blocks', 'wp-element', 'wp-hooks', 'wp-components', 'wp-editor' ],
				filemtime( $premium_js_path ),
				true
			);
		}
	}
}