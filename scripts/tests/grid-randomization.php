<?php
/** Run from the plugin root with PHP: tests the parsed-block shuffle contract. */
define( 'ABSPATH', __DIR__ );
$fbks_test_premium = true;
function fbks_fs() {
    return new class {
        public function can_use_premium_code__premium_only() {
            return $GLOBALS['fbks_test_premium'];
        }
    };
}
function add_filter( $hook, $callback ) {
    if ( 'render_block_data' !== $hook || ! is_callable( $callback ) ) {
        throw new RuntimeException( 'Randomization must register before rendering.' );
    }
}
require dirname( __DIR__, 2 ) . '/includes/pro/php/gallery-randomization.php';
function check_grid_shuffle( $condition, $message ) {
    if ( ! $condition ) {
        throw new RuntimeException( $message );
    }
}
$images = array_map( static function ( $id ) {
    return [ 'blockName' => 'folioblocks/pb-image-block', 'attrs' => [ 'id' => $id ] ];
}, [ 1, 2, 3 ] );
$other = [ 'blockName' => 'core/paragraph', 'attrs' => [] ];
$block = [
    'blockName' => 'folioblocks/grid-gallery-block',
    'attrs' => [ 'randomizeOrder' => true ],
    'innerBlocks' => [ $images[0], $other, $images[1], $images[2] ],
    'innerContent' => [ '<div class="pb-grid-gallery">', null, null, null, null, '</div>' ],
];
for ( $iteration = 0; $iteration < 20; $iteration++ ) {
    $result = fbks_randomize_gallery_images( $block );
    check_grid_shuffle( $result['innerBlocks'] !== $block['innerBlocks'], 'Order was not shuffled.' );
    check_grid_shuffle( $result['innerBlocks'][1] === $other, 'Non-image block moved.' );
    check_grid_shuffle( $result['innerContent'] === $block['innerContent'], 'Saved wrapper/placeholders changed.' );
    $ids = array_map( static function ( $position ) use ( $result ) {
        return $result['innerBlocks'][ $position ]['attrs']['id'];
    }, [ 0, 2, 3 ] );
    sort( $ids );
    check_grid_shuffle( [ 1, 2, 3 ] === $ids, 'Images were lost or duplicated.' );
}
foreach ( [ 'justified', 'masonry' ] as $layout ) {
    $gallery = $block;
    $gallery['blockName'] = 'folioblocks/' . $layout . '-gallery-block';
    $result = fbks_randomize_gallery_images( $gallery );
    check_grid_shuffle( $result['innerBlocks'] !== $gallery['innerBlocks'], $layout . ' order was not shuffled.' );
    check_grid_shuffle( $result['innerBlocks'][1] === $other, $layout . ' non-image block moved.' );
}
$disabled = $block;
$disabled['attrs']['randomizeOrder'] = false;
check_grid_shuffle( fbks_randomize_gallery_images( $disabled ) === $disabled, 'Disabled randomization changed images.' );
$fbks_test_premium = false;
check_grid_shuffle( fbks_randomize_gallery_images( $block ) === $block, 'Free gallery was shuffled.' );
echo "PASS: server shuffle preserves images, other blocks and saved markup; disabled/free galleries stay unchanged.\n";
