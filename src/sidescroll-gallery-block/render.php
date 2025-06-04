<?php
	$attributes = $attributes ?? [];

	// Extract attributes with defaults
	$images             = $attributes['images'] ?? [];
	$scrollDirection    = $attributes['scrollDirection'] ?? 'left';
	$scrollSpeed        = $attributes['scrollSpeed'] ?? 5;
	$slideHeight        = $attributes['slideHeight'] ?? 400;
	$pauseOnHover       = $attributes['pauseOnHover'] ?? false;
	$showCaptionOnHover = $attributes['showCaptionOnHover'] ?? false;

	// Build dynamic CSS variables
	$style = sprintf(
		'--slide-height: %dpx; --computed-slide-height: %dpx;',
		(int) $slideHeight,
		(int) $slideHeight
	);

	// Start output buffer
	ob_start();
	?>
	<div <?php echo wp_kses_post( get_block_wrapper_attributes() ); ?>>
		<div
			class="pb-sidescroll-gallery wp-block-pb-sidescroll-gallery
				<?php echo $pauseOnHover ? ' pb-pause-on-hover' : ''; ?>
				<?php echo $showCaptionOnHover ? ' pb-show-caption' : ''; ?>"
			style="<?php echo esc_attr( $style ); ?>"
			data-scroll-direction="<?php echo esc_attr( $scrollDirection ); ?>"
			data-scroll-speed="<?php echo esc_attr( $scrollSpeed ); ?>"
		>
			<div class="pb-sidescroll-gallery-track">
				<?php
				// Duplicate the image list for seamless looping
				$loopImages = array_merge( $images, $images );

				foreach ( $loopImages as $image ) :
					$src   = esc_url( $image['src'] ?? '' );
					$alt   = esc_attr( $image['alt'] ?? '' );
					$title = esc_html( $image['title'] ?? '' );
					?>
					<figure class="pb-sidescroll-gallery-item">
						<div class="pb-sidescroll-gallery-image-wrapper">
							<?php echo wp_get_attachment_image( $image['id'], 'full', false, [ 'alt' => $alt ] ); ?>
						</div>
						<?php if ( $showCaptionOnHover && $title ) : ?>
							<figcaption class="pb-sidescroll-gallery-caption">
								<?php echo esc_html( $title ); ?>
							</figcaption>
						<?php endif; ?>
					</figure>
				<?php endforeach; ?>
			</div>
		</div>
	</div>