<?php

/**
 * PB Video Block
 * Render PHP
 **/

if (! defined('ABSPATH')) {
	exit;
}
// Runtime check — ensure WooCommerce output only if plugin is active
if (! function_exists('is_plugin_active')) {
	include_once ABSPATH . 'wp-admin/includes/plugin.php';
}
$fbks_context = $block->context ?? [];

$fbks_thumbnail = esc_url($attributes['thumbnail'] ?? '');
$fbks_title = esc_html($attributes['title'] ?? '');
$fbks_video_url = esc_url($attributes['videoUrl'] ?? '');
$fbks_aspect = esc_attr($attributes['aspectRatio'] ?? '16:9');
$fbks_play_visibility = esc_attr($attributes['playButtonVisibility'] ?? 'always');
$fbks_title_visibility = esc_attr($attributes['titleVisibility'] ?? 'always');
$fbks_overlay_style = 'default';
$fbks_overlay_bg_color = '';
$fbks_overlay_text_color = '';
$fbks_has_color_overlay = false;
$fbks_has_blur_overlay = false;
$fbks_filter_categories = [];
if (! empty($attributes['filterCategories']) && is_array($attributes['filterCategories'])) {
	foreach ($attributes['filterCategories'] as $fbks_category) {
		$fbks_category = is_string($fbks_category) ? trim($fbks_category) : '';
		if ($fbks_category !== '') {
			$fbks_filter_categories[] = $fbks_category;
		}
	}
	$fbks_filter_categories = array_values(array_unique($fbks_filter_categories));
}
if (empty($fbks_filter_categories) && ! empty($attributes['filterCategory']) && is_string($attributes['filterCategory'])) {
	$fbks_legacy_filter_category = trim($attributes['filterCategory']);
	if ($fbks_legacy_filter_category !== '') {
		$fbks_filter_categories = [$fbks_legacy_filter_category];
	}
}
$fbks_filter_category = $fbks_filter_categories[0] ?? '';
$fbks_filter_categories_attr = implode(',', $fbks_filter_categories);

$fbks_woo_product_name        = '';
$fbks_woo_product_price       = '';
$fbks_woo_product_description = '';
$fbks_woo_product_url         = '';

$fbks_style = '';
$fbks_drop_shadow = false;
$fbks_cart_button_style_vars = '';
$fbks_lazy_load = false;
$fbks_border_color = '';
$fbks_border_width = 0;
$fbks_border_radius = 0;
$fbks_woo_active = false;
$fbks_enable_woo = false;

if (fbks_fs()->can_use_premium_code__premium_only()) {
	$fbks_border_color = esc_attr($attributes['borderColor'] ?? '');
	$fbks_border_width = absint($attributes['borderWidth'] ?? 0);
	$fbks_border_radius = absint($attributes['borderRadius'] ?? 0);
	$fbks_drop_shadow = ! empty($attributes['dropShadow']);
	$fbks_lazy_load = ! empty($attributes['lazyLoad']);
	$fbks_overlay_style = $fbks_context['folioBlocks/overlayStyle'] ?? ($attributes['overlayStyle'] ?? 'default');
	$fbks_overlay_bg_color = $fbks_context['folioBlocks/overlayBgColor'] ?? ($attributes['overlayBgColor'] ?? '');
	$fbks_overlay_text_color = $fbks_context['folioBlocks/overlayTextColor'] ?? ($attributes['overlayTextColor'] ?? '');

	$fbks_woo_active = is_plugin_active('woocommerce/woocommerce.php');
	$fbks_enable_woo = ($fbks_context['folioBlocks/enableWooCommerce'] ?? ($attributes['enableWooCommerce'] ?? false)) && $fbks_woo_active;

	// Cart icon styles (context wins when inside Video Gallery; fallback to block attributes when standalone)
	$fbks_cart_icon_color = $fbks_context['folioBlocks/cartIconColor'] ?? ($attributes['cartIconColor'] ?? '');
	$fbks_cart_icon_bg    = $fbks_context['folioBlocks/cartIconBgColor'] ?? ($attributes['cartIconBgColor'] ?? '');

	$fbks_cart_button_style_vars = '';
	if ($fbks_cart_icon_color !== '') {
		$fbks_cart_button_style_vars .= '--pb-cart-icon-color:' . $fbks_cart_icon_color . ';';
	}
	if ($fbks_cart_icon_bg !== '') {
		$fbks_cart_button_style_vars .= '--pb-cart-icon-bg:' . $fbks_cart_icon_bg . ';';
	}

	// Per-block WooCommerce product info resets
	$fbks_woo_product_name = $attributes['wooProductName'] ?? '';
	$fbks_woo_product_price = $attributes['wooProductPrice'] ?? '';
	$fbks_woo_product_description = $attributes['wooProductDescription'] ?? '';
	$fbks_woo_product_url = $attributes['wooProductURL'] ?? '';

	// Build style string for border and radius
	$fbks_style = '';
	if ($fbks_border_width > 0) {
		$fbks_style .= "border-width: {$fbks_border_width}px; border-style: solid;";
		if ($fbks_border_color) {
			$fbks_style .= "border-color: {$fbks_border_color};";
		}
	}
	if ($fbks_border_radius > 0) {
		$fbks_style .= "border-radius: {$fbks_border_radius}px;";
	}
}
// Only bail if no video URL exists
if (! $fbks_video_url) {
	return '';
}

// Render placeholder if thumbnail is missing
if (! $fbks_thumbnail) {
	$fbks_thumbnail_html = '<div class="pb-video-placeholder" aria-hidden="true">
		<h3 class="pb-video-missing">Thumbnail Missing</h3>
	</div>';
} else {
	$fbks_thumbnail_html = wp_get_attachment_image(
		$attributes['thumbnailId'] ?? 0,
		'full',
		false,
		[
			'alt'   => $fbks_title,
			'class' => 'pb-video-block-img',
			'loading' => $fbks_lazy_load ? 'lazy' : 'eager'
		]
	);
}
// Determine layout classes and structure
$fbks_layout = $attributes['lightboxLayout'] ?? 'video-only';
$fbks_layout_class = '';
if ($fbks_layout === 'split') {
	$fbks_layout_class = 'split-layout';
} elseif ($fbks_layout === 'video-product') {
	$fbks_layout_class = 'video-product-layout';
}

if (fbks_fs()->can_use_premium_code__premium_only()) {
	$fbks_combined_visibility = ('hidden' === $fbks_title_visibility && 'hidden' !== $fbks_play_visibility)
		? $fbks_play_visibility
		: $fbks_title_visibility;
	$fbks_has_color_overlay = ('color' === $fbks_overlay_style && 'onHover' === $fbks_combined_visibility);
	$fbks_has_blur_overlay = ('blur' === $fbks_overlay_style && 'onHover' === $fbks_combined_visibility);
	if ($fbks_has_color_overlay) {
		if ('' !== $fbks_overlay_bg_color) {
			$fbks_style .= '--pb-video-overlay-bg:' . $fbks_overlay_bg_color . ';';
		}
		if ('' !== $fbks_overlay_text_color) {
			$fbks_style .= '--pb-video-overlay-text:' . $fbks_overlay_text_color . ';';
		}
	}
}
$fbks_lightbox_id = uniqid('pbv_', false);
$fbks_lightbox_dom_id = 'pb-video-lightbox-' . $fbks_lightbox_id;
if ($fbks_title) {
	/* translators: %1$s: Video title. */
	$fbks_play_label = sprintf(__('Play video: %1$s', 'folioblocks'), $fbks_title);
	/* translators: %1$s: Video title. */
	$fbks_lightbox_aria_label = sprintf(__('Video: %1$s', 'folioblocks'), $fbks_title);
} else {
	$fbks_play_label = __('Play video', 'folioblocks');
	$fbks_lightbox_aria_label = __('Video lightbox', 'folioblocks');
}
?>

<div <?php echo wp_kses_post(get_block_wrapper_attributes()); ?>>
	<?php
	$fbks_overlay_class = '';
	if ($fbks_play_visibility === 'always' || $fbks_title_visibility === 'always') {
		$fbks_overlay_class = ' has-overlay-always';
	} elseif ($fbks_play_visibility === 'onHover' || $fbks_title_visibility === 'onHover') {
		$fbks_overlay_class = ' has-overlay-hover';
	}
	?>
	<div class="pb-video-block aspect-<?php echo esc_attr(str_replace(':', '-', $fbks_aspect)); ?><?php echo esc_attr($fbks_overlay_class); ?>
		<?php if ($fbks_has_color_overlay) {
			echo ' has-color-overlay';
		} ?><?php if ($fbks_has_blur_overlay) {
				echo ' has-blur-overlay';
			} ?><?php if (fbks_fs()->can_use_premium_code__premium_only()) {
					echo $fbks_drop_shadow ? ' drop-shadow' : '';
				} ?>"
		role="button"
		tabindex="0"
		aria-label="<?php echo esc_attr($fbks_play_label); ?>"
		aria-haspopup="dialog"
		aria-controls="<?php echo esc_attr($fbks_lightbox_dom_id); ?>"
		aria-expanded="false"
		<?php if (! empty($fbks_filter_categories_attr)) : ?>
		data-filters="<?php echo esc_attr($fbks_filter_categories_attr); ?>"
		<?php endif; ?>
		<?php if (! empty($fbks_filter_category)) : ?>
		data-filter="<?php echo esc_attr($fbks_filter_category); ?>"
		<?php endif; ?>
		data-video-url="<?php echo esc_url($fbks_video_url); ?>"
		data-lbx="<?php echo esc_attr($fbks_lightbox_id); ?>"
		<?php if (fbks_fs()->can_use_premium_code__premium_only() && ! empty($attributes['disableRightClick'])) : ?>
		data-disable-right-click="true"
		<?php endif; ?>
		style="<?php echo esc_attr($fbks_style); ?>">

		<?php echo wp_kses_post($fbks_thumbnail_html); ?>

		<div class="video-overlay">
			<div class="overlay-content">
				<?php if ($fbks_title && $fbks_title_visibility !== 'hidden') : ?>
					<div class="video-title-overlay <?php echo esc_attr($fbks_title_visibility); ?>"><?php echo esc_html($fbks_title); ?></div>
				<?php endif; ?>
				<?php if ($fbks_play_visibility !== 'hidden') : ?>
					<div class="video-play-button <?php echo esc_attr($fbks_play_visibility); ?>">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
							<path d="M8 5.5v13l11-6.5-11-6.5z" />
						</svg>
					</div>
				<?php endif; ?>
			</div>
		</div>

		<?php
		if (fbks_fs()->can_use_premium_code__premium_only()) :
			if ($fbks_enable_woo && ! empty($attributes['wooProductId'])) :
				$fbks_woo_cart_icon_display = $fbks_context['folioBlocks/wooCartIconDisplay'] ?? 'always';
				$fbks_product_id = absint($attributes['wooProductId']);
		?>
				<a
					href="<?php echo esc_url('?add-to-cart=' . $fbks_product_id); ?>"
					class="pb-video-add-to-cart <?php echo $fbks_woo_cart_icon_display === 'hover' ? 'hover-only' : 'always'; ?>"
					data-product_id="<?php echo esc_attr($fbks_product_id); ?>"
					style="top: calc(10px + max(<?php echo esc_attr($fbks_border_width); ?>px, <?php echo esc_attr($fbks_border_radius); ?>px * 0.15)); right: calc(10px + max(<?php echo esc_attr($fbks_border_width); ?>px, <?php echo esc_attr($fbks_border_radius); ?>px * 0.30));<?php echo $fbks_cart_button_style_vars !== '' ? ' ' . esc_attr($fbks_cart_button_style_vars) : ''; ?>">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="24" height="24">
						<g transform="scale(0.75)">
							<circle cx="12.6667" cy="24.6667" r="2" fill="currentColor"></circle>
							<circle cx="23.3333" cy="24.6667" r="2" fill="currentColor"></circle>
							<path d="M9.28491 10.0356C9.47481 9.80216 9.75971 9.66667 10.0606 9.66667H25.3333C25.6232 9.66667 25.8989 9.79247 26.0888 10.0115C26.2787 10.2305 26.3643 10.5211 26.3233 10.8081L24.99 20.1414C24.9196 20.6341 24.4977 21 24 21H12C11.5261 21 11.1173 20.6674 11.0209 20.2034L9.08153 10.8701C9.02031 10.5755 9.09501 10.269 9.28491 10.0356ZM11.2898 11.6667L12.8136 19H23.1327L24.1803 11.6667H11.2898Z" fill="currentColor"></path>
							<path d="M5.66669 6.66667C5.66669 6.11438 6.1144 5.66667 6.66669 5.66667H9.33335C9.81664 5.66667 10.2308 6.01229 10.3172 6.48778L11.0445 10.4878C11.1433 11.0312 10.7829 11.5517 10.2395 11.6505C9.69614 11.7493 9.17555 11.3889 9.07676 10.8456L8.49878 7.66667H6.66669C6.1144 7.66667 5.66669 7.21895 5.66669 6.66667Z" fill="currentColor"></path>
						</g>
					</svg>
				</a>
		<?php
			endif;
		endif;
		?>
	</div>
	<!-- Lightbox Markup -->
	<div id="<?php echo esc_attr($fbks_lightbox_dom_id); ?>" class="pb-video-lightbox <?php echo esc_attr($fbks_layout_class); ?>" data-lbx="<?php echo esc_attr($fbks_lightbox_id); ?>" role="dialog" tabindex="-1" aria-modal="true" aria-hidden="true" aria-label="<?php echo esc_attr($fbks_lightbox_aria_label); ?>">
		<div class="pb-video-lightbox-inner">
			<button class="pb-video-lightbox-close" aria-label="<?php esc_attr_e('Close', 'folioblocks'); ?>">×</button>

			<?php if ($fbks_layout === 'split' || $fbks_layout === 'video-product') : ?>
				<div class="pb-video-lightbox-video" style="flex: 0 0 70%"></div>
				<div class="pb-video-lightbox-info" style="flex: 0 0 30%">
					<?php if (fbks_fs()->can_use_premium_code__premium_only()) : ?>
						<?php if ($fbks_enable_woo && $fbks_layout === 'video-product' && ($fbks_woo_product_name || $fbks_woo_product_price || $fbks_woo_product_description || $fbks_woo_product_url)) : ?>
							<div class="pb-lightbox-product-info">
								<?php if ($fbks_woo_product_name) : ?>
									<h2 class="pb-product-name"><?php echo esc_html($fbks_woo_product_name); ?></h2>
								<?php endif; ?>
								<?php if ($fbks_woo_product_price) : ?>
									<p class="pb-product-price"><?php echo wp_kses_post($fbks_woo_product_price); ?></p>
								<?php endif; ?>
								<?php if ($fbks_woo_product_description) : ?>
									<?php echo wp_kses_post($fbks_woo_product_description); ?>
								<?php endif; ?>
								<?php if ($fbks_woo_product_url) : ?>
									<a href="<?php echo esc_url($fbks_woo_product_url); ?>" class="pb-video-lightbox-product-button" target="_blank" rel="noopener noreferrer">
										<?php esc_html_e('View Product', 'folioblocks'); ?>
									</a>
								<?php endif; ?>
							</div>
						<?php else : ?>
							<?php if (! empty($fbks_title)) : ?>
								<h2 class="pb-video-lightbox-title"><?php echo esc_html($fbks_title); ?></h2>
							<?php endif; ?>
							<?php if (! empty($attributes['description'])) : ?>
								<p class="pb-video-lightbox-description"><?php echo esc_html($attributes['description']); ?></p>
							<?php endif; ?>
						<?php endif; ?>
					<?php else : ?>
						<?php if (! empty($fbks_title)) : ?>
							<h2 class="pb-video-lightbox-title"><?php echo esc_html($fbks_title); ?></h2>
						<?php endif; ?>
						<?php if (! empty($attributes['description'])) : ?>
							<p class="pb-video-lightbox-description"><?php echo esc_html($attributes['description']); ?></p>
						<?php endif; ?>
					<?php endif; ?>
				</div>
			<?php else : ?>
				<div class="pb-video-lightbox-video"></div>
			<?php endif; ?>
		</div>
	</div>
</div>
