<?php
/**
 * PB Image Stack Block
 * Render PHP
 **/


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

?>
<?php echo fbks_kses_post_with_svg( $content ); ?>
