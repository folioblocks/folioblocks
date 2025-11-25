
<?php
if ( ! defined( 'ABSPATH' ) ) exit;

$port_id          = $attributes['id'] ?? 0;
$port_url         = $attributes['url'] ?? '';
$port_alt         = $attributes['alt'] ?? '';
$port_resolution  = $attributes['resolution'] ?? 'large';
$port_shape       = $attributes['loupeShape'] ?? 'circle';
$port_theme       = $attributes['loupeTheme'] ?? 'light';

$wrapper = get_block_wrapper_attributes([
    'data-resolution' => esc_attr( $port_resolution ),
    'data-shape'      => esc_attr( $port_shape ),
    'data-theme'      => esc_attr( $port_theme ),
]);
?>
<figure <?php echo $wrapper; ?>>
    <?php if ( $port_url ) : ?>
        <div class="pb-loupe-container">
            <img
                src="<?php echo esc_url( $port_url ); ?>"
                alt="<?php echo esc_attr( $port_alt ); ?>"
                class="pb-loupe-image"
            />
            <div class="pb-loupe-lens"></div>
        </div>
    <?php endif; ?>
</figure>
