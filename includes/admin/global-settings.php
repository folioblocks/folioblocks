<?php
if (! defined('ABSPATH')) {
	exit;
}

if (! defined('FBKS_WATERMARK_SETTINGS_OPTION')) {
	define('FBKS_WATERMARK_SETTINGS_OPTION', 'fbks_watermark_settings');
}

if (! function_exists('fbks_get_watermark_item_defaults')) {
	function fbks_get_watermark_item_defaults()
	{
		return array(
			'id'               => '',
			'name'             => '',
			'assetId'          => 0,
			'assetUrl'         => '',
			'opacity'          => 0.28,
			'size'             => 16,
			'inset'            => 4,
			'position'         => 'bottom-right',
			'repeat'           => 'no-repeat',
		);
	}
}

if (! function_exists('fbks_get_watermark_settings_defaults')) {
	function fbks_get_watermark_settings_defaults()
	{
		return array(
			'enabledByDefault'  => false,
			'defaultWatermarkId' => '',
			'items'             => array(),
		);
	}
}

if (! function_exists('fbks_sanitize_watermark_checkbox')) {
	function fbks_sanitize_watermark_checkbox($value)
	{
		return '1' === (string) $value || 1 === $value || true === $value || 'true' === $value;
	}
}

if (! function_exists('fbks_sanitize_watermark_number')) {
	function fbks_sanitize_watermark_number($value, $min, $max, $fallback)
	{
		if (! is_numeric($value)) {
			return $fallback;
		}

		return min($max, max($min, (float) $value));
	}
}

if (! function_exists('fbks_sanitize_watermark_item')) {
	function fbks_sanitize_watermark_item($item)
	{
		if (! is_array($item)) {
			return null;
		}

		$defaults = fbks_get_watermark_item_defaults();
		$item     = wp_parse_args($item, $defaults);
		$asset_id = absint($item['assetId']);
		$name     = sanitize_text_field($item['name']);

		if ('' === $name && 0 === $asset_id) {
			return null;
		}

		$id = sanitize_key($item['id']);
		if ('' === $id) {
			$id = sanitize_key(wp_generate_uuid4());
		}

		if ('' === $name) {
			$name = __('Watermark', 'folioblocks');
		}

		$asset_url = '';
		if ($asset_id > 0) {
			$asset_url = wp_get_attachment_image_url($asset_id, 'full');
		}
		if (! $asset_url && ! empty($item['assetUrl'])) {
			$asset_url = esc_url_raw($item['assetUrl']);
		}

		$positions = array('center', 'top-left', 'top-right', 'bottom-left', 'bottom-right');
		$repeats = array('no-repeat', 'repeat');

		return array(
			'id'               => $id,
			'name'             => $name,
			'assetId'          => $asset_id,
			'assetUrl'         => esc_url_raw($asset_url),
			'opacity'          => fbks_sanitize_watermark_number($item['opacity'], 0, 1, $defaults['opacity']),
			'size'             => fbks_sanitize_watermark_number($item['size'], 5, 40, $defaults['size']),
			'inset'            => fbks_sanitize_watermark_number($item['inset'], 0, 20, $defaults['inset']),
			'position'         => in_array($item['position'], $positions, true) ? $item['position'] : $defaults['position'],
			'repeat'           => in_array($item['repeat'], $repeats, true) ? $item['repeat'] : $defaults['repeat'],
		);
	}
}

if (! function_exists('fbks_sanitize_watermark_settings')) {
	function fbks_sanitize_watermark_settings($settings)
	{
		$defaults = fbks_get_watermark_settings_defaults();
		$settings = is_array($settings) ? wp_parse_args($settings, $defaults) : $defaults;
		$items = array();

		if (! empty($settings['items']) && is_array($settings['items'])) {
			foreach ($settings['items'] as $item) {
				if (! empty($item['delete'])) {
					continue;
				}

				$sanitized_item = fbks_sanitize_watermark_item($item);
				if (is_array($sanitized_item)) {
					$items[] = $sanitized_item;
				}
			}
		}

		$default_watermark_id = sanitize_key($settings['defaultWatermarkId']);
		$available_ids = wp_list_pluck($items, 'id');
		if (! in_array($default_watermark_id, $available_ids, true)) {
			$default_watermark_id = isset($items[0]['id']) ? $items[0]['id'] : '';
		}

		return array(
			'enabledByDefault'  => fbks_sanitize_watermark_checkbox($settings['enabledByDefault']),
			'defaultWatermarkId' => $default_watermark_id,
			'items'             => $items,
		);
	}
}

if (! function_exists('fbks_get_watermark_settings')) {
	function fbks_get_watermark_settings()
	{
		return fbks_sanitize_watermark_settings(get_option(FBKS_WATERMARK_SETTINGS_OPTION, array()));
	}
}

if (! function_exists('fbks_get_watermark_by_id')) {
	function fbks_get_watermark_by_id($watermark_id)
	{
		$watermark_id = sanitize_key($watermark_id);
		if ('' === $watermark_id) {
			return null;
		}

		$settings = fbks_get_watermark_settings();
		foreach ($settings['items'] as $item) {
			if ($watermark_id === $item['id'] && ! empty($item['assetUrl'])) {
				return $item;
			}
		}

		return null;
	}
}

if (! function_exists('fbks_get_watermark_css_position')) {
	function fbks_get_watermark_css_position($position)
	{
		$positions = array(
			'center'       => 'center',
			'top-left'     => 'top left',
			'top-right'    => 'top right',
			'bottom-left'  => 'bottom left',
			'bottom-right' => 'bottom right',
		);

		return isset($positions[$position]) ? $positions[$position] : $positions['bottom-right'];
	}
}

if (! function_exists('fbks_get_watermark_overlay_style')) {
	function fbks_get_watermark_overlay_style($item)
	{
		$item = wp_parse_args($item, fbks_get_watermark_item_defaults());
		if (empty($item['assetUrl'])) {
			return '';
		}
		$render_size = (float) $item['size'];

		return sprintf(
			'--pb-watermark-image:url(%1$s);--pb-watermark-opacity:%2$s;--pb-watermark-size:%3$s%%;--pb-watermark-render-size:%4$s%%;--pb-watermark-inset:%5$scqw;--pb-watermark-position:%6$s;--pb-watermark-repeat:%7$s;',
			esc_url($item['assetUrl']),
			esc_attr((string) $item['opacity']),
			esc_attr((string) $item['size']),
			esc_attr((string) $render_size),
			esc_attr((string) $item['inset']),
			esc_attr(fbks_get_watermark_css_position($item['position'])),
			esc_attr($item['repeat'])
		);
	}
}

if (! function_exists('fbks_get_watermark_overlay_data_attrs')) {
	function fbks_get_watermark_overlay_data_attrs($item)
	{
		$item = wp_parse_args($item, fbks_get_watermark_item_defaults());
		if (empty($item['assetUrl'])) {
			return '';
		}

		return sprintf(
			' data-watermark-image="%1$s" data-watermark-opacity="%2$s" data-watermark-size="%3$s" data-watermark-inset="%4$s" data-watermark-position="%5$s" data-watermark-repeat="%6$s"',
			esc_url($item['assetUrl']),
			esc_attr((string) $item['opacity']),
			esc_attr((string) $item['size']),
			esc_attr((string) $item['inset']),
			esc_attr(fbks_get_watermark_css_position($item['position'])),
			esc_attr($item['repeat'])
		);
	}
}

if (! function_exists('fbks_get_watermark_position_label')) {
	function fbks_get_watermark_position_label($position)
	{
		$labels = array(
			'center'       => __('Center', 'folioblocks'),
			'top-left'     => __('Top Left', 'folioblocks'),
			'top-right'    => __('Top Right', 'folioblocks'),
			'bottom-left'  => __('Bottom Left', 'folioblocks'),
			'bottom-right' => __('Bottom Right', 'folioblocks'),
		);

		return isset($labels[$position]) ? $labels[$position] : $labels['bottom-right'];
	}
}

if (! function_exists('fbks_get_watermark_preview_aspects')) {
	function fbks_get_watermark_preview_aspects()
	{
		return array(
			array(
				'value' => '1 / 1',
				'label' => __('Square', 'folioblocks'),
				'shape' => 'square',
			),
			array(
				'value' => '2 / 3',
				'label' => __('Portrait 2:3', 'folioblocks'),
				'shape' => 'portrait',
			),
			array(
				'value' => '3 / 4',
				'label' => __('Portrait 3:4', 'folioblocks'),
				'shape' => 'portrait-wide',
			),
			array(
				'value' => '4 / 3',
				'label' => __('Landscape 4:3', 'folioblocks'),
				'shape' => 'landscape',
			),
			array(
				'value' => '3 / 2',
				'label' => __('Landscape 3:2', 'folioblocks'),
				'shape' => 'landscape-wide',
			),
			array(
				'value' => '16 / 9',
				'label' => __('Wide 16:9', 'folioblocks'),
				'shape' => 'wide',
			),
		);
	}
}

if (! function_exists('fbks_get_watermark_preview_style')) {
	function fbks_get_watermark_preview_style($item)
	{
		$position_parts = array(
			'center'       => 'center',
			'top-left'     => 'top left',
			'top-right'    => 'top right',
			'bottom-left'  => 'bottom left',
			'bottom-right' => 'bottom right',
		);
		$background_position = isset($position_parts[$item['position']]) ? $position_parts[$item['position']] : $position_parts['bottom-right'];
		$render_size = (float) $item['size'];
		$style = sprintf(
			'--pb-watermark-preview-opacity:%1$s;--pb-watermark-preview-size:%2$s%%;--pb-watermark-preview-render-size:%3$s%%;--pb-watermark-preview-render-inset:%4$spx;--pb-watermark-preview-position:%5$s;--pb-watermark-preview-repeat:%6$s;',
			esc_attr((string) $item['opacity']),
			esc_attr((string) $item['size']),
			esc_attr((string) $render_size),
			esc_attr((string) $item['inset']),
			esc_attr($background_position),
			esc_attr($item['repeat'])
		);

		if (! empty($item['assetUrl'])) {
			$style .= 'background-image:url(' . esc_url($item['assetUrl']) . ');';
		}

		return $style;
	}
}

if (! function_exists('fbks_render_watermark_fields')) {
	function fbks_render_watermark_fields($item, $field_key, $default_watermark_id, $is_new = false)
	{
		$item = wp_parse_args($item, fbks_get_watermark_item_defaults());
		$preview_style = fbks_get_watermark_preview_style($item);
		$preview_empty_class = empty($item['assetUrl']) ? ' pb-watermark-preview-mark--empty' : '';
		$preview_aspects = fbks_get_watermark_preview_aspects();
		$card_tag = $is_new ? 'div' : 'details';
		?>
		<<?php echo esc_html($card_tag); ?> class="pb-watermark-card<?php echo esc_attr($is_new ? ' pb-watermark-card--new' : ' pb-watermark-card--saved'); ?>" data-watermark-card>
			<?php if (! $is_new) : ?>
				<summary class="pb-watermark-card__summary">
					<span class="pb-watermark-card__thumb">
						<span class="pb-watermark-card__thumb-mark<?php echo esc_attr($preview_empty_class); ?>" style="<?php echo esc_attr($preview_style); ?>" data-watermark-preview></span>
					</span>
					<span class="pb-watermark-card__summary-text">
						<strong data-watermark-summary-name><?php echo esc_html($item['name']); ?></strong>
						<span data-watermark-summary-meta>
							<?php
							printf(
								/* translators: 1: watermark position, 2: watermark opacity */
								esc_html__('Position: %1$s · Opacity: %2$s', 'folioblocks'),
								esc_html(fbks_get_watermark_position_label($item['position'])),
								esc_html((string) $item['opacity'])
							);
							?>
						</span>
					</span>
					<span class="button button-secondary pb-watermark-edit-button"><?php esc_html_e('Edit', 'folioblocks'); ?></span>
				</summary>
			<?php endif; ?>

			<div class="pb-watermark-card__editor">
				<div class="pb-watermark-card__preview">
					<div class="pb-watermark-aspect-controls" aria-label="<?php echo esc_attr__('Preview aspect ratio', 'folioblocks'); ?>">
						<?php foreach ($preview_aspects as $index => $aspect) : ?>
							<button type="button" class="pb-watermark-aspect-button<?php echo 0 === $index ? ' is-active' : ''; ?>" data-watermark-aspect="<?php echo esc_attr($aspect['value']); ?>" aria-label="<?php echo esc_attr($aspect['label']); ?>" title="<?php echo esc_attr($aspect['label']); ?>">
								<span class="pb-watermark-aspect-icon pb-watermark-aspect-icon--<?php echo esc_attr($aspect['shape']); ?>" aria-hidden="true"></span>
							</button>
						<?php endforeach; ?>
					</div>
					<button type="button" class="pb-watermark-preview-button" data-watermark-open-preview aria-label="<?php echo esc_attr__('Open larger watermark preview', 'folioblocks'); ?>">
						<span class="pb-watermark-sample">
							<span class="pb-watermark-sample__mark<?php echo esc_attr($preview_empty_class); ?>" style="<?php echo esc_attr($preview_style); ?>" data-watermark-preview></span>
						</span>
					</button>
				</div>

				<div class="pb-watermark-card__fields">
				<div class="pb-watermark-card__header">
					<h3><?php echo esc_html($is_new ? __('Add Watermark', 'folioblocks') : $item['name']); ?></h3>
					<?php if (! $is_new) : ?>
						<label class="pb-watermark-default-control">
							<input type="radio" name="fbks_watermarks[defaultWatermarkId]" value="<?php echo esc_attr($item['id']); ?>" <?php checked($default_watermark_id, $item['id']); ?> />
							<?php esc_html_e('Default Watermark', 'folioblocks'); ?>
						</label>
					<?php endif; ?>
				</div>

				<input type="hidden" name="fbks_watermarks[items][<?php echo esc_attr($field_key); ?>][id]" value="<?php echo esc_attr($item['id']); ?>" />
				<input type="hidden" name="fbks_watermarks[items][<?php echo esc_attr($field_key); ?>][assetUrl]" value="<?php echo esc_url($item['assetUrl']); ?>" data-watermark-url />

				<label class="pb-settings-field">
					<span><?php esc_html_e('Name', 'folioblocks'); ?></span>
					<input type="text" name="fbks_watermarks[items][<?php echo esc_attr($field_key); ?>][name]" value="<?php echo esc_attr($item['name']); ?>" placeholder="<?php echo esc_attr__('Studio White Logo', 'folioblocks'); ?>" data-watermark-name />
				</label>

				<div class="pb-settings-field">
					<span><?php esc_html_e('Watermark Image', 'folioblocks'); ?></span>
					<div class="pb-watermark-media-control">
						<input type="hidden" name="fbks_watermarks[items][<?php echo esc_attr($field_key); ?>][assetId]" value="<?php echo esc_attr((string) $item['assetId']); ?>" data-watermark-asset-id />
						<button type="button" class="button pb-watermark-select-media"><?php esc_html_e('Upload / Select Image', 'folioblocks'); ?></button>
						<button type="button" class="button pb-watermark-remove-media"><?php esc_html_e('Remove', 'folioblocks'); ?></button>
					</div>
					<p class="pb-settings-field-help">
						<?php esc_html_e('Use a transparent PNG or WebP where possible. WordPress accepts the image formats allowed by your Media Library; SVG uploads are not supported by default unless your site explicitly enables them.', 'folioblocks'); ?>
					</p>
				</div>

				<div class="pb-watermark-settings-grid">
					<label class="pb-settings-field">
						<span><?php esc_html_e('Opacity', 'folioblocks'); ?></span>
						<input type="number" min="0" max="1" step="0.01" name="fbks_watermarks[items][<?php echo esc_attr($field_key); ?>][opacity]" value="<?php echo esc_attr((string) $item['opacity']); ?>" data-watermark-setting="opacity" />
					</label>

					<label class="pb-settings-field">
						<span><?php esc_html_e('Size (% of short edge)', 'folioblocks'); ?></span>
						<input type="number" min="5" max="40" step="1" name="fbks_watermarks[items][<?php echo esc_attr($field_key); ?>][size]" value="<?php echo esc_attr((string) $item['size']); ?>" data-watermark-setting="size" />
					</label>

					<label class="pb-settings-field">
						<span><?php esc_html_e('Inset (% of short edge)', 'folioblocks'); ?></span>
						<input type="number" min="0" max="20" step="1" name="fbks_watermarks[items][<?php echo esc_attr($field_key); ?>][inset]" value="<?php echo esc_attr((string) $item['inset']); ?>" data-watermark-setting="inset" />
					</label>

					<label class="pb-settings-field">
						<span><?php esc_html_e('Position', 'folioblocks'); ?></span>
						<select name="fbks_watermarks[items][<?php echo esc_attr($field_key); ?>][position]" data-watermark-setting="position">
							<?php foreach (array('center', 'top-left', 'top-right', 'bottom-left', 'bottom-right') as $position) : ?>
								<option value="<?php echo esc_attr($position); ?>" <?php selected($item['position'], $position); ?>><?php echo esc_html(fbks_get_watermark_position_label($position)); ?></option>
							<?php endforeach; ?>
						</select>
					</label>

					<label class="pb-settings-field">
						<span><?php esc_html_e('Repeat', 'folioblocks'); ?></span>
						<select name="fbks_watermarks[items][<?php echo esc_attr($field_key); ?>][repeat]" data-watermark-setting="repeat">
							<option value="no-repeat" <?php selected($item['repeat'], 'no-repeat'); ?>><?php esc_html_e('Single', 'folioblocks'); ?></option>
							<option value="repeat" <?php selected($item['repeat'], 'repeat'); ?>><?php esc_html_e('Tiled', 'folioblocks'); ?></option>
						</select>
					</label>
				</div>

				<div class="pb-watermark-checkboxes">
					<?php if (! $is_new) : ?>
						<label class="pb-watermark-delete-control">
							<input type="checkbox" name="fbks_watermarks[items][<?php echo esc_attr($field_key); ?>][delete]" value="1" />
							<?php esc_html_e('Delete this watermark', 'folioblocks'); ?>
						</label>
					<?php endif; ?>
				</div>
				<p class="buy-button-wrapper pb-watermark-save-wrapper">
					<button type="submit" class="button button-primary buy-button">
						<?php esc_html_e('Save Watermark', 'folioblocks'); ?>
					</button>
				</p>
				</div>
			</div>
		</<?php echo esc_html($card_tag); ?>>
		<?php
	}
}

if (! function_exists('fbks_render_global_settings_page')) {
	function fbks_render_global_settings_page()
	{
		fbks_require_admin_nonce_for_post('global-settings');

		$notice = '';
		if (
			isset($_SERVER['REQUEST_METHOD']) &&
			'POST' === strtoupper(sanitize_text_field(wp_unslash($_SERVER['REQUEST_METHOD']))) &&
			isset($_POST['fbks_watermarks']) &&
			is_array($_POST['fbks_watermarks'])
		) {
			$settings = fbks_sanitize_watermark_settings(wp_unslash($_POST['fbks_watermarks']));
			update_option(FBKS_WATERMARK_SETTINGS_OPTION, $settings);
			$notice = __('Watermark saved.', 'folioblocks');
		}

		$settings = fbks_get_watermark_settings();
		$new_watermark = fbks_get_watermark_item_defaults();
		?>
		<div class="pb-wrap">
			<div class="pb-settings-header">
				<img src="<?php echo esc_url(plugin_dir_url(__DIR__) . '/icons/pb-brand-icon.svg'); ?>" alt="<?php echo esc_attr__('FolioBlocks', 'folioblocks'); ?>" class="pb-settings-logo" />
				<h1><?php esc_html_e('FolioBlocks', 'folioblocks'); ?><?php if (fbks_fs()->can_use_premium_code()) : ?> <?php esc_html_e('Pro', 'folioblocks'); ?><?php endif; ?> - <?php esc_html_e('Global Settings', 'folioblocks'); ?></h1>
			</div>

			<?php if ($notice) : ?>
				<div class="notice notice-success is-dismissible">
					<p><?php echo esc_html($notice); ?></p>
				</div>
			<?php endif; ?>

			<div class="settings-container pb-global-settings-container">
				<div class="settings-left">
					<div class="pb-dashboard-box">
						<h2><?php esc_html_e('Global Settings', 'folioblocks'); ?></h2>
						<p>
							<?php esc_html_e('Global Settings define site-wide defaults for FolioBlocks features. For Watermark Overlay, you can save multiple named watermarks, choose one default, and later select them from compatible blocks.', 'folioblocks'); ?>
						</p>
					</div>

					<form method="post" action="<?php echo esc_url(admin_url('admin.php?page=folioblocks-global-settings')); ?>">
						<?php fbks_render_admin_nonce_field('global-settings'); ?>

						<div class="pb-dashboard-box pb-global-settings-panel">
							<h2><?php esc_html_e('Watermarks', 'folioblocks'); ?></h2>
							<p>
								<?php esc_html_e('Save each watermark with a name that will appear in block editor select controls. One saved watermark can be marked as the default. Gallery blocks will decide where the watermark appears.', 'folioblocks'); ?>
							</p>

							<label class="pb-settings-toggle">
								<input type="hidden" name="fbks_watermarks[enabledByDefault]" value="0" />
								<input type="checkbox" name="fbks_watermarks[enabledByDefault]" value="1" <?php checked($settings['enabledByDefault']); ?> />
								<span><?php esc_html_e('Enable the default watermark for new compatible blocks', 'folioblocks'); ?></span>
							</label>

							<div class="pb-watermark-list">
								<?php if (! empty($settings['items'])) : ?>
									<?php foreach ($settings['items'] as $index => $item) : ?>
										<?php fbks_render_watermark_fields($item, (string) $index, $settings['defaultWatermarkId']); ?>
									<?php endforeach; ?>
								<?php else : ?>
									<div class="pb-watermark-empty">
										<?php esc_html_e('No saved watermarks yet. Add your first watermark below.', 'folioblocks'); ?>
									</div>
								<?php endif; ?>
							</div>
						</div>

						<div class="pb-dashboard-box">
							<?php fbks_render_watermark_fields($new_watermark, 'new', $settings['defaultWatermarkId'], true); ?>
						</div>
					</form>
				</div>
			</div>

			<div class="pb-watermark-preview-modal" data-watermark-modal hidden>
				<div class="pb-watermark-preview-modal__backdrop" data-watermark-close-preview></div>
				<div class="pb-watermark-preview-modal__dialog" role="dialog" aria-modal="true" aria-label="<?php echo esc_attr__('Watermark Preview', 'folioblocks'); ?>">
					<button type="button" class="button pb-watermark-preview-modal__close" data-watermark-close-preview><?php esc_html_e('Close', 'folioblocks'); ?></button>
					<div class="pb-watermark-preview-modal__stage">
						<span class="pb-watermark-sample pb-watermark-sample--modal" data-watermark-modal-sample>
							<span class="pb-watermark-sample__mark" data-watermark-modal-preview></span>
						</span>
					</div>
				</div>
			</div>
		</div>

		<script>
			(function() {
				const positionLabels = <?php echo wp_json_encode(array(
					'center'       => __('Center', 'folioblocks'),
					'top-left'     => __('Top Left', 'folioblocks'),
					'top-right'    => __('Top Right', 'folioblocks'),
					'bottom-left'  => __('Bottom Left', 'folioblocks'),
					'bottom-right' => __('Bottom Right', 'folioblocks'),
				)); ?>;
				const positionValues = {
					'center': 'center',
					'top-left': 'top left',
					'top-right': 'top right',
					'bottom-left': 'bottom left',
					'bottom-right': 'bottom right'
				};

				const getCardSetting = (card, setting, fallback) => {
					const input = card.querySelector(`[data-watermark-setting="${setting}"]`);
					return input && input.value !== '' ? input.value : fallback;
				};

				const getRenderSize = (sample, size) => {
					const sampleBounds = sample ? sample.getBoundingClientRect() : null;
					const shortEdge = sampleBounds ? Math.min(sampleBounds.width, sampleBounds.height) : 0;
					return shortEdge ? shortEdge * (Number(size) / 100) : Number(size);
				};

				const getRenderInset = (sample, inset) => {
					const sampleBounds = sample ? sample.getBoundingClientRect() : null;
					const shortEdge = sampleBounds ? Math.min(sampleBounds.width, sampleBounds.height) : 0;
					return shortEdge ? shortEdge * (Number(inset) / 100) : Number(inset);
				};

				const applyPreviewSettings = (card) => {
					const previews = card.querySelectorAll('[data-watermark-preview]');
					const opacity = getCardSetting(card, 'opacity', '0.28');
					const size = getCardSetting(card, 'size', '16');
					const inset = getCardSetting(card, 'inset', '4');
					const position = getCardSetting(card, 'position', 'bottom-right');
					const repeat = getCardSetting(card, 'repeat', 'no-repeat');

					previews.forEach((preview) => {
						const previewSample = preview.closest('.pb-watermark-sample') || preview.closest('.pb-watermark-card__thumb') || card.querySelector('.pb-watermark-sample');
						const computedSize = getRenderSize(previewSample, size);
						const computedInset = getRenderInset(previewSample, inset);

						preview.style.setProperty('--pb-watermark-preview-opacity', opacity);
						preview.style.setProperty('--pb-watermark-preview-size', `${size}%`);
						preview.style.setProperty('--pb-watermark-preview-render-size', `${computedSize}px`);
						preview.style.setProperty('--pb-watermark-preview-render-inset', `${computedInset}px`);
						preview.style.setProperty('--pb-watermark-preview-position', positionValues[position] || positionValues['bottom-right']);
						preview.style.setProperty('--pb-watermark-preview-repeat', repeat);
					});

					const nameInput = card.querySelector('[data-watermark-name]');
					const summaryName = card.querySelector('[data-watermark-summary-name]');
					if (nameInput && summaryName) {
						summaryName.textContent = nameInput.value || <?php echo wp_json_encode(__('Watermark', 'folioblocks')); ?>;
					}

					const summaryMeta = card.querySelector('[data-watermark-summary-meta]');
					if (summaryMeta) {
						summaryMeta.textContent = <?php echo wp_json_encode(__('Position:', 'folioblocks')); ?> + ' ' + (positionLabels[position] || positionLabels['bottom-right']) + ' · ' + <?php echo wp_json_encode(__('Opacity:', 'folioblocks')); ?> + ' ' + opacity;
					}
				};

				const setAspect = (card, aspect) => {
					const sample = card.querySelector('.pb-watermark-sample');
					if (sample) {
						sample.style.setProperty('--pb-watermark-preview-aspect-ratio', aspect);
					}
					card.querySelectorAll('[data-watermark-aspect]').forEach((button) => {
						button.classList.toggle('is-active', button.dataset.watermarkAspect === aspect);
					});
					applyPreviewSettings(card);
				};

				const modal = document.querySelector('[data-watermark-modal]');
				const modalSample = document.querySelector('[data-watermark-modal-sample]');
				const modalPreview = document.querySelector('[data-watermark-modal-preview]');

				const openPreviewModal = (card) => {
					if (!modal || !modalSample || !modalPreview) {
						return;
					}

					const sourceSample = card.querySelector('.pb-watermark-sample');
					const sourcePreview = card.querySelector('.pb-watermark-sample__mark');
					if (!sourceSample || !sourcePreview) {
						return;
					}

					modal.hidden = false;
					modalSample.style.setProperty('--pb-watermark-preview-aspect-ratio', sourceSample.style.getPropertyValue('--pb-watermark-preview-aspect-ratio') || '1 / 1');
					modalPreview.className = sourcePreview.className;
					modalPreview.style.cssText = sourcePreview.style.cssText;

					window.requestAnimationFrame(() => {
						const size = getCardSetting(card, 'size', '16');
						const inset = getCardSetting(card, 'inset', '4');
						modalPreview.style.setProperty('--pb-watermark-preview-render-size', `${getRenderSize(modalSample, size)}px`);
						modalPreview.style.setProperty('--pb-watermark-preview-render-inset', `${getRenderInset(modalSample, inset)}px`);
					});
				};

				const closePreviewModal = () => {
					if (modal) {
						modal.hidden = true;
					}
				};

				document.querySelectorAll('[data-watermark-card]').forEach((card) => {
					card.querySelectorAll('[data-watermark-setting], [data-watermark-name]').forEach((input) => {
						input.addEventListener('input', () => applyPreviewSettings(card));
						input.addEventListener('change', () => applyPreviewSettings(card));
					});
					card.querySelectorAll('[data-watermark-aspect]').forEach((button) => {
						button.addEventListener('click', () => setAspect(card, button.dataset.watermarkAspect || '1 / 1'));
					});
					const previewButton = card.querySelector('[data-watermark-open-preview]');
					if (previewButton) {
						previewButton.addEventListener('click', () => openPreviewModal(card));
					}
					if (card.tagName.toLowerCase() === 'details') {
						card.addEventListener('toggle', () => applyPreviewSettings(card));
					}
					setAspect(card, '1 / 1');
				});

				window.addEventListener('resize', () => {
					document.querySelectorAll('[data-watermark-card]').forEach(applyPreviewSettings);
				});

				document.querySelectorAll('[data-watermark-close-preview]').forEach((button) => {
					button.addEventListener('click', closePreviewModal);
				});
				document.addEventListener('keydown', (event) => {
					if (event.key === 'Escape') {
						closePreviewModal();
					}
				});

				const buttons = document.querySelectorAll('.pb-watermark-select-media');
				buttons.forEach((button) => {
					button.addEventListener('click', () => {
						if (!window.wp || !window.wp.media) {
							return;
						}

						const card = button.closest('[data-watermark-card]');
						const frame = window.wp.media({
							title: <?php echo wp_json_encode(__('Upload or Select Watermark Image', 'folioblocks')); ?>,
							button: { text: <?php echo wp_json_encode(__('Use Watermark', 'folioblocks')); ?> },
							library: { type: 'image' },
							multiple: false
						});

						frame.on('select', () => {
							const attachment = frame.state().get('selection').first().toJSON();
							const assetId = card.querySelector('[data-watermark-asset-id]');
							const assetUrl = card.querySelector('[data-watermark-url]');
							const preview = card.querySelector('[data-watermark-preview]');
							const url = attachment.url || '';

							if (assetId) {
								assetId.value = attachment.id || '';
							}
							if (assetUrl) {
								assetUrl.value = url;
							}
							if (preview) {
								card.querySelectorAll('[data-watermark-preview]').forEach((previewItem) => {
									previewItem.style.backgroundImage = url ? `url(${url})` : '';
									previewItem.classList.toggle('pb-watermark-preview-mark--empty', !url);
								});
							}
							applyPreviewSettings(card);
						});

						frame.open();
					});
				});

				document.querySelectorAll('.pb-watermark-remove-media').forEach((button) => {
					button.addEventListener('click', () => {
						const card = button.closest('[data-watermark-card]');
						const assetId = card.querySelector('[data-watermark-asset-id]');
						const assetUrl = card.querySelector('[data-watermark-url]');
						const preview = card.querySelector('[data-watermark-preview]');

						if (assetId) {
							assetId.value = '';
						}
						if (assetUrl) {
							assetUrl.value = '';
						}
						if (preview) {
							card.querySelectorAll('[data-watermark-preview]').forEach((previewItem) => {
								previewItem.style.backgroundImage = '';
								previewItem.classList.add('pb-watermark-preview-mark--empty');
							});
						}
						applyPreviewSettings(card);
					});
				});
			})();
		</script>
		<?php
	}
}
