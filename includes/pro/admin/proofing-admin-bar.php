<?php
/**
 * Proofing Gallery admin bar indicator.
 *
 * @package FolioBlocks
 */

if (! defined('ABSPATH')) {
	exit;
}

if (! function_exists('fbks_is_proofing_admin_bar_enabled')) {
	function fbks_is_proofing_admin_bar_enabled()
	{
		if (! function_exists('fbks_can_manage_proofing_sessions') || ! fbks_can_manage_proofing_sessions()) {
			return false;
		}

		$settings = function_exists('fbks_get_proofing_settings')
			? fbks_get_proofing_settings()
			: array('showAdminBar' => true);

		return ! empty($settings['showAdminBar']);
	}
}

if (! function_exists('fbks_get_proofing_admin_bar_time')) {
	function fbks_get_proofing_admin_bar_time($session)
	{
		$status = sanitize_key((string) ($session['status'] ?? ''));
		$timestamp = 'submitted' === $status
			? ($session['updatedAt'] ?? '')
			: (! empty($session['lastSeenAt']) ? $session['lastSeenAt'] : ($session['updatedAt'] ?? ''));

		if ('' === $timestamp) {
			return __('Unknown', 'folioblocks');
		}

		return mysql2date(get_option('date_format') . ' ' . get_option('time_format'), $timestamp);
	}
}

if (! function_exists('fbks_get_proofing_admin_bar_cleared_submitted')) {
	function fbks_get_proofing_admin_bar_cleared_submitted()
	{
		$cleared = get_user_meta(get_current_user_id(), 'fbks_proofing_admin_bar_cleared_submitted', true);

		return is_array($cleared) ? array_map('sanitize_text_field', $cleared) : array();
	}
}

if (! function_exists('fbks_get_proofing_admin_bar_submitted_token')) {
	function fbks_get_proofing_admin_bar_submitted_token($session)
	{
		return absint($session['id'] ?? 0) . ':' . sanitize_text_field((string) ($session['updatedAt'] ?? ''));
	}
}

if (! function_exists('fbks_get_proofing_admin_bar_sessions')) {
	function fbks_get_proofing_admin_bar_sessions($limit = 10)
	{
		if (! function_exists('fbks_get_proofing_sessions_for_admin')) {
			return array();
		}

		$sessions = fbks_get_proofing_sessions_for_admin();
		$qualified = array();
		$settings = function_exists('fbks_get_proofing_settings')
			? fbks_get_proofing_settings()
			: array('inProgressRetentionDays' => 14);
		$stale_after = time() - (absint($settings['inProgressRetentionDays'] ?? 14) * DAY_IN_SECONDS);
		$cleared_submitted = fbks_get_proofing_admin_bar_cleared_submitted();

		foreach ($sessions as $session) {
			$status = sanitize_key((string) ($session['status'] ?? ''));
			$page_id = absint($session['pageId'] ?? 0);

			if (! in_array($status, array('viewing', 'in_progress', 'submitted'), true) || ! $page_id) {
				continue;
			}

			if ('publish' !== get_post_status($page_id)) {
				continue;
			}

			if (empty($session['isCurrent'])) {
				continue;
			}

			if ('submitted' === $status && in_array(fbks_get_proofing_admin_bar_submitted_token($session), $cleared_submitted, true)) {
				continue;
			}

			$updated_at = ! empty($session['updatedAt']) ? strtotime($session['updatedAt']) : 0;
			$last_seen_at = ! empty($session['lastSeenAt']) ? strtotime($session['lastSeenAt']) : 0;
			$freshness_timestamp = max($updated_at, $last_seen_at);

			if ('submitted' !== $status && $freshness_timestamp && $freshness_timestamp < $stale_after) {
				continue;
			}

			$display_status = fbks_get_proofing_session_display_status($session);
			$display_classes = preg_split('/\s+/', (string) $display_status['class'], -1, PREG_SPLIT_NO_EMPTY);
			$is_active = in_array('is-active', $display_classes, true);
			$review_url = add_query_arg(
				array('session_id' => absint($session['id'])),
				admin_url('admin.php?page=folioblocks-proofing-sessions')
			);

			$qualified[] = array(
				'id'            => absint($session['id']),
				'status'        => $status,
				'presence'      => sanitize_key((string) ($session['presence'] ?? '')),
				'isActive'      => $is_active,
				'displayStatus' => $display_status['label'],
				'displayClass'  => $display_status['class'],
				'clientEmail'   => sanitize_email((string) ($session['clientEmail'] ?? '')),
				'pageId'        => $page_id,
				'pageTitle'     => fbks_get_proofing_session_page_title($page_id),
				'editPageUrl'   => get_edit_post_link($page_id, ''),
				'reviewUrl'     => $review_url,
				'lastSeenAt'    => sanitize_text_field((string) ($session['lastSeenAt'] ?? '')),
				'updatedAt'     => sanitize_text_field((string) ($session['updatedAt'] ?? '')),
				'displayTime'   => fbks_get_proofing_admin_bar_time($session),
			);
		}

		usort(
			$qualified,
			static function ($a, $b) {
				if ($a['isActive'] !== $b['isActive']) {
					return $a['isActive'] ? -1 : 1;
				}

				if ($a['status'] !== $b['status']) {
					if ('submitted' === $a['status']) {
						return -1;
					}

					if ('submitted' === $b['status']) {
						return 1;
					}
				}

				return strcmp((string) $b['updatedAt'], (string) $a['updatedAt']);
			}
		);

		$limit = absint($limit);

		return $limit ? array_slice($qualified, 0, $limit) : $qualified;
	}
}

if (! function_exists('fbks_get_proofing_admin_bar_state')) {
	function fbks_get_proofing_admin_bar_state()
	{
		$enabled = fbks_is_proofing_admin_bar_enabled();
		$all_sessions_url = admin_url('admin.php?page=folioblocks-proofing-sessions');

		if (! $enabled) {
			return array(
				'enabled'        => false,
				'hasActive'      => false,
				'hasSubmitted'   => false,
				'hasAttention'   => false,
				'activeCount'    => 0,
				'unfinishedCount'=> 0,
				'submittedCount' => 0,
				'attentionCount' => 0,
				'titleCount'     => 0,
				'sessions'       => array(),
				'allSessionsUrl' => $all_sessions_url,
			);
		}

		$all_sessions = fbks_get_proofing_admin_bar_sessions(0);
		$sessions = array_slice($all_sessions, 0, 10);
		$active_count = count(array_filter($all_sessions, static function ($session) {
			return ! empty($session['isActive']);
		}));
		$submitted_count = count(array_filter($all_sessions, static function ($session) {
			return 'submitted' === ($session['status'] ?? '');
		}));
		$unfinished_count = max(0, count($all_sessions) - $active_count);

		return array(
			'enabled'        => true,
			'hasActive'      => $active_count > 0,
			'hasSubmitted'   => $submitted_count > 0,
			'hasAttention'   => ! empty($sessions),
			'activeCount'    => $active_count,
			'unfinishedCount'=> $unfinished_count,
			'submittedCount' => $submitted_count,
			'attentionCount' => count($all_sessions),
			'titleCount'     => $active_count > 0 ? $active_count : $submitted_count,
			'sessions'       => $sessions,
			'allSessionsUrl' => $all_sessions_url,
		);
	}
}

if (! function_exists('fbks_get_proofing_admin_bar_class')) {
	function fbks_get_proofing_admin_bar_class($state)
	{
		$classes = array('fbks-proofing-admin-bar');

		if (empty($state['enabled'])) {
			$classes[] = 'is-disabled';
		} elseif (! empty($state['hasActive'])) {
			$classes[] = 'has-active';
		} elseif (! empty($state['hasSubmitted'])) {
			$classes[] = 'has-submitted';
		} elseif (! empty($state['hasAttention'])) {
			$classes[] = 'has-unfinished';
		} else {
			$classes[] = 'is-empty';
		}

		return implode(' ', $classes);
	}
}

if (! function_exists('fbks_render_proofing_admin_bar_title')) {
	function fbks_render_proofing_admin_bar_title($state)
	{
		$count = absint($state['titleCount'] ?? 0);
		ob_start();
		?>
		<span class="fbks-proofing-admin-bar-title">
			<span class="fbks-proofing-admin-bar-icon" aria-hidden="true"></span>
			<span class="fbks-proofing-admin-bar-label"><?php esc_html_e('Proofing', 'folioblocks'); ?></span>
			<span class="fbks-proofing-admin-bar-count<?php echo $count ? '' : ' is-hidden'; ?>"><?php echo esc_html((string) $count); ?></span>
		</span>
		<?php
		return ob_get_clean();
	}
}

if (! function_exists('fbks_render_proofing_admin_bar_dropdown')) {
	function fbks_render_proofing_admin_bar_dropdown($state)
	{
		ob_start();
		?>
		<div class="fbks-proofing-admin-bar-dropdown">
			<?php if (empty($state['sessions'])) : ?>
				<div class="fbks-proofing-admin-bar-empty"><?php esc_html_e('No active proofing sessions', 'folioblocks'); ?></div>
			<?php else : ?>
				<ul class="fbks-proofing-admin-bar-sessions">
					<?php foreach ($state['sessions'] as $session) : ?>
						<li class="fbks-proofing-admin-bar-session <?php echo esc_attr($session['displayClass']); ?>">
							<span class="fbks-proofing-admin-bar-session__status"><?php echo esc_html($session['displayStatus']); ?></span>
							<span class="fbks-proofing-admin-bar-session__page"><?php echo esc_html($session['pageTitle']); ?></span>
							<span class="fbks-proofing-admin-bar-session__client"><?php echo esc_html($session['clientEmail'] ?: __('Client', 'folioblocks')); ?></span>
							<?php if ('submitted' === $session['status']) : ?>
								<span class="fbks-proofing-admin-bar-session__time"><?php echo esc_html($session['displayTime']); ?></span>
							<?php endif; ?>
							<a class="fbks-proofing-admin-bar-session__review" href="<?php echo esc_url($session['reviewUrl']); ?>"><?php esc_html_e('Review', 'folioblocks'); ?></a>
						</li>
					<?php endforeach; ?>
				</ul>
			<?php endif; ?>
			<div class="fbks-proofing-admin-bar-footer<?php echo ! empty($state['hasSubmitted']) ? ' has-clear-submitted' : ''; ?>">
				<button type="button" class="fbks-proofing-admin-bar-all" data-href="<?php echo esc_url($state['allSessionsUrl']); ?>"><?php esc_html_e('View all Sessions', 'folioblocks'); ?></button>
				<?php if (! empty($state['hasSubmitted'])) : ?>
					<button type="button" class="fbks-proofing-admin-bar-clear-submitted"><?php esc_html_e('Clear Submitted Sessions', 'folioblocks'); ?></button>
				<?php endif; ?>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}
}

if (! function_exists('fbks_clear_proofing_admin_bar_submitted_sessions')) {
	function fbks_clear_proofing_admin_bar_submitted_sessions()
	{
		$tokens = fbks_get_proofing_admin_bar_cleared_submitted();
		$sessions = fbks_get_proofing_admin_bar_sessions(0);

		foreach ($sessions as $session) {
			if ('submitted' !== ($session['status'] ?? '')) {
				continue;
			}

			$tokens[] = fbks_get_proofing_admin_bar_submitted_token($session);
		}

		$tokens = array_values(array_unique(array_filter($tokens)));
		update_user_meta(get_current_user_id(), 'fbks_proofing_admin_bar_cleared_submitted', $tokens);

		return fbks_get_proofing_admin_bar_state_response();
	}
}

if (! function_exists('fbks_get_proofing_admin_bar_state_response')) {
	function fbks_get_proofing_admin_bar_state_response()
	{
		$state = fbks_get_proofing_admin_bar_state();
		$state['dropdownHtml'] = fbks_render_proofing_admin_bar_dropdown($state);

		return rest_ensure_response($state);
	}
}

if (! function_exists('fbks_register_proofing_admin_bar')) {
	function fbks_register_proofing_admin_bar($wp_admin_bar)
	{
		if (! fbks_is_proofing_admin_bar_enabled()) {
			return;
		}

		$state = fbks_get_proofing_admin_bar_state();

		$wp_admin_bar->add_node(
			array(
				'id'    => 'fbks-proofing-gallery',
				'title' => fbks_render_proofing_admin_bar_title($state),
				'href'  => $state['allSessionsUrl'],
				'meta'  => array(
					'class' => fbks_get_proofing_admin_bar_class($state),
				),
			)
		);

		$wp_admin_bar->add_node(
			array(
				'id'     => 'fbks-proofing-gallery-dropdown',
				'parent' => 'fbks-proofing-gallery',
				'title'  => fbks_render_proofing_admin_bar_dropdown($state),
				'href'   => false,
				'meta'   => array(
					'class' => 'fbks-proofing-admin-bar-dropdown-node',
				),
			)
		);
	}
}
add_action('admin_bar_menu', 'fbks_register_proofing_admin_bar', 90);

if (! function_exists('fbks_register_proofing_admin_bar_rest_routes')) {
	function fbks_register_proofing_admin_bar_rest_routes()
	{
		register_rest_route(
			'folioblocks/v1',
			'/proofing-gallery/admin-bar',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => 'fbks_get_proofing_admin_bar_state_response',
				'permission_callback' => function () {
					return function_exists('fbks_can_manage_proofing_sessions') && fbks_can_manage_proofing_sessions();
				},
			)
		);

		register_rest_route(
			'folioblocks/v1',
			'/proofing-gallery/admin-bar/clear-submitted',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => 'fbks_clear_proofing_admin_bar_submitted_sessions',
				'permission_callback' => function () {
					return function_exists('fbks_can_manage_proofing_sessions') && fbks_can_manage_proofing_sessions();
				},
			)
		);
	}
}
add_action('rest_api_init', 'fbks_register_proofing_admin_bar_rest_routes');

if (! function_exists('fbks_enqueue_proofing_admin_bar_assets')) {
	function fbks_enqueue_proofing_admin_bar_assets()
	{
		if (! is_admin_bar_showing() || ! fbks_is_proofing_admin_bar_enabled()) {
			return;
		}

		$style_path = FBKS_PLUGIN_DIR . 'includes/pro/css/proofing-admin-bar.css';
		wp_enqueue_style(
			'folioblocks-proofing-admin-bar',
			FBKS_PLUGIN_URL . 'includes/pro/css/proofing-admin-bar.css',
			array(),
			file_exists($style_path) ? filemtime($style_path) : FBKS_VERSION
		);

		$script_path = FBKS_PLUGIN_DIR . 'includes/pro/js/proofing-admin-bar.js';
		wp_enqueue_script(
			'folioblocks-proofing-admin-bar',
			FBKS_PLUGIN_URL . 'includes/pro/js/proofing-admin-bar.js',
			array('wp-api-fetch'),
			file_exists($script_path) ? filemtime($script_path) : FBKS_VERSION,
			true
		);

		wp_add_inline_script(
			'folioblocks-proofing-admin-bar',
			'window.fbksProofingAdminBar = ' . wp_json_encode(array(
				'endpoint'               => rest_url('folioblocks/v1/proofing-gallery/admin-bar'),
				'clearSubmittedEndpoint' => rest_url('folioblocks/v1/proofing-gallery/admin-bar/clear-submitted'),
				'nonce'                  => wp_create_nonce('wp_rest'),
				'interval'               => 30000,
			)) . ';',
			'before'
		);
	}
}
add_action('admin_enqueue_scripts', 'fbks_enqueue_proofing_admin_bar_assets');
add_action('wp_enqueue_scripts', 'fbks_enqueue_proofing_admin_bar_assets');
