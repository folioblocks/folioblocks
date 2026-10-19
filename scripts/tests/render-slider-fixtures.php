<?php
/** Render test galleries without saving WordPress content; output JSON to a temporary file. */
require dirname( __DIR__, 5 ) . '/wp-load.php';
$ids = get_posts( [ 'post_type' => 'attachment', 'post_mime_type' => 'image', 'posts_per_page' => 3, 'fields' => 'ids' ] );
if ( count( $ids ) < 3 ) { throw new RuntimeException( 'Three local image attachments are required.' ); }
$images = array_map( static function ( $id ) {
    return [ 'blockName' => 'folioblocks/pb-image-block', 'attrs' => [ 'id' => $id, 'src' => wp_get_attachment_url( $id ), 'lightbox' => true ], 'innerBlocks' => [], 'innerHTML' => '', 'innerContent' => [] ];
}, $ids );
$render = static function ( $type, $settings = [], $items = null ) use ( $images ) {
    $items = $items ?? $images;
    return render_block( [
        'blockName' => 'folioblocks/' . $type . '-gallery-block',
        'attrs' => array_merge( [ 'lightbox' => true, 'imageClickAction' => 'lightbox', 'lightboxCounter' => true, 'lightboxZoom' => true, 'enableFullscreen' => true ], $settings ),
        'innerBlocks' => $items, 'innerHTML' => '', 'innerContent' => array_fill( 0, count( $items ), null ),
    ] );
};
echo wp_json_encode( [
    '/empty' => '',
    '/carousel' => $render( 'carousel', [ 'loopSlides' => true, 'showControls' => true, 'autoplay' => true, 'autoplaySpeed' => 0.25, 'disableRightClick' => true ] ),
    '/carousel-auto' => $render( 'carousel', [ 'loopSlides' => true, 'autoplay' => true, 'autoplaySpeed' => 0.25 ] ),
    '/carousel-static' => $render( 'carousel', [ 'loopSlides' => false, 'showControls' => true ] ),
    '/carousel-single' => $render( 'carousel', [ 'loopSlides' => true ], [ $images[0] ] ),
    '/carousel-empty' => $render( 'carousel', [], [] ),
    '/filmstrip' => $render( 'filmstrip', [ 'disableRightClick' => true ] ),
    '/filmstrip-social' => $render( 'filmstrip', [ 'onHoverTitle' => true, 'overlayContent' => 'social', 'enableSocialSharing' => true, 'socialSharingSources' => [ 'copy' ] ] ),
    '/filmstrip-download' => $render( 'filmstrip', [ 'imageClickAction' => 'download', 'enableDownload' => true ] ),
    '/filmstrip-auto' => $render( 'filmstrip', [ 'autoplay' => true, 'autoplaySpeed' => 0.25 ] ),
    '/filmstrip-side' => $render( 'filmstrip', [ 'position' => 'left' ] ),
    '/filmstrip-single' => $render( 'filmstrip', [], [ $images[0] ] ),
    '/filmstrip-empty' => $render( 'filmstrip', [], [] ),
    '/multiple' => $render( 'filmstrip' ) . $render( 'filmstrip' ),
] );
