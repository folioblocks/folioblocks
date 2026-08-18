<?php
/**
 * Proofing Gallery Block
 * Render PHP
 **/

$fbks_gallery_password = isset( $attributes['galleryPassword'] ) ? (string) $attributes['galleryPassword'] : '';
$fbks_client_email     = isset( $attributes['clientEmail'] ) ? (string) $attributes['clientEmail'] : '';
$fbks_gallery_key      = 'fbks-proofing-' . md5( $fbks_client_email . '|' . $fbks_gallery_password );
$fbks_error            = '';
$fbks_enable_heart     = ! isset( $attributes['enableHeart'] ) || (bool) $attributes['enableHeart'];
$fbks_enable_flag      = ! isset( $attributes['enableFlag'] ) || (bool) $attributes['enableFlag'];
$fbks_enable_comment   = ! isset( $attributes['enableComment'] ) || (bool) $attributes['enableComment'];
$fbks_filter_align     = isset( $attributes['filterAlign'] ) ? sanitize_key( $attributes['filterAlign'] ) : 'center';
$fbks_button_align     = isset( $attributes['buttonAlign'] ) ? sanitize_key( $attributes['buttonAlign'] ) : 'right';
$fbks_proofing_theme   = isset( $attributes['proofingTheme'] ) ? sanitize_key( $attributes['proofingTheme'] ) : 'light';
$fbks_gallery_id       = wp_unique_id( 'fbks-proofing-gallery-' );
$fbks_page_id          = get_the_ID();
$fbks_proofing_settings = function_exists( 'fbks_get_proofing_settings' ) ? fbks_get_proofing_settings() : [ 'emailAdminOnSubmit' => false ];
$fbks_email_admin_on_submit = array_key_exists( 'emailAdminOnSubmit', $attributes )
	? (bool) $attributes['emailAdminOnSubmit']
	: ! empty( $fbks_proofing_settings['emailAdminOnSubmit'] );
$fbks_page_password    = $fbks_page_id ? (string) get_post_field( 'post_password', $fbks_page_id ) : '';
$fbks_page_password_unlocks_gallery = '' !== $fbks_gallery_password && $fbks_gallery_password === $fbks_page_password && ! post_password_required( $fbks_page_id );
$fbks_can_view         = current_user_can( 'manage_options' ) || '' === $fbks_gallery_password || $fbks_page_password_unlocks_gallery;
$fbks_saved_session    = function_exists( 'fbks_get_proofing_session_state' ) ? fbks_get_proofing_session_state( $fbks_gallery_key ) : [ 'status' => '', 'updatedAt' => '', 'images' => [] ];
$fbks_track_presence   = ! current_user_can( 'manage_options' );

if ( ! in_array( $fbks_filter_align, [ 'left', 'center', 'right' ], true ) ) {
	$fbks_filter_align = 'center';
}

if ( ! in_array( $fbks_button_align, [ 'left', 'center', 'right' ], true ) ) {
	$fbks_button_align = 'right';
}

if ( ! in_array( $fbks_proofing_theme, [ 'light', 'dark' ], true ) ) {
	$fbks_proofing_theme = 'light';
}

$fbks_clamp_numeric_attribute = static function ( $key, $default, $min, $max ) use ( $attributes ) {
	$value = isset( $attributes[ $key ] ) ? floatval( $attributes[ $key ] ) : $default;
	return max( $min, min( $max, $value ) );
};

$fbks_proofing_button_styles = [
	'--fbks-proofing-save-button-color:' . fbks_sanitize_css_color_value( (string) ( $attributes['saveButtonTextColor'] ?? '#3858e9' ) ),
	'--fbks-proofing-save-button-bg:' . fbks_sanitize_css_color_value( (string) ( $attributes['saveButtonBackgroundColor'] ?? '#ffffff' ) ),
	'--fbks-proofing-submit-button-color:' . fbks_sanitize_css_color_value( (string) ( $attributes['submitButtonTextColor'] ?? '#ffffff' ) ),
	'--fbks-proofing-submit-button-bg:' . fbks_sanitize_css_color_value( (string) ( $attributes['submitButtonBackgroundColor'] ?? '#3858e9' ) ),
	'--fbks-proofing-button-radius:' . esc_attr( $fbks_clamp_numeric_attribute( 'buttonBorderRadius', 2, 0, 40 ) ) . 'px',
	'--fbks-proofing-button-border-width:' . esc_attr( $fbks_clamp_numeric_attribute( 'buttonBorderWidth', 1, 0, 8 ) ) . 'px',
	'--fbks-proofing-button-padding-y:' . esc_attr( $fbks_clamp_numeric_attribute( 'buttonPaddingVertical', 6, 0, 24 ) ) . 'px',
	'--fbks-proofing-button-padding-x:' . esc_attr( $fbks_clamp_numeric_attribute( 'buttonPaddingHorizontal', 12, 4, 48 ) ) . 'px',
	'--fbks-proofing-button-font-size:' . esc_attr( $fbks_clamp_numeric_attribute( 'buttonFontSize', 13, 10, 24 ) ) . 'px',
	'--fbks-proofing-button-gap:' . esc_attr( $fbks_clamp_numeric_attribute( 'buttonGap', 12, 0, 40 ) ) . 'px',
];
$fbks_proofing_button_style_attr = implode( ';', array_filter( $fbks_proofing_button_styles ) ) . ';';

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

if ( ! $fbks_can_view ) {
		$fbks_password_style_path = defined( 'FBKS_PLUGIN_DIR' ) ? FBKS_PLUGIN_DIR . 'includes/pro/css/password-form.css' : '';
		wp_enqueue_style(
			'folioblocks-password-form',
			defined( 'FBKS_PLUGIN_URL' ) ? FBKS_PLUGIN_URL . 'includes/pro/css/password-form.css' : '',
			[],
			$fbks_password_style_path && file_exists( $fbks_password_style_path ) ? filemtime( $fbks_password_style_path ) : ( defined( 'FBKS_VERSION' ) ? FBKS_VERSION : false )
		);
}

?>
<div <?php echo get_block_wrapper_attributes(); ?>>
	<?php if ( $fbks_can_view ) : ?>
		<div
			class="fbks-proofing-gallery<?php echo 'dark' === $fbks_proofing_theme ? ' is-proofing-dark' : ''; ?>"
			style="<?php echo esc_attr( $fbks_proofing_button_style_attr ); ?>"
			data-wp-interactive="folioblocks/proofing-gallery"
			data-wp-context="<?php echo esc_attr( wp_json_encode( [
				'galleryId'    => $fbks_gallery_id,
				'galleryKey'   => $fbks_gallery_key,
				'clientEmail'  => $fbks_client_email,
				'pageId'       => $fbks_page_id ? (int) $fbks_page_id : 0,
				'restUrl'      => esc_url_raw( rest_url( 'folioblocks/v1/proofing-gallery/session' ) ),
				'presenceUrl'  => esc_url_raw( rest_url( 'folioblocks/v1/proofing-gallery/session/presence' ) ),
				'trackPresence' => $fbks_track_presence,
				'emailAdminOnSubmit' => $fbks_email_admin_on_submit,
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
			<div class="fbks-proofing-gallery__actions align-<?php echo esc_attr( $fbks_button_align ); ?>">
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
		<form class="post-password-form fbks-proofing-gallery-gate" method="post">
			<p><?php esc_html_e( 'This content is password-protected. To view it, please enter the password below.', 'folioblocks' ); ?></p>
			<p class="post-password-form__fields">
				<label>
					<?php esc_html_e( 'Password:', 'folioblocks' ); ?>
					<input
						type="password"
						name="fbks_proofing_gallery_password"
						autocomplete="current-password"
						required
					/>
				</label>
				<input type="hidden" name="fbks_proofing_gallery_key" value="<?php echo esc_attr( $fbks_gallery_key ); ?>" />
				<?php wp_nonce_field( $fbks_gallery_key, 'fbks_proofing_gallery_nonce' ); ?>
				<button type="submit">
					<?php esc_html_e( 'Enter', 'folioblocks' ); ?>
				</button>
			</p>
			<?php if ( $fbks_error ) : ?>
				<p class="post-password-form__error fbks-proofing-gallery-gate__error"><?php echo esc_html( $fbks_error ); ?></p>
			<?php endif; ?>
		</form>
	<?php endif; ?>
</div>
