<?php
/**
 * Grid Gallery Block
 * Render PHP
 **/


if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$attributes = wp_parse_args($attributes, [
    'randomizeOrder' => false,
]);

// Define wrapper attributes normally for free features.
$extra_class = '';
$data_attr   = '';
$wrapper_attributes_args = [
    'class' => 'is-loading',
];

//  Premium-only logic
if ( pb_fs()->can_use_premium_code__premium_only() ) {
    // Randomize order
    if ( ! empty( $attributes['randomizeOrder'] ) ) {
        $extra_class = ' pb-randomized';
        $data_attr   = ' data-randomize="true"';
        $wrapper_attributes_args['class'] .= $extra_class;
    }

    // Filtering feature
    $enable_filter      = $attributes['enableFilter'] ?? false;
    $filter_align       = $attributes['filterAlign'] ?? 'center';
    $active_filter      = 'All';
    $filter_categories  = $attributes['filterCategories'] ?? [];

    $active_styles   = '';
    $inactive_styles = '';

    if ( $enable_filter ) {
        if ( ! empty( $attributes['activeFilterTextColor'] ) ) {
            $active_styles .= '--pb--filter-active-text:' . esc_attr( $attributes['activeFilterTextColor'] ) . ';';
        }
        if ( ! empty( $attributes['activeFilterBgColor'] ) ) {
            $active_styles .= '--pb--filter-active-bg:' . esc_attr( $attributes['activeFilterBgColor'] ) . ';';
        }
        if ( ! empty( $attributes['filterTextColor'] ) ) {
            $inactive_styles .= '--pb--filter-text-color:' . esc_attr( $attributes['filterTextColor'] ) . ';';
        }
        if ( ! empty( $attributes['filterBgColor'] ) ) {
            $inactive_styles .= '--pb--filter-bg-color:' . esc_attr( $attributes['filterBgColor'] ) . ';';
        }
    }

    $wrapper_attributes_args['style'] = $active_styles . $inactive_styles;

    if ( ! empty( $enable_filter ) ) {
        $wrapper_attributes_args['data-active-filter'] = $active_filter;
    }

    // Disable right-click
    if ( ! empty( $attributes['disableRightClick'] ) ) {
        $wrapper_attributes_args['data-disable-right-click'] = 'true';
    }

    // Enable download
    if ( ! empty( $attributes['enableDownload'] ) ) {
        $wrapper_attributes_args['data-enable-download'] = 'true';
    }
}

$wrapper_attributes = get_block_wrapper_attributes( $wrapper_attributes_args );

echo '<div ' . wp_kses_post( $wrapper_attributes ) . '>';

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