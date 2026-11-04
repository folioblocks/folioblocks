<?php
/** Render test galleries without saving WordPress content; output JSON to a temporary file. */
require dirname( __DIR__, 5 ) . '/wp-load.php';
$ids = get_posts( [ 'post_type' => 'attachment', 'post_mime_type' => 'image', 'posts_per_page' => 3, 'fields' => 'ids' ] );
if ( count( $ids ) < 3 ) { throw new RuntimeException( 'Three local image attachments are required.' ); }
$images = array_map( static function ( $id ) {
    return [ 'blockName' => 'folioblocks/pb-image-block', 'attrs' => [ 'id' => $id, 'src' => wp_get_attachment_url( $id ), 'title' => 'Fixture image', 'lightbox' => true ], 'innerBlocks' => [], 'innerHTML' => '', 'innerContent' => [] ];
}, $ids );
$render = static function ( $type, $settings = [], $items = null ) use ( $images ) {
    $items = $items ?? $images;
    return render_block( [
        'blockName' => 'folioblocks/' . $type . '-gallery-block',
        'attrs' => array_merge( [ 'lightbox' => true, 'imageClickAction' => 'lightbox', 'lightboxCounter' => true, 'lightboxZoom' => true, 'enableFullscreen' => true ], $settings ),
        'innerBlocks' => $items, 'innerHTML' => '', 'innerContent' => array_fill( 0, count( $items ), null ),
    ] );
};
$social_sources = static function () { return [ 'sources' => [ 'copy' ] ]; };
add_filter( 'pre_option_' . FBKS_SOCIAL_SHARING_SETTINGS_OPTION, $social_sources );
$carousel_social = $render( 'carousel', [ 'loopSlides' => true, 'customHeightEnabled' => true, 'customHeight' => '200px', 'onHoverTitle' => true, 'overlayContent' => 'social', 'onHoverStyle' => 'fade-overlay' ] );
remove_filter( 'pre_option_' . FBKS_SOCIAL_SHARING_SETTINGS_OPTION, $social_sources );
echo wp_json_encode( [
    '/empty' => '',
    '/carousel' => $render( 'carousel', [ 'loopSlides' => true, 'showControls' => true, 'autoplay' => true, 'autoplaySpeed' => 0.25, 'disableRightClick' => true, 'onHoverTitle' => true, 'overlayContent' => 'title', 'onHoverStyle' => 'fade-overlay' ] ),
    '/carousel-auto' => $render( 'carousel', [ 'loopSlides' => true, 'autoplay' => true, 'autoplaySpeed' => 0.25 ] ),
    '/carousel-reverse' => $render( 'carousel', [ 'showControls' => true, 'autoplay' => true, 'autoplayDirection' => 'left', 'autoplaySpeed' => 0.5, 'customHeightEnabled' => true, 'customHeight' => '800px', 'tabletCustomHeight' => '70vh' ] ),
    '/carousel-reverse-loop' => $render( 'carousel', [ 'showControls' => true, 'autoplay' => true, 'autoplayDirection' => 'left', 'autoplaySpeed' => 0.5, 'loopSlides' => true, 'customHeightEnabled' => true, 'customHeight' => '800px' ] ),
    '/carousel-social' => $carousel_social,
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
