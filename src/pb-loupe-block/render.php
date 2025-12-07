<?php
if ( ! defined( 'ABSPATH' ) ) exit;

$fbks_resolution  = $attributes['resolution'] ?? 'large';
$fbks_shape       = $attributes['loupeShape'] ?? 'circle';
$fbks_theme       = $attributes['loupeTheme'] ?? 'light';

$fbks_wrapper_attrs = [
    'data-resolution' => esc_attr( $fbks_resolution ),
    'data-shape'      => esc_attr( $fbks_shape ),
    'data-theme'      => esc_attr( $fbks_theme ),
];

if ( fbks_fs()->can_use_premium_code__premium_only() ) {
    if ( ! empty( $attributes['disableRightClick'] ) ) {
        $fbks_wrapper_attrs['data-disable-right-click'] = 'true';
    }
}

$fbks_wrapper = get_block_wrapper_attributes( $fbks_wrapper_attrs );

$fbks_allowed_wrapper_attrs = [
    'class'                     => true,
    'style'                     => true,
    'data-resolution'           => true,
    'data-shape'                => true,
    'data-theme'                => true,
    'data-disable-right-click'  => true,
];
?>
<figure <?php echo wp_kses( $fbks_wrapper, $fbks_allowed_wrapper_attrs ); ?>>
    <?php if ( ! empty( $attributes['url'] ) ) : ?>
        <div class="pb-loupe-container">
            <img
                src="<?php echo esc_url( $attributes['url'] ); ?>"
                alt="<?php echo esc_attr( $attributes['alt'] ?? '' ); ?>"
                class="pb-loupe-image"
            />
            <div class="pb-loupe-lens"></div>
        </div>
    <?php endif; ?>
</figure>