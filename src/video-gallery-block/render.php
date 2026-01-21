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
$fbks_filter_typo_styles      = '';
$fbks_filter_decoration_class = '';

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

		// Filter bar typography.
		// Mirrors the CSS vars produced in editor via getFilterTypographyCSS().
		$fbks_filter_font_family = isset( $attributes['filterFontFamily'] ) ? (string) $attributes['filterFontFamily'] : '';

		// Font size is stored as a number (px). Ensure we output a valid CSS value with units.
		$fbks_filter_font_size = isset( $attributes['filterFontSize'] ) ? floatval( $attributes['filterFontSize'] ) : 16;
		if ( $fbks_filter_font_size <= 0 ) {
			$fbks_filter_font_size = 16;
		}

		// Letter spacing is stored as number (px). Ensure units.
		$fbks_filter_letter_spacing = isset( $attributes['filterLetterSpacing'] ) ? floatval( $attributes['filterLetterSpacing'] ) : 0;

		// Line height: allow numeric or string. Default 1.5.
		$fbks_filter_line_height = isset( $attributes['filterLineHeight'] ) && $attributes['filterLineHeight'] !== ''
			? $attributes['filterLineHeight']
			: 1.5;

		// Font style default.
		$fbks_filter_font_style = ! empty( $attributes['filterFontStyle'] ) ? (string) $attributes['filterFontStyle'] : 'normal';

		// Font weight: clamp numeric weights to 100–900 (widely supported). Allow keywords if provided.
		$fbks_filter_font_weight = isset( $attributes['filterFontWeight'] ) ? (string) $attributes['filterFontWeight'] : '';
		if ( $fbks_filter_font_weight !== '' && preg_match( '/^\d{3}$/', $fbks_filter_font_weight ) ) {
			$w = intval( $fbks_filter_font_weight );
			$w = max( 100, min( 900, $w ) );
			$fbks_filter_font_weight = (string) $w;
		}

		// Text transform + decoration.
		$fbks_filter_text_transform  = ! empty( $attributes['filterTextTransform'] ) ? (string) $attributes['filterTextTransform'] : 'none';
		$fbks_filter_text_decoration = ! empty( $attributes['filterTextDecoration'] ) ? (string) $attributes['filterTextDecoration'] : 'none';

		// Stable class for CSS routing (underline vs line-through).
		$fbks_filter_decoration_class = ' pb-filter-decoration-' . sanitize_html_class( $fbks_filter_text_decoration );

		$fbks_filter_typo_styles .= '--pb-filter-font-family:' . esc_attr( $fbks_filter_font_family ) . ';';
		$fbks_filter_typo_styles .= '--pb-filter-font-size:' . esc_attr( $fbks_filter_font_size ) . 'px;';
		$fbks_filter_typo_styles .= '--pb-filter-font-weight:' . esc_attr( $fbks_filter_font_weight ) . ';';
		$fbks_filter_typo_styles .= '--pb-filter-font-style:' . esc_attr( $fbks_filter_font_style ) . ';';
		$fbks_filter_typo_styles .= '--pb-filter-line-height:' . esc_attr( $fbks_filter_line_height ) . ';';
		$fbks_filter_typo_styles .= '--pb-filter-letter-spacing:' . esc_attr( $fbks_filter_letter_spacing ) . 'px;';
		$fbks_filter_typo_styles .= '--pb-filter-text-transform:' . esc_attr( $fbks_filter_text_transform ) . ';';

		// NOTE: The space after the colon is intentional.
		// Our SCSS fallback selectors may look for `: underline` / `: line-through`.
		$fbks_filter_typo_styles .= '--pb-filter-text-decoration: ' . esc_attr( $fbks_filter_text_decoration ) . ';';
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
		echo '<div class="pb-video-gallery-filters align-' . esc_attr( $fbks_filter_align ) . esc_attr( $fbks_filter_decoration_class ) . '" style="' . esc_attr( $fbks_filter_typo_styles ) . '">';
		echo '<button class="filter-button is-active" data-filter="All">All</button>';
		foreach ( $fbks_filter_categories as $fbks_category ) {
			echo '<button class="filter-button" data-filter="' . esc_attr( $fbks_category ) . '">' . esc_html( $fbks_category ) . '</button>';
		}
		echo '</div>';
	}
}

echo wp_kses_post( $content );

echo '</div>';
