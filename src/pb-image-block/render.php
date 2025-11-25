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

$port_src     = esc_url( $attributes['src'] );
$port_full_src = !empty( $attributes['sizes']['full']['url'] ) ? esc_url( $attributes['sizes']['full']['url'] ) : $port_src;

$port_alt     = isset( $attributes['alt'] ) ? esc_attr( $attributes['alt'] ) : '';
$port_title   = isset( $attributes['title'] ) ? esc_attr( $attributes['title'] ) : '';
$port_caption = isset( $attributes['caption'] ) ? $attributes['caption'] : '';
$port_image_size = isset( $attributes['imageSize'] ) ? $attributes['imageSize'] : 'large';
$port_id      = isset( $attributes['id'] ) ? (int) $attributes['id'] : 0;
$port_loading_attr = 'eager';

$port_context = $block->context ?? [];

$port_lightbox         = $port_context['folioBlocks/lightbox'] ?? ! empty( $attributes['enableLightbox'] );
$port_caption_lightbox = $port_context['folioBlocks/lightboxCaption'] ?? ! empty( $attributes['showCaptionInLightbox'] );
$port_title_hover = $port_context['folioBlocks/onHoverTitle'] ?? ( isset( $attributes['showTitleOnHover'] ) ? (bool) $attributes['showTitleOnHover'] : false );

if ( pb_fs()->can_use_premium_code__premium_only() ) {
	$port_woo_active = is_plugin_active( 'woocommerce/woocommerce.php' );
	$port_enable_woo = ( $port_context['folioBlocks/enableWooCommerce'] ?? false ) && $port_woo_active;
	$port_woo_cart_display = $port_context['folioBlocks/wooCartIconDisplay'] ?? 'always';
	$port_woo_hover_info = $port_context['folioBlocks/wooProductPriceOnHover'] ?? false;
	$port_woo_lightbox_info = $port_context['folioBlocks/wooLightboxInfoType'] ?? 'caption';

	$port_lazy_load = $block->context['folioBlocks/lazyLoad'] ?? false;
	$port_loading_attr = $port_lazy_load ? 'lazy' : 'eager';
	$port_dropshadow       = $port_context['folioBlocks/dropShadow'] ?? ! empty( $attributes['dropshadow'] );


	$port_filter_category = $attributes['filterCategory'] ?? '';

	$port_border_width  = isset( $port_context['folioBlocks/borderWidth'] ) ? $port_context['folioBlocks/borderWidth'] : ( $attributes['borderWidth'] ?? 0 );
	$port_border_radius = isset( $port_context['folioBlocks/borderRadius'] ) ? $port_context['folioBlocks/borderRadius'] : ( $attributes['borderRadius'] ?? 0 );
	$port_border_color  = isset( $port_context['folioBlocks/borderColor'] ) ? $port_context['folioBlocks/borderColor'] : ( $attributes['borderColor'] ?? '#ffffff' );

	$port_img_styles = '';
		if ( $port_border_width > 0 ) {
			$port_img_styles .= '--pb-border-width: ' . esc_attr( $port_border_width ) . 'px;';
			if ( $port_border_color ) {
				$port_img_styles .= '--pb-border-color: ' . esc_attr( $port_border_color ) . ';';
			}
		}
		if ( $port_border_radius > 0 ) {
			$port_img_styles .= '--pb-border-radius: ' . esc_attr( $port_border_radius ) . 'px;';
		}
}

$port_wrapper_attributes = get_block_wrapper_attributes( [
	'class' => 'pb-image-block-wrapper',
] );

?>

<div 
	<?php echo wp_kses_post( $port_wrapper_attributes ); ?> 
	<?php if ( pb_fs()->can_use_premium_code__premium_only() ) : if ( $port_filter_category !== '' ) : ?>
		data-filter="<?php echo esc_attr( $port_filter_category ); ?>"
	<?php endif; endif; ?>
>
	<figure
		class="pb-image-block <?php echo esc_attr( $port_title_hover ? 'title-hover' : '' ); ?> 
		<?php if ( pb_fs()->can_use_premium_code__premium_only() ) { if ( $port_dropshadow ) { echo esc_attr( 'dropshadow' ); } } ?>"
		<?php if ( pb_fs()->can_use_premium_code__premium_only() ) { if ( ! empty( $attributes['enableDownload'] ) ) : ?>
			data-enable-download="true"
		<?php endif; } ?>
	>
		<?php if ( $port_lightbox ) : ?>
			<?php
			// Build dynamic lightbox caption
			if ( pb_fs()->can_use_premium_code__premium_only() ) {
				$port_lightbox_caption = '';
				if ( $port_caption_lightbox ) {
				
					if ( $port_enable_woo && $port_woo_lightbox_info === 'product' ) {
						$product_name  = $attributes['wooProductName'] ?? '';
						$product_price = $attributes['wooProductPrice'] ?? '';

						if ( ! empty( $product_name ) || ! empty( $product_price ) ) {
							// Proper HTML for WooCommerce product info
							$port_lightbox_caption  = '<div class="pb-lightbox-product-info">';
							if ( ! empty( $product_name ) ) {
								$port_lightbox_caption .= '<h4 class="pb-product-name">' . esc_html( $product_name ) . '</h4>';
							}
							if ( ! empty( $product_price ) ) {
								$port_lightbox_caption .= '<p class="pb-product-price">' . wp_kses_post( $product_price ) . '</p>';
							}
							$port_lightbox_caption .= '</div>';
						} elseif ( ! empty( $port_caption ) ) {
							// Fallback to regular image caption
							$port_lightbox_caption = wpautop( wp_kses_post( $port_caption ) );
						}
					} elseif ( ! empty( $port_caption ) ) {
						$port_lightbox_caption = wpautop( wp_kses_post( $port_caption ) );
					}
				} elseif ( ! empty( $port_caption ) ) {
					$port_lightbox_caption = wpautop( wp_kses_post( $port_caption ) );
				}
			}
			?>
			<a
				href="#"
				class="pb-image-block-lightbox"
				data-src="<?php echo esc_url( $port_full_src ); ?>"
				<?php if ( ! empty( $port_lightbox_caption ) ) : ?>
					data-caption="<?php echo esc_attr( $port_lightbox_caption ); ?>"
				<?php endif; ?>
				<?php if ( pb_fs()->can_use_premium_code__premium_only() ) : ?>
					<?php if ( $port_enable_woo && ! empty( $attributes['wooProductId'] ) ) : ?>
						data-product-id="<?php echo intval( $attributes['wooProductId'] ); ?>"
						data-product-name="<?php echo esc_attr( $attributes['wooProductName'] ?? '' ); ?>"
						data-product-price="<?php echo esc_attr( wp_strip_all_tags( $attributes['wooProductPrice'] ?? '' ) ); ?>"
					<?php endif; ?>
				<?php endif; ?>
			>
				<?php
				$port_img_attributes = [
					'class'    => 'pb-image-block-img wp-image-' . esc_attr( $port_id ),
					'loading'  => 'eager',
					'decoding' => 'async',
				];
				if ( pb_fs()->can_use_premium_code__premium_only() ) {
    				$port_img_attributes['style'] = $port_img_styles;
				}
				if ( ! empty( $port_alt ) ) {
					$port_img_attributes['alt'] = $port_alt;
				}
				echo wp_get_attachment_image( $port_id, $port_image_size, false, $port_img_attributes );
				?>
			</a>
		<?php else : ?>
			<?php
			$port_img_attributes = [
				'src'	 => $port_src,
				'class'    => 'pb-image-block-img wp-image-' . esc_attr( $port_id ),
				'loading' => $port_loading_attr,
				'decoding' => 'async',
			];
			if ( pb_fs()->can_use_premium_code__premium_only() ) {
    			$port_img_attributes['style'] = $port_img_styles;
			}
			if ( ! empty( $port_alt ) ) {
				$port_img_attributes['alt'] = $port_alt;
			}
			echo wp_get_attachment_image( $port_id, $port_image_size, false, $port_img_attributes );
			?>
		<?php endif; ?>

		<?php
			// Handle title/product overlay display (Pro only)
			if ( pb_fs()->can_use_premium_code__premium_only() && $port_title_hover ) {

				// --- Premium WooCommerce hover info ---
				if ( $port_enable_woo && $port_woo_hover_info ) {
					// WooCommerce product info on hover
					$product_name  = $attributes['wooProductName'] ?? '';
					$product_price = $attributes['wooProductPrice'] ?? '';

					if ( ! empty( $product_name ) || ! empty( $product_price ) ) {
						echo '<div class="pb-image-block-title-container">';
						echo '<figcaption class="pb-image-block-title" style="' . esc_attr( $port_img_styles ) . '">';
					if ( ! empty( $product_name ) ) {
						echo '<span class="pb-product-name">' . esc_html( $product_name ) . '</span>';
					}
					if ( ! empty( $product_price ) ) {
						echo '<span class="pb-product-price">' . wp_kses_post( $product_price ) . '</span>';
					}
					echo '</figcaption></div>';
				} elseif ( ! empty( $port_title ) ) {
					// Fallback to image title if no product info
					echo '<div class="pb-image-block-title-container">';
					echo '<figcaption class="pb-image-block-title" style="' . esc_attr( $port_img_styles ) . '">';
					echo wp_kses_post( $port_title );
					echo '</figcaption></div>';
				}
				} elseif ( $port_enable_woo && ! $port_woo_hover_info ) {
					if ( ! empty( $port_title ) ) {	
						echo '<div class="pb-image-block-title-container">';
						echo '<figcaption class="pb-image-block-title" style="' . esc_attr( $port_img_styles ) . '">';
						echo wp_kses_post( $port_title );
						echo '</figcaption></div>';
					}
				} elseif ( ! empty( $port_title ) ) {
					echo '<div class="pb-image-block-title-container">';
					echo '<figcaption class="pb-image-block-title" style="' . esc_attr( $port_img_styles ) . '">';
					echo wp_kses_post( $port_title );
					echo '</figcaption></div>';
				}
			}
		?>
		<?php if ( pb_fs()->can_use_premium_code__premium_only() ) : ?>
			<?php if ( $port_enable_woo && ! empty( $attributes['wooProductId'] ) ) : ?>
				<button
					type="button"
					class="pb-add-to-cart-icon <?php echo $port_woo_cart_display === 'hover' ? 'hover-only' : ''; ?>"
					data-add-to-cart="<?php echo esc_attr( intval( $attributes['wooProductId'] ) ); ?>"
					aria-label="<?php esc_attr_e( 'Add to Cart', 'folioblocks' ); ?>"
	    			style="top: calc(10px + max(<?php echo esc_attr( $port_border_width ); ?>px, <?php echo esc_attr( $port_border_radius ); ?>px * 0.15)); right: calc(10px + max(<?php echo esc_attr( $port_border_width ); ?>px, <?php echo esc_attr( $port_border_radius ); ?>px * 0.30));"
				>
					<img src="<?php echo esc_url( plugins_url( 'includes/icons/add-to-cart.png', dirname( __FILE__, 2 ) ) ); ?>" alt="<?php esc_attr_e( 'Add to Cart', 'folioblocks' ); ?>" width="24" height="24" />
				</button>
			<?php endif; ?>
		<?php endif; ?>
		<?php if ( pb_fs()->can_use_premium_code__premium_only() ) : ?>
			<?php if ( ( ! $port_enable_woo ) && ( ! empty( $port_context['folioBlocks/enableDownload'] ) || ! empty( $attributes['enableDownload'] ) ) ) : ?>
	    		<button 
	    			class="pb-image-block-download <?php echo !empty($port_context['folioBlocks/downloadOnHover']) ? 'hover-only' : ''; ?>" 
	    			aria-label="<?php esc_attr_e( 'Download Image', 'folioblocks' ); ?>"
	    			style="top: calc(10px + max(<?php echo esc_attr( $port_border_width ); ?>px, <?php echo esc_attr( $port_border_radius ); ?>px * 0.15)); right: calc(10px + max(<?php echo esc_attr( $port_border_width ); ?>px, <?php echo esc_attr( $port_border_radius ); ?>px * 0.30));"
	    			data-full-src="<?php echo esc_url( $port_full_src ); ?>"
				>
					<img src="<?php echo esc_url( plugins_url( 'includes/icons/download.png', dirname( __FILE__, 2 ) ) ); ?>" alt="<?php esc_attr_e( 'Download Image', 'folioblocks' ); ?>" width="24" height="24" />
				</button>
			<?php endif; ?>
		<?php endif; ?>
	</figure>
</div>