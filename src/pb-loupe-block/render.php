
<?php
if ( ! defined( 'ABSPATH' ) ) exit;

$pb_id          = $attributes['id'] ?? 0;
$pb_url         = $attributes['url'] ?? '';
$pb_alt         = $attributes['alt'] ?? '';
$pb_resolution  = $attributes['resolution'] ?? 'large';
$pb_shape       = $attributes['loupeShape'] ?? 'circle';
$pb_theme       = $attributes['loupeTheme'] ?? 'light';

$wrapper = get_block_wrapper_attributes([
    'data-resolution' => esc_attr( $pb_resolution ),
    'data-shape'      => esc_attr( $pb_shape ),
    'data-theme'      => esc_attr( $pb_theme ),
]);
?>
<figure <?php echo $wrapper; ?>>
    <?php if ( $pb_url ) : ?>
        <div class="pb-loupe-container">
            <img
                src="<?php echo esc_url( $pb_url ); ?>"
                alt="<?php echo esc_attr( $pb_alt ); ?>"
                class="pb-loupe-image"
            />
            <div class="pb-loupe-lens"></div>
        </div>
    <?php endif; ?>
</figure>
