<?php
/**
 * Gallery icons for the WordPress Icon block.
 *
 * @package FolioBlocks
 */

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Register the FolioBlocks collection and its bundled gallery artwork.
 */
function fbks_register_gallery_icons()
{
    if (! function_exists('wp_register_icon_collection') || ! function_exists('wp_register_icon')) {
        return;
    }

    wp_register_icon_collection('folioblocks', array(
        'label'       => __('FolioBlocks', 'folioblocks'),
        'description' => __('Gallery icons from FolioBlocks Pro.', 'folioblocks'),
    ));

    $icons = array(
        'carousel-gallery'  => __('Carousel Gallery', 'folioblocks'),
        'filmstrip-gallery' => __('Filmstrip Gallery', 'folioblocks'),
        'grid-gallery'      => __('Grid Gallery', 'folioblocks'),
        'justified-gallery' => __('Justified Gallery', 'folioblocks'),
        'masonry-gallery'   => __('Masonry Gallery', 'folioblocks'),
        'modular-gallery'   => __('Modular Gallery', 'folioblocks'),
        'proofing-gallery'  => __('Proofing Gallery', 'folioblocks'),
        'video-gallery'     => __('Video Gallery', 'folioblocks'),
    );

    foreach ($icons as $slug => $label) {
        wp_register_icon('folioblocks/' . $slug, array(
            'label'     => $label,
            'file_path' => FBKS_PLUGIN_DIR . 'includes/icons/pb-' . $slug . '.svg',
        ));
    }
}
add_action('init', 'fbks_register_gallery_icons');
