<?php
/**
 * Shared translation helpers.
 *
 * @package FolioBlocks
 */

if (! defined('ABSPATH')) {
    exit;
}

function fbks_get_local_languages_dir()
{
    static $languages_dir = null;

    if (null === $languages_dir) {
        $directory = FBKS_PLUGIN_DIR . 'languages';
        $languages_dir = is_dir($directory) ? $directory : '';
    }

    return $languages_dir;
}

function fbks_generate_block_asset_handle($block_name, $field_name, $index = 0)
{
    $field_mappings = array(
        'editorScript' => 'editor-script',
        'script'       => 'script',
        'viewScript'   => 'view-script',
    );

    if (! isset($field_mappings[$field_name])) {
        return '';
    }

    $handle = str_replace('/', '-', $block_name) . '-' . $field_mappings[$field_name];

    if ($index > 0) {
        $handle .= '-' . ($index + 1);
    }

    return $handle;
}

function fbks_register_i18n_loader_script()
{
    $script_path = FBKS_PLUGIN_DIR . 'includes/js/i18n-loader.js';
    $script_url  = FBKS_PLUGIN_URL . 'includes/js/i18n-loader.js';
    $languages_dir = fbks_get_local_languages_dir();

    wp_register_script(
        'folioblocks-i18n-loader',
        $script_url,
        array('wp-i18n'),
        file_exists($script_path) ? filemtime($script_path) : FBKS_VERSION,
        true
    );

    if (function_exists('wp_set_script_translations') && '' !== $languages_dir) {
        wp_set_script_translations(
            'folioblocks-i18n-loader',
            'folioblocks',
            $languages_dir
        );
    }
}

function fbks_attach_i18n_loader_dependency($handle)
{
    global $wp_scripts;

    if (
        ! $wp_scripts ||
        ! isset($wp_scripts->registered[$handle])
    ) {
        return;
    }

    $dependencies = $wp_scripts->registered[$handle]->deps;

    if (! in_array('folioblocks-i18n-loader', $dependencies, true)) {
        $dependencies[] = 'folioblocks-i18n-loader';
        $wp_scripts->registered[$handle]->deps = $dependencies;
    }
}

function fbks_register_script_handle_translations($handle)
{
    if (! function_exists('wp_set_script_translations')) {
        return;
    }

    if ('' !== fbks_get_local_languages_dir()) {
        fbks_attach_i18n_loader_dependency($handle);
        return;
    }

    wp_set_script_translations($handle, 'folioblocks');
}

function fbks_register_block_script_translations($block_directory)
{
    $metadata_path = trailingslashit($block_directory) . 'block.json';

    if (! file_exists($metadata_path)) {
        return;
    }

    $metadata = json_decode(file_get_contents($metadata_path), true);

    if (! is_array($metadata) || empty($metadata['name'])) {
        return;
    }

    foreach (array('editorScript', 'script', 'viewScript') as $field_name) {
        if (empty($metadata[$field_name])) {
            continue;
        }

        $assets = is_array($metadata[$field_name])
            ? array_values($metadata[$field_name])
            : array($metadata[$field_name]);

        foreach ($assets as $index => $asset) {
            if (! is_string($asset) || strpos($asset, 'file:') !== 0) {
                continue;
            }

            $handle = fbks_generate_block_asset_handle($metadata['name'], $field_name, $index);

            if ($handle !== '') {
                fbks_register_script_handle_translations($handle);
            }
        }
    }
}
