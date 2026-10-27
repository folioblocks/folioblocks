<?php
/**
 * Before & After Block
 * Render PHP
 **/


if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$fbks_before_image = $attributes['beforeImage'] ?? null;
$fbks_after_image = $attributes['afterImage'] ?? null;
$fbks_orientation = $attributes['sliderOrientation'] ?? 'horizontal';

if (empty($fbks_before_image['src']) || empty($fbks_after_image['src'])) {
	return '';
}

$fbks_is_pro = fbks_fs()->can_use_premium_code__premium_only();
$fbks_loading = $fbks_is_pro && ! empty( $attributes['lazyLoad'] ) ? 'lazy' : 'eager';
$fbks_wrapper_args = [
    'data-wp-interactive' => 'folioblocks/before-after',
    'data-wp-key' => wp_unique_id( 'fbks-comparison-' ) . '-' . md5( wp_json_encode( $attributes ) ),
];
if ( $fbks_is_pro ) {
    $fbks_wrapper_args['data-wp-watch'] = 'callbacks.protection';
    if ( ! empty( $attributes['disableRightClick'] ) ) {
        $fbks_wrapper_args['data-disable-right-click'] = 'true';
    }
    if ( ! empty( $attributes['disableDragToSave'] ) ) {
        $fbks_wrapper_args['data-disable-drag-to-save'] = 'true';
    }
}
$fbks_block_wrapper_attributes = get_block_wrapper_attributes( $fbks_wrapper_args );

?>

<?php echo '<div ' . $fbks_block_wrapper_attributes . '>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() escapes each attribute value. ?>
	<div
		data-wp-watch="callbacks.initialize"
		class="pb-before-after-container <?php echo $fbks_orientation === 'vertical' ? 'is-vertical' : ''; ?>"
	>
		<div class="pb-after-wrapper">
			<?php 
				echo wp_get_attachment_image( 
  					$fbks_after_image['id'], 
  					'full', 
  					false, 
  					[ 
    					'class' => 'pb-after-image', 
						'loading' => $fbks_loading,
  					] 
				); 
			?>
			<?php if ( fbks_fs()->can_use_premium_code__premium_only() ) : 
				$fbks_show_labels = !empty($attributes['showLabels']);
				$fbks_label_position = $attributes['labelPosition'] ?? 'center';
				$fbks_label_text_color = $attributes['labelTextColor'] ?? '#ffffff';
				$fbks_label_bg_color = $attributes['labelBackgroundColor'] ?? 'rgba(0, 0, 0, 0.6)';
				if ( $fbks_show_labels ) : ?>
					<div class="pb-label pb-after-label label-<?php echo esc_attr($fbks_label_position); ?>" style="color: <?php echo esc_attr($fbks_label_text_color); ?>; background-color: <?php echo esc_attr($fbks_label_bg_color); ?>;">
						<?php esc_html_e('After', 'folioblocks'); ?>
					</div>
			<?php 
				endif; 
			endif; ?>
		</div>
		<div class="pb-before-wrapper">
			<?php 
				echo wp_get_attachment_image( 
  					$fbks_before_image['id'], 
  					'full', 
  					false, 
  					[ 
    					'class' => 'pb-before-image', 
						'loading' => $fbks_loading,
  					] 
				); 
			?>
			<?php if ( fbks_fs()->can_use_premium_code__premium_only() ) : 
				$fbks_show_labels = !empty($attributes['showLabels']);
				$fbks_label_position = $attributes['labelPosition'] ?? 'center';
				$fbks_label_text_color = $attributes['labelTextColor'] ?? '#ffffff';
				$fbks_label_bg_color = $attributes['labelBackgroundColor'] ?? 'rgba(0, 0, 0, 0.6)';
				if ( $fbks_show_labels ) : ?>
					<div class="pb-label pb-before-label label-<?php echo esc_attr($fbks_label_position); ?>" style="color: <?php echo esc_attr($fbks_label_text_color); ?>; background-color: <?php echo esc_attr($fbks_label_bg_color); ?>;">
						<?php esc_html_e('Before', 'folioblocks'); ?>
					</div>
			<?php 
				endif; 
			endif; ?>
		</div>
		
		<?php if ( fbks_fs()->can_use_premium_code__premium_only() ) : 
			$fbks_slider_color = $attributes['sliderColor'] ?? '#ffffff';
			$fbks_starting_position = isset($attributes['startingPosition']) ? intval($attributes['startingPosition']) : 50;
		?>
			<input type="range" min="0" max="100" value="<?php echo esc_attr( $fbks_starting_position ); ?>" class="pb-slider <?php echo $fbks_orientation === 'vertical' ? 'is-vertical' : ''; ?>" />
			<div class="pb-slider-handle" style="--pb-slider-color: <?php echo esc_attr($fbks_slider_color); ?>; background-color: <?php echo esc_attr($fbks_slider_color); ?>;"></div>
		<?php else : ?>
			<input type="range" min="0" max="100" value="50" class="pb-slider <?php echo $fbks_orientation === 'vertical' ? 'is-vertical' : ''; ?>" />
			<div class="pb-slider-handle"></div>
		<?php endif; ?>
	</div>
</div>