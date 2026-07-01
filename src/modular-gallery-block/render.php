<?php
/**
 * Modular Gallery Block
 * Render PHP
 **/


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

$fbks_attributes = wp_parse_args( $attributes, [
    'gap' => 10,
    'tabletGap' => 10,
    'mobileGap' => 10,
    'noGap' => false,
] );

$fbks_gap = $fbks_attributes['noGap'] ? 0 : max( 0, min( 50, intval( $fbks_attributes['gap'] ) ) );
$fbks_tablet_gap = $fbks_attributes['noGap'] ? 0 : max( 0, min( 50, intval( $fbks_attributes['tabletGap'] ) ) );
$fbks_mobile_gap = $fbks_attributes['noGap'] ? 0 : max( 0, min( 50, intval( $fbks_attributes['mobileGap'] ) ) );
$fbks_gap_styles = '--pb-gallery-gap-desktop:' . $fbks_gap . 'px;';
$fbks_gap_styles .= '--pb-gallery-gap-tablet:' . $fbks_tablet_gap . 'px;';
$fbks_gap_styles .= '--pb-gallery-gap-mobile:' . $fbks_mobile_gap . 'px;';

?>
<?php
$fbks_wrapper_args = [
	'class' => 'is-loading',
	'style' => $fbks_gap_styles,
];

if ( fbks_fs()->can_use_premium_code__premium_only() ) {
    if ( ! empty( $attributes['disableRightClick'] ) ) {
        $fbks_wrapper_args['data-disable-right-click'] = 'true';
    }

    if ( ! empty( $attributes['enableDownload'] ) ) {
        $fbks_wrapper_args['data-enable-download'] = 'true';
    }
}
?>
<?php
$fbks_wrapper_attributes = get_block_wrapper_attributes( $fbks_wrapper_args );
echo '<div ' . wp_kses_post( $fbks_wrapper_attributes ) . '>';
?>
	<?php echo wp_kses( $content, fbks_get_allowed_post_html_with_svg() ); ?>
</div>
