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
$fbks_context = $block->context ?? [];

$fbks_thumbnail = esc_url( $attributes['thumbnail'] ?? '' );
$fbks_title = esc_html( $attributes['title'] ?? '' );
$fbks_video_url = esc_url( $attributes['videoUrl'] ?? '' );
$fbks_aspect = esc_attr( $attributes['aspectRatio'] ?? '16:9' );
$fbks_play_visibility = esc_attr( $attributes['playButtonVisibility'] ?? 'always' );
$fbks_title_visibility = esc_attr( $attributes['titleVisibility'] ?? 'always' );
$fbks_filter_category = $attributes['filterCategory'] ?? '';

$fbks_woo_product_name        = '';
$fbks_woo_product_price       = '';
$fbks_woo_product_description = '';
$fbks_woo_product_url         = '';

$fbks_style = '';
$fbks_drop_shadow = false;

if ( fbks_fs()->can_use_premium_code__premium_only() ) {
	$fbks_border_color = esc_attr( $attributes['borderColor'] ?? '' );
	$fbks_border_width = absint( $attributes['borderWidth'] ?? 0 );
	$fbks_border_radius = absint( $attributes['borderRadius'] ?? 0 );
	$fbks_drop_shadow = ! empty( $attributes['dropShadow'] );
	$fbks_lazy_load = ! empty( $attributes['lazyLoad'] );

	$fbks_woo_active = is_plugin_active( 'woocommerce/woocommerce.php' );
	$fbks_enable_woo = ( $fbks_context['folioBlocks/enableWooCommerce'] ?? false ) && $fbks_woo_active;

	// Per-block WooCommerce product info resets
	$fbks_woo_product_name = $attributes['wooProductName'] ?? '';
	$fbks_woo_product_price = $attributes['wooProductPrice'] ?? '';
	$fbks_woo_product_description = $attributes['wooProductDescription'] ?? '';
	$fbks_woo_product_url = $attributes['wooProductURL'] ?? '';

	// Build style string for border and radius
	$fbks_style = '';
	if ( $fbks_border_width > 0 ) {
		$fbks_style .= "border-width: {$fbks_border_width}px; border-style: solid;";
		if ( $fbks_border_color ) {
			$fbks_style .= "border-color: {$fbks_border_color};";
		}
	}
	if ( $fbks_border_radius > 0 ) {
		$fbks_style .= "border-radius: {$fbks_border_radius}px;";
	}
}
// Only bail if no video URL exists
if ( ! $fbks_video_url ) {
	return '';
}

// Render placeholder if thumbnail is missing
if ( ! $fbks_thumbnail ) {
	$fbks_thumbnail_html = '<div class="pb-video-placeholder" aria-hidden="true">
		<h3 class="pb-video-missing">Thumbnail Missing</h3>
	</div>';
} else {
	$fbks_thumbnail_html = wp_get_attachment_image(
		$attributes['thumbnailId'] ?? 0,
		'full',
		false,
		[
			'alt'   => $fbks_title,
			'class' => 'pb-video-block-img',
			'loading' => $fbks_lazy_load ? 'lazy' : 'eager'
		]
	);
}
// Determine layout classes and structure
$fbks_layout = $attributes['lightboxLayout'] ?? 'video-only';
$fbks_layout_class = '';
if ( $fbks_layout === 'split' ) {
	$fbks_layout_class = 'split-layout';
} elseif ( $fbks_layout === 'video-product' ) {
	$fbks_layout_class = 'video-product-layout';
}
$fbks_lightbox_id = uniqid('pbv_', false);
?>

<div <?php echo wp_kses_post( get_block_wrapper_attributes() ); ?>>
	<?php
		$fbks_overlay_class = '';
		if ( $fbks_play_visibility === 'always' || $fbks_title_visibility === 'always' ) {
			$fbks_overlay_class = ' has-overlay-always';
		} elseif ( $fbks_play_visibility === 'onHover' || $fbks_title_visibility === 'onHover' ) {
			$fbks_overlay_class = ' has-overlay-hover';
		}
	?>
	<div class="pb-video-block aspect-<?php echo esc_attr( str_replace( ':', '-', $fbks_aspect ) ); ?><?php echo esc_attr( $fbks_overlay_class ); ?><?php if ( fbks_fs()->can_use_premium_code__premium_only() ) { echo $fbks_drop_shadow ? ' drop-shadow' : ''; } ?>"
		data-filter="<?php echo esc_attr( $fbks_filter_category ); ?>"
		data-video-url="<?php echo esc_url( $fbks_video_url ); ?>"
		data-lbx="<?php echo esc_attr( $fbks_lightbox_id ); ?>"
		data-video-title="<?php echo esc_attr( $fbks_title ); ?>"
		<?php if ( fbks_fs()->can_use_premium_code__premium_only() ) : ?>
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
		style="<?php echo esc_attr( $fbks_style ); ?>">

		<?php echo wp_kses_post( $fbks_thumbnail_html ); ?>

		<div class="video-overlay">
			<div class="overlay-content">
				<?php if ( $fbks_title && $fbks_title_visibility !== 'hidden' ) : ?>
					<div class="video-title-overlay <?php echo esc_attr( $fbks_title_visibility ); ?>"><?php echo esc_html( $fbks_title ); ?></div>
				<?php endif; ?>
				<?php if ( $fbks_play_visibility !== 'hidden' ) : ?>
					<div class="video-play-button <?php echo esc_attr( $fbks_play_visibility ); ?>">▶</div>
				<?php endif; ?>
			</div>
		</div>
		
    	<?php
			if ( fbks_fs()->can_use_premium_code__premium_only() ) :
				if ( $fbks_enable_woo && ! empty( $attributes['wooProductId'] ) ) :    	    
					$fbks_woo_cart_icon_display = $fbks_context['folioBlocks/wooCartIconDisplay'] ?? 'always';
					$fbks_product_id = absint( $attributes['wooProductId'] );
		?>
		    <a
		        href="<?php echo esc_url( '?add-to-cart=' . $fbks_product_id ); ?>"
		        class="pb-video-add-to-cart <?php echo $fbks_woo_cart_icon_display === 'hover' ? 'hover-only' : 'always'; ?>"
		        data-product_id="<?php echo esc_attr( $fbks_product_id ); ?>"
				style="top: calc(10px + max(<?php echo esc_attr( $fbks_border_width ); ?>px, <?php echo esc_attr( $fbks_border_radius ); ?>px * 0.15)); right: calc(10px + max(<?php echo esc_attr( $fbks_border_width ); ?>px, <?php echo esc_attr( $fbks_border_radius ); ?>px * 0.30));"
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
		<div class="pb-video-lightbox <?php echo esc_attr( $fbks_layout_class ); ?>" data-lbx="<?php echo esc_attr( $fbks_lightbox_id ); ?>" role="dialog" aria-modal="true" aria-label="<?php echo $fbks_title ? 'Video: ' . esc_attr( $fbks_title ) : esc_attr__( 'Video lightbox', 'folioblocks' ); ?>">
		    <div class="pb-video-lightbox-inner">
		        <button class="pb-video-lightbox-close" aria-label="<?php esc_attr_e( 'Close', 'folioblocks' ); ?>">×</button>

		            <?php if ( $fbks_layout === 'split' || $fbks_layout === 'video-product' ) : ?>
		                <div class="pb-video-lightbox-video" style="flex: 0 0 70%"></div>
		                <div class="pb-video-lightbox-info" style="flex: 0 0 30%">
		                    <?php if ( fbks_fs()->can_use_premium_code__premium_only() ) : ?>
		                        <?php if ( $fbks_enable_woo && $fbks_layout === 'video-product' && ( $fbks_woo_product_name || $fbks_woo_product_price || $fbks_woo_product_description || $fbks_woo_product_url ) ) : ?>
		                            <div class="pb-lightbox-product-info">
		                                <?php if ( $fbks_woo_product_name ) : ?>
		                                    <h2 class="pb-product-name"><?php echo esc_html( $fbks_woo_product_name ); ?></h2>
		                                <?php endif; ?>
		                                <?php if ( $fbks_woo_product_price ) : ?>
		                                    <p class="pb-product-price"><?php echo wp_kses_post( $fbks_woo_product_price ); ?></p>
		                                <?php endif; ?>
		                                <?php if ( $fbks_woo_product_description ) : ?>
		                                    <?php echo wp_kses_post( $fbks_woo_product_description ); ?>
		                                <?php endif; ?>
		                                <?php if ( $fbks_woo_product_url ) : ?>
		                                    <a href="<?php echo esc_url( $fbks_woo_product_url ); ?>" class="pb-video-lightbox-product-button" target="_blank" rel="noopener noreferrer">
		                                        <?php esc_html_e( 'View Product', 'folioblocks' ); ?>
		                                    </a>
		                                <?php endif; ?>
		                            </div>
		                        <?php else : ?>
		                            <?php if ( ! empty( $fbks_title ) ) : ?>
		                                <h2 class="pb-video-lightbox-title"><?php echo esc_html( $fbks_title ); ?></h2>
		                            <?php endif; ?>
		                            <?php if ( ! empty( $attributes['description'] ) ) : ?>
		                                <p class="pb-video-lightbox-description"><?php echo esc_html( $attributes['description'] ); ?></p>
		                            <?php endif; ?>
		                        <?php endif; ?>
		                    <?php else : ?>
		                        <?php if ( ! empty( $fbks_title ) ) : ?>
		                            <h2 class="pb-video-lightbox-title"><?php echo esc_html( $fbks_title ); ?></h2>
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