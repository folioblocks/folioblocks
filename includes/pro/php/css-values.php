<?php
/**
 * Shared CSS value sanitizers.
 *
 * @package FolioBlocks
 */

if (! defined('ABSPATH')) {
    exit;
}

function fbks_css_value_has_unsafe_tokens($value)
{
    if (! is_string($value)) {
        return true;
    }

    return preg_match('/[;{}<>]|\/\*|\*\/|\b(?:url|var|expression)\s*\(/i', $value) === 1;
}

function fbks_sanitize_css_color_value($value)
{
    if (! is_string($value)) {
        return '';
    }

    $value = trim($value);
    if ('' === $value) {
        return '';
    }

    if (fbks_css_value_has_unsafe_tokens($value)) {
        return '';
    }

    $hex = sanitize_hex_color($value);
    if ($hex) {
        return $hex;
    }

    if (in_array(strtolower($value), ['transparent', 'currentcolor'], true)) {
        return $value;
    }

    if (preg_match('/^rgba?\(\s*(?:\d{1,3}%?\s*,\s*){2}\d{1,3}%?(?:\s*,\s*(?:0|1|0?\.\d+|100%|\d{1,2}%))?\s*\)$/i', $value)) {
        return $value;
    }

    if (preg_match('/^hsla?\(\s*\d{1,3}(?:deg)?\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%(?:\s*,\s*(?:0|1|0?\.\d+|100%|\d{1,2}%))?\s*\)$/i', $value)) {
        return $value;
    }

    return '';
}

function fbks_sanitize_css_background_value($value)
{
    if (! is_string($value)) {
        return '';
    }

    $value = trim($value);
    if ('' === $value) {
        return '';
    }

    $color = fbks_sanitize_css_color_value($value);
    if ($color) {
        return $color;
    }

    if (fbks_css_value_has_unsafe_tokens($value)) {
        return '';
    }

    if (! preg_match('/^(?:linear|radial)-gradient\(.+\)$/i', $value)) {
        return '';
    }

    if (! preg_match('/^[#%.,\s\-+()a-z0-9]+$/i', $value)) {
        return '';
    }

    return $value;
}

function fbks_sanitize_css_font_family_value($value)
{
    if (! is_string($value)) {
        return '';
    }

    $value = trim($value);
    if ('' === $value) {
        return '';
    }

    if (preg_match('/[;{}<>]|\/\*|\*\/|\b(?:url|expression)\s*\(/i', $value)) {
        return '';
    }

    if (preg_match('/^var\(--wp--preset--font-family--[a-z0-9_-]+\)$/i', $value)) {
        return $value;
    }

    if (preg_match('/^[a-z0-9\s,"\',\-]+$/i', $value)) {
        return $value;
    }

    return '';
}

function fbks_sanitize_css_font_weight_value($value)
{
    if (! is_string($value) && ! is_numeric($value)) {
        return '';
    }

    $value = trim((string) $value);
    if ('' === $value) {
        return '';
    }

    $numeric = (int) $value;
    if ((string) $numeric === $value && $numeric >= 100 && $numeric <= 900) {
        return (string) $numeric;
    }

    if (in_array(strtolower($value), ['normal', 'bold', 'lighter', 'bolder'], true)) {
        return strtolower($value);
    }

    return '';
}

function fbks_sanitize_css_font_style_value($value)
{
    if (! is_string($value)) {
        return '';
    }

    $value = strtolower(trim($value));
    return in_array($value, ['normal', 'italic'], true) ? $value : '';
}
