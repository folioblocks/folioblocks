<?php
/**
 * Shared gallery filter helpers.
 *
 * @package FolioBlocks
 */

if (! defined('ABSPATH')) {
    exit;
}

function fbks_is_all_filter_value($value)
{
    if (! is_string($value)) {
        return false;
    }

    return strtolower(trim($value)) === FBKS_ALL_FILTER_TOKEN;
}

function fbks_normalize_active_filter_value($value)
{
    if (fbks_is_all_filter_value($value)) {
        return FBKS_ALL_FILTER_TOKEN;
    }

    if (! is_string($value)) {
        return FBKS_ALL_FILTER_TOKEN;
    }

    $value = trim($value);

    return $value === '' ? FBKS_ALL_FILTER_TOKEN : $value;
}

function fbks_get_all_filter_label()
{
    return __('All', 'folioblocks');
}
