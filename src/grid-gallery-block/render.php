<?php
/**
 * Grid Gallery Block
 * Render PHP
 **/


if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$fbks_attributes = wp_parse_args($attributes, [
    'randomizeOrder' => false,
]);

// Define wrapper attributes normally for free features.
$fbks_extra_class = '';
$fbks_data_attr   = '';
$fbks_wrapper_attributes_args = [
    'class' => 'is-loading',
];

// Filtering feature
$fbks_enable_filter      = $fbks_attributes['enableFilter'] ?? false;
$fbks_filter_align       = $fbks_attributes['filterAlign'] ?? 'center';
$fbks_active_filter      = 'All';
$fbks_filter_categories  = $fbks_attributes['filterCategories'] ?? [];

// Filter bar typography (Premium only).
// Mirrors the CSS vars produced in editor via getFilterTypographyCSS().
$fbks_filter_typo_styles      = '';
$fbks_filter_decoration_class = '';

//  Premium-only logic
if ( fbks_fs()->can_use_premium_code__premium_only() ) {
    // Randomize order
    if ( ! empty( $fbks_attributes['randomizeOrder'] ) ) {
        $fbks_extra_class = ' pb-randomized';
        $fbks_data_attr   = ' data-randomize="true"';
        $fbks_wrapper_attributes_args['class'] .= $fbks_extra_class;
    }

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

    // Build filter typography CSS variables for the filter bar wrapper.
    if ( $fbks_enable_filter ) {
        // Font family is stored as either "" (default) or e.g. var(--wp--preset--font-family--poppins)
        $fbks_filter_font_family = isset( $fbks_attributes['filterFontFamily'] ) ? (string) $fbks_attributes['filterFontFamily'] : '';

        // Font size is stored as a number (px). Ensure we output a valid CSS value with units.
        $fbks_filter_font_size = isset( $fbks_attributes['filterFontSize'] ) ? floatval( $fbks_attributes['filterFontSize'] ) : 16;
        if ( $fbks_filter_font_size <= 0 ) {
            $fbks_filter_font_size = 16;
        }

        // Letter spacing is stored as number (px). Ensure units.
        $fbks_filter_letter_spacing = isset( $fbks_attributes['filterLetterSpacing'] ) ? floatval( $fbks_attributes['filterLetterSpacing'] ) : 0;

        // Line height: allow numeric or string. Default 1.5.
        $fbks_filter_line_height = isset( $fbks_attributes['filterLineHeight'] ) && $fbks_attributes['filterLineHeight'] !== ''
            ? $fbks_attributes['filterLineHeight']
            : 1.5;

        // Font style default.
        $fbks_filter_font_style = ! empty( $fbks_attributes['filterFontStyle'] ) ? (string) $fbks_attributes['filterFontStyle'] : 'normal';

        // Font weight: clamp numeric weights to 100–900 (widely supported). Allow keywords if provided.
        $fbks_filter_font_weight = isset( $fbks_attributes['filterFontWeight'] ) ? (string) $fbks_attributes['filterFontWeight'] : '';
        if ( $fbks_filter_font_weight !== '' && preg_match( '/^\d{3}$/' , $fbks_filter_font_weight ) ) {
            $w = intval( $fbks_filter_font_weight );
            $w = max( 100, min( 900, $w ) );
            $fbks_filter_font_weight = (string) $w;
        }

        // Text transform + decoration.
        $fbks_filter_text_transform  = ! empty( $fbks_attributes['filterTextTransform'] ) ? (string) $fbks_attributes['filterTextTransform'] : 'none';
        $fbks_filter_text_decoration = ! empty( $fbks_attributes['filterTextDecoration'] ) ? (string) $fbks_attributes['filterTextDecoration'] : 'none';

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

    $fbks_wrapper_attributes_args['style'] = $fbks_active_styles . $fbks_inactive_styles;

    if ( ! empty( $fbks_enable_filter ) ) {
        $fbks_wrapper_attributes_args['data-active-filter'] = $fbks_active_filter;
    }

    // Disable right-click
    if ( ! empty( $fbks_attributes['disableRightClick'] ) ) {
        $fbks_wrapper_attributes_args['data-disable-right-click'] = 'true';
    }

    // Enable download
    if ( ! empty( $fbks_attributes['enableDownload'] ) ) {
        $fbks_wrapper_attributes_args['data-enable-download'] = 'true';
    }
}

$fbks_wrapper_attributes = get_block_wrapper_attributes( $fbks_wrapper_attributes_args );

echo '<div ' . wp_kses_post( $fbks_wrapper_attributes ) . '>';

// Premium: Render filter bar only for premium
if ( fbks_fs()->can_use_premium_code__premium_only() ) {
    if ( !empty($fbks_enable_filter) && !empty($fbks_filter_categories) ) {
        echo '<div class="pb-image-gallery-filters align-' . esc_attr( $fbks_filter_align ) . esc_attr( $fbks_filter_decoration_class ) . '" style="' . esc_attr( $fbks_filter_typo_styles ) . '">';
        echo '<button class="filter-button is-active" data-filter="All">All</button>';
        foreach ( $fbks_filter_categories as $category ) {
            echo '<button class="filter-button" data-filter="' . esc_attr( $category ) . '">' . esc_html( $category ) . '</button>';
        }
        echo '</div>';
    }
}

echo wp_kses_post( $content );

echo '</div>';
?>