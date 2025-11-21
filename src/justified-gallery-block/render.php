<?php
/**
 * Justified Gallery Block
 * Render PHP
 **/

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$attributes = wp_parse_args($attributes, [
    'randomizeOrder' => false,
    'noGap' => false,
]);

$pb_enable_filter   = $attributes['enableFilter'] ?? false;
$pb_filter_align    = $attributes['filterAlign'] ?? 'center';
$pb_active_filter   = 'All';
$pb_filter_categories    = $attributes['filterCategories'] ?? [];

$pb_extra_class = '';
if ( pb_fs()->can_use_premium_code__premium_only() ) {
    $pb_extra_class .= $attributes['randomizeOrder'] ? ' pb-randomized' : '';
}
$pb_extra_class .= $attributes['noGap'] ? ' no-gap' : '';

$pb_data_attr = '';
if ( pb_fs()->can_use_premium_code__premium_only() ) {
    $pb_data_attr = $attributes['randomizeOrder'] ? ' data-randomize="true"' : '';
}

$pb_active_styles   = '';
$pb_inactive_styles = '';

if ( pb_fs()->can_use_premium_code__premium_only() ) {
    if ( $pb_enable_filter ) {
        if ( ! empty( $attributes['activeFilterTextColor'] ) ) {
            $pb_active_styles .= '--pb--filter-active-text:' . esc_attr( $attributes['activeFilterTextColor'] ) . ';';
        }
        if ( ! empty( $attributes['activeFilterBgColor'] ) ) {
            $pb_active_styles .= '--pb--filter-active-bg:' . esc_attr( $attributes['activeFilterBgColor'] ) . ';';
        }
        if ( ! empty( $attributes['filterTextColor'] ) ) {
            $pb_inactive_styles .= '--pb--filter-text-color:' . esc_attr( $attributes['filterTextColor'] ) . ';';
        }
        if ( ! empty( $attributes['filterBgColor'] ) ) {
            $pb_inactive_styles .= '--pb--filter-bg-color:' . esc_attr( $attributes['filterBgColor'] ) . ';';
        }
    }
}

$pb_wrapper_args = [
    'class' => trim($pb_extra_class),
    'style' => $pb_active_styles . $pb_inactive_styles,
];

if ( pb_fs()->can_use_premium_code__premium_only() ) {
    if ( ! empty( $pb_enable_filter ) ) {
        $pb_wrapper_args['data-active-filter'] = $pb_active_filter;
    }
    if ( ! empty( $attributes['disableRightClick'] ) ) {
        $pb_wrapper_args['data-disable-right-click'] = 'true';
    }
    if ( ! empty( $attributes['enableDownload'] ) ) {
        $pb_wrapper_args['data-enable-download'] = 'true';
    }
}

$pb_wrapper_attributes = get_block_wrapper_attributes( $pb_wrapper_args );

echo '<div ' . wp_kses_post( $pb_wrapper_attributes ) . wp_kses_post( $pb_data_attr ) . '>';

if ( pb_fs()->can_use_premium_code__premium_only() ) {
    if ( $pb_enable_filter && ! empty( $pb_filter_categories ) ) {
        echo '<div class="pb-image-gallery-filters align-' . esc_attr( $pb_filter_align ) . '">';
        echo '<button class="filter-button is-active" data-filter="All">All</button>';
        foreach ( $pb_filter_categories as $category ) {
            echo '<button class="filter-button" data-filter="' . esc_attr( $category ) . '">' . esc_html( $category ) . '</button>';
        }
        echo '</div>';
    }
}

echo wp_kses_post( $content );

echo '</div>';