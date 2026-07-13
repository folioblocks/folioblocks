<?php
/**
 * Proofing Gallery Block
 * Render PHP
 **/

$fbks_gallery_password = isset( $attributes['galleryPassword'] ) ? (string) $attributes['galleryPassword'] : '';
$fbks_client_email     = isset( $attributes['clientEmail'] ) ? (string) $attributes['clientEmail'] : '';
$fbks_gallery_key      = 'fbks-proofing-' . md5( $fbks_client_email . '|' . $fbks_gallery_password );
$fbks_can_view         = current_user_can( 'manage_options' ) || '' === $fbks_gallery_password;
$fbks_error            = '';
$fbks_enable_heart     = ! isset( $attributes['enableHeart'] ) || (bool) $attributes['enableHeart'];
$fbks_enable_flag      = ! isset( $attributes['enableFlag'] ) || (bool) $attributes['enableFlag'];
$fbks_enable_comment   = ! isset( $attributes['enableComment'] ) || (bool) $attributes['enableComment'];
$fbks_filter_align     = isset( $attributes['filterAlign'] ) ? sanitize_key( $attributes['filterAlign'] ) : 'center';
$fbks_gallery_id       = wp_unique_id( 'fbks-proofing-gallery-' );
$fbks_page_id          = get_the_ID();
$fbks_saved_session    = function_exists( 'fbks_get_proofing_session_state' ) ? fbks_get_proofing_session_state( $fbks_gallery_key ) : [ 'status' => '', 'updatedAt' => '', 'images' => [] ];
$fbks_track_presence   = ! current_user_can( 'manage_options' );

if ( ! in_array( $fbks_filter_align, [ 'left', 'center', 'right' ], true ) ) {
	$fbks_filter_align = 'center';
}

$fbks_proofing_icon = static function ( $icon ) {
	if ( 'heart' === $icon ) {
		return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.4-9.4-8.2C.7 9.8 1.2 6.2 3.8 4.4 6 2.9 8.7 3.4 10.5 5.3L12 6.9l1.5-1.6c1.8-1.9 4.5-2.4 6.7-.9 2.6 1.8 3.1 5.4 1.2 8.4C19 16.6 12 21 12 21z" /></svg>';
	}

	if ( 'flag' === $icon ) {
		return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4h10.6l.4 3.1h3v9H9.4L9 13.9H8V21H6z" /></svg>';
	}

	if ( 'comment' === $icon ) {
		return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v10H8.7L5 18.4V5z" /></svg>';
	}

	return '<span aria-hidden="true">All</span>';
};

$fbks_filter_options = [
	[
		'label' => __( 'All Images', 'folioblocks' ),
		'value' => 'all',
		'icon'  => 'all',
	],
];

if ( $fbks_enable_heart ) {
	$fbks_filter_options[] = [
		'label' => __( 'Hearted', 'folioblocks' ),
		'value' => 'hearted',
		'icon'  => 'heart',
	];
}

if ( $fbks_enable_flag ) {
	$fbks_filter_options[] = [
		'label' => __( 'Red Flag', 'folioblocks' ),
		'value' => 'flag-red',
		'icon'  => 'flag',
		'color' => 'red',
	];
	$fbks_filter_options[] = [
		'label' => __( 'Orange Flag', 'folioblocks' ),
		'value' => 'flag-orange',
		'icon'  => 'flag',
		'color' => 'orange',
	];
	$fbks_filter_options[] = [
		'label' => __( 'Green Flag', 'folioblocks' ),
		'value' => 'flag-green',
		'icon'  => 'flag',
		'color' => 'green',
	];
}

if ( $fbks_enable_comment ) {
	$fbks_filter_options[] = [
		'label' => __( 'Commented', 'folioblocks' ),
		'value' => 'commented',
		'icon'  => 'comment',
	];
}

if ( ! $fbks_can_view && isset( $_POST['fbks_proofing_gallery_key'], $_POST['fbks_proofing_gallery_password'], $_POST['fbks_proofing_gallery_nonce'] ) ) {
	$fbks_posted_key = sanitize_text_field( wp_unslash( $_POST['fbks_proofing_gallery_key'] ) );
	$fbks_nonce      = sanitize_text_field( wp_unslash( $_POST['fbks_proofing_gallery_nonce'] ) );

	if ( $fbks_gallery_key === $fbks_posted_key && wp_verify_nonce( $fbks_nonce, $fbks_gallery_key ) ) {
		$fbks_posted_password = sanitize_text_field( wp_unslash( $_POST['fbks_proofing_gallery_password'] ) );

		if ( hash_equals( $fbks_gallery_password, $fbks_posted_password ) ) {
			$fbks_can_view = true;
		} else {
			$fbks_error = __( 'The gallery password is incorrect.', 'folioblocks' );
		}
	}
}

?>
<div <?php echo get_block_wrapper_attributes(); ?>>
	<?php if ( $fbks_can_view ) : ?>
		<div
			class="fbks-proofing-gallery"
			data-wp-interactive="folioblocks/proofing-gallery"
			data-wp-context="<?php echo esc_attr( wp_json_encode( [
				'galleryId'    => $fbks_gallery_id,
				'galleryKey'   => $fbks_gallery_key,
				'clientEmail'  => $fbks_client_email,
				'pageId'       => $fbks_page_id ? (int) $fbks_page_id : 0,
				'restUrl'      => esc_url_raw( rest_url( 'folioblocks/v1/proofing-gallery/session' ) ),
				'presenceUrl'  => esc_url_raw( rest_url( 'folioblocks/v1/proofing-gallery/session/presence' ) ),
				'trackPresence' => $fbks_track_presence,
				'savedSession' => $fbks_saved_session,
			] ) ); ?>"
			data-wp-init="callbacks.registerGallery"
			data-proofing-gallery-id="<?php echo esc_attr( $fbks_gallery_id ); ?>"
			data-enable-heart="<?php echo esc_attr( $fbks_enable_heart ? 'true' : 'false' ); ?>"
			data-enable-flag="<?php echo esc_attr( $fbks_enable_flag ? 'true' : 'false' ); ?>"
			data-enable-comment="<?php echo esc_attr( $fbks_enable_comment ? 'true' : 'false' ); ?>"
		>
			<div class="fbks-proofing-gallery__filter-bar align-<?php echo esc_attr( $fbks_filter_align ); ?>" aria-label="<?php esc_attr_e( 'Proofing filters', 'folioblocks' ); ?>">
				<?php foreach ( $fbks_filter_options as $fbks_filter_option ) : ?>
					<?php
					$fbks_filter_classes = [
						'fbks-proofing-filter-button',
						'all' === $fbks_filter_option['value'] ? 'is-active' : '',
						isset( $fbks_filter_option['color'] ) ? 'is-' . $fbks_filter_option['color'] : '',
						'is-' . $fbks_filter_option['icon'],
					];
					?>
					<button
						type="button"
						class="<?php echo esc_attr( implode( ' ', array_filter( $fbks_filter_classes ) ) ); ?>"
						data-proofing-filter="<?php echo esc_attr( $fbks_filter_option['value'] ); ?>"
						data-wp-context="<?php echo esc_attr( wp_json_encode( [ 'galleryId' => $fbks_gallery_id, 'filter' => $fbks_filter_option['value'] ] ) ); ?>"
						data-wp-on--click="actions.chooseFilter"
						data-wp-class--is-active="state.isActiveFilter"
						data-wp-bind--aria-pressed="state.isActiveFilter"
						aria-pressed="<?php echo 'all' === $fbks_filter_option['value'] ? 'true' : 'false'; ?>"
						aria-label="<?php echo esc_attr( $fbks_filter_option['label'] ); ?>"
						title="<?php echo esc_attr( $fbks_filter_option['label'] ); ?>"
					>
						<?php echo wp_kses( $fbks_proofing_icon( $fbks_filter_option['icon'] ), fbks_get_allowed_post_html_with_svg() ); ?>
					</button>
				<?php endforeach; ?>
			</div>
			<div class="fbks-proofing-gallery__inner">
				<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
			<div class="fbks-proofing-gallery__actions">
				<button
					class="fbks-proofing-gallery__action-button fbks-proofing-gallery__action-button--save"
					type="button"
					data-wp-on--click="actions.saveProgress"
					data-wp-bind--disabled="state.isCurrentGallerySaving"
				>
					<?php esc_html_e( 'Save & Continue', 'folioblocks' ); ?>
				</button>
				<button
					class="fbks-proofing-gallery__action-button fbks-proofing-gallery__action-button--submit"
					type="button"
					data-wp-on--click="actions.submitProofing"
					data-wp-bind--disabled="state.isCurrentGallerySaving"
				>
					<?php esc_html_e( 'Submit', 'folioblocks' ); ?>
				</button>
				<p class="fbks-proofing-gallery__status" data-wp-text="state.currentGalleryNotice" data-wp-bind--hidden="!state.currentGalleryNotice" hidden></p>
			</div>
		</div>
	<?php else : ?>
		<form class="fbks-proofing-gallery-gate" method="post">
			<label class="fbks-proofing-gallery-gate__label">
				<?php esc_html_e( 'Gallery Password', 'folioblocks' ); ?>
				<input
					class="fbks-proofing-gallery-gate__input"
					type="password"
					name="fbks_proofing_gallery_password"
					autocomplete="current-password"
					required
				/>
			</label>
			<input type="hidden" name="fbks_proofing_gallery_key" value="<?php echo esc_attr( $fbks_gallery_key ); ?>" />
			<?php wp_nonce_field( $fbks_gallery_key, 'fbks_proofing_gallery_nonce' ); ?>
			<?php if ( $fbks_error ) : ?>
				<p class="fbks-proofing-gallery-gate__error"><?php echo esc_html( $fbks_error ); ?></p>
			<?php endif; ?>
			<button class="fbks-proofing-gallery-gate__button" type="submit">
				<?php esc_html_e( 'View Gallery', 'folioblocks' ); ?>
			</button>
		</form>
	<?php endif; ?>
</div>
