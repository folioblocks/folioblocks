<?php
/**
 * Masonry Gallery Block
 * Render PHP
 **/


if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$port_attributes = wp_parse_args($attributes, [
    'randomizeOrder' => false,
    'noGap' => false,
]);

$port_extra_class = '';
$port_data_attr = '';

if ( pb_fs()->can_use_premium_code__premium_only() ) {
    $enable_filter   = $port_attributes['enableFilter'] ?? false;
    $filter_align    = $port_attributes['filterAlign'] ?? 'center';
    $active_filter   = 'All';
    $filter_categories    = $port_attributes['filterCategories'] ?? [];

    $port_extra_class .= $port_attributes['randomizeOrder'] ? ' pb-randomized' : '';
    $port_data_attr = $port_attributes['randomizeOrder'] ? ' data-randomize="true"' : '';

    $active_styles   = '';
    $inactive_styles = '';

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
}

$port_extra_class .= $port_attributes['noGap'] ? ' no-gap' : '';

$port_wrapper_args = [
    'class' => trim($port_extra_class),
];

if ( pb_fs()->can_use_premium_code__premium_only() ) {
    $port_wrapper_args['style'] = $active_styles . $inactive_styles;

    if ( ! empty( $enable_filter ) ) {
        $port_wrapper_args['data-active-filter'] = $active_filter;
    }

    if ( ! empty( $port_attributes['disableRightClick'] ) ) {
        $port_wrapper_args['data-disable-right-click'] = 'true';
    }

    if ( ! empty( $port_attributes['enableDownload'] ) ) {
        $port_wrapper_args['data-enable-download'] = 'true';
    }
}

$port_wrapper_attributes = get_block_wrapper_attributes( $port_wrapper_args );

echo '<div ' . wp_kses_post( $port_wrapper_attributes ) . wp_kses_post( $port_data_attr ) . '>';

if ( pb_fs()->can_use_premium_code__premium_only() ) {
    if ( $enable_filter && ! empty( $filter_categories ) ) {
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