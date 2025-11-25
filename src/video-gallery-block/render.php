<?php
/**
 * Video Gallery Block
 * Render PHP
 **/

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$port_columns_desktop = intval( $attributes['columns'] ?? 3 );
$port_columns_tablet  = intval( $attributes['tabletColumns'] ?? 2 );
$port_columns_mobile  = intval( $attributes['mobileColumns'] ?? 1 );
$port_gap             = intval( $attributes['gap'] ?? 10 );

if ( pb_fs()->can_use_premium_code__premium_only() ) {
	$enable_filter    = ! empty( $attributes['enableFilter'] );
	$filter_align     = $attributes['filterAlign'] ?? 'center';
	$active_filter   = $attributes['activeFilter'] ?? 'All';
	$filter_categories = $attributes['filterCategories'] ?? [];

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

	if ( $enable_filter ) {
		$port_wrapper_attributes = get_block_wrapper_attributes([
			'data-active-filter' => $active_filter,
			'style'              => $active_styles . $inactive_styles,
		]);
	}
}

if ( ! pb_fs()->can_use_premium_code__premium_only() || empty( $enable_filter ) ) {
    $port_wrapper_attributes = get_block_wrapper_attributes();
}

echo '<div ' . wp_kses_post( $port_wrapper_attributes ) . '>';

if ( pb_fs()->can_use_premium_code__premium_only() ) {
	if ( ! empty( $enable_filter ) && ! empty( $filter_categories ) ) {
		echo '<div class="pb-video-gallery-filters align-' . esc_attr( $filter_align ) . '">';
		echo '<button class="filter-button is-active" data-filter="All">All</button>';
		foreach ( $filter_categories as $category ) {
			echo '<button class="filter-button" data-filter="' . esc_attr( $category ) . '">' . esc_html( $category ) . '</button>';
		}
		echo '</div>';
	}
}

echo wp_kses_post( $content );

echo '</div>';
