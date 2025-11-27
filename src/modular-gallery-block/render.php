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
$fbks_wrapper_args = [];

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
echo '<div ' . wp_kses( $fbks_wrapper_attributes, [ 'div' => [] ] ) . '>';
?>
	<?php echo wp_kses_post( $content ); ?>
</div>