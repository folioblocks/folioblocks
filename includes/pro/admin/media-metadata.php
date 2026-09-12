<?php

/**
 * FolioBlocks Media Library metadata fields.
 *
 * @package FolioBlocks
 */

if (! defined('ABSPATH')) {
	exit;
}

if (! function_exists('fbks_get_media_library_rating_label')) {
	function fbks_get_media_library_rating_label($rating, $unrated_label = '')
	{
		$rating = fbks_sanitize_media_rating($rating);
		if (null === $rating) {
			return $unrated_label ?: __('Unrated', 'folioblocks');
		}

		return sprintf(
			/* translators: %d: rating from one to five */
			_n('%d star', '%d stars', $rating, 'folioblocks'),
			$rating
		);
	}
}

if (! function_exists('fbks_get_media_library_color_class_item')) {
	function fbks_get_media_library_color_class_item($color_class, $settings)
	{
		$color_class = fbks_sanitize_media_color_class($color_class);
		if (null === $color_class || empty($settings['palette'][$color_class])) {
			return null;
		}

		$item = $settings['palette'][$color_class];

		return array(
			'value'   => $color_class,
			'enabled' => ! empty($item['enabled']),
			'color'   => sanitize_hex_color($item['color'] ?? '') ?: '#808080',
			'label'   => sanitize_text_field($item['label'] ?? ''),
		);
	}
}

if (! function_exists('fbks_get_media_library_color_class_label')) {
	function fbks_get_media_library_color_class_label($color_class, $settings)
	{
		$item = fbks_get_media_library_color_class_item($color_class, $settings);
		if (! $item) {
			return __('Unclassified', 'folioblocks');
		}

		return sprintf(
			/* translators: 1: numeric color-class value, 2: configured color-class label */
			__('%1$d — %2$s', 'folioblocks'),
			$item['value'],
			$item['label']
		);
	}
}

if (! function_exists('fbks_render_media_library_rating_field')) {
	function fbks_render_media_library_rating_field($attachment_id, $rating, $settings, $can_edit)
	{
		$label = fbks_get_media_library_rating_label($rating, $settings['unratedLabel']);
		if (! $can_edit) {
			return '<span class="fbks-media-metadata-readonly fbks-media-metadata-readonly--field">' . esc_html($label) . '</span>';
		}

		$html = '<select class="fbks-media-metadata-select" name="attachments[' . esc_attr((string) $attachment_id) . '][fbks_media_rating]">';
		$html .= '<option value=""' . selected(null, fbks_sanitize_media_rating($rating), false) . '>' . esc_html($settings['unratedLabel']) . '</option>';
		for ($value = 1; $value <= 5; $value++) {
			$stars = str_repeat('★', $value) . str_repeat('☆', 5 - $value);
			$html .= '<option value="' . esc_attr((string) $value) . '"' . selected($value, fbks_sanitize_media_rating($rating), false) . '>';
			$html .= esc_html($stars . ' — ' . fbks_get_media_library_rating_label($value, $settings['unratedLabel']));
			$html .= '</option>';
		}
		$html .= '</select>';

		return $html;
	}
}

if (! function_exists('fbks_render_media_library_color_class_field')) {
	function fbks_render_media_library_color_class_field($attachment_id, $color_class, $settings, $can_edit)
	{
		$current_item = fbks_get_media_library_color_class_item($color_class, $settings);
		$swatch = '<span class="fbks-media-metadata-swatch' . ($current_item ? '' : ' is-hidden') . '"' . ($current_item ? ' style="--fbks-media-metadata-color:' . esc_attr($current_item['color']) . '"' : '') . ' aria-hidden="true"></span>';

		if (! $can_edit) {
			return '<span class="fbks-media-metadata-value fbks-media-metadata-readonly--field">' . $swatch . '<span>' . esc_html(fbks_get_media_library_color_class_label($color_class, $settings)) . '</span></span>';
		}

		$html = '<span class="fbks-media-metadata-value">' . $swatch;
		$html .= '<select class="fbks-media-metadata-select fbks-media-metadata-select--color-class" name="attachments[' . esc_attr((string) $attachment_id) . '][fbks_media_color_class]">';
		$html .= '<option value=""' . selected(null, fbks_sanitize_media_color_class($color_class), false) . '>' . esc_html__('Unclassified', 'folioblocks') . '</option>';
		foreach ($settings['palette'] as $value => $item) {
			if (empty($item['enabled']) && absint($color_class) !== absint($value)) {
				continue;
			}
			$option_label = sprintf(
				/* translators: 1: numeric color-class value, 2: configured color-class label */
				__('%1$d — %2$s', 'folioblocks'),
				$value,
				$item['label']
			);
			if (empty($item['enabled'])) {
				$option_label .= ' ' . __('(disabled)', 'folioblocks');
			}
			$html .= '<option value="' . esc_attr((string) $value) . '" data-color="' . esc_attr($item['color']) . '"' . selected(absint($color_class), absint($value), false) . '>' . esc_html($option_label) . '</option>';
		}
		$html .= '</select></span>';

		return $html;
	}
}

if (! function_exists('fbks_get_media_metadata_library_differences')) {
	function fbks_get_media_metadata_library_differences($record)
	{
		if (! is_array($record) || empty($record['library']) || empty($record['embedded'])) {
			return array('exif' => false, 'rating' => false, 'colorClass' => false);
		}

		$library = $record['library'];
		$embedded = $record['embedded'];

		return array(
			'exif'       => fbks_normalize_media_exif_metadata($library['exif'] ?? array()) !== fbks_normalize_media_exif_metadata($embedded['exif'] ?? array()),
			'rating'     => fbks_sanitize_media_rating($library['rating'] ?? null) !== fbks_sanitize_media_rating($embedded['rating'] ?? null),
			'colorClass' => fbks_sanitize_media_color_class($library['colorClass'] ?? null) !== fbks_sanitize_media_color_class($embedded['colorClass'] ?? null),
		);
	}
}

if (! function_exists('fbks_render_media_metadata_reset_control')) {
	function fbks_render_media_metadata_reset_control($attachment_id, $record)
	{
		$differences = fbks_get_media_metadata_library_differences($record);
		$has_differences = in_array(true, $differences, true);
		$reset_values = array(
			'rating'     => $record['embedded']['rating'],
			'colorClass' => $record['embedded']['colorClass'],
			'exif'       => $record['embedded']['exif'],
		);
		$options = array(
			'exif'       => __('Reset EXIF Data', 'folioblocks'),
			'rating'     => __('Reset Media Rating', 'folioblocks'),
			'colorClass' => __('Reset Media Color Class', 'folioblocks'),
			'all'        => __('Reset All Media Metadata', 'folioblocks'),
		);

		$html = '<span class="fbks-media-metadata-status" data-fbks-media-metadata-status data-attachment-id="' . esc_attr((string) $attachment_id) . '" data-reset-values="' . esc_attr(wp_json_encode($reset_values)) . '" data-differences="' . esc_attr(wp_json_encode($differences)) . '">';
		$html .= '<span class="fbks-media-metadata-badge">' . esc_html__('Imported', 'folioblocks') . '</span>';
		$html .= '<select class="fbks-media-metadata-reset" aria-label="' . esc_attr__('Reset Media Library metadata to its embedded value', 'folioblocks') . '"' . ($has_differences ? '' : ' hidden') . '>';
		$html .= '<option value="">' . esc_html__('Reset…', 'folioblocks') . '</option>';
		foreach ($options as $scope => $label) {
			$option_is_available = 'all' === $scope ? $has_differences : ! empty($differences[$scope]);
			$html .= '<option value="' . esc_attr($scope) . '" data-reset-scope="' . esc_attr($scope) . '"' . ($option_is_available ? '' : ' hidden disabled') . '>' . esc_html($label) . '</option>';
		}
		$html .= '</select></span>';

		return $html;
	}
}

if (! function_exists('fbks_format_media_library_exif_value')) {
	function fbks_format_media_library_exif_value($key, $value)
	{
		$value = fbks_sanitize_media_metadata_label($value);
		if ('' === $value) {
			return __('Unknown', 'folioblocks');
		}

		switch ($key) {
			case 'focalLength':
				return preg_match('/mm$/i', $value) ? $value : $value . ' mm';
			case 'aperture':
				return 0 === stripos($value, 'f/') ? $value : 'f/' . $value;
			case 'iso':
				return 0 === stripos($value, 'iso') ? $value : 'ISO ' . $value;
			case 'shutterSpeed':
				if (preg_match('/sec$/i', $value)) {
					return $value;
				}
				if (false !== strpos($value, '/')) {
					return $value . ' sec';
				}
				$seconds = is_numeric($value) ? (float) $value : 0;
				if ($seconds > 0 && $seconds < 1) {
					return '1/' . (string) round(1 / $seconds) . ' sec';
				}
				return $seconds >= 1 ? $value . ' sec' : $value;
			default:
				return $value;
		}
	}
}

if (! function_exists('fbks_get_media_library_exif_select_options')) {
	function fbks_get_media_library_exif_select_options($key)
	{
		if ('shutterSpeed' === $key) {
			$denominators = array(8000, 6400, 5000, 4000, 3200, 2500, 2000, 1600, 1250, 1000, 800, 640, 500, 400, 320, 250, 200, 160, 125, 100, 80, 60, 50, 40, 30, 25, 20, 15, 13, 10, 8, 6, 5, 4, 3, 2);
			$options = array();
			foreach ($denominators as $denominator) {
				$options[(string) (1 / $denominator)] = '1/' . (string) $denominator . ' sec';
			}
			foreach (array('1' => '1 sec', '2' => '2 sec', '4' => '4 sec', '8' => '8 sec', '15' => '15 sec', '30' => '30 sec') as $value => $label) {
				$options[$value] = $label;
			}

			return $options;
		}

		if ('aperture' === $key) {
			$options = array();
			foreach (array('0.7', '0.8', '0.95', '1', '1.1', '1.2', '1.4', '1.6', '1.8', '2', '2.2', '2.5', '2.8', '3.2', '3.5', '4', '4.5', '5', '5.6', '6.3', '7.1', '8', '9', '10', '11', '13', '14', '16', '18', '20', '22', '25', '29', '32', '36', '40', '45', '51', '57', '64') as $value) {
				$options[$value] = 'f/' . $value;
			}

			return $options;
		}

		if ('iso' === $key) {
			$options = array();
			foreach (array(25, 32, 40, 50, 64, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6400, 8000, 10000, 12800, 16000, 20000, 25600, 32000, 40000, 51200, 64000, 80000, 102400, 204800, 409600) as $value) {
				$options[(string) $value] = 'ISO ' . (string) $value;
			}

			return $options;
		}

		return array();
	}
}

if (! function_exists('fbks_render_media_library_exif_select')) {
	function fbks_render_media_library_exif_select($attachment_id, $key, $current_value)
	{
		$current_value = fbks_sanitize_media_metadata_label($current_value);
		$options = fbks_get_media_library_exif_select_options($key);
		$option_values = array_map('strval', array_keys($options));
		$html = '<select class="fbks-media-exif-select" name="attachments[' . esc_attr((string) $attachment_id) . '][fbks_media_exif][' . esc_attr($key) . ']">';
		$html .= '<option value=""' . selected('', $current_value, false) . '>' . esc_html__('Unknown', 'folioblocks') . '</option>';

		if ('' !== $current_value && ! in_array($current_value, $option_values, true)) {
			$html .= '<option value="' . esc_attr($current_value) . '" selected>';
			$html .= esc_html(
				sprintf(
					/* translators: %s: current imported EXIF value */
					__('%s (current)', 'folioblocks'),
					fbks_format_media_library_exif_value($key, $current_value)
				)
			);
			$html .= '</option>';
		}

		foreach ($options as $value => $label) {
			$html .= '<option value="' . esc_attr((string) $value) . '"' . selected((string) $value, $current_value, false) . '>' . esc_html($label) . '</option>';
		}
		$html .= '</select>';

		return $html;
	}
}

if (! function_exists('fbks_get_media_library_exif_icon')) {
	function fbks_get_media_library_exif_icon($icon_name)
	{
		$icons = array(
			'camera'       => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 9.2c-2.2 0-3.9 1.8-3.9 4s1.8 4 3.9 4 4-1.8 4-4-1.8-4-4-4zm0 6.5c-1.4 0-2.4-1.1-2.4-2.5s1.1-2.5 2.4-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5zM20.2 8c-.1 0-.3 0-.5-.1l-2.5-.8c-.4-.1-.8-.4-1.1-.8l-1-1.5c-.4-.5-1-.9-1.7-.9h-2.9c-.6.1-1.2.4-1.6 1l-1 1.5c-.3.3-.6.6-1.1.7l-2.5.8c-.2.1-.4.1-.6.1-1 .2-1.7.9-1.7 1.9v8.3c0 1 .9 1.9 2 1.9h16c1.1 0 2-.8 2-1.9V9.9c0-1-.7-1.7-1.8-1.9zm.3 10.1c0 .2-.2.4-.5.4H4c-.3 0-.5-.2-.5-.4V9.9c0-.1.2-.3.5-.4.2 0 .5-.1.8-.2l2.5-.8c.7-.2 1.4-.6 1.8-1.3l1-1.5c.1-.1.2-.2.4-.2h2.9c.2 0 .3.1.4.2l1 1.5c.4.7 1.1 1.1 1.9 1.4l2.5.8c.3.1.6.1.8.2.3 0 .4.2.4.4v8.1z"/></svg>',
			'aspect-ratio' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18.5 5.5h-13c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2zm.5 11c0 .3-.2.5-.5.5h-13c-.3 0-.5-.2-.5-.5v-9c0-.3.2-.5.5-.5h13c.3 0 .5.2.5.5v9zM6.5 12H8v-2h2V8.5H6.5V12zm9.5 2h-2v1.5h3.5V12H16v2z"/></svg>',
			'time'         => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 16.5c-4.1 0-7.5-3.4-7.5-7.5S7.9 4.5 12 4.5s7.5 3.4 7.5 7.5-3.4 7.5-7.5 7.5zM12 7l-1 5c0 .3.2.6.4.8l4.2 2.8-2.7-4.1L12 7z"/></svg>',
			'aperture'     => '<svg viewBox="-16 -16 495 495" aria-hidden="true" focusable="false"><path fill="currentColor" d="M395.195,67.805C351.47,24.08,293.335,0,231.5,0S111.529,24.08,67.805,67.805S0,169.664,0,231.5S24.08,351.47,67.805,395.195S169.664,463,231.5,463s119.971-24.08,163.695-67.805S463,293.335,463,231.5S438.919,111.529,395.195,67.805z M443.392,186.803c-0.321,0.232-0.631,0.484-0.92,0.772l-79.886,79.886V59.168c7.689,5.873,15.045,12.285,22.002,19.243C414.732,108.555,434.877,146.025,443.392,186.803z M188.262,347.586l-72.848-72.848v-94.2l65.124-65.124h94.2l72.848,72.848v94.201l-65.124,65.124H188.262z M347.586,48.671v118.378L198.094,17.557C209.049,15.871,220.207,15,231.5,15C273.258,15,313.208,26.748,347.586,48.671z M78.411,78.411c28.553-28.552,63.68-48.134,101.964-57.36l79.362,79.362H59.168C65.042,92.725,71.454,85.369,78.411,78.411z M48.67,115.414h110.654L16.613,258.126C15.544,249.358,15,240.471,15,231.5C15,189.741,26.748,149.791,48.67,115.414z M19.607,276.196c0.321-0.232,0.631-0.484,0.92-0.772l79.886-79.886v208.294c-7.688-5.873-15.045-12.285-22.002-19.243C48.268,354.445,28.123,316.974,19.607,276.196z M115.414,414.329V295.951l149.491,149.491C253.951,447.129,242.792,448,231.5,448C189.741,448,149.791,436.252,115.414,414.329z M384.588,384.588c-28.553,28.552-63.68,48.134-101.965,57.36l-79.362-79.362h200.569C397.958,370.275,391.546,377.631,384.588,384.588z M414.329,347.586H303.675l142.712-142.712c1.068,8.767,1.613,17.655,1.613,26.626C448,273.258,436.252,313.208,414.329,347.586z"/></svg>',
			'iso'          => '<span class="fbks-media-exif-field__iso">ISO</span>',
		);

		return $icons[$icon_name] ?? '';
	}
}

if (! function_exists('fbks_render_media_library_exif_fields')) {
	function fbks_render_media_library_exif_fields($attachment_id, $library_exif, $embedded_exif, $can_edit)
	{
		$library_exif = fbks_normalize_media_exif_metadata($library_exif);
		$embedded_exif = fbks_normalize_media_exif_metadata($embedded_exif);
		$fields = array(
			'camera'       => array('label' => __('Camera', 'folioblocks'), 'icon' => 'camera'),
			'focalLength'  => array('label' => __('Focal Length', 'folioblocks'), 'icon' => 'aspect-ratio'),
			'shutterSpeed' => array('label' => __('Shutter Speed', 'folioblocks'), 'icon' => 'time'),
			'aperture'     => array('label' => __('Aperture', 'folioblocks'), 'icon' => 'aperture'),
			'iso'          => array('label' => __('ISO', 'folioblocks'), 'icon' => 'iso'),
		);
		$html = '<div class="fbks-media-exif-grid">';

		foreach ($fields as $key => $field) {
			$html .= '<label class="fbks-media-exif-field">';
			$html .= '<span class="fbks-media-exif-field__label">';
			$html .= '<span class="fbks-media-exif-field__icon" aria-hidden="true">' . fbks_get_media_library_exif_icon($field['icon']) . '</span>';
			$html .= '<span>' . esc_html($field['label']) . '</span></span>';
			if ($can_edit) {
				if (in_array($key, array('shutterSpeed', 'aperture', 'iso'), true)) {
					$html .= fbks_render_media_library_exif_select($attachment_id, $key, $library_exif[$key]);
				} else {
					$html .= '<input type="text" name="attachments[' . esc_attr((string) $attachment_id) . '][fbks_media_exif][' . esc_attr($key) . ']" value="' . esc_attr($library_exif[$key]) . '" />';
				}
			} else {
				$html .= '<span class="fbks-media-metadata-readonly fbks-media-metadata-readonly--field">' . esc_html(fbks_format_media_library_exif_value($key, $library_exif[$key])) . '</span>';
			}
			$html .= '<span class="fbks-media-exif-field__original">' . sprintf(
				/* translators: %s: embedded EXIF value */
				esc_html__('Embedded: %s', 'folioblocks'),
				esc_html(fbks_format_media_library_exif_value($key, $embedded_exif[$key]))
			) . '</span>';
			$html .= '</label>';
		}

		$html .= '</div>';

		return $html;
	}
}

if (! function_exists('fbks_add_media_metadata_attachment_fields')) {
	function fbks_add_media_metadata_attachment_fields($form_fields, $post)
	{
		if (
			! $post instanceof WP_Post ||
			! in_array($post->post_mime_type, array('image/jpeg', 'image/jpg'), true) ||
			! fbks_current_user_can_view_media_metadata($post->ID)
		) {
			return $form_fields;
		}

		$settings = fbks_get_media_metadata_settings();
		$record = fbks_get_attachment_media_metadata($post->ID);
		if (! is_array($record)) {
			$settings_url = admin_url('admin.php?page=folioblocks-global-settings');
			$form_fields['fbks_media_metadata_status'] = array(
				'label' => __('FolioBlocks Metadata', 'folioblocks'),
				'input' => 'html',
				'html'  => '<span class="fbks-media-metadata-readonly">' . esc_html__('Not scanned', 'folioblocks') . '</span>',
				'helps' => sprintf(
					/* translators: 1: opening link tag, 2: closing link tag */
					__('Use %1$sGlobal Settings%2$s to scan existing Media Library images.', 'folioblocks'),
					'<a href="' . esc_url($settings_url) . '">',
					'</a>'
				),
			);

			return $form_fields;
		}

		$can_edit = fbks_current_user_can_edit_media_metadata($post->ID);
		$library = $record['library'];
		$embedded = $record['embedded'];
		$form_fields['fbks_media_metadata_status'] = array(
			'label' => __('FolioBlocks Metadata', 'folioblocks'),
			'input' => 'html',
			'html'  => $can_edit
				? fbks_render_media_metadata_reset_control($post->ID, $record)
				: '<span class="fbks-media-metadata-badge">' . esc_html__('Imported', 'folioblocks') . '</span>',
			'helps' => $can_edit
				? __('Media values are editable. Embedded originals remain unchanged.', 'folioblocks')
				: __('Embedded originals remain unchanged.', 'folioblocks'),
		);

		if (in_array('exif', $settings['visibleMetadata'], true)) {
			$form_fields['fbks_media_exif'] = array(
				'label' => __('EXIF Data', 'folioblocks'),
				'input' => 'html',
				'html'  => fbks_render_media_library_exif_fields(
					$post->ID,
					$library['exif'],
					$embedded['exif'],
					$can_edit
				),
				'helps' => $can_edit
					? __('Media EXIF values can be edited without rewriting the embedded originals.', 'folioblocks')
					: __('The embedded EXIF values remain unchanged.', 'folioblocks'),
			);
		}

		if (in_array('ratings', $settings['visibleMetadata'], true)) {
			$form_fields['fbks_media_rating'] = array(
				'label' => __('Media Rating', 'folioblocks'),
				'input' => 'html',
				'html'  => fbks_render_media_library_rating_field($post->ID, $library['rating'], $settings, $can_edit),
				'helps' => sprintf(
					/* translators: %s: embedded star-rating label */
					__('Embedded Rating: %s', 'folioblocks'),
					esc_html(fbks_get_media_library_rating_label($embedded['rating'], $settings['unratedLabel']))
				),
			);
		}

		if (in_array('colors', $settings['visibleMetadata'], true)) {
			$embedded_color_class = fbks_sanitize_media_color_class($embedded['colorClass']);
			$embedded_class_label = null === $embedded_color_class
				? __('Unclassified', 'folioblocks')
				: sprintf(
					/* translators: %d: embedded numeric color-class value */
					__('Class %d', 'folioblocks'),
					$embedded_color_class
				);
			$form_fields['fbks_media_color_class'] = array(
				'label' => __('Media Color Class', 'folioblocks'),
				'input' => 'html',
				'html'  => fbks_render_media_library_color_class_field($post->ID, $library['colorClass'], $settings, $can_edit),
				'helps' => sprintf(
					/* translators: 1: embedded numeric color class, 2: embedded source label */
					__('Embedded: %1$s · Label: %2$s', 'folioblocks'),
					esc_html($embedded_class_label),
					esc_html($embedded['label'] ?: __('No label', 'folioblocks'))
				),
			);
		}
		return $form_fields;
	}
}
add_filter('attachment_fields_to_edit', 'fbks_add_media_metadata_attachment_fields', 20, 2);

if (! function_exists('fbks_sanitize_media_library_exif_changes')) {
	function fbks_sanitize_media_library_exif_changes($attachment_id, $raw_exif)
	{
		$record = fbks_get_attachment_media_metadata($attachment_id);
		$current_exif = is_array($record) ? $record['library']['exif'] : fbks_get_empty_media_exif_metadata();
		$raw_exif = is_array($raw_exif) ? $raw_exif : array();
		$changes = array();

		foreach (fbks_get_empty_media_exif_metadata() as $key => $default) {
			if (! array_key_exists($key, $raw_exif)) {
				continue;
			}
			$value = fbks_sanitize_media_metadata_label($raw_exif[$key]);
			$options = fbks_get_media_library_exif_select_options($key);
			if (empty($options)) {
				$changes[$key] = $value;
				continue;
			}

			$allowed_values = array_map('strval', array_keys($options));
			$current_value = fbks_sanitize_media_metadata_label($current_exif[$key] ?? $default);
			$changes[$key] = '' === $value || in_array($value, $allowed_values, true) || $value === $current_value
				? $value
				: $current_value;
		}

		return $changes;
	}
}

if (! function_exists('fbks_save_media_metadata_attachment_fields')) {
	function fbks_save_media_metadata_attachment_fields($post, $attachment)
	{
		$attachment_id = isset($post['ID']) ? absint($post['ID']) : 0;
		if (
			! $attachment_id ||
			! in_array(get_post_mime_type($attachment_id), array('image/jpeg', 'image/jpg'), true) ||
			! fbks_current_user_can_edit_media_metadata($attachment_id) ||
			! is_array($attachment) ||
			! array_intersect(
				array('fbks_media_rating', 'fbks_media_color_class', 'fbks_media_exif'),
				array_keys($attachment)
			)
		) {
			return $post;
		}

		$changes = array();
		if (array_key_exists('fbks_media_rating', $attachment)) {
			$changes['rating'] = fbks_sanitize_media_rating(wp_unslash($attachment['fbks_media_rating']));
		}
		if (array_key_exists('fbks_media_color_class', $attachment)) {
			$changes['colorClass'] = fbks_sanitize_media_color_class(wp_unslash($attachment['fbks_media_color_class']));
		}
		if (isset($attachment['fbks_media_exif']) && is_array($attachment['fbks_media_exif'])) {
			$changes['exif'] = fbks_sanitize_media_library_exif_changes(
				$attachment_id,
				wp_unslash($attachment['fbks_media_exif'])
			);
		}
		$result = fbks_update_attachment_library_media_metadata($attachment_id, $changes);
		if (is_wp_error($result)) {
			$post['errors']['fbks_media_metadata'][] = $result->get_error_message();
		}

		return $post;
	}
}
add_filter('attachment_fields_to_save', 'fbks_save_media_metadata_attachment_fields', 20, 2);

if (! function_exists('fbks_ajax_reset_media_metadata')) {
	function fbks_ajax_reset_media_metadata()
	{
		check_ajax_referer('fbks_reset_media_metadata', 'nonce');

		$attachment_id = isset($_POST['attachmentId']) ? absint($_POST['attachmentId']) : 0;
		$scope = isset($_POST['scope']) ? sanitize_key(wp_unslash($_POST['scope'])) : '';
		$scope_map = array(
			'all'        => 'all',
			'exif'       => 'exif',
			'rating'     => 'rating',
			'colorclass' => 'colorClass',
		);

		if (
			! $attachment_id ||
			! isset($scope_map[$scope]) ||
			! in_array(get_post_mime_type($attachment_id), array('image/jpeg', 'image/jpg'), true) ||
			! fbks_current_user_can_edit_media_metadata($attachment_id)
		) {
			wp_send_json_error(array('message' => __('You are not allowed to reset this media metadata.', 'folioblocks')), 403);
		}

		$record = fbks_reset_attachment_library_media_metadata($attachment_id, $scope_map[$scope]);
		if (is_wp_error($record)) {
			wp_send_json_error(array('message' => $record->get_error_message()), 400);
		}

		wp_send_json_success(array(
			'library'     => $record['library'],
			'differences' => fbks_get_media_metadata_library_differences($record),
		));
	}
}
add_action('wp_ajax_fbks_reset_media_metadata', 'fbks_ajax_reset_media_metadata');

if (! function_exists('fbks_enqueue_media_metadata_admin_styles')) {
	function fbks_enqueue_media_metadata_admin_styles()
	{
		if (! fbks_current_user_can_view_media_metadata()) {
			return;
		}

		$style_path = FBKS_PLUGIN_DIR . 'includes/pro/css/media-metadata-admin.css';
		wp_enqueue_style(
			'folioblocks-media-metadata-admin',
			FBKS_PLUGIN_URL . 'includes/pro/css/media-metadata-admin.css',
			array(),
			file_exists($style_path) ? filemtime($style_path) : FBKS_VERSION
		);

		$script_path = FBKS_PLUGIN_DIR . 'includes/pro/js/media-metadata-admin.js';
		wp_enqueue_script(
			'folioblocks-media-metadata-admin',
			FBKS_PLUGIN_URL . 'includes/pro/js/media-metadata-admin.js',
			array(),
			file_exists($script_path) ? filemtime($script_path) : FBKS_VERSION,
			true
		);
		wp_add_inline_script(
			'folioblocks-media-metadata-admin',
			'window.folioBlocksMediaMetadataAdmin = ' . wp_json_encode(array(
				'ajaxUrl'      => admin_url('admin-ajax.php'),
				'nonce'        => wp_create_nonce('fbks_reset_media_metadata'),
				'confirmReset' => __('Reset this Media Library value to the original value embedded in the image? The image file will not be changed.', 'folioblocks'),
				'errorMessage' => __('The metadata could not be reset. Please try again.', 'folioblocks'),
			)) . ';',
			'before'
		);
	}
}
add_action('admin_enqueue_scripts', 'fbks_enqueue_media_metadata_admin_styles');
