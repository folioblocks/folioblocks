<?php
/**
 * Filmstrip Gallery Block
 * Render PHP
 **/

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$fbks_resolution = isset( $attributes['resolution'] ) && is_string( $attributes['resolution'] )
	? $attributes['resolution']
	: 'large';
$fbks_position = isset( $attributes['filmstripPosition'] ) && in_array( $attributes['filmstripPosition'], [ 'bottom', 'left', 'right' ], true )
	? $attributes['filmstripPosition']
	: 'bottom';
$fbks_color_mode = isset( $attributes['colorMode'] ) && in_array( $attributes['colorMode'], [ 'light', 'dark' ], true )
	? $attributes['colorMode']
	: 'light';

$fbks_autoplay = false;
$fbks_autoplay_speed = 3.0;
$fbks_pause_on_hover = false;
$fbks_enable_fullscreen = false;
$fbks_enable_woo = false;
$fbks_enable_download = false;
$fbks_download_on_hover = true;
$fbks_woo_cart_icon_display = 'hover';
$fbks_woo_default_link_action = 'add_to_cart';
$fbks_woo_hover_info = false;
$fbks_on_hover_title = false;
$fbks_lazy_load = false;
$fbks_disable_right_click = false;
$fbks_download_icon_style = '';
$fbks_cart_icon_style = '';

if ( fbks_fs()->can_use_premium_code__premium_only() ) {
	$fbks_autoplay = ! empty( $attributes['autoplay'] );
	$fbks_autoplay_speed = isset( $attributes['autoplaySpeed'] ) ? (float) $attributes['autoplaySpeed'] : 3.0;
	if ( $fbks_autoplay_speed <= 0 ) {
		$fbks_autoplay_speed = 3.0;
	}

	$fbks_pause_on_hover = ! empty( $attributes['pauseOnHover'] );
	$fbks_enable_fullscreen = ! empty( $attributes['enableFullscreen'] );

	if ( ! function_exists( 'is_plugin_active' ) ) {
		include_once ABSPATH . 'wp-admin/includes/plugin.php';
	}
	$fbks_woo_active = is_plugin_active( 'woocommerce/woocommerce.php' );
	$fbks_enable_woo = $fbks_woo_active && ! empty( $attributes['enableWooCommerce'] );

	$fbks_enable_download = ! empty( $attributes['enableDownload'] ) && ! $fbks_enable_woo;
	$fbks_download_on_hover = isset( $attributes['downloadOnHover'] ) ? (bool) $attributes['downloadOnHover'] : true;

	$fbks_woo_cart_icon_display = isset( $attributes['wooCartIconDisplay'] ) && in_array( $attributes['wooCartIconDisplay'], [ 'hover', 'always' ], true )
		? $attributes['wooCartIconDisplay']
		: 'hover';
	$fbks_woo_default_link_action = isset( $attributes['wooDefaultLinkAction'] ) && in_array( $attributes['wooDefaultLinkAction'], [ 'add_to_cart', 'product' ], true )
		? $attributes['wooDefaultLinkAction']
		: 'add_to_cart';

	$fbks_woo_hover_info = ! empty( $attributes['wooProductPriceOnHover'] );
	$fbks_on_hover_title = ! empty( $attributes['onHoverTitle'] );
	$fbks_lazy_load = ! empty( $attributes['lazyLoad'] );
	$fbks_disable_right_click = ! empty( $attributes['disableRightClick'] );

	if ( ! empty( $attributes['downloadIconColor'] ) ) {
		$fbks_download_icon_style .= '--pb-download-icon-color:' . $attributes['downloadIconColor'] . ';';
	}
	if ( ! empty( $attributes['downloadIconBgColor'] ) ) {
		$fbks_download_icon_style .= '--pb-download-icon-bg:' . $attributes['downloadIconBgColor'] . ';';
	}

	if ( ! empty( $attributes['cartIconColor'] ) ) {
		$fbks_cart_icon_style .= '--pb-cart-icon-color:' . $attributes['cartIconColor'] . ';';
	}
	if ( ! empty( $attributes['cartIconBgColor'] ) ) {
		$fbks_cart_icon_style .= '--pb-cart-icon-bg:' . $attributes['cartIconBgColor'] . ';';
	}
}

$fbks_get_size_src = static function ( $fbks_image_attrs, $fbks_size_slug ) {
	if (
		isset( $fbks_image_attrs['sizes'] ) &&
		is_array( $fbks_image_attrs['sizes'] ) &&
		isset( $fbks_image_attrs['sizes'][ $fbks_size_slug ]['url'] ) &&
		is_string( $fbks_image_attrs['sizes'][ $fbks_size_slug ]['url'] ) &&
		'' !== $fbks_image_attrs['sizes'][ $fbks_size_slug ]['url']
	) {
		return $fbks_image_attrs['sizes'][ $fbks_size_slug ]['url'];
	}

	return '';
};

$fbks_get_srcset = static function ( $fbks_image_id, $fbks_size_slug ) {
	if ( $fbks_image_id <= 0 ) {
		return '';
	}

	$fbks_srcset = wp_get_attachment_image_srcset( $fbks_image_id, $fbks_size_slug );
	return is_string( $fbks_srcset ) ? $fbks_srcset : '';
};

$fbks_get_sizes_attr = static function ( $fbks_image_id, $fbks_size_slug ) {
	if ( $fbks_image_id <= 0 ) {
		return '';
	}

	$fbks_sizes_attr = wp_get_attachment_image_sizes( $fbks_image_id, $fbks_size_slug );
	return is_string( $fbks_sizes_attr ) ? $fbks_sizes_attr : '';
};

$fbks_images = [];
$fbks_inner_blocks = $block->parsed_block['innerBlocks'] ?? [];

if ( is_array( $fbks_inner_blocks ) && ! empty( $fbks_inner_blocks ) ) {
	foreach ( $fbks_inner_blocks as $fbks_inner_block ) {
		if ( 'folioblocks/pb-image-block' !== ( $fbks_inner_block['blockName'] ?? '' ) ) {
			continue;
		}

		$fbks_image_attrs = $fbks_inner_block['attrs'] ?? [];
		if ( ! is_array( $fbks_image_attrs ) ) {
			$fbks_image_attrs = [];
		}

		$fbks_image_id = isset( $fbks_image_attrs['id'] ) ? (int) $fbks_image_attrs['id'] : 0;
		$fbks_base_src = isset( $fbks_image_attrs['src'] ) && is_string( $fbks_image_attrs['src'] )
			? $fbks_image_attrs['src']
			: '';

		if ( '' === $fbks_base_src && $fbks_image_id > 0 ) {
			$fbks_base_src = wp_get_attachment_url( $fbks_image_id ) ?: '';
		}

		$fbks_main_src = $fbks_get_size_src( $fbks_image_attrs, $fbks_resolution );
		if ( '' === $fbks_main_src && $fbks_image_id > 0 ) {
			$fbks_main_src = wp_get_attachment_image_url( $fbks_image_id, $fbks_resolution ) ?: '';
		}
		if ( '' === $fbks_main_src ) {
			$fbks_main_src = $fbks_base_src;
		}

		$fbks_thumb_src = $fbks_get_size_src( $fbks_image_attrs, 'thumbnail' );
		if ( '' === $fbks_thumb_src ) {
			$fbks_thumb_src = $fbks_main_src;
		}

		$fbks_full_src = $fbks_get_size_src( $fbks_image_attrs, 'full' );
		if ( '' === $fbks_full_src ) {
			$fbks_full_src = $fbks_base_src;
		}
		if ( '' === $fbks_full_src && $fbks_image_id > 0 ) {
			$fbks_full_src = wp_get_attachment_url( $fbks_image_id ) ?: '';
		}

		$fbks_alt = isset( $fbks_image_attrs['alt'] ) ? (string) $fbks_image_attrs['alt'] : '';
		$fbks_title = isset( $fbks_image_attrs['title'] ) ? (string) $fbks_image_attrs['title'] : '';

		$fbks_woo_product_id = 0;
		$fbks_woo_product_name = '';
		$fbks_woo_product_price = '';
		$fbks_woo_product_url = '';
		$fbks_woo_link_action = $fbks_woo_default_link_action;

		if ( fbks_fs()->can_use_premium_code__premium_only() ) {
			$fbks_woo_product_id = isset( $fbks_image_attrs['wooProductId'] ) ? (int) $fbks_image_attrs['wooProductId'] : 0;
			$fbks_woo_product_name = isset( $fbks_image_attrs['wooProductName'] ) ? (string) $fbks_image_attrs['wooProductName'] : '';
			$fbks_woo_product_price = isset( $fbks_image_attrs['wooProductPrice'] ) ? wp_kses_post( (string) $fbks_image_attrs['wooProductPrice'] ) : '';
			$fbks_woo_product_url = isset( $fbks_image_attrs['wooProductURL'] ) ? (string) $fbks_image_attrs['wooProductURL'] : '';
			$fbks_woo_link_attr = isset( $fbks_image_attrs['wooLinkAction'] ) ? (string) $fbks_image_attrs['wooLinkAction'] : 'inherit';
			$fbks_woo_link_action = in_array( $fbks_woo_link_attr, [ 'product', 'add_to_cart' ], true )
				? $fbks_woo_link_attr
				: $fbks_woo_default_link_action;
		}

		if ( '' === $fbks_main_src ) {
			continue;
		}

		$fbks_main_srcset = $fbks_get_srcset( $fbks_image_id, $fbks_resolution );
		$fbks_main_sizes_attr = $fbks_get_sizes_attr( $fbks_image_id, $fbks_resolution );
		$fbks_thumb_srcset = $fbks_get_srcset( $fbks_image_id, 'thumbnail' );
		$fbks_thumb_sizes_attr = $fbks_get_sizes_attr( $fbks_image_id, 'thumbnail' );
		$fbks_image_class = $fbks_image_id > 0 ? 'wp-image-' . $fbks_image_id : '';

		$fbks_images[] = [
			'id'              => $fbks_image_id,
			'src'             => esc_url( $fbks_main_src ),
			'srcSet'          => $fbks_main_srcset,
			'sizes'           => $fbks_main_sizes_attr,
			'thumbSrc'        => esc_url( $fbks_thumb_src ),
			'thumbSrcSet'     => $fbks_thumb_srcset,
			'thumbSizes'      => $fbks_thumb_sizes_attr,
			'imgClass'        => $fbks_image_class,
			'fullSrc'         => esc_url( $fbks_full_src ),
			'alt'             => $fbks_alt,
			'title'           => $fbks_title,
			'wooProductId'    => $fbks_woo_product_id,
			'wooProductName'  => $fbks_woo_product_name,
			'wooProductPrice' => $fbks_woo_product_price,
			'wooProductUrl'   => esc_url( $fbks_woo_product_url ),
			'wooLinkAction'   => $fbks_woo_link_action,
		];
	}
}

// Fallback for legacy content that only has gallery-level image snapshots.
if ( empty( $fbks_images ) && ! empty( $attributes['images'] ) && is_array( $attributes['images'] ) ) {
	foreach ( $attributes['images'] as $fbks_image ) {
		if ( ! is_array( $fbks_image ) ) {
			continue;
		}
		$fbks_src = isset( $fbks_image['src'] ) ? (string) $fbks_image['src'] : '';
		if ( '' === $fbks_src ) {
			continue;
		}
		$fbks_images[] = [
			'id'              => isset( $fbks_image['id'] ) ? (int) $fbks_image['id'] : 0,
			'src'             => esc_url( $fbks_src ),
			'srcSet'          => '',
			'sizes'           => '',
			'thumbSrc'        => esc_url( $fbks_src ),
			'thumbSrcSet'     => '',
			'thumbSizes'      => '',
			'imgClass'        => '',
			'fullSrc'         => esc_url( $fbks_src ),
			'alt'             => isset( $fbks_image['alt'] ) ? (string) $fbks_image['alt'] : '',
			'title'           => isset( $fbks_image['title'] ) ? (string) $fbks_image['title'] : '',
			'wooProductId'    => 0,
			'wooProductName'  => '',
			'wooProductPrice' => '',
			'wooProductUrl'   => '',
			'wooLinkAction'   => $fbks_woo_default_link_action,
		];
	}
}

$fbks_active_image = ! empty( $fbks_images ) ? $fbks_images[0] : null;
$fbks_has_multiple_images = count( $fbks_images ) > 1;

$fbks_overlay_html = '';
if ( fbks_fs()->can_use_premium_code__premium_only() ) {
	if ( $fbks_on_hover_title && is_array( $fbks_active_image ) ) {
		$fbks_has_hover_title = '' !== trim( (string) ( $fbks_active_image['title'] ?? '' ) );
		$fbks_has_product = (int) ( $fbks_active_image['wooProductId'] ?? 0 ) > 0;

		if ( $fbks_enable_woo && $fbks_woo_hover_info && $fbks_has_product ) {
			$fbks_product_name = (string) ( $fbks_active_image['wooProductName'] ?? '' );
			$fbks_product_price = (string) ( $fbks_active_image['wooProductPrice'] ?? '' );

			if ( '' !== $fbks_product_name ) {
				$fbks_overlay_html .= '<div class="pb-product-name">' . esc_html( $fbks_product_name ) . '</div>';
			}
			if ( '' !== $fbks_product_price ) {
				$fbks_overlay_html .= '<div class="pb-product-price">' . wp_kses_post( $fbks_product_price ) . '</div>';
			}
		}

		if ( '' === $fbks_overlay_html && $fbks_has_hover_title ) {
			$fbks_overlay_html = esc_html( (string) $fbks_active_image['title'] );
		}
	}
}

$fbks_wrapper_args = [
	'class' => 'pb-filmstrip-gallery is-' . $fbks_position . ' is-theme-' . $fbks_color_mode,
];
if ( fbks_fs()->can_use_premium_code__premium_only() ) {
	if ( $fbks_disable_right_click ) {
		$fbks_wrapper_args['data-disable-right-click'] = 'true';
	}
}
$fbks_wrapper_attributes = get_block_wrapper_attributes( $fbks_wrapper_args );

$fbks_data_payload = [
	'settings' => [
		'autoplay'               => $fbks_autoplay,
		'autoplaySpeed'          => $fbks_autoplay_speed,
		'pauseOnHover'           => $fbks_pause_on_hover,
		'enableFullscreen'       => $fbks_enable_fullscreen,
		'enableWooCommerce'      => $fbks_enable_woo,
		'wooCartIconDisplay'     => $fbks_woo_cart_icon_display,
		'wooDefaultLinkAction'   => $fbks_woo_default_link_action,
		'wooProductPriceOnHover' => $fbks_woo_hover_info,
		'enableDownload'         => $fbks_enable_download,
		'downloadOnHover'        => $fbks_download_on_hover,
		'onHoverTitle'           => $fbks_on_hover_title,
		'lazyLoad'               => $fbks_lazy_load,
	],
	'images'   => $fbks_images,
];
$fbks_data_json = wp_json_encode(
	$fbks_data_payload,
	JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
);
if ( false === $fbks_data_json ) {
	$fbks_data_json = '{"settings":{},"images":[]}';
}
?>
<div <?php echo wp_kses( $fbks_wrapper_attributes, [ 'div' => [] ] ); ?>>
	<script type="application/json" class="pb-filmstrip-gallery-data"><?php echo $fbks_data_json; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></script>

	<div class="pb-filmstrip-gallery-preview is-<?php echo esc_attr( $fbks_position ); ?>">
		<div class="pb-filmstrip-gallery-main <?php echo $fbks_enable_download ? 'has-download' : ''; ?>">
			<?php if ( $fbks_has_multiple_images ) : ?>
				<button
					type="button"
					class="pb-filmstrip-gallery-nav pb-filmstrip-gallery-nav-prev"
					aria-label="<?php esc_attr_e( 'Previous image', 'folioblocks' ); ?>"
				>
					&#8249;
				</button>
				<button
					type="button"
					class="pb-filmstrip-gallery-nav pb-filmstrip-gallery-nav-next"
					aria-label="<?php esc_attr_e( 'Next image', 'folioblocks' ); ?>"
				>
					&#8250;
				</button>
			<?php endif; ?>

			<?php if ( fbks_fs()->can_use_premium_code__premium_only() ) : ?>
				<?php if ( $fbks_autoplay || $fbks_enable_fullscreen ) : ?>
					<div class="pb-filmstrip-gallery-bottom-controls">
						<?php if ( $fbks_autoplay ) : ?>
							<button
								type="button"
								class="pb-filmstrip-gallery-autoplay-button"
								aria-label="<?php esc_attr_e( 'Pause autoplay', 'folioblocks' ); ?>"
							>
								<svg
									class="pb-filmstrip-icon-play"
									viewBox="0 0 24 24"
									width="16"
									height="16"
									fill="currentColor"
									aria-hidden="true"
									style="display:none;"
								>
									<path d="M8 5v14l11-7z"></path>
								</svg>
								<svg
									class="pb-filmstrip-icon-pause"
									viewBox="0 0 24 24"
									width="16"
									height="16"
									fill="currentColor"
									aria-hidden="true"
								>
									<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
								</svg>
							</button>
						<?php endif; ?>

						<?php if ( $fbks_enable_fullscreen ) : ?>
							<button
								type="button"
								class="pb-filmstrip-gallery-fullscreen-button"
								aria-label="<?php esc_attr_e( 'Open Fullscreen', 'folioblocks' ); ?>"
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
									<path d="M6 4a2 2 0 0 0-2 2v3h1.5V6a.5.5 0 0 1 .5-.5h3V4H6Zm3 14.5H6a.5.5 0 0 1-.5-.5v-3H4v3a2 2 0 0 0 2 2h3v-1.5Zm6 1.5v-1.5h3a.5.5 0 0 0 .5-.5v-3H20v3a2 2 0 0 1-2 2h-3Zm3-16a2 2 0 0 1 2 2v3h-1.5V6a.5.5 0 0 0-.5-.5h-3V4h3Z"></path>
								</svg>
							</button>
						<?php endif; ?>
					</div>
				<?php endif; ?>

				<?php if ( $fbks_enable_woo && ! empty( $fbks_active_image ) ) : ?>
					<?php
					$fbks_active_product_id = (int) ( $fbks_active_image['wooProductId'] ?? 0 );
					$fbks_active_woo_action = (string) ( $fbks_active_image['wooLinkAction'] ?? $fbks_woo_default_link_action );
					$fbks_active_product_url = (string) ( $fbks_active_image['wooProductUrl'] ?? '' );
					$fbks_show_cart_icon = $fbks_active_product_id > 0;
					?>
					<button
						type="button"
						class="pb-add-to-cart-icon <?php echo 'hover' === $fbks_woo_cart_icon_display ? 'hover-only' : ''; ?>"
						data-woo-action="<?php echo esc_attr( $fbks_active_woo_action ); ?>"
						data-product-id="<?php echo esc_attr( $fbks_active_product_id ); ?>"
						<?php if ( '' !== $fbks_active_product_url ) : ?>
							data-product-url="<?php echo esc_url( $fbks_active_product_url ); ?>"
						<?php endif; ?>
						<?php if ( '' !== $fbks_cart_icon_style ) : ?>
							style="<?php echo esc_attr( $fbks_cart_icon_style ); ?>"
						<?php endif; ?>
						<?php if ( ! $fbks_show_cart_icon ) : ?>
							hidden
						<?php endif; ?>
						aria-label="<?php echo 'product' === $fbks_active_woo_action ? esc_attr__( 'View Product', 'folioblocks' ) : esc_attr__( 'Add to Cart', 'folioblocks' ); ?>"
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
				<?php elseif ( $fbks_enable_download && ! empty( $fbks_active_image ) ) : ?>
					<button
						class="pb-image-block-download <?php echo $fbks_download_on_hover ? 'hover-only' : ''; ?>"
						<?php if ( '' !== $fbks_download_icon_style ) : ?>
							style="<?php echo esc_attr( $fbks_download_icon_style ); ?>"
						<?php endif; ?>
						aria-label="<?php esc_attr_e( 'Download Image', 'folioblocks' ); ?>"
						data-full-src="<?php echo esc_url( (string) ( $fbks_active_image['fullSrc'] ?? '' ) ); ?>"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
							<path d="M18 11.3l-1-1.1-4 4V3h-1.5v11.3L7 10.2l-1 1.1 6.2 5.8 5.8-5.8zm.5 3.7v3.5h-13V15H4v5h16v-5h-1.5z" fill="currentColor"></path>
						</svg>
					</button>
				<?php endif; ?>
			<?php endif; ?>

			<?php if ( ! empty( $fbks_active_image ) ) : ?>
				<img
					class="pb-filmstrip-gallery-main-image <?php echo esc_attr( (string) ( $fbks_active_image['imgClass'] ?? '' ) ); ?>"
					src="<?php echo esc_url( (string) $fbks_active_image['src'] ); ?>"
					<?php if ( ! empty( $fbks_active_image['srcSet'] ) ) : ?>
						srcset="<?php echo esc_attr( (string) $fbks_active_image['srcSet'] ); ?>"
					<?php endif; ?>
					<?php if ( ! empty( $fbks_active_image['sizes'] ) ) : ?>
						sizes="<?php echo esc_attr( (string) $fbks_active_image['sizes'] ); ?>"
					<?php endif; ?>
					data-image-id="<?php echo esc_attr( (int) ( $fbks_active_image['id'] ?? 0 ) ); ?>"
					alt="<?php echo esc_attr( (string) ( $fbks_active_image['alt'] ?: $fbks_active_image['title'] ?: __( 'Selected gallery image', 'folioblocks' ) ) ); ?>"
					loading="<?php echo $fbks_lazy_load ? 'lazy' : 'eager'; ?>"
					decoding="async"
				/>
				<div
					class="pb-filmstrip-gallery-main-overlay-container"
					<?php if ( '' === $fbks_overlay_html ) : ?>
						style="display:none;"
					<?php endif; ?>
				>
					<div class="pb-filmstrip-gallery-main-overlay">
						<?php echo wp_kses_post( $fbks_overlay_html ); ?>
					</div>
				</div>
			<?php else : ?>
				<div class="pb-filmstrip-gallery-main-empty">
					<?php esc_html_e( 'Select an image to preview it.', 'folioblocks' ); ?>
				</div>
			<?php endif; ?>
		</div>

		<div class="pb-filmstrip-gallery-thumbnails-wrapper">
			<?php if ( 'bottom' === $fbks_position && $fbks_has_multiple_images ) : ?>
				<button
					type="button"
					class="pb-filmstrip-gallery-strip-nav"
					data-direction="prev"
					aria-label="<?php esc_attr_e( 'Previous thumbnail', 'folioblocks' ); ?>"
				>
					&#8249;
				</button>
			<?php endif; ?>

			<?php if ( 'bottom' !== $fbks_position && $fbks_has_multiple_images ) : ?>
				<button
					type="button"
					class="pb-filmstrip-gallery-strip-nav is-vertical"
					data-direction="prev"
					aria-label="<?php esc_attr_e( 'Previous thumbnail', 'folioblocks' ); ?>"
				>
					&#9650;
				</button>
			<?php endif; ?>

			<div
				class="pb-filmstrip-gallery-thumbnails"
				role="tablist"
				aria-label="<?php esc_attr_e( 'Filmstrip thumbnails', 'folioblocks' ); ?>"
			>
				<?php foreach ( $fbks_images as $fbks_index => $fbks_image ) : ?>
					<?php $fbks_is_active = 0 === $fbks_index; ?>
					<button
						type="button"
						role="tab"
						data-index="<?php echo esc_attr( $fbks_index ); ?>"
						aria-selected="<?php echo $fbks_is_active ? 'true' : 'false'; ?>"
						class="pb-filmstrip-gallery-thumb <?php echo $fbks_is_active ? 'is-active' : ''; ?>"
					>
						<img
							class="<?php echo esc_attr( (string) ( $fbks_image['imgClass'] ?? '' ) ); ?>"
							src="<?php echo esc_url( (string) $fbks_image['thumbSrc'] ); ?>"
							<?php if ( ! empty( $fbks_image['thumbSrcSet'] ) ) : ?>
								srcset="<?php echo esc_attr( (string) $fbks_image['thumbSrcSet'] ); ?>"
							<?php endif; ?>
							<?php if ( ! empty( $fbks_image['thumbSizes'] ) ) : ?>
								sizes="<?php echo esc_attr( (string) $fbks_image['thumbSizes'] ); ?>"
							<?php endif; ?>
							data-image-id="<?php echo esc_attr( (int) ( $fbks_image['id'] ?? 0 ) ); ?>"
							alt="<?php echo esc_attr( (string) ( $fbks_image['alt'] ?: $fbks_image['title'] ?: __( 'Gallery thumbnail', 'folioblocks' ) ) ); ?>"
							loading="<?php echo $fbks_lazy_load ? 'lazy' : 'eager'; ?>"
							decoding="async"
						/>
					</button>
				<?php endforeach; ?>
			</div>

			<?php if ( 'bottom' === $fbks_position && $fbks_has_multiple_images ) : ?>
				<button
					type="button"
					class="pb-filmstrip-gallery-strip-nav"
					data-direction="next"
					aria-label="<?php esc_attr_e( 'Next thumbnail', 'folioblocks' ); ?>"
				>
					&#8250;
				</button>
			<?php endif; ?>

			<?php if ( 'bottom' !== $fbks_position && $fbks_has_multiple_images ) : ?>
				<button
					type="button"
					class="pb-filmstrip-gallery-strip-nav is-vertical"
					data-direction="next"
					aria-label="<?php esc_attr_e( 'Next thumbnail', 'folioblocks' ); ?>"
				>
					&#9660;
				</button>
			<?php endif; ?>
		</div>

		<div class="pb-filmstrip-gallery-inner-blocks" aria-hidden="true">
			<?php echo wp_kses_post( $content ); ?>
		</div>
	</div>
</div>
