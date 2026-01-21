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
	// Icon styles (context wins; fallback to image block attributes when used standalone)
	$fbks_download_icon_color = $fbks_context['folioBlocks/downloadIconColor'] ?? ( $attributes['downloadIconColor'] ?? '' );
	$fbks_download_icon_bg    = $fbks_context['folioBlocks/downloadIconBgColor'] ?? ( $attributes['downloadIconBgColor'] ?? '' );
	$fbks_cart_icon_color     = $fbks_context['folioBlocks/cartIconColor'] ?? ( $attributes['cartIconColor'] ?? '' );
	$fbks_cart_icon_bg        = $fbks_context['folioBlocks/cartIconBgColor'] ?? ( $attributes['cartIconBgColor'] ?? '' );

	$fbks_download_button_style = '';
	if ( $fbks_download_icon_color !== '' ) {
		$fbks_download_button_style .= '--pb-download-icon-color:' . $fbks_download_icon_color . ';';
	}
	if ( $fbks_download_icon_bg !== '' ) {
		$fbks_download_button_style .= '--pb-download-icon-bg:' . $fbks_download_icon_bg . ';';
	}

	$fbks_cart_button_style = '';
	if ( $fbks_cart_icon_color !== '' ) {
		$fbks_cart_button_style .= '--pb-cart-icon-color:' . $fbks_cart_icon_color . ';';
	}
	if ( $fbks_cart_icon_bg !== '' ) {
		$fbks_cart_button_style .= '--pb-cart-icon-bg:' . $fbks_cart_icon_bg . ';';
	}

	// Download icon display (boolean): context wins; fallback to block attribute.
	$fbks_download_on_hover = (bool) ( $fbks_context['folioBlocks/downloadOnHover'] ?? ( $attributes['downloadOnHover'] ?? true ) );

	$fbks_woo_active = is_plugin_active( 'woocommerce/woocommerce.php' );
	$fbks_enable_woo = ( $fbks_context['folioBlocks/enableWooCommerce'] ?? ( $attributes['enableWooCommerce'] ?? false ) ) && $fbks_woo_active;

	// Woo link action: image attribute can override; otherwise inherit gallery default via context.
	$fbks_woo_gallery_default = $fbks_context['folioBlocks/wooDefaultLinkAction'] ?? null;
	$fbks_woo_attr_action     = $attributes['wooLinkAction'] ?? 'inherit';
	$fbks_woo_link_action     = ( $fbks_woo_attr_action && $fbks_woo_attr_action !== 'inherit' )
		? $fbks_woo_attr_action
		: ( $fbks_woo_gallery_default ?: 'add_to_cart' );

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

$fbks_wrapper_attributes_args = [];

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
					data-woo-action="<?php echo esc_attr( $fbks_woo_link_action ); ?>"
					data-product-id="<?php echo esc_attr( intval( $attributes['wooProductId'] ) ); ?>"
					<?php if ( ! empty( $attributes['wooProductURL'] ) ) : ?>
						data-product-url="<?php echo esc_url( $attributes['wooProductURL'] ); ?>"
					<?php endif; ?>
					<?php if ( $fbks_cart_button_style !== '' ) : ?>
						style="<?php echo esc_attr( $fbks_cart_button_style ); ?>"
					<?php endif; ?>
					aria-label="<?php echo $fbks_woo_link_action === 'product' ? esc_attr__( 'View Product', 'folioblocks' ) : esc_attr__( 'Add to Cart', 'folioblocks' ); ?>"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
						<g transform="scale(0.75)">
							<circle cx="12.6667" cy="24.6667" r="2" fill="currentColor"></circle>
							<circle cx="23.3333" cy="24.6667" r="2" fill="currentColor"></circle>
							<path d="M9.28491 10.0356C9.47481 9.80216 9.75971 9.66667 10.0606 9.66667H25.3333C25.6232 9.66667 25.8989 9.79247 26.0888 10.0115C26.2787 10.2305 26.3643 10.5211 26.3233 10.8081L24.99 20.1414C24.9196 20.6341 24.4977 21 24 21H12C11.5261 21 11.1173 20.6674 11.0209 20.2034L9.08153 10.8701C9.02031 10.5755 9.09501 10.269 9.28491 10.0356ZM11.2898 11.6667L12.8136 19H23.1327L24.1803 11.6667H11.2898Z" fill="currentColor"></path>
							<path d="M5.66669 6.66667C5.66669 6.11438 6.1144 5.66667 6.66669 5.66667H9.33335C9.81664 5.66667 10.2308 6.01229 10.3172 6.48778L11.0445 10.4878C11.1433 11.0312 10.7829 11.5517 10.2395 11.6505C9.69614 11.7493 9.17555 11.3889 9.07676 10.8456L8.49878 7.66667H6.66669C6.1144 7.66667 5.66669 7.21895 5.66669 6.66667Z" fill="currentColor"></path>
						</g>
					</svg>
				</button>
			<?php endif; ?>
		<?php endif; ?>
		<?php if ( fbks_fs()->can_use_premium_code__premium_only() ) : ?>
			<?php if ( ( ! $fbks_enable_woo ) && ( ! empty( $fbks_context['folioBlocks/enableDownload'] ) || ! empty( $attributes['enableDownload'] ) ) ) : ?>
	    		<button 
	    			class="pb-image-block-download <?php echo $fbks_download_on_hover ? 'hover-only' : ''; ?>" 
	    			<?php if ( $fbks_download_button_style !== '' ) : ?>
	    				style="<?php echo esc_attr( $fbks_download_button_style ); ?>"
	    			<?php endif; ?>
	    			aria-label="<?php esc_attr_e( 'Download Image', 'folioblocks' ); ?>"
	    			data-full-src="<?php echo esc_url( $fbks_full_src ); ?>"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
						<path d="M18 11.3l-1-1.1-4 4V3h-1.5v11.3L7 10.2l-1 1.1 6.2 5.8 5.8-5.8zm.5 3.7v3.5h-13V15H4v5h16v-5h-1.5z" fill="currentColor"></path>
					</svg>
				</button>
			<?php endif; ?>
		<?php endif; ?>
	</figure>
</div>