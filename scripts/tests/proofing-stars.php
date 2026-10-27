<?php
/** Validate real session normalization without creating or changing sessions. */
require dirname( __DIR__, 5 ) . '/wp-load.php';
$check = static function ( $condition, $message ) {
    if ( ! $condition ) { throw new RuntimeException( $message ); }
};
foreach ( [ null, 0, 6, -1, 2.5, '4', true, [], 'invalid' ] as $invalid ) {
    $check( null === fbks_normalize_client_rating( $invalid ), 'Invalid rating accepted.' );
}
foreach ( range( 1, 5 ) as $rating ) {
    $check( $rating === fbks_normalize_client_rating( $rating ), 'Valid rating rejected.' );
}
$images = fbks_normalize_proofing_images( [
    [ 'imageId' => 'legacy', 'hearted' => true, 'flag' => 'green', 'comment' => 'Legacy feedback' ],
    [ 'imageId' => 'rated', 'clientRating' => 4 ],
    [ 'imageId' => 'clear', 'clientRating' => null ],
    [ 'imageId' => 'invalid', 'clientRating' => 99 ],
] );
$check( null === $images[0]['clientRating'] && 'green' === $images[0]['flag'] && $images[0]['hearted'], 'Legacy feedback changed.' );
$check( 4 === $images[1]['clientRating'], 'Client rating lost during normalization.' );
$check( null === $images[2]['clientRating'] && null === $images[3]['clientRating'], 'Clear or invalid rating not normalized to null.' );
$check( $images === fbks_normalize_proofing_images( json_decode( wp_json_encode( $images ), true ) ), 'Session payload does not round trip.' );
$counts = fbks_get_proofing_session_counts( $images );
$check( 1 === $counts['rated'] && 1 === $counts['hearted'], 'Report counts include unrated clients.' );
echo "Passed: PHP rating validation, legacy compatibility, clear, session JSON round trip, and admin counts.\n";

$admin = get_users( [ 'role' => 'administrator', 'number' => 1 ] )[0] ?? null;
$check( (bool) $admin, 'No administrator available for preview test.' );
$preview_post_id = get_posts( [ 'post_type' => 'page', 'numberposts' => 1, 'fields' => 'ids' ] )[0];
$post = new WP_Post( (object) [ 'ID' => $preview_post_id, 'post_author' => $admin->ID, 'post_type' => 'page', 'post_status' => 'publish', 'post_content' => '<!-- wp:folioblocks/proofing-gallery-block /-->' ] );
wp_set_current_user( 0 );
$check( true === fbks_admin_preview_proofing_password_required( true, $post ), 'Guest password gate bypassed.' );
wp_set_current_user( $admin->ID );
$check( false === fbks_admin_preview_proofing_password_required( true, $post ), 'Administrator preview still gated.' );
$post->post_content = '<!-- wp:paragraph --><p>Protected page</p><!-- /wp:paragraph -->';
$check( true === fbks_admin_preview_proofing_password_required( true, $post ), 'Unrelated protected page bypassed.' );
echo "Passed: administrator proofing preview bypass, guest protection and unrelated password-protected pages.\n";

$palette_attributes = [ 'flagMode' => 'advanced', 'flagPalette' => [ 'name' => 'Retained palette', 'items' => [
    [ 'value' => 'class-4', 'label' => 'Review', 'color' => '#123456' ],
    [ 'value' => 'class-99', 'label' => 'Invalid', 'color' => '#ffffff' ],
    [ 'value' => 'class-5', 'label' => 'Invalid color', 'color' => 'bad' ],
] ] ];
$palette = fbks_get_proofing_flag_palette( $palette_attributes );
$check( 1 === count($palette['items']) && '#123456' === $palette['items'][0]['color'], 'Retained palette not sanitized or changed by global defaults.' );
$check( 'red' === fbks_get_proofing_flag_palette([])['items'][0]['value'], 'Simple flags changed.' );
$advanced_images = fbks_normalize_proofing_images( [ [ 'imageId' => 'advanced', 'flag' => 'class-4' ], [ 'imageId' => 'bad', 'flag' => 'class-99' ] ] );
$check( 'class-4' === $advanced_images[0]['flag'] && '' === $advanced_images[1]['flag'], 'Advanced flag validation failed.' );
echo "Passed: retained palette sanitization, simple compatibility, advanced session flag round trip.\n";

ob_start(); fbks_render_proofing_client_rating(4); $rating_html = ob_get_clean();
$check(5 === substr_count($rating_html, '<svg') && 4 === substr_count($rating_html, 'class="is-filled"'), 'Admin rating stars do not match the client rating.');
$check(false !== strpos($rating_html, '4 / 5'), 'Admin rating value missing.');
ob_start(); fbks_render_proofing_client_rating(null); $check('&mdash;' === ob_get_clean(), 'Unrated image shown as rated.');
ob_start(); fbks_render_proofing_client_flag('class-4', $palette); $flag_html = ob_get_clean();
$check(false !== strpos($flag_html, 'Review') && false !== strpos($flag_html, '#123456'), 'Admin advanced flag label or retained color missing.');
ob_start(); fbks_render_proofing_client_flag('class-8', [ 'items' => [ [ 'value' => 'class-8', 'color' => '#ffffff', 'label' => '<White>' ] ] ]); $flag_html = ob_get_clean();
$check(false !== strpos($flag_html, '#ffffff') && false !== strpos($flag_html, '&lt;White&gt;'), 'White flag or escaped label missing.');
ob_start(); fbks_render_proofing_client_flag('green'); $check(false !== strpos(ob_get_clean(), '#16a34a'), 'Simple flag color missing.');
ob_start(); fbks_render_proofing_client_flag('class-4'); $check(false !== strpos(ob_get_clean(), 'Color class 4'), 'Historical flag fallback missing.');
echo "Passed: admin report stars, unrated values, advanced colors and labels, white flags, Simple flags and historical fallback.\n";

$check(['heart' => true, 'rating' => false, 'flag' => true, 'comment' => true] === fbks_get_proofing_feedback_controls([]), 'Legacy gallery control defaults changed.');
for ($mask = 0; $mask < 16; $mask++) {
    $controls = [];
    foreach (['heart', 'rating', 'flag', 'comment'] as $index => $key) { $controls[$key] = (bool) ($mask & (1 << $index)); }
    $session = [
        'id' => 0, 'clientEmail' => '', 'pageId' => 0, 'galleryId' => '', 'galleryKey' => '', 'status' => 'submitted', 'presence' => '', 'lastSeenAt' => '', 'updatedAt' => '', 'isCurrent' => true,
        'controls' => $controls, 'flagPalette' => $palette, 'images' => $images, 'counts' => fbks_get_proofing_session_counts($images),
    ];
    ob_start(); fbks_render_proofing_session_detail($session); $report = ob_get_clean();
    foreach (['heart' => 'Hearts', 'rating' => 'Star Rating', 'flag' => 'Colored Flags', 'comment' => 'Comments'] as $key => $label) {
        $check($controls[$key] === (false !== strpos($report, 'data-proofing-sort="' . $key . '"')), 'Disabled report heading shown.');
        $check($controls[$key] === (false !== strpos($report, 'data-label="' . $label . '"')), 'Disabled report cells shown.');
        $summary_labels = ['heart' => 'Hearted', 'rating' => 'Rated', 'flag' => 'Flagged', 'comment' => 'Comments'];
        $check($controls[$key] === (false !== strpos($report, '<span>' . $summary_labels[$key] . '</span>')), 'Disabled summary box shown.');
    }
}
echo "Passed: all 16 feedback column combinations, matching headers and cells, and legacy gallery defaults.\n";
