<?php
if (! defined('ABSPATH')) {
	exit;
}

if (! defined('FBKS_WATERMARK_SETTINGS_OPTION')) {
	define('FBKS_WATERMARK_SETTINGS_OPTION', 'fbks_watermark_settings');
}

if (! defined('FBKS_PAGE_MEDIA_DEFAULTS_OPTION')) {
	define('FBKS_PAGE_MEDIA_DEFAULTS_OPTION', 'fbks_page_media_defaults');
}

if (! function_exists('fbks_get_page_media_defaults')) {
	function fbks_get_page_media_defaults()
	{
		$defaults = array(
			'lazyLoad'          => false,
			'disableRightClick' => false,
			'disableDragToSave' => false,
		);
		$settings = get_option(FBKS_PAGE_MEDIA_DEFAULTS_OPTION, array());
		$settings = is_array($settings) ? wp_parse_args($settings, $defaults) : $defaults;

		return array(
			'lazyLoad'          => ! empty($settings['lazyLoad']),
			'disableRightClick' => ! empty($settings['disableRightClick']),
			'disableDragToSave' => ! empty($settings['disableDragToSave']),
		);
	}
}

if (! function_exists('fbks_sanitize_page_media_defaults')) {
	function fbks_sanitize_page_media_defaults($settings)
	{
		$settings = is_array($settings) ? $settings : array();

		return array(
			'lazyLoad'          => fbks_sanitize_watermark_checkbox($settings['lazyLoad'] ?? false),
			'disableRightClick' => fbks_sanitize_watermark_checkbox($settings['disableRightClick'] ?? false),
			'disableDragToSave' => fbks_sanitize_watermark_checkbox($settings['disableDragToSave'] ?? false),
		);
	}
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
		if ('__default' === $watermark_id) {
			$watermark_id = sanitize_key($settings['defaultWatermarkId']);
		}

		foreach ($settings['items'] as $item) {
			if ($watermark_id === $item['id'] && ! empty($item['assetUrl'])) {
				return $item;
			}
		}

		return null;
	}
}

if (! function_exists('fbks_ajax_save_global_settings_section')) {
	function fbks_ajax_save_global_settings_section()
	{
		check_ajax_referer(fbks_get_admin_nonce_action('global-settings'), 'nonce');

		if (! current_user_can('manage_options')) {
			wp_send_json_error(
				array('message' => __('Sorry, you are not allowed to update these settings.', 'folioblocks')),
				403
			);
		}

		$section = isset($_POST['section']) ? sanitize_key(wp_unslash($_POST['section'])) : '';
		$operation = isset($_POST['operation']) ? sanitize_key(wp_unslash($_POST['operation'])) : 'save';

		switch ($section) {
			case 'page_media_defaults':
				$raw_settings = isset($_POST['fbks_page_media_defaults']) && is_array($_POST['fbks_page_media_defaults'])
					? wp_unslash($_POST['fbks_page_media_defaults'])
					: array();
				update_option(FBKS_PAGE_MEDIA_DEFAULTS_OPTION, fbks_sanitize_page_media_defaults($raw_settings));
				break;

			case 'media_metadata':
				if (! function_exists('fbks_sanitize_media_metadata_settings') || ! defined('FBKS_MEDIA_METADATA_SETTINGS_OPTION')) {
					wp_send_json_error(array('message' => __('Media Metadata settings are unavailable.', 'folioblocks')), 500);
				}
				$raw_settings = isset($_POST['fbks_media_metadata']) && is_array($_POST['fbks_media_metadata'])
					? wp_unslash($_POST['fbks_media_metadata'])
					: array();
				update_option(FBKS_MEDIA_METADATA_SETTINGS_OPTION, fbks_sanitize_media_metadata_settings($raw_settings));
				break;

			case 'social_sharing':
				if (! function_exists('fbks_sanitize_social_sharing_settings') || ! defined('FBKS_SOCIAL_SHARING_SETTINGS_OPTION')) {
					wp_send_json_error(array('message' => __('Social Sharing settings are unavailable.', 'folioblocks')), 500);
				}
				$raw_settings = isset($_POST['fbks_social_sharing']) && is_array($_POST['fbks_social_sharing'])
					? wp_unslash($_POST['fbks_social_sharing'])
					: array();
				update_option(FBKS_SOCIAL_SHARING_SETTINGS_OPTION, fbks_sanitize_social_sharing_settings($raw_settings));
				break;

			case 'proofing':
				if (! function_exists('fbks_sanitize_proofing_settings') || ! defined('FBKS_PROOFING_SETTINGS_OPTION')) {
					wp_send_json_error(array('message' => __('Proofing Gallery settings are unavailable.', 'folioblocks')), 500);
				}
				$raw_settings = isset($_POST['fbks_proofing']) && is_array($_POST['fbks_proofing'])
					? wp_unslash($_POST['fbks_proofing'])
					: array();
				update_option(FBKS_PROOFING_SETTINGS_OPTION, fbks_sanitize_proofing_settings($raw_settings));
				break;

			case 'watermarks':
				$raw_settings = isset($_POST['fbks_watermarks']) && is_array($_POST['fbks_watermarks'])
					? wp_unslash($_POST['fbks_watermarks'])
					: array();

				if ('create_watermark' === $operation) {
					$raw_item = isset($raw_settings['items']['new']) && is_array($raw_settings['items']['new'])
						? $raw_settings['items']['new']
						: array();
					$new_item = fbks_sanitize_watermark_item($raw_item);

					if (! is_array($new_item) || empty($new_item['assetUrl'])) {
						wp_send_json_error(
							array('message' => __('Select a watermark image before saving.', 'folioblocks')),
							400
						);
					}

					$settings = fbks_get_watermark_settings();
					$item_was_replaced = false;
					foreach ($settings['items'] as $index => $item) {
						if ($item['id'] === $new_item['id']) {
							$settings['items'][$index] = $new_item;
							$item_was_replaced = true;
							break;
						}
					}
					if (! $item_was_replaced) {
						$settings['items'][] = $new_item;
					}
					if (empty($settings['defaultWatermarkId'])) {
						$settings['defaultWatermarkId'] = $new_item['id'];
					}
					update_option(FBKS_WATERMARK_SETTINGS_OPTION, fbks_sanitize_watermark_settings($settings));

					wp_send_json_success(array(
						'message'     => __('Watermark saved.', 'folioblocks'),
						'watermarkId' => $new_item['id'],
					));
				}

				update_option(FBKS_WATERMARK_SETTINGS_OPTION, fbks_sanitize_watermark_settings($raw_settings));
				break;

			default:
				wp_send_json_error(array('message' => __('Unknown settings section.', 'folioblocks')), 400);
		}

		wp_send_json_success(array('message' => __('Saved', 'folioblocks')));
	}
}
add_action('wp_ajax_fbks_save_global_settings_section', 'fbks_ajax_save_global_settings_section');

if (! defined('FBKS_MEDIA_METADATA_SCAN_USER_META')) {
	define('FBKS_MEDIA_METADATA_SCAN_USER_META', '_fbks_media_metadata_scan_state');
}

if (! defined('FBKS_MEDIA_METADATA_SCAN_BATCH_SIZE')) {
	define('FBKS_MEDIA_METADATA_SCAN_BATCH_SIZE', 20);
}

if (! function_exists('fbks_get_media_metadata_scan_state_defaults')) {
	function fbks_get_media_metadata_scan_state_defaults()
	{
		return array(
			'status'    => 'idle',
			'lastId'    => 0,
			'total'     => 0,
			'processed' => 0,
			'imported'  => 0,
			'skipped'   => 0,
			'failed'    => 0,
			'startedAt' => '',
			'updatedAt' => '',
			'lastCompletedAt' => '',
		);
	}
}

if (! function_exists('fbks_normalize_media_metadata_scan_state')) {
	function fbks_normalize_media_metadata_scan_state($state)
	{
		$state = is_array($state) ? wp_parse_args($state, fbks_get_media_metadata_scan_state_defaults()) : fbks_get_media_metadata_scan_state_defaults();
		$status = sanitize_key($state['status']);

		if (! in_array($status, array('idle', 'running', 'complete'), true)) {
			$status = 'idle';
		}

		return array(
			'status'    => $status,
			'lastId'    => absint($state['lastId']),
			'total'     => absint($state['total']),
			'processed' => absint($state['processed']),
			'imported'  => absint($state['imported']),
			'skipped'   => absint($state['skipped']),
			'failed'    => absint($state['failed']),
			'startedAt' => sanitize_text_field($state['startedAt']),
			'updatedAt' => sanitize_text_field($state['updatedAt']),
			'lastCompletedAt' => sanitize_text_field($state['lastCompletedAt']),
		);
	}
}

if (! function_exists('fbks_get_media_metadata_last_scanned_label')) {
	function fbks_get_media_metadata_last_scanned_label($state)
	{
		$state = fbks_normalize_media_metadata_scan_state($state);
		$completed_at = $state['lastCompletedAt'];
		if ('' === $completed_at && 'complete' === $state['status']) {
			$completed_at = $state['updatedAt'];
		}
		$timestamp = $completed_at ? strtotime($completed_at) : false;

		return false !== $timestamp
			? wp_date(get_option('date_format') . ' ' . get_option('time_format'), $timestamp)
			: '';
	}
}

if (! function_exists('fbks_get_media_metadata_scan_state')) {
	function fbks_get_media_metadata_scan_state($user_id)
	{
		return fbks_normalize_media_metadata_scan_state(
			get_user_meta(absint($user_id), FBKS_MEDIA_METADATA_SCAN_USER_META, true)
		);
	}
}

if (! function_exists('fbks_save_media_metadata_scan_state')) {
	function fbks_save_media_metadata_scan_state($user_id, $state)
	{
		$state = fbks_normalize_media_metadata_scan_state($state);
		$state['updatedAt'] = gmdate('c');
		update_user_meta(absint($user_id), FBKS_MEDIA_METADATA_SCAN_USER_META, $state);

		return $state;
	}
}

if (! function_exists('fbks_get_media_metadata_scan_message')) {
	function fbks_get_media_metadata_scan_message($state)
	{
		$state = fbks_normalize_media_metadata_scan_state($state);

		if ('running' === $state['status']) {
			return sprintf(
				/* translators: 1: processed image count, 2: total image count */
				__('Scanned %1$d of %2$d JPEG images.', 'folioblocks'),
				$state['processed'],
				$state['total']
			);
		}

		if ('complete' === $state['status']) {
			if (0 === $state['total']) {
				return __('No existing JPEG images were found.', 'folioblocks');
			}

			return sprintf(
				/* translators: 1: imported count, 2: skipped count, 3: failed count */
				__('Scan complete: %1$d imported, %2$d already scanned, %3$d failed.', 'folioblocks'),
				$state['imported'],
				$state['skipped'],
				$state['failed']
			);
		}

		return __('Scan JPEG images already in the Media Library without changing image files or existing Library edits.', 'folioblocks');
	}
}

if (! function_exists('fbks_prepare_media_metadata_scan_response')) {
	function fbks_prepare_media_metadata_scan_response($state)
	{
		$state = fbks_normalize_media_metadata_scan_state($state);
		$state['message'] = fbks_get_media_metadata_scan_message($state);
		$state['lastScanned'] = fbks_get_media_metadata_last_scanned_label($state);

		return $state;
	}
}

if (! function_exists('fbks_count_existing_jpeg_attachments')) {
	function fbks_count_existing_jpeg_attachments()
	{
		$query = new WP_Query(array(
			'post_type'              => 'attachment',
			'post_status'            => 'inherit',
			'post_mime_type'         => 'image/jpeg',
			'fields'                 => 'ids',
			'posts_per_page'         => 1,
			'no_found_rows'          => false,
			'update_post_meta_cache' => false,
			'update_post_term_cache' => false,
		));

		return absint($query->found_posts);
	}
}

if (! function_exists('fbks_get_existing_jpeg_attachment_batch')) {
	function fbks_get_existing_jpeg_attachment_batch($after_attachment_id)
	{
		$after_attachment_id = absint($after_attachment_id);
		$where_filter = function ($where) use ($after_attachment_id) {
			global $wpdb;

			return $where . $wpdb->prepare(" AND {$wpdb->posts}.ID > %d", $after_attachment_id);
		};

		add_filter('posts_where', $where_filter);
		$query = new WP_Query(array(
			'post_type'              => 'attachment',
			'post_status'            => 'inherit',
			'post_mime_type'         => 'image/jpeg',
			'fields'                 => 'ids',
			'posts_per_page'         => FBKS_MEDIA_METADATA_SCAN_BATCH_SIZE,
			'orderby'                => 'ID',
			'order'                  => 'ASC',
			'no_found_rows'          => true,
			'suppress_filters'       => false,
			'update_post_meta_cache' => false,
			'update_post_term_cache' => false,
		));
		remove_filter('posts_where', $where_filter);

		return array_map('absint', $query->posts);
	}
}

if (! function_exists('fbks_process_media_metadata_scan_batch')) {
	function fbks_process_media_metadata_scan_batch($state)
	{
		$state = fbks_normalize_media_metadata_scan_state($state);
		$attachment_ids = fbks_get_existing_jpeg_attachment_batch($state['lastId']);

		foreach ($attachment_ids as $attachment_id) {
			$state['lastId'] = max($state['lastId'], $attachment_id);
			$state['processed']++;
			$existing = get_post_meta($attachment_id, FBKS_MEDIA_METADATA_META_KEY, true);

			if (
				is_array($existing) &&
				isset($existing['version']) &&
				absint($existing['version']) >= FBKS_MEDIA_METADATA_SCHEMA_VERSION
			) {
				$state['skipped']++;
				continue;
			}

			$result = fbks_import_attachment_media_metadata($attachment_id, true);
			if (is_wp_error($result)) {
				$state['failed']++;
			} else {
				$state['imported']++;
			}
		}

		if (count($attachment_ids) < FBKS_MEDIA_METADATA_SCAN_BATCH_SIZE) {
			$state['status'] = 'complete';
			$state['lastCompletedAt'] = gmdate('c');
		}

		return $state;
	}
}

if (! function_exists('fbks_ajax_scan_existing_media_metadata')) {
	function fbks_ajax_scan_existing_media_metadata()
	{
		check_ajax_referer(fbks_get_admin_nonce_action('global-settings'), 'nonce');

		if (! current_user_can('manage_options')) {
			wp_send_json_error(
				array('message' => __('Sorry, you are not allowed to scan the Media Library.', 'folioblocks')),
				403
			);
		}

		$operation = isset($_POST['operation']) ? sanitize_key(wp_unslash($_POST['operation'])) : 'status';
		$user_id = get_current_user_id();
		$state = fbks_get_media_metadata_scan_state($user_id);

		if ('status' === $operation) {
			wp_send_json_success(fbks_prepare_media_metadata_scan_response($state));
		}

		if ('start' === $operation) {
			$settings = fbks_get_media_metadata_settings();
			if (! $settings['importExif'] && ! $settings['importRatings'] && ! $settings['importColorClasses']) {
				wp_send_json_error(
					array('message' => __('Enable at least one metadata import option before scanning existing media.', 'folioblocks')),
					400
				);
			}

			$last_completed_at = $state['lastCompletedAt'];
			if ('' === $last_completed_at && 'complete' === $state['status']) {
				$last_completed_at = $state['updatedAt'];
			}
			$state = fbks_get_media_metadata_scan_state_defaults();
			$state['lastCompletedAt'] = $last_completed_at;
			$state['status'] = 'running';
			$state['total'] = fbks_count_existing_jpeg_attachments();
			$state['startedAt'] = gmdate('c');
			if (0 === $state['total']) {
				$state['status'] = 'complete';
				$state['lastCompletedAt'] = gmdate('c');
			}
			$state = fbks_save_media_metadata_scan_state($user_id, $state);

			wp_send_json_success(fbks_prepare_media_metadata_scan_response($state));
		}

		if ('batch' !== $operation || 'running' !== $state['status']) {
			wp_send_json_error(array('message' => __('There is no Media Library scan to resume.', 'folioblocks')), 400);
		}

		$state = fbks_process_media_metadata_scan_batch($state);
		$state = fbks_save_media_metadata_scan_state($user_id, $state);

		wp_send_json_success(fbks_prepare_media_metadata_scan_response($state));
	}
}
add_action('wp_ajax_fbks_scan_existing_media_metadata', 'fbks_ajax_scan_existing_media_metadata');

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
						<?php esc_html_e('Use a transparent PNG or WebP where possible. Accepts the image formats allowed by your WordPress Media Library; SVG uploads are not supported by default unless your site explicitly enables them.', 'folioblocks'); ?>
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
				<?php if ($is_new) : ?>
					<div class="pb-watermark-new-save">
						<span class="pb-watermark-new-save__status" data-new-watermark-status aria-live="polite"></span>
						<button type="button" class="button button-primary" data-save-new-watermark>
							<?php esc_html_e('Save Watermark', 'folioblocks'); ?>
						</button>
					</div>
				<?php endif; ?>
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
			isset($_POST['fbks_watermarks'], $_POST['fbks_social_sharing'], $_POST['fbks_proofing'], $_POST['fbks_page_media_defaults'], $_POST['fbks_media_metadata']) &&
			is_array($_POST['fbks_watermarks']) &&
			is_array($_POST['fbks_social_sharing']) &&
			is_array($_POST['fbks_proofing']) &&
			is_array($_POST['fbks_page_media_defaults']) &&
			is_array($_POST['fbks_media_metadata'])
		) {
			$raw_watermark_settings = wp_unslash($_POST['fbks_watermarks']);
			$settings = fbks_sanitize_watermark_settings($raw_watermark_settings);
			$settings['enabledByDefault'] = fbks_sanitize_watermark_checkbox($raw_watermark_settings['enabledByDefault'] ?? false);
			update_option(FBKS_WATERMARK_SETTINGS_OPTION, $settings);
			if (function_exists('fbks_sanitize_social_sharing_settings')) {
				$social_settings = fbks_sanitize_social_sharing_settings(wp_unslash($_POST['fbks_social_sharing']));
				update_option(FBKS_SOCIAL_SHARING_SETTINGS_OPTION, $social_settings);
			}
			if (function_exists('fbks_sanitize_proofing_settings') && defined('FBKS_PROOFING_SETTINGS_OPTION')) {
				$proofing_settings = fbks_sanitize_proofing_settings(wp_unslash($_POST['fbks_proofing']));
				update_option(FBKS_PROOFING_SETTINGS_OPTION, $proofing_settings);
			}
			$page_media_defaults = fbks_sanitize_page_media_defaults(wp_unslash($_POST['fbks_page_media_defaults']));
			update_option(FBKS_PAGE_MEDIA_DEFAULTS_OPTION, $page_media_defaults);
			if (function_exists('fbks_sanitize_media_metadata_settings') && defined('FBKS_MEDIA_METADATA_SETTINGS_OPTION')) {
				$media_metadata_settings = fbks_sanitize_media_metadata_settings(wp_unslash($_POST['fbks_media_metadata']));
				update_option(FBKS_MEDIA_METADATA_SETTINGS_OPTION, $media_metadata_settings);
			}
			$notice = __('Global settings saved.', 'folioblocks');
		}

		$settings = fbks_get_watermark_settings();
		$has_saved_watermarks = ! empty($settings['items']);
		$new_watermark = fbks_get_watermark_item_defaults();
		$new_watermark['id'] = sanitize_key(wp_generate_uuid4());
		$proofing_settings = function_exists('fbks_get_proofing_settings')
			? fbks_get_proofing_settings()
			: array(
				'inProgressRetentionDays' => 14,
				'submittedRetentionDays'  => 90,
				'emailAdminOnSubmit'      => false,
				'showAdminBar'            => true,
			);
		$social_settings = function_exists('fbks_get_social_sharing_settings')
			? fbks_get_social_sharing_settings()
			: array('sources' => array());
		$social_services = function_exists('fbks_get_social_share_services')
			? fbks_get_social_share_services()
			: array();
		$page_media_defaults = fbks_get_page_media_defaults();
		$media_metadata_settings = function_exists('fbks_get_media_metadata_settings')
			? fbks_get_media_metadata_settings()
			: array();
		$media_metadata_presets = function_exists('fbks_get_media_metadata_palette_presets')
			? fbks_get_media_metadata_palette_presets()
			: array();
		$media_metadata_roles = function_exists('get_editable_roles') ? get_editable_roles() : wp_roles()->roles;
		unset($media_metadata_roles['customer'], $media_metadata_roles['shop_manager']);
		$media_metadata_scan_state = fbks_get_media_metadata_scan_state(get_current_user_id());
		$media_metadata_page_scan_state = $media_metadata_scan_state;
		if ('complete' === $media_metadata_page_scan_state['status']) {
			$media_metadata_page_scan_state['status'] = 'idle';
		}
		$media_metadata_page_scan_state = fbks_prepare_media_metadata_scan_response($media_metadata_page_scan_state);
		$media_metadata_last_scanned = fbks_get_media_metadata_last_scanned_label($media_metadata_scan_state);
		$media_metadata_page_scan_state['lastScanned'] = $media_metadata_last_scanned;
		?>
		<div class="pb-wrap">
			<div class="pb-settings-header">
				<img src="<?php echo esc_url(FBKS_PLUGIN_URL . 'includes/icons/pb-brand-icon.svg'); ?>" alt="<?php echo esc_attr__('FolioBlocks', 'folioblocks'); ?>" class="pb-settings-logo" />
				<h1><?php esc_html_e('FolioBlocks', 'folioblocks'); ?><?php if (fbks_fs()->can_use_premium_code()) : ?> <?php esc_html_e('Pro', 'folioblocks'); ?><?php endif; ?> - <?php esc_html_e('Global Settings', 'folioblocks'); ?></h1>
			</div>

			<?php if ($notice) : ?>
				<div class="notice notice-success is-dismissible">
					<p><?php echo esc_html($notice); ?></p>
				</div>
			<?php endif; ?>

			<p class="pb-global-settings-intro">
				<?php esc_html_e('Configure the default behavior of FolioBlocks across your website. Open a section to view its settings—changes are saved automatically as you make them.', 'folioblocks'); ?>
			</p>

			<div class="settings-container pb-global-settings-container">
				<div class="settings-left">
					<form class="pb-global-settings-form" method="post" action="<?php echo esc_url(admin_url('admin.php?page=folioblocks-global-settings')); ?>">
						<?php fbks_render_admin_nonce_field('global-settings'); ?>

						<details class="pb-dashboard-box pb-global-settings-panel" data-settings-section="page_media_defaults">
							<summary class="pb-global-settings-panel__summary">
								<span class="pb-global-settings-panel__heading">
									<span class="pb-global-settings-panel__title"><?php esc_html_e('Page/Post Defaults', 'folioblocks'); ?></span>
									<span class="pb-global-settings-panel__description"><?php esc_html_e('Set the starting Page/Post Settings for newly added compatible FolioBlocks content.', 'folioblocks'); ?></span>
								</span>
								<span class="pb-global-settings-panel__status" data-autosave-status aria-live="polite"></span>
							</summary>
							<div class="pb-global-settings-panel__content">
								<p>
									<?php esc_html_e('These defaults can be overridden on each page or post and do not change existing FolioBlocks content.', 'folioblocks'); ?>
								</p>

							<label class="pb-settings-toggle">
								<input type="hidden" name="fbks_page_media_defaults[lazyLoad]" value="0" />
								<input type="checkbox" name="fbks_page_media_defaults[lazyLoad]" value="1" <?php checked($page_media_defaults['lazyLoad']); ?> />
								<span class="pb-settings-toggle-copy">
									<span><?php esc_html_e('Enable Lazy Load of Images', 'folioblocks'); ?></span>
									<span class="pb-settings-field-help"><?php esc_html_e('Lazy load compatible FolioBlocks images and thumbnails by default.', 'folioblocks'); ?></span>
								</span>
							</label>

							<label class="pb-settings-toggle">
								<input type="hidden" name="fbks_page_media_defaults[disableRightClick]" value="0" />
								<input type="checkbox" name="fbks_page_media_defaults[disableRightClick]" value="1" <?php checked($page_media_defaults['disableRightClick']); ?> />
								<span class="pb-settings-toggle-copy">
									<span><?php esc_html_e('Disable Right-Click on Page/Post', 'folioblocks'); ?></span>
									<span class="pb-settings-field-help"><?php esc_html_e('Prevent right-clicking on compatible FolioBlocks media by default.', 'folioblocks'); ?></span>
								</span>
							</label>

							<label class="pb-settings-toggle">
								<input type="hidden" name="fbks_page_media_defaults[disableDragToSave]" value="0" />
								<input type="checkbox" name="fbks_page_media_defaults[disableDragToSave]" value="1" <?php checked($page_media_defaults['disableDragToSave']); ?> />
								<span class="pb-settings-toggle-copy">
									<span><?php esc_html_e('Disable Drag To Save', 'folioblocks'); ?></span>
									<span class="pb-settings-field-help"><?php esc_html_e('Prevent dragging compatible FolioBlocks images by default.', 'folioblocks'); ?></span>
								</span>
							</label>
							</div>
						</details>

						<details class="pb-dashboard-box pb-global-settings-panel" data-settings-section="media_metadata" data-media-metadata-settings>
							<summary class="pb-global-settings-panel__summary">
								<span class="pb-global-settings-panel__heading">
									<span class="pb-global-settings-panel__title"><?php esc_html_e('Media Metadata', 'folioblocks'); ?></span>
									<span class="pb-global-settings-panel__description"><?php esc_html_e('Import, display, and manage ratings and color classes used throughout FolioBlocks.', 'folioblocks'); ?></span>
								</span>
								<span class="pb-global-settings-panel__status" data-autosave-status aria-live="polite"></span>
							</summary>
							<div class="pb-global-settings-panel__content">
								<p>
									<?php esc_html_e('Embedded values remain unchanged for provenance. These settings control future imports and how the separate editable Media Library values will be presented.', 'folioblocks'); ?>
								</p>

								<section class="pb-media-metadata-group" aria-labelledby="pb-media-metadata-import-heading">
									<h3 id="pb-media-metadata-import-heading"><?php esc_html_e('Metadata Import', 'folioblocks'); ?></h3>
									<p class="pb-settings-field-help"><?php esc_html_e('Import options apply to future uploads and rescans. Turning one off does not delete metadata already stored.', 'folioblocks'); ?></p>

									<div class="pb-media-metadata-import-layout">
										<div class="pb-media-metadata-import-options">
											<label class="pb-settings-toggle">
												<input type="hidden" name="fbks_media_metadata[importExif]" value="0" />
												<input type="checkbox" name="fbks_media_metadata[importExif]" value="1" <?php checked(! empty($media_metadata_settings['importExif'])); ?> />
												<span class="pb-settings-toggle-copy">
													<span><?php esc_html_e('Import EXIF Data', 'folioblocks'); ?></span>
													<span class="pb-settings-field-help"><?php esc_html_e('Allow FolioBlocks Media Library tools to retain supported camera and exposure fields.', 'folioblocks'); ?></span>
												</span>
											</label>

											<label class="pb-settings-toggle">
												<input type="hidden" name="fbks_media_metadata[importRatings]" value="0" />
												<input type="checkbox" name="fbks_media_metadata[importRatings]" value="1" <?php checked(! empty($media_metadata_settings['importRatings'])); ?> />
												<span class="pb-settings-toggle-copy">
													<span><?php esc_html_e('Import Star Ratings', 'folioblocks'); ?></span>
													<span class="pb-settings-field-help"><?php esc_html_e('Read supported embedded one-to-five-star ratings when JPEG images are imported.', 'folioblocks'); ?></span>
												</span>
											</label>

											<label class="pb-settings-toggle">
												<input type="hidden" name="fbks_media_metadata[importColorClasses]" value="0" />
												<input type="checkbox" name="fbks_media_metadata[importColorClasses]" value="1" <?php checked(! empty($media_metadata_settings['importColorClasses'])); ?> />
												<span class="pb-settings-toggle-copy">
											<span><?php esc_html_e('Import Color Classes', 'folioblocks'); ?></span>
													<span class="pb-settings-field-help"><?php esc_html_e('Read supported numeric color classes, XMP labels, and Photo Mechanic tagged state.', 'folioblocks'); ?></span>
												</span>
											</label>
										</div>

										<div class="pb-media-metadata-scan-column">
											<div class="pb-media-metadata-scan" data-media-metadata-scan>
												<div class="pb-media-metadata-scan__action">
													<button type="button" class="button button-secondary" data-media-metadata-scan-button>
														<?php echo esc_html('running' === $media_metadata_page_scan_state['status'] ? __('Resume Scan', 'folioblocks') : __('Scan Existing Media', 'folioblocks')); ?>
													</button>
													<span class="pb-media-metadata-scan__status" data-media-metadata-scan-status aria-live="polite">
														<?php echo esc_html($media_metadata_page_scan_state['message']); ?>
													</span>
												</div>
												<progress class="pb-media-metadata-scan__progress" max="<?php echo esc_attr((string) max(1, $media_metadata_page_scan_state['total'])); ?>" value="<?php echo esc_attr((string) min($media_metadata_page_scan_state['processed'], max(1, $media_metadata_page_scan_state['total']))); ?>" data-media-metadata-scan-progress <?php echo 'running' === $media_metadata_page_scan_state['status'] && $media_metadata_page_scan_state['total'] > 0 ? '' : 'hidden'; ?>></progress>
											</div>
											<p class="pb-media-metadata-last-scan" data-media-metadata-last-scan <?php echo '' === $media_metadata_last_scanned ? 'hidden' : ''; ?>>
												<strong><?php esc_html_e('Last Scanned:', 'folioblocks'); ?></strong>
												<span data-media-metadata-last-scan-value><?php echo esc_html($media_metadata_last_scanned); ?></span>
											</p>
										</div>
									</div>
								</section>

								<section class="pb-media-metadata-group" aria-labelledby="pb-media-library-heading">
									<h3 id="pb-media-library-heading"><?php esc_html_e('Media Library', 'folioblocks'); ?></h3>

									<label class="pb-settings-toggle">
										<input type="hidden" name="fbks_media_metadata[showInMediaLibrary]" value="0" />
										<input type="checkbox" name="fbks_media_metadata[showInMediaLibrary]" value="1" <?php checked(! empty($media_metadata_settings['showInMediaLibrary'])); ?> data-media-metadata-show />
										<span class="pb-settings-toggle-copy">
											<span><?php esc_html_e('Show FolioBlocks Metadata', 'folioblocks'); ?></span>
										<span class="pb-settings-field-help"><?php esc_html_e('Show ratings, color classes, and supported EXIF data in attachment details.', 'folioblocks'); ?></span>
										</span>
									</label>

									<fieldset class="pb-media-metadata-types" data-media-metadata-types>
										<legend><?php esc_html_e('Metadata to Show', 'folioblocks'); ?></legend>
										<input type="hidden" name="fbks_media_metadata[visibleMetadata][]" value="" />
										<?php
										$media_metadata_type_labels = array(
											'exif'    => __('EXIF Data', 'folioblocks'),
											'ratings' => __('Ratings', 'folioblocks'),
											'colors'  => __('Color Classes', 'folioblocks'),
										);
										foreach ($media_metadata_type_labels as $type_key => $type_label) :
											?>
											<label>
												<input type="checkbox" name="fbks_media_metadata[visibleMetadata][]" value="<?php echo esc_attr($type_key); ?>" <?php checked(in_array($type_key, $media_metadata_settings['visibleMetadata'], true)); ?> />
												<?php echo esc_html($type_label); ?>
											</label>
										<?php endforeach; ?>
									</fieldset>

									<label class="pb-settings-toggle">
										<input type="hidden" name="fbks_media_metadata[allowEditing]" value="0" />
										<input type="checkbox" name="fbks_media_metadata[allowEditing]" value="1" <?php checked(! empty($media_metadata_settings['allowEditing'])); ?> data-media-metadata-editing />
										<span class="pb-settings-toggle-copy">
											<span><?php esc_html_e('Allow Metadata Editing', 'folioblocks'); ?></span>
											<span class="pb-settings-field-help"><?php esc_html_e('Permit selected roles to edit Media Library values without rewriting the original image file.', 'folioblocks'); ?></span>
										</span>
									</label>

									<div class="pb-media-metadata-role-grid">
										<fieldset class="pb-media-metadata-roles" data-media-metadata-view-roles>
											<legend><?php esc_html_e('Who Can View Metadata', 'folioblocks'); ?></legend>
											<input type="hidden" name="fbks_media_metadata[viewRoles][]" value="" />
											<?php foreach ($media_metadata_roles as $role_key => $role) : ?>
												<label>
													<input type="checkbox" name="fbks_media_metadata[viewRoles][]" value="<?php echo esc_attr($role_key); ?>" <?php checked(in_array($role_key, $media_metadata_settings['viewRoles'], true)); ?> <?php disabled('administrator' === $role_key); ?> />
													<?php echo esc_html(translate_user_role($role['name'])); ?>
												</label>
											<?php endforeach; ?>
										</fieldset>

										<fieldset class="pb-media-metadata-roles" data-media-metadata-edit-roles>
											<legend><?php esc_html_e('Who Can Edit Metadata', 'folioblocks'); ?></legend>
											<input type="hidden" name="fbks_media_metadata[editRoles][]" value="" />
											<?php foreach ($media_metadata_roles as $role_key => $role) : ?>
												<label>
													<input type="checkbox" name="fbks_media_metadata[editRoles][]" value="<?php echo esc_attr($role_key); ?>" <?php checked(in_array($role_key, $media_metadata_settings['editRoles'], true)); ?> <?php disabled('administrator' === $role_key); ?> />
													<?php echo esc_html(translate_user_role($role['name'])); ?>
												</label>
											<?php endforeach; ?>
										</fieldset>
									</div>
									<p class="pb-settings-field-help"><?php esc_html_e('Administrators always retain access. Attachment permissions are checked in addition to the selected role.', 'folioblocks'); ?></p>
								</section>

								<section class="pb-media-metadata-group" aria-labelledby="pb-star-ratings-heading">
									<h3 id="pb-star-ratings-heading"><?php esc_html_e('Star Ratings', 'folioblocks'); ?></h3>

									<label class="pb-settings-toggle">
										<input type="hidden" name="fbks_media_metadata[enableStarRatings]" value="0" />
										<input type="checkbox" name="fbks_media_metadata[enableStarRatings]" value="1" <?php checked(! empty($media_metadata_settings['enableStarRatings'])); ?> />
										<span class="pb-settings-toggle-copy">
											<span><?php esc_html_e('Enable Star Ratings', 'folioblocks'); ?></span>
											<span class="pb-settings-field-help"><?php esc_html_e('Make Media Ratings available to compatible FolioBlocks tools and blocks.', 'folioblocks'); ?></span>
										</span>
									</label>

									<label class="pb-settings-field pb-media-metadata-short-field">
										<span><?php esc_html_e('Unrated Label', 'folioblocks'); ?></span>
										<input type="text" name="fbks_media_metadata[unratedLabel]" value="<?php echo esc_attr($media_metadata_settings['unratedLabel']); ?>" />
									</label>
								</section>

								<section class="pb-media-metadata-group" aria-labelledby="pb-color-classes-heading">
									<h3 id="pb-color-classes-heading"><?php esc_html_e('Color Classes', 'folioblocks'); ?></h3>

									<label class="pb-settings-toggle">
										<input type="hidden" name="fbks_media_metadata[enableColorClasses]" value="0" />
										<input type="checkbox" name="fbks_media_metadata[enableColorClasses]" value="1" <?php checked(! empty($media_metadata_settings['enableColorClasses'])); ?> data-media-metadata-colors />
										<span class="pb-settings-toggle-copy">
											<span><?php esc_html_e('Enable Color Classes', 'folioblocks'); ?></span>
											<span class="pb-settings-field-help"><?php esc_html_e('Make Media Color Classes available to compatible FolioBlocks tools and blocks.', 'folioblocks'); ?></span>
										</span>
									</label>

									<div data-media-metadata-color-options>
										<label class="pb-settings-field pb-media-metadata-short-field">
											<span><?php esc_html_e('Palette Preset', 'folioblocks'); ?></span>
											<select name="fbks_media_metadata[palettePreset]" data-media-metadata-preset>
												<?php foreach ($media_metadata_presets as $preset_key => $preset) : ?>
													<option value="<?php echo esc_attr($preset_key); ?>" <?php selected($media_metadata_settings['palettePreset'], $preset_key); ?>><?php echo esc_html($preset['label']); ?></option>
												<?php endforeach; ?>
											</select>
											<span class="pb-settings-field-help"><?php esc_html_e('Choosing a preset copies its mapping below. Editing a row changes the selection to Custom.', 'folioblocks'); ?></span>
										</label>

										<div class="pb-media-metadata-palette">
											<div class="pb-media-metadata-palette__header" aria-hidden="true">
												<span><?php esc_html_e('Value', 'folioblocks'); ?></span>
												<span><?php esc_html_e('Enabled', 'folioblocks'); ?></span>
												<span><?php esc_html_e('Color', 'folioblocks'); ?></span>
												<span><?php esc_html_e('Label', 'folioblocks'); ?></span>
											</div>
											<?php foreach ($media_metadata_settings['palette'] as $value => $item) : ?>
												<div class="pb-media-metadata-palette__row" data-media-metadata-palette-row="<?php echo esc_attr((string) $value); ?>">
													<strong class="pb-media-metadata-palette__value"><?php echo esc_html((string) $value); ?></strong>
													<label class="pb-media-metadata-palette__enabled">
														<span class="screen-reader-text"><?php printf(esc_html__('Enable color class %d', 'folioblocks'), esc_html((string) $value)); ?></span>
														<input type="hidden" name="fbks_media_metadata[palette][<?php echo esc_attr((string) $value); ?>][enabled]" value="0" />
														<input type="checkbox" name="fbks_media_metadata[palette][<?php echo esc_attr((string) $value); ?>][enabled]" value="1" <?php checked(! empty($item['enabled'])); ?> data-palette-field />
													</label>
													<label class="pb-media-metadata-palette__color">
														<span class="screen-reader-text"><?php printf(esc_html__('Color for class %d', 'folioblocks'), esc_html((string) $value)); ?></span>
														<input type="color" name="fbks_media_metadata[palette][<?php echo esc_attr((string) $value); ?>][color]" value="<?php echo esc_attr($item['color']); ?>" data-palette-field />
													</label>
													<label class="pb-media-metadata-palette__label">
														<span class="screen-reader-text"><?php printf(esc_html__('Label for class %d', 'folioblocks'), esc_html((string) $value)); ?></span>
														<input type="text" name="fbks_media_metadata[palette][<?php echo esc_attr((string) $value); ?>][label]" value="<?php echo esc_attr($item['label']); ?>" data-palette-field />
													</label>
												</div>
											<?php endforeach; ?>
										</div>
										<p class="pb-settings-field-help"><?php esc_html_e('The values 1–8 never move. Changing a color or label only changes how that stored number appears in FolioBlocks.', 'folioblocks'); ?></p>
									</div>
								</section>
							</div>
						</details>

						<details class="pb-dashboard-box pb-global-settings-panel" data-settings-section="social_sharing">
							<summary class="pb-global-settings-panel__summary">
								<span class="pb-global-settings-panel__heading">
									<span class="pb-global-settings-panel__title"><?php esc_html_e('Social Sharing', 'folioblocks'); ?></span>
									<span class="pb-global-settings-panel__description"><?php esc_html_e('Choose the social networks available in lightbox and overlay sharing controls.', 'folioblocks'); ?></span>
								</span>
								<span class="pb-global-settings-panel__status" data-autosave-status aria-live="polite"></span>
							</summary>
							<div class="pb-global-settings-panel__content">
								<p>
									<?php esc_html_e('Choose up to 5 social sharing sources used when Social Media is selected for lightbox or overlay content.', 'folioblocks'); ?>
								</p>

							<input type="hidden" name="fbks_social_sharing[enabled]" value="1" />
							<div class="pb-watermark-checkboxes" data-social-share-sources data-social-share-max="5">
								<?php foreach ($social_services as $source => $service) : ?>
									<label>
										<input type="checkbox" name="fbks_social_sharing[sources][]" value="<?php echo esc_attr($source); ?>" <?php checked(in_array($source, $social_settings['sources'], true)); ?> />
										<?php echo esc_html($service['label']); ?>
									</label>
								<?php endforeach; ?>
							</div>
							</div>
						</details>

						<details class="pb-dashboard-box pb-global-settings-panel" data-settings-section="proofing">
							<summary class="pb-global-settings-panel__summary">
								<span class="pb-global-settings-panel__heading">
									<span class="pb-global-settings-panel__title"><?php esc_html_e('Proofing Sessions', 'folioblocks'); ?></span>
									<span class="pb-global-settings-panel__description"><?php esc_html_e('Manage proofing retention, notifications, and the admin bar activity indicator.', 'folioblocks'); ?></span>
								</span>
								<span class="pb-global-settings-panel__status" data-autosave-status aria-live="polite"></span>
							</summary>
							<div class="pb-global-settings-panel__content">
								<p>
									<?php esc_html_e('Control how long proofing sessions are stored and whether admins are notified when clients submit selections.', 'folioblocks'); ?>
								</p>

							<div class="pb-proofing-settings-grid">
								<label class="pb-settings-field">
									<span><?php esc_html_e('Saved Session Retention', 'folioblocks'); ?></span>
									<input type="number" min="1" max="3650" step="1" name="fbks_proofing[inProgressRetentionDays]" value="<?php echo esc_attr((string) $proofing_settings['inProgressRetentionDays']); ?>" />
									<p class="pb-settings-field-help"><?php esc_html_e('Number of days to keep viewing and saved in-progress proofing sessions.', 'folioblocks'); ?></p>
								</label>

								<label class="pb-settings-field">
									<span><?php esc_html_e('Submitted Session Retention', 'folioblocks'); ?></span>
									<input type="number" min="1" max="3650" step="1" name="fbks_proofing[submittedRetentionDays]" value="<?php echo esc_attr((string) $proofing_settings['submittedRetentionDays']); ?>" />
									<p class="pb-settings-field-help"><?php esc_html_e('Number of days to keep submitted proofing sessions before cleanup.', 'folioblocks'); ?></p>
								</label>
							</div>

							<label class="pb-settings-toggle">
								<input type="hidden" name="fbks_proofing[emailAdminOnSubmit]" value="0" />
								<input type="checkbox" name="fbks_proofing[emailAdminOnSubmit]" value="1" <?php checked($proofing_settings['emailAdminOnSubmit']); ?> />
								<span class="pb-settings-toggle-copy">
									<span><?php esc_html_e('Email admin when session is submitted', 'folioblocks'); ?></span>
									<span class="pb-settings-field-help"><?php esc_html_e('Send an email to the site admin account when a Proofing Session is submitted.', 'folioblocks'); ?></span>
								</span>
							</label>

							<label class="pb-settings-toggle">
								<input type="hidden" name="fbks_proofing[showAdminBar]" value="0" />
								<input type="checkbox" name="fbks_proofing[showAdminBar]" value="1" <?php checked($proofing_settings['showAdminBar']); ?> />
								<span class="pb-settings-toggle-copy">
									<span><?php esc_html_e('Show Proofing Status Component in the Admin bar', 'folioblocks'); ?></span>
									<span class="pb-settings-field-help"><?php esc_html_e("Display the Proofing Gallery Block's status component in the Admin bar and see in real time when clients are interacting the proofing galleries.", 'folioblocks'); ?></span>
								</span>
							</label>
							</div>
						</details>

						<details class="pb-dashboard-box pb-global-settings-panel" data-settings-section="watermarks">
							<summary class="pb-global-settings-panel__summary">
								<span class="pb-global-settings-panel__heading">
									<span class="pb-global-settings-panel__title"><?php esc_html_e('Watermarks', 'folioblocks'); ?></span>
									<span class="pb-global-settings-panel__description"><?php esc_html_e('Create reusable watermarks and choose the default for new compatible blocks.', 'folioblocks'); ?></span>
								</span>
								<span class="pb-global-settings-panel__status" data-autosave-status aria-live="polite"></span>
							</summary>
							<div class="pb-global-settings-panel__content">
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

							<?php if ($has_saved_watermarks) : ?>
								<div class="pb-watermark-new-action" data-watermark-new-action>
									<button type="button" class="button button-secondary" data-watermark-show-new>
										<?php esc_html_e('Add New Watermark', 'folioblocks'); ?>
									</button>
								</div>
							<?php endif; ?>

							<div class="pb-watermark-new-item" data-watermark-new-item data-autosave-ignore<?php if ($has_saved_watermarks) : ?> hidden<?php endif; ?>>
								<?php fbks_render_watermark_fields($new_watermark, 'new', $settings['defaultWatermarkId'], true); ?>
							</div>
							</div>
						</details>

						<p class="buy-button-wrapper pb-global-settings-save-wrapper" data-global-save-fallback>
							<button type="submit" class="button button-primary buy-button">
								<?php esc_html_e('Save Global Settings', 'folioblocks'); ?>
							</button>
						</p>
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
				document.querySelectorAll('[data-social-share-sources]').forEach((container) => {
					const maxSources = Number(container.dataset.socialShareMax || 5);
					const checkboxes = Array.from(container.querySelectorAll('input[type="checkbox"]'));

					const updateSourceAvailability = () => {
						const checkedCount = checkboxes.filter((checkbox) => checkbox.checked).length;
						checkboxes.forEach((checkbox) => {
							checkbox.disabled = !checkbox.checked && checkedCount >= maxSources;
						});
					};

					checkboxes.forEach((checkbox) => {
						checkbox.addEventListener('change', () => {
							const checkedCount = checkboxes.filter((item) => item.checked).length;

							if (checkedCount > maxSources) {
								checkbox.checked = false;
							}

							updateSourceAvailability();
						});
					});

					updateSourceAvailability();
				});

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

				const getWatermarkSizingEdge = (sample) => {
					const sampleBounds = sample ? sample.getBoundingClientRect() : null;
					if (!sampleBounds) {
						return 0;
					}

					const shortEdge = Math.min(sampleBounds.width, sampleBounds.height);
					const longEdge = Math.max(sampleBounds.width, sampleBounds.height);
					const aspectRatio = shortEdge > 0 ? longEdge / shortEdge : 1;
					const squareAdjustment = aspectRatio >= 1.2 ? 1 : 0.78 + ((aspectRatio - 1) / 0.2) * 0.22;

					return shortEdge * Math.min(1, Math.max(0.78, squareAdjustment));
				};

				const getRenderSize = (sample, size) => {
					const sizingEdge = getWatermarkSizingEdge(sample);
					return sizingEdge ? sizingEdge * (Number(size) / 100) : Number(size);
				};

				const getRenderInset = (sample, inset) => {
					const sizingEdge = getWatermarkSizingEdge(sample);
					return sizingEdge ? sizingEdge * (Number(inset) / 100) : Number(inset);
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

				const showNewWatermarkButton = document.querySelector('[data-watermark-show-new]');
				const newWatermarkAction = document.querySelector('[data-watermark-new-action]');
				const newWatermarkItem = document.querySelector('[data-watermark-new-item]');

				if (showNewWatermarkButton && newWatermarkItem) {
					showNewWatermarkButton.addEventListener('click', () => {
						newWatermarkItem.hidden = false;
						if (newWatermarkAction) {
							newWatermarkAction.hidden = true;
						}

						const newWatermarkCard = newWatermarkItem.querySelector('[data-watermark-card]');
						if (newWatermarkCard) {
							applyPreviewSettings(newWatermarkCard);
						}

						const nameInput = newWatermarkItem.querySelector('[data-watermark-name]');
						if (nameInput) {
							nameInput.focus();
						}
					});
				}

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
								assetId.dispatchEvent(new Event('change', { bubbles: true }));
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
							assetId.dispatchEvent(new Event('change', { bubbles: true }));
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
