<?php
/**
 * Plugin Name:       FolioBlocks
 * Description:       Create fast, responsive photo and video galleries with grid, masonry, justified, modular, and carousel layouts — perfect for photographers and creatives.
 * Version:           1.0.3
 * Requires at least: 6.3
 * Requires PHP:      7.4
 * Author:            FolioBlocks
 * Author URI: https://folioblocks.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       folioblocks
 *
 * @package FolioBlocks
 * 
 * @fs_premium_only /build/modular-gallery-block/, /build/pb-image-row, /build/pb-image-stack/, /build/carousel-gallery-block/premium-view.asset.php, /build/carousel-gallery-block/premium-view.js, /build/carousel-gallery-block/premium.asset.php, /build/carousel-gallery-block/premium.js, /build/grid-gallery-block/premium-view.asset.php, /build/grid-gallery-block/premium-view.js, /build/grid-gallery-block/premium.asset.php, /build/grid-gallery-block/premium.js, /build/justified-gallery-block/premium-view.asset.php, /build/justified-gallery-block/premium-view.js, /build/justified-gallery-block/premium.asset.php, /build/justified-gallery-block/premium.js, /build/masonry-gallery-block/premium-view.asset.php, /build/masonry-gallery-block/premium-view.js, /build/masonry-gallery-block/premium.asset.php, /build/masonry-gallery-block/premium.js, /build/modular-gallery-block/premium-view.asset.php, /build/modular-gallery-block/premium-view.js, /build/modular-gallery-block/premium.asset.php, /build/modular-gallery-block/premium.js, /build/pb-before-after-block/premium-view.asset.php, /build/pb-before-after-block/premium-view.js, /build/pb-before-after-block/premium.asset.php, /build/pb-before-after-block/premium.js, /build/pb-image-block/premium-view.asset.php, /build/pb-image-block/premium-view.js, /build/pb-image-block/premium.asset.php, /build/pb-image-block/premium.js, /build/pb-video-block/premium-view.asset.php, /build/pb-video-block/premium-view.js, /build/pb-video-block/premium.asset.php, /build/pb-video-block/premium.js, /build/video-gallery-block/premium-view.asset.php, /build/video-gallery-block/premium-view.js, /build/video-gallery-block/premium.asset.php, /build/video-gallery-block/premium.js
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
                    'slug'                => 'folioblocks',
                    'premium_slug'        => 'folioblocks-pro',
                    'type'                => 'plugin',
                    'public_key'          => 'pk_9719a603d337d33af1a1193508cdf',
                    'is_premium'          =>  true,
                    'premium_suffix'      => 'Pro',
                    // If your plugin is a serviceware, set this option to false.
                    'has_premium_version' => true,
                    'has_addons'          => false,
                    'has_paid_plans'      => true,
                    'is_org_compliant' => true,
                    // Automatically removed in the free version. If you're not using the
                    // auto-generated free version, delete this line before uploading to wp.org.
                    'wp_org_gatekeeper'   => 'OA7#BoRiBNqdf52FvzEf!!074aRLPs8fspif$7K1#4u4Csys1fQlCecVcUTOs2mcpeVHi#C2j9d09fOTvbC0HloPT7fFee5WdS3G',
                    'menu'                => array(
                    'slug'           => 'folioblocks-settings',
                    'contact'        => false,
                    'support'        => false,
                ),
            ) );
        }

        return $pb_fs;
        }

        // Init Freemius.
        pb_fs();
        // Signal that SDK was initiated.
        do_action( 'pb_fs_loaded' );

        // Disable annual pricing in monthly view
        pb_fs()->add_filter( 'pricing/show_annual_in_monthly', '__return_false' );

        pb_fs()->add_filter( 'pricing_url', function ( $url ) {
            return 'https://folioblocks.com/folioblocks-pricing/?utm_source=folioblocks-plugin&utm_medium=freemius&utm_campaign=in-plugin-upgrade';
        } );
        
        // Use custom icon in Freemius 
        function pb_fs_custom_icon() {
            return dirname( __FILE__ ) . '/includes/icons/pb-brand-icon.svg';
        }
        pb_fs()->add_filter( 'plugin_icon', 'pb_fs_custom_icon' );
    
        // Make url available to JS for Upgrade links and WooCommerce status
        add_action( 'enqueue_block_editor_assets', function () {
        if ( ! function_exists( 'is_plugin_active' ) ) {
            include_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $woo_active = is_plugin_active( 'woocommerce/woocommerce.php' );

        $data = [
            'checkoutUrl'    => pb_fs()->pricing_url(),
            'siteUrl'        => site_url(),
            'isPro'          => ( function_exists( 'pb_fs' ) && pb_fs()->can_use_premium_code() ),
            'hasWooCommerce' => $woo_active,
        ];

        wp_register_script(
            'folioblocks-shared-data',
            false,                // no external src; just a container for inline data
            array(),              // no dependencies
            filemtime( __FILE__ ), // version for cache-busting
            true
        );

        wp_add_inline_script(
            'folioblocks-shared-data',
            'window.folioBlocksData = ' . wp_json_encode( $data ) . ';',
            'before'
        );

        wp_enqueue_script( 'folioblocks-shared-data' );
    } );

    }
}

    // Add custom category for blocks.
    function folioblocks_add_category( $categories ) {
        $new_category = array(
            'slug'  => 'folioblocks',
            'title' => __( 'FolioBlocks', 'folioblocks' ),
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
    add_filter( 'block_categories_all', 'folioblocks_add_category', 10, 2 );

    // Register all FolioBlocks blocks.
    function folioblocks_folioblocks_block_init() {
        register_block_type( __DIR__ . '/build/pb-before-after-block' );
        register_block_type( __DIR__ . '/build/pb-image-block' );
        register_block_type( __DIR__ . '/build/pb-loupe-block' );
        register_block_type( __DIR__ . '/build/pb-video-block' );
        register_block_type( __DIR__ . '/build/carousel-gallery-block' );
        if ( pb_fs()->can_use_premium_code() ) {
            register_block_type( __DIR__ . '/build/filmstrip-gallery-block' );     
        }
        register_block_type( __DIR__ . '/build/grid-gallery-block' );
    	register_block_type( __DIR__ . '/build/justified-gallery-block' );
    	register_block_type( __DIR__ . '/build/masonry-gallery-block' );
        if ( pb_fs()->can_use_premium_code() ) {
            register_block_type( __DIR__ . '/build/modular-gallery-block' );
            register_block_type( __DIR__ . '/build/pb-image-row' );
    	    register_block_type( __DIR__ . '/build/pb-image-stack' ); 	     
        }
        register_block_type( __DIR__ . '/build/video-gallery-block' );
        
        
    }
    add_action( 'init', 'folioblocks_folioblocks_block_init' );

    // Filter to load block assets on demand.
    add_filter( 'should_load_block_assets_on_demand', '__return_true' );

    // Add Admin settings page.
    add_action( 'admin_menu', 'folioblocks_register_settings_page' );
    function folioblocks_register_settings_page() {
        $icon_url = plugin_dir_url( __FILE__ ) . 'includes/icons/pb-brand-icon.svg';
    	add_menu_page(
    		'FolioBlocks',        // Page title
    		'FolioBlocks',        // Menu title
    		'manage_options',          // Capability
    		'folioblocks-settings', // Slug
    		'folioblocks_render_settings_page', // Callback
    		$icon_url, // Icon
    		10 // Position 11 for media 80 for bottom
    	);
        add_submenu_page(
        'folioblocks-settings',         // Parent slug
        'Dashboard',                      // Page title
        'Dashboard',                      // Menu title (what appears in sidebar)
        'manage_options',
        'folioblocks-settings',         // SAME slug as main page
        'folioblocks_render_settings_page'
        );
        if ( ! function_exists( 'pb_fs' ) ||  ! pb_fs()->can_use_premium_code() ) {
            add_submenu_page(
                'folioblocks-settings',
                'Free vs Pro',
                'Free vs Pro',
                'manage_options',
                'folioblocks-free-vs-pro',
                'folioblocks_render_free_pro_page'
            );
        }
    }
    
    // Register System Info submenu page
    add_action( 'admin_menu', function() {
        add_submenu_page(
           'folioblocks-settings',
            'System Information',
            'System Info',
            'manage_options',
            'folioblocks-system-info',
            'folioblocks_render_system_info_page'
        );
    }, 99);
    // Load settings + system info pages
    require_once plugin_dir_path( __FILE__ ) . 'includes/admin/settings-page.php';
    require_once plugin_dir_path( __FILE__ ) . 'includes/admin/system-info.php';
    require_once plugin_dir_path( __FILE__ ) . 'includes/admin/free-pro.php';
    // Load CSS for Admin pages
    add_action( 'admin_enqueue_scripts', 'folioblocks_enqueue_admin_styles' );
    function folioblocks_enqueue_admin_styles() {
    	wp_enqueue_style(
    		'folioblocks-settings-css',
    		plugin_dir_url( __FILE__ ) . 'includes/admin/settings-page.css',
    		array(),
    		'1.0'
    	);
    }
    add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'folioblocks_plugin_action_links' );
    function folioblocks_plugin_action_links( $links ) {
    	$settings_link = '<a href="' . esc_url( admin_url( 'admin.php?page=folioblocks-settings' ) ) . '">' . __( 'Settings', 'folioblocks' ) . '</a>';
    	array_unshift( $links, $settings_link );
    	return $links;
    }

}

if ( pb_fs()->can_use_premium_code__premium_only() ) {
    // Removes the add-to-cart query arg from the URL after adding a product to the cart.
    add_action( 'template_redirect', function() {
	    if ( isset( $_GET['add-to-cart'] ) ) {
		    wp_safe_redirect( remove_query_arg( 'add-to-cart' ) );
		    exit;
	    }
    });

   
}
