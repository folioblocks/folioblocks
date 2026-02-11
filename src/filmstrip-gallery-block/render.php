<?php
/**
 * Filmstrip Gallery Block
 * Render PHP
 **/

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$fbks_wrapper_attributes = get_block_wrapper_attributes();
?>
<div <?php echo wp_kses( $fbks_wrapper_attributes, [ 'div' => [] ] ); ?>>
	<?php echo wp_kses_post( $content ); ?>
</div>
