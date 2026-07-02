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
$fbks_randomize_order = false;
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
$fbks_link_icon_style = '';
$fbks_overlay_content = 'title';
$fbks_hover_variant_class = '';
$fbks_hover_effect_class = '';
$fbks_overlay_entrance_class = '';
$fbks_hover_style = '';
$fbks_hide_unknown_exif = ! empty( $attributes['hideUnknownExifFields'] );
$fbks_woo_active = false;
$fbks_is_custom_icon_color = static function ( $fbks_value, $fbks_default ) {
	if ( ! is_string( $fbks_value ) || '' === trim( $fbks_value ) ) {
		return false;
	}

	return strtolower( trim( $fbks_value ) ) !== $fbks_default;
};
$fbks_can_use_premium = fbks_fs()->can_use_premium_code__premium_only();
$fbks_enable_fullscreen = $fbks_can_use_premium && ! empty( $attributes['enableFullscreen'] );
$fbks_image_click_action = '';
$fbks_image_click_target = 'icon';
$fbks_link_icon_display = 'hover';

if ( $fbks_can_use_premium ) {
	$fbks_image_click_action = sanitize_key( $attributes['imageClickAction'] ?? '' );
	$fbks_image_click_target = isset( $attributes['imageClickTarget'] ) && in_array( $attributes['imageClickTarget'], [ 'icon', 'thumbnail' ], true )
		? $attributes['imageClickTarget']
		: 'icon';
	$fbks_link_icon_display = isset( $attributes['linkIconDisplay'] ) && in_array( $attributes['linkIconDisplay'], [ 'none', 'hover', 'always' ], true )
		? $attributes['linkIconDisplay']
		: 'hover';
	$fbks_autoplay = ! empty( $attributes['autoplay'] );
	$fbks_autoplay_speed = isset( $attributes['autoplaySpeed'] ) ? (float) $attributes['autoplaySpeed'] : 3.0;
	if ( $fbks_autoplay_speed <= 0 ) {
		$fbks_autoplay_speed = 3.0;
	}

	$fbks_pause_on_hover = ! empty( $attributes['pauseOnHover'] );
	$fbks_randomize_order = ! empty( $attributes['randomizeOrder'] );

	if ( ! function_exists( 'is_plugin_active' ) ) {
		include_once ABSPATH . 'wp-admin/includes/plugin.php';
	}
	$fbks_woo_active = is_plugin_active( 'woocommerce/woocommerce.php' );
	$fbks_enable_woo = $fbks_woo_active && ! empty( $attributes['enableWooCommerce'] );

	$fbks_enable_download = ! empty( $attributes['enableDownload'] ) && ! $fbks_enable_woo;
	$fbks_download_on_hover = isset( $attributes['downloadOnHover'] ) ? (bool) $attributes['downloadOnHover'] : true;

	$fbks_woo_cart_icon_display = isset( $attributes['wooCartIconDisplay'] ) && in_array( $attributes['wooCartIconDisplay'], [ 'none', 'hover', 'always' ], true )
		? $attributes['wooCartIconDisplay']
		: 'hover';
	$fbks_woo_default_link_action = isset( $attributes['wooDefaultLinkAction'] ) && in_array( $attributes['wooDefaultLinkAction'], [ 'add_to_cart', 'product' ], true )
		? $attributes['wooDefaultLinkAction']
		: 'add_to_cart';

	$fbks_woo_hover_info = ! empty( $attributes['wooProductPriceOnHover'] );
	$fbks_overlay_content = isset( $attributes['overlayContent'] ) && in_array( $attributes['overlayContent'], [ 'title', 'caption', 'product', 'exif', 'social' ], true )
		? $attributes['overlayContent']
		: ( $fbks_woo_hover_info ? 'product' : 'title' );
	$fbks_social_sharing_enabled = ! empty( $attributes['enableSocialSharing'] );
	$fbks_social_sources = function_exists( 'fbks_normalize_social_share_sources' )
		? fbks_normalize_social_share_sources( $attributes['socialSharingSources'] ?? [] )
		: [];
	if ( 'social' === $fbks_overlay_content && ! $fbks_social_sharing_enabled ) {
		$fbks_overlay_content = 'title';
	}
	$fbks_on_hover_title = ! empty( $attributes['onHoverTitle'] );
	$fbks_hover_class_map = [
		'blur-overlay'   => 'pb-hover-blur-overlay',
		'fade-overlay'    => 'pb-hover-fade-overlay',
		'gradient-bottom' => 'pb-hover-gradient-bottom',
		'chip'            => 'pb-hover-chip',
		'color-overlay'    => 'pb-hover-color-overlay',
		'gradient-overlay' => 'pb-hover-gradient-overlay',
	];
	$fbks_on_hover_style = isset( $attributes['onHoverStyle'] ) && isset( $fbks_hover_class_map[ $attributes['onHoverStyle'] ] )
		? $attributes['onHoverStyle']
		: 'blur-overlay';
	$fbks_hover_variant_class = $fbks_hover_class_map[ $fbks_on_hover_style ];
	$fbks_hover_effect = sanitize_key( $attributes['hoverEffect'] ?? 'none' );
	$fbks_hover_effect_class_map = [
		'zoom-in'    => 'pb-effect-zoom-in',
		'zoom-out'   => 'pb-effect-zoom-out',
		'lift'       => 'pb-effect-lift',
		'tilt'       => 'pb-effect-tilt',
		'pop'        => 'pb-effect-pop',
		'glare'      => 'pb-effect-glare',
		'pan'        => 'pb-effect-pan',
		'desaturate' => 'pb-effect-desaturate',
	];
	$fbks_hover_effect_class = $fbks_hover_effect_class_map[ $fbks_hover_effect ] ?? '';
	$fbks_overlay_entrance = sanitize_key( $attributes['overlayEntrance'] ?? 'default' );
	$fbks_overlay_entrance_class_map = [
		'fade'        => 'pb-overlay-enter-fade',
		'slide-up'    => 'pb-overlay-enter-slide-up',
		'slide-down'  => 'pb-overlay-enter-slide-down',
		'slide-left'  => 'pb-overlay-enter-slide-left',
		'slide-right' => 'pb-overlay-enter-slide-right',
	];
	$fbks_overlay_entrance_class = $fbks_overlay_entrance_class_map[ $fbks_overlay_entrance ] ?? '';
	$fbks_overlay_font_family = fbks_sanitize_css_font_family_value( (string) ( $attributes['overlayFontFamily'] ?? '' ) );
	$fbks_overlay_font_weight = fbks_sanitize_css_font_weight_value( (string) ( $attributes['overlayFontWeight'] ?? '' ) );
	$fbks_overlay_font_style = fbks_sanitize_css_font_style_value( (string) ( $attributes['overlayFontStyle'] ?? '' ) );
	$fbks_hover_style .= $fbks_overlay_font_family ? '--pb-overlay-font-family:' . $fbks_overlay_font_family . ';' : '';
	$fbks_hover_style .= $fbks_overlay_font_weight ? '--pb-overlay-font-weight:' . $fbks_overlay_font_weight . ';' : '';
	$fbks_hover_style .= $fbks_overlay_font_style ? '--pb-overlay-font-style:' . $fbks_overlay_font_style . ';' : '';
	if ( 'color-overlay' === $fbks_on_hover_style ) {
		$fbks_overlay_bg = fbks_sanitize_css_color_value( (string) ( $attributes['overlayBgColor'] ?? '#f9f9f9' ) );
		$fbks_overlay_text = fbks_sanitize_css_color_value( (string) ( $attributes['overlayTextColor'] ?? '#000000' ) );
		$fbks_hover_style .= $fbks_overlay_bg ? '--pb-overlay-bg:' . $fbks_overlay_bg . ';' : '';
		$fbks_hover_style .= $fbks_overlay_text ? '--pb-overlay-color:' . $fbks_overlay_text . ';' : '';
	} elseif ( 'gradient-overlay' === $fbks_on_hover_style ) {
		$fbks_overlay_bg = fbks_sanitize_css_background_value( (string) ( $attributes['overlayBgGradient'] ?? '' ) );
		$fbks_overlay_text = fbks_sanitize_css_color_value( (string) ( $attributes['overlayTextColor'] ?? '#000000' ) );
		$fbks_hover_style .= $fbks_overlay_bg ? '--pb-overlay-bg:' . $fbks_overlay_bg . ';' : '';
		$fbks_hover_style .= $fbks_overlay_text ? '--pb-overlay-color:' . $fbks_overlay_text . ';' : '';
	} elseif ( 'chip' === $fbks_on_hover_style ) {
		$fbks_chip_overlay_bg = fbks_sanitize_css_background_value( (string) ( $attributes['chipOverlayBgColor'] ?? '#f9f9f9' ) );
		$fbks_chip_overlay_text = fbks_sanitize_css_color_value( (string) ( $attributes['chipOverlayTextColor'] ?? '#000000' ) );
		$fbks_hover_style .= $fbks_chip_overlay_bg ? '--pb-chip-overlay-bg:' . $fbks_chip_overlay_bg . ';' : '';
		$fbks_hover_style .= $fbks_chip_overlay_text ? '--pb-chip-overlay-color:' . $fbks_chip_overlay_text . ';' : '';
	}
	$fbks_lazy_load = ! empty( $attributes['lazyLoad'] );
	$fbks_disable_right_click = ! empty( $attributes['disableRightClick'] );

	if ( isset( $attributes['downloadIconColor'] ) && $fbks_is_custom_icon_color( $attributes['downloadIconColor'], '#000000' ) ) {
		$fbks_download_icon_style .= '--pb-download-icon-color:' . $attributes['downloadIconColor'] . ';';
	}
	if ( isset( $attributes['downloadIconBgColor'] ) && $fbks_is_custom_icon_color( $attributes['downloadIconBgColor'], '#ffffff' ) ) {
		$fbks_download_icon_style .= '--pb-download-icon-bg:' . $attributes['downloadIconBgColor'] . ';';
	}

	if ( isset( $attributes['cartIconColor'] ) && $fbks_is_custom_icon_color( $attributes['cartIconColor'], '#000000' ) ) {
		$fbks_cart_icon_style .= '--pb-cart-icon-color:' . $attributes['cartIconColor'] . ';';
	}
	if ( isset( $attributes['cartIconBgColor'] ) && $fbks_is_custom_icon_color( $attributes['cartIconBgColor'], '#ffffff' ) ) {
		$fbks_cart_icon_style .= '--pb-cart-icon-bg:' . $attributes['cartIconBgColor'] . ';';
	}

	if ( isset( $attributes['linkIconColor'] ) && $fbks_is_custom_icon_color( $attributes['linkIconColor'], '#000000' ) ) {
		$fbks_link_icon_style .= '--pb-link-icon-color:' . $attributes['linkIconColor'] . ';';
	}
	if ( isset( $attributes['linkIconBgColor'] ) && $fbks_is_custom_icon_color( $attributes['linkIconBgColor'], '#ffffff' ) ) {
		$fbks_link_icon_style .= '--pb-link-icon-bg:' . $attributes['linkIconBgColor'] . ';';
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

	$fbks_get_exif_icon = static function ( $fbks_icon_name ) {
		$fbks_icons = [
			'camera'       => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 9.2c-2.2 0-3.9 1.8-3.9 4s1.8 4 3.9 4 4-1.8 4-4-1.8-4-4-4zm0 6.5c-1.4 0-2.4-1.1-2.4-2.5s1.1-2.5 2.4-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5zM20.2 8c-.1 0-.3 0-.5-.1l-2.5-.8c-.4-.1-.8-.4-1.1-.8l-1-1.5c-.4-.5-1-.9-1.7-.9h-2.9c-.6.1-1.2.4-1.6 1l-1 1.5c-.3.3-.6.6-1.1.7l-2.5.8c-.2.1-.4.1-.6.1-1 .2-1.7.9-1.7 1.9v8.3c0 1 .9 1.9 2 1.9h16c1.1 0 2-.8 2-1.9V9.9c0-1-.7-1.7-1.8-1.9zm.3 10.1c0 .2-.2.4-.5.4H4c-.3 0-.5-.2-.5-.4V9.9c0-.1.2-.3.5-.4.2 0 .5-.1.8-.2l2.5-.8c.7-.2 1.4-.6 1.8-1.3l1-1.5c.1-.1.2-.2.4-.2h2.9c.2 0 .3.1.4.2l1 1.5c.4.7 1.1 1.1 1.9 1.4l2.5.8c.3.1.6.1.8.2.3 0 .4.2.4.4v8.1z"/></svg>',
			'aspect-ratio' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18.5 5.5h-13c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2zm.5 11c0 .3-.2.5-.5.5h-13c-.3 0-.5-.2-.5-.5v-9c0-.3.2-.5.5-.5h13c.3 0 .5.2.5.5v9zM6.5 12H8v-2h2V8.5H6.5V12zm9.5 2h-2v1.5h3.5V12H16v2z"/></svg>',
			'time'         => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 16.5c-4.1 0-7.5-3.4-7.5-7.5S7.9 4.5 12 4.5s7.5 3.4 7.5 7.5-3.4 7.5-7.5 7.5zM12 7l-1 5c0 .3.2.6.4.8l4.2 2.8-2.7-4.1L12 7z"/></svg>',
			'aperture'     => '<svg viewBox="-16 -16 495 495" aria-hidden="true" focusable="false"><path fill="currentColor" d="M395.195,67.805C351.47,24.08,293.335,0,231.5,0S111.529,24.08,67.805,67.805S0,169.664,0,231.5S24.08,351.47,67.805,395.195S169.664,463,231.5,463s119.971-24.08,163.695-67.805S463,293.335,463,231.5S438.919,111.529,395.195,67.805z M443.392,186.803c-0.321,0.232-0.631,0.484-0.92,0.772l-79.886,79.886V59.168c7.689,5.873,15.045,12.285,22.002,19.243C414.732,108.555,434.877,146.025,443.392,186.803z M188.262,347.586l-72.848-72.848v-94.2l65.124-65.124h94.2l72.848,72.848v94.201l-65.124,65.124H188.262z M347.586,48.671v118.378L198.094,17.557C209.049,15.871,220.207,15,231.5,15C273.258,15,313.208,26.748,347.586,48.671z M78.411,78.411c28.553-28.552,63.68-48.134,101.964-57.36l79.362,79.362H59.168C65.042,92.725,71.454,85.369,78.411,78.411z M48.67,115.414h110.654L16.613,258.126C15.544,249.358,15,240.471,15,231.5C15,189.741,26.748,149.791,48.67,115.414z M19.607,276.196c0.321-0.232,0.631-0.484,0.92-0.772l79.886-79.886v208.294c-7.688-5.873-15.045-12.285-22.002-19.243C48.268,354.445,28.123,316.974,19.607,276.196z M115.414,414.329V295.951l149.491,149.491C253.951,447.129,242.792,448,231.5,448C189.741,448,149.791,436.252,115.414,414.329z M384.588,384.588c-28.553,28.552-63.68,48.134-101.965,57.36l-79.362-79.362h200.569C397.958,370.275,391.546,377.631,384.588,384.588z M414.329,347.586H303.675l142.712-142.712c1.068,8.767,1.613,17.655,1.613,26.626C448,273.258,436.252,313.208,414.329,347.586z"/></svg>',
			'iso'          => '<span class="pb-hover-exif-icon__iso">ISO</span>',
		];

		return $fbks_icons[ $fbks_icon_name ] ?? '';
	};

	$fbks_get_overlay_exif = static function ( $fbks_image, $fbks_hide_unknown = false ) use ( $fbks_get_exif_icon ) {
		$fbks_unknown = __( 'Unknown', 'folioblocks' );
		$fbks_fields = [
			[ 'icon' => 'camera', 'value' => $fbks_image['exifCamera'] ?? '' ],
			[ 'icon' => 'aspect-ratio', 'value' => $fbks_image['exifFocalLength'] ?? '' ],
			[ 'icon' => 'time', 'value' => $fbks_image['exifShutterSpeed'] ?? '' ],
			[ 'icon' => 'aperture', 'value' => $fbks_image['exifAperture'] ?? '' ],
			[ 'icon' => 'iso', 'value' => $fbks_image['exifIso'] ?? '' ],
		];

		$fbks_output = '<div class="pb-hover-exif">';
		foreach ( $fbks_fields as $fbks_field ) {
			$fbks_normalized_value = is_string( $fbks_field['value'] ) ? strtolower( trim( $fbks_field['value'] ) ) : '';
			if ( $fbks_hide_unknown && ( '' === $fbks_normalized_value || 'unknown' === $fbks_normalized_value || strtolower( $fbks_unknown ) === $fbks_normalized_value ) ) {
				continue;
			}
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
		$fbks_caption = '';
		if ( isset( $fbks_image_attrs['caption'] ) ) {
			if ( is_array( $fbks_image_attrs['caption'] ) ) {
				$fbks_caption = (string) ( $fbks_image_attrs['caption']['raw'] ?? $fbks_image_attrs['caption']['rendered'] ?? '' );
			} else {
				$fbks_caption = (string) $fbks_image_attrs['caption'];
			}
		}

		$fbks_woo_product_id = 0;
		$fbks_woo_product_name = '';
		$fbks_woo_product_price = '';
		$fbks_woo_product_url = '';
		$fbks_woo_link_action = $fbks_woo_default_link_action;

		if ( $fbks_can_use_premium ) {
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
		$fbks_link_url = '';
		$fbks_link_target = '';

		if ( 'media_file' === $fbks_image_click_action ) {
			$fbks_link_url = esc_url( $fbks_main_src );
		} elseif ( 'custom_url' === $fbks_image_click_action ) {
			$fbks_custom_url = isset( $fbks_image_attrs['customUrl'] ) && is_string( $fbks_image_attrs['customUrl'] )
				? trim( $fbks_image_attrs['customUrl'] )
				: '';
			if ( '' !== $fbks_custom_url ) {
				$fbks_link_url = esc_url( $fbks_custom_url );
				$fbks_link_target = ! empty( $fbks_image_attrs['customUrlOpenInNewTab'] ) ? '_blank' : '';
			}
		} elseif ( 'page_post' === $fbks_image_click_action ) {
			$fbks_post_link_url = isset( $fbks_image_attrs['linkedPostUrl'] ) && is_string( $fbks_image_attrs['linkedPostUrl'] )
				? trim( $fbks_image_attrs['linkedPostUrl'] )
				: '';
			if ( '' !== $fbks_post_link_url ) {
				$fbks_link_url = esc_url( $fbks_post_link_url );
				$fbks_link_target = ! empty( $fbks_image_attrs['linkedPostOpenInNewTab'] ) ? '_blank' : '';
			}
		}

		$fbks_images[] = [
			'id'              => $fbks_image_id,
			'width'           => isset( $fbks_image_attrs['width'] ) ? (int) $fbks_image_attrs['width'] : 0,
			'height'          => isset( $fbks_image_attrs['height'] ) ? (int) $fbks_image_attrs['height'] : 0,
			'src'             => esc_url( $fbks_main_src ),
			'srcSet'          => $fbks_main_srcset,
			'sizes'           => $fbks_main_sizes_attr,
			'thumbSrc'        => esc_url( $fbks_thumb_src ),
			'thumbSrcSet'     => $fbks_thumb_srcset,
			'thumbSizes'      => $fbks_thumb_sizes_attr,
			'imgClass'        => $fbks_image_class,
			'fullSrc'         => esc_url( $fbks_full_src ),
			'linkUrl'         => $fbks_link_url,
			'linkTarget'      => $fbks_link_target,
			'alt'             => $fbks_alt,
			'title'           => $fbks_title,
			'caption'         => wp_kses_post( $fbks_caption ),
			'wooProductId'    => $fbks_woo_product_id,
			'wooProductName'  => $fbks_woo_product_name,
				'wooProductPrice' => $fbks_woo_product_price,
			'wooProductUrl'   => esc_url( $fbks_woo_product_url ),
			'wooLinkAction'   => $fbks_woo_link_action,
			'wooLinkActionRaw' => $fbks_woo_link_attr ?? 'inherit',
			'overrideGalleryHoverSettings' => ! empty( $fbks_image_attrs['overrideGalleryHoverSettings'] ),
			'onHoverTitle'     => ! empty( $fbks_image_attrs['showTitleOnHover'] ) || ! empty( $fbks_image_attrs['hoverTitle'] ) || ! empty( $fbks_image_attrs['onHoverTitle'] ),
			'onHoverStyle'     => isset( $fbks_image_attrs['onHoverStyle'] ) ? (string) $fbks_image_attrs['onHoverStyle'] : 'blur-overlay',
			'hoverEffect'      => isset( $fbks_image_attrs['hoverEffect'] ) ? sanitize_key( $fbks_image_attrs['hoverEffect'] ) : 'none',
			'overlayEntrance'  => isset( $fbks_image_attrs['overlayEntrance'] ) ? sanitize_key( $fbks_image_attrs['overlayEntrance'] ) : 'default',
			'overlayContent'   => isset( $fbks_image_attrs['overlayContent'] ) ? (string) $fbks_image_attrs['overlayContent'] : 'title',
			'overlayBgColor'    => fbks_sanitize_css_color_value( isset( $fbks_image_attrs['overlayBgColor'] ) ? (string) $fbks_image_attrs['overlayBgColor'] : '#f9f9f9' ),
			'overlayBgGradient' => fbks_sanitize_css_background_value( isset( $fbks_image_attrs['overlayBgGradient'] ) ? (string) $fbks_image_attrs['overlayBgGradient'] : '' ),
			'overlayTextColor' => fbks_sanitize_css_color_value( isset( $fbks_image_attrs['overlayTextColor'] ) ? (string) $fbks_image_attrs['overlayTextColor'] : '#000000' ),
			'overlayFontFamily' => fbks_sanitize_css_font_family_value( isset( $fbks_image_attrs['overlayFontFamily'] ) ? (string) $fbks_image_attrs['overlayFontFamily'] : '' ),
			'overlayFontWeight' => fbks_sanitize_css_font_weight_value( isset( $fbks_image_attrs['overlayFontWeight'] ) ? (string) $fbks_image_attrs['overlayFontWeight'] : '' ),
			'overlayFontStyle'  => fbks_sanitize_css_font_style_value( isset( $fbks_image_attrs['overlayFontStyle'] ) ? (string) $fbks_image_attrs['overlayFontStyle'] : '' ),
			'chipOverlayBgColor' => fbks_sanitize_css_background_value( isset( $fbks_image_attrs['chipOverlayBgColor'] ) ? (string) $fbks_image_attrs['chipOverlayBgColor'] : '#f9f9f9' ),
			'chipOverlayTextColor' => fbks_sanitize_css_color_value( isset( $fbks_image_attrs['chipOverlayTextColor'] ) ? (string) $fbks_image_attrs['chipOverlayTextColor'] : '#000000' ),
			'hideUnknownExifFields' => ! empty( $fbks_image_attrs['hideUnknownExifFields'] ),
			'enableWooCommerce' => ! empty( $fbks_image_attrs['enableWooCommerce'] ),
			'imageClickAction' => isset( $fbks_image_attrs['imageClickAction'] ) ? (string) $fbks_image_attrs['imageClickAction'] : '',
			'overrideGalleryClickSettings' => ! empty( $fbks_image_attrs['overrideGalleryClickSettings'] ),
			'imageClickTarget' => isset( $fbks_image_attrs['imageClickTarget'] ) ? (string) $fbks_image_attrs['imageClickTarget'] : 'icon',
			'enableDownload'   => ! empty( $fbks_image_attrs['enableDownload'] ),
			'downloadOnHover'  => isset( $fbks_image_attrs['downloadOnHover'] ) ? (bool) $fbks_image_attrs['downloadOnHover'] : true,
			'downloadIconColor' => isset( $fbks_image_attrs['downloadIconColor'] ) ? (string) $fbks_image_attrs['downloadIconColor'] : '',
			'downloadIconBgColor' => isset( $fbks_image_attrs['downloadIconBgColor'] ) ? (string) $fbks_image_attrs['downloadIconBgColor'] : '',
			'wooCartIconDisplay' => isset( $fbks_image_attrs['wooCartIconDisplay'] ) ? (string) $fbks_image_attrs['wooCartIconDisplay'] : 'hover',
			'cartIconColor'    => isset( $fbks_image_attrs['cartIconColor'] ) ? (string) $fbks_image_attrs['cartIconColor'] : '',
			'cartIconBgColor'  => isset( $fbks_image_attrs['cartIconBgColor'] ) ? (string) $fbks_image_attrs['cartIconBgColor'] : '',
			'wooDefaultLinkAction' => isset( $fbks_image_attrs['wooDefaultLinkAction'] ) ? (string) $fbks_image_attrs['wooDefaultLinkAction'] : 'add_to_cart',
			'linkIconDisplay'  => isset( $fbks_image_attrs['linkIconDisplay'] ) ? (string) $fbks_image_attrs['linkIconDisplay'] : 'hover',
			'linkIconColor'    => isset( $fbks_image_attrs['linkIconColor'] ) ? (string) $fbks_image_attrs['linkIconColor'] : '',
			'linkIconBgColor'  => isset( $fbks_image_attrs['linkIconBgColor'] ) ? (string) $fbks_image_attrs['linkIconBgColor'] : '',
			'customUrl'        => isset( $fbks_image_attrs['customUrl'] ) ? (string) $fbks_image_attrs['customUrl'] : '',
			'customUrlOpenInNewTab' => ! empty( $fbks_image_attrs['customUrlOpenInNewTab'] ),
			'linkedPostUrl'    => isset( $fbks_image_attrs['linkedPostUrl'] ) ? (string) $fbks_image_attrs['linkedPostUrl'] : '',
			'linkedPostOpenInNewTab' => ! empty( $fbks_image_attrs['linkedPostOpenInNewTab'] ),
			'lightbox'         => ! empty( $fbks_image_attrs['lightbox'] ) || ! empty( $fbks_image_attrs['enableLightbox'] ),
			'lightboxTheme'    => isset( $fbks_image_attrs['lightboxTheme'] ) ? (string) $fbks_image_attrs['lightboxTheme'] : 'inherit',
			'lightboxContent'  => isset( $fbks_image_attrs['lightboxContent'] ) ? (string) $fbks_image_attrs['lightboxContent'] : '',
			'enableLightboxSocialSharing' => ! empty( $fbks_image_attrs['enableLightboxSocialSharing'] ),
				'exifCamera'      => isset( $fbks_image_attrs['exifCamera'] ) ? (string) $fbks_image_attrs['exifCamera'] : '',
				'exifFocalLength' => isset( $fbks_image_attrs['exifFocalLength'] ) ? (string) $fbks_image_attrs['exifFocalLength'] : '',
				'exifShutterSpeed' => isset( $fbks_image_attrs['exifShutterSpeed'] ) ? (string) $fbks_image_attrs['exifShutterSpeed'] : '',
				'exifAperture'    => isset( $fbks_image_attrs['exifAperture'] ) ? (string) $fbks_image_attrs['exifAperture'] : '',
				'exifIso'         => isset( $fbks_image_attrs['exifIso'] ) ? (string) $fbks_image_attrs['exifIso'] : '',
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
		$fbks_link_url = '';
		$fbks_link_target = '';
		if ( 'media_file' === $fbks_image_click_action ) {
			$fbks_link_url = esc_url( $fbks_src );
		} elseif ( 'custom_url' === $fbks_image_click_action ) {
			$fbks_custom_url = isset( $fbks_image['customUrl'] ) && is_string( $fbks_image['customUrl'] )
				? trim( $fbks_image['customUrl'] )
				: '';
			if ( '' !== $fbks_custom_url ) {
				$fbks_link_url = esc_url( $fbks_custom_url );
				$fbks_link_target = ! empty( $fbks_image['customUrlOpenInNewTab'] ) ? '_blank' : '';
			}
		} elseif ( 'page_post' === $fbks_image_click_action ) {
			$fbks_post_link_url = isset( $fbks_image['linkedPostUrl'] ) && is_string( $fbks_image['linkedPostUrl'] )
				? trim( $fbks_image['linkedPostUrl'] )
				: '';
			if ( '' !== $fbks_post_link_url ) {
				$fbks_link_url = esc_url( $fbks_post_link_url );
				$fbks_link_target = ! empty( $fbks_image['linkedPostOpenInNewTab'] ) ? '_blank' : '';
			}
		}
		$fbks_images[] = [
			'id'              => isset( $fbks_image['id'] ) ? (int) $fbks_image['id'] : 0,
			'width'           => isset( $fbks_image['width'] ) ? (int) $fbks_image['width'] : 0,
			'height'          => isset( $fbks_image['height'] ) ? (int) $fbks_image['height'] : 0,
			'src'             => esc_url( $fbks_src ),
			'srcSet'          => '',
			'sizes'           => '',
			'thumbSrc'        => esc_url( $fbks_src ),
			'thumbSrcSet'     => '',
			'thumbSizes'      => '',
			'imgClass'        => '',
			'fullSrc'         => esc_url( $fbks_src ),
			'linkUrl'         => $fbks_link_url,
			'linkTarget'      => $fbks_link_target,
			'alt'             => isset( $fbks_image['alt'] ) ? (string) $fbks_image['alt'] : '',
			'title'           => isset( $fbks_image['title'] ) ? (string) $fbks_image['title'] : '',
			'caption'         => isset( $fbks_image['caption'] ) ? wp_kses_post( (string) $fbks_image['caption'] ) : '',
			'wooProductId'    => 0,
			'wooProductName'  => '',
				'wooProductPrice' => '',
				'wooProductUrl'   => '',
			'wooLinkAction'   => $fbks_woo_default_link_action,
			'wooLinkActionRaw' => isset( $fbks_image['wooLinkAction'] ) ? (string) $fbks_image['wooLinkAction'] : 'inherit',
			'overrideGalleryHoverSettings' => ! empty( $fbks_image['overrideGalleryHoverSettings'] ),
			'onHoverTitle'     => ! empty( $fbks_image['showTitleOnHover'] ) || ! empty( $fbks_image['hoverTitle'] ) || ! empty( $fbks_image['onHoverTitle'] ),
			'onHoverStyle'     => isset( $fbks_image['onHoverStyle'] ) ? (string) $fbks_image['onHoverStyle'] : 'blur-overlay',
			'hoverEffect'      => isset( $fbks_image['hoverEffect'] ) ? sanitize_key( $fbks_image['hoverEffect'] ) : 'none',
			'overlayEntrance'  => isset( $fbks_image['overlayEntrance'] ) ? sanitize_key( $fbks_image['overlayEntrance'] ) : 'default',
			'overlayContent'   => isset( $fbks_image['overlayContent'] ) ? (string) $fbks_image['overlayContent'] : 'title',
			'overlayBgColor'    => fbks_sanitize_css_color_value( isset( $fbks_image['overlayBgColor'] ) ? (string) $fbks_image['overlayBgColor'] : '#f9f9f9' ),
			'overlayBgGradient' => fbks_sanitize_css_background_value( isset( $fbks_image['overlayBgGradient'] ) ? (string) $fbks_image['overlayBgGradient'] : '' ),
			'overlayTextColor' => fbks_sanitize_css_color_value( isset( $fbks_image['overlayTextColor'] ) ? (string) $fbks_image['overlayTextColor'] : '#000000' ),
			'overlayFontFamily' => fbks_sanitize_css_font_family_value( isset( $fbks_image['overlayFontFamily'] ) ? (string) $fbks_image['overlayFontFamily'] : '' ),
			'overlayFontWeight' => fbks_sanitize_css_font_weight_value( isset( $fbks_image['overlayFontWeight'] ) ? (string) $fbks_image['overlayFontWeight'] : '' ),
			'overlayFontStyle'  => fbks_sanitize_css_font_style_value( isset( $fbks_image['overlayFontStyle'] ) ? (string) $fbks_image['overlayFontStyle'] : '' ),
			'chipOverlayBgColor' => fbks_sanitize_css_background_value( isset( $fbks_image['chipOverlayBgColor'] ) ? (string) $fbks_image['chipOverlayBgColor'] : '#f9f9f9' ),
			'chipOverlayTextColor' => fbks_sanitize_css_color_value( isset( $fbks_image['chipOverlayTextColor'] ) ? (string) $fbks_image['chipOverlayTextColor'] : '#000000' ),
			'hideUnknownExifFields' => ! empty( $fbks_image['hideUnknownExifFields'] ),
			'enableWooCommerce' => ! empty( $fbks_image['enableWooCommerce'] ),
			'imageClickAction' => isset( $fbks_image['imageClickAction'] ) ? (string) $fbks_image['imageClickAction'] : '',
			'overrideGalleryClickSettings' => ! empty( $fbks_image['overrideGalleryClickSettings'] ),
			'imageClickTarget' => isset( $fbks_image['imageClickTarget'] ) ? (string) $fbks_image['imageClickTarget'] : 'icon',
			'enableDownload'   => ! empty( $fbks_image['enableDownload'] ),
			'downloadOnHover'  => isset( $fbks_image['downloadOnHover'] ) ? (bool) $fbks_image['downloadOnHover'] : true,
			'downloadIconColor' => isset( $fbks_image['downloadIconColor'] ) ? (string) $fbks_image['downloadIconColor'] : '',
			'downloadIconBgColor' => isset( $fbks_image['downloadIconBgColor'] ) ? (string) $fbks_image['downloadIconBgColor'] : '',
			'wooCartIconDisplay' => isset( $fbks_image['wooCartIconDisplay'] ) ? (string) $fbks_image['wooCartIconDisplay'] : 'hover',
			'cartIconColor'    => isset( $fbks_image['cartIconColor'] ) ? (string) $fbks_image['cartIconColor'] : '',
			'cartIconBgColor'  => isset( $fbks_image['cartIconBgColor'] ) ? (string) $fbks_image['cartIconBgColor'] : '',
			'wooDefaultLinkAction' => isset( $fbks_image['wooDefaultLinkAction'] ) ? (string) $fbks_image['wooDefaultLinkAction'] : 'add_to_cart',
			'linkIconDisplay'  => isset( $fbks_image['linkIconDisplay'] ) ? (string) $fbks_image['linkIconDisplay'] : 'hover',
			'linkIconColor'    => isset( $fbks_image['linkIconColor'] ) ? (string) $fbks_image['linkIconColor'] : '',
			'linkIconBgColor'  => isset( $fbks_image['linkIconBgColor'] ) ? (string) $fbks_image['linkIconBgColor'] : '',
			'customUrl'        => isset( $fbks_image['customUrl'] ) ? (string) $fbks_image['customUrl'] : '',
			'customUrlOpenInNewTab' => ! empty( $fbks_image['customUrlOpenInNewTab'] ),
			'linkedPostUrl'    => isset( $fbks_image['linkedPostUrl'] ) ? (string) $fbks_image['linkedPostUrl'] : '',
			'linkedPostOpenInNewTab' => ! empty( $fbks_image['linkedPostOpenInNewTab'] ),
			'lightbox'         => ! empty( $fbks_image['lightbox'] ) || ! empty( $fbks_image['enableLightbox'] ),
			'lightboxTheme'    => isset( $fbks_image['lightboxTheme'] ) ? (string) $fbks_image['lightboxTheme'] : 'inherit',
			'lightboxContent'  => isset( $fbks_image['lightboxContent'] ) ? (string) $fbks_image['lightboxContent'] : '',
			'enableLightboxSocialSharing' => ! empty( $fbks_image['enableLightboxSocialSharing'] ),
				'exifCamera'      => isset( $fbks_image['exifCamera'] ) ? (string) $fbks_image['exifCamera'] : '',
				'exifFocalLength' => isset( $fbks_image['exifFocalLength'] ) ? (string) $fbks_image['exifFocalLength'] : '',
				'exifShutterSpeed' => isset( $fbks_image['exifShutterSpeed'] ) ? (string) $fbks_image['exifShutterSpeed'] : '',
				'exifAperture'    => isset( $fbks_image['exifAperture'] ) ? (string) $fbks_image['exifAperture'] : '',
				'exifIso'         => isset( $fbks_image['exifIso'] ) ? (string) $fbks_image['exifIso'] : '',
			];
	}
}

if ( $fbks_can_use_premium && $fbks_randomize_order && count( $fbks_images ) > 1 ) {
	shuffle( $fbks_images );
}

$fbks_active_image = ! empty( $fbks_images ) ? $fbks_images[0] : null;
$fbks_has_multiple_images = count( $fbks_images ) > 1;
$fbks_effective_click_action = $fbks_image_click_action;
$fbks_effective_click_target = $fbks_image_click_target;
$fbks_effective_enable_download = $fbks_enable_download;
$fbks_effective_download_on_hover = $fbks_download_on_hover;
$fbks_effective_enable_woo = $fbks_enable_woo;
$fbks_effective_woo_cart_icon_display = $fbks_woo_cart_icon_display;
$fbks_effective_woo_default_link_action = $fbks_woo_default_link_action;
$fbks_effective_link_icon_display = $fbks_link_icon_display;
$fbks_effective_download_icon_style = $fbks_download_icon_style;
$fbks_effective_cart_icon_style = $fbks_cart_icon_style;
$fbks_effective_link_icon_style = $fbks_link_icon_style;
if ( $fbks_can_use_premium && ! empty( $fbks_active_image['overrideGalleryClickSettings'] ) ) {
	$fbks_effective_click_action = sanitize_key( $fbks_active_image['imageClickAction'] ?? '' );
	$fbks_effective_click_target = in_array( $fbks_active_image['imageClickTarget'] ?? '', [ 'icon', 'thumbnail' ], true )
		? $fbks_active_image['imageClickTarget']
		: 'icon';
	$fbks_effective_enable_woo = $fbks_woo_active && ! empty( $fbks_active_image['enableWooCommerce'] ) && 'woocommerce' === $fbks_effective_click_action;
	$fbks_effective_enable_download = ! empty( $fbks_active_image['enableDownload'] ) && 'download' === $fbks_effective_click_action && ! $fbks_effective_enable_woo;
	$fbks_effective_download_on_hover = isset( $fbks_active_image['downloadOnHover'] ) ? (bool) $fbks_active_image['downloadOnHover'] : true;
	$fbks_effective_woo_cart_icon_display = in_array( $fbks_active_image['wooCartIconDisplay'] ?? '', [ 'none', 'hover', 'always' ], true ) ? $fbks_active_image['wooCartIconDisplay'] : 'hover';
	$fbks_effective_woo_default_link_action = in_array( $fbks_active_image['wooDefaultLinkAction'] ?? '', [ 'add_to_cart', 'product' ], true ) ? $fbks_active_image['wooDefaultLinkAction'] : 'add_to_cart';
	$fbks_effective_link_icon_display = in_array( $fbks_active_image['linkIconDisplay'] ?? '', [ 'none', 'hover', 'always' ], true ) ? $fbks_active_image['linkIconDisplay'] : 'hover';
	$fbks_effective_download_icon_style = '';
	$fbks_effective_cart_icon_style = '';
	$fbks_effective_link_icon_style = '';
	foreach (
		[
			[ 'downloadIconColor', '#000000', '--pb-download-icon-color:', 'download' ],
			[ 'downloadIconBgColor', '#ffffff', '--pb-download-icon-bg:', 'download' ],
			[ 'cartIconColor', '#000000', '--pb-cart-icon-color:', 'cart' ],
			[ 'cartIconBgColor', '#ffffff', '--pb-cart-icon-bg:', 'cart' ],
			[ 'linkIconColor', '#000000', '--pb-link-icon-color:', 'link' ],
			[ 'linkIconBgColor', '#ffffff', '--pb-link-icon-bg:', 'link' ],
		] as $fbks_icon_setting
	) {
		if ( $fbks_is_custom_icon_color( $fbks_active_image[ $fbks_icon_setting[0] ] ?? '', $fbks_icon_setting[1] ) ) {
			$fbks_style_value = $fbks_icon_setting[2] . $fbks_active_image[ $fbks_icon_setting[0] ] . ';';
			if ( 'download' === $fbks_icon_setting[3] ) {
				$fbks_effective_download_icon_style .= $fbks_style_value;
			} elseif ( 'cart' === $fbks_icon_setting[3] ) {
				$fbks_effective_cart_icon_style .= $fbks_style_value;
			} else {
				$fbks_effective_link_icon_style .= $fbks_style_value;
			}
		}
	}
}
$fbks_effective_on_hover_title = $fbks_on_hover_title;
$fbks_effective_overlay_content = $fbks_overlay_content;
$fbks_effective_hover_variant_class = $fbks_hover_variant_class;
$fbks_effective_hover_effect_class = $fbks_hover_effect_class;
$fbks_effective_overlay_entrance_class = $fbks_overlay_entrance_class;
$fbks_effective_hover_style = $fbks_hover_style;
$fbks_effective_hide_unknown_exif = $fbks_hide_unknown_exif;
$fbks_effective_hover_woo = $fbks_enable_woo;
if ( $fbks_can_use_premium && ! empty( $fbks_active_image['overrideGalleryHoverSettings'] ) ) {
	$fbks_effective_on_hover_title = ! empty( $fbks_active_image['onHoverTitle'] );
	$fbks_effective_overlay_content = isset( $fbks_active_image['overlayContent'] ) ? (string) $fbks_active_image['overlayContent'] : 'title';
	$fbks_effective_hover_style_key = isset( $fbks_active_image['onHoverStyle'] ) ? (string) $fbks_active_image['onHoverStyle'] : 'blur-overlay';
	$fbks_effective_hover_variant_class = $fbks_hover_class_map[ $fbks_effective_hover_style_key ] ?? 'pb-hover-blur-overlay';
	$fbks_effective_hover_effect_key = isset( $fbks_active_image['hoverEffect'] ) ? sanitize_key( $fbks_active_image['hoverEffect'] ) : 'none';
	$fbks_effective_hover_effect_class = $fbks_hover_effect_class_map[ $fbks_effective_hover_effect_key ] ?? '';
	$fbks_effective_overlay_entrance_key = isset( $fbks_active_image['overlayEntrance'] ) ? sanitize_key( $fbks_active_image['overlayEntrance'] ) : 'default';
	$fbks_effective_overlay_entrance_class = $fbks_overlay_entrance_class_map[ $fbks_effective_overlay_entrance_key ] ?? '';
	$fbks_effective_hide_unknown_exif = ! empty( $fbks_active_image['hideUnknownExifFields'] );
	$fbks_effective_hover_woo = $fbks_woo_active &&
		! empty( $fbks_active_image['enableWooCommerce'] ) &&
		( '' === (string) ( $fbks_active_image['imageClickAction'] ?? '' ) || 'woocommerce' === (string) $fbks_active_image['imageClickAction'] );
	$fbks_effective_hover_style = '';
	$fbks_overlay_font_family = fbks_sanitize_css_font_family_value( (string) ( $fbks_active_image['overlayFontFamily'] ?? '' ) );
	$fbks_overlay_font_weight = fbks_sanitize_css_font_weight_value( (string) ( $fbks_active_image['overlayFontWeight'] ?? '' ) );
	$fbks_overlay_font_style = fbks_sanitize_css_font_style_value( (string) ( $fbks_active_image['overlayFontStyle'] ?? '' ) );
	$fbks_effective_hover_style .= $fbks_overlay_font_family ? '--pb-overlay-font-family:' . $fbks_overlay_font_family . ';' : '';
	$fbks_effective_hover_style .= $fbks_overlay_font_weight ? '--pb-overlay-font-weight:' . $fbks_overlay_font_weight . ';' : '';
	$fbks_effective_hover_style .= $fbks_overlay_font_style ? '--pb-overlay-font-style:' . $fbks_overlay_font_style . ';' : '';
	if ( 'color-overlay' === $fbks_effective_hover_style_key ) {
		$fbks_overlay_bg = fbks_sanitize_css_color_value( (string) ( $fbks_active_image['overlayBgColor'] ?? '#f9f9f9' ) );
		$fbks_overlay_text = fbks_sanitize_css_color_value( (string) ( $fbks_active_image['overlayTextColor'] ?? '#000000' ) );
		$fbks_effective_hover_style .= $fbks_overlay_bg ? '--pb-overlay-bg:' . $fbks_overlay_bg . ';' : '';
		$fbks_effective_hover_style .= $fbks_overlay_text ? '--pb-overlay-color:' . $fbks_overlay_text . ';' : '';
	} elseif ( 'gradient-overlay' === $fbks_effective_hover_style_key ) {
		$fbks_overlay_bg = fbks_sanitize_css_background_value( (string) ( $fbks_active_image['overlayBgGradient'] ?? '' ) );
		$fbks_overlay_text = fbks_sanitize_css_color_value( (string) ( $fbks_active_image['overlayTextColor'] ?? '#000000' ) );
		$fbks_effective_hover_style .= $fbks_overlay_bg ? '--pb-overlay-bg:' . $fbks_overlay_bg . ';' : '';
		$fbks_effective_hover_style .= $fbks_overlay_text ? '--pb-overlay-color:' . $fbks_overlay_text . ';' : '';
	} elseif ( 'chip' === $fbks_effective_hover_style_key ) {
		$fbks_chip_overlay_bg = fbks_sanitize_css_background_value( (string) ( $fbks_active_image['chipOverlayBgColor'] ?? '#f9f9f9' ) );
		$fbks_chip_overlay_text = fbks_sanitize_css_color_value( (string) ( $fbks_active_image['chipOverlayTextColor'] ?? '#000000' ) );
		$fbks_effective_hover_style .= $fbks_chip_overlay_bg ? '--pb-chip-overlay-bg:' . $fbks_chip_overlay_bg . ';' : '';
		$fbks_effective_hover_style .= $fbks_chip_overlay_text ? '--pb-chip-overlay-color:' . $fbks_chip_overlay_text . ';' : '';
	}
}
if ( 'product' === $fbks_effective_overlay_content && ! $fbks_effective_hover_woo ) {
	$fbks_effective_overlay_content = 'title';
}

$fbks_overlay_html = '';
if ( $fbks_can_use_premium ) {
	if ( $fbks_effective_on_hover_title && is_array( $fbks_active_image ) ) {
		$fbks_has_hover_title = '' !== trim( (string) ( $fbks_active_image['title'] ?? '' ) );
		$fbks_has_hover_caption = '' !== trim( wp_strip_all_tags( (string) ( $fbks_active_image['caption'] ?? '' ) ) );
		$fbks_has_product = (int) ( $fbks_active_image['wooProductId'] ?? 0 ) > 0;

		if ( $fbks_effective_hover_woo && 'product' === $fbks_effective_overlay_content && $fbks_has_product ) {
			$fbks_product_name = (string) ( $fbks_active_image['wooProductName'] ?? '' );
			$fbks_product_price = (string) ( $fbks_active_image['wooProductPrice'] ?? '' );

			if ( '' !== $fbks_product_name ) {
				$fbks_overlay_html .= '<div class="pb-product-name">' . esc_html( $fbks_product_name ) . '</div>';
			}
			if ( '' !== $fbks_product_price ) {
				$fbks_overlay_html .= '<div class="pb-product-price">' . wp_kses_post( $fbks_product_price ) . '</div>';
			}
		}

			if ( '' === $fbks_overlay_html && 'caption' === $fbks_effective_overlay_content && $fbks_has_hover_caption ) {
				$fbks_overlay_html = wp_kses_post( (string) $fbks_active_image['caption'] );
			}

			if ( '' === $fbks_overlay_html && 'exif' === $fbks_effective_overlay_content ) {
				$fbks_overlay_html = $fbks_get_overlay_exif( $fbks_active_image, $fbks_effective_hide_unknown_exif );
			}

			if ( '' === $fbks_overlay_html && 'title' === $fbks_effective_overlay_content && $fbks_has_hover_title ) {
				$fbks_overlay_html = esc_html( (string) $fbks_active_image['title'] );
			}
	}
}

$fbks_wrapper_args = [
	'class' => 'pb-filmstrip-gallery is-' . $fbks_position . ' is-theme-' . $fbks_color_mode,
];
if ( $fbks_can_use_premium ) {
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
		'randomizeOrder'         => $fbks_randomize_order,
		'enableFullscreen'       => $fbks_enable_fullscreen,
		'enableWooCommerce'      => $fbks_enable_woo,
		'wooCartIconDisplay'     => $fbks_woo_cart_icon_display,
		'wooDefaultLinkAction'   => $fbks_woo_default_link_action,
		'wooProductPriceOnHover' => $fbks_woo_hover_info,
		'overlayContent'         => $fbks_overlay_content,
		'enableSocialSharing'    => $fbks_social_sharing_enabled,
		'socialSharingSources'   => $fbks_social_sources,
		'hideUnknownExifFields' => $fbks_hide_unknown_exif,
		'onHoverStyle'           => $attributes['onHoverStyle'] ?? 'blur-overlay',
		'hoverEffect'            => sanitize_key( $attributes['hoverEffect'] ?? 'none' ),
		'overlayEntrance'        => sanitize_key( $attributes['overlayEntrance'] ?? 'default' ),
		'overlayBgColor'         => fbks_sanitize_css_color_value( (string) ( $attributes['overlayBgColor'] ?? '#f9f9f9' ) ),
		'overlayBgGradient'      => fbks_sanitize_css_background_value( (string) ( $attributes['overlayBgGradient'] ?? '' ) ),
		'overlayTextColor'       => fbks_sanitize_css_color_value( (string) ( $attributes['overlayTextColor'] ?? '#000000' ) ),
		'overlayFontFamily'      => fbks_sanitize_css_font_family_value( (string) ( $attributes['overlayFontFamily'] ?? '' ) ),
		'overlayFontWeight'      => fbks_sanitize_css_font_weight_value( (string) ( $attributes['overlayFontWeight'] ?? '' ) ),
		'overlayFontStyle'       => fbks_sanitize_css_font_style_value( (string) ( $attributes['overlayFontStyle'] ?? '' ) ),
		'chipOverlayBgColor'     => fbks_sanitize_css_background_value( (string) ( $attributes['chipOverlayBgColor'] ?? '#f9f9f9' ) ),
		'chipOverlayTextColor'   => fbks_sanitize_css_color_value( (string) ( $attributes['chipOverlayTextColor'] ?? '#000000' ) ),
		'enableDownload'         => $fbks_enable_download,
		'downloadOnHover'        => $fbks_download_on_hover,
		'downloadIconColor'      => $attributes['downloadIconColor'] ?? '',
		'downloadIconBgColor'    => $attributes['downloadIconBgColor'] ?? '',
		'cartIconColor'          => $attributes['cartIconColor'] ?? '',
		'cartIconBgColor'        => $attributes['cartIconBgColor'] ?? '',
		'linkIconColor'          => $attributes['linkIconColor'] ?? '',
		'linkIconBgColor'        => $attributes['linkIconBgColor'] ?? '',
		'imageClickAction'       => $fbks_image_click_action,
		'imageClickTarget'       => $fbks_image_click_target,
		'lightbox'               => ! empty( $attributes['lightbox'] ),
		'lightboxTheme'          => $attributes['lightboxTheme'] ?? 'dark',
		'lightboxContent'        => $attributes['lightboxContent'] ?? '',
		'enableLightboxSocialSharing' => ! empty( $attributes['enableLightboxSocialSharing'] ),
		'linkIconDisplay'        => $fbks_link_icon_display,
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

			<?php if ( $fbks_can_use_premium ) : ?>
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
				<?php endif; ?>

				<?php $fbks_active_image_ratio = ! empty( $fbks_active_image['width'] ) && ! empty( $fbks_active_image['height'] ) ? (float) $fbks_active_image['width'] / (float) $fbks_active_image['height'] : 1; ?>
				<div class="pb-filmstrip-gallery-main-media pb-image-block <?php echo esc_attr( $fbks_effective_on_hover_title ? $fbks_effective_hover_variant_class : '' ); ?> <?php echo esc_attr( $fbks_effective_on_hover_title ? $fbks_effective_overlay_entrance_class : '' ); ?> <?php echo esc_attr( $fbks_effective_hover_effect_class ); ?>" style="--pb-filmstrip-image-ratio: <?php echo esc_attr( $fbks_active_image_ratio ); ?>;<?php echo esc_attr( $fbks_effective_hover_style ); ?>">
				<?php if ( $fbks_can_use_premium ) : ?>
					<?php
					$fbks_active_product_id = (int) ( $fbks_active_image['wooProductId'] ?? 0 );
					$fbks_active_woo_action_raw = (string) ( $fbks_active_image['wooLinkActionRaw'] ?? 'inherit' );
					$fbks_active_woo_action = in_array( $fbks_active_woo_action_raw, [ 'add_to_cart', 'product' ], true ) ? $fbks_active_woo_action_raw : $fbks_effective_woo_default_link_action;
					$fbks_active_product_url = (string) ( $fbks_active_image['wooProductUrl'] ?? '' );
					$fbks_show_cart_icon = 'woocommerce' === $fbks_effective_click_action && $fbks_effective_enable_woo && 'none' !== $fbks_effective_woo_cart_icon_display && $fbks_active_product_id > 0;
					$fbks_show_download_icon = 'download' === $fbks_effective_click_action && 'icon' === $fbks_effective_click_target && $fbks_effective_enable_download;
					$fbks_show_link_icon = in_array( $fbks_effective_click_action, [ 'custom_url', 'page_post' ], true ) && 'none' !== $fbks_effective_link_icon_display;
					$fbks_active_icon_link_url = '';
					$fbks_active_icon_link_target = '';
					if ( 'custom_url' === $fbks_effective_click_action ) {
						$fbks_active_icon_link_url = ! empty( $fbks_active_image['overrideGalleryClickSettings'] ) ? (string) ( $fbks_active_image['customUrl'] ?? '' ) : (string) ( $fbks_active_image['linkUrl'] ?? '' );
						$fbks_active_icon_link_target = ! empty( $fbks_active_image['overrideGalleryClickSettings'] ) && ! empty( $fbks_active_image['customUrlOpenInNewTab'] ) ? '_blank' : (string) ( $fbks_active_image['linkTarget'] ?? '' );
					} elseif ( 'page_post' === $fbks_effective_click_action ) {
						$fbks_active_icon_link_url = ! empty( $fbks_active_image['overrideGalleryClickSettings'] ) ? (string) ( $fbks_active_image['linkedPostUrl'] ?? '' ) : (string) ( $fbks_active_image['linkUrl'] ?? '' );
						$fbks_active_icon_link_target = ! empty( $fbks_active_image['overrideGalleryClickSettings'] ) && ! empty( $fbks_active_image['linkedPostOpenInNewTab'] ) ? '_blank' : (string) ( $fbks_active_image['linkTarget'] ?? '' );
					}
					?>
					<button
						type="button"
						class="pb-add-to-cart-icon <?php echo 'hover' === $fbks_effective_woo_cart_icon_display ? 'hover-only' : ''; ?>"
						data-woo-action="<?php echo esc_attr( $fbks_active_woo_action ); ?>"
						data-product-id="<?php echo esc_attr( $fbks_active_product_id ); ?>"
						<?php if ( '' !== $fbks_active_product_url ) : ?>
							data-product-url="<?php echo esc_url( $fbks_active_product_url ); ?>"
						<?php endif; ?>
						<?php if ( '' !== $fbks_effective_cart_icon_style ) : ?>
							style="<?php echo esc_attr( $fbks_effective_cart_icon_style ); ?>"
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
					<button
						class="pb-image-block-download <?php echo $fbks_effective_download_on_hover ? 'hover-only' : ''; ?>"
						<?php if ( '' !== $fbks_effective_download_icon_style ) : ?>
							style="<?php echo esc_attr( $fbks_effective_download_icon_style ); ?>"
						<?php endif; ?>
						<?php if ( ! $fbks_show_download_icon ) : ?>hidden<?php endif; ?>
						aria-label="<?php esc_attr_e( 'Download Image', 'folioblocks' ); ?>"
						data-full-src="<?php echo esc_url( (string) ( $fbks_active_image['fullSrc'] ?? '' ) ); ?>"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
							<path d="M18 11.3l-1-1.1-4 4V3h-1.5v11.3L7 10.2l-1 1.1 6.2 5.8 5.8-5.8zm.5 3.7v3.5h-13V15H4v5h16v-5h-1.5z" fill="currentColor"></path>
						</svg>
					</button>
					<a
						class="pb-image-block-link-icon <?php echo 'hover' === $fbks_effective_link_icon_display ? 'hover-only' : ''; ?>"
						<?php if ( $fbks_show_link_icon && '' !== $fbks_active_icon_link_url ) : ?>
							href="<?php echo esc_url( $fbks_active_icon_link_url ); ?>"
						<?php else : ?>
							hidden
						<?php endif; ?>
						<?php if ( '_blank' === $fbks_active_icon_link_target ) : ?>
							target="_blank"
							rel="noopener noreferrer"
						<?php endif; ?>
						<?php if ( '' !== $fbks_effective_link_icon_style ) : ?>
							style="<?php echo esc_attr( $fbks_effective_link_icon_style ); ?>"
						<?php endif; ?>
						aria-label="<?php esc_attr_e( 'Open Link', 'folioblocks' ); ?>"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
							<path d="M10 17.389H8.444A5.194 5.194 0 1 1 8.444 7H10v1.5H8.444a3.694 3.694 0 0 0 0 7.389H10v1.5ZM14 7h1.556a5.194 5.194 0 0 1 0 10.39H14v-1.5h1.556a3.694 3.694 0 0 0 0-7.39H14V7Zm-4.5 6h5v-1.5h-5V13Z"></path>
						</svg>
					</a>
			<?php endif; ?>

			<?php if ( ! empty( $fbks_active_image ) ) : ?>
				<?php $fbks_active_link_url = ! empty( $fbks_active_image['overrideGalleryClickSettings'] ) ? '' : (string) ( $fbks_active_image['linkUrl'] ?? '' ); ?>
				<?php $fbks_active_link_target = ! empty( $fbks_active_image['overrideGalleryClickSettings'] ) ? '' : (string) ( $fbks_active_image['linkTarget'] ?? '' ); ?>
				<?php $fbks_active_link_class = 'pb-filmstrip-gallery-main-link'; ?>
				<?php $fbks_active_link_attrs = ''; ?>
				<?php $fbks_active_link_download = false; ?>
				<?php if ( ! empty( $fbks_active_image['overrideGalleryClickSettings'] ) && 'media_file' === $fbks_effective_click_action ) : ?>
					<?php $fbks_active_link_url = (string) ( $fbks_active_image['fullSrc'] ?? $fbks_active_image['src'] ?? '' ); ?>
				<?php elseif ( ! empty( $fbks_active_image['overrideGalleryClickSettings'] ) && 'custom_url' === $fbks_effective_click_action ) : ?>
					<?php $fbks_active_link_url = (string) ( $fbks_active_image['customUrl'] ?? '' ); ?>
					<?php $fbks_active_link_target = ! empty( $fbks_active_image['customUrlOpenInNewTab'] ) ? '_blank' : ''; ?>
				<?php elseif ( ! empty( $fbks_active_image['overrideGalleryClickSettings'] ) && 'page_post' === $fbks_effective_click_action ) : ?>
					<?php $fbks_active_link_url = (string) ( $fbks_active_image['linkedPostUrl'] ?? '' ); ?>
					<?php $fbks_active_link_target = ! empty( $fbks_active_image['linkedPostOpenInNewTab'] ) ? '_blank' : ''; ?>
				<?php endif; ?>
				<?php if ( 'media_file' !== $fbks_effective_click_action && ( 'thumbnail' !== $fbks_effective_click_target || ! in_array( $fbks_effective_click_action, [ 'custom_url', 'page_post' ], true ) ) ) : ?>
					<?php $fbks_active_link_url = ''; ?>
					<?php $fbks_active_link_target = ''; ?>
				<?php endif; ?>
				<?php if ( 'download' === $fbks_effective_click_action && 'thumbnail' === $fbks_effective_click_target && $fbks_effective_enable_download ) : ?>
					<?php $fbks_active_link_url = (string) ( $fbks_active_image['fullSrc'] ?? $fbks_active_image['src'] ?? '' ); ?>
					<?php $fbks_active_link_download = true; ?>
				<?php elseif ( 'woocommerce' === $fbks_effective_click_action && 'thumbnail' === $fbks_effective_click_target && $fbks_effective_enable_woo ) : ?>
					<?php
					$fbks_active_product_id = (int) ( $fbks_active_image['wooProductId'] ?? 0 );
					$fbks_active_woo_action_raw = (string) ( $fbks_active_image['wooLinkActionRaw'] ?? 'inherit' );
					$fbks_active_woo_action = in_array( $fbks_active_woo_action_raw, [ 'add_to_cart', 'product' ], true ) ? $fbks_active_woo_action_raw : $fbks_effective_woo_default_link_action;
					$fbks_active_product_url = (string) ( $fbks_active_image['wooProductUrl'] ?? '' );
					if ( $fbks_active_product_id > 0 ) {
						if ( 'product' === $fbks_active_woo_action && '' !== $fbks_active_product_url ) {
							$fbks_active_link_url = $fbks_active_product_url;
						} else {
							$fbks_active_link_url = esc_url( add_query_arg( 'add-to-cart', $fbks_active_product_id, remove_query_arg( 'add-to-cart' ) ) );
							$fbks_active_link_class .= ' pb-add-to-cart-thumbnail';
							$fbks_active_link_attrs .= ' data-woo-action="add_to_cart" data-product-id="' . esc_attr( $fbks_active_product_id ) . '"';
							if ( '' !== $fbks_active_product_url ) {
								$fbks_active_link_attrs .= ' data-product-url="' . esc_url( $fbks_active_product_url ) . '"';
							}
						}
					}
					?>
				<?php endif; ?>
					<a
						class="<?php echo esc_attr( $fbks_active_link_class ); ?>"
						<?php if ( '' !== $fbks_active_link_url ) : ?>
							href="<?php echo esc_url( $fbks_active_link_url ); ?>"
						<?php endif; ?>
						<?php if ( '_blank' === $fbks_active_link_target ) : ?>
							target="_blank"
							rel="noopener noreferrer"
						<?php endif; ?>
						<?php if ( $fbks_active_link_download ) : ?>
							download
						<?php endif; ?>
						<?php echo $fbks_active_link_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					>
					<img
						class="pb-filmstrip-gallery-main-image pb-image-block-img <?php echo esc_attr( (string) ( $fbks_active_image['imgClass'] ?? '' ) ); ?>"
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
					</a>
				<div
					class="pb-image-block-title-container"
					<?php if ( '' === $fbks_overlay_html ) : ?>
						style="display:none;"
					<?php endif; ?>
				>
						<figcaption class="pb-image-block-title">
							<?php echo $fbks_overlay_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Markup is assembled from escaped values above. ?>
						</figcaption>
				</div>
			<?php else : ?>
					<div class="pb-filmstrip-gallery-main-empty">
						<?php esc_html_e( 'Select an image to preview it.', 'folioblocks' ); ?>
					</div>
				<?php endif; ?>
				</div>
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
			<?php echo wp_kses( $content, fbks_get_allowed_post_html_with_svg() ); ?>
		</div>
	</div>
</div>
