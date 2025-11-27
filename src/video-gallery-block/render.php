<?php
/**
 * Video Gallery Block
 * Render PHP
 **/

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$fbks_enable_filter    = false;
$fbks_filter_align     = 'center';
$fbks_active_filter    = 'All';
$fbks_filter_categories = [];
$fbks_active_styles    = '';
$fbks_inactive_styles  = '';

$fbks_columns_desktop = intval( $attributes['columns'] ?? 3 );
$fbks_columns_tablet  = intval( $attributes['tabletColumns'] ?? 2 );
$fbks_columns_mobile  = intval( $attributes['mobileColumns'] ?? 1 );
$fbks_gap             = intval( $attributes['gap'] ?? 10 );

if ( fbks_fs()->can_use_premium_code__premium_only() ) {
	$fbks_enable_filter    = ! empty( $attributes['enableFilter'] );
	$fbks_filter_align     = $attributes['filterAlign'] ?? 'center';
	$fbks_active_filter    = $attributes['activeFilter'] ?? 'All';
	$fbks_filter_categories = $attributes['filterCategories'] ?? [];

	if ( $fbks_enable_filter ) {
		if ( ! empty( $attributes['activeFilterTextColor'] ) ) {
			$fbks_active_styles .= '--pb--filter-active-text:' . esc_attr( $attributes['activeFilterTextColor'] ) . ';';
		}
		if ( ! empty( $attributes['activeFilterBgColor'] ) ) {
			$fbks_active_styles .= '--pb--filter-active-bg:' . esc_attr( $attributes['activeFilterBgColor'] ) . ';';
		}
		if ( ! empty( $attributes['filterTextColor'] ) ) {
			$fbks_inactive_styles .= '--pb--filter-text-color:' . esc_attr( $attributes['filterTextColor'] ) . ';';
		}
		if ( ! empty( $attributes['filterBgColor'] ) ) {
			$fbks_inactive_styles .= '--pb--filter-bg-color:' . esc_attr( $attributes['filterBgColor'] ) . ';';
		}
	}
}

// Default wrapper attributes
$fbks_wrapper_attributes = get_block_wrapper_attributes();

// Premium filtering attributes override
if ( fbks_fs()->can_use_premium_code__premium_only() ) {
  	if ( ! empty( $fbks_enable_filter ) ) {
		$fbks_wrapper_attributes = get_block_wrapper_attributes([
			'data-active-filter' => $fbks_active_filter,
			'style'              => $fbks_active_styles . $fbks_inactive_styles,
		]);
	}
}

echo '<div ' . wp_kses_post( $fbks_wrapper_attributes ) . '>';

if ( fbks_fs()->can_use_premium_code__premium_only() ) {
	if ( ! empty( $fbks_enable_filter ) && ! empty( $fbks_filter_categories ) ) {
		echo '<div class="pb-video-gallery-filters align-' . esc_attr( $fbks_filter_align ) . '">';
		echo '<button class="filter-button is-active" data-filter="All">All</button>';
		foreach ( $fbks_filter_categories as $fbks_category ) {
			echo '<button class="filter-button" data-filter="' . esc_attr( $fbks_category ) . '">' . esc_html( $fbks_category ) . '</button>';
		}
		echo '</div>';
	}
}

echo wp_kses_post( $content );

echo '</div>';
