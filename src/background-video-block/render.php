<?php
/**
 * Background Video Block
 * Render PHP
 *
 */

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
$fbks_loop          = ! empty( $attributes['loop'] );
$fbks_disable_mobile = ! empty( $attributes['disableMobile'] );
$fbks_play_on_hover        = ! empty( $attributes['playOnHover'] );

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

?>
<div <?php echo $fbks_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> data-fbks-bgvid='<?php echo esc_attr( wp_json_encode( $fbks_view_data ) ); ?>'>
	<div class="pb-bgvid__media" aria-hidden="true">
		<div class="pb-bgvid__poster" style="<?php echo esc_attr( $fbks_poster_style ); ?>"></div>
		<video class="pb-bgvid__video" playsinline muted preload="metadata" style="display:none;"></video>
		<div class="pb-bgvid__overlay" style="<?php echo esc_attr( $fbks_overlay_style ); ?>"></div>
	</div>

	<div class="pb-bgvid__content">
		<?php
		// Inner blocks.
		echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		?>
	</div>
</div>
