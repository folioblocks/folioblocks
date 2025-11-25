<?php
/**
 * Justified Gallery Block
 * Render PHP
 **/

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$port_attributes = wp_parse_args($attributes, [
    'randomizeOrder' => false,
    'noGap' => false,
]);

$port_enable_filter   = $port_attributes['enableFilter'] ?? false;
$port_filter_align    = $port_attributes['filterAlign'] ?? 'center';
$port_active_filter   = 'All';
$port_filter_categories    = $port_attributes['filterCategories'] ?? [];

$port_extra_class = '';
if ( pb_fs()->can_use_premium_code__premium_only() ) {
    $port_extra_class .= $port_attributes['randomizeOrder'] ? ' pb-randomized' : '';
}
$port_extra_class .= $port_attributes['noGap'] ? ' no-gap' : '';

$port_data_attr = '';
if ( pb_fs()->can_use_premium_code__premium_only() ) {
    $port_data_attr = $port_attributes['randomizeOrder'] ? ' data-randomize="true"' : '';
}

$port_active_styles   = '';
$port_inactive_styles = '';

if ( pb_fs()->can_use_premium_code__premium_only() ) {
    if ( $port_enable_filter ) {
        if ( ! empty( $port_attributes['activeFilterTextColor'] ) ) {
            $port_active_styles .= '--pb--filter-active-text:' . esc_attr( $port_attributes['activeFilterTextColor'] ) . ';';
        }
        if ( ! empty( $port_attributes['activeFilterBgColor'] ) ) {
            $port_active_styles .= '--pb--filter-active-bg:' . esc_attr( $port_attributes['activeFilterBgColor'] ) . ';';
        }
        if ( ! empty( $port_attributes['filterTextColor'] ) ) {
            $port_inactive_styles .= '--pb--filter-text-color:' . esc_attr( $port_attributes['filterTextColor'] ) . ';';
        }
        if ( ! empty( $port_attributes['filterBgColor'] ) ) {
            $port_inactive_styles .= '--pb--filter-bg-color:' . esc_attr( $port_attributes['filterBgColor'] ) . ';';
        }
    }
}

$port_wrapper_args = [
    'class' => trim($port_extra_class),
    'style' => $port_active_styles . $port_inactive_styles,
];

if ( pb_fs()->can_use_premium_code__premium_only() ) {
    if ( ! empty( $port_enable_filter ) ) {
        $port_wrapper_args['data-active-filter'] = $port_active_filter;
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
    if ( $port_enable_filter && ! empty( $port_filter_categories ) ) {
        echo '<div class="pb-image-gallery-filters align-' . esc_attr( $port_filter_align ) . '">';
        echo '<button class="filter-button is-active" data-filter="All">All</button>';
        foreach ( $port_filter_categories as $category ) {
            echo '<button class="filter-button" data-filter="' . esc_attr( $category ) . '">' . esc_html( $category ) . '</button>';
        }
        echo '</div>';
    }
}

echo wp_kses_post( $content );

echo '</div>';