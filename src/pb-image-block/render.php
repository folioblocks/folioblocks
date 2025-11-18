<?php
/**
 * PB Image Block
 * Render PHP
 **/

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
// Fail gracefully 
if ( empty( $attributes['src'] ) ) {
	echo '<div class="pb-image-block"><p>No image selected.</p></div>';
	return;
}
// Runtime check — ensure WooCommerce output only if plugin is active
if ( ! function_exists( 'is_plugin_active' ) ) {
    include_once ABSPATH . 'wp-admin/includes/plugin.php';
}

$pb_src     = esc_url( $attributes['src'] );
$pb_full_src = !empty( $attributes['sizes']['full']['url'] ) ? esc_url( $attributes['sizes']['full']['url'] ) : $pb_src;

$pb_alt     = isset( $attributes['alt'] ) ? esc_attr( $attributes['alt'] ) : '';
$pb_title   = isset( $attributes['title'] ) ? esc_attr( $attributes['title'] ) : '';
$pb_caption = isset( $attributes['caption'] ) ? $attributes['caption'] : '';
$pb_image_size = isset( $attributes['imageSize'] ) ? $attributes['imageSize'] : 'large';
$pb_id      = isset( $attributes['id'] ) ? (int) $attributes['id'] : 0;
$pb_loading_attr = 'eager';

$pb_context = $block->context ?? [];

$pb_lightbox         = $pb_context['folioBlocks/lightbox'] ?? ! empty( $attributes['enableLightbox'] );
$pb_caption_lightbox = $pb_context['folioBlocks/lightboxCaption'] ?? ! empty( $attributes['showCaptionInLightbox'] );
$pb_title_hover = $pb_context['folioBlocks/onHoverTitle'] ?? ( isset( $attributes['showTitleOnHover'] ) ? (bool) $attributes['showTitleOnHover'] : false );

if ( pb_fs()->can_use_premium_code__premium_only() ) {
	$pb_woo_active = is_plugin_active( 'woocommerce/woocommerce.php' );
	$pb_enable_woo = ( $pb_context['folioBlocks/enableWooCommerce'] ?? false ) && $pb_woo_active;
	$pb_woo_cart_display = $pb_context['folioBlocks/wooCartIconDisplay'] ?? 'always';
	$pb_woo_hover_info = $pb_context['folioBlocks/wooProductPriceOnHover'] ?? false;
	$pb_woo_lightbox_info = $pb_context['folioBlocks/wooLightboxInfoType'] ?? 'caption';

	$pb_lazy_load = $block->context['folioBlocks/lazyLoad'] ?? false;
	$pb_loading_attr = $pb_lazy_load ? 'lazy' : 'eager';
	$pb_dropshadow       = $pb_context['folioBlocks/dropShadow'] ?? ! empty( $attributes['dropshadow'] );


	$pb_filter_category = $attributes['filterCategory'] ?? '';

	$pb_border_width  = isset( $pb_context['folioBlocks/borderWidth'] ) ? $pb_context['folioBlocks/borderWidth'] : ( $attributes['borderWidth'] ?? 0 );
	$pb_border_radius = isset( $pb_context['folioBlocks/borderRadius'] ) ? $pb_context['folioBlocks/borderRadius'] : ( $attributes['borderRadius'] ?? 0 );
	$pb_border_color  = isset( $pb_context['folioBlocks/borderColor'] ) ? $pb_context['folioBlocks/borderColor'] : ( $attributes['borderColor'] ?? '#ffffff' );

	$pb_img_styles = '';
		if ( $pb_border_width > 0 ) {
			$pb_img_styles .= '--pb-border-width: ' . esc_attr( $pb_border_width ) . 'px;';
			if ( $pb_border_color ) {
				$pb_img_styles .= '--pb-border-color: ' . esc_attr( $pb_border_color ) . ';';
			}
		}
		if ( $pb_border_radius > 0 ) {
			$pb_img_styles .= '--pb-border-radius: ' . esc_attr( $pb_border_radius ) . 'px;';
		}
}

$pb_wrapper_attributes = get_block_wrapper_attributes( [
	'class' => 'pb-image-block-wrapper',
] );

?>

<div 
	<?php echo wp_kses_post( $pb_wrapper_attributes ); ?> 
	<?php if ( pb_fs()->can_use_premium_code__premium_only() ) : if ( $pb_filter_category !== '' ) : ?>
		data-filter="<?php echo esc_attr( $pb_filter_category ); ?>"
	<?php endif; endif; ?>
>
	<figure
		class="pb-image-block <?php echo esc_attr( $pb_title_hover ? 'title-hover' : '' ); ?> 
		<?php if ( pb_fs()->can_use_premium_code__premium_only() ) { if ( $pb_dropshadow ) { echo esc_attr( 'dropshadow' ); } } ?>"
		<?php if ( pb_fs()->can_use_premium_code__premium_only() ) { if ( ! empty( $attributes['enableDownload'] ) ) : ?>
			data-enable-download="true"
		<?php endif; } ?>
	>
		<?php if ( $pb_lightbox ) : ?>
			<?php
			// Build dynamic lightbox caption
			if ( pb_fs()->can_use_premium_code__premium_only() ) {
				$pb_lightbox_caption = '';
				if ( $pb_caption_lightbox ) {
				
					if ( $pb_enable_woo && $pb_woo_lightbox_info === 'product' ) {
						$product_name  = $attributes['wooProductName'] ?? '';
						$product_price = $attributes['wooProductPrice'] ?? '';

						if ( ! empty( $product_name ) || ! empty( $product_price ) ) {
							// Proper HTML for WooCommerce product info
							$pb_lightbox_caption  = '<div class="pb-lightbox-product-info">';
							if ( ! empty( $product_name ) ) {
								$pb_lightbox_caption .= '<h4 class="pb-product-name">' . esc_html( $product_name ) . '</h4>';
							}
							if ( ! empty( $product_price ) ) {
								$pb_lightbox_caption .= '<p class="pb-product-price">' . wp_kses_post( $product_price ) . '</p>';
							}
							$pb_lightbox_caption .= '</div>';
						} elseif ( ! empty( $pb_caption ) ) {
							// Fallback to regular image caption
							$pb_lightbox_caption = wpautop( wp_kses_post( $pb_caption ) );
						}
					} elseif ( ! empty( $pb_caption ) ) {
						$pb_lightbox_caption = wpautop( wp_kses_post( $pb_caption ) );
					}
				} elseif ( ! empty( $pb_caption ) ) {
					$pb_lightbox_caption = wpautop( wp_kses_post( $pb_caption ) );
				}
			}
			?>
			<a
				href="#"
				class="pb-image-block-lightbox"
				data-src="<?php echo esc_url( $pb_full_src ); ?>"
				<?php if ( ! empty( $pb_lightbox_caption ) ) : ?>
					data-caption="<?php echo esc_attr( $pb_lightbox_caption ); ?>"
				<?php endif; ?>
				<?php if ( pb_fs()->can_use_premium_code__premium_only() ) : ?>
					<?php if ( $pb_enable_woo && ! empty( $attributes['wooProductId'] ) ) : ?>
						data-product-id="<?php echo intval( $attributes['wooProductId'] ); ?>"
						data-product-name="<?php echo esc_attr( $attributes['wooProductName'] ?? '' ); ?>"
						data-product-price="<?php echo esc_attr( wp_strip_all_tags( $attributes['wooProductPrice'] ?? '' ) ); ?>"
					<?php endif; ?>
				<?php endif; ?>
			>
				<?php
				$pb_img_attributes = [
					'class'    => 'pb-image-block-img wp-image-' . esc_attr( $pb_id ),
					'loading'  => 'eager',
					'decoding' => 'async',
				];
				if ( pb_fs()->can_use_premium_code__premium_only() ) {
    				$pb_img_attributes['style'] = $pb_img_styles;
				}
				if ( ! empty( $pb_alt ) ) {
					$pb_img_attributes['alt'] = $pb_alt;
				}
				echo wp_get_attachment_image( $pb_id, $pb_image_size, false, $pb_img_attributes );
				?>
			</a>
		<?php else : ?>
			<?php
			$pb_img_attributes = [
				'src'	 => $pb_src,
				'class'    => 'pb-image-block-img wp-image-' . esc_attr( $pb_id ),
				'loading' => $pb_loading_attr,
				'decoding' => 'async',
			];
			if ( pb_fs()->can_use_premium_code__premium_only() ) {
    			$pb_img_attributes['style'] = $pb_img_styles;
			}
			if ( ! empty( $pb_alt ) ) {
				$pb_img_attributes['alt'] = $pb_alt;
			}
			echo wp_get_attachment_image( $pb_id, $pb_image_size, false, $pb_img_attributes );
			?>
		<?php endif; ?>

		<?php
			// Handle title/product overlay display (Pro only)
			if ( pb_fs()->can_use_premium_code__premium_only() && $pb_title_hover ) {

				// --- Premium WooCommerce hover info ---
				if ( $pb_enable_woo && $pb_woo_hover_info ) {
					// WooCommerce product info on hover
					$product_name  = $attributes['wooProductName'] ?? '';
					$product_price = $attributes['wooProductPrice'] ?? '';

					if ( ! empty( $product_name ) || ! empty( $product_price ) ) {
						echo '<div class="pb-image-block-title-container">';
						echo '<figcaption class="pb-image-block-title" style="' . esc_attr( $pb_img_styles ) . '">';
					if ( ! empty( $product_name ) ) {
						echo '<span class="pb-product-name">' . esc_html( $product_name ) . '</span>';
					}
					if ( ! empty( $product_price ) ) {
						echo '<span class="pb-product-price">' . wp_kses_post( $product_price ) . '</span>';
					}
					echo '</figcaption></div>';
				} elseif ( ! empty( $pb_title ) ) {
					// Fallback to image title if no product info
					echo '<div class="pb-image-block-title-container">';
					echo '<figcaption class="pb-image-block-title" style="' . esc_attr( $pb_img_styles ) . '">';
					echo wp_kses_post( $pb_title );
					echo '</figcaption></div>';
				}
				} elseif ( $pb_enable_woo && ! $pb_woo_hover_info ) {
					if ( ! empty( $pb_title ) ) {	
						echo '<div class="pb-image-block-title-container">';
						echo '<figcaption class="pb-image-block-title" style="' . esc_attr( $pb_img_styles ) . '">';
						echo wp_kses_post( $pb_title );
						echo '</figcaption></div>';
					}
				} elseif ( ! empty( $pb_title ) ) {
					echo '<div class="pb-image-block-title-container">';
					echo '<figcaption class="pb-image-block-title" style="' . esc_attr( $pb_img_styles ) . '">';
					echo wp_kses_post( $pb_title );
					echo '</figcaption></div>';
				}
			}
		?>
		<?php if ( pb_fs()->can_use_premium_code__premium_only() ) : ?>
			<?php if ( $pb_enable_woo && ! empty( $attributes['wooProductId'] ) ) : ?>
				<button
					type="button"
					class="pb-add-to-cart-icon <?php echo $pb_woo_cart_display === 'hover' ? 'hover-only' : ''; ?>"
					data-add-to-cart="<?php echo esc_attr( intval( $attributes['wooProductId'] ) ); ?>"
					aria-label="<?php esc_attr_e( 'Add to Cart', 'folioblocks' ); ?>"
	    			style="top: calc(10px + max(<?php echo esc_attr( $pb_border_width ); ?>px, <?php echo esc_attr( $pb_border_radius ); ?>px * 0.15)); right: calc(10px + max(<?php echo esc_attr( $pb_border_width ); ?>px, <?php echo esc_attr( $pb_border_radius ); ?>px * 0.30));"
				>
					<img src="<?php echo esc_url( plugins_url( 'includes/icons/add-to-cart.png', dirname( __FILE__, 2 ) ) ); ?>" alt="<?php esc_attr_e( 'Add to Cart', 'folioblocks' ); ?>" width="24" height="24" />
				</button>
			<?php endif; ?>
		<?php endif; ?>
		<?php if ( pb_fs()->can_use_premium_code__premium_only() ) : ?>
			<?php if ( ( ! $pb_enable_woo ) && ( ! empty( $pb_context['folioBlocks/enableDownload'] ) || ! empty( $attributes['enableDownload'] ) ) ) : ?>
	    		<button 
	    			class="pb-image-block-download <?php echo !empty($pb_context['folioBlocks/downloadOnHover']) ? 'hover-only' : ''; ?>" 
	    			aria-label="<?php esc_attr_e( 'Download Image', 'folioblocks' ); ?>"
	    			style="top: calc(10px + max(<?php echo esc_attr( $pb_border_width ); ?>px, <?php echo esc_attr( $pb_border_radius ); ?>px * 0.15)); right: calc(10px + max(<?php echo esc_attr( $pb_border_width ); ?>px, <?php echo esc_attr( $pb_border_radius ); ?>px * 0.30));"
	    			data-full-src="<?php echo esc_url( $pb_full_src ); ?>"
				>
					<img src="<?php echo esc_url( plugins_url( 'includes/icons/download.png', dirname( __FILE__, 2 ) ) ); ?>" alt="<?php esc_attr_e( 'Download Image', 'folioblocks' ); ?>" width="24" height="24" />
				</button>
			<?php endif; ?>
		<?php endif; ?>
	</figure>
</div>