<?php
/**
 * Render template for pb-image-block with optional lightbox.
 */

if ( empty( $attributes['src'] ) ) {
	echo '<div class="pb-image-block"><p>No image selected.</p></div>';
	return;
}



$src     = esc_url( $attributes['src'] );
$full_src = !empty( $attributes['sizes']['full']['url'] ) ? esc_url( $attributes['sizes']['full']['url'] ) : $src;

$alt     = isset( $attributes['alt'] ) ? esc_attr( $attributes['alt'] ) : '';
$title   = isset( $attributes['title'] ) ? esc_attr( $attributes['title'] ) : '';
$caption = isset( $attributes['caption'] ) ? $attributes['caption'] : '';
$imageSize = isset( $attributes['imageSize'] ) ? $attributes['imageSize'] : 'large';
$id      = isset( $attributes['id'] ) ? (int) $attributes['id'] : 0;

$context = $block->context ?? [];

$lazy_load = $block->context['portfolioBlocks/lazyLoad'] ?? false;
$lightbox         = $context['portfolioBlocks/lightbox'] ?? ! empty( $attributes['enableLightbox'] );
$caption_lightbox = $context['portfolioBlocks/lightboxCaption'] ?? ! empty( $attributes['showCaptionInLightbox'] );
$title_hover = $context['portfolioBlocks/onHoverTitle'] ?? ( isset( $attributes['showTitleOnHover'] ) ? (bool) $attributes['showTitleOnHover'] : false );
$dropshadow       = $context['portfolioBlocks/dropShadow'] ?? ! empty( $attributes['dropshadow'] );
$filter_category = $attributes['filterCategory'] ?? '';

$border_width  = isset( $context['portfolioBlocks/borderWidth'] ) ? $context['portfolioBlocks/borderWidth'] : ( $attributes['borderWidth'] ?? 0 );
$border_radius = isset( $context['portfolioBlocks/borderRadius'] ) ? $context['portfolioBlocks/borderRadius'] : ( $attributes['borderRadius'] ?? 0 );
$border_color  = isset( $context['portfolioBlocks/borderColor'] ) ? $context['portfolioBlocks/borderColor'] : ( $attributes['borderColor'] ?? '#ffffff' );

$img_styles = '';
if ( $border_width > 0 ) {
	$img_styles .= '--pb-border-width: ' . esc_attr( $border_width ) . 'px;';
	if ( $border_color ) {
		$img_styles .= '--pb-border-color: ' . esc_attr( $border_color ) . ';';
	}
}
if ( $border_radius > 0 ) {
	$img_styles .= '--pb-border-radius: ' . esc_attr( $border_radius ) . 'px;';
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => 'pb-image-block-wrapper',
] );

?>

<div <?php echo wp_kses_post( $wrapper_attributes ); ?> <?php echo $filter_category !== '' ? 'data-filter="' . esc_attr( $filter_category ) . '"' : ''; ?>>
	<figure
		class="pb-image-block <?php echo esc_attr( $title_hover ? 'title-hover' : '' ); ?> <?php echo esc_attr( $dropshadow ? 'dropshadow' : '' ); ?>"
		<?php if ( ! empty( $attributes['enableDownload'] ) ) : ?>
			data-enable-download="true"
		<?php endif; ?>
	>
		<?php if ( $lightbox ) : ?>
			<a
				href="#"
				class="pb-image-block-lightbox"
				data-src="<?php echo esc_url( $full_src ); ?>"
					<?php if ( $caption_lightbox && $caption ) : ?>
						data-caption="<?php echo esc_attr( wp_strip_all_tags( $caption ) ); ?>"
					<?php endif; ?>
			>
				<?php
				$img_attributes = [
					'class'    => 'pb-image-block-img wp-image-' . esc_attr( $id ),
					'loading'  => 'eager',
					'decoding' => 'async',
					'style'    => $img_styles,
				];
				if ( ! empty( $title ) ) {
					$img_attributes['title'] = $title;
				}
				if ( ! empty( $alt ) ) {
					$img_attributes['alt'] = $alt;
				}
				echo wp_get_attachment_image( $id, $imageSize, false, $img_attributes );
				?>
			</a>
		<?php else : ?>
			<?php
			$img_attributes = [
				'src'	 => $src,
				'class'    => 'pb-image-block-img wp-image-' . esc_attr( $id ),
				'loading' => $lazy_load ? 'lazy' : 'eager',
				'decoding' => 'async',
				'style'    => $img_styles,
			];
			if ( ! empty( $title ) ) {
				$img_attributes['title'] = $title;
			}
			if ( ! empty( $alt ) ) {
				$img_attributes['alt'] = $alt;
			}
			echo wp_get_attachment_image( $id, $imageSize, false, $img_attributes );
			?>
		<?php endif; ?>

		<?php if ( $title_hover && ! empty( $title ) ) : ?>
			<div class="pb-image-block-title-container">
				<figcaption class="pb-image-block-title" style="<?php echo esc_attr( $img_styles ); ?>">
					<?php echo wp_kses_post( $title ); ?>
				</figcaption>
			</div>
		<?php endif; ?>
		
		<?php if ( ! empty( $context['portfolioBlocks/enableDownload'] ) || ! empty( $attributes['enableDownload'] ) ) : ?>
    		<button 
    			class="pb-image-block-download <?php echo !empty($context['portfolioBlocks/downloadOnHover']) ? 'hover-only' : ''; ?>" 
    			aria-label="<?php esc_attr_e( 'Download Image', 'portfolio-blocks' ); ?>"
    			style="top: calc(8px + <?php echo esc_attr( $border_width ); ?>px); right: calc(8px + <?php echo esc_attr( $border_width ); ?>px);"
    			data-full-src="<?php echo esc_url( $full_src ); ?>"
			>
    			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18 11.3l-1-1.1-4 4V3h-1.5v11.3L7 10.2l-1 1.1 6.2 5.8 5.8-5.8zm.5 3.7v3.5h-13V15H4v5h16v-5h-1.5z"></path></svg>
			</button>
<?php endif; ?>
	</figure>
</div>