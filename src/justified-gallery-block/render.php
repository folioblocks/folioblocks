<?php
/**
 * Justified Gallery Block
 * Render PHP
 **/

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$fbks_attributes = wp_parse_args($attributes, [
    'randomizeOrder' => false,
    'noGap' => false,
]);

$fbks_enable_filter   = $fbks_attributes['enableFilter'] ?? false;
$fbks_filter_align    = $fbks_attributes['filterAlign'] ?? 'center';
$fbks_active_filter   = 'All';
$fbks_filter_categories    = $fbks_attributes['filterCategories'] ?? [];

$fbks_extra_class = '';
if ( fbks_fs()->can_use_premium_code__premium_only() ) {
    $fbks_extra_class .= $fbks_attributes['randomizeOrder'] ? ' pb-randomized' : '';
}
$fbks_extra_class .= $fbks_attributes['noGap'] ? ' no-gap' : '';

$fbks_data_attr = '';
if ( fbks_fs()->can_use_premium_code__premium_only() ) {
    $fbks_data_attr = $fbks_attributes['randomizeOrder'] ? ' data-randomize="true"' : '';
}

$fbks_active_styles   = '';
$fbks_inactive_styles = '';

if ( fbks_fs()->can_use_premium_code__premium_only() ) {
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
}

$fbks_wrapper_args = [
    'class' => trim($fbks_extra_class),
    'style' => $fbks_active_styles . $fbks_inactive_styles,
];

if ( fbks_fs()->can_use_premium_code__premium_only() ) {
    if ( ! empty( $fbks_enable_filter ) ) {
        $fbks_wrapper_args['data-active-filter'] = $fbks_active_filter;
    }
    if ( ! empty( $fbks_attributes['disableRightClick'] ) ) {
        $fbks_wrapper_args['data-disable-right-click'] = 'true';
    }
    if ( ! empty( $fbks_attributes['enableDownload'] ) ) {
        $fbks_wrapper_args['data-enable-download'] = 'true';
    }
}

$fbks_wrapper_attributes = get_block_wrapper_attributes( $fbks_wrapper_args );

echo '<div ' . wp_kses_post( $fbks_wrapper_attributes ) . wp_kses_post( $fbks_data_attr ) . '>';

if ( fbks_fs()->can_use_premium_code__premium_only() ) {
    if ( $fbks_enable_filter && ! empty( $fbks_filter_categories ) ) {
        echo '<div class="pb-image-gallery-filters align-' . esc_attr( $fbks_filter_align ) . '">';
        echo '<button class="filter-button is-active" data-filter="All">All</button>';
        foreach ( $fbks_filter_categories as $fbks_category ) {
            echo '<button class="filter-button" data-filter="' . esc_attr( $fbks_category ) . '">' . esc_html( $fbks_category ) . '</button>';
        }
        echo '</div>';
    }
}

echo wp_kses_post( $content );

echo '</div>';