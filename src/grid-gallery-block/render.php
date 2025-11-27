<?php
/**
 * Grid Gallery Block
 * Render PHP
 **/


if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$fbks_attributes = wp_parse_args($attributes, [
    'randomizeOrder' => false,
]);

// Define wrapper attributes normally for free features.
$fbks_extra_class = '';
$fbks_data_attr   = '';
$fbks_wrapper_attributes_args = [
    'class' => 'is-loading',
];

// Filtering feature
$fbks_enable_filter      = $fbks_attributes['enableFilter'] ?? false;
$fbks_filter_align       = $fbks_attributes['filterAlign'] ?? 'center';
$fbks_active_filter      = 'All';
$fbks_filter_categories  = $fbks_attributes['filterCategories'] ?? [];

$fbks_active_styles   = '';
$fbks_inactive_styles = '';

//  Premium-only logic
if ( fbks_fs()->can_use_premium_code__premium_only() ) {
    // Randomize order
    if ( ! empty( $fbks_attributes['randomizeOrder'] ) ) {
        $fbks_extra_class = ' pb-randomized';
        $fbks_data_attr   = ' data-randomize="true"';
        $fbks_wrapper_attributes_args['class'] .= $fbks_extra_class;
    }

    if ( $fbks_enable_filter ) {
        if ( ! empty( $fbks_attributes['activeFilterTextColor'] ) ) {
            $fbks_active_styles .= '--pb--filter-active-text:' . esc_attr( $fbks_attributes['activeFilterTextColor'] ) . ';';
        }
        if ( ! empty( $fbks_attributes['activeFilterBgColor'] ) ) {
            $fbks_active_styles .= '--pb--filter-active-bg:' . esc_attr( $fbks_attributes['activeFilterBgColor'] ) . ';';
        }
        if ( ! empty( $fbks_attributes['filterTextColor'] ) ) {
            $fbks_inactive_styles .= '--pb--filter-text-color:' . esc_attr( $fbks_attributes['filterTextColor'] ) . ';';
        }
        if ( ! empty( $fbks_attributes['filterBgColor'] ) ) {
            $fbks_inactive_styles .= '--pb--filter-bg-color:' . esc_attr( $fbks_attributes['filterBgColor'] ) . ';';
        }
    }

    $fbks_wrapper_attributes_args['style'] = $fbks_active_styles . $fbks_inactive_styles;

    if ( ! empty( $fbks_enable_filter ) ) {
        $fbks_wrapper_attributes_args['data-active-filter'] = $fbks_active_filter;
    }

    // Disable right-click
    if ( ! empty( $fbks_attributes['disableRightClick'] ) ) {
        $fbks_wrapper_attributes_args['data-disable-right-click'] = 'true';
    }

    // Enable download
    if ( ! empty( $fbks_attributes['enableDownload'] ) ) {
        $fbks_wrapper_attributes_args['data-enable-download'] = 'true';
    }
}

$fbks_wrapper_attributes = get_block_wrapper_attributes( $fbks_wrapper_attributes_args );

echo '<div ' . wp_kses_post( $fbks_wrapper_attributes ) . '>';

// Premium: Render filter bar only for premium
if ( fbks_fs()->can_use_premium_code__premium_only() ) {
    if ( !empty($fbks_enable_filter) && !empty($fbks_filter_categories) ) {
        echo '<div class="pb-image-gallery-filters align-' . esc_attr( $fbks_filter_align ) . '">';
        echo '<button class="filter-button is-active" data-filter="All">All</button>';
        foreach ( $fbks_filter_categories as $category ) {
            echo '<button class="filter-button" data-filter="' . esc_attr( $category ) . '">' . esc_html( $category ) . '</button>';
        }
        echo '</div>';
    }
}

echo wp_kses_post( $content );

echo '</div>';
?>