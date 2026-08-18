<?php

/**
 * Shared EXIF metadata helpers.
 *
 * @package FolioBlocks
 */

if (! defined('ABSPATH')) {
    exit;
}

function fbks_exif_fraction_to_float($value)
{
    if (is_array($value)) {
        $value = reset($value);
    }

    if (! is_scalar($value)) {
        return null;
    }

    $value = trim((string) $value);

    if ('' === $value) {
        return null;
    }

    if (strpos($value, '/') !== false) {
        $parts = explode('/', $value, 2);
        $numerator = isset($parts[0]) ? (float) trim($parts[0]) : 0.0;
        $denominator = isset($parts[1]) ? (float) trim($parts[1]) : 0.0;

        if (0.0 === $denominator) {
            return null;
        }

        return $numerator / $denominator;
    }

    return is_numeric($value) ? (float) $value : null;
}

function fbks_format_exif_seconds_value($seconds)
{
    if (! is_numeric($seconds) || $seconds <= 0) {
        return '';
    }

    $precision = $seconds >= 1 ? 2 : 6;
    $formatted = number_format((float) $seconds, $precision, '.', '');

    return rtrim(rtrim($formatted, '0'), '.');
}

function fbks_get_attachment_shutter_speed_from_exif($attachment_id)
{
    if (! function_exists('exif_read_data')) {
        return '';
    }

    $file = get_attached_file($attachment_id);

    if (! $file || ! file_exists($file)) {
        return '';
    }

    $exif = @exif_read_data($file, null, true);

    if (! is_array($exif)) {
        return '';
    }

    $exif_section = isset($exif['EXIF']) && is_array($exif['EXIF']) ? $exif['EXIF'] : array();

    if (! empty($exif_section['ExposureTime'])) {
        $exposure_time = fbks_exif_fraction_to_float($exif_section['ExposureTime']);

        if (null !== $exposure_time) {
            return fbks_format_exif_seconds_value($exposure_time);
        }
    }

    if (empty($exif_section['ShutterSpeedValue'])) {
        return '';
    }

    $shutter_value = fbks_exif_fraction_to_float($exif_section['ShutterSpeedValue']);

    if (null === $shutter_value) {
        return '';
    }

    return fbks_format_exif_seconds_value(pow(2, -$shutter_value));
}

function fbks_add_shutter_speed_fallback_to_attachment_metadata($metadata, $attachment_id)
{
    if (
        ! is_array($metadata) ||
        empty($metadata['image_meta']) ||
        ! is_array($metadata['image_meta'])
    ) {
        return $metadata;
    }

    if (! empty($metadata['image_meta']['shutter_speed'])) {
        return $metadata;
    }

    $shutter_speed = fbks_get_attachment_shutter_speed_from_exif($attachment_id);

    if ('' !== $shutter_speed) {
        $metadata['image_meta']['shutter_speed'] = $shutter_speed;
    }

    return $metadata;
}
add_filter('wp_update_attachment_metadata', 'fbks_add_shutter_speed_fallback_to_attachment_metadata', 10, 2);

function fbks_register_attachment_exif_rest_fields()
{
    register_rest_field(
        'attachment',
        'folioblocks_image_meta',
        array(
            'get_callback' => function ($attachment) {
                $attachment_id = isset($attachment['id']) ? (int) $attachment['id'] : 0;

                return array(
                    'shutter_speed' => $attachment_id
                        ? fbks_get_attachment_shutter_speed_from_exif($attachment_id)
                        : '',
                );
            },
            'schema' => array(
                'description' => __('FolioBlocks image metadata fallbacks.', 'folioblocks'),
                'type'        => 'object',
                'context'     => array('view', 'edit'),
                'properties'  => array(
                    'shutter_speed' => array(
                        'type' => 'string',
                    ),
                ),
            ),
        )
    );
}
add_action('rest_api_init', 'fbks_register_attachment_exif_rest_fields');
