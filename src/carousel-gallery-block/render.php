<?php
/**
 * Carousel Gallery Block
 * Render PHP
 **/

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Base attributes (free features)
$fbks_wrapper_attributes = array(
    'data-wp-interactive' => 'folioblocks/carousel',
    'data-wp-watch' => 'callbacks.initialize',
    'data-wp-key' => wp_unique_id( 'fbks-carousel-' ) . '-' . md5( wp_json_encode( [ get_the_ID(), $attributes, $content ] ) ),
	'class'                   => 'is-loading',
	'data-vertical-on-mobile' => empty( $attributes['verticalOnMobile'] ) ? 'false' : 'true',
);
$fbks_gap = 10;
$fbks_tablet_gap = 10;
$fbks_mobile_gap = 10;

if ( fbks_fs()->can_use_premium_code__premium_only() ) {
	// Premium-only attributes
	$fbks_gap = max( 0, min( 50, intval( $attributes['gap'] ?? 10 ) ) );
	$fbks_tablet_gap = max( 0, min( 50, intval( $attributes['tabletGap'] ?? $fbks_gap ) ) );
	$fbks_mobile_gap = max( 0, min( 50, intval( $attributes['mobileGap'] ?? $fbks_gap ) ) );

	// Autoplay
	if ( ! empty( $attributes['autoplay'] ) ) {
		$fbks_wrapper_attributes['data-autoplay']       = 'true';
		$fbks_wrapper_attributes['data-autoplay-speed'] = isset( $attributes['autoplaySpeed'] )
			? esc_attr( $attributes['autoplaySpeed'] )
			: '3';
	}
	$fbks_wrapper_attributes['data-loop'] = ! empty( $attributes['loopSlides'] ) ? 'true' : 'false';

	// Downloads
	if ( ! empty( $attributes['enableDownload'] ) ) {
		$fbks_wrapper_attributes['data-enable-download'] = 'true';
	}

	// Disable right-click
	if ( ! empty( $attributes['disableRightClick'] ) ) {
		$fbks_wrapper_attributes['data-disable-right-click'] = 'true';
	}

	if ( ! empty( $attributes['randomizeOrder'] ) ) {
		$fbks_wrapper_attributes['class']         .= ' pb-randomized';
		$fbks_wrapper_attributes['data-randomize'] = 'true';
	}
}
$fbks_wrapper_attributes['style'] = '--pb-gallery-gap-desktop:' . $fbks_gap . 'px;'
	. '--pb-gallery-gap-tablet:' . $fbks_tablet_gap . 'px;'
	. '--pb-gallery-gap-mobile:' . $fbks_mobile_gap . 'px;';

$fbks_wrapper_attr_string = get_block_wrapper_attributes( $fbks_wrapper_attributes );
$fbks_controls_background_color = ! empty( $attributes['controlsBackgroundColor'] )
	? $attributes['controlsBackgroundColor']
	: 'rgba(0, 0, 0, 0.5)';
$fbks_controls_icon_color = ! empty( $attributes['controlsIconColor'] )
	? $attributes['controlsIconColor']
	: '#ffffff';
?>
<div <?php echo $fbks_wrapper_attr_string; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() escapes each attribute value. ?>>
	<div class="pb-carousel-gallery" <?php if ( fbks_fs()->can_use_premium_code__premium_only() ) : ?>data-wp-watch="callbacks.premium"<?php endif; ?>>
		<?php
        $fbks_slides = wp_kses( $content, fbks_get_allowed_post_html_with_svg() );
        $fbks_slide_count = 0;
        $fbks_slide_processor = new WP_HTML_Tag_Processor( $fbks_slides );
        while ( $fbks_slide_processor->next_tag( [ 'class_name' => 'wp-block-folioblocks-pb-image-block' ] ) ) {
            $fbks_slide_count++;
        }
        $fbks_loop_track = fbks_fs()->can_use_premium_code__premium_only() && ! empty( $attributes['loopSlides'] ) && $fbks_slide_count > 1;
        if ( $fbks_loop_track ) {
            echo fbks_carousel_clone_markup( $fbks_slides, 'before' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Derived from sanitized slide markup with escaped attributes.
        }
        echo $fbks_slides; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Sanitized above.
        if ( $fbks_loop_track ) {
            echo fbks_carousel_clone_markup( $fbks_slides, 'after' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Derived from sanitized slide markup with escaped attributes.
        }
        ?>
	</div>

	<?php if ( fbks_fs()->can_use_premium_code__premium_only() ) : ?>
		<?php if ( ! empty( $attributes['showControls'] ) ) : ?>
			<div
				class="pb-carousel-controls align-<?php echo esc_attr( $attributes['controlsAlignment'] ?? 'center' ); ?>"
				style="
					--pb-controls-bg: <?php echo esc_attr( $fbks_controls_background_color ); ?>;
					--pb-controls-icon: <?php echo esc_attr( $fbks_controls_icon_color ); ?>;
				"
			>
					<button
						type="button"
						class="pb-carousel-chevron prev"
						aria-label="<?php esc_attr_e( 'Previous slide', 'folioblocks' ); ?>"
					>
					<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
						<path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
					</svg>
				</button>

				<?php if ( ! empty( $attributes['autoplay'] ) ) : ?>
						<button
							type="button"
							class="pb-carousel-play-button"
							aria-label="<?php esc_attr_e( 'Play/Pause carousel', 'folioblocks' ); ?>"
						>
						<svg class="play-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
							<path d="M8 5v14l11-7z"/>
						</svg>
						<svg class="pause-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
							<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
						</svg>
					</button>
				<?php endif; ?>

					<button
						type="button"
						class="pb-carousel-chevron next"
						aria-label="<?php esc_attr_e( 'Next slide', 'folioblocks' ); ?>"
					>
					<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
						<path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
					</svg>
				</button>
			</div>
		<?php endif; ?>
	<?php endif; ?>
</div>
