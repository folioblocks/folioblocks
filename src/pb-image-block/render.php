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

$fbks_src     = esc_url( $attributes['src'] );
$fbks_full_src = !empty( $attributes['sizes']['full']['url'] ) ? esc_url( $attributes['sizes']['full']['url'] ) : $fbks_src;

$fbks_alt     = isset( $attributes['alt'] ) ? esc_attr( $attributes['alt'] ) : '';
$fbks_title   = isset( $attributes['title'] ) ? esc_attr( $attributes['title'] ) : '';
$fbks_caption = isset( $attributes['caption'] ) ? $attributes['caption'] : '';
$fbks_image_size = isset( $attributes['imageSize'] ) ? $attributes['imageSize'] : 'large';
$fbks_id      = isset( $attributes['id'] ) ? (int) $attributes['id'] : 0;
$fbks_loading_attr = 'eager';

$fbks_context = $block->context ?? [];

$fbks_lightbox         = $fbks_context['folioBlocks/lightbox'] ?? ! empty( $attributes['enableLightbox'] );
$fbks_caption_lightbox = $fbks_context['folioBlocks/lightboxCaption'] ?? ! empty( $attributes['showCaptionInLightbox'] );
$fbks_title_hover = $fbks_context['folioBlocks/onHoverTitle'] ?? ( isset( $attributes['showTitleOnHover'] ) ? (bool) $attributes['showTitleOnHover'] : false );

if ( fbks_fs()->can_use_premium_code__premium_only() ) {
	$fbks_woo_active = is_plugin_active( 'woocommerce/woocommerce.php' );
	$fbks_enable_woo = ( $fbks_context['folioBlocks/enableWooCommerce'] ?? false ) && $fbks_woo_active;
	$fbks_woo_cart_display = $fbks_context['folioBlocks/wooCartIconDisplay'] ?? 'always';
	$fbks_woo_hover_info = $fbks_context['folioBlocks/wooProductPriceOnHover'] ?? false;
	$fbks_woo_lightbox_info = $fbks_context['folioBlocks/wooLightboxInfoType'] ?? 'caption';

	$fbks_lazy_load = $block->context['folioBlocks/lazyLoad'] ?? false;
	$fbks_loading_attr = $fbks_lazy_load ? 'lazy' : 'eager';
	$fbks_dropshadow       = $fbks_context['folioBlocks/dropShadow'] ?? ! empty( $attributes['dropshadow'] );


	$fbks_filter_category = $attributes['filterCategory'] ?? '';

	$fbks_border_width  = isset( $fbks_context['folioBlocks/borderWidth'] ) ? $fbks_context['folioBlocks/borderWidth'] : ( $attributes['borderWidth'] ?? 0 );
	$fbks_border_radius = isset( $fbks_context['folioBlocks/borderRadius'] ) ? $fbks_context['folioBlocks/borderRadius'] : ( $attributes['borderRadius'] ?? 0 );
	$fbks_border_color  = isset( $fbks_context['folioBlocks/borderColor'] ) ? $fbks_context['folioBlocks/borderColor'] : ( $attributes['borderColor'] ?? '#ffffff' );

	$fbks_img_styles = '';
		if ( $fbks_border_width > 0 ) {
			$fbks_img_styles .= '--pb-border-width: ' . esc_attr( $fbks_border_width ) . 'px;';
			if ( $fbks_border_color ) {
				$fbks_img_styles .= '--pb-border-color: ' . esc_attr( $fbks_border_color ) . ';';
			}
		}
		if ( $fbks_border_radius > 0 ) {
			$fbks_img_styles .= '--pb-border-radius: ' . esc_attr( $fbks_border_radius ) . 'px;';
		}
}

$fbks_wrapper_attributes = get_block_wrapper_attributes( [
	'class' => 'pb-image-block-wrapper',
] );

?>

<div 
	<?php echo wp_kses_post( $fbks_wrapper_attributes ); ?> 
	<?php if ( fbks_fs()->can_use_premium_code__premium_only() ) : if ( $fbks_filter_category !== '' ) : ?>
		data-filter="<?php echo esc_attr( $fbks_filter_category ); ?>"
	<?php endif; endif; ?>
>
	<figure
		class="pb-image-block <?php echo esc_attr( $fbks_title_hover ? 'title-hover' : '' ); ?> 
		<?php if ( fbks_fs()->can_use_premium_code__premium_only() ) { if ( $fbks_dropshadow ) { echo esc_attr( 'dropshadow' ); } } ?>"
		<?php if ( fbks_fs()->can_use_premium_code__premium_only() ) { if ( ! empty( $attributes['enableDownload'] ) ) : ?>
			data-enable-download="true"
		<?php endif; } ?>
	>
		<?php if ( $fbks_lightbox ) : ?>
			<?php
			// Build dynamic lightbox caption
			if ( fbks_fs()->can_use_premium_code__premium_only() ) {
				$fbks_lightbox_caption = '';
				if ( $fbks_caption_lightbox ) {
				
					if ( $fbks_enable_woo && $fbks_woo_lightbox_info === 'product' ) {
						$fbks_product_name  = $attributes['wooProductName'] ?? '';
						$fbks_product_price = $attributes['wooProductPrice'] ?? '';

						if ( ! empty( $fbks_product_name ) || ! empty( $fbks_product_price ) ) {
							// Proper HTML for WooCommerce product info
							$fbks_lightbox_caption  = '<div class="pb-lightbox-product-info">';
							if ( ! empty( $fbks_product_name ) ) {
								$fbks_lightbox_caption .= '<h4 class="pb-product-name">' . esc_html( $fbks_product_name ) . '</h4>';
							}
							if ( ! empty( $fbks_product_price ) ) {
								$fbks_lightbox_caption .= '<p class="pb-product-price">' . wp_kses_post( $fbks_product_price ) . '</p>';
							}
							$fbks_lightbox_caption .= '</div>';
						} elseif ( ! empty( $fbks_caption ) ) {
							// Fallback to regular image caption
							$fbks_lightbox_caption = wpautop( wp_kses_post( $fbks_caption ) );
						}
					} elseif ( ! empty( $fbks_caption ) ) {
						$fbks_lightbox_caption = wpautop( wp_kses_post( $fbks_caption ) );
					}
				} elseif ( ! empty( $fbks_caption ) ) {
					$fbks_lightbox_caption = wpautop( wp_kses_post( $fbks_caption ) );
				}
			}
			?>
			<a
				href="#"
				class="pb-image-block-lightbox"
				data-src="<?php echo esc_url( $fbks_full_src ); ?>"
				<?php if ( ! empty( $fbks_lightbox_caption ) ) : ?>
					data-caption="<?php echo esc_attr( $fbks_lightbox_caption ); ?>"
				<?php endif; ?>
				<?php if ( fbks_fs()->can_use_premium_code__premium_only() ) : ?>
					<?php if ( $fbks_enable_woo && ! empty( $attributes['wooProductId'] ) ) : ?>
						data-product-id="<?php echo intval( $attributes['wooProductId'] ); ?>"
						data-product-name="<?php echo esc_attr( $attributes['wooProductName'] ?? '' ); ?>"
						data-product-price="<?php echo esc_attr( wp_strip_all_tags( $attributes['wooProductPrice'] ?? '' ) ); ?>"
					<?php endif; ?>
				<?php endif; ?>
			>
				<?php
				$fbks_img_attributes = [
					'class'    => 'pb-image-block-img wp-image-' . esc_attr( $fbks_id ),
					'loading'  => 'eager',
					'decoding' => 'async',
				];
				if ( fbks_fs()->can_use_premium_code__premium_only() ) {
    				$fbks_img_attributes['style'] = $fbks_img_styles;
				}
				if ( ! empty( $fbks_alt ) ) {
					$fbks_img_attributes['alt'] = $fbks_alt;
				}
				echo wp_get_attachment_image( $fbks_id, $fbks_image_size, false, $fbks_img_attributes );
				?>
			</a>
		<?php else : ?>
			<?php
			$fbks_img_attributes = [
				'src'	 => $fbks_src,
				'class'    => 'pb-image-block-img wp-image-' . esc_attr( $fbks_id ),
				'loading' => $fbks_loading_attr,
				'decoding' => 'async',
			];
			if ( fbks_fs()->can_use_premium_code__premium_only() ) {
    			$fbks_img_attributes['style'] = $fbks_img_styles;
			}
			if ( ! empty( $fbks_alt ) ) {
				$fbks_img_attributes['alt'] = $fbks_alt;
			}
			echo wp_get_attachment_image( $fbks_id, $fbks_image_size, false, $fbks_img_attributes );
			?>
		<?php endif; ?>

		<?php
			// Handle title/product overlay display (Pro only)
			if ( fbks_fs()->can_use_premium_code__premium_only() && $fbks_title_hover ) {

				// --- Premium WooCommerce hover info ---
				if ( $fbks_enable_woo && $fbks_woo_hover_info ) {
					// WooCommerce product info on hover
					$fbks_product_name  = $attributes['wooProductName'] ?? '';
					$fbks_product_price = $attributes['wooProductPrice'] ?? '';

					if ( ! empty( $fbks_product_name ) || ! empty( $fbks_product_price ) ) {
						echo '<div class="pb-image-block-title-container">';
						echo '<figcaption class="pb-image-block-title" style="' . esc_attr( $fbks_img_styles ) . '">';
					if ( ! empty( $fbks_product_name ) ) {
						echo '<span class="pb-product-name">' . esc_html( $fbks_product_name ) . '</span>';
					}
					if ( ! empty( $fbks_product_price ) ) {
						echo '<span class="pb-product-price">' . wp_kses_post( $fbks_product_price ) . '</span>';
					}
					echo '</figcaption></div>';
				} elseif ( ! empty( $fbks_title ) ) {
					// Fallback to image title if no product info
					echo '<div class="pb-image-block-title-container">';
					echo '<figcaption class="pb-image-block-title" style="' . esc_attr( $fbks_img_styles ) . '">';
					echo wp_kses_post( $fbks_title );
					echo '</figcaption></div>';
				}
				} elseif ( $fbks_enable_woo && ! $fbks_woo_hover_info ) {
					if ( ! empty( $fbks_title ) ) {	
						echo '<div class="pb-image-block-title-container">';
						echo '<figcaption class="pb-image-block-title" style="' . esc_attr( $fbks_img_styles ) . '">';
						echo wp_kses_post( $fbks_title );
						echo '</figcaption></div>';
					}
				} elseif ( ! empty( $fbks_title ) ) {
					echo '<div class="pb-image-block-title-container">';
					echo '<figcaption class="pb-image-block-title" style="' . esc_attr( $fbks_img_styles ) . '">';
					echo wp_kses_post( $fbks_title );
					echo '</figcaption></div>';
				}
			}
		?>
		<?php if ( fbks_fs()->can_use_premium_code__premium_only() ) : ?>
			<?php if ( $fbks_enable_woo && ! empty( $attributes['wooProductId'] ) ) : ?>
				<button
					type="button"
					class="pb-add-to-cart-icon <?php echo $fbks_woo_cart_display === 'hover' ? 'hover-only' : ''; ?>"
					data-add-to-cart="<?php echo esc_attr( intval( $attributes['wooProductId'] ) ); ?>"
					aria-label="<?php esc_attr_e( 'Add to Cart', 'folioblocks' ); ?>"
	    			style="top: calc(10px + max(<?php echo esc_attr( $fbks_border_width ); ?>px, <?php echo esc_attr( $fbks_border_radius ); ?>px * 0.15)); right: calc(10px + max(<?php echo esc_attr( $fbks_border_width ); ?>px, <?php echo esc_attr( $fbks_border_radius ); ?>px * 0.30));"
				>
					<img src="<?php echo esc_url( plugins_url( 'includes/icons/add-to-cart.png', dirname( __FILE__, 2 ) ) ); ?>" alt="<?php esc_attr_e( 'Add to Cart', 'folioblocks' ); ?>" width="24" height="24" />
				</button>
			<?php endif; ?>
		<?php endif; ?>
		<?php if ( fbks_fs()->can_use_premium_code__premium_only() ) : ?>
			<?php if ( ( ! $fbks_enable_woo ) && ( ! empty( $fbks_context['folioBlocks/enableDownload'] ) || ! empty( $attributes['enableDownload'] ) ) ) : ?>
	    		<button 
	    			class="pb-image-block-download <?php echo !empty($fbks_context['folioBlocks/downloadOnHover']) ? 'hover-only' : ''; ?>" 
	    			aria-label="<?php esc_attr_e( 'Download Image', 'folioblocks' ); ?>"
	    			style="top: calc(10px + max(<?php echo esc_attr( $fbks_border_width ); ?>px, <?php echo esc_attr( $fbks_border_radius ); ?>px * 0.15)); right: calc(10px + max(<?php echo esc_attr( $fbks_border_width ); ?>px, <?php echo esc_attr( $fbks_border_radius ); ?>px * 0.30));"
	    			data-full-src="<?php echo esc_url( $fbks_full_src ); ?>"
				>
					<img src="<?php echo esc_url( plugins_url( 'includes/icons/download.png', dirname( __FILE__, 2 ) ) ); ?>" alt="<?php esc_attr_e( 'Download Image', 'folioblocks' ); ?>" width="24" height="24" />
				</button>
			<?php endif; ?>
		<?php endif; ?>
	</figure>
</div>