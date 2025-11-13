<?php
/**
 * PB Video Block
 * Render PHP
 **/

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
// Runtime check — ensure WooCommerce output only if plugin is active
if ( ! function_exists( 'is_plugin_active' ) ) {
    include_once ABSPATH . 'wp-admin/includes/plugin.php';
}
$pb_context = $block->context ?? [];

$pb_thumbnail = esc_url( $attributes['thumbnail'] ?? '' );
$pb_title = esc_html( $attributes['title'] ?? '' );
$pb_video_url = esc_url( $attributes['videoUrl'] ?? '' );
$pb_aspect = esc_attr( $attributes['aspectRatio'] ?? '16:9' );
$pb_play_visibility = esc_attr( $attributes['playButtonVisibility'] ?? 'always' );
$pb_title_visibility = esc_attr( $attributes['titleVisibility'] ?? 'always' );
$pb_filter_category = $attributes['filterCategory'] ?? '';

$pb_woo_product_name        = '';
$pb_woo_product_price       = '';
$pb_woo_product_description = '';
$pb_woo_product_url         = '';

if ( pb_fs()->can_use_premium_code__premium_only() ) {
	$border_color = esc_attr( $attributes['borderColor'] ?? '' );
	$border_width = absint( $attributes['borderWidth'] ?? 0 );
	$border_radius = absint( $attributes['borderRadius'] ?? 0 );
	$drop_shadow = ! empty( $attributes['dropShadow'] );
	$lazy_load = ! empty( $attributes['lazyLoad'] );

	$woo_active = is_plugin_active( 'woocommerce/woocommerce.php' );
	$enable_woo = ( $pb_context['folioBlocks/enableWooCommerce'] ?? false ) && $woo_active;

	// Per-block WooCommerce product info resets
	$pb_woo_product_name = $attributes['wooProductName'] ?? '';
	$pb_woo_product_price = $attributes['wooProductPrice'] ?? '';
	$pb_woo_product_description = $attributes['wooProductDescription'] ?? '';
	$pb_woo_product_url = $attributes['wooProductURL'] ?? '';

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
}
// Only bail if no video URL exists
if ( ! $pb_video_url ) {
	return '';
}

// Render placeholder if thumbnail is missing
if ( ! $pb_thumbnail ) {
	$pb_thumbnail_html = '<div class="pb-video-placeholder" aria-hidden="true">
		<h3 class="pb-video-missing">Thumbnail Missing</h3>
	</div>';
} else {
	$pb_thumbnail_html = wp_get_attachment_image(
		$attributes['thumbnailId'] ?? 0,
		'full',
		false,
		[
			'alt'   => $pb_title,
			'class' => 'pb-video-block-img',
			'loading' => $lazy_load ? 'lazy' : 'eager'
		]
	);
}
// Determine layout classes and structure
$pb_layout = $attributes['lightboxLayout'] ?? 'video-only';
$pb_layout_class = '';
if ( $pb_layout === 'split' ) {
	$pb_layout_class = 'split-layout';
} elseif ( $pb_layout === 'video-product' ) {
	$pb_layout_class = 'video-product-layout';
}
$pb_lightbox_id = uniqid('pbv_', false);
?>

<div <?php echo wp_kses_post( get_block_wrapper_attributes() ); ?>>
	<?php
		$pb_overlay_class = '';
		if ( $pb_play_visibility === 'always' || $pb_title_visibility === 'always' ) {
			$pb_overlay_class = ' has-overlay-always';
		} elseif ( $pb_play_visibility === 'onHover' || $pb_title_visibility === 'onHover' ) {
			$pb_overlay_class = ' has-overlay-hover';
		}
	?>
	<div class="pb-video-block aspect-<?php echo esc_attr( str_replace( ':', '-', $pb_aspect ) ); ?><?php echo esc_attr( $pb_overlay_class ); ?><?php if ( pb_fs()->can_use_premium_code__premium_only() ) { echo $drop_shadow ? ' drop-shadow' : ''; } ?>"
		data-filter="<?php echo esc_attr( $pb_filter_category ); ?>"
		data-video-url="<?php echo esc_url( $pb_video_url ); ?>"
		data-lbx="<?php echo esc_attr( $pb_lightbox_id ); ?>"
		data-video-title="<?php echo esc_attr( $pb_title ); ?>"
		<?php if ( pb_fs()->can_use_premium_code__premium_only() ) : ?>
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
		<?php endif; ?>
		<?php if ( ! empty( $attributes['description'] ) ) : ?>
			data-video-description="<?php echo esc_attr( $attributes['description'] ); ?>"
		<?php endif; ?>
		style="<?php echo esc_attr( $style ); ?>">

		<?php echo wp_kses_post( $pb_thumbnail_html ); ?>

		<div class="video-overlay">
			<div class="overlay-content">
				<?php if ( $pb_title && $pb_title_visibility !== 'hidden' ) : ?>
					<div class="video-title-overlay <?php echo esc_attr( $pb_title_visibility ); ?>"><?php echo esc_html( $pb_title ); ?></div>
				<?php endif; ?>
				<?php if ( $pb_play_visibility !== 'hidden' ) : ?>
					<div class="video-play-button <?php echo esc_attr( $pb_play_visibility ); ?>">▶</div>
				<?php endif; ?>
			</div>
		</div>
		
    	<?php
			if ( pb_fs()->can_use_premium_code__premium_only() ) :
				if ( $enable_woo && ! empty( $attributes['wooProductId'] ) ) :    	    
					$woo_cart_icon_display = $pb_context['folioBlocks/wooCartIconDisplay'] ?? 'always';
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
		            alt="<?php esc_attr_e( 'Add to Cart', 'folioblocks' ); ?>"
		            width="24"
		            height="24"
		        />
		    </a>
    	<?php
				endif;
			endif;
		?>
	</div>
	<!-- Lightbox Markup -->
		<div class="pb-video-lightbox <?php echo esc_attr( $pb_layout_class ); ?>" data-lbx="<?php echo esc_attr( $pb_lightbox_id ); ?>" role="dialog" aria-modal="true" aria-label="<?php echo $pb_title ? 'Video: ' . esc_attr( $pb_title ) : esc_attr__( 'Video lightbox', 'folioblocks' ); ?>">
		    <div class="pb-video-lightbox-inner">
		        <button class="pb-video-lightbox-close" aria-label="<?php esc_attr_e( 'Close', 'folioblocks' ); ?>">×</button>

		            <?php if ( $pb_layout === 'split' || $pb_layout === 'video-product' ) : ?>
		                <div class="pb-video-lightbox-video" style="flex: 0 0 70%"></div>
		                <div class="pb-video-lightbox-info" style="flex: 0 0 30%">
		                    <?php if ( pb_fs()->can_use_premium_code__premium_only() ) : ?>
		                        <?php if ( $enable_woo && $pb_layout === 'video-product' && ( $pb_woo_product_name || $pb_woo_product_price || $pb_woo_product_description || $pb_woo_product_url ) ) : ?>
		                            <div class="pb-lightbox-product-info">
		                                <?php if ( $pb_woo_product_name ) : ?>
		                                    <h2 class="pb-product-name"><?php echo esc_html( $pb_woo_product_name ); ?></h2>
		                                <?php endif; ?>
		                                <?php if ( $pb_woo_product_price ) : ?>
		                                    <p class="pb-product-price"><?php echo wp_kses_post( $pb_woo_product_price ); ?></p>
		                                <?php endif; ?>
		                                <?php if ( $pb_woo_product_description ) : ?>
		                                    <?php echo wp_kses_post( $pb_woo_product_description ); ?>
		                                <?php endif; ?>
		                                <?php if ( $pb_woo_product_url ) : ?>
		                                    <a href="<?php echo esc_url( $pb_woo_product_url ); ?>" class="pb-video-lightbox-product-button" target="_blank" rel="noopener noreferrer">
		                                        <?php esc_html_e( 'View Product', 'folioblocks' ); ?>
		                                    </a>
		                                <?php endif; ?>
		                            </div>
		                        <?php else : ?>
		                            <?php if ( ! empty( $pb_title ) ) : ?>
		                                <h2 class="pb-video-lightbox-title"><?php echo esc_html( $pb_title ); ?></h2>
		                            <?php endif; ?>
		                            <?php if ( ! empty( $attributes['description'] ) ) : ?>
		                                <p class="pb-video-lightbox-description"><?php echo esc_html( $attributes['description'] ); ?></p>
		                            <?php endif; ?>
		                        <?php endif; ?>
		                    <?php else : ?>
		                        <?php if ( ! empty( $pb_title ) ) : ?>
		                            <h2 class="pb-video-lightbox-title"><?php echo esc_html( $pb_title ); ?></h2>
		                        <?php endif; ?>
		                        <?php if ( ! empty( $attributes['description'] ) ) : ?>
		                            <p class="pb-video-lightbox-description"><?php echo esc_html( $attributes['description'] ); ?></p>
		                        <?php endif; ?>
		                    <?php endif; ?>
		                </div>
		            <?php else : ?>
		                <div class="pb-video-lightbox-video"></div>
		            <?php endif; ?>
		    </div>
		</div>
</div>