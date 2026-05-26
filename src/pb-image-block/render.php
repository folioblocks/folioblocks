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
	echo '<div class="pb-image-block"><p>' . esc_html__( 'No image selected.', 'folioblocks' ) . '</p></div>';
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
$fbks_id      = isset( $attributes['id'] ) ? (int) $attributes['id'] : 0;
$fbks_loading_attr = 'eager';

$fbks_context = $block->context ?? [];
$fbks_image_size = $fbks_context['folioBlocks/resolution'] ?? ( isset( $attributes['imageSize'] ) ? $attributes['imageSize'] : 'large' );

$fbks_lightbox         = $fbks_context['folioBlocks/lightbox'] ?? ( ! empty( $attributes['lightbox'] ) || ! empty( $attributes['enableLightbox'] ) );
$fbks_caption_lightbox = $fbks_context['folioBlocks/lightboxCaption'] ?? ( ! empty( $attributes['lightboxCaption'] ) || ! empty( $attributes['showCaptionInLightbox'] ) );
$fbks_lightbox_content = $fbks_context['folioBlocks/lightboxContent'] ?? ( $attributes['lightboxContent'] ?? '' );
if ( ! in_array( $fbks_lightbox_content, [ 'none', 'title', 'caption', 'product', 'exif' ], true ) ) {
	$fbks_lightbox_content = $fbks_caption_lightbox ? 'caption' : 'none';
}
$fbks_caption_lightbox = 'none' !== $fbks_lightbox_content;
$fbks_title_hover = $fbks_context['folioBlocks/onHoverTitle'] ?? ( isset( $attributes['showTitleOnHover'] ) ? (bool) $attributes['showTitleOnHover'] : false );
$fbks_image_click_action = sanitize_key( $fbks_context['folioBlocks/imageClickAction'] ?? ( $attributes['imageClickAction'] ?? '' ) );
$fbks_image_click_target = sanitize_key( $fbks_context['folioBlocks/imageClickTarget'] ?? ( $attributes['imageClickTarget'] ?? 'icon' ) );
if ( ! in_array( $fbks_image_click_target, [ 'icon', 'thumbnail' ], true ) ) {
	$fbks_image_click_target = 'icon';
}
$fbks_link_url = '';
$fbks_link_attrs = '';
$fbks_link_class = 'pb-image-block-link';
$fbks_icon_link_url = '';
$fbks_icon_link_attrs = '';

if ( fbks_fs()->can_use_premium_code__premium_only() ) {
	$fbks_selected_image_src = $fbks_src;
	if ( $fbks_id ) {
		$fbks_selected_image = wp_get_attachment_image_src( $fbks_id, $fbks_image_size );
		if ( ! empty( $fbks_selected_image[0] ) ) {
			$fbks_selected_image_src = esc_url( $fbks_selected_image[0] );
		}
	}

	if ( 'media_file' === $fbks_image_click_action ) {
		$fbks_link_url = $fbks_selected_image_src;
	} elseif ( 'download' === $fbks_image_click_action && 'thumbnail' === $fbks_image_click_target ) {
		$fbks_link_url = $fbks_full_src;
		$fbks_link_attrs = ' download';
	} elseif ( 'custom_url' === $fbks_image_click_action ) {
		$fbks_custom_url = isset( $attributes['customUrl'] ) && is_string( $attributes['customUrl'] )
			? trim( $attributes['customUrl'] )
			: '';
		if ( '' !== $fbks_custom_url ) {
			if ( 'thumbnail' === $fbks_image_click_target ) {
				$fbks_link_url = esc_url( $fbks_custom_url );
			} else {
				$fbks_icon_link_url = esc_url( $fbks_custom_url );
			}
			if ( ! empty( $attributes['customUrlOpenInNewTab'] ) ) {
				if ( 'thumbnail' === $fbks_image_click_target ) {
					$fbks_link_attrs = ' target="_blank" rel="noopener noreferrer"';
				} else {
					$fbks_icon_link_attrs = ' target="_blank" rel="noopener noreferrer"';
				}
			}
		}
	} elseif ( 'page_post' === $fbks_image_click_action ) {
		$fbks_post_link_url = isset( $attributes['linkedPostUrl'] ) && is_string( $attributes['linkedPostUrl'] )
			? trim( $attributes['linkedPostUrl'] )
			: '';
		if ( '' !== $fbks_post_link_url ) {
			if ( 'thumbnail' === $fbks_image_click_target ) {
				$fbks_link_url = esc_url( $fbks_post_link_url );
			} else {
				$fbks_icon_link_url = esc_url( $fbks_post_link_url );
			}
			if ( ! empty( $attributes['linkedPostOpenInNewTab'] ) ) {
				if ( 'thumbnail' === $fbks_image_click_target ) {
					$fbks_link_attrs = ' target="_blank" rel="noopener noreferrer"';
				} else {
					$fbks_icon_link_attrs = ' target="_blank" rel="noopener noreferrer"';
				}
			}
		}
	}

	if ( '' !== $fbks_link_url ) {
		$fbks_lightbox = false;
	}
}

if ( fbks_fs()->can_use_premium_code__premium_only() ) {
	// Icon styles (context wins; fallback to image block attributes when used standalone)
	$fbks_download_icon_color = $fbks_context['folioBlocks/downloadIconColor'] ?? ( $attributes['downloadIconColor'] ?? '' );
	$fbks_download_icon_bg    = $fbks_context['folioBlocks/downloadIconBgColor'] ?? ( $attributes['downloadIconBgColor'] ?? '' );
	$fbks_cart_icon_color     = $fbks_context['folioBlocks/cartIconColor'] ?? ( $attributes['cartIconColor'] ?? '' );
	$fbks_cart_icon_bg        = $fbks_context['folioBlocks/cartIconBgColor'] ?? ( $attributes['cartIconBgColor'] ?? '' );
	$fbks_link_icon_color     = $fbks_context['folioBlocks/linkIconColor'] ?? ( $attributes['linkIconColor'] ?? '' );
	$fbks_link_icon_bg        = $fbks_context['folioBlocks/linkIconBgColor'] ?? ( $attributes['linkIconBgColor'] ?? '' );

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

	$fbks_link_button_style = '';
	if ( $fbks_link_icon_color !== '' ) {
		$fbks_link_button_style .= '--pb-link-icon-color:' . $fbks_link_icon_color . ';';
	}
	if ( $fbks_link_icon_bg !== '' ) {
		$fbks_link_button_style .= '--pb-link-icon-bg:' . $fbks_link_icon_bg . ';';
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
	$fbks_link_icon_display = $fbks_context['folioBlocks/linkIconDisplay'] ?? ( $attributes['linkIconDisplay'] ?? 'hover' );
	$fbks_woo_hover_info = $fbks_context['folioBlocks/wooProductPriceOnHover'] ?? ( $attributes['wooProductPriceOnHover'] ?? false );
	$fbks_overlay_content = $fbks_context['folioBlocks/overlayContent'] ?? ( $attributes['overlayContent'] ?? ( $fbks_woo_hover_info ? 'product' : 'title' ) );
	if ( ! in_array( $fbks_overlay_content, [ 'title', 'caption', 'product', 'exif' ], true ) ) {
		$fbks_overlay_content = 'title';
	}
	$fbks_woo_lightbox_info = $fbks_context['folioBlocks/wooLightboxInfoType'] ?? ( $attributes['wooLightboxInfoType'] ?? 'caption' );

	if ( 'woocommerce' === $fbks_image_click_action && 'thumbnail' === $fbks_image_click_target && $fbks_enable_woo && ! empty( $attributes['wooProductId'] ) ) {
		$fbks_woo_product_id = intval( $attributes['wooProductId'] );
		if ( 'product' === $fbks_woo_link_action && ! empty( $attributes['wooProductURL'] ) ) {
			$fbks_link_url = esc_url( $attributes['wooProductURL'] );
		} else {
			$fbks_link_url = esc_url( add_query_arg( 'add-to-cart', $fbks_woo_product_id, remove_query_arg( 'add-to-cart' ) ) );
			$fbks_link_class .= ' pb-add-to-cart-thumbnail';
			$fbks_link_attrs .= ' data-woo-action="add_to_cart" data-product-id="' . esc_attr( $fbks_woo_product_id ) . '"';
			if ( ! empty( $attributes['wooProductURL'] ) ) {
				$fbks_link_attrs .= ' data-product-url="' . esc_url( $attributes['wooProductURL'] ) . '"';
			}
		}
		$fbks_lightbox = false;
	}

	// Resolve effective hover style (context wins, then attribute, then default) — Premium only
	$fbks_on_hover_style = $fbks_context['folioBlocks/onHoverStyle'] ?? ( $attributes['onHoverStyle'] ?? 'blur-overlay' );
	$fbks_hover_class_map = [
		'blur-overlay'   => 'pb-hover-blur-overlay',
		'fade-overlay'    => 'pb-hover-fade-overlay',
		'gradient-bottom' => 'pb-hover-gradient-bottom',
		'chip'            => 'pb-hover-chip',
		'color-overlay'   => 'pb-hover-color-overlay',
	];
	$fbks_hover_variant_class = $fbks_hover_class_map[ $fbks_on_hover_style ] ?? 'pb-hover-fade-overlay';
	$fbks_overlay_bg   = $fbks_context['folioBlocks/overlayBgColor'] ?? ( $attributes['overlayBgColor'] ?? '' );
	$fbks_overlay_text = $fbks_context['folioBlocks/overlayTextColor'] ?? ( $attributes['overlayTextColor'] ?? '' );
	$fbks_chip_overlay_bg   = $fbks_context['folioBlocks/chipOverlayBgColor'] ?? ( $attributes['chipOverlayBgColor'] ?? '' );
	$fbks_chip_overlay_text = $fbks_context['folioBlocks/chipOverlayTextColor'] ?? ( $attributes['chipOverlayTextColor'] ?? '' );

	$fbks_lazy_from_context = isset( $fbks_context['folioBlocks/lazyLoad'] ) ? (bool) $fbks_context['folioBlocks/lazyLoad'] : null;
    $fbks_lazy_from_attr    = isset( $attributes['lazyLoad'] ) ? (bool) $attributes['lazyLoad'] : null;
    $fbks_effective_lazy    = ( null !== $fbks_lazy_from_context ) ? $fbks_lazy_from_context : ( $fbks_lazy_from_attr ?? false );
    $fbks_loading_attr      = $fbks_effective_lazy ? 'lazy' : 'eager';

	$fbks_dropshadow = isset( $fbks_context['folioBlocks/dropShadow'] )
		? (bool) $fbks_context['folioBlocks/dropShadow']
		: ( ! empty( $attributes['dropShadow'] ) || ! empty( $attributes['dropshadow'] ) );


	$fbks_filter_categories = [];
	if ( ! empty( $attributes['filterCategories'] ) && is_array( $attributes['filterCategories'] ) ) {
		foreach ( $attributes['filterCategories'] as $fbks_category ) {
			$fbks_category = is_string( $fbks_category ) ? trim( $fbks_category ) : '';
			if ( '' !== $fbks_category ) {
				$fbks_filter_categories[] = $fbks_category;
			}
		}
		$fbks_filter_categories = array_values( array_unique( $fbks_filter_categories ) );
	}
	if ( empty( $fbks_filter_categories ) && ! empty( $attributes['filterCategory'] ) && is_string( $attributes['filterCategory'] ) ) {
		$fbks_legacy_filter_category = trim( $attributes['filterCategory'] );
		if ( '' !== $fbks_legacy_filter_category ) {
			$fbks_filter_categories = [ $fbks_legacy_filter_category ];
		}
	}
	$fbks_filter_category       = $fbks_filter_categories[0] ?? '';
	$fbks_filter_categories_attr = implode( ',', $fbks_filter_categories );

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
			if ( 'color-overlay' === $fbks_on_hover_style ) {
				if ( $fbks_overlay_bg ) {
					$fbks_img_styles .= '--pb-overlay-bg: ' . esc_attr( $fbks_overlay_bg ) . ';';
				}
				if ( $fbks_overlay_text ) {
					$fbks_img_styles .= '--pb-overlay-color: ' . esc_attr( $fbks_overlay_text ) . ';';
				}
			}
			if ( 'chip' === $fbks_on_hover_style ) {
				if ( $fbks_chip_overlay_bg ) {
					$fbks_img_styles .= '--pb-chip-overlay-bg: ' . esc_attr( $fbks_chip_overlay_bg ) . ';';
				}
				if ( $fbks_chip_overlay_text ) {
					$fbks_img_styles .= '--pb-chip-overlay-color: ' . esc_attr( $fbks_chip_overlay_text ) . ';';
				}
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

$fbks_get_exif_icon = static function ( $fbks_icon_name ) {
	$fbks_icons = [
		'camera' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 9.2c-2.2 0-3.9 1.8-3.9 4s1.8 4 3.9 4 4-1.8 4-4-1.8-4-4-4zm0 6.5c-1.4 0-2.4-1.1-2.4-2.5s1.1-2.5 2.4-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5zM20.2 8c-.1 0-.3 0-.5-.1l-2.5-.8c-.4-.1-.8-.4-1.1-.8l-1-1.5c-.4-.5-1-.9-1.7-.9h-2.9c-.6.1-1.2.4-1.6 1l-1 1.5c-.3.3-.6.6-1.1.7l-2.5.8c-.2.1-.4.1-.6.1-1 .2-1.7.9-1.7 1.9v8.3c0 1 .9 1.9 2 1.9h16c1.1 0 2-.8 2-1.9V9.9c0-1-.7-1.7-1.8-1.9zm.3 10.1c0 .2-.2.4-.5.4H4c-.3 0-.5-.2-.5-.4V9.9c0-.1.2-.3.5-.4.2 0 .5-.1.8-.2l2.5-.8c.7-.2 1.4-.6 1.8-1.3l1-1.5c.1-.1.2-.2.4-.2h2.9c.2 0 .3.1.4.2l1 1.5c.4.7 1.1 1.1 1.9 1.4l2.5.8c.3.1.6.1.8.2.3 0 .4.2.4.4v8.1z"/></svg>',
		'aspect-ratio' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18.5 5.5h-13c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2zm.5 11c0 .3-.2.5-.5.5h-13c-.3 0-.5-.2-.5-.5v-9c0-.3.2-.5.5-.5h13c.3 0 .5.2.5.5v9zM6.5 12H8v-2h2V8.5H6.5V12zm9.5 2h-2v1.5h3.5V12H16v2z"/></svg>',
		'time' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 16.5c-4.1 0-7.5-3.4-7.5-7.5S7.9 4.5 12 4.5s7.5 3.4 7.5 7.5-3.4 7.5-7.5 7.5zM12 7l-1 5c0 .3.2.6.4.8l4.2 2.8-2.7-4.1L12 7z"/></svg>',
		'aperture' => '<svg viewBox="-16 -16 495 495" aria-hidden="true" focusable="false"><path fill="currentColor" d="M395.195,67.805C351.47,24.08,293.335,0,231.5,0S111.529,24.08,67.805,67.805S0,169.664,0,231.5S24.08,351.47,67.805,395.195S169.664,463,231.5,463s119.971-24.08,163.695-67.805S463,293.335,463,231.5S438.919,111.529,395.195,67.805z M443.392,186.803c-0.321,0.232-0.631,0.484-0.92,0.772l-79.886,79.886V59.168c7.689,5.873,15.045,12.285,22.002,19.243C414.732,108.555,434.877,146.025,443.392,186.803z M188.262,347.586l-72.848-72.848v-94.2l65.124-65.124h94.2l72.848,72.848v94.201l-65.124,65.124H188.262z M347.586,48.671v118.378L198.094,17.557C209.049,15.871,220.207,15,231.5,15C273.258,15,313.208,26.748,347.586,48.671z M78.411,78.411c28.553-28.552,63.68-48.134,101.964-57.36l79.362,79.362H59.168C65.042,92.725,71.454,85.369,78.411,78.411z M48.67,115.414h110.654L16.613,258.126C15.544,249.358,15,240.471,15,231.5C15,189.741,26.748,149.791,48.67,115.414z M19.607,276.196c0.321-0.232,0.631-0.484,0.92-0.772l79.886-79.886v208.294c-7.688-5.873-15.045-12.285-22.002-19.243C48.268,354.445,28.123,316.974,19.607,276.196z M115.414,414.329V295.951l149.491,149.491C253.951,447.129,242.792,448,231.5,448C189.741,448,149.791,436.252,115.414,414.329z M384.588,384.588c-28.553,28.552-63.68,48.134-101.965,57.36l-79.362-79.362h200.569C397.958,370.275,391.546,377.631,384.588,384.588z M414.329,347.586H303.675l142.712-142.712c1.068,8.767,1.613,17.655,1.613,26.626C448,273.258,436.252,313.208,414.329,347.586z"/></svg>',
		'iso' => '<span class="pb-lightbox-exif-icon__iso">ISO</span>',
	];

	return $fbks_icons[ $fbks_icon_name ] ?? '';
};

$fbks_get_lightbox_exif = static function () use ( $attributes, $fbks_get_exif_icon ) {
	$fbks_unknown = __( 'Unknown', 'folioblocks' );
	$fbks_fields = [
		[
			'icon'  => 'camera',
			'label' => __( 'Camera Model', 'folioblocks' ),
			'value' => $attributes['exifCamera'] ?? '',
		],
		[
			'icon'  => 'aspect-ratio',
			'label' => __( 'Focal Length', 'folioblocks' ),
			'value' => $attributes['exifFocalLength'] ?? '',
		],
		[
			'icon'  => 'time',
			'label' => __( 'Shutter Speed', 'folioblocks' ),
			'value' => $attributes['exifShutterSpeed'] ?? '',
		],
		[
			'icon'  => 'aperture',
			'label' => __( 'Aperture', 'folioblocks' ),
			'value' => $attributes['exifAperture'] ?? '',
		],
		[
			'icon'  => 'iso',
			'label' => __( 'ISO', 'folioblocks' ),
			'value' => $attributes['exifIso'] ?? '',
		],
	];

	$fbks_output = '<div class="pb-lightbox-exif">';
	foreach ( $fbks_fields as $fbks_field ) {
		$fbks_value = is_string( $fbks_field['value'] ) && '' !== trim( $fbks_field['value'] )
			? trim( $fbks_field['value'] )
			: $fbks_unknown;
		$fbks_output .= '<div class="pb-lightbox-exif__row">';
		$fbks_output .= '<span class="pb-lightbox-exif__icon">' . $fbks_get_exif_icon( $fbks_field['icon'] ) . '</span>';
		$fbks_output .= '<span class="pb-lightbox-exif__text">';
		$fbks_output .= '<span class="pb-lightbox-exif__label">' . esc_html( $fbks_field['label'] ) . '</span>';
		$fbks_output .= '<span class="pb-lightbox-exif__value">' . esc_html( $fbks_value ) . '</span>';
		$fbks_output .= '</span></div>';
	}
	$fbks_output .= '</div>';

	return $fbks_output;
};

$fbks_get_overlay_exif = static function () use ( $attributes, $fbks_get_exif_icon ) {
	$fbks_unknown = __( 'Unknown', 'folioblocks' );
	$fbks_fields = [
		[ 'icon' => 'camera', 'value' => $attributes['exifCamera'] ?? '' ],
		[ 'icon' => 'aspect-ratio', 'value' => $attributes['exifFocalLength'] ?? '' ],
		[ 'icon' => 'time', 'value' => $attributes['exifShutterSpeed'] ?? '' ],
		[ 'icon' => 'aperture', 'value' => $attributes['exifAperture'] ?? '' ],
		[ 'icon' => 'iso', 'value' => $attributes['exifIso'] ?? '' ],
	];

	$fbks_output = '<div class="pb-hover-exif">';
	foreach ( $fbks_fields as $fbks_field ) {
		$fbks_value = is_string( $fbks_field['value'] ) && '' !== trim( $fbks_field['value'] )
			? trim( $fbks_field['value'] )
			: $fbks_unknown;
		$fbks_output .= '<span class="pb-hover-exif__item">';
		$fbks_output .= '<span class="pb-hover-exif__icon">' . $fbks_get_exif_icon( $fbks_field['icon'] ) . '</span>';
		$fbks_output .= '<span class="pb-hover-exif__value">' . esc_html( $fbks_value ) . '</span>';
		$fbks_output .= '</span>';
	}
	$fbks_output .= '</div>';

	return $fbks_output;
};

	?>

<div 
	<?php echo wp_kses_post( $fbks_wrapper_attributes ); ?> 
	<?php if ( fbks_fs()->can_use_premium_code__premium_only() ) : if ( '' !== $fbks_filter_categories_attr ) : ?>
		data-filters="<?php echo esc_attr( $fbks_filter_categories_attr ); ?>"
	<?php endif; endif; ?>
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
					if ( 'title' === $fbks_lightbox_content && ! empty( $fbks_title ) ) {
						$fbks_lightbox_caption = esc_html( $fbks_title );
					} elseif ( $fbks_enable_woo && 'product' === $fbks_lightbox_content ) {
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
						} elseif ( 'caption' === $fbks_lightbox_content && ! empty( $fbks_caption ) ) {
							$fbks_lightbox_caption = wpautop( wp_kses_post( $fbks_caption ) );
						} elseif ( 'exif' === $fbks_lightbox_content ) {
							$fbks_lightbox_caption = $fbks_get_lightbox_exif();
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
			$fbks_image_html = wp_get_attachment_image( $fbks_id, $fbks_image_size, false, $fbks_img_attributes );
			if ( '' !== $fbks_link_url && '' !== $fbks_image_html ) {
				echo '<a href="' . esc_url( $fbks_link_url ) . '" class="' . esc_attr( $fbks_link_class ) . '"' . $fbks_link_attrs . '>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Attribute string is assembled from escaped values above.
				echo wp_kses_post( $fbks_image_html );
				echo '</a>';
			} else {
				echo wp_kses_post( $fbks_image_html );
			}
			?>
		<?php endif; ?>

		<?php
			// Handle title/product overlay display (Pro only)
			if ( fbks_fs()->can_use_premium_code__premium_only() && $fbks_title_hover ) {
					if ( 'caption' === $fbks_overlay_content ) {
						if ( ! empty( $fbks_caption ) ) {
							echo '<div class="pb-image-block-title-container">';
							echo '<figcaption class="pb-image-block-title">';
							echo wp_kses_post( $fbks_caption );
							echo '</figcaption></div>';
						}
					} elseif ( 'exif' === $fbks_overlay_content ) {
						echo '<div class="pb-image-block-title-container">';
						echo '<figcaption class="pb-image-block-title">';
						echo $fbks_get_overlay_exif(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Markup is assembled from hardcoded icons and escaped values.
						echo '</figcaption></div>';
					} elseif ( $fbks_enable_woo && 'product' === $fbks_overlay_content ) {
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
				} elseif ( ! empty( $fbks_title ) ) {
					echo '<div class="pb-image-block-title-container">';
					echo '<figcaption class="pb-image-block-title">';
					echo wp_kses_post( $fbks_title );
					echo '</figcaption></div>';
				}
			}
		?>
		<?php if ( fbks_fs()->can_use_premium_code__premium_only() ) : ?>
			<?php if ( $fbks_enable_woo && ! empty( $attributes['wooProductId'] ) && 'thumbnail' !== $fbks_image_click_target ) : ?>
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
			<?php if ( '' !== $fbks_icon_link_url ) : ?>
				<a
					class="pb-image-block-link-icon <?php echo $fbks_link_icon_display === 'hover' ? 'hover-only' : ''; ?>"
					href="<?php echo esc_url( $fbks_icon_link_url ); ?>"
					<?php echo $fbks_icon_link_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Attribute string is hardcoded above. ?>
					<?php if ( $fbks_link_button_style !== '' ) : ?>
						style="<?php echo esc_attr( $fbks_link_button_style ); ?>"
					<?php endif; ?>
					aria-label="<?php esc_attr_e( 'Open Link', 'folioblocks' ); ?>"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
						<path d="M10 17.389H8.444A5.194 5.194 0 1 1 8.444 7H10v1.5H8.444a3.694 3.694 0 0 0 0 7.389H10v1.5ZM14 7h1.556a5.194 5.194 0 0 1 0 10.39H14v-1.5h1.556a3.694 3.694 0 0 0 0-7.39H14V7Zm-4.5 6h5v-1.5h-5V13Z" fill="currentColor"></path>
					</svg>
				</a>
			<?php endif; ?>
		<?php endif; ?>
		<?php if ( fbks_fs()->can_use_premium_code__premium_only() ) : ?>
			<?php if ( ( ! $fbks_enable_woo ) && 'thumbnail' !== $fbks_image_click_target && ( ! empty( $fbks_context['folioBlocks/enableDownload'] ) || ! empty( $attributes['enableDownload'] ) ) ) : ?>
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
