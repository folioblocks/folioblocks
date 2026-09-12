<?php

/**
 * Low-level media metadata parsing helpers.
 *
 * This file intentionally has no WordPress dependencies so the parser can be
 * tested in isolation.
 *
 * @package FolioBlocks
 */

if (! function_exists('fbks_media_metadata_clean_scalar')) {
	function fbks_media_metadata_clean_scalar($value)
	{
		if (! is_scalar($value)) {
			return '';
		}

		$value = html_entity_decode((string) $value, ENT_QUOTES | ENT_XML1, 'UTF-8');
		$value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value);

		return trim(strip_tags((string) $value));
	}
}

if (! function_exists('fbks_media_metadata_normalize_integer')) {
	function fbks_media_metadata_normalize_integer($value, $minimum, $maximum)
	{
		$value = fbks_media_metadata_clean_scalar($value);
		if ('' === $value || ! preg_match('/^-?\d+$/', $value)) {
			return null;
		}

		$value = (int) $value;

		return $value >= $minimum && $value <= $maximum ? $value : null;
	}
}

if (! function_exists('fbks_media_metadata_normalize_boolean')) {
	function fbks_media_metadata_normalize_boolean($value)
	{
		$value = strtolower(fbks_media_metadata_clean_scalar($value));

		if (in_array($value, array('true', '1', 'yes'), true)) {
			return true;
		}

		if (in_array($value, array('false', '0', 'no'), true)) {
			return false;
		}

		return null;
	}
}

if (! function_exists('fbks_media_metadata_dom_value')) {
	function fbks_media_metadata_dom_value($document, $namespace, $local_name)
	{
		if (! $document instanceof DOMDocument) {
			return '';
		}

		$elements = $document->getElementsByTagNameNS($namespace, $local_name);
		if ($elements->length > 0) {
			$value = fbks_media_metadata_clean_scalar($elements->item(0)->textContent);
			if ('' !== $value) {
				return $value;
			}
		}

		foreach ($document->getElementsByTagName('*') as $element) {
			if (! $element->hasAttributes()) {
				continue;
			}

			$attribute = $element->attributes->getNamedItemNS($namespace, $local_name);
			if ($attribute) {
				return fbks_media_metadata_clean_scalar($attribute->nodeValue);
			}
		}

		return '';
	}
}

if (! function_exists('fbks_media_metadata_regex_value')) {
	function fbks_media_metadata_regex_value($xmp, $prefix, $local_name)
	{
		$property = preg_quote($prefix . ':' . $local_name, '/');

		if (preg_match('/\b' . $property . '\s*=\s*(["\'])(.*?)\1/is', $xmp, $matches)) {
			return fbks_media_metadata_clean_scalar($matches[2]);
		}

		if (preg_match('/<' . $property . '\b[^>]*>(.*?)<\/' . $property . '\s*>/is', $xmp, $matches)) {
			return fbks_media_metadata_clean_scalar($matches[1]);
		}

		return '';
	}
}

if (! function_exists('fbks_media_metadata_parse_xmp')) {
	function fbks_media_metadata_parse_xmp($xmp)
	{
		$xmp = is_string($xmp) ? trim($xmp, "\x00\xEF\xBB\xBF \t\n\r") : '';
		$namespaces = array(
			'xmp'           => 'http://ns.adobe.com/xap/1.0/',
			'photoshop'     => 'http://ns.adobe.com/photoshop/1.0/',
			'photomechanic' => 'http://ns.camerabits.com/photomechanic/1.0/',
		);
		$properties = array(
			'xmpRating'              => array('xmp', 'Rating'),
			'xmpLabel'               => array('xmp', 'Label'),
			'photoMechanicColorClass' => array('photomechanic', 'ColorClass'),
			'photoMechanicTagged'     => array('photomechanic', 'Tagged'),
			'photoshopUrgency'        => array('photoshop', 'Urgency'),
		);
		$source_fields = array();
		$document = null;

		if ('' !== $xmp && class_exists('DOMDocument')) {
			$previous_errors = libxml_use_internal_errors(true);
			$document = new DOMDocument();
			$loaded = $document->loadXML($xmp, LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING | LIBXML_COMPACT);
			libxml_clear_errors();
			libxml_use_internal_errors($previous_errors);

			if (! $loaded) {
				$document = null;
			}
		}

		foreach ($properties as $key => $property) {
			list($prefix, $local_name) = $property;
			$value = $document
				? fbks_media_metadata_dom_value($document, $namespaces[$prefix], $local_name)
				: fbks_media_metadata_regex_value($xmp, $prefix, $local_name);

			if ('' !== $value) {
				$source_fields[$key] = $value;
			}
		}

		$rating = fbks_media_metadata_normalize_integer($source_fields['xmpRating'] ?? '', 1, 5);
		$photo_mechanic_color_class = fbks_media_metadata_normalize_integer(
			$source_fields['photoMechanicColorClass'] ?? '',
			1,
			8
		);
		$photoshop_urgency = fbks_media_metadata_normalize_integer(
			$source_fields['photoshopUrgency'] ?? '',
			1,
			8
		);
		$color_class = null !== $photo_mechanic_color_class
			? $photo_mechanic_color_class
			: $photoshop_urgency;
		$color_class_source = null;

		if (null !== $photo_mechanic_color_class) {
			$color_class_source = 'photomechanic:ColorClass';
		} elseif (null !== $photoshop_urgency) {
			$color_class_source = 'photoshop:Urgency';
		}

		return array(
			'rating'           => $rating,
			'colorClass'       => $color_class,
			'colorClassSource' => $color_class_source,
			'label'            => fbks_media_metadata_clean_scalar($source_fields['xmpLabel'] ?? ''),
			'tagged'           => fbks_media_metadata_normalize_boolean($source_fields['photoMechanicTagged'] ?? ''),
			'sourceFields'     => $source_fields,
		);
	}
}

if (! function_exists('fbks_media_metadata_extract_xmp_packets_from_jpeg')) {
	function fbks_media_metadata_extract_xmp_packets_from_jpeg($file_path)
	{
		if (! is_string($file_path) || '' === $file_path || ! is_readable($file_path)) {
			return array();
		}

		$handle = fopen($file_path, 'rb');
		if (! $handle) {
			return array();
		}

		$packets = array();
		$xmp_header = "http://ns.adobe.com/xap/1.0/\x00";

		if ("\xFF\xD8" !== fread($handle, 2)) {
			fclose($handle);
			return array();
		}

		while (! feof($handle)) {
			$byte = fread($handle, 1);
			if ("\xFF" !== $byte) {
				continue;
			}

			do {
				$marker_byte = fread($handle, 1);
			} while ("\xFF" === $marker_byte);

			if ('' === $marker_byte || false === $marker_byte) {
				break;
			}

			$marker = ord($marker_byte);
			if (0xD9 === $marker || 0xDA === $marker) {
				break;
			}

			if (0x01 === $marker || ($marker >= 0xD0 && $marker <= 0xD8)) {
				continue;
			}

			$length_bytes = fread($handle, 2);
			if (2 !== strlen($length_bytes)) {
				break;
			}

			$length_data = unpack('nlength', $length_bytes);
			$payload_length = isset($length_data['length']) ? (int) $length_data['length'] - 2 : 0;
			if ($payload_length < 0) {
				break;
			}

			if (0xE1 !== $marker) {
				fseek($handle, $payload_length, SEEK_CUR);
				continue;
			}

			$payload = $payload_length > 0 ? fread($handle, $payload_length) : '';
			if (strlen($payload) !== $payload_length) {
				break;
			}

			if (0 === strncmp($payload, $xmp_header, strlen($xmp_header))) {
				$packets[] = substr($payload, strlen($xmp_header));
			}
		}

		fclose($handle);

		return $packets;
	}
}

if (! function_exists('fbks_media_metadata_extract_from_jpeg')) {
	function fbks_media_metadata_extract_from_jpeg($file_path)
	{
		$packets = fbks_media_metadata_extract_xmp_packets_from_jpeg($file_path);
		if (empty($packets)) {
			return fbks_media_metadata_parse_xmp('');
		}

		$merged = fbks_media_metadata_parse_xmp(array_shift($packets));
		foreach ($packets as $packet) {
			$next = fbks_media_metadata_parse_xmp($packet);
			foreach (array('rating', 'colorClass', 'colorClassSource', 'label', 'tagged') as $key) {
				if ((null === $merged[$key] || '' === $merged[$key]) && null !== $next[$key] && '' !== $next[$key]) {
					$merged[$key] = $next[$key];
				}
			}
			$merged['sourceFields'] = array_merge($merged['sourceFields'], $next['sourceFields']);
		}

		return $merged;
	}
}
