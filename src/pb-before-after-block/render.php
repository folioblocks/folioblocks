<?php
/**
 * Before & After Block
 * Render PHP
 **/


if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$port_before_image = $attributes['beforeImage'] ?? null;
$port_after_image = $attributes['afterImage'] ?? null;
$port_orientation = $attributes['sliderOrientation'] ?? 'horizontal';

if (empty($port_before_image['src']) || empty($port_after_image['src'])) {
	return '';
}

$port_block_wrapper_attributes = get_block_wrapper_attributes();

?>

<?php echo '<div ' . wp_kses( $port_block_wrapper_attributes, [ 'div' => [] ] ) . '>'; ?>
	<div
		class="pb-before-after-container <?php echo $port_orientation === 'vertical' ? 'is-vertical' : ''; ?>"
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
  					$port_after_image['id'], 
  					'full', 
  					false, 
  					[ 
    					'class' => 'pb-after-image', 
						'loading' => 'eager',
  					] 
				); 
			?>
			<?php if ( pb_fs()->can_use_premium_code__premium_only() ) : 
				$port_show_labels = !empty($attributes['showLabels']);
				$port_label_position = $attributes['labelPosition'] ?? 'center';
				$port_label_text_color = $attributes['labelTextColor'] ?? '#ffffff';
				$port_label_bg_color = $attributes['labelBackgroundColor'] ?? 'rgba(0, 0, 0, 0.6)';
				if ( $port_show_labels ) : ?>
					<div class="pb-label pb-after-label label-<?php echo esc_attr($port_label_position); ?>" style="color: <?php echo esc_attr($port_label_text_color); ?>; background-color: <?php echo esc_attr($port_label_bg_color); ?>;">
						<?php esc_html_e('After', 'folioblocks'); ?>
					</div>
			<?php 
				endif; 
			endif; ?>
		</div>
		<div class="pb-before-wrapper">
			<?php 
				echo wp_get_attachment_image( 
  					$port_before_image['id'], 
  					'full', 
  					false, 
  					[ 
    					'class' => 'pb-before-image', 
						'loading' => 'eager',
  					] 
				); 
			?>
			<?php if ( pb_fs()->can_use_premium_code__premium_only() ) : 
				$port_show_labels = !empty($attributes['showLabels']);
				$port_label_position = $attributes['labelPosition'] ?? 'center';
				$port_label_text_color = $attributes['labelTextColor'] ?? '#ffffff';
				$port_label_bg_color = $attributes['labelBackgroundColor'] ?? 'rgba(0, 0, 0, 0.6)';
				if ( $port_show_labels ) : ?>
					<div class="pb-label pb-before-label label-<?php echo esc_attr($port_label_position); ?>" style="color: <?php echo esc_attr($port_label_text_color); ?>; background-color: <?php echo esc_attr($port_label_bg_color); ?>;">
						<?php esc_html_e('Before', 'folioblocks'); ?>
					</div>
			<?php 
				endif; 
			endif; ?>
		</div>
		
		<?php if ( pb_fs()->can_use_premium_code__premium_only() ) : 
			$port_slider_color = $attributes['sliderColor'] ?? '#ffffff';
			$port_starting_position = isset($attributes['startingPosition']) ? intval($attributes['startingPosition']) : 50;
		?>
			<input type="range" min="0" max="100" value="<?php echo esc_attr( $port_starting_position ); ?>" class="pb-slider <?php echo $port_orientation === 'vertical' ? 'is-vertical' : ''; ?>" />
			<div class="pb-slider-handle" style="--pb-slider-color: <?php echo esc_attr($port_slider_color); ?>; background-color: <?php echo esc_attr($port_slider_color); ?>;"></div>
		<?php else : ?>
			<input type="range" min="0" max="100" value="50" class="pb-slider <?php echo $port_orientation === 'vertical' ? 'is-vertical' : ''; ?>" />
			<div class="pb-slider-handle"></div>
		<?php endif; ?>
	</div>
</div>