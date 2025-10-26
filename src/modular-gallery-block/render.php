<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

?>
<?php
$wrapper_args = [];

if ( ! empty( $attributes['disableRightClick'] ) ) {
    $wrapper_args['data-disable-right-click'] = 'true';
}

if ( ! empty( $attributes['enableDownload'] ) ) {
    $wrapper_args['data-enable-download'] = 'true';
}
?>
<?php
$wrapper_attributes = get_block_wrapper_attributes( $wrapper_args );
echo '<div ' . wp_kses( $wrapper_attributes, [ 'div' => [] ] ) . '>';
?>
	<?php echo wp_kses_post( $content ); ?>
</div>
