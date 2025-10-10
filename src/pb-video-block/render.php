<?php

$thumbnail = esc_url( $attributes['thumbnail'] ?? '' );
$title = esc_html( $attributes['title'] ?? '' );
$video_url = esc_url( $attributes['videoUrl'] ?? '' );
$aspect = esc_attr( $attributes['aspectRatio'] ?? '16:9' );
$play_visibility = esc_attr( $attributes['playButtonVisibility'] ?? 'always' );
$title_visibility = esc_attr( $attributes['titleVisibility'] ?? 'always' );
$filter_category = $attributes['filterCategory'] ?? '';

$border_color = esc_attr( $attributes['borderColor'] ?? '' );
$border_width = absint( $attributes['borderWidth'] ?? 0 );
$border_radius = absint( $attributes['borderRadius'] ?? 0 );

$drop_shadow = ! empty( $attributes['dropShadow'] );

// Build style string for border and radius
$style = '';
if ( $border_width > 0 ) {
	$style .= "border-width: {$border_width}px; border-style: solid;";
	if ( $border_color ) {
		$style .= "border-color: {$border_color};";
	}
}
if ( $border_radius > 0 ) {
	$style .= "border-radius: {$border_radius}px;";
}

if ( ! $thumbnail || ! $video_url ) {
	return ''; // Bail if missing data
}
?>
<div <?php echo wp_kses_post( get_block_wrapper_attributes() ); ?>>
<?php
$overlay_class = '';
if ( $play_visibility === 'always' || $title_visibility === 'always' ) {
	$overlay_class = ' has-overlay-always';
} elseif ( $play_visibility === 'onHover' || $title_visibility === 'onHover' ) {
	$overlay_class = ' has-overlay-hover';
}
?>
<div class="pb-video-block aspect-<?php echo esc_attr( str_replace( ':', '-', $aspect ) ); ?><?php echo esc_attr( $overlay_class ); ?><?php echo $drop_shadow ? ' drop-shadow' : ''; ?>"
	data-filter="<?php echo esc_attr( $filter_category ); ?>"
	data-video-url="<?php echo esc_url( $video_url ); ?>"
	data-video-title="<?php echo esc_attr( $title ); ?>"
	data-video-description="<?php echo esc_attr( $attributes['description'] ); ?>"
	style="<?php echo esc_attr( $style ); ?>">
	<?php echo wp_get_attachment_image( $attributes['thumbnailId'] ?? 0, 'full', false, [ 'alt' => $title, 'class' => 'pb-video-block-img' ] ); ?>
	<div class="video-overlay">
		<div class="overlay-content">
			<?php if ( $title && $title_visibility !== 'hidden' ) : ?>
				<div class="video-title-overlay <?php echo esc_attr( $title_visibility ); ?>"><?php echo esc_html( $title ); ?></div>
			<?php endif; ?>
			<?php if ( $play_visibility !== 'hidden' ) : ?>
				<div class="video-play-button <?php echo esc_attr( $play_visibility ); ?>">▶</div>
			<?php endif; ?>
		</div>
	</div>
</div>
</div>