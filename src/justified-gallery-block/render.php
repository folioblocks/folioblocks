<?php
$attributes = wp_parse_args($attributes, [
    'randomizeOrder' => false,
    'noGap' => false,
]);

$enable_filter   = $attributes['enableFilter'] ?? false;
$filter_align    = $attributes['filterAlign'] ?? 'center';
$active_filter   = 'All';
$filter_categories    = $attributes['filterCategories'] ?? [];

$extra_class = '';
$extra_class .= $attributes['randomizeOrder'] ? ' pb-randomized' : '';
$extra_class .= $attributes['noGap'] ? ' no-gap' : '';

$data_attr = $attributes['randomizeOrder'] ? ' data-randomize="true"' : '';

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

$wrapper_args = [
    'class' => trim($extra_class),
    'style' => $active_styles . $inactive_styles,
];

if ( ! empty( $enable_filter ) ) {
    $wrapper_args['data-active-filter'] = $active_filter;
}

if ( ! empty( $attributes['disableRightClick'] ) ) {
    $wrapper_args['data-disable-right-click'] = 'true';
}

if ( ! empty( $attributes['enableDownload'] ) ) {
    $wrapper_args['data-enable-download'] = 'true';
}

$wrapper_attributes = get_block_wrapper_attributes( $wrapper_args );

echo '<div ' . wp_kses_post( $wrapper_attributes ) . wp_kses_post( $data_attr ) . '>';

if ( $enable_filter && ! empty( $filter_categories ) ) {
	echo '<div class="pb-image-gallery-filters align-' . esc_attr( $filter_align ) . '">';
	echo '<button class="filter-button is-active" data-filter="All">All</button>';
	foreach ( $filter_categories as $category ) {
		echo '<button class="filter-button" data-filter="' . esc_attr( $category ) . '">' . esc_html( $category ) . '</button>';
	}
	echo '</div>';
}

echo wp_kses_post( $content );

echo '</div>';