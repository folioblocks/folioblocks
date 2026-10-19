<?php
/** Shuffle gallery images before rendering so the router owns their actual order. */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function fbks_randomize_gallery_images( $parsed_block ) {
    if (
        ! in_array( $parsed_block['blockName'] ?? '', [ 'folioblocks/grid-gallery-block', 'folioblocks/justified-gallery-block', 'folioblocks/masonry-gallery-block', 'folioblocks/carousel-gallery-block' ], true ) ||
        empty( $parsed_block['attrs']['randomizeOrder'] ) ||
        ! fbks_fs()->can_use_premium_code__premium_only()
    ) {
        return $parsed_block;
    }

    $positions = [];
    $images = [];
    foreach ( $parsed_block['innerBlocks'] ?? [] as $position => $inner_block ) {
        if ( 'folioblocks/pb-image-block' === ( $inner_block['blockName'] ?? '' ) ) {
            $positions[] = $position;
            $images[] = $inner_block;
        }
    }
    if ( count( $images ) < 2 ) {
        return $parsed_block;
    }
    $original = $images;
    shuffle( $images );
    if ( $images === $original ) {
        $images[] = array_shift( $images );
    }
    foreach ( $positions as $index => $position ) {
        $parsed_block['innerBlocks'][ $position ] = $images[ $index ];
    }
    return $parsed_block;
}
add_filter( 'render_block_data', 'fbks_randomize_gallery_images' );

/** Decorative loop slides have no interactive directives or focus targets. */
function fbks_carousel_clone_markup( $markup, $position ) {
    $processor = new WP_HTML_Tag_Processor( $markup );
    while ( $processor->next_tag() ) {
        foreach ( $processor->get_attribute_names_with_prefix( 'data-wp-' ) ?? [] as $attribute ) {
            $processor->remove_attribute( $attribute );
        }
        $processor->remove_attribute( 'id' );
        $processor->remove_class( 'pb-image-block-lightbox' );
        if ( $processor->has_class( 'wp-block-folioblocks-pb-image-block' ) ) {
            $processor->set_attribute( 'data-pb-carousel-clone', $position );
            $processor->set_attribute( 'aria-hidden', 'true' );
            $processor->set_attribute( 'inert', true );
        }
        if ( in_array( $processor->get_tag(), [ 'A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA' ], true ) || null !== $processor->get_attribute( 'tabindex' ) ) {
            $processor->set_attribute( 'tabindex', '-1' );
        }
    }
    return $processor->get_updated_html();
}
