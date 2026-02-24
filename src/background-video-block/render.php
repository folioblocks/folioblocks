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
	'vimeoAspectRatio' => isset( $attributes['vimeoAspectRatio'] ) ? (float) $attributes['vimeoAspectRatio'] : null,
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
		. '--pb-bgvid-pos-x:%4$s%%;--pb-bgvid-pos-y:%7$s%%;',
		esc_attr( $fbks_height_desktop ),
		esc_attr( $fbks_height_tablet ),
		esc_attr( $fbks_height_mobile ),
		esc_attr( $fbks_object_pos_x_desktop ),
		esc_attr( $fbks_object_pos_x_tablet ),
		esc_attr( $fbks_object_pos_x_mobile ),
		esc_attr( $fbks_object_pos_y_desktop ),
		esc_attr( $fbks_object_pos_y_tablet ),
		esc_attr( $fbks_object_pos_y_mobile )
	);
}

$fbks_wrapper_args = array(
	'class' => $fbks_has_media ? 'pb-bgvid has-media' : 'pb-bgvid',
	'style' => $fbks_wrapper_style,
);

if ( ! empty( $attributes['disableRightClick'] ) ) {
	$fbks_wrapper_args['data-disable-right-click'] = 'true';
}

$fbks_wrapper_attributes = get_block_wrapper_attributes( $fbks_wrapper_args );

// Overlay is output as inline style because we store a hex + opacity in attributes.
$fbks_overlay_style = sprintf(
	'background:%1$s;opacity:%2$s;',
	esc_attr( $fbks_overlay_color ),
	esc_attr( $fbks_overlay_opacity )
);
$fbks_layer_style = 'width:100%;max-width:none;margin:0;';

$fbks_content_inner_classes = sprintf(
	'pb-bgvid__content-inner is-h-%1$s is-v-%2$s is-full-width',
	sanitize_html_class( $fbks_items_justification ),
	sanitize_html_class( $fbks_vertical_alignment )
);

?>
<div <?php echo wp_kses_data( $fbks_wrapper_attributes ); ?> data-fbks-bgvid='<?php echo esc_attr( wp_json_encode( $fbks_view_data ) ); ?>'>
	<div class="pb-bgvid__media alignfull" style="<?php echo esc_attr( $fbks_layer_style ); ?>" aria-hidden="true">
		<div class="pb-bgvid__poster" style="<?php echo esc_attr( $fbks_poster_style ); ?>"></div>
		<video class="pb-bgvid__video" playsinline muted preload="metadata" style="display:none;"></video>
		<div class="pb-bgvid__overlay" style="<?php echo esc_attr( $fbks_overlay_style ); ?>"></div>
	</div>

	<div class="pb-bgvid__content alignfull" style="<?php echo esc_attr( $fbks_layer_style ); ?>">
		<div class="<?php echo esc_attr( $fbks_content_inner_classes ); ?>">
			<?php
			// Inner blocks.
			echo wp_kses_post( $content );
			?>
		</div>
	</div>
</div>
