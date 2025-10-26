<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$thumbnail = esc_url( $attributes['thumbnail'] ?? '' );
$title = esc_html( $attributes['title'] ?? '' );
$video_url = esc_url( $attributes['videoUrl'] ?? '' );
$aspect = esc_attr( $attributes['aspectRatio'] ?? '16:9' );
$play_visibility = esc_attr( $attributes['playButtonVisibility'] ?? 'always' );
$title_visibility = esc_attr( $attributes['titleVisibility'] ?? 'always' );
$filter_category = $attributes['filterCategory'] ?? '';

$border_color = esc_attr( $attributes['borderColor'] ?? '' );
$border_width = absint( $attributes['borderWidth'] ?? 0 );
$border_radius = absint( $attributes['borderRadius'] ?? 0 );

$drop_shadow = ! empty( $attributes['dropShadow'] );
$lazy_load = ! empty( $attributes['lazyLoad'] );

$context = $block->context ?? [];

$has_woocommerce = class_exists( 'WooCommerce' );

// Build style string for border and radius
$style = '';
if ( $border_width > 0 ) {
	$style .= "border-width: {$border_width}px; border-style: solid;";
	if ( $border_color ) {
		$style .= "border-color: {$border_color};";
	}
}
if ( $border_radius > 0 ) {
	$style .= "border-radius: {$border_radius}px;";
}

// Only bail if no video URL exists
if ( ! $video_url ) {
	return '';
}

// Render placeholder if thumbnail is missing
if ( ! $thumbnail ) {
	$thumbnail_html = '<div class="pb-video-placeholder" aria-hidden="true">
		<h3 class="pb-video-missing">Thumbnail Missing</h3>
	</div>';
} else {
	$thumbnail_html = wp_get_attachment_image(
		$attributes['thumbnailId'] ?? 0,
		'full',
		false,
		[
			'alt'   => $title,
			'class' => 'pb-video-block-img',
			'loading' => $lazy_load ? 'lazy' : 'eager'
		]
	);
}
?>
<div <?php echo wp_kses_post( get_block_wrapper_attributes() ); ?>>
<?php
$overlay_class = '';
if ( $play_visibility === 'always' || $title_visibility === 'always' ) {
	$overlay_class = ' has-overlay-always';
} elseif ( $play_visibility === 'onHover' || $title_visibility === 'onHover' ) {
	$overlay_class = ' has-overlay-hover';
}
?>
<div class="pb-video-block aspect-<?php echo esc_attr( str_replace( ':', '-', $aspect ) ); ?><?php echo esc_attr( $overlay_class ); ?><?php echo $drop_shadow ? ' drop-shadow' : ''; ?>"
	data-filter="<?php echo esc_attr( $filter_category ); ?>"
	data-video-url="<?php echo esc_url( $video_url ); ?>"
	data-video-title="<?php echo esc_attr( $title ); ?>"
	<?php if ( ! empty( $attributes['wooProductName'] ) ) : ?>
		data-product-name="<?php echo esc_attr( $attributes['wooProductName'] ); ?>"
	<?php endif; ?>
	<?php if ( ! empty( $attributes['wooProductPrice'] ) ) : ?>
		data-product-price="<?php echo esc_attr( $attributes['wooProductPrice'] ); ?>"
	<?php endif; ?>
	<?php if ( ! empty( $attributes['wooProductDescription'] ) ) : ?>
		data-product-description="<?php echo esc_attr( wp_strip_all_tags( $attributes['wooProductDescription'] ) ); ?>"
	<?php endif; ?>
	<?php if ( ! empty( $attributes['wooProductURL'] ) ) : ?>
		data-product-url="<?php echo esc_url( $attributes['wooProductURL'] ); ?>"
	<?php endif; ?>
	<?php if ( ! empty( $attributes['description'] ) ) : ?>
		data-video-description="<?php echo esc_attr( $attributes['description'] ); ?>"
	<?php endif; ?>
	style="<?php echo esc_attr( $style ); ?>">
	<?php echo $thumbnail_html; ?>
	<div class="video-overlay">
		<div class="overlay-content">
			<?php if ( $title && $title_visibility !== 'hidden' ) : ?>
				<div class="video-title-overlay <?php echo esc_attr( $title_visibility ); ?>"><?php echo esc_html( $title ); ?></div>
			<?php endif; ?>
			<?php if ( $play_visibility !== 'hidden' ) : ?>
				<div class="video-play-button <?php echo esc_attr( $play_visibility ); ?>">▶</div>
			<?php endif; ?>
		</div>
	</div>
	
    <?php
    // WooCommerce Add to Cart button integration.
    if ( $has_woocommerce && ! empty( $attributes['wooProductId'] ) ) :
        $woo_cart_icon_display = $context['portfolioBlocks/wooCartIconDisplay'] ?? 'always';
        $product_id = absint( $attributes['wooProductId'] );
        ?>
        <a
            href="<?php echo esc_url( '?add-to-cart=' . $product_id ); ?>"
            class="pb-video-add-to-cart <?php echo $woo_cart_icon_display === 'hover' ? 'hover-only' : 'always'; ?>"
            data-product_id="<?php echo esc_attr( $product_id ); ?>"
    		style="top: calc(10px + max(<?php echo esc_attr( $border_width ); ?>px, <?php echo esc_attr( $border_radius ); ?>px * 0.15)); right: calc(10px + max(<?php echo esc_attr( $border_width ); ?>px, <?php echo esc_attr( $border_radius ); ?>px * 0.30));"
        >
            <img
                src="<?php echo esc_url( plugins_url( 'includes/icons/add-to-cart.png', dirname( __FILE__, 2 ) ) ); ?>"
                alt="<?php esc_attr_e( 'Add to Cart', 'portfolio-blocks' ); ?>"
                width="24"
                height="24"
            />
        </a>
    <?php endif; ?>
</div>
</div>