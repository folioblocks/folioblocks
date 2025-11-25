<?php
/**
 * Grid Gallery Block
 * Render PHP
 **/


if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$port_attributes = wp_parse_args($attributes, [
    'randomizeOrder' => false,
]);

// Define wrapper attributes normally for free features.
$port_extra_class = '';
$port_data_attr   = '';
$port_wrapper_attributes_args = [
    'class' => 'is-loading',
];

// Filtering feature
$enable_filter      = $port_attributes['enableFilter'] ?? false;
$filter_align       = $port_attributes['filterAlign'] ?? 'center';
$active_filter      = 'All';
$filter_categories  = $port_attributes['filterCategories'] ?? [];

$active_styles   = '';
$inactive_styles = '';

//  Premium-only logic
if ( pb_fs()->can_use_premium_code__premium_only() ) {
    // Randomize order
    if ( ! empty( $port_attributes['randomizeOrder'] ) ) {
        $port_extra_class = ' pb-randomized';
        $port_data_attr   = ' data-randomize="true"';
        $port_wrapper_attributes_args['class'] .= $port_extra_class;
    }

    if ( $enable_filter ) {
        if ( ! empty( $port_attributes['activeFilterTextColor'] ) ) {
            $active_styles .= '--pb--filter-active-text:' . esc_attr( $port_attributes['activeFilterTextColor'] ) . ';';
        }
        if ( ! empty( $port_attributes['activeFilterBgColor'] ) ) {
            $active_styles .= '--pb--filter-active-bg:' . esc_attr( $port_attributes['activeFilterBgColor'] ) . ';';
        }
        if ( ! empty( $port_attributes['filterTextColor'] ) ) {
            $inactive_styles .= '--pb--filter-text-color:' . esc_attr( $port_attributes['filterTextColor'] ) . ';';
        }
        if ( ! empty( $port_attributes['filterBgColor'] ) ) {
            $inactive_styles .= '--pb--filter-bg-color:' . esc_attr( $port_attributes['filterBgColor'] ) . ';';
        }
    }

    $port_wrapper_attributes_args['style'] = $active_styles . $inactive_styles;

    if ( ! empty( $enable_filter ) ) {
        $port_wrapper_attributes_args['data-active-filter'] = $active_filter;
    }

    // Disable right-click
    if ( ! empty( $port_attributes['disableRightClick'] ) ) {
        $port_wrapper_attributes_args['data-disable-right-click'] = 'true';
    }

    // Enable download
    if ( ! empty( $port_attributes['enableDownload'] ) ) {
        $port_wrapper_attributes_args['data-enable-download'] = 'true';
    }
}

$port_wrapper_attributes = get_block_wrapper_attributes( $port_wrapper_attributes_args );

echo '<div ' . wp_kses_post( $port_wrapper_attributes ) . '>';

// Premium: Render filter bar only for premium
if ( pb_fs()->can_use_premium_code__premium_only() ) {
    if ( !empty($enable_filter) && !empty($filter_categories) ) {
        echo '<div class="pb-image-gallery-filters align-' . esc_attr( $filter_align ) . '">';
        echo '<button class="filter-button is-active" data-filter="All">All</button>';
        foreach ( $filter_categories as $category ) {
            echo '<button class="filter-button" data-filter="' . esc_attr( $category ) . '">' . esc_html( $category ) . '</button>';
        }
        echo '</div>';
    }
}

echo wp_kses_post( $content );

echo '</div>';
?>