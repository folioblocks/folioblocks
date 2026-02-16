<?php
/**
 * Background Video Block
 * Render PHP
 *
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Defensive defaults (in case attributes are missing for any reason).
$fbks_media_desktop        = isset( $attributes['mediaDesktop'] ) ? $attributes['mediaDesktop'] : null;
$fbks_poster_desktop       = isset( $attributes['posterDesktop'] ) ? $attributes['posterDesktop'] : null;
$fbks_height_desktop       = isset( $attributes['heightDesktop'] ) ? (float) $attributes['heightDesktop'] : 70;
$fbks_height_tablet        = isset( $attributes['heightTablet'] ) ? (float) $attributes['heightTablet'] : 60;
$fbks_height_mobile        = isset( $attributes['heightMobile'] ) ? (float) $attributes['heightMobile'] : 50;
$fbks_overlay_color        = isset( $attributes['overlayColor'] ) ? (string) $attributes['overlayColor'] : '#000000';
$fbks_overlay_opacity      = isset( $attributes['overlayOpacity'] ) ? (float) $attributes['overlayOpacity'] : 0.35;
$fbks_layout_type          = (
	isset( $attributes['layout'] ) &&
	is_array( $attributes['layout'] ) &&
	isset( $attributes['layout']['type'] )
) ? (string) $attributes['layout']['type'] : '';
$fbks_legacy_content_width = ! isset( $attributes['innerBlocksUseContentWidth'] ) || ! empty( $attributes['innerBlocksUseContentWidth'] );
$fbks_use_content_width    = in_array( $fbks_layout_type, array( 'flow', 'default' ), true )
	? false
	: ( $fbks_layout_type ? true : $fbks_legacy_content_width );
// Responsive focal point defaults (fallback to legacy single-value attributes if present).
$fbks_object_pos_x_desktop = isset( $attributes['objectPositionXDesktop'] ) ? (float) $attributes['objectPositionXDesktop'] : ( isset( $attributes['objectPositionX'] ) ? (float) $attributes['objectPositionX'] : 50 );
$fbks_object_pos_x_tablet  = isset( $attributes['objectPositionXTablet'] ) ? (float) $attributes['objectPositionXTablet'] : $fbks_object_pos_x_desktop;
$fbks_object_pos_x_mobile  = isset( $attributes['objectPositionXMobile'] ) ? (float) $attributes['objectPositionXMobile'] : $fbks_object_pos_x_desktop;

$fbks_object_pos_y_desktop = isset( $attributes['objectPositionYDesktop'] ) ? (float) $attributes['objectPositionYDesktop'] : ( isset( $attributes['objectPositionY'] ) ? (float) $attributes['objectPositionY'] : 50 );
$fbks_object_pos_y_tablet  = isset( $attributes['objectPositionYTablet'] ) ? (float) $attributes['objectPositionYTablet'] : $fbks_object_pos_y_desktop;
$fbks_object_pos_y_mobile  = isset( $attributes['objectPositionYMobile'] ) ? (float) $attributes['objectPositionYMobile'] : $fbks_object_pos_y_desktop;
$fbks_layout_justification = (
	isset( $attributes['layout'] ) &&
	is_array( $attributes['layout'] ) &&
	isset( $attributes['layout']['justifyContent'] )
) ? (string) $attributes['layout']['justifyContent'] : '';
$fbks_legacy_justification = isset( $attributes['itemsJustification'] ) ? (string) $attributes['itemsJustification'] : ( isset( $attributes['itemJustification'] ) ? (string) $attributes['itemJustification'] : 'left' );
$fbks_items_justification  = ( isset( $attributes['layout'] ) && is_array( $attributes['layout'] ) ) ? ( $fbks_layout_justification ?: 'left' ) : $fbks_legacy_justification;
$fbks_vertical_alignment   = isset( $attributes['verticalAlignment'] ) ? (string) $attributes['verticalAlignment'] : 'top';
$fbks_loop          = ! empty( $attributes['loop'] );
$fbks_disable_mobile = ! empty( $attributes['disableMobile'] );
$fbks_play_on_hover        = ! empty( $attributes['playOnHover'] );

$fbks_allowed_horizontal = array( 'left', 'center', 'right', 'stretch' );
if ( ! in_array( $fbks_items_justification, $fbks_allowed_horizontal, true ) ) {
	$fbks_items_justification = 'left';
}

$fbks_allowed_vertical = array( 'top', 'center', 'bottom', 'space-between', 'stretch' );
if ( ! in_array( $fbks_vertical_alignment, $fbks_allowed_vertical, true ) ) {
	$fbks_vertical_alignment = 'top';
}

// Poster background.
$fbks_poster_url = ( is_array( $fbks_poster_desktop ) && ! empty( $fbks_poster_desktop['url'] ) ) ? $fbks_poster_desktop['url'] : '';
$fbks_poster_style = '';
if ( $fbks_poster_url ) {
	$fbks_poster_style = sprintf( 'background-image:url(%s);', esc_url( $fbks_poster_url ) );
}

// Build a small, explicit data payload for view.js.
$fbks_media_provider = ( is_array( $fbks_media_desktop ) && ! empty( $fbks_media_desktop['provider'] ) ) ? (string) $fbks_media_desktop['provider'] : '';
$fbks_media_url      = ( is_array( $fbks_media_desktop ) && ! empty( $fbks_media_desktop['url'] ) ) ? (string) $fbks_media_desktop['url'] : '';
$fbks_vimeo_id = '';
if ( 'vimeo' === $fbks_media_provider && is_array( $fbks_media_desktop ) && ! empty( $fbks_media_desktop['id'] ) ) {
	$fbks_vimeo_id = (string) $fbks_media_desktop['id'];
}

$fbks_view_data = array(
	'provider'       => $fbks_media_provider,
	'url'            => $fbks_media_url,
	'vimeoId'        => $fbks_vimeo_id,
	'loop'           => $fbks_loop,
	'disableMobile'  => $fbks_disable_mobile,
	'playOnHover'    => $fbks_play_on_hover,
);

$fbks_has_media = (
	( 'self' === $fbks_media_provider && ! empty( $fbks_media_url ) ) ||
	( 'vimeo' === $fbks_media_provider && ! empty( $fbks_vimeo_id ) )
);

$fbks_wrapper_style = '';
if ( $fbks_has_media ) {
	$fbks_wrapper_style = sprintf(
		'--pb-bgvid-h-desktop:%1$svh;--pb-bgvid-h-tablet:%2$svh;--pb-bgvid-h-mobile:%3$svh;'
		. '--pb-bgvid-pos-x-desktop:%4$s%%;--pb-bgvid-pos-x-tablet:%5$s%%;--pb-bgvid-pos-x-mobile:%6$s%%;'
		. '--pb-bgvid-pos-y-desktop:%7$s%%;--pb-bgvid-pos-y-tablet:%8$s%%;--pb-bgvid-pos-y-mobile:%9$s%%;'
		. '--pb-bgvid-pos-x:%4$s%%;--pb-bgvid-pos-y:%7$s%%;'
		. '--pb-bgvid-overlay:%10$s;',
		esc_attr( $fbks_height_desktop ),
		esc_attr( $fbks_height_tablet ),
		esc_attr( $fbks_height_mobile ),
		esc_attr( $fbks_object_pos_x_desktop ),
		esc_attr( $fbks_object_pos_x_tablet ),
		esc_attr( $fbks_object_pos_x_mobile ),
		esc_attr( $fbks_object_pos_y_desktop ),
		esc_attr( $fbks_object_pos_y_tablet ),
		esc_attr( $fbks_object_pos_y_mobile ),
		esc_attr( sprintf( 'rgba(0,0,0,0)' ) )
	);
}

$fbks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => $fbks_has_media ? 'pb-bgvid has-media' : 'pb-bgvid',
		'style' => $fbks_wrapper_style,
	)
);

// Overlay is output as inline style because we store a hex + opacity in attributes.
$fbks_overlay_style = sprintf(
	'background:%1$s;opacity:%2$s;',
	esc_attr( $fbks_overlay_color ),
	esc_attr( $fbks_overlay_opacity )
);
$fbks_layer_style = 'width:100%;max-width:none;margin:0;';
$fbks_content_inner_style = '';
$fbks_block_gap = isset( $attributes['style']['spacing']['blockGap'] ) ? $attributes['style']['spacing']['blockGap'] : null;
$fbks_normalize_gap_value = static function( $value ) {
	if ( ! is_string( $value ) && ! is_numeric( $value ) ) {
		return '';
	}

	$value = (string) $value;
	if ( '' === $value || preg_match( '%[\\\(&=}]|/\*%', $value ) ) {
		return '';
	}

	if ( str_contains( $value, 'var:preset|spacing|' ) ) {
		$index_to_splice = strrpos( $value, '|' ) + 1;
		$slug            = _wp_to_kebab_case( substr( $value, $index_to_splice ) );
		$value           = "var(--wp--preset--spacing--$slug)";
	}

	return safecss_filter_attr( explode( ';', $value )[0] );
};

if ( is_array( $fbks_block_gap ) ) {
	$fbks_row_gap    = isset( $fbks_block_gap['top'] ) ? $fbks_normalize_gap_value( $fbks_block_gap['top'] ) : '';
	$fbks_column_gap = isset( $fbks_block_gap['left'] ) ? $fbks_normalize_gap_value( $fbks_block_gap['left'] ) : '';
	if ( '' !== $fbks_row_gap ) {
		$fbks_content_inner_style .= "row-gap:$fbks_row_gap;";
	}
	if ( '' !== $fbks_column_gap ) {
		$fbks_content_inner_style .= "column-gap:$fbks_column_gap;";
	}
} else {
	$fbks_row_gap = $fbks_normalize_gap_value( $fbks_block_gap );
	if ( '' !== $fbks_row_gap ) {
		$fbks_content_inner_style .= "row-gap:$fbks_row_gap;";
	}
}

$fbks_content_inner_classes = sprintf(
	'pb-bgvid__content-inner is-h-%1$s is-v-%2$s %3$s',
	sanitize_html_class( $fbks_items_justification ),
	sanitize_html_class( $fbks_vertical_alignment ),
	$fbks_use_content_width ? 'is-content-width' : 'is-full-width'
);

?>
<div <?php echo wp_kses_data( $fbks_wrapper_attributes ); ?> data-fbks-bgvid='<?php echo esc_attr( wp_json_encode( $fbks_view_data ) ); ?>'>
	<div class="pb-bgvid__media alignfull" style="<?php echo esc_attr( $fbks_layer_style ); ?>" aria-hidden="true">
		<div class="pb-bgvid__poster" style="<?php echo esc_attr( $fbks_poster_style ); ?>"></div>
		<video class="pb-bgvid__video" playsinline muted preload="metadata" style="display:none;"></video>
		<div class="pb-bgvid__overlay" style="<?php echo esc_attr( $fbks_overlay_style ); ?>"></div>
	</div>

	<div class="pb-bgvid__content alignfull" style="<?php echo esc_attr( $fbks_layer_style ); ?>">
		<div class="<?php echo esc_attr( $fbks_content_inner_classes ); ?>"<?php echo '' !== $fbks_content_inner_style ? ' style="' . esc_attr( $fbks_content_inner_style ) . '"' : ''; ?>>
			<?php
			// Inner blocks.
			echo wp_kses_post( $content );
			?>
		</div>
	</div>
</div>
