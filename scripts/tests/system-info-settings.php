<?php
/** Read-only support report checks; fixture options are filtered in memory. */
require dirname(__DIR__, 5) . '/wp-load.php';
function check_settings_report($condition, $message) { if (!$condition) { throw new RuntimeException($message); } }
$fixture_defaults = [
    'loupe' => ['magnification' => 15],
    'before_after' => ['sliderColor' => 'rgb(255,255,255)'],
    'proofing' => ['enableStars' => true, 'clientEmail' => 'private-client@example.invalid', 'galleryPassword' => 'private-password-marker', 'columns' => 8],
];
add_filter('pre_option_fbks_block_defaults', static function() use ($fixture_defaults) { return $fixture_defaults; });
add_filter('pre_option_fbks_page_media_defaults', static function() { return ['lazyLoad' => true, 'disableRightClick' => false, 'disableDragToSave' => true, 'secret' => 'private-secret-marker']; });
add_filter('pre_option_fbks_watermark_settings', static function() { return ['enabledByDefault' => true, 'defaultWatermarkId' => 'private-watermark-id', 'items' => [['id' => 'private-watermark-id', 'name' => 'private-watermark-name', 'assetUrl' => 'https://example.invalid/private-asset.png', 'assetId' => 0, 'opacity' => 0.5]]]; });
$before_locale = get_locale();
$lines = fbks_get_settings_system_info_lines();
$report = implode("\n", $lines);
check_settings_report(get_locale() === $before_locale, 'Report changed the active locale.');
check_settings_report(str_contains($report, 'Lazy load images: Yes') && str_contains($report, 'Disable drag to save: Yes'), 'Effective page defaults missing.');
check_settings_report(str_contains($report, 'Loupe Block: Customized') && str_contains($report, 'magnification): 15 (plugin default: 10)'), 'Changed block value/baseline missing.');
check_settings_report(str_contains($report, 'Before & After Block: Plugin defaults'), 'Equivalent colors falsely reported as changes.');
check_settings_report(str_contains($report, 'Proofing Gallery Block: Customized') && str_contains($report, 'enableStars): Yes (plugin default: No)'), 'Proofing defaults missing.');
foreach (['private-client', 'private-password', 'private-secret', 'private-watermark', 'private-asset', 'clientEmail', 'galleryPassword'] as $secret) {
    check_settings_report(!str_contains($report, $secret), 'Private or unknown option data leaked: ' . $secret);
}
check_settings_report(str_contains($report, 'Watermark 1:') && str_contains($report, 'Opacity: 0.5') && str_contains($report, 'Default watermark: Watermark 1'), 'Watermark diagnostics missing.');
$start = strpos($report, '=== Global Block Defaults ===');
check_settings_report(strpos($report, 'Before & After Block:', $start) < strpos($report, 'Loupe Block:', $start), 'Block defaults are not alphabetized.');
check_settings_report(get_option('fbks_block_defaults') === $fixture_defaults, 'Report mutated option data.');
echo "Passed: effective settings, customized block values/baselines, equivalent colors, alphabetical order, locale restoration, and private-data exclusion.\n";
