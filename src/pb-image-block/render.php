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

$src     = esc_url( $attributes['src'] );
$full_src = !empty( $attributes['sizes']['full']['url'] ) ? esc_url( $attributes['sizes']['full']['url'] ) : $src;

$alt     = isset( $attributes['alt'] ) ? esc_attr( $attributes['alt'] ) : '';
$title   = isset( $attributes['title'] ) ? esc_attr( $attributes['title'] ) : '';
$caption = isset( $attributes['caption'] ) ? $attributes['caption'] : '';
$imageSize = isset( $attributes['imageSize'] ) ? $attributes['imageSize'] : 'large';
$id      = isset( $attributes['id'] ) ? (int) $attributes['id'] : 0;
$loading_attr = 'eager';

$context = $block->context ?? [];

$lightbox         = $context['portfolioBlocks/lightbox'] ?? ! empty( $attributes['enableLightbox'] );
$caption_lightbox = $context['portfolioBlocks/lightboxCaption'] ?? ! empty( $attributes['showCaptionInLightbox'] );
$title_hover = $context['portfolioBlocks/onHoverTitle'] ?? ( isset( $attributes['showTitleOnHover'] ) ? (bool) $attributes['showTitleOnHover'] : false );

if ( pb_fs()->can_use_premium_code__premium_only() ) {
	$woo_active = is_plugin_active( 'woocommerce/woocommerce.php' );
	$enable_woo = ( $context['portfolioBlocks/enableWooCommerce'] ?? false ) && $woo_active;
	$woo_cart_display = $context['portfolioBlocks/wooCartIconDisplay'] ?? 'always';
	$woo_hover_info = $context['portfolioBlocks/wooProductPriceOnHover'] ?? false;
	$woo_lightbox_info = $context['portfolioBlocks/wooLightboxInfoType'] ?? 'caption';

	$lazy_load = $block->context['portfolioBlocks/lazyLoad'] ?? false;
	$loading_attr = $lazy_load ? 'lazy' : 'eager';
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
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => 'pb-image-block-wrapper',
] );

?>

<div 
	<?php echo wp_kses_post( $wrapper_attributes ); ?> 
	<?php if ( pb_fs()->can_use_premium_code__premium_only() ) : if ( $filter_category !== '' ) : ?>
		data-filter="<?php echo esc_attr( $filter_category ); ?>"
	<?php endif; endif; ?>
>
	<figure
		class="pb-image-block <?php echo esc_attr( $title_hover ? 'title-hover' : '' ); ?> 
		<?php if ( pb_fs()->can_use_premium_code__premium_only() ) { if ( $dropshadow ) { echo esc_attr( 'dropshadow' ); } } ?>"
		<?php if ( pb_fs()->can_use_premium_code__premium_only() ) { if ( ! empty( $attributes['enableDownload'] ) ) : ?>
			data-enable-download="true"
		<?php endif; } ?>
	>
		<?php if ( $lightbox ) : ?>
			<?php
			// Build dynamic lightbox caption
			$lightbox_caption = '';
			if ( $caption_lightbox ) {
				if ( pb_fs()->can_use_premium_code__premium_only() ) {
					if ( $enable_woo && $woo_lightbox_info === 'product' ) {
						$product_name  = $attributes['wooProductName'] ?? '';
						$product_price = $attributes['wooProductPrice'] ?? '';

						if ( ! empty( $product_name ) || ! empty( $product_price ) ) {
							// Proper HTML for WooCommerce product info
							$lightbox_caption  = '<div class="pb-lightbox-product-info">';
							if ( ! empty( $product_name ) ) {
								$lightbox_caption .= '<h4 class="pb-product-name">' . esc_html( $product_name ) . '</h4>';
							}
							if ( ! empty( $product_price ) ) {
								$lightbox_caption .= '<p class="pb-product-price">' . wp_kses_post( $product_price ) . '</p>';
							}
							$lightbox_caption .= '</div>';
						} elseif ( ! empty( $caption ) ) {
							// Fallback to regular image caption
							$lightbox_caption = wpautop( wp_kses_post( $caption ) );
						}
					} elseif ( ! empty( $caption ) ) {
						$lightbox_caption = wpautop( wp_kses_post( $caption ) );
					}
				} elseif ( ! empty( $caption ) ) {
					$lightbox_caption = wpautop( wp_kses_post( $caption ) );
				}

				if ( ! isset( $lightbox_caption ) && ! empty( $caption ) ) {
        			$lightbox_caption = wpautop( wp_kses_post( $caption ) );
    			}
			}
			?>
			<a
				href="#"
				class="pb-image-block-lightbox"
				data-src="<?php echo esc_url( $full_src ); ?>"
				<?php if ( ! empty( $lightbox_caption ) ) : ?>
					data-caption="<?php echo esc_attr( $lightbox_caption ); ?>"
				<?php endif; ?>
				<?php if ( pb_fs()->can_use_premium_code__premium_only() ) : ?>
					<?php if ( $enable_woo && ! empty( $attributes['wooProductId'] ) ) : ?>
						data-product-id="<?php echo intval( $attributes['wooProductId'] ); ?>"
						data-product-name="<?php echo esc_attr( $attributes['wooProductName'] ?? '' ); ?>"
						data-product-price="<?php echo esc_attr( wp_strip_all_tags( $attributes['wooProductPrice'] ?? '' ) ); ?>"
					<?php endif; ?>
				<?php endif; ?>
			>
				<?php
				$img_attributes = [
					'class'    => 'pb-image-block-img wp-image-' . esc_attr( $id ),
					'loading'  => 'eager',
					'decoding' => 'async',
				];
				if ( pb_fs()->can_use_premium_code__premium_only() ) {
    				$img_attributes['style'] = $img_styles;
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
				'loading' => $loading_attr,
				'decoding' => 'async',
			];
			if ( pb_fs()->can_use_premium_code__premium_only() ) {
    			$img_attributes['style'] = $img_styles;
			}
			if ( ! empty( $alt ) ) {
				$img_attributes['alt'] = $alt;
			}
			echo wp_get_attachment_image( $id, $imageSize, false, $img_attributes );
			?>
		<?php endif; ?>

		<?php
			// Handle title/product overlay display
			if ( $title_hover ) {

			// --- Premium WooCommerce hover info ---
			if ( pb_fs()->can_use_premium_code__premium_only() ) {
				if ( $enable_woo && $woo_hover_info ) {
						// WooCommerce product info on hover
						$product_name  = $attributes['wooProductName'] ?? '';
						$product_price = $attributes['wooProductPrice'] ?? '';

						if ( ! empty( $product_name ) || ! empty( $product_price ) ) {
							echo '<div class="pb-image-block-title-container">';
							echo '<figcaption class="pb-image-block-title" style="' . esc_attr( $img_styles ) . '">';
						if ( ! empty( $product_name ) ) {
							echo '<span class="pb-product-name">' . esc_html( $product_name ) . '</span>';
						}
						if ( ! empty( $product_price ) ) {
							echo '<span class="pb-product-price">' . wp_kses_post( $product_price ) . '</span>';
						}
						echo '</figcaption></div>';
					} elseif ( ! empty( $title ) ) {
						// Fallback to image title if no product info
						echo '<div class="pb-image-block-title-container">';
						echo '<figcaption class="pb-image-block-title" style="' . esc_attr( $img_styles ) . '">';
						echo wp_kses_post( $title );
						echo '</figcaption></div>';
					}
					} elseif ( $enable_woo && ! $woo_hover_info ) {
						if ( ! empty( $title ) ) {
							echo '<div class="pb-image-block-title-container">';
							echo '<figcaption class="pb-image-block-title" style="' . esc_attr( $img_styles ) . '">';
							echo wp_kses_post( $title );
							echo '</figcaption></div>';
						}
					} elseif ( ! empty( $title ) ) {
						echo '<div class="pb-image-block-title-container">';
						echo '<figcaption class="pb-image-block-title" style="' . esc_attr( $img_styles ) . '">';
						echo wp_kses_post( $title );
						echo '</figcaption></div>';
					}
				}
				// --- Always render title hover in free version ---
				if ( ! pb_fs()->can_use_premium_code__premium_only() && ! empty( $title ) ) {
					echo '<div class="pb-image-block-title-container">';
					echo '<figcaption class="pb-image-block-title">';
					echo wp_kses_post( $title );
					echo '</figcaption></div>';
				}
			}
		?>
		<?php if ( pb_fs()->can_use_premium_code__premium_only() ) : ?>
			<?php if ( $enable_woo && ! empty( $attributes['wooProductId'] ) ) : ?>
				<button
					type="button"
					class="pb-add-to-cart-icon <?php echo $woo_cart_display === 'hover' ? 'hover-only' : ''; ?>"
					data-add-to-cart="<?php echo esc_attr( intval( $attributes['wooProductId'] ) ); ?>"
					aria-label="<?php esc_attr_e( 'Add to Cart', 'pb-gallery' ); ?>"
	    			style="top: calc(10px + max(<?php echo esc_attr( $border_width ); ?>px, <?php echo esc_attr( $border_radius ); ?>px * 0.15)); right: calc(10px + max(<?php echo esc_attr( $border_width ); ?>px, <?php echo esc_attr( $border_radius ); ?>px * 0.30));"
				>
					<img src="<?php echo esc_url( plugins_url( 'includes/icons/add-to-cart.png', dirname( __FILE__, 2 ) ) ); ?>" alt="<?php esc_attr_e( 'Add to Cart', 'pb-gallery' ); ?>" width="24" height="24" />
				</button>
			<?php endif; ?>
		<?php endif; ?>
		<?php if ( pb_fs()->can_use_premium_code__premium_only() ) : ?>
			<?php if ( ( ! $enable_woo ) && ( ! empty( $context['portfolioBlocks/enableDownload'] ) || ! empty( $attributes['enableDownload'] ) ) ) : ?>
	    		<button 
	    			class="pb-image-block-download <?php echo !empty($context['portfolioBlocks/downloadOnHover']) ? 'hover-only' : ''; ?>" 
	    			aria-label="<?php esc_attr_e( 'Download Image', 'pb-gallery' ); ?>"
	    			style="top: calc(10px + max(<?php echo esc_attr( $border_width ); ?>px, <?php echo esc_attr( $border_radius ); ?>px * 0.15)); right: calc(10px + max(<?php echo esc_attr( $border_width ); ?>px, <?php echo esc_attr( $border_radius ); ?>px * 0.30));"
	    			data-full-src="<?php echo esc_url( $full_src ); ?>"
				>
					<img src="<?php echo esc_url( plugins_url( 'includes/icons/download.png', dirname( __FILE__, 2 ) ) ); ?>" alt="<?php esc_attr_e( 'Download Image', 'pb-gallery' ); ?>" width="24" height="24" />
				</button>
			<?php endif; ?>
		<?php endif; ?>
	</figure>
</div>