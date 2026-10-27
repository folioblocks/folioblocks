<?php
if ( ! defined( 'ABSPATH' ) ) exit;

$fbks_resolution  = $attributes['resolution'] ?? 'large';
$fbks_shape       = $attributes['loupeShape'] ?? 'circle';
$fbks_theme       = $attributes['loupeTheme'] ?? 'light';
$fbks_lazy_load   = ! empty( $attributes['lazyLoad'] );

$fbks_wrapper_attrs = [
    // Remount when settings change, even if the router reuses this position.
    'data-wp-key' => wp_unique_id( 'fbks-loupe-' ) . '-' . md5( wp_json_encode( $attributes ) ),
    'data-wp-interactive' => 'folioblocks/loupe',
    'data-resolution' => esc_attr( $fbks_resolution ),
    'data-shape'      => esc_attr( $fbks_shape ),
    'data-theme'      => esc_attr( $fbks_theme ),
];

if ( fbks_fs()->can_use_premium_code__premium_only() ) {
    $fbks_wrapper_attrs['data-wp-watch'] = 'callbacks.protection';
    if ( ! empty( $attributes['disableRightClick'] ) ) {
        $fbks_wrapper_attrs['data-disable-right-click'] = 'true';
    }
}

$fbks_wrapper = get_block_wrapper_attributes( $fbks_wrapper_attrs );
?>
<figure <?php echo $fbks_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() escapes each attribute value. ?>>
    <?php if ( ! empty( $attributes['url'] ) ) : ?>
        <div class="pb-loupe-container" data-wp-watch="callbacks.initialize">
            <img
                src="<?php echo esc_url( $attributes['url'] ); ?>"
                alt="<?php echo esc_attr( $attributes['alt'] ?? '' ); ?>"
                class="pb-loupe-image"
                loading="<?php echo $fbks_lazy_load ? 'lazy' : 'eager'; ?>"
                decoding="async"
            />
            <div class="pb-loupe-lens"></div>
        </div>
    <?php endif; ?>
</figure>
