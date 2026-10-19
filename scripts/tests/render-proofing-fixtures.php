<?php
/** Render proofing fixtures without saving pages, sessions, or selections. */
require dirname( __DIR__, 5 ) . '/wp-load.php';
$ids = get_posts( [ 'post_type' => 'attachment', 'post_mime_type' => 'image', 'posts_per_page' => 3, 'fields' => 'ids' ] );
if ( count( $ids ) < 3 ) { throw new RuntimeException( 'Three local image attachments are required.' ); }
$images = array_map( static function ( $id ) {
    return [ 'blockName' => 'folioblocks/pb-image-block', 'attrs' => [ 'id' => $id, 'src' => wp_get_attachment_url( $id ) ], 'innerBlocks' => [], 'innerHTML' => '', 'innerContent' => [] ];
}, $ids );
$render = static function ( $style, $settings = [], $items = null ) use ( $images ) {
    $items = $items ?? $images;
    $layout_class = 'masonry' === $style ? 'pb-masonry-gallery' : ( 'justified' === $style ? 'pb-justified-gallery' : 'pb-grid-gallery' );
    $gallery = [ 'blockName' => 'folioblocks/' . $style . '-gallery-block', 'attrs' => [ 'enableFilter' => false, 'lightbox' => true, 'lightboxCounter' => true ],
        'innerBlocks' => $items, 'innerHTML' => '',
        'innerContent' => array_merge( [ '<div class="' . $layout_class . '">' ], array_fill( 0, count( $items ), null ), [ '</div>' ] ),
    ];
    return render_block( [ 'blockName' => 'folioblocks/proofing-gallery-block',
        'attrs' => array_merge( [ 'clientEmail' => 'navigation-' . $style . '@example.invalid', 'galleryStyle' => $style, 'emailAdminOnSubmit' => false, 'lightbox' => true, 'lightboxCounter' => true ], $settings ),
        'innerBlocks' => [ $gallery ], 'innerHTML' => '', 'innerContent' => [ null ],
    ] );
};
$pages = [ '/empty' => '', '/grid' => $render( 'grid' ), '/justified' => $render( 'justified' ), '/masonry' => $render( 'masonry' ),
    '/other' => $render( 'grid', [ 'clientEmail' => 'navigation-other@example.invalid' ] ),
    '/locked' => $render( 'grid', [ 'galleryPassword' => 'fixture-password' ] ),
    '/no-controls' => $render( 'grid', [ 'clientEmail' => 'navigation-no-controls@example.invalid', 'enableHeart' => false, 'enableFlag' => false, 'enableComment' => false ] ),
    '/gallery-empty' => $render( 'grid', [ 'clientEmail' => 'navigation-empty@example.invalid' ], [] ),
];
$pages['/saved'] = $render( 'grid', [ 'clientEmail' => 'navigation-saved@example.invalid' ] );
$processor = new WP_HTML_Tag_Processor( $pages['/saved'] );
if ( $processor->next_tag( [ 'class_name' => 'fbks-proofing-gallery' ] ) ) {
    $context = json_decode( $processor->get_attribute( 'data-wp-context' ), true );
    $context['savedSession'] = [ 'status' => 'in_progress', 'images' => [ [ 'imageId' => 'attachment-' . $ids[0], 'hearted' => true, 'flag' => 'green', 'comment' => 'Saved on the server' ] ] ];
    $processor->set_attribute( 'data-wp-context', wp_json_encode( $context ) );
    $pages['/saved'] = $processor->get_updated_html();
}
// Keep every presence/save request on the isolated fixture server.
foreach ( $pages as $path => $markup ) {
    $processor = new WP_HTML_Tag_Processor( $markup );
    if ( $processor->next_tag( [ 'class_name' => 'fbks-proofing-gallery' ] ) ) {
        $context = json_decode( $processor->get_attribute( 'data-wp-context' ), true );
        $context['restUrl'] = '/api/proofing/session';
        $context['presenceUrl'] = '/api/proofing/presence';
        $processor->set_attribute( 'data-wp-context', wp_json_encode( $context ) );
        $pages[ $path ] = $processor->get_updated_html();
    }
}
echo wp_json_encode( $pages );
