<?php

$before_image = $attributes['beforeImage'] ?? null;
$after_image = $attributes['afterImage'] ?? null;
$orientation = $attributes['sliderOrientation'] ?? 'horizontal';
$show_labels = !empty($attributes['showLabels']);
$label_position = $attributes['labelPosition'] ?? 'center';
$label_text_color = $attributes['labelTextColor'] ?? '#ffffff';
$label_bg_color = $attributes['labelBackgroundColor'] ?? 'rgba(0, 0, 0, 0.6)';
$slider_color = $attributes['sliderColor'] ?? '#ffffff';

if (empty($before_image['src']) || empty($after_image['src'])) {
	return '';
}

$block_wrapper_attributes = get_block_wrapper_attributes();

?>

<?php echo '<div ' . wp_kses( $block_wrapper_attributes, [ 'div' => [] ] ) . '>'; ?>
	<div class="pb-before-after-container <?php echo $orientation === 'vertical' ? 'is-vertical' : ''; ?>">
		<div class="pb-after-wrapper">
			<?php echo wp_get_attachment_image( $after_image['id'], 'full', false, [ 'class' => 'pb-after-image' ] ); ?>
			<?php if ($show_labels): ?>
				<div class="pb-label pb-after-label label-<?php echo esc_attr($label_position); ?>" style="color: <?php echo esc_attr($label_text_color); ?>; background-color: <?php echo esc_attr($label_bg_color); ?>;">
					<?php esc_html_e('After', 'portfolio-blocks'); ?>
				</div>
			<?php endif; ?>
		</div>
		<div class="pb-before-wrapper">
			<?php echo wp_get_attachment_image( $before_image['id'], 'full', false, [ 'class' => 'pb-before-image' ] ); ?>
			<?php if ($show_labels): ?>
				<div class="pb-label pb-before-label label-<?php echo esc_attr($label_position); ?>" style="color: <?php echo esc_attr($label_text_color); ?>; background-color: <?php echo esc_attr($label_bg_color); ?>;">
					<?php esc_html_e('Before', 'portfolio-blocks'); ?>
				</div>
			<?php endif; ?>
		</div>
		
		<?php $slider_value = $orientation === 'vertical' ? 100 - 50 : 50; ?>
		<input type="range" min="0" max="100" value="<?php echo isset($attributes['startingPosition']) ? intval($attributes['startingPosition']) : 50; ?>" class="pb-slider <?php echo $orientation === 'vertical' ? 'is-vertical' : ''; ?>" />		
		<div class="pb-slider-handle" style="--pb-slider-color: <?php echo esc_attr($slider_color); ?>; background-color: <?php echo esc_attr($slider_color); ?>;"></div>
	</div>
</div>
