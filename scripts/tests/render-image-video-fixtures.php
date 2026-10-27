<?php
/** Read-only rendering fixtures for image/video lightboxes. */
require dirname(__DIR__, 5) . '/wp-load.php';
$ids = get_posts(['post_type' => 'attachment', 'post_mime_type' => 'image', 'posts_per_page' => 3, 'fields' => 'ids']);
if (count($ids) < 3) { throw new RuntimeException('Three image attachments required.'); }
$node = static function($name, $attrs, $children = []) { return ['blockName' => $name, 'attrs' => $attrs, 'innerBlocks' => $children, 'innerHTML' => '', 'innerContent' => array_fill(0, count($children), null)]; };
$image = static function($index, $attrs = []) use ($node, $ids) { return $node('folioblocks/pb-image-block', array_merge(['id' => $ids[$index], 'src' => wp_get_attachment_url($ids[$index]), 'title' => 'Slide ' . $index], $attrs)); };
$video = ['imageClickAction' => 'video_lightbox', 'videoLightboxUrl' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'linkIconDisplay' => 'always', 'lightboxCounter' => true, 'lightboxZoom' => true, 'lightboxContent' => 'title', 'showTitleOnHover' => true, 'overlayContent' => 'video_play'];
$pages = [];
$pages['/standalone'] = render_block($image(0, $video)) . render_block($image(1, ['imageClickAction' => 'lightbox', 'lightbox' => true, 'lightboxZoom' => true]));
$pages['/native'] = render_block($image(0, array_merge($video, ['videoLightboxUrl' => 'http://127.0.0.1:1/test.mp4', 'imageClickTarget' => 'thumbnail'])));
$pages['/missing'] = render_block($image(0, array_merge($video, ['videoLightboxUrl' => ''])));
$pages['/unsafe'] = render_block($image(0, array_merge($video, ['videoLightboxUrl' => 'javascript:alert(1)'])));
foreach (['carousel', 'filmstrip', 'grid', 'justified', 'modular', 'masonry'] as $gallery) {
    $children = [$image(0, ['videoLightboxUrl' => $video['videoLightboxUrl']]), $image(1, ['overrideGalleryClickSettings' => true, 'imageClickAction' => 'lightbox', 'lightbox' => true, 'lightboxZoom' => true]), $image(2, ['videoLightboxUrl' => ''])];
    if ('modular' === $gallery) { $children = [$node('folioblocks/pb-image-row', [], [$node('folioblocks/pb-image-stack', [], $children)])]; }
    $pages['/' . $gallery] = render_block($node('folioblocks/' . $gallery . '-gallery-block', array_merge($video, ['onHoverTitle' => true, 'imageClickTarget' => 'icon']), $children));
}
foreach (['blur-overlay', 'fade-overlay', 'gradient-bottom', 'chip', 'chip-gradient', 'color-overlay', 'gradient-overlay'] as $style) {
    $pages['/overlay-' . $style] = render_block($image(0, array_merge($video, ['onHoverStyle' => $style, 'title' => '', 'caption' => ''])));
}
foreach ($pages as $path => $html) {
    if (in_array($path, ['/missing', '/unsafe'], true)) { if (str_contains($html, 'data-video-src=') || str_contains($html, 'fbks-video-lightbox-trigger')) { throw new RuntimeException('Invalid video enabled at ' . $path); } }
    elseif ('/filmstrip' === $path) { if (!str_contains($html, 'videoLightboxUrl')) { throw new RuntimeException('Missing Filmstrip video data'); } }
    elseif (!str_contains($html, 'data-video-src=')) { throw new RuntimeException('Missing video data at ' . $path); }
}
file_put_contents('/private/tmp/fbks-image-video-fixtures.json', wp_json_encode($pages));
echo "Passed: standalone and six galleries render video sources, overrides, missing/unsafe URL handling.\n";
