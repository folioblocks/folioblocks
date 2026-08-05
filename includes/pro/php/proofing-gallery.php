<?php
/**
 * Proofing Gallery frontend session storage.
 *
 * @package FolioBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const FBKS_PROOFING_SESSION_POST_TYPE = 'fbks_proof_session';
const FBKS_PROOFING_ACTIVE_WINDOW_SECONDS = 120;
const FBKS_PROOFING_COMMENT_MAX_LENGTH = 1000;
const FBKS_PROOFING_SUBMITTED_RETENTION_DAYS = 90;
const FBKS_PROOFING_STALE_RETENTION_DAYS = 14;
const FBKS_PROOFING_SETTINGS_OPTION = 'fbks_proofing_settings';

function fbks_can_use_proofing_sessions() {
	return function_exists( 'fbks_fs' ) && fbks_fs()->can_use_premium_code__premium_only();
}

function fbks_get_proofing_settings_defaults() {
	return [
		'inProgressRetentionDays' => FBKS_PROOFING_STALE_RETENTION_DAYS,
		'submittedRetentionDays'  => FBKS_PROOFING_SUBMITTED_RETENTION_DAYS,
		'emailAdminOnSubmit'      => false,
	];
}

function fbks_sanitize_proofing_retention_days( $value, $fallback ) {
	if ( ! is_numeric( $value ) ) {
		return $fallback;
	}

	return min( 3650, max( 1, absint( $value ) ) );
}

function fbks_sanitize_proofing_checkbox( $value ) {
	return '1' === (string) $value || 1 === $value || true === $value || 'true' === $value;
}

function fbks_sanitize_proofing_settings( $settings ) {
	$defaults = fbks_get_proofing_settings_defaults();
	$settings = is_array( $settings ) ? wp_parse_args( $settings, $defaults ) : $defaults;

	return [
		'inProgressRetentionDays' => fbks_sanitize_proofing_retention_days( $settings['inProgressRetentionDays'], $defaults['inProgressRetentionDays'] ),
		'submittedRetentionDays'  => fbks_sanitize_proofing_retention_days( $settings['submittedRetentionDays'], $defaults['submittedRetentionDays'] ),
		'emailAdminOnSubmit'      => fbks_sanitize_proofing_checkbox( $settings['emailAdminOnSubmit'] ),
	];
}

function fbks_get_proofing_settings() {
	return fbks_sanitize_proofing_settings( get_option( FBKS_PROOFING_SETTINGS_OPTION, [] ) );
}

function fbks_sanitize_proofing_comment( $comment ) {
	$comment = sanitize_textarea_field( (string) $comment );

	if ( function_exists( 'mb_substr' ) ) {
		return mb_substr( $comment, 0, FBKS_PROOFING_COMMENT_MAX_LENGTH );
	}

	return substr( $comment, 0, FBKS_PROOFING_COMMENT_MAX_LENGTH );
}

function fbks_register_proofing_session_post_type() {
	register_post_type(
		FBKS_PROOFING_SESSION_POST_TYPE,
		[
			'labels'              => [
				'name'          => __( 'Proofing Sessions', 'folioblocks' ),
				'singular_name' => __( 'Proofing Session', 'folioblocks' ),
			],
			'public'              => false,
			'show_ui'             => false,
			'show_in_menu'        => false,
			'show_in_rest'        => false,
			'exclude_from_search' => true,
			'supports'            => [ 'title' ],
			'capability_type'     => 'post',
		]
	);
}
add_action( 'init', 'fbks_register_proofing_session_post_type' );

function fbks_normalize_proofing_images( $images ) {
	if ( ! is_array( $images ) ) {
		return [];
	}

	$normalized = [];

	foreach ( $images as $image ) {
		if ( ! is_array( $image ) || empty( $image['imageId'] ) ) {
			continue;
		}

		$flag = isset( $image['flag'] ) ? sanitize_key( $image['flag'] ) : '';
		if ( ! in_array( $flag, [ '', 'red', 'orange', 'green' ], true ) ) {
			$flag = '';
		}

		$normalized[] = [
			'imageId'      => sanitize_text_field( (string) $image['imageId'] ),
			'attachmentId' => isset( $image['attachmentId'] ) ? absint( $image['attachmentId'] ) : 0,
			'thumbnail'    => isset( $image['thumbnail'] ) ? esc_url_raw( (string) $image['thumbnail'] ) : '',
			'title'        => isset( $image['title'] ) ? sanitize_text_field( (string) $image['title'] ) : '',
			'hearted'      => ! empty( $image['hearted'] ),
			'flag'         => $flag,
			'comment'      => isset( $image['comment'] ) ? fbks_sanitize_proofing_comment( $image['comment'] ) : '',
		];
	}

	return $normalized;
}

function fbks_get_proofing_session_post_id( $gallery_key ) {
	global $wpdb;

	$post_id = $wpdb->get_var(
		$wpdb->prepare(
			"SELECT p.ID
			FROM {$wpdb->posts} p
			INNER JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
			WHERE p.post_type = %s
				AND p.post_status NOT IN ( 'trash', 'auto-draft' )
				AND pm.meta_key = '_fbks_proofing_gallery_key'
				AND pm.meta_value = %s
			ORDER BY p.ID DESC
			LIMIT 1",
			FBKS_PROOFING_SESSION_POST_TYPE,
			$gallery_key
		)
	);

	return $post_id ? absint( $post_id ) : 0;
}

function fbks_get_proofing_session_state( $gallery_key ) {
	$post_id = fbks_get_proofing_session_post_id( $gallery_key );

	if ( ! $post_id ) {
		return [
			'status'    => '',
			'updatedAt' => '',
			'images'    => [],
		];
	}

	$images = get_post_meta( $post_id, '_fbks_proofing_images', true );

	return [
		'id'        => $post_id,
		'status'    => sanitize_key( (string) get_post_meta( $post_id, '_fbks_proofing_status', true ) ),
		'updatedAt' => sanitize_text_field( (string) get_post_meta( $post_id, '_fbks_proofing_updated_at', true ) ),
		'images'    => is_array( $images ) ? fbks_normalize_proofing_images( $images ) : [],
	];
}

function fbks_delete_proofing_session( $post_id ) {
	$post_id = absint( $post_id );

	if ( ! $post_id || FBKS_PROOFING_SESSION_POST_TYPE !== get_post_type( $post_id ) ) {
		return false;
	}

	return (bool) wp_delete_post( $post_id, true );
}

function fbks_cleanup_stale_proofing_sessions( $limit = 50 ) {
	$settings = fbks_get_proofing_settings();
	$submitted_cutoff = gmdate(
		'Y-m-d H:i:s',
		current_time( 'timestamp' ) - ( $settings['submittedRetentionDays'] * DAY_IN_SECONDS )
	);
	$stale_cutoff     = gmdate(
		'Y-m-d H:i:s',
		current_time( 'timestamp' ) - ( $settings['inProgressRetentionDays'] * DAY_IN_SECONDS )
	);

	$query = new WP_Query(
		[
			'post_type'              => FBKS_PROOFING_SESSION_POST_TYPE,
			'post_status'            => [ 'private', 'draft', 'publish' ],
			'posts_per_page'         => max( 1, absint( $limit ) ),
			'fields'                 => 'ids',
			'no_found_rows'          => true,
			'update_post_meta_cache' => false,
			'update_post_term_cache' => false,
			'meta_query'             => [
				'relation' => 'OR',
				[
					'relation' => 'AND',
					[
						'key'   => '_fbks_proofing_status',
						'value' => 'submitted',
					],
					[
						'key'     => '_fbks_proofing_updated_at',
						'value'   => $submitted_cutoff,
						'compare' => '<=',
						'type'    => 'DATETIME',
					],
				],
				[
					'relation' => 'AND',
					[
						'key'     => '_fbks_proofing_status',
						'value'   => [ 'viewing', 'in_progress' ],
						'compare' => 'IN',
					],
					[
						'key'     => '_fbks_proofing_updated_at',
						'value'   => $stale_cutoff,
						'compare' => '<=',
						'type'    => 'DATETIME',
					],
				],
			],
		]
	);

	$deleted = 0;

	foreach ( $query->posts as $post_id ) {
		if ( fbks_delete_proofing_session( $post_id ) ) {
			$deleted++;
		}
	}

	return $deleted;
}

function fbks_schedule_proofing_session_cleanup() {
	if ( wp_next_scheduled( 'fbks_cleanup_proofing_sessions' ) ) {
		return;
	}

	wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', 'fbks_cleanup_proofing_sessions' );
}
add_action( 'init', 'fbks_schedule_proofing_session_cleanup' );
add_action( 'fbks_cleanup_proofing_sessions', 'fbks_cleanup_stale_proofing_sessions' );

function fbks_upsert_proofing_session_post( $gallery_key, $gallery_id, $client_email, $page_id ) {
	$post_id = fbks_get_proofing_session_post_id( $gallery_key );
	$title   = sprintf(
		/* translators: %s: client email address or gallery key. */
		__( 'Proofing Session: %s', 'folioblocks' ),
		$client_email ?: $gallery_key
	);

	if ( $post_id ) {
		wp_update_post(
			[
				'ID'         => $post_id,
				'post_title' => $title,
			]
		);
	} else {
		$post_id = wp_insert_post(
			[
				'post_type'   => FBKS_PROOFING_SESSION_POST_TYPE,
				'post_status' => 'publish',
				'post_title'  => $title,
			],
			true
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}
	}

	update_post_meta( $post_id, '_fbks_proofing_gallery_key', $gallery_key );
	update_post_meta( $post_id, '_fbks_proofing_gallery_id', $gallery_id );
	update_post_meta( $post_id, '_fbks_proofing_client_email', $client_email );
	update_post_meta( $post_id, '_fbks_proofing_page_id', $page_id );

	return $post_id;
}

function fbks_email_admin_proofing_session_submitted( $post_id, $client_email, $page_id, $email_admin_on_submit = null ) {
	if ( null === $email_admin_on_submit ) {
		$settings = fbks_get_proofing_settings();
		$email_admin_on_submit = ! empty( $settings['emailAdminOnSubmit'] );
	}

	if ( ! $email_admin_on_submit ) {
		return;
	}

	$admin_email = get_option( 'admin_email' );
	if ( ! is_email( $admin_email ) ) {
		return;
	}

	$page_title = $page_id ? get_the_title( $page_id ) : '';
	$review_url = add_query_arg(
		[
			'page'       => 'folioblocks-proofing-sessions',
			'session_id' => absint( $post_id ),
		],
		admin_url( 'admin.php' )
	);
	$subject = sprintf(
		/* translators: %s: client email address or client label. */
		__( 'Proofing session submitted by %s', 'folioblocks' ),
		$client_email ?: __( 'a client', 'folioblocks' )
	);
	$message_lines = [
		__( 'A proofing gallery session has been submitted.', 'folioblocks' ),
		'',
		sprintf(
			/* translators: %s: client email address. */
			__( 'Client: %s', 'folioblocks' ),
			$client_email ?: __( 'Unknown', 'folioblocks' )
		),
	];

	if ( '' !== $page_title ) {
		$message_lines[] = sprintf(
			/* translators: %s: page title. */
			__( 'Page: %s', 'folioblocks' ),
			$page_title
		);
	}

	$message_lines[] = '';
	$message_lines[] = sprintf(
		/* translators: %s: admin review URL. */
		__( 'Review the session: %s', 'folioblocks' ),
		$review_url
	);

	wp_mail( $admin_email, $subject, implode( "\n", $message_lines ) );
}

function fbks_save_proofing_session( WP_REST_Request $request ) {
	if ( ! fbks_can_use_proofing_sessions() ) {
		return new WP_Error( 'fbks_proofing_unavailable', __( 'Proofing sessions are not available.', 'folioblocks' ), [ 'status' => 403 ] );
	}

	$params       = $request->get_json_params();
	$gallery_key  = isset( $params['galleryKey'] ) ? sanitize_text_field( (string) $params['galleryKey'] ) : '';
	$gallery_id   = isset( $params['galleryId'] ) ? sanitize_text_field( (string) $params['galleryId'] ) : '';
	$client_email = isset( $params['clientEmail'] ) ? sanitize_email( (string) $params['clientEmail'] ) : '';
	$page_id      = isset( $params['pageId'] ) ? absint( $params['pageId'] ) : 0;
	$status       = isset( $params['status'] ) ? sanitize_key( (string) $params['status'] ) : 'in_progress';
	$email_admin_on_submit = array_key_exists( 'emailAdminOnSubmit', $params )
		? fbks_sanitize_proofing_checkbox( $params['emailAdminOnSubmit'] )
		: null;
	$images       = fbks_normalize_proofing_images( $params['images'] ?? [] );

	if ( '' === $gallery_key ) {
		return new WP_Error( 'fbks_missing_gallery_key', __( 'Missing proofing gallery key.', 'folioblocks' ), [ 'status' => 400 ] );
	}

	if ( ! in_array( $status, [ 'in_progress', 'submitted' ], true ) ) {
		$status = 'in_progress';
	}

	$post_id = fbks_upsert_proofing_session_post( $gallery_key, $gallery_id, $client_email, $page_id );

	if ( is_wp_error( $post_id ) ) {
		return $post_id;
	}

	$previous_status = sanitize_key( (string) get_post_meta( $post_id, '_fbks_proofing_status', true ) );
	$updated_at = current_time( 'mysql' );

	update_post_meta( $post_id, '_fbks_proofing_status', $status );
	update_post_meta( $post_id, '_fbks_proofing_updated_at', $updated_at );
	update_post_meta( $post_id, '_fbks_proofing_presence', 'active' );
	update_post_meta( $post_id, '_fbks_proofing_last_seen_at', $updated_at );
	update_post_meta( $post_id, '_fbks_proofing_images', $images );

	if ( 'submitted' === $status && 'submitted' !== $previous_status ) {
		fbks_email_admin_proofing_session_submitted( $post_id, $client_email, $page_id, $email_admin_on_submit );
	}

	return rest_ensure_response(
		[
			'id'        => $post_id,
			'status'    => $status,
			'updatedAt' => $updated_at,
			'images'    => $images,
		]
	);
}

function fbks_update_proofing_session_presence( WP_REST_Request $request ) {
	if ( ! fbks_can_use_proofing_sessions() ) {
		return new WP_Error( 'fbks_proofing_unavailable', __( 'Proofing sessions are not available.', 'folioblocks' ), [ 'status' => 403 ] );
	}

	$params       = $request->get_json_params();
	$gallery_key  = isset( $params['galleryKey'] ) ? sanitize_text_field( (string) $params['galleryKey'] ) : '';
	$gallery_id   = isset( $params['galleryId'] ) ? sanitize_text_field( (string) $params['galleryId'] ) : '';
	$client_email = isset( $params['clientEmail'] ) ? sanitize_email( (string) $params['clientEmail'] ) : '';
	$page_id      = isset( $params['pageId'] ) ? absint( $params['pageId'] ) : 0;
	$presence     = isset( $params['presence'] ) ? sanitize_key( (string) $params['presence'] ) : 'active';

	if ( '' === $gallery_key ) {
		return new WP_Error( 'fbks_missing_gallery_key', __( 'Missing proofing gallery key.', 'folioblocks' ), [ 'status' => 400 ] );
	}

	if ( ! in_array( $presence, [ 'active', 'closed' ], true ) ) {
		$presence = 'active';
	}

	$post_id = fbks_get_proofing_session_post_id( $gallery_key );

	if ( ! $post_id && 'closed' === $presence ) {
		return rest_ensure_response(
			[
				'id'       => 0,
				'presence' => $presence,
			]
		);
	}

	if ( ! $post_id ) {
		$post_id = fbks_upsert_proofing_session_post( $gallery_key, $gallery_id, $client_email, $page_id );

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}
	}

	$updated_at = current_time( 'mysql' );
	$status     = sanitize_key( (string) get_post_meta( $post_id, '_fbks_proofing_status', true ) );

	if ( 'submitted' === $status ) {
		return rest_ensure_response(
			[
				'id'         => absint( $post_id ),
				'presence'   => $presence,
				'lastSeenAt' => sanitize_text_field( (string) get_post_meta( $post_id, '_fbks_proofing_last_seen_at', true ) ),
			]
		);
	}

	if ( ! in_array( $status, [ 'in_progress', 'submitted' ], true ) ) {
		update_post_meta( $post_id, '_fbks_proofing_status', 'viewing' );
	}

	update_post_meta( $post_id, '_fbks_proofing_presence', $presence );
	update_post_meta( $post_id, '_fbks_proofing_last_seen_at', $updated_at );
	update_post_meta( $post_id, '_fbks_proofing_updated_at', $updated_at );

	return rest_ensure_response(
		[
			'id'         => absint( $post_id ),
			'presence'   => $presence,
			'lastSeenAt' => $updated_at,
		]
	);
}

function fbks_get_page_proofing_sessions( WP_REST_Request $request ) {
	$page_id = absint( $request->get_param( 'pageId' ) );

	if ( ! $page_id ) {
		return new WP_Error( 'fbks_missing_page_id', __( 'Missing page ID.', 'folioblocks' ), [ 'status' => 400 ] );
	}

	if ( ! current_user_can( 'edit_post', $page_id ) ) {
		return new WP_Error( 'fbks_forbidden', __( 'You cannot view proofing sessions for this page.', 'folioblocks' ), [ 'status' => 403 ] );
	}

	$query = new WP_Query(
		[
			'post_type'              => FBKS_PROOFING_SESSION_POST_TYPE,
			'post_status'            => [ 'private', 'draft', 'publish' ],
			'posts_per_page'         => 20,
			'fields'                 => 'ids',
			'no_found_rows'          => true,
			'update_post_meta_cache' => true,
			'update_post_term_cache' => false,
			'meta_query'             => [
				[
					'key'   => '_fbks_proofing_page_id',
					'value' => $page_id,
				],
			],
		]
	);

	$sessions = array_map(
			static function ( $post_id ) {
				return [
					'id'          => absint( $post_id ),
					'status'      => sanitize_key( (string) get_post_meta( $post_id, '_fbks_proofing_status', true ) ),
					'presence'    => sanitize_key( (string) get_post_meta( $post_id, '_fbks_proofing_presence', true ) ),
					'clientEmail' => sanitize_email( (string) get_post_meta( $post_id, '_fbks_proofing_client_email', true ) ),
					'updatedAt'   => sanitize_text_field( (string) get_post_meta( $post_id, '_fbks_proofing_updated_at', true ) ),
					'lastSeenAt'  => sanitize_text_field( (string) get_post_meta( $post_id, '_fbks_proofing_last_seen_at', true ) ),
				];
			},
		$query->posts
	);

	$in_progress = array_values(
		array_filter(
			$sessions,
			static function ( $session ) {
				return in_array( $session['status'], [ 'viewing', 'in_progress' ], true );
			}
		)
	);

	return rest_ensure_response(
		[
			'inProgress' => ! empty( $in_progress ),
			'sessions'   => $sessions,
		]
	);
}

function fbks_register_proofing_session_rest_routes() {
	register_rest_route(
		'folioblocks/v1',
		'/proofing-gallery/session',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'fbks_save_proofing_session',
			'permission_callback' => '__return_true',
		]
	);

	register_rest_route(
		'folioblocks/v1',
		'/proofing-gallery/page-sessions',
		[
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'fbks_get_page_proofing_sessions',
			'permission_callback' => function ( WP_REST_Request $request ) {
				$page_id = absint( $request->get_param( 'pageId' ) );
				return $page_id && current_user_can( 'edit_post', $page_id );
			},
			'args'                => [
				'pageId' => [
					'required'          => true,
					'sanitize_callback' => 'absint',
				],
			],
		]
	);

	register_rest_route(
		'folioblocks/v1',
		'/proofing-gallery/session/presence',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'fbks_update_proofing_session_presence',
			'permission_callback' => '__return_true',
		]
	);
}
add_action( 'rest_api_init', 'fbks_register_proofing_session_rest_routes' );

function fbks_get_proofing_sessions_by_page_ids( $page_ids ) {
	global $wpdb;

	$page_ids = array_values( array_filter( array_map( 'absint', (array) $page_ids ) ) );

	if ( empty( $page_ids ) ) {
		return [];
	}

	$placeholders = implode( ',', array_fill( 0, count( $page_ids ), '%d' ) );
	$query        = $wpdb->prepare(
		"SELECT page_meta.meta_value AS page_id,
			p.ID AS session_id,
			email_meta.meta_value AS client_email,
			updated_meta.meta_value AS updated_at,
			presence_meta.meta_value AS presence,
			last_seen_meta.meta_value AS last_seen_at,
			status_meta.meta_value AS status
		FROM {$wpdb->posts} p
		INNER JOIN {$wpdb->postmeta} status_meta
			ON p.ID = status_meta.post_id
			AND status_meta.meta_key = '_fbks_proofing_status'
		INNER JOIN {$wpdb->postmeta} page_meta
			ON p.ID = page_meta.post_id
			AND page_meta.meta_key = '_fbks_proofing_page_id'
		LEFT JOIN {$wpdb->postmeta} email_meta
			ON p.ID = email_meta.post_id
			AND email_meta.meta_key = '_fbks_proofing_client_email'
		LEFT JOIN {$wpdb->postmeta} updated_meta
			ON p.ID = updated_meta.post_id
			AND updated_meta.meta_key = '_fbks_proofing_updated_at'
		LEFT JOIN {$wpdb->postmeta} presence_meta
			ON p.ID = presence_meta.post_id
			AND presence_meta.meta_key = '_fbks_proofing_presence'
		LEFT JOIN {$wpdb->postmeta} last_seen_meta
			ON p.ID = last_seen_meta.post_id
			AND last_seen_meta.meta_key = '_fbks_proofing_last_seen_at'
		WHERE p.post_type = %s
			AND p.post_status NOT IN ( 'trash', 'auto-draft' )
			AND status_meta.meta_value IN ( 'viewing', 'in_progress', 'submitted' )
			AND page_meta.meta_value IN ( {$placeholders} )
		ORDER BY p.ID DESC",
		array_merge( [ FBKS_PROOFING_SESSION_POST_TYPE ], $page_ids )
	);

	$rows     = $wpdb->get_results( $query, ARRAY_A );
	$sessions = [];

	foreach ( $rows as $row ) {
		$page_id = absint( $row['page_id'] );

		if ( ! isset( $sessions[ $page_id ] ) ) {
			$sessions[ $page_id ] = [];
		}

		$sessions[ $page_id ][] = [
			'id'          => absint( $row['session_id'] ),
			'status'      => sanitize_key( (string) $row['status'] ),
			'presence'    => sanitize_key( (string) $row['presence'] ),
			'clientEmail' => sanitize_email( (string) $row['client_email'] ),
			'updatedAt'   => sanitize_text_field( (string) $row['updated_at'] ),
			'lastSeenAt'  => sanitize_text_field( (string) $row['last_seen_at'] ),
		];
	}

	return $sessions;
}

function fbks_get_in_progress_proofing_sessions_by_page_ids( $page_ids ) {
	return fbks_get_proofing_sessions_by_page_ids( $page_ids );
}

function fbks_prime_proofing_sessions_for_admin_list( $posts ) {
	if ( ! is_admin() || ! fbks_can_use_proofing_sessions() ) {
		return $posts;
	}

	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;

	if ( ! $screen || 'edit' !== $screen->base || ! in_array( $screen->post_type, [ 'post', 'page' ], true ) ) {
		return $posts;
	}

	$GLOBALS['fbks_admin_list_proofing_sessions'] = fbks_get_proofing_sessions_by_page_ids(
		wp_list_pluck( $posts, 'ID' )
	);

	return $posts;
}
add_filter( 'the_posts', 'fbks_prime_proofing_sessions_for_admin_list' );

function fbks_add_proofing_session_admin_column( $columns ) {
	if ( ! fbks_can_use_proofing_sessions() ) {
		return $columns;
	}

	$updated_columns = [];

	foreach ( $columns as $key => $label ) {
		$updated_columns[ $key ] = $label;

		if ( 'title' === $key ) {
			$updated_columns['fbks_proofing_session'] = __( 'Proofing', 'folioblocks' );
		}
	}

	return $updated_columns;
}
add_filter( 'manage_post_posts_columns', 'fbks_add_proofing_session_admin_column' );
add_filter( 'manage_page_posts_columns', 'fbks_add_proofing_session_admin_column' );

function fbks_render_proofing_session_admin_column( $column_name, $post_id ) {
	if ( 'fbks_proofing_session' !== $column_name || ! fbks_can_use_proofing_sessions() ) {
		return;
	}

	$sessions = $GLOBALS['fbks_admin_list_proofing_sessions'][ $post_id ] ?? null;

	if ( null === $sessions ) {
		$sessions = fbks_get_proofing_sessions_by_page_ids( [ $post_id ] )[ $post_id ] ?? [];
	}

	if ( empty( $sessions ) ) {
		echo '&mdash;';
		return;
	}

	$session      = $sessions[0];
	$client_email = $session['clientEmail'] ?: __( 'Client', 'folioblocks' );
	$updated_at   = $session['updatedAt'] ? mysql2date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), $session['updatedAt'] ) : '';
	$last_seen_ts = ! empty( $session['lastSeenAt'] ) ? strtotime( $session['lastSeenAt'] ) : 0;
	$is_active    = 'submitted' !== $session['status'] && 'active' === $session['presence'] && $last_seen_ts && ( time() - $last_seen_ts ) <= FBKS_PROOFING_ACTIVE_WINDOW_SECONDS;
	$badge_class  = 'fbks-proofing-admin-badge';
	$badge_label  = __( 'In session', 'folioblocks' );
	$badge_title  = __( 'A proofing session is active or unfinished. Avoid updating this page until the client submits their selections.', 'folioblocks' );

	if ( $is_active ) {
		$badge_class .= ' is-active';
		$badge_label  = __( 'Viewing Now', 'folioblocks' );
	} elseif ( 'submitted' === $session['status'] ) {
		$badge_class .= ' is-submitted';
		$badge_label  = __( 'Submitted', 'folioblocks' );
		$badge_title  = __( 'The client has submitted this proofing session.', 'folioblocks' );
	} elseif ( 'closed' === $session['presence'] ) {
		$is_saved     = 'in_progress' === $session['status'];
		$badge_class .= $is_saved ? ' is-closed is-saved-closed' : ' is-closed is-window-closed';
		$badge_label  = $is_saved ? __( 'In Progress', 'folioblocks' ) : __( 'Window Closed', 'folioblocks' );
	} elseif ( 'viewing' === $session['status'] ) {
		$badge_class .= ' is-viewing';
		$badge_label  = __( 'Viewing', 'folioblocks' );
	} elseif ( 'in_progress' === $session['status'] ) {
		$badge_class .= ' is-in_progress';
		$badge_label  = __( 'In Progress', 'folioblocks' );
	}

	echo '<span class="' . esc_attr( $badge_class ) . '" title="' . esc_attr( $badge_title ) . '">';
	echo esc_html( $badge_label );
	echo '</span>';
	echo '<span class="fbks-proofing-admin-meta">';
	echo esc_html( $client_email );

	if ( $updated_at ) {
		echo '<br />' . esc_html( $updated_at );
	}

	echo '</span>';
}
add_action( 'manage_post_posts_custom_column', 'fbks_render_proofing_session_admin_column', 10, 2 );
add_action( 'manage_page_posts_custom_column', 'fbks_render_proofing_session_admin_column', 10, 2 );

function fbks_render_proofing_session_admin_column_styles() {
	if ( ! fbks_can_use_proofing_sessions() ) {
		return;
	}

	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;

	if ( ! $screen || 'edit' !== $screen->base || ! in_array( $screen->post_type, [ 'post', 'page' ], true ) ) {
		return;
	}

	?>
	<style>
		.column-fbks_proofing_session {
			width: 150px;
		}

		.fbks-proofing-admin-badge {
			display: inline-block;
			margin-bottom: 4px;
			padding: 2px 7px;
			border-radius: 999px;
			background: #f0b849;
			color: #1d2327;
			font-size: 12px;
			font-weight: 600;
			line-height: 1.6;
		}

		.fbks-proofing-admin-badge.is-active {
			background: #f0b849;
			color: #1d2327;
		}

		.fbks-proofing-admin-badge.is-viewing,
		.fbks-proofing-admin-badge.is-in_progress {
			background: #f0b849;
			color: #1d2327;
		}

		.fbks-proofing-admin-badge.is-submitted {
			background: #00a32a;
			color: #fff;
		}

		.fbks-proofing-admin-badge.is-closed {
			background: #dcdcde;
			color: #1d2327;
		}

		.fbks-proofing-admin-badge.is-saved-closed {
			background: #f6e2a0;
			color: #1d2327;
		}

		.fbks-proofing-admin-badge.is-window-closed {
			background: #dcdcde;
			color: #1d2327;
		}

		.fbks-proofing-admin-meta {
			display: block;
			color: #646970;
			font-size: 12px;
			line-height: 1.4;
		}
	</style>
	<?php
}
add_action( 'admin_head-edit.php', 'fbks_render_proofing_session_admin_column_styles' );
