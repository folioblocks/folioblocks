<?php
/**
 * Before & After Block
 * Render PHP
 **/


if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$pb_before_image = $attributes['beforeImage'] ?? null;
$pb_after_image = $attributes['afterImage'] ?? null;
$pb_orientation = $attributes['sliderOrientation'] ?? 'horizontal';

if (empty($pb_before_image['src']) || empty($pb_after_image['src'])) {
	return '';
}

$pb_block_wrapper_attributes = get_block_wrapper_attributes();

?>

<?php echo '<div ' . wp_kses( $pb_block_wrapper_attributes, [ 'div' => [] ] ) . '>'; ?>
	<div
		class="pb-before-after-container <?php echo $pb_orientation === 'vertical' ? 'is-vertical' : ''; ?>"
		<?php if ( pb_fs()->can_use_premium_code__premium_only() ) : ?>
			<?php if ( !empty($attributes['disableRightClick']) ) : ?>
				data-disable-right-click="true"
			<?php endif; ?>
			<?php if ( !empty($attributes['lazyLoad']) ) : ?>
				data-lazy-load="true"
			<?php endif; ?>
		<?php endif; ?>
	>
		<div class="pb-after-wrapper">
			<?php 
				echo wp_get_attachment_image( 
  					$pb_after_image['id'], 
  					'full', 
  					false, 
  					[ 
    					'class' => 'pb-after-image', 
						'loading' => 'eager',
  					] 
				); 
			?>
			<?php if ( pb_fs()->can_use_premium_code__premium_only() ) : 
				$pb_show_labels = !empty($attributes['showLabels']);
				$pb_label_position = $attributes['labelPosition'] ?? 'center';
				$pb_label_text_color = $attributes['labelTextColor'] ?? '#ffffff';
				$pb_label_bg_color = $attributes['labelBackgroundColor'] ?? 'rgba(0, 0, 0, 0.6)';
				if ( $pb_show_labels ) : ?>
					<div class="pb-label pb-after-label label-<?php echo esc_attr($pb_label_position); ?>" style="color: <?php echo esc_attr($pb_label_text_color); ?>; background-color: <?php echo esc_attr($pb_label_bg_color); ?>;">
						<?php esc_html_e('After', 'folioblocks'); ?>
					</div>
			<?php 
				endif; 
			endif; ?>
		</div>
		<div class="pb-before-wrapper">
			<?php 
				echo wp_get_attachment_image( 
  					$pb_before_image['id'], 
  					'full', 
  					false, 
  					[ 
    					'class' => 'pb-before-image', 
						'loading' => 'eager',
  					] 
				); 
			?>
			<?php if ( pb_fs()->can_use_premium_code__premium_only() ) : 
				$pb_show_labels = !empty($attributes['showLabels']);
				$pb_label_position = $attributes['labelPosition'] ?? 'center';
				$pb_label_text_color = $attributes['labelTextColor'] ?? '#ffffff';
				$pb_label_bg_color = $attributes['labelBackgroundColor'] ?? 'rgba(0, 0, 0, 0.6)';
				if ( $pb_show_labels ) : ?>
					<div class="pb-label pb-before-label label-<?php echo esc_attr($pb_label_position); ?>" style="color: <?php echo esc_attr($pb_label_text_color); ?>; background-color: <?php echo esc_attr($pb_label_bg_color); ?>;">
						<?php esc_html_e('Before', 'folioblocks'); ?>
					</div>
			<?php 
				endif; 
			endif; ?>
		</div>
		
		<?php if ( pb_fs()->can_use_premium_code__premium_only() ) : 
			$pb_slider_color = $attributes['sliderColor'] ?? '#ffffff';
			$pb_starting_position = isset($attributes['startingPosition']) ? intval($attributes['startingPosition']) : 50;
		?>
			<input type="range" min="0" max="100" value="<?php echo esc_attr( $pb_starting_position ); ?>" class="pb-slider <?php echo $pb_orientation === 'vertical' ? 'is-vertical' : ''; ?>" />
			<div class="pb-slider-handle" style="--pb-slider-color: <?php echo esc_attr($pb_slider_color); ?>; background-color: <?php echo esc_attr($pb_slider_color); ?>;"></div>
		<?php else : ?>
			<input type="range" min="0" max="100" value="50" class="pb-slider <?php echo $pb_orientation === 'vertical' ? 'is-vertical' : ''; ?>" />
			<div class="pb-slider-handle"></div>
		<?php endif; ?>
	</div>
</div>