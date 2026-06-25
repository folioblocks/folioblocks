<?php
/**
 * FolioBlocks review request notice.
 *
 * Freemius provides the notice presentation and persistent dismissal. FolioBlocks
 * owns the eligibility rules and the actions offered to each administrator.
 *
 * @package FolioBlocks
 */

if (! defined('ABSPATH')) {
	exit;
}

define('FBKS_REVIEW_NOTICE_PREFIX', 'fbks_review_request_');
define('FBKS_REVIEW_FIRST_USE_OPTION', 'fbks_review_first_use');
define('FBKS_REVIEW_USAGE_SCANNED_OPTION', 'fbks_review_usage_scanned');
define('FBKS_REVIEW_STATUS_META', '_fbks_review_status');
define('FBKS_REVIEW_SHOWN_META', '_fbks_review_notice_shown');
define('FBKS_REVIEW_SNOOZED_META', '_fbks_review_snoozed_until');
define('FBKS_REVIEW_MINIMUM_AGE', 14 * DAY_IN_SECONDS);
define('FBKS_REVIEW_SNOOZE_DURATION', 30 * DAY_IN_SECONDS);
define('FBKS_REVIEW_URL', 'https://wordpress.org/support/plugin/folioblocks/reviews/#new-post');

/**
 * Return the Freemius notice ID for a WordPress user.
 *
 * Freemius sticky notices are stored at site level, so the user ID keeps each
 * administrator's notice and dismissal independent.
 *
 * @param int $user_id WordPress user ID.
 * @return string
 */
function fbks_get_review_notice_id($user_id)
{
	return FBKS_REVIEW_NOTICE_PREFIX . absint($user_id);
}

/**
 * Record when FolioBlocks is first used in saved content.
 *
 * @param int     $post_id Post ID.
 * @param WP_Post $post    Post object.
 * @return void
 */
function fbks_record_review_first_use($post_id, $post)
{
	if (
		get_option(FBKS_REVIEW_FIRST_USE_OPTION) ||
		wp_is_post_revision($post_id) ||
		wp_is_post_autosave($post_id) ||
		! $post instanceof WP_Post ||
		false === strpos($post->post_content, '<!-- wp:folioblocks/')
	) {
		return;
	}

	add_option(FBKS_REVIEW_FIRST_USE_OPTION, time(), '', false);
}
add_action('save_post', 'fbks_record_review_first_use', 10, 2);

/**
 * Backfill the first-use date for sites that already contain FolioBlocks content.
 *
 * This query runs once for pre-existing installations. New usage is captured by
 * the save_post hook, keeping all subsequent checks inexpensive.
 *
 * @return int Unix timestamp, or zero when FolioBlocks has not been used yet.
 */
function fbks_get_review_first_use()
{
	$first_use = absint(get_option(FBKS_REVIEW_FIRST_USE_OPTION, 0));
	if ($first_use) {
		return $first_use;
	}
	if (get_option(FBKS_REVIEW_USAGE_SCANNED_OPTION, false)) {
		return 0;
	}

	global $wpdb;

	$block_pattern = '%' . $wpdb->esc_like('<!-- wp:folioblocks/') . '%';
	$post_date = $wpdb->get_var(
		$wpdb->prepare(
			"SELECT MIN(post_date_gmt) FROM {$wpdb->posts} WHERE post_status NOT IN (%s, %s) AND post_content LIKE %s",
			'trash',
			'auto-draft',
			$block_pattern
		)
	);
	add_option(FBKS_REVIEW_USAGE_SCANNED_OPTION, 1, '', false);

	if (! $post_date || '0000-00-00 00:00:00' === $post_date) {
		return 0;
	}

	$first_use = strtotime($post_date . ' UTC');
	if (! $first_use) {
		$first_use = time();
	}

	add_option(FBKS_REVIEW_FIRST_USE_OPTION, $first_use, '', false);

	return $first_use;
}

/**
 * Determine whether review requests belong on the current admin screen.
 *
 * @param WP_Screen|null $screen Current admin screen.
 * @return bool
 */
function fbks_is_review_notice_screen($screen = null)
{
	if (! $screen && function_exists('get_current_screen')) {
		$screen = get_current_screen();
	}

	if (! $screen instanceof WP_Screen) {
		return false;
	}

	return 'plugins' === $screen->id || false !== strpos($screen->id, 'folioblocks');
}

/**
 * Limit the FolioBlocks review request to relevant admin screens.
 *
 * Freemius restores sticky notices before WordPress establishes the current
 * screen, so its visibility filter is the reliable place to enforce this rule.
 *
 * @param bool  $show Whether Freemius would show the notice.
 * @param array $message Freemius notice data.
 * @return bool
 */
function fbks_filter_review_notice_visibility($show, $message)
{
	if (
		empty($message['id']) ||
		0 !== strpos((string) $message['id'], FBKS_REVIEW_NOTICE_PREFIX)
	) {
		return $show;
	}

	return $show && fbks_is_review_notice_screen();
}
fbks_fs()->add_filter('show_admin_notice', 'fbks_filter_review_notice_visibility', 10, 2);

/**
 * Build a signed action URL for the review notice.
 *
 * @param string $choice Review, later, or already.
 * @return string
 */
function fbks_get_review_action_url($choice)
{
	$url = add_query_arg(
		array(
			'action' => 'fbks_review_notice',
			'choice' => sanitize_key($choice),
		),
		admin_url('admin-post.php')
	);

	return wp_nonce_url($url, 'fbks_review_notice_action');
}

/**
 * Build the review request message.
 *
 * @return string
 */
function fbks_get_review_notice_message()
{
	return sprintf(
		/* translators: 1: opening paragraph tag, 2: closing paragraph tag, 3-5: action links. */
		__('%1$sIf FolioBlocks has helped you create better galleries, would you mind leaving a review? Your feedback helps other photographers and potential users find the plugin and supports its continued development.%2$s%1$s%3$s &nbsp;&middot;&nbsp; %4$s &nbsp;&middot;&nbsp; %5$s%2$s', 'folioblocks'),
		'<p>',
		'</p>',
		'<a href="' . esc_url(fbks_get_review_action_url('review')) . '" target="_blank" rel="noopener noreferrer"><strong>' . esc_html__('Rate FolioBlocks', 'folioblocks') . '</strong></a>',
		'<a href="' . esc_url(fbks_get_review_action_url('later')) . '">' . esc_html__('Maybe later', 'folioblocks') . '</a>',
		'<a href="' . esc_url(fbks_get_review_action_url('already')) . '">' . esc_html__('I already did', 'folioblocks') . '</a>'
	);
}

/**
 * Add the review request through Freemius when the current user is eligible.
 *
 * @param WP_Screen $screen Current admin screen.
 * @return void
 */
function fbks_maybe_add_review_notice($screen)
{
	if (
		! fbks_is_review_notice_screen($screen) ||
		! current_user_can('manage_options') ||
		! class_exists('FS_Admin_Notices')
	) {
		return;
	}

	$user_id = get_current_user_id();
	if (
		'complete' === get_user_meta($user_id, FBKS_REVIEW_STATUS_META, true) ||
		get_user_meta($user_id, FBKS_REVIEW_SHOWN_META, true) ||
		absint(get_user_meta($user_id, FBKS_REVIEW_SNOOZED_META, true)) > time()
	) {
		return;
	}

	$first_use = fbks_get_review_first_use();
	if (! $first_use || ($first_use + FBKS_REVIEW_MINIMUM_AGE) > time()) {
		return;
	}

	$notices = FS_Admin_Notices::instance('folioblocks');
	$notices->add_sticky(
		fbks_get_review_notice_message(),
		fbks_get_review_notice_id($user_id),
		__('Enjoying FolioBlocks?', 'folioblocks'),
		'promotion',
		null,
		$user_id
	);

	update_user_meta($user_id, FBKS_REVIEW_SHOWN_META, time());
}
add_action('current_screen', 'fbks_maybe_add_review_notice');

/**
 * Process a review-notice action and remove the current sticky notice.
 *
 * @return void
 */
function fbks_handle_review_notice_action()
{
	if (! current_user_can('manage_options')) {
		wp_die(
			esc_html__('Sorry, you are not allowed to perform this action.', 'folioblocks'),
			esc_html__('Permission denied', 'folioblocks'),
			array('response' => 403)
		);
	}

	check_admin_referer('fbks_review_notice_action');

	$choice = isset($_GET['choice']) ? sanitize_key(wp_unslash($_GET['choice'])) : '';
	if (! in_array($choice, array('review', 'later', 'already'), true)) {
		wp_die(
			esc_html__('Invalid review action.', 'folioblocks'),
			esc_html__('Invalid request', 'folioblocks'),
			array('response' => 400)
		);
	}

	$user_id = get_current_user_id();
	fbks_fs()->remove_sticky(fbks_get_review_notice_id($user_id));

	if ('later' === $choice) {
		update_user_meta($user_id, FBKS_REVIEW_SNOOZED_META, time() + FBKS_REVIEW_SNOOZE_DURATION);
		delete_user_meta($user_id, FBKS_REVIEW_SHOWN_META);
	} else {
		update_user_meta($user_id, FBKS_REVIEW_STATUS_META, 'complete');
		delete_user_meta($user_id, FBKS_REVIEW_SNOOZED_META);
	}

	if ('review' === $choice) {
		wp_redirect(FBKS_REVIEW_URL); // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect -- Fixed WordPress.org URL.
		exit;
	}

	$redirect_url = wp_get_referer();
	wp_safe_redirect($redirect_url ? $redirect_url : admin_url('plugins.php'));
	exit;
}
add_action('admin_post_fbks_review_notice', 'fbks_handle_review_notice_action');
