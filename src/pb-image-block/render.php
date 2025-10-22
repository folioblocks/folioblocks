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

// Runtime check — ensure WooCommerce output only if plugin is active
if ( ! function_exists( 'is_plugin_active' ) ) {
    include_once ABSPATH . 'wp-admin/includes/plugin.php';
}
$woo_active = is_plugin_active( 'woocommerce/woocommerce.php' );
$enable_woo = ( $context['portfolioBlocks/enableWooCommerce'] ?? false ) && $woo_active;
$woo_cart_display = $context['portfolioBlocks/wooCartIconDisplay'] ?? 'always';
$woo_hover_info = $context['portfolioBlocks/wooProductPriceOnHover'] ?? false;
$woo_lightbox_info = $context['portfolioBlocks/wooLightboxInfoType'] ?? 'caption';

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
			<?php
			// Build dynamic lightbox caption
			$lightbox_caption = '';
			if ( $caption_lightbox ) {
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
			}
			?>
			<a
				href="#"
				class="pb-image-block-lightbox"
				data-src="<?php echo esc_url( $full_src ); ?>"
				<?php if ( ! empty( $lightbox_caption ) ) : ?>
					data-caption="<?php echo esc_attr( $lightbox_caption ); ?>"
				<?php endif; ?>
				<?php if ( $enable_woo && ! empty( $attributes['wooProductId'] ) ) : ?>
					data-product-id="<?php echo intval( $attributes['wooProductId'] ); ?>"
					data-product-name="<?php echo esc_attr( $attributes['wooProductName'] ?? '' ); ?>"
					data-product-price="<?php echo esc_attr( wp_strip_all_tags( $attributes['wooProductPrice'] ?? '' ) ); ?>"
				<?php endif; ?>
			>
				<?php
				$img_attributes = [
					'class'    => 'pb-image-block-img wp-image-' . esc_attr( $id ),
					'loading'  => 'eager',
					'decoding' => 'async',
					'style'    => $img_styles,
				];
				// Determine appropriate title attribute for image
				$img_title_attr = '';
				if ( $enable_woo ) {
					$linked_product = ! empty( $attributes['wooProductId'] );
					if ( $linked_product && ! empty( $attributes['wooProductName'] ) ) {
						$img_title_attr = $attributes['wooProductName'];
					} elseif ( ! $linked_product && ! empty( $title ) ) {
						$img_title_attr = $title;
					}
				} elseif ( ! empty( $title ) ) {
					$img_title_attr = $title;
				}
				if ( ! empty( $img_title_attr ) ) {
					$img_attributes['title'] = esc_attr( $img_title_attr );
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
			// Determine appropriate title attribute for image
			$img_title_attr = '';
			if ( $enable_woo ) {
				$linked_product = ! empty( $attributes['wooProductId'] );
				if ( $linked_product && ! empty( $attributes['wooProductName'] ) ) {
					$img_title_attr = $attributes['wooProductName'];
				} elseif ( ! $linked_product && ! empty( $title ) ) {
					$img_title_attr = $title;
				}
			} elseif ( ! empty( $title ) ) {
				$img_title_attr = $title;
			}
			if ( ! empty( $img_title_attr ) ) {
				$img_attributes['title'] = esc_attr( $img_title_attr );
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
			if ( $enable_woo && $woo_hover_info ) {
				// WooCommerce product info on hover
				$product_name = $attributes['wooProductName'] ?? '';
				$product_price = $attributes['wooProductPrice'] ?? '';

				if ( ! empty( $product_name ) || ! empty( $product_price ) ) {
					// Display product name and price stacked
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
				// WooCommerce active but product price on hover disabled → show image title
				if ( ! empty( $title ) ) {
					echo '<div class="pb-image-block-title-container">';
					echo '<figcaption class="pb-image-block-title" style="' . esc_attr( $img_styles ) . '">';
					echo wp_kses_post( $title );
					echo '</figcaption></div>';
				}
			} else {
				// Non-WooCommerce → show title if present
				if ( ! empty( $title ) ) {
					echo '<div class="pb-image-block-title-container">';
					echo '<figcaption class="pb-image-block-title" style="' . esc_attr( $img_styles ) . '">';
					echo wp_kses_post( $title );
					echo '</figcaption></div>';
				}
			}
		}
		?>
		<?php if ( $enable_woo && ! empty( $attributes['wooProductId'] ) ) : ?>
			<button
				type="button"
				class="pb-add-to-cart-icon <?php echo $woo_cart_display === 'hover' ? 'hover-only' : ''; ?>"
				data-add-to-cart="<?php echo esc_attr( intval( $attributes['wooProductId'] ) ); ?>"
				aria-label="<?php esc_attr_e( 'Add to Cart', 'portfolio-blocks' ); ?>"
				style="top: calc(8px + <?php echo esc_attr( $border_width ); ?>px); right: calc(8px + <?php echo esc_attr( $border_width ); ?>px);"
			>
				<img src="<?php echo esc_url( plugins_url( 'includes/icons/add-to-cart.png', dirname( __FILE__, 2 ) ) ); ?>" alt="<?php esc_attr_e( 'Add to Cart', 'portfolio-blocks' ); ?>" width="24" height="24" />
			</button>
		<?php endif; ?>
		<?php if ( ( ! $enable_woo ) && ( ! empty( $context['portfolioBlocks/enableDownload'] ) || ! empty( $attributes['enableDownload'] ) ) ) : ?>
    		<button 
    			class="pb-image-block-download <?php echo !empty($context['portfolioBlocks/downloadOnHover']) ? 'hover-only' : ''; ?>" 
    			aria-label="<?php esc_attr_e( 'Download Image', 'portfolio-blocks' ); ?>"
    			style="top: calc(8px + <?php echo esc_attr( $border_width ); ?>px); right: calc(8px + <?php echo esc_attr( $border_width ); ?>px);"
    			data-full-src="<?php echo esc_url( $full_src ); ?>"
			>
				<img src="<?php echo esc_url( plugins_url( 'includes/icons/download.png', dirname( __FILE__, 2 ) ) ); ?>" alt="<?php esc_attr_e( 'Download Image', 'portfolio-blocks' ); ?>" width="24" height="24" />
			</button>
		<?php endif; ?>
	</figure>
</div>