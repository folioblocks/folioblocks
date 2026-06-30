<?php

/**
 * Plugin Name:       FolioBlocks
 * Description:       Create fast, responsive photo and video gallery with grid, masonry, justified, modular, and carousel layouts—ideal for photographers and creatives.
 * Version:           1.5.0
 * Requires at least: 6.3
 * Requires PHP:      7.4
 * Author:            FolioBlocks
 * Author URI: https://folioblocks.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       folioblocks
 * Domain Path:       /languages
 *
 * @package FolioBlocks
 * 
 * @fs_premium_only /languages/, /includes/css/password-form.css, /build/modular-gallery-block/, /build/pb-image-row, /build/pb-image-stack/, /build/background-video-block/premium-view.asset.php, /build/background-video-block/premium-view.js, /build/background-video-block/premium.asset.php, /build/background-video-block/premium.js, /build/carousel-gallery-block/premium-view.asset.php, /build/carousel-gallery-block/premium-view.js, /build/carousel-gallery-block/premium.asset.php, /build/carousel-gallery-block/premium.js, /build/filmstrip-gallery-block/premium-view.asset.php, /build/filmstrip-gallery-block/premium-view.js, /build/filmstrip-gallery-block/premium.asset.php, /build/filmstrip-gallery-block/premium.js, /build/grid-gallery-block/premium-view.asset.php, /build/grid-gallery-block/premium-view.js, /build/grid-gallery-block/premium.asset.php, /build/grid-gallery-block/premium.js, /build/justified-gallery-block/premium-view.asset.php, /build/justified-gallery-block/premium-view.js, /build/justified-gallery-block/premium.asset.php, /build/justified-gallery-block/premium.js, /build/masonry-gallery-block/premium-view.asset.php, /build/masonry-gallery-block/premium-view.js, /build/masonry-gallery-block/premium.asset.php, /build/masonry-gallery-block/premium.js, /build/modular-gallery-block/premium-view.asset.php, /build/modular-gallery-block/premium-view.js, /build/modular-gallery-block/premium.asset.php, /build/modular-gallery-block/premium.js, /build/pb-before-after-block/premium-view.asset.php, /build/pb-before-after-block/premium-view.js, /build/pb-before-after-block/premium.asset.php, /build/pb-before-after-block/premium.js, /build/pb-image-block/premium-view.asset.php, /build/pb-image-block/premium-view.js, /build/pb-image-block/premium.asset.php, /build/pb-image-block/premium.js, /build/pb-image-block/premium-view.asset.php, /build/pb-loupe-block/premium-view.js, /build/pb-loupe-block/premium.asset.php, /build/pb-loupe-block/premium.js, /build/pb-video-block/premium-view.asset.php, /build/pb-video-block/premium-view.js, /build/pb-video-block/premium.asset.php, /build/pb-video-block/premium.js, /build/video-gallery-block/premium-view.asset.php, /build/video-gallery-block/premium-view.js, /build/video-gallery-block/premium.asset.php, /build/video-gallery-block/premium.js
 */

if (! defined('ABSPATH')) {
    exit;
}

define('FBKS_VERSION', '1.5.0');
define('FBKS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('FBKS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('FBKS_ALL_FILTER_TOKEN', 'all');
define('FBKS_LEGACY_ALL_FILTER_TOKEN', 'All');

require_once FBKS_PLUGIN_DIR . 'includes/php/filter-helpers.php';
require_once FBKS_PLUGIN_DIR . 'includes/php/css-values.php';
require_once FBKS_PLUGIN_DIR . 'includes/php/i18n.php';

/**
 * Ensure Safari can send the editor origin to external video embeds.
 *
 * Some security plugins and hosts replace WordPress's default admin referrer
 * policy with "no-referrer". Safari then ignores a less restrictive policy on
 * nested YouTube iframes, resulting in YouTube player Error 153.
 */
function fbks_block_editor_referrer_policy()
{
    return 'strict-origin-when-cross-origin';
}
add_filter('admin_referrer_policy', 'fbks_block_editor_referrer_policy', PHP_INT_MAX);

function fbks_block_editor_referrer_meta()
{
    $screen = get_current_screen();

    if (! $screen || ! method_exists($screen, 'is_block_editor') || ! $screen->is_block_editor()) {
        return;
    }

    echo '<meta name="referrer" content="strict-origin-when-cross-origin">' . "\n";
}
add_action('admin_head', 'fbks_block_editor_referrer_meta', 0);

if (function_exists('fbks_fs')) {
    fbks_fs()->set_basename(true, __FILE__);
} else {

    /**
     * DO NOT REMOVE THIS IF, IT IS ESSENTIAL FOR THE
     * `function_exists` CALL ABOVE TO PROPERLY WORK.
     */

    
        if ( ! function_exists( 'fbks_fs' ) ) {
    // Create a helper function for easy SDK access.
    function fbks_fs() {
        global $fbks_fs;

        if ( ! isset( $fbks_fs ) ) {
            // Include Freemius SDK.
            require_once dirname( __FILE__ ) . '/vendor/freemius/start.php';

            $fbks_fs = fs_dynamic_init( array(
                'id'                  => '19558',
                'slug'                => 'folioblocks',
                'premium_slug'        => 'folioblocks-pro',
                'type'                => 'plugin',
                'public_key'          => 'pk_9719a603d337d33af1a1193508cdf',
                'is_premium'          => true,
                'premium_suffix'      => '(Pro)',
                // If your plugin is a serviceware, set this option to false.
                'has_premium_version' => true,
                'has_addons'          => false,
                'has_paid_plans'      => true,
                'is_org_compliant'    => true,
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

        return $fbks_fs;
    }

    // Init Freemius.
    fbks_fs();
    // Signal that SDK was initiated.
    do_action( 'fbks_fs_loaded' );


            // Disable annual pricing in monthly view
            fbks_fs()->add_filter('pricing/show_annual_in_monthly', '__return_false');

            fbks_fs()->add_filter('pricing_url', function ($url) {
                return 'https://folioblocks.com/folioblocks-pricing/?utm_source=folioblocks-plugin&utm_medium=freemius&utm_campaign=in-plugin-upgrade';
            });

            // Use custom icon in Freemius 
            function fbks_fs_custom_icon()
            {
                return dirname(__FILE__) . '/includes/icons/pb-brand-icon.svg';
            }
            fbks_fs()->add_filter('plugin_icon', 'fbks_fs_custom_icon');

            // Make url available to JS for Upgrade links and WooCommerce status
            add_action('enqueue_block_editor_assets', function () {
                if (! function_exists('is_plugin_active')) {
                    include_once ABSPATH . 'wp-admin/includes/plugin.php';
                }

                $woo_active = is_plugin_active('woocommerce/woocommerce.php');

                $data = [
                    'checkoutUrl'    => fbks_fs()->pricing_url(),
                    'siteUrl'        => site_url(),
                    'wpVersion'      => get_bloginfo('version'),
                    'isPro'          => (function_exists('fbks_fs') && fbks_fs()->can_use_premium_code()),
                    'hasWooCommerce' => $woo_active,
                ];

                wp_register_script(
                    'folioblocks-shared-data',
                    false,                // no external src; just a container for inline data
                    array(),              // no dependencies
                    filemtime(__FILE__), // version for cache-busting
                    true
                );

                wp_add_inline_script(
                    'folioblocks-shared-data',
                    'window.folioBlocksData = ' . wp_json_encode($data) . ';',
                    'before'
                );

                wp_enqueue_script('folioblocks-shared-data');

                if (fbks_fs()->can_use_premium_code__premium_only()) {
                    $page_settings_path = FBKS_PLUGIN_DIR . 'includes/js/page-media-settings.js';
                    wp_enqueue_script(
                        'folioblocks-page-media-settings',
                        FBKS_PLUGIN_URL . 'includes/js/page-media-settings.js',
                        array('wp-components', 'wp-core-data', 'wp-data', 'wp-editor', 'wp-element', 'wp-hooks', 'wp-i18n', 'wp-plugins'),
                        file_exists($page_settings_path) ? filemtime($page_settings_path) : FBKS_VERSION,
                        true
                    );
                    wp_set_script_translations('folioblocks-page-media-settings', 'folioblocks');
                }
            });
        }

    // Add custom category for blocks.
    function fbks_add_category($categories)
    {
        $new_category = array(
            'slug'  => 'folioblocks',
            'title' => __('FolioBlocks', 'folioblocks'),
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
    add_filter('block_categories_all', 'fbks_add_category', 10, 2);

    // Register all FolioBlocks blocks.
    function fbks_block_init()
    {
        fbks_register_i18n_loader_script();

        $block_directories = array(
            __DIR__ . '/build/background-video-block',
            __DIR__ . '/build/pb-before-after-block',
            __DIR__ . '/build/carousel-gallery-block',
            __DIR__ . '/build/filmstrip-gallery-block',
            __DIR__ . '/build/grid-gallery-block',
            __DIR__ . '/build/pb-image-block',
            __DIR__ . '/build/justified-gallery-block',
            __DIR__ . '/build/pb-loupe-block',
            __DIR__ . '/build/masonry-gallery-block',
            __DIR__ . '/build/pb-video-block',
            __DIR__ . '/build/video-gallery-block',
        );

        if (fbks_fs()->can_use_premium_code()) {
            $block_directories[] = __DIR__ . '/build/modular-gallery-block';
            $block_directories[] = __DIR__ . '/build/pb-image-row';
            $block_directories[] = __DIR__ . '/build/pb-image-stack';
        }

        foreach ($block_directories as $block_directory) {
            register_block_type($block_directory);
            fbks_register_block_script_translations($block_directory);
        }
    }
    add_action('init', 'fbks_block_init');

    function fbks_register_page_media_settings_meta()
    {
        $post_types = get_post_types(array('show_in_rest' => true), 'names');
        $meta_args = array(
            'type'              => 'boolean',
            'single'            => true,
            'default'           => false,
            'show_in_rest'      => true,
            'sanitize_callback' => 'rest_sanitize_boolean',
            'auth_callback'     => function () {
                return current_user_can('edit_posts');
            },
        );

        foreach ($post_types as $post_type) {
            register_post_meta($post_type, 'fbksLazyLoad', $meta_args);
            register_post_meta($post_type, 'fbksDisableRightClick', $meta_args);
        }
    }
    add_action('init', 'fbks_register_page_media_settings_meta');

    function fbks_apply_page_media_settings_to_blocks($parsed_block)
    {
        if (! fbks_fs()->can_use_premium_code__premium_only()) {
            return $parsed_block;
        }

        $post_id = get_the_ID();
        if (! $post_id || empty($parsed_block['blockName'])) {
            return $parsed_block;
        }

        $lazy_load_blocks = array(
            'folioblocks/before-after-block',
            'folioblocks/carousel-gallery-block',
            'folioblocks/filmstrip-gallery-block',
            'folioblocks/grid-gallery-block',
            'folioblocks/justified-gallery-block',
            'folioblocks/masonry-gallery-block',
            'folioblocks/modular-gallery-block',
            'folioblocks/pb-image-block',
            'folioblocks/pb-video-block',
            'folioblocks/video-gallery-block',
        );
        $right_click_blocks = array(
            'folioblocks/background-video-block',
            'folioblocks/before-after-block',
            'folioblocks/carousel-gallery-block',
            'folioblocks/filmstrip-gallery-block',
            'folioblocks/grid-gallery-block',
            'folioblocks/justified-gallery-block',
            'folioblocks/masonry-gallery-block',
            'folioblocks/modular-gallery-block',
            'folioblocks/pb-image-block',
            'folioblocks/pb-loupe-block',
            'folioblocks/pb-video-block',
            'folioblocks/video-gallery-block',
        );

        if (
            in_array($parsed_block['blockName'], $lazy_load_blocks, true) &&
            metadata_exists('post', $post_id, 'fbksLazyLoad')
        ) {
            $parsed_block['attrs']['lazyLoad'] = (bool) get_post_meta($post_id, 'fbksLazyLoad', true);
        }

        if (
            in_array($parsed_block['blockName'], $right_click_blocks, true) &&
            metadata_exists('post', $post_id, 'fbksDisableRightClick')
        ) {
            $parsed_block['attrs']['disableRightClick'] = (bool) get_post_meta($post_id, 'fbksDisableRightClick', true);
        }

        return $parsed_block;
    }
    add_filter('render_block_data', 'fbks_apply_page_media_settings_to_blocks');

    function fbks_enforce_page_media_settings_on_rendered_blocks($block_content, $block)
    {
        if (
            ! fbks_fs()->can_use_premium_code__premium_only() ||
            empty($block['blockName']) ||
            '' === $block_content
        ) {
            return $block_content;
        }

        $post_id = get_the_ID();
        if (! $post_id) {
            return $block_content;
        }

        $lazy_load_blocks = array(
            'folioblocks/before-after-block',
            'folioblocks/carousel-gallery-block',
            'folioblocks/filmstrip-gallery-block',
            'folioblocks/grid-gallery-block',
            'folioblocks/justified-gallery-block',
            'folioblocks/masonry-gallery-block',
            'folioblocks/modular-gallery-block',
            'folioblocks/pb-image-block',
            'folioblocks/pb-video-block',
            'folioblocks/video-gallery-block',
        );
        $right_click_blocks = array(
            'folioblocks/background-video-block',
            'folioblocks/before-after-block',
            'folioblocks/carousel-gallery-block',
            'folioblocks/filmstrip-gallery-block',
            'folioblocks/grid-gallery-block',
            'folioblocks/justified-gallery-block',
            'folioblocks/masonry-gallery-block',
            'folioblocks/modular-gallery-block',
            'folioblocks/pb-image-block',
            'folioblocks/pb-loupe-block',
            'folioblocks/pb-video-block',
            'folioblocks/video-gallery-block',
        );

        if (
            in_array($block['blockName'], $lazy_load_blocks, true) &&
            metadata_exists('post', $post_id, 'fbksLazyLoad')
        ) {
            $lazy_load = (bool) get_post_meta($post_id, 'fbksLazyLoad', true);
            $block_content = str_replace(
                $lazy_load ? 'loading="eager"' : 'loading="lazy"',
                $lazy_load ? 'loading="lazy"' : 'loading="eager"',
                $block_content
            );
            $block_content = str_replace(
                $lazy_load ? '"lazyLoad":false' : '"lazyLoad":true',
                $lazy_load ? '"lazyLoad":true' : '"lazyLoad":false',
                $block_content
            );
        }

        if (
            in_array($block['blockName'], $right_click_blocks, true) &&
            metadata_exists('post', $post_id, 'fbksDisableRightClick') &&
            class_exists('WP_HTML_Tag_Processor')
        ) {
            $processor = new WP_HTML_Tag_Processor($block_content);
            if ($processor->next_tag()) {
                if ((bool) get_post_meta($post_id, 'fbksDisableRightClick', true)) {
                    $processor->set_attribute('data-disable-right-click', 'true');
                } else {
                    $processor->remove_attribute('data-disable-right-click');
                }
                $block_content = $processor->get_updated_html();
            }
        }

        return $block_content;
    }
    add_filter('render_block', 'fbks_enforce_page_media_settings_on_rendered_blocks', 10, 2);

    // Filter to load block assets on demand.
    add_filter('should_load_block_assets_on_demand', '__return_true');

    // Add Admin settings page.
    add_action('admin_menu', 'fbks_register_settings_page');
    function fbks_register_settings_page()
    {
        $icon_path = plugin_dir_path(__FILE__) . 'includes/icons/pb-brand-icon-bw.svg';
        $icon_url = add_query_arg(
            'ver',
            file_exists($icon_path) ? filemtime($icon_path) : FBKS_VERSION,
            plugin_dir_url(__FILE__) . 'includes/icons/pb-brand-icon-bw.svg'
        );
        add_menu_page(
            __('FolioBlocks', 'folioblocks'),        // Page title
            __('FolioBlocks', 'folioblocks'),        // Menu title
            'manage_options',          // Capability
            'folioblocks-settings', // Slug
            'fbks_render_settings_page', // Callback
            $icon_url, // Icon
            10 // Position 11 for media 80 for bottom
        );
        add_submenu_page(
            'folioblocks-settings',         // Parent slug
            __('Dashboard', 'folioblocks'),                      // Page title
            __('Dashboard', 'folioblocks'),                      // Menu title (what appears in sidebar)
            'manage_options',
            'folioblocks-settings',         // SAME slug as main page
            'fbks_render_settings_page'
        );
        add_submenu_page(
            'folioblocks-settings',
            __('Global Settings', 'folioblocks'),
            __('Global Settings', 'folioblocks'),
            'manage_options',
            'folioblocks-global-settings',
            'fbks_render_global_settings_page'
        );
        if (! fbks_fs()->can_use_premium_code__premium_only()) {
            add_submenu_page(
                'folioblocks-settings',
                __('Free vs Pro', 'folioblocks'),
                __('Free vs Pro', 'folioblocks'),
                'manage_options',
                'folioblocks-free-vs-pro',
                'fbks_render_free_pro_page'
            );
        }
    }

    add_action('admin_head', 'fbks_admin_menu_icon_styles');
    function fbks_admin_menu_icon_styles()
    {
        echo '<style id="folioblocks-admin-menu-icon">#adminmenu #toplevel_page_folioblocks-settings .wp-menu-image img{width:18px;height:18px;max-width:18px;max-height:18px;object-fit:contain;padding-top:7px;opacity:.8;filter:brightness(0) invert(1);}#adminmenu #toplevel_page_folioblocks-settings.current .wp-menu-image img,#adminmenu #toplevel_page_folioblocks-settings.wp-has-current-submenu .wp-menu-image img{opacity:1;}</style>';
    }

    // Register System Info submenu page
    add_action('admin_menu', function () {
        add_submenu_page(
            'folioblocks-settings',
            __('System Information', 'folioblocks'),
            __('System Info', 'folioblocks'),
            'manage_options',
            'folioblocks-system-info',
            'fbks_render_system_info_page'
        );
    }, 99);
    // Load settings + system info pages
    require_once plugin_dir_path(__FILE__) . 'includes/admin/common.php';
    require_once plugin_dir_path(__FILE__) . 'includes/admin/review-request.php';
    require_once plugin_dir_path(__FILE__) . 'includes/admin/settings-page.php';
    require_once plugin_dir_path(__FILE__) . 'includes/admin/global-settings.php';
    require_once plugin_dir_path(__FILE__) . 'includes/admin/system-info.php';
    require_once plugin_dir_path(__FILE__) . 'includes/admin/free-pro.php';
    // Load CSS for Admin pages
    add_action('admin_enqueue_scripts', 'fbks_enqueue_admin_styles');
    function fbks_enqueue_admin_styles($hook)
    {
        $admin_pages = array(
            'toplevel_page_folioblocks-settings',
            'folioblocks_page_folioblocks-global-settings',
            'folioblocks_page_folioblocks-free-vs-pro',
            'folioblocks_page_folioblocks-system-info',
        );

        if (! in_array($hook, $admin_pages, true)) {
            return;
        }

        if ('folioblocks_page_folioblocks-global-settings' === $hook) {
            wp_enqueue_media();
        }

        $style_path = plugin_dir_path(__FILE__) . 'includes/admin/settings-page.css';

        wp_enqueue_style(
            'folioblocks-settings-css',
            plugin_dir_url(__FILE__) . 'includes/admin/settings-page.css',
            array(),
            file_exists($style_path) ? filemtime($style_path) : FBKS_VERSION
        );
    }
    add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'fbks_plugin_action_links');
    function fbks_plugin_action_links($links)
    {
        $settings_link = '<a href="' . esc_url(admin_url('admin.php?page=folioblocks-settings')) . '">' . __('Settings', 'folioblocks') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }

    require_once plugin_dir_path(__FILE__) . 'includes/php/exif-metadata.php';
    require_once plugin_dir_path(__FILE__) . 'includes/php/svg-allowed-html.php';
}

if (fbks_fs()->can_use_premium_code__premium_only()) {
    add_action('wp_enqueue_scripts', function () {
        if (! is_singular(array('post', 'page')) || ! post_password_required()) {
            return;
        }

        $style_path = FBKS_PLUGIN_DIR . 'includes/css/password-form.css';
        wp_enqueue_style(
            'folioblocks-password-form',
            FBKS_PLUGIN_URL . 'includes/css/password-form.css',
            array(),
            file_exists($style_path) ? filemtime($style_path) : FBKS_VERSION
        );
    });

    // Removes the add-to-cart query arg from the URL after adding a product to the cart.
    add_action('template_redirect', function () {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- WooCommerce uses add-to-cart as a public GET action; this only removes the query arg after WooCommerce has handled it.
        if (isset($_GET['add-to-cart'])) {
            wp_safe_redirect(remove_query_arg('add-to-cart'));
            exit;
        }
    });
}
