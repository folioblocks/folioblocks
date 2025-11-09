<?php
/**
 * PB Image Row Block
 * Render PHP
 **/

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

?>
<?php echo wp_kses_post( $content ); ?>

