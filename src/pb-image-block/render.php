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

$fbks_lightbox         = $fbks_context['folioBlocks/lightbox'] ?? ( ! empty( $attributes['lightbox'] ) || ! empty( $attributes['enableLightbox'] ) );
$fbks_caption_lightbox = $fbks_context['folioBlocks/lightboxCaption'] ?? ( ! empty( $attributes['lightboxCaption'] ) || ! empty( $attributes['showCaptionInLightbox'] ) );
$fbks_title_hover = $fbks_context['folioBlocks/onHoverTitle'] ?? ( isset( $attributes['showTitleOnHover'] ) ? (bool) $attributes['showTitleOnHover'] : false );

if ( fbks_fs()->can_use_premium_code__premium_only() ) {
	$fbks_woo_active = is_plugin_active( 'woocommerce/woocommerce.php' );
	$fbks_enable_woo = ( $fbks_context['folioBlocks/enableWooCommerce'] ?? ( $attributes['enableWooCommerce'] ?? false ) ) && $fbks_woo_active;
	$fbks_woo_cart_display = $fbks_context['folioBlocks/wooCartIconDisplay'] ?? ( $attributes['wooCartIconDisplay'] ?? 'hover' );
	$fbks_woo_hover_info = $fbks_context['folioBlocks/wooProductPriceOnHover'] ?? ( $attributes['wooProductPriceOnHover'] ?? false );
	$fbks_woo_lightbox_info = $fbks_context['folioBlocks/wooLightboxInfoType'] ?? ( $attributes['wooLightboxInfoType'] ?? 'caption' );

	// Resolve effective hover style (context wins, then attribute, then default) — Premium only
	$fbks_on_hover_style = $fbks_context['folioBlocks/onHoverStyle'] ?? ( $attributes['onHoverStyle'] ?? 'blur-overlay' );
	$fbks_hover_class_map = [
		'blur-overlay'   => 'pb-hover-blur-overlay',
		'fade-overlay'    => 'pb-hover-fade-overlay',
		'gradient-bottom' => 'pb-hover-gradient-bottom',
		'chip'            => 'pb-hover-chip',
	];
	$fbks_hover_variant_class = $fbks_hover_class_map[ $fbks_on_hover_style ] ?? 'pb-hover-fade-overlay';

	$fbks_lazy_from_context = isset( $fbks_context['folioBlocks/lazyLoad'] ) ? (bool) $fbks_context['folioBlocks/lazyLoad'] : null;
    $fbks_lazy_from_attr    = isset( $attributes['lazyLoad'] ) ? (bool) $attributes['lazyLoad'] : null;
    $fbks_effective_lazy    = ( null !== $fbks_lazy_from_context ) ? $fbks_lazy_from_context : ( $fbks_lazy_from_attr ?? false );
    $fbks_loading_attr      = $fbks_effective_lazy ? 'lazy' : 'eager';

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

// Disable right-click (Pro): parent context wins; fallback to block attribute
$fbks_disable_right_click = false;
if ( fbks_fs()->can_use_premium_code__premium_only() ) {
	$fbks_disable_right_click = (bool) (
		$fbks_context['folioBlocks/disableRightClick'] ??
		( $attributes['disableRightClick'] ?? false )
	);
}

$fbks_wrapper_attributes_args = [
	'class' => 'pb-image-block-wrapper',
];
if ( ! empty( $fbks_disable_right_click ) ) {
	$fbks_wrapper_attributes_args['data-disable-right-click'] = 'true';
}
$fbks_wrapper_attributes = get_block_wrapper_attributes( $fbks_wrapper_attributes_args );

?>

<div 
	<?php echo wp_kses_post( $fbks_wrapper_attributes ); ?> 
	<?php if ( fbks_fs()->can_use_premium_code__premium_only() ) : if ( $fbks_filter_category !== '' ) : ?>
		data-filter="<?php echo esc_attr( $fbks_filter_category ); ?>"
	<?php endif; endif; ?>
>
	<figure
		class="pb-image-block
      <?php if ( fbks_fs()->can_use_premium_code__premium_only() && $fbks_title_hover ) { echo ' title-hover ' . esc_attr( $fbks_hover_variant_class ); } ?>
      <?php if ( fbks_fs()->can_use_premium_code__premium_only() ) { echo ( ! empty( $fbks_dropshadow ) ) ? ' dropshadow' : ''; } ?>"
		<?php if ( fbks_fs()->can_use_premium_code__premium_only() && ! empty( $fbks_img_styles ) ) : ?>
			style="<?php echo esc_attr( $fbks_img_styles ); ?>"
		<?php endif; ?>
		<?php if ( fbks_fs()->can_use_premium_code__premium_only() ) { if ( ! empty( $attributes['enableDownload'] ) ) : ?>
			data-enable-download="true"
		<?php endif; } ?>
	>
		<?php if ( $fbks_lightbox ) : ?>
			<?php
			// Build dynamic lightbox caption (only when explicitly enabled)
			if ( fbks_fs()->can_use_premium_code__premium_only() ) {
				$fbks_lightbox_caption = '';
				if ( $fbks_caption_lightbox ) {
					if ( $fbks_enable_woo && $fbks_woo_lightbox_info === 'product' ) {
						$fbks_product_name  = $attributes['wooProductName'] ?? '';
						$fbks_product_price = $attributes['wooProductPrice'] ?? '';

						if ( ! empty( $fbks_product_name ) || ! empty( $fbks_product_price ) ) {
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
			>
				<?php
				$fbks_img_attributes = [
					'class'    => 'pb-image-block-img wp-image-' . esc_attr( $fbks_id ),
					'loading'  => $fbks_loading_attr,
					'decoding' => 'async',
				];
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
						echo '<figcaption class="pb-image-block-title">';
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
					echo '<figcaption class="pb-image-block-title">';
					echo wp_kses_post( $fbks_title );
					echo '</figcaption></div>';
				}
				} elseif ( $fbks_enable_woo && ! $fbks_woo_hover_info ) {
					if ( ! empty( $fbks_title ) ) {	
						echo '<div class="pb-image-block-title-container">';
						echo '<figcaption class="pb-image-block-title">';
						echo wp_kses_post( $fbks_title );
						echo '</figcaption></div>';
					}
				} elseif ( ! empty( $fbks_title ) ) {
					echo '<div class="pb-image-block-title-container">';
					echo '<figcaption class="pb-image-block-title">';
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
	    			data-full-src="<?php echo esc_url( $fbks_full_src ); ?>"
				>
					<img src="<?php echo esc_url( plugins_url( 'includes/icons/download.png', dirname( __FILE__, 2 ) ) ); ?>" alt="<?php esc_attr_e( 'Download Image', 'folioblocks' ); ?>" width="24" height="24" />
				</button>
			<?php endif; ?>
		<?php endif; ?>
	</figure>
</div>