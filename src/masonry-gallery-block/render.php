<?php
/**
 * Masonry Gallery Block
 * Render PHP
 **/


if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$fbks_raw_attributes = is_array( $attributes ) ? $attributes : [];
$fbks_saved_classes = '';

if ( preg_match( '/class="([^"]*\bpb-masonry-gallery\b[^"]*)"/', $content, $fbks_class_matches ) ) {
    $fbks_saved_classes = $fbks_class_matches[1];
}

$fbks_get_saved_columns = function ( $fbks_breakpoint ) use ( $fbks_saved_classes ) {
    if ( preg_match( '/\bcols-' . preg_quote( $fbks_breakpoint, '/' ) . '-(\d+)\b/', $fbks_saved_classes, $fbks_column_matches ) ) {
        return max( 1, absint( $fbks_column_matches[1] ) );
    }

    return null;
};

$fbks_get_columns = function ( $fbks_primary_key, $fbks_legacy_key, $fbks_breakpoint, $fbks_default ) use ( $fbks_raw_attributes, $fbks_get_saved_columns ) {
    $fbks_saved_column = $fbks_get_saved_columns( $fbks_breakpoint );

    if ( isset( $fbks_raw_attributes[ $fbks_primary_key ] ) && '' !== $fbks_raw_attributes[ $fbks_primary_key ] ) {
        $fbks_attribute_column = max( 1, absint( $fbks_raw_attributes[ $fbks_primary_key ] ) );

        if ( $fbks_attribute_column !== $fbks_default || null === $fbks_saved_column ) {
            return $fbks_attribute_column;
        }
    }

    if ( isset( $fbks_raw_attributes[ $fbks_legacy_key ] ) && '' !== $fbks_raw_attributes[ $fbks_legacy_key ] ) {
        $fbks_attribute_column = max( 1, absint( $fbks_raw_attributes[ $fbks_legacy_key ] ) );

        if ( $fbks_attribute_column !== $fbks_default || null === $fbks_saved_column ) {
            return $fbks_attribute_column;
        }
    }

    if ( null !== $fbks_saved_column ) {
        return $fbks_saved_column;
    }

    return $fbks_default;
};

$fbks_columns        = $fbks_get_columns( 'columns', 'columns', 'd', 6 );
$fbks_tablet_columns = $fbks_get_columns( 'tabletColumns', 'columnsTablet', 't', 4 );
$fbks_mobile_columns = $fbks_get_columns( 'mobileColumns', 'columnsMobile', 'm', 2 );

$fbks_attributes = wp_parse_args($fbks_raw_attributes, [
    'columns' => 6,
    'tabletColumns' => 4,
    'mobileColumns' => 2,
    'gap' => 10,
    'tabletGap' => 10,
    'mobileGap' => 10,
    'randomizeOrder' => false,
    'noGap' => false,
]);

$fbks_can_use_responsive_gaps = fbks_fs()->can_use_premium_code__premium_only();

if ( $fbks_can_use_responsive_gaps ) {
    $fbks_gap = $fbks_attributes['noGap'] ? 0 : max( 0, min( 50, intval( $fbks_attributes['gap'] ) ) );
    $fbks_tablet_gap = $fbks_attributes['noGap'] ? 0 : max( 0, min( 50, intval( $fbks_attributes['tabletGap'] ) ) );
    $fbks_mobile_gap = $fbks_attributes['noGap'] ? 0 : max( 0, min( 50, intval( $fbks_attributes['mobileGap'] ) ) );
} else {
    $fbks_gap = $fbks_attributes['noGap'] ? 0 : 10;
    $fbks_tablet_gap = $fbks_gap;
    $fbks_mobile_gap = $fbks_gap;
}

$fbks_gap_styles = '--pb-gallery-gap-desktop:' . $fbks_gap . 'px;';
$fbks_gap_styles .= '--pb-gallery-gap-tablet:' . $fbks_tablet_gap . 'px;';
$fbks_gap_styles .= '--pb-gallery-gap-mobile:' . $fbks_mobile_gap . 'px;';

$fbks_content = preg_replace_callback(
    '/class="([^"]*\bpb-masonry-gallery\b[^"]*)"/',
    function ( $fbks_matches ) use ( $fbks_columns, $fbks_tablet_columns, $fbks_mobile_columns ) {
        $fbks_classes = preg_split( '/\s+/', $fbks_matches[1] );
        $fbks_classes = array_filter(
            $fbks_classes,
            function ( $fbks_class ) {
                return ! preg_match( '/^cols-[dtm]-\d+$/', $fbks_class );
            }
        );

        $fbks_classes[] = 'cols-d-' . $fbks_columns;
        $fbks_classes[] = 'cols-t-' . $fbks_tablet_columns;
        $fbks_classes[] = 'cols-m-' . $fbks_mobile_columns;

        return 'class="' . esc_attr( implode( ' ', array_unique( $fbks_classes ) ) ) . '"';
    },
    $content,
    1
);

$fbks_extra_class = '';
$fbks_data_attr = '';

if ( fbks_fs()->can_use_premium_code__premium_only() ) {
    $fbks_enable_filter   = $fbks_attributes['enableFilter'] ?? false;
    $fbks_filter_align    = $fbks_attributes['filterAlign'] ?? 'center';
    $fbks_active_filter   = FBKS_ALL_FILTER_TOKEN;
    $fbks_filter_categories    = $fbks_attributes['filterCategories'] ?? [];

    // Filter bar typography (Premium only).
    // Mirrors the CSS vars produced in editor via getFilterTypographyCSS().
    $fbks_filter_typo_styles = '';
    $fbks_filter_decoration_class = '';

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
        if ( $fbks_filter_font_weight !== '' && preg_match( '/^(1000|[1-9]\d{0,2})$/' , $fbks_filter_font_weight ) ) {
            $fbks_filter_font_weight_value = intval( $fbks_filter_font_weight );
            $fbks_filter_font_weight_value = max( 100, min( 900, $fbks_filter_font_weight_value ) );
            $fbks_filter_font_weight = (string) $fbks_filter_font_weight_value;
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

    $fbks_extra_class .= $fbks_attributes['randomizeOrder'] ? ' pb-randomized' : '';
    $fbks_data_attr = $fbks_attributes['randomizeOrder'] ? ' data-randomize="true"' : '';

    $fbks_active_styles   = '';
    $fbks_inactive_styles = '';

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

$fbks_extra_class .= $fbks_attributes['noGap'] ? ' no-gap' : '';

$fbks_wrapper_args = [
    'class' => trim($fbks_extra_class),
    'style' => $fbks_gap_styles,
];

if ( fbks_fs()->can_use_premium_code__premium_only() ) {
    $fbks_wrapper_args['style'] .= $fbks_active_styles . $fbks_inactive_styles;

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
        echo '<div class="pb-image-gallery-filters align-' . esc_attr( $fbks_filter_align ) . esc_attr( $fbks_filter_decoration_class ) . '" style="' . esc_attr( $fbks_filter_typo_styles ) . '">';
        echo '<button class="filter-button is-active" data-filter="' . esc_attr( FBKS_ALL_FILTER_TOKEN ) . '">' . esc_html( fbks_get_all_filter_label() ) . '</button>';
        foreach ( $fbks_filter_categories as $fbks_category ) {
            echo '<button class="filter-button" data-filter="' . esc_attr( $fbks_category ) . '">' . esc_html( $fbks_category ) . '</button>';
        }
        echo '</div>';
    }
}

echo wp_kses( $fbks_content, fbks_get_allowed_post_html_with_svg() );

echo '</div>';
