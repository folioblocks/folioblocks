<?php
/** Render Video fixtures read-only with the installed WordPress block renderer. */
require dirname( __DIR__, 5 ) . '/wp-load.php';
$thumbnail_id = get_posts( [ 'post_type' => 'attachment', 'post_mime_type' => 'image', 'posts_per_page' => 1, 'fields' => 'ids' ] )[0] ?? 0;
$video = static function ( $settings = [] ) use ( $thumbnail_id ) {
    return [ 'blockName' => 'folioblocks/pb-video-block', 'attrs' => array_merge( [
        'videoUrl' => 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
        'thumbnailId' => $thumbnail_id, 'thumbnail' => wp_get_attachment_url( $thumbnail_id ),
        'title' => 'Test video', 'description' => 'Test description', 'hoverEffect' => 'tilt',
    ], $settings ), 'innerBlocks' => [], 'innerHTML' => '', 'innerContent' => [] ];
};
$gallery = static function ( $settings = [], $items = null ) use ( $video ) {
    $items = $items ?? [ $video( [ 'filterCategories' => [ 'Forest', 'Landscape' ] ] ), $video( [ 'filterCategory' => 'City' ] ), $video( [ 'filterCategories' => [ 'City', 'Landscape' ] ] ) ];
    return render_block( [ 'blockName' => 'folioblocks/video-gallery-block',
        'attrs' => array_merge( [ 'columns' => 3, 'tabletColumns' => 2, 'mobileColumns' => 1, 'enableFilter' => true, 'filterCategories' => [ 'Forest', 'City', 'Landscape' ] ], $settings ),
        'innerBlocks' => $items, 'innerHTML' => '',
        'innerContent' => array_merge( [ '<div class="pb-video-gallery cols-d-3 cols-t-2 cols-m-1" data-disable-right-click="true">' ], array_fill( 0, count( $items ), null ), [ '</div>' ] ),
    ] );
};
$pages = [
    '/empty' => '',
    '/video' => render_block( $video( [ 'disableRightClick' => true, 'lightboxLayout' => 'split' ] ) ),
    '/local' => render_block( $video( [ 'videoUrl' => 'http://localhost/test-video.mp4', 'videoWidth' => 320, 'videoHeight' => 180, 'videoDimensionsUrl' => 'http://localhost/test-video.mp4' ] ) ),
    '/vimeo' => render_block( $video( [ 'videoUrl' => 'https://vimeo.com/123456789', 'lightboxTheme' => 'light' ] ) ),
    '/premium-provider' => render_block( $video( [ 'videoUrl' => 'https://www.dailymotion.com/video/x123abc' ] ) ),
    '/cart' => render_block( $video( [ 'enableWooCommerce' => true, 'wooProductId' => 123, 'wooCartIconDisplay' => 'always' ] ) ),
    '/gallery' => $gallery( [ 'disableRightClick' => true, 'activeFilter' => 'City', 'lazyLoad' => true ] ),
    '/gallery-other' => $gallery( [ 'activeFilter' => 'Forest' ] ),
    '/multiple' => $gallery() . $gallery(),
    '/gallery-empty' => $gallery( [], [] ),
];
$pages['/clipped'] = '<div style="transform:translateZ(0);overflow:hidden;width:350px;height:220px">' . $pages['/video'] . '</div>';
// Exercise actual page/post override filters without changing database metadata.
$test_post_id = (int) get_posts( [ 'post_type' => 'page', 'posts_per_page' => 1, 'fields' => 'ids' ] )[0];
$GLOBALS['post'] = get_post( $test_post_id );
$page_protected = false;
add_filter( 'get_post_metadata', static function ( $value, $id, $key ) use ( &$page_protected, $test_post_id ) {
    if ( $test_post_id === (int) $id && in_array( $key, [ 'fbksDisableRightClick', 'fbksDisableDragToSave', 'fbksLazyLoad' ], true ) ) {
        return [ $page_protected ? '1' : '0' ];
    }
    return $value;
}, PHP_INT_MAX, 3 );
$pages['/page-off'] = $gallery( [ 'disableRightClick' => true ], [ $video( [ 'disableRightClick' => true ] ) ] );
$page_protected = true;
$pages['/page-on'] = $gallery( [ 'disableRightClick' => false ], [ $video() ] );
echo wp_json_encode( $pages );
