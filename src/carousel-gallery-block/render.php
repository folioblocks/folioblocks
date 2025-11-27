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
	'data-vertical-on-mobile' => empty( $attributes['verticalOnMobile'] ) ? 'false' : 'true',
);

if ( fbks_fs()->can_use_premium_code__premium_only() ) {
	// Premium-only attributes

	// Autoplay
	if ( ! empty( $attributes['autoplay'] ) ) {
		$fbks_wrapper_attributes['data-autoplay']       = 'true';
		$fbks_wrapper_attributes['data-autoplay-speed'] = isset( $attributes['autoplaySpeed'] )
			? esc_attr( $attributes['autoplaySpeed'] )
			: '3';
	}

	// Downloads
	if ( ! empty( $attributes['enableDownload'] ) ) {
		$fbks_wrapper_attributes['data-enable-download'] = 'true';
	}

	// Disable right-click
	if ( ! empty( $attributes['disableRightClick'] ) ) {
		$fbks_wrapper_attributes['data-disable-right-click'] = 'true';
	}
}

$fbks_loop = isset( $attributes['loopSlides'] ) ? $attributes['loopSlides'] : false;

$fbks_wrapper_attr_string = get_block_wrapper_attributes( $fbks_wrapper_attributes );
?>
<div <?php echo wp_kses( $fbks_wrapper_attr_string, [ 'div' => [] ] ); ?>>
	<div class="pb-carousel-gallery" data-loop="<?php echo $fbks_loop ? 'true' : 'false'; ?>">
		<?php echo wp_kses_post( $content ); ?>
	</div>

	<?php if ( fbks_fs()->can_use_premium_code__premium_only() ) : ?>
		<?php if ( ! empty( $attributes['showControls'] ) ) : ?>
			<div
				class="pb-carousel-controls align-<?php echo esc_attr( $attributes['controlsAlignment'] ?? 'center' ); ?>"
				style="
					--pb-controls-bg: <?php echo esc_attr( $attributes['controlsBackgroundColor'] ?? 'rgba(0,0,0,0.5)' ); ?>;
					--pb-controls-icon: <?php echo esc_attr( $attributes['controlsIconColor'] ?? '#ffffff' ); ?>;
				"
			>
				<button class="pb-carousel-chevron prev" aria-label="Previous slide">
					<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
						<path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
					</svg>
				</button>

				<?php if ( ! empty( $attributes['autoplay'] ) ) : ?>
					<button class="pb-carousel-play-button" aria-label="Play/Pause carousel">
						<svg class="play-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
							<path d="M8 5v14l11-7z"/>
						</svg>
						<svg class="pause-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" style="display:none;">
							<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
						</svg>
					</button>
				<?php endif; ?>

				<button class="pb-carousel-chevron next" aria-label="Next slide">
					<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
						<path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
					</svg>
				</button>
			</div>
		<?php endif; ?>
	<?php endif; ?>
</div>