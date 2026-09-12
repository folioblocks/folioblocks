<?php

/**
 * Shared FolioBlocks attachment metadata storage and import helpers.
 *
 * @package FolioBlocks
 */

if (! defined('ABSPATH')) {
	exit;
}

require_once __DIR__ . '/media-metadata-parser.php';

if (! defined('FBKS_MEDIA_METADATA_META_KEY')) {
	define('FBKS_MEDIA_METADATA_META_KEY', '_fbks_media_metadata');
}

if (! defined('FBKS_MEDIA_METADATA_SCHEMA_VERSION')) {
	define('FBKS_MEDIA_METADATA_SCHEMA_VERSION', 2);
}

if (! defined('FBKS_MEDIA_METADATA_SETTINGS_OPTION')) {
	define('FBKS_MEDIA_METADATA_SETTINGS_OPTION', 'fbks_media_metadata_settings');
}

if (! function_exists('fbks_get_media_metadata_palette_presets')) {
	function fbks_get_media_metadata_palette_presets()
	{
		$presets = array(
			'getty' => array(
				'label' => __('Getty', 'folioblocks'),
				'items' => array(
					1 => array('enabled' => true, 'color' => '#dc2626', 'label' => __('Winner', 'folioblocks')),
					2 => array('enabled' => true, 'color' => '#eab308', 'label' => __('Winner Alt', 'folioblocks')),
					3 => array('enabled' => true, 'color' => '#16a34a', 'label' => __('Superior', 'folioblocks')),
					4 => array('enabled' => true, 'color' => '#2563eb', 'label' => __('Superior Alt', 'folioblocks')),
					5 => array('enabled' => true, 'color' => '#f97316', 'label' => __('Typical', 'folioblocks')),
					6 => array('enabled' => true, 'color' => '#ec4899', 'label' => __('Typical Alt', 'folioblocks')),
					7 => array('enabled' => true, 'color' => '#111827', 'label' => __('Extras', 'folioblocks')),
					8 => array('enabled' => true, 'color' => '#ffffff', 'label' => __('Trash', 'folioblocks')),
				),
			),
			'photo_mechanic_6' => array(
				'label' => __('Photo Mechanic', 'folioblocks'),
				'items' => array(
					1 => array('enabled' => true, 'color' => '#ff2028', 'label' => __('Red', 'folioblocks')),
					2 => array('enabled' => true, 'color' => '#fff238', 'label' => __('Yellow', 'folioblocks')),
					3 => array('enabled' => true, 'color' => '#00d94f', 'label' => __('Green', 'folioblocks')),
					4 => array('enabled' => true, 'color' => '#2f55eb', 'label' => __('Blue', 'folioblocks')),
					5 => array('enabled' => true, 'color' => '#ee38f2', 'label' => __('Purple', 'folioblocks')),
					6 => array('enabled' => true, 'color' => '#18dce2', 'label' => __('Cyan', 'folioblocks')),
					7 => array('enabled' => true, 'color' => '#985000', 'label' => __('Brown', 'folioblocks')),
					8 => array('enabled' => true, 'color' => '#333333', 'label' => __('Trash', 'folioblocks')),
				),
			),
			'adobe_bridge_lightroom' => array(
				'label' => __('Lightroom & Bridge', 'folioblocks'),
				'items' => array(
					1 => array('enabled' => true, 'color' => '#ef4444', 'label' => __('Select', 'folioblocks')),
					2 => array('enabled' => true, 'color' => '#eab308', 'label' => __('Second', 'folioblocks')),
					3 => array('enabled' => true, 'color' => '#22c55e', 'label' => __('Approved', 'folioblocks')),
					4 => array('enabled' => true, 'color' => '#3b82f6', 'label' => __('Review', 'folioblocks')),
					5 => array('enabled' => false, 'color' => '#ffffff', 'label' => __('Unused', 'folioblocks')),
					6 => array('enabled' => false, 'color' => '#ffffff', 'label' => __('Unused', 'folioblocks')),
					7 => array('enabled' => false, 'color' => '#ffffff', 'label' => __('Unused', 'folioblocks')),
					8 => array('enabled' => false, 'color' => '#ffffff', 'label' => __('Unused', 'folioblocks')),
				),
			),
			'custom' => array(
				'label' => __('Custom', 'folioblocks'),
				'items' => array(
					1 => array('enabled' => true, 'color' => '#dc2626', 'label' => __('Red', 'folioblocks')),
					2 => array('enabled' => true, 'color' => '#eab308', 'label' => __('Yellow', 'folioblocks')),
					3 => array('enabled' => true, 'color' => '#16a34a', 'label' => __('Green', 'folioblocks')),
					4 => array('enabled' => true, 'color' => '#2563eb', 'label' => __('Blue', 'folioblocks')),
					5 => array('enabled' => true, 'color' => '#f97316', 'label' => __('Orange', 'folioblocks')),
					6 => array('enabled' => true, 'color' => '#ec4899', 'label' => __('Pink', 'folioblocks')),
					7 => array('enabled' => true, 'color' => '#111827', 'label' => __('Black', 'folioblocks')),
					8 => array('enabled' => true, 'color' => '#ffffff', 'label' => __('White', 'folioblocks')),
				),
			),
			'capture_one' => array(
				'label' => __('Capture One', 'folioblocks'),
				'items' => array(
					1 => array('enabled' => true, 'color' => '#ff0000', 'label' => __('Red', 'folioblocks')),
					2 => array('enabled' => true, 'color' => '#eb7e02', 'label' => __('Orange', 'folioblocks')),
					3 => array('enabled' => true, 'color' => '#ffee00', 'label' => __('Yellow', 'folioblocks')),
					4 => array('enabled' => true, 'color' => '#59db35', 'label' => __('Green', 'folioblocks')),
					5 => array('enabled' => true, 'color' => '#2856fc', 'label' => __('Blue', 'folioblocks')),
					6 => array('enabled' => true, 'color' => '#ff80ff', 'label' => __('Pink', 'folioblocks')),
					7 => array('enabled' => true, 'color' => '#8f00b3', 'label' => __('Purple', 'folioblocks')),
					8 => array('enabled' => false, 'color' => '#ffffff', 'label' => __('Unused', 'folioblocks')),
				),
			),
		);

		uasort($presets, function ($first, $second) {
			return strnatcasecmp($first['label'], $second['label']);
		});

		return $presets;
	}
}

if (! function_exists('fbks_get_media_metadata_settings_defaults')) {
	function fbks_get_media_metadata_settings_defaults()
	{
		$presets = fbks_get_media_metadata_palette_presets();

		return array(
			'importExif'         => true,
			'importRatings'      => true,
			'importColorClasses' => true,
			'showInMediaLibrary' => true,
			'visibleMetadata'    => array('exif', 'ratings', 'colors'),
			'allowEditing'       => true,
			'viewRoles'          => array('administrator'),
			'editRoles'          => array('administrator'),
			'enableStarRatings'  => true,
			'unratedLabel'       => __('Unrated', 'folioblocks'),
			'enableColorClasses' => true,
			'palettePreset'      => 'custom',
			'palette'            => $presets['custom']['items'],
		);
	}
}

if (! function_exists('fbks_sanitize_media_metadata_boolean')) {
	function fbks_sanitize_media_metadata_boolean($value)
	{
		return true === $value || 1 === $value || '1' === (string) $value || 'true' === $value;
	}
}

if (! function_exists('fbks_sanitize_media_metadata_roles')) {
	function fbks_sanitize_media_metadata_roles($roles, $fallback = array('administrator'))
	{
		$roles = is_array($roles) ? $roles : array();
		$available_roles = wp_roles()->roles;
		$sanitized = array();

		foreach ($roles as $role) {
			$role = sanitize_key($role);
			if (isset($available_roles[$role])) {
				$sanitized[] = $role;
			}
		}

		$sanitized[] = 'administrator';

		return array_values(array_unique(array_filter($sanitized ?: $fallback)));
	}
}

if (! function_exists('fbks_sanitize_media_metadata_palette')) {
	function fbks_sanitize_media_metadata_palette($palette, $fallback)
	{
		$palette = is_array($palette) ? $palette : array();
		$items = array();

		for ($value = 1; $value <= 8; $value++) {
			$source = isset($palette[$value]) && is_array($palette[$value]) ? $palette[$value] : array();
			$fallback_item = isset($fallback[$value]) ? $fallback[$value] : array(
				'enabled' => true,
				'color'   => '#808080',
				'label'   => sprintf(__('Class %d', 'folioblocks'), $value),
			);
			$color = sanitize_hex_color($source['color'] ?? $fallback_item['color']);
			$label = sanitize_text_field($source['label'] ?? $fallback_item['label']);

			$items[$value] = array(
				'enabled' => fbks_sanitize_media_metadata_boolean($source['enabled'] ?? false),
				'color'   => $color ?: $fallback_item['color'],
				'label'   => '' !== $label ? $label : sprintf(__('Class %d', 'folioblocks'), $value),
			);
		}

		return $items;
	}
}

if (! function_exists('fbks_sanitize_media_metadata_settings')) {
	function fbks_sanitize_media_metadata_settings($settings)
	{
		$defaults = fbks_get_media_metadata_settings_defaults();
		$settings = is_array($settings) ? wp_parse_args($settings, $defaults) : $defaults;
		$presets = fbks_get_media_metadata_palette_presets();
		$preset = sanitize_key($settings['palettePreset'] ?? $defaults['palettePreset']);
		$allowed_presets = array_keys($presets);

		if (! in_array($preset, $allowed_presets, true)) {
			$preset = $defaults['palettePreset'];
		}

		$edit_roles = fbks_sanitize_media_metadata_roles($settings['editRoles'] ?? array());
		$view_roles = array_values(array_unique(array_merge(
			fbks_sanitize_media_metadata_roles($settings['viewRoles'] ?? array()),
			$edit_roles
		)));
		$palette = 'custom' === $preset
			? $settings['palette']
			: $presets[$preset]['items'];
		$visible_metadata = isset($settings['visibleMetadata']) && is_array($settings['visibleMetadata'])
			? array_map('sanitize_key', $settings['visibleMetadata'])
			: $defaults['visibleMetadata'];
		$visible_metadata = array_values(array_intersect(
			array('exif', 'ratings', 'colors'),
			$visible_metadata
		));
		if (empty($visible_metadata)) {
			$visible_metadata = $defaults['visibleMetadata'];
		}

		return array(
			'importExif'         => fbks_sanitize_media_metadata_boolean($settings['importExif'] ?? false),
			'importRatings'      => fbks_sanitize_media_metadata_boolean($settings['importRatings'] ?? false),
			'importColorClasses' => fbks_sanitize_media_metadata_boolean($settings['importColorClasses'] ?? false),
			'showInMediaLibrary' => fbks_sanitize_media_metadata_boolean($settings['showInMediaLibrary'] ?? false),
			'visibleMetadata'    => $visible_metadata,
			'allowEditing'       => fbks_sanitize_media_metadata_boolean($settings['allowEditing'] ?? false),
			'viewRoles'          => $view_roles,
			'editRoles'          => $edit_roles,
			'enableStarRatings'  => fbks_sanitize_media_metadata_boolean($settings['enableStarRatings'] ?? false),
			'unratedLabel'       => sanitize_text_field($settings['unratedLabel'] ?? $defaults['unratedLabel']),
			'enableColorClasses' => fbks_sanitize_media_metadata_boolean($settings['enableColorClasses'] ?? false),
			'palettePreset'      => $preset,
			'palette'            => fbks_sanitize_media_metadata_palette($palette, $defaults['palette']),
		);
	}
}

if (! function_exists('fbks_get_media_metadata_settings')) {
	function fbks_get_media_metadata_settings()
	{
		$stored = get_option(FBKS_MEDIA_METADATA_SETTINGS_OPTION, null);
		if (! is_array($stored)) {
			return fbks_get_media_metadata_settings_defaults();
		}

		return fbks_sanitize_media_metadata_settings($stored);
	}
}

if (! function_exists('fbks_apply_media_metadata_import_settings')) {
	function fbks_apply_media_metadata_import_settings($metadata, $settings)
	{
		$metadata = is_array($metadata) ? $metadata : array();
		$settings = is_array($settings) ? $settings : fbks_get_media_metadata_settings_defaults();

		if (empty($settings['importRatings'])) {
			$metadata['rating'] = null;
			unset($metadata['sourceFields']['xmpRating']);
		}
		if (empty($settings['importColorClasses'])) {
			$metadata['colorClass'] = null;
			$metadata['colorClassSource'] = null;
			$metadata['label'] = '';
			$metadata['tagged'] = null;
			unset(
				$metadata['sourceFields']['xmpLabel'],
				$metadata['sourceFields']['photoMechanicColorClass'],
				$metadata['sourceFields']['photoMechanicTagged'],
				$metadata['sourceFields']['photoshopUrgency']
			);
		}
		if (empty($settings['importExif'])) {
			$metadata['exif'] = fbks_get_empty_media_exif_metadata();
		}

		return $metadata;
	}
}

if (! function_exists('fbks_current_user_has_media_metadata_role')) {
	function fbks_current_user_has_media_metadata_role($allowed_roles)
	{
		if (current_user_can('manage_options')) {
			return true;
		}

		$user = wp_get_current_user();

		return (bool) array_intersect((array) $user->roles, (array) $allowed_roles);
	}
}

if (! function_exists('fbks_current_user_can_view_media_metadata')) {
	function fbks_current_user_can_view_media_metadata($attachment_id = 0)
	{
		$settings = fbks_get_media_metadata_settings();
		if (! $settings['showInMediaLibrary'] || ! fbks_current_user_has_media_metadata_role($settings['viewRoles'])) {
			return false;
		}

		return ! $attachment_id || current_user_can('edit_post', absint($attachment_id));
	}
}

if (! function_exists('fbks_current_user_can_edit_media_metadata')) {
	function fbks_current_user_can_edit_media_metadata($attachment_id = 0)
	{
		$settings = fbks_get_media_metadata_settings();
		if (! $settings['showInMediaLibrary'] || ! $settings['allowEditing'] || ! fbks_current_user_has_media_metadata_role($settings['editRoles'])) {
			return false;
		}

		return ! $attachment_id || current_user_can('edit_post', absint($attachment_id));
	}
}

if (! function_exists('fbks_sanitize_media_rating')) {
	function fbks_sanitize_media_rating($value)
	{
		return fbks_media_metadata_normalize_integer($value, 1, 5);
	}
}

if (! function_exists('fbks_sanitize_media_color_class')) {
	function fbks_sanitize_media_color_class($value)
	{
		return fbks_media_metadata_normalize_integer($value, 1, 8);
	}
}

if (! function_exists('fbks_sanitize_media_metadata_label')) {
	function fbks_sanitize_media_metadata_label($value)
	{
		return sanitize_text_field(fbks_media_metadata_clean_scalar($value));
	}
}

if (! function_exists('fbks_get_empty_media_exif_metadata')) {
	function fbks_get_empty_media_exif_metadata()
	{
		return array(
			'camera'       => '',
			'focalLength'  => '',
			'shutterSpeed' => '',
			'aperture'     => '',
			'iso'          => '',
		);
	}
}

if (! function_exists('fbks_normalize_media_exif_metadata')) {
	function fbks_normalize_media_exif_metadata($metadata)
	{
		$metadata = is_array($metadata) ? $metadata : array();
		$normalized = array();

		foreach (fbks_get_empty_media_exif_metadata() as $key => $default) {
			$normalized[$key] = fbks_sanitize_media_metadata_label($metadata[$key] ?? $default);
		}

		return $normalized;
	}
}

if (! function_exists('fbks_extract_attachment_exif_metadata')) {
	function fbks_extract_attachment_exif_metadata($attachment_id, $attachment_metadata = array())
	{
		$attachment_metadata = is_array($attachment_metadata) ? $attachment_metadata : array();
		if (empty($attachment_metadata['image_meta']) || ! is_array($attachment_metadata['image_meta'])) {
			$attachment_metadata = wp_get_attachment_metadata(absint($attachment_id));
		}

		$image_meta = isset($attachment_metadata['image_meta']) && is_array($attachment_metadata['image_meta'])
			? $attachment_metadata['image_meta']
			: array();
		$shutter_speed = $image_meta['shutter_speed'] ?? '';
		if ('' === (string) $shutter_speed && function_exists('fbks_get_attachment_shutter_speed_from_exif')) {
			$shutter_speed = fbks_get_attachment_shutter_speed_from_exif($attachment_id);
		}

		return fbks_normalize_media_exif_metadata(array(
			'camera'       => $image_meta['camera'] ?? '',
			'focalLength'  => $image_meta['focal_length'] ?? '',
			'shutterSpeed' => $shutter_speed,
			'aperture'     => $image_meta['aperture'] ?? '',
			'iso'          => $image_meta['iso'] ?? '',
		));
	}
}

if (! function_exists('fbks_get_empty_embedded_media_metadata')) {
	function fbks_get_empty_embedded_media_metadata()
	{
		return array(
			'rating'           => null,
			'colorClass'       => null,
			'colorClassSource' => null,
			'label'            => '',
			'tagged'           => null,
			'sourceFields'     => array(),
			'exif'             => fbks_get_empty_media_exif_metadata(),
		);
	}
}

if (! function_exists('fbks_normalize_embedded_media_metadata')) {
	function fbks_normalize_embedded_media_metadata($metadata)
	{
		$metadata = is_array($metadata) ? $metadata : array();
		$source_fields = array();
		$allowed_source_fields = array(
			'xmpRating',
			'xmpLabel',
			'photoMechanicColorClass',
			'photoMechanicTagged',
			'photoshopUrgency',
		);

		if (! empty($metadata['sourceFields']) && is_array($metadata['sourceFields'])) {
			foreach ($allowed_source_fields as $key) {
				if (array_key_exists($key, $metadata['sourceFields'])) {
					$value = fbks_sanitize_media_metadata_label($metadata['sourceFields'][$key]);
					if ('' !== $value) {
						$source_fields[$key] = $value;
					}
				}
			}
		}

		$color_class_source = isset($metadata['colorClassSource'])
			? fbks_sanitize_media_metadata_label($metadata['colorClassSource'])
			: '';

		return array(
			'rating'           => fbks_sanitize_media_rating($metadata['rating'] ?? null),
			'colorClass'       => fbks_sanitize_media_color_class($metadata['colorClass'] ?? null),
			'colorClassSource' => '' !== $color_class_source ? $color_class_source : null,
			'label'            => fbks_sanitize_media_metadata_label($metadata['label'] ?? ''),
			'tagged'           => isset($metadata['tagged']) && is_bool($metadata['tagged'])
				? $metadata['tagged']
				: null,
			'sourceFields'     => $source_fields,
			'exif'             => fbks_normalize_media_exif_metadata($metadata['exif'] ?? array()),
		);
	}
}

if (! function_exists('fbks_normalize_library_media_metadata')) {
	function fbks_normalize_library_media_metadata($metadata, $embedded = array())
	{
		$metadata = is_array($metadata) ? $metadata : array();
		$embedded = fbks_normalize_embedded_media_metadata($embedded);

		return array(
			'rating'     => array_key_exists('rating', $metadata)
				? fbks_sanitize_media_rating($metadata['rating'])
				: $embedded['rating'],
			'colorClass' => array_key_exists('colorClass', $metadata)
				? fbks_sanitize_media_color_class($metadata['colorClass'])
				: $embedded['colorClass'],
			'exif'       => array_key_exists('exif', $metadata)
				? fbks_normalize_media_exif_metadata($metadata['exif'])
				: $embedded['exif'],
		);
	}
}

if (! function_exists('fbks_normalize_media_metadata_record')) {
	function fbks_normalize_media_metadata_record($record)
	{
		$record = is_array($record) ? $record : array();
		$embedded = fbks_normalize_embedded_media_metadata($record['embedded'] ?? array());

		return array(
			'version'      => FBKS_MEDIA_METADATA_SCHEMA_VERSION,
			'embedded'     => $embedded,
			'library'      => fbks_normalize_library_media_metadata($record['library'] ?? array(), $embedded),
			'importedAt'   => fbks_sanitize_media_metadata_label($record['importedAt'] ?? ''),
			'fileModified' => fbks_sanitize_media_metadata_label($record['fileModified'] ?? ''),
		);
	}
}

if (! function_exists('fbks_get_attachment_media_metadata')) {
	function fbks_get_attachment_media_metadata($attachment_id, $import_if_missing = false)
	{
		$attachment_id = absint($attachment_id);
		if (! $attachment_id) {
			return null;
		}

		$record = get_post_meta($attachment_id, FBKS_MEDIA_METADATA_META_KEY, true);
		if ((! is_array($record) || empty($record['version'])) && $import_if_missing) {
			$record = fbks_import_attachment_media_metadata($attachment_id);
		}

		return is_array($record) ? fbks_normalize_media_metadata_record($record) : null;
	}
}

if (! function_exists('fbks_get_attachment_media_metadata_file')) {
	function fbks_get_attachment_media_metadata_file($attachment_id, $attachment_metadata = array())
	{
		$attached_file = get_attached_file($attachment_id);
		$attachment_metadata = is_array($attachment_metadata) ? $attachment_metadata : array();

		if ($attached_file && ! empty($attachment_metadata['original_image'])) {
			$pending_original = trailingslashit(dirname($attached_file)) . basename($attachment_metadata['original_image']);
			if (is_readable($pending_original)) {
				return $pending_original;
			}
		}

		if (function_exists('wp_get_original_image_path')) {
			$original_file = wp_get_original_image_path($attachment_id);
			if ($original_file && is_readable($original_file)) {
				return $original_file;
			}
		}

		return $attached_file && is_readable($attached_file) ? $attached_file : '';
	}
}

if (! function_exists('fbks_import_attachment_media_metadata')) {
	function fbks_import_attachment_media_metadata($attachment_id, $force = false, $reset_library = false, $attachment_metadata = array())
	{
		$attachment_id = absint($attachment_id);
		if (! $attachment_id || 'attachment' !== get_post_type($attachment_id)) {
			return new WP_Error('fbks_invalid_attachment', __('A valid attachment is required.', 'folioblocks'));
		}

		$mime_type = (string) get_post_mime_type($attachment_id);
		if (! in_array($mime_type, array('image/jpeg', 'image/jpg'), true)) {
			return new WP_Error('fbks_unsupported_metadata_type', __('FolioBlocks metadata import currently supports JPEG images.', 'folioblocks'));
		}

		$existing = get_post_meta($attachment_id, FBKS_MEDIA_METADATA_META_KEY, true);
		if (! $force && is_array($existing) && ! empty($existing['version'])) {
			return fbks_normalize_media_metadata_record($existing);
		}

		$file_path = fbks_get_attachment_media_metadata_file($attachment_id, $attachment_metadata);
		if (! $file_path) {
			return new WP_Error('fbks_unreadable_attachment', __('The original attachment file could not be read.', 'folioblocks'));
		}

		$extracted = fbks_media_metadata_extract_from_jpeg($file_path);
		$extracted['exif'] = fbks_extract_attachment_exif_metadata($attachment_id, $attachment_metadata);
		$extracted = fbks_apply_media_metadata_import_settings($extracted, fbks_get_media_metadata_settings());
		$embedded = fbks_normalize_embedded_media_metadata($extracted);
		$library = $embedded;

		if (! $reset_library && is_array($existing) && isset($existing['library'])) {
			$library = fbks_normalize_library_media_metadata($existing['library'], $embedded);
		}

		$file_modified = filemtime($file_path);
		$record = fbks_normalize_media_metadata_record(array(
			'version'      => FBKS_MEDIA_METADATA_SCHEMA_VERSION,
			'embedded'     => $embedded,
			'library'      => $library,
			'importedAt'   => gmdate('c'),
			'fileModified' => false !== $file_modified ? gmdate('c', $file_modified) : '',
		));

		update_post_meta($attachment_id, FBKS_MEDIA_METADATA_META_KEY, $record);

		return $record;
	}
}

if (! function_exists('fbks_update_attachment_library_media_metadata')) {
	function fbks_update_attachment_library_media_metadata($attachment_id, $changes)
	{
		$attachment_id = absint($attachment_id);
		$record = fbks_get_attachment_media_metadata($attachment_id, true);

		if (! is_array($record)) {
			return new WP_Error('fbks_missing_media_metadata', __('FolioBlocks metadata could not be loaded for this attachment.', 'folioblocks'));
		}

		$changes = is_array($changes) ? $changes : array();
		$library_changes = array_merge($record['library'], $changes);
		if (isset($changes['exif']) && is_array($changes['exif'])) {
			$library_changes['exif'] = array_merge($record['library']['exif'], $changes['exif']);
		}
		$record['library'] = fbks_normalize_library_media_metadata(
			$library_changes,
			$record['embedded']
		);
		update_post_meta($attachment_id, FBKS_MEDIA_METADATA_META_KEY, $record);

		return $record;
	}
}

if (! function_exists('fbks_reset_attachment_library_media_metadata')) {
	function fbks_reset_attachment_library_media_metadata($attachment_id, $section = 'all')
	{
		$attachment_id = absint($attachment_id);
		$record = fbks_get_attachment_media_metadata($attachment_id, true);

		if (! is_array($record)) {
			return new WP_Error('fbks_missing_media_metadata', __('FolioBlocks metadata could not be loaded for this attachment.', 'folioblocks'));
		}

		$allowed_sections = array('all', 'exif', 'rating', 'colorClass');
		$section = in_array($section, $allowed_sections, true) ? $section : '';
		if ('' === $section) {
			return new WP_Error('fbks_invalid_media_metadata_section', __('A valid metadata section is required.', 'folioblocks'));
		}

		if ('all' === $section) {
			$record['library'] = fbks_normalize_library_media_metadata($record['embedded'], $record['embedded']);
		} elseif ('exif' === $section) {
			$record['library']['exif'] = $record['embedded']['exif'];
		} else {
			$record['library'][$section] = $record['embedded'][$section];
		}
		$record['library'] = fbks_normalize_library_media_metadata($record['library'], $record['embedded']);
		update_post_meta($attachment_id, FBKS_MEDIA_METADATA_META_KEY, $record);

		return $record;
	}
}

if (! function_exists('fbks_import_media_metadata_during_generation')) {
	function fbks_import_media_metadata_during_generation($metadata, $attachment_id)
	{
		$settings = fbks_get_media_metadata_settings();
		$has_enabled_import = $settings['importExif'] || $settings['importRatings'] || $settings['importColorClasses'];

		if ($has_enabled_import && apply_filters('fbks_import_media_metadata_on_upload', true, $attachment_id)) {
			fbks_import_attachment_media_metadata($attachment_id, false, false, $metadata);
		}

		return $metadata;
	}
}
add_filter('wp_generate_attachment_metadata', 'fbks_import_media_metadata_during_generation', 20, 2);

if (! function_exists('fbks_register_attachment_media_metadata_rest_field')) {
	function fbks_register_attachment_media_metadata_rest_field()
	{
		register_rest_field(
			'attachment',
			'folioblocks_media_metadata',
			array(
				'get_callback' => function ($attachment) {
					$attachment_id = isset($attachment['id']) ? absint($attachment['id']) : 0;
					if (! $attachment_id || ! fbks_current_user_can_view_media_metadata($attachment_id)) {
						return null;
					}

					return fbks_get_attachment_media_metadata($attachment_id);
				},
				'schema' => array(
					'description' => __('Normalized FolioBlocks media rating and color-class metadata.', 'folioblocks'),
					'type'        => array('object', 'null'),
					'context'     => array('edit'),
					'readonly'    => true,
				),
			)
		);
	}
}
add_action('rest_api_init', 'fbks_register_attachment_media_metadata_rest_field');
