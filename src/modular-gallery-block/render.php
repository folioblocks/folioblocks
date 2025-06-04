<?php
/**
 * Server-side rendering for the pb-image-row block.
 *
 * @package Portfolio_Blocks
 */

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
<div <?php echo get_block_wrapper_attributes( $wrapper_args ); ?>>
	<?php echo wp_kses_post( $content ); ?>
</div>
