<?php
/**
 * Modular Gallery Block
 * Render PHP
 **/


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

?>
<?php
$pb_wrapper_args = [];

if ( pb_fs()->can_use_premium_code__premium_only() ) {
    if ( ! empty( $attributes['disableRightClick'] ) ) {
        $pb_wrapper_args['data-disable-right-click'] = 'true';
    }

    if ( ! empty( $attributes['enableDownload'] ) ) {
        $pb_wrapper_args['data-enable-download'] = 'true';
    }
}
?>
<?php
$pb_wrapper_attributes = get_block_wrapper_attributes( $pb_wrapper_args );
echo '<div ' . wp_kses( $pb_wrapper_attributes, [ 'div' => [] ] ) . '>';
?>
	<?php echo wp_kses_post( $content ); ?>
</div>