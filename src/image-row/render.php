<?php
/**
 * PB Image Row Block
 * Render PHP
 **/

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

?>
<?php echo wp_kses( $content, fbks_get_allowed_post_html_with_svg() ); ?>
