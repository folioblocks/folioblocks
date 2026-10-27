<?php
/** Read-only integration checks for the block default schema and rendered controls. */
require dirname(__DIR__, 5) . '/wp-load.php';
function check_block_default($condition, $message) { if (!$condition) { throw new RuntimeException($message); } }
$settings = fbks_sanitize_block_defaults('before_after', ['startingPosition' => 500, 'showLabels' => '0', 'sliderOrientation' => 'vertical', 'labelPosition' => 'top', 'sliderColor' => 'red; background:url(evil)', 'unknown' => 'ignored']);
check_block_default(100 === $settings['startingPosition'] && false === $settings['showLabels'], 'Range or boolean sanitization failed.');
check_block_default('center' === $settings['labelPosition'] && '#ffffff' === $settings['sliderColor'] && !isset($settings['unknown']), 'Invalid position, color or unknown field accepted.');
$settings = fbks_sanitize_block_defaults('loupe', ['magnification' => -1, 'loupeShape' => 'triangle', 'loupeTheme' => 'dark']);
check_block_default(1 === $settings['magnification'] && 'circle' === $settings['loupeShape'] && 'dark' === $settings['loupeTheme'], 'Loupe validation failed.');
check_block_default('rgba(0, 0, 0, 0.6)' === fbks_sanitize_block_defaults('before_after', [])['labelBackgroundColor'], 'Alpha background default changed.');
foreach (fbks_get_block_defaults_schema() as $key => $schema) {
    $block = WP_Block_Type_Registry::get_instance()->get_registered($schema['block']);
    foreach ($schema['fields'] as $name => $field) {
        if (empty($field['uiDefault'])) { check_block_default($field['default'] === ($block->attributes[$name]['default'] ?? null), 'Schema does not match registered block defaults: ' . $name); }
    }
}
ob_start(); fbks_render_block_defaults_panels(); $html = ob_get_clean();
check_block_default(13 === substr_count($html, 'data-settings-section="block_'), 'Missing block settings panels.');
check_block_default(false !== strpos($html, 'fbks_block_defaults[loupe][magnification]'), 'Missing autosave field.');
echo "Passed: default/schema parity, numeric/enum/boolean/color validation, supported fields and rendered autosave panels.\n";

check_block_default('rgba(0, 0, 0, 0.61)' === fbks_sanitize_block_defaults('before_after', ['labelBackgroundColor' => 'rgba(0, 0, 0, 0.61)'])['labelBackgroundColor'], 'Picker opacity not retained.');
foreach (['rgba(0, 0, 0, 2)', 'rgb(256, 0, 0)', 'red', 'url(javascript:alert(1))', '#fff; color:red'] as $invalid) {
    check_block_default('#ffffff' === fbks_sanitize_block_default_color($invalid, '#ffffff'), 'Invalid color accepted.');
}

$background = fbks_sanitize_block_defaults('background_video', ['overlayOpacity' => '0.55', 'heightDesktop' => 120]);
check_block_default(0.55 === $background['overlayOpacity'] && 100 === $background['heightDesktop'], 'Background numeric validation failed.');

foreach (['none', 'lightbox', 'download', 'media_file', 'custom_url', 'page_post'] as $action) {
    foreach (['icon', 'thumbnail'] as $target) {
        $settings = fbks_sanitize_block_defaults('image', ['imageClickAction' => $action, 'imageClickTarget' => $target, 'lightbox' => true, 'onHoverStyle' => 'chip-gradient', 'shadowStyle' => 'dramatic']);
        $attrs = fbks_resolve_image_block_defaults($settings);
        $expected_lightbox = 'lightbox' === $action || ('download' === $action && 'icon' === $target);
        check_block_default($expected_lightbox === $attrs['lightbox'] && $attrs['lightbox'] === $attrs['enableLightbox'], 'Click and lightbox flags disagree.');
        check_block_default(('download' === $action) === $attrs['enableDownload'], 'Download flag disagrees with click behavior.');
        check_block_default(true === $attrs['showTitleOnHover'] && true === $attrs['dropShadow'], 'Overlay or shadow attributes not enabled.');
    }
}
$legacy = fbks_sanitize_block_defaults('image', ['enableLightbox' => true, 'showTitleOnHover' => false, 'dropShadow' => true]);
check_block_default('lightbox' === $legacy['imageClickAction'] && 'none' === $legacy['onHoverStyle'] && 'soft' === $legacy['shadowStyle'], 'Legacy settings not preserved.');
foreach (['linear-gradient(135deg, #fff 0%, #000 100%)', 'linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgb(255,255,255) 100%)', 'radial-gradient(circle at center, #fff 0%, #000 100%)'] as $gradient) {
    check_block_default($gradient === fbks_sanitize_block_default_gradient($gradient), 'Valid gradient rejected.');
}
foreach (['url(javascript:alert(1))', 'linear-gradient(red,blue);background:url(evil)', 'linear-gradient(url(evil),#fff)'] as $gradient) {
    check_block_default('' === fbks_sanitize_block_default_gradient($gradient), 'Unsafe gradient accepted.');
}
file_put_contents('/private/tmp/folioblocks-block-defaults-fixture.html', $html);
echo "Passed: click/target combinations, coupled editor flags, saved-default migration, gradients and unsafe input rejection.\n";

foreach (['none', 'play', 'title', 'title-play'] as $content) {
    foreach ([false, true] as $always) {
        $values = fbks_resolve_video_block_defaults(fbks_sanitize_block_defaults('video', ['defaultOverlayContent' => $content, 'alwaysDisplayOverlay' => $always, 'shadowStyle' => 'elevated', 'overlayStyle' => 'gradient']));
        $visibility = $always ? 'always' : 'onHover';
        check_block_default($values['titleVisibility'] === (in_array($content, ['title', 'title-play'], true) ? $visibility : 'hidden'), 'Video title mapping failed.');
        check_block_default($values['playButtonVisibility'] === (in_array($content, ['play', 'title-play'], true) ? $visibility : 'hidden'), 'Video play mapping failed.');
        check_block_default($values['dropShadow'] && !isset($values['defaultOverlayContent']) && $values['overlayBgGradient'] !== '', 'Video resolved attributes failed.');
    }
}
$legacy_video = fbks_sanitize_block_defaults('video', ['titleVisibility' => 'hidden', 'playButtonVisibility' => 'always', 'dropShadow' => true]);
check_block_default('play' === $legacy_video['defaultOverlayContent'] && $legacy_video['alwaysDisplayOverlay'] && 'soft' === $legacy_video['shadowStyle'], 'Video migration failed.');
file_put_contents('/private/tmp/folioblocks-block-defaults-fixture.html', $html);
echo "Passed: Video content/visibility mapping, gradients, shadows, and legacy migration.\n";

foreach (['carousel', 'filmstrip', 'modular', 'grid', 'justified', 'masonry'] as $key) {
    foreach (['none', 'lightbox', 'download', 'custom_url', 'page_post'] as $action) {
        $values = fbks_resolve_gallery_block_defaults($key, fbks_sanitize_block_defaults($key, ['imageClickAction' => $action, 'lightbox' => true, 'onHoverStyle' => 'chip-gradient']));
        check_block_default($values['lightbox'] === (in_array($action, ['lightbox', 'download'], true) || (in_array($key, ['carousel', 'modular', 'grid', 'justified', 'masonry'], true) && in_array($action, ['custom_url', 'page_post'], true))), 'Gallery click mapping failed.');
        check_block_default($values['enableDownload'] === ('download' === $action) && $values['onHoverTitle'], 'Gallery flags failed.');
        check_block_default(!isset($values['showTitleOnHover'], $values['downloadDisplay'], $values['mobileOrientation']), 'Virtual gallery fields leaked.');
    }
}
echo "Passed: gallery click/hover mapping and virtual control resolution.\n";

foreach (['carousel', 'filmstrip', 'modular', 'grid', 'justified', 'masonry'] as $key) {
    $schema = fbks_get_block_defaults_schema()[$key];
    $registered = WP_Block_Type_Registry::get_instance()->get_registered($schema['block']);
    $resolved = fbks_resolve_gallery_block_defaults($key, fbks_sanitize_block_defaults($key, []));
    foreach ($resolved as $name => $value) { check_block_default(isset($registered->attributes[$name]), 'Unregistered gallery default: ' . $name); }
    if (isset($schema['fields']['autoplaySpeed'])) { check_block_default(1.25 === fbks_sanitize_block_defaults($key, ['autoplaySpeed' => '1.25'])['autoplaySpeed'], 'Fractional autoplay speed lost.'); }
}
echo "Passed: gallery defaults use registered attributes and retain fractional playback speed.\n";

$gallery_schema = fbks_get_block_defaults_schema()['video_gallery'];
$gallery_values = fbks_resolve_video_block_defaults(fbks_sanitize_block_defaults('video_gallery', ['enableFilter' => true, 'defaultOverlayContent' => 'title-play-category', 'alwaysDisplayOverlay' => true]));
check_block_default($gallery_values['showFilterCategory'] && 'always' === $gallery_values['titleVisibility'] && 'always' === $gallery_values['playButtonVisibility'], 'Video Gallery filtering overlay mapping failed.');
$registered = WP_Block_Type_Registry::get_instance()->get_registered($gallery_schema['block']);
foreach ($gallery_values as $name => $value) { check_block_default(isset($registered->attributes[$name]), 'Unregistered Video Gallery default: ' . $name); }
check_block_default(!isset($gallery_schema['fields']['lazyLoad'], $gallery_schema['fields']['disableRightClick']), 'Page/Post controls included in Video Gallery defaults.');
echo "Passed: Video Gallery responsive layout, registered attributes, and filtering overlay mapping.\n";

$justified = fbks_resolve_gallery_block_defaults('justified', fbks_sanitize_block_defaults('justified', ['rowHeight' => '400', 'tabletRowHeight' => '', 'mobileRowHeight' => '300']));
check_block_default(400 === $justified['rowHeight'] && 400 === $justified['tabletRowHeight'] && 300 === $justified['mobileRowHeight'] && false === $justified['noGap'], 'Justified legacy row-height migration failed.');
echo "Passed: Justified row-height overrides and desktop inheritance.\n";

$proofing_schema = fbks_get_block_defaults_schema()['proofing'];
foreach (['clientEmail', 'galleryPassword', 'columns', 'tabletColumns', 'mobileColumns', 'rowHeight', 'resolution', 'gap', 'galleryTypeSettings'] as $name) {
    check_block_default(!isset($proofing_schema['fields'][$name]), 'Client or nested-gallery setting in Proofing defaults: ' . $name);
}
$proofing = fbks_resolve_proofing_block_defaults(fbks_sanitize_block_defaults('proofing', ['flagMode' => 'advanced', 'defaultFlagPalette' => 'getty', 'enableStars' => true]));
check_block_default(!isset($proofing['defaultFlagPalette']) && !empty($proofing['flagPalette']['items']) && $proofing['enableStars'], 'Proofing palette snapshot failed.');
$registered = WP_Block_Type_Registry::get_instance()->get_registered($proofing_schema['block']);
foreach ($proofing as $name => $value) { check_block_default(isset($registered->attributes[$name]), 'Unregistered Proofing default: ' . $name); }
echo "Passed: Proofing own controls only, registered attributes, and advanced palette snapshots.\n";

check_block_default(!fbks_block_defaults_are_customized('loupe', []), 'Empty settings marked customized.');
check_block_default(fbks_block_defaults_are_customized('loupe', ['magnification' => 15]), 'Custom magnification not detected.');
check_block_default(!fbks_block_defaults_are_customized('before_after', ['sliderColor' => 'rgb(255, 255, 255)', 'labelBackgroundColor' => 'rgba(0,0,0,0.60)']), 'Equivalent colors marked customized.');
check_block_default(fbks_block_defaults_are_customized('before_after', ['labelBackgroundColor' => 'rgba(0,0,0,0.5)']), 'Changed opacity not detected.');
check_block_default(!fbks_block_defaults_are_customized('video_gallery', ['filterBgColor' => 'rgba(255,255,255,0)']), 'Equivalent transparent color marked customized.');
echo "Passed: persistent customization state, default equivalence, and opacity changes.\n";
