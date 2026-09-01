<?php
if (! defined('ABSPATH')) {
	exit;
}

if (! function_exists('fbks_can_manage_proofing_sessions')) {
	function fbks_can_manage_proofing_sessions()
	{
		return current_user_can('manage_options') &&
				function_exists('fbks_fs') &&
				fbks_fs()->can_use_premium_code__premium_only() &&
				(fbks_fs()->is_plan('business') || fbks_fs()->is_plan('agency'));
	}
}

if (! function_exists('fbks_get_proofing_session_status_label')) {
	function fbks_get_proofing_session_status_label($status)
	{
		$labels = array(
			'viewing'     => __('Viewing', 'folioblocks'),
			'in_progress' => __('In Progress', 'folioblocks'),
			'submitted'   => __('Submitted', 'folioblocks'),
		);

		return isset($labels[$status]) ? $labels[$status] : __('Unknown', 'folioblocks');
	}
}

if (! function_exists('fbks_get_proofing_session_display_status')) {
	function fbks_get_proofing_session_display_status($session)
	{
		$status = isset($session['status']) ? sanitize_key($session['status']) : '';
		$presence = isset($session['presence']) ? sanitize_key($session['presence']) : '';
		$last_seen_ts = ! empty($session['lastSeenAt']) ? strtotime($session['lastSeenAt']) : 0;
		$active_window = defined('FBKS_PROOFING_ACTIVE_WINDOW_SECONDS') ? FBKS_PROOFING_ACTIVE_WINDOW_SECONDS : 120;
		$is_active = 'submitted' !== $status && 'active' === $presence && $last_seen_ts && (time() - $last_seen_ts) <= $active_window;

		if ($is_active) {
			return array(
				'class' => 'is-active',
				'label' => __('Viewing Now', 'folioblocks'),
			);
		}

		if ('closed' === $presence && 'submitted' !== $status) {
			$is_saved = 'in_progress' === $status;

			return array(
				'class' => $is_saved ? 'is-closed is-saved-closed' : 'is-closed is-window-closed',
				'label' => $is_saved ? __('In Progress', 'folioblocks') : __('Window Closed', 'folioblocks'),
			);
		}

		return array(
			'class' => 'is-' . $status,
			'label' => fbks_get_proofing_session_status_label($status),
		);
	}
}

if (! function_exists('fbks_get_proofing_session_delete_form')) {
	function fbks_get_proofing_session_delete_form($session_id, $redirect_url = '')
	{
		$session_id = absint($session_id);

		if (! $session_id) {
			return '';
		}

		ob_start();
		?>
		<form class="fbks-proofing-delete-form" method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" onsubmit="return window.confirm('<?php echo esc_js(__('Delete this proofing session permanently? This only deletes the saved proofing results, not the Media Library images.', 'folioblocks')); ?>');">
			<input type="hidden" name="action" value="fbks_delete_proofing_session" />
			<input type="hidden" name="session_id" value="<?php echo esc_attr((string) $session_id); ?>" />
			<?php if ('' !== $redirect_url) : ?>
				<input type="hidden" name="redirect_to" value="<?php echo esc_url($redirect_url); ?>" />
			<?php endif; ?>
			<?php wp_nonce_field('fbks_delete_proofing_session_' . $session_id); ?>
			<button type="submit" class="button button-link-delete"><?php esc_html_e('Delete', 'folioblocks'); ?></button>
		</form>
		<?php
		return ob_get_clean();
	}
}

if (! function_exists('fbks_render_proofing_session_detail_actions')) {
	function fbks_render_proofing_session_detail_actions($session_id, $back_url)
	{
		?>
		<div class="fbks-proofing-detail-actions">
			<div class="fbks-proofing-detail-actions__left">
				<a class="button" href="<?php echo esc_url($back_url); ?>"><?php esc_html_e('Back to Sessions', 'folioblocks'); ?></a>
			</div>
			<div class="fbks-proofing-detail-actions__right">
				<button type="button" class="button button-primary" onclick="window.print();"><?php esc_html_e('Save as PDF', 'folioblocks'); ?></button>
				<?php echo fbks_get_proofing_session_delete_form($session_id, $back_url); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
		</div>
		<?php
	}
}

if (! function_exists('fbks_handle_delete_proofing_session')) {
	function fbks_handle_delete_proofing_session()
	{
		if (! fbks_can_manage_proofing_sessions()) {
			wp_die(
				esc_html__('Sorry, you are not allowed to delete proofing sessions.', 'folioblocks'),
				esc_html__('Permission denied', 'folioblocks'),
				array('response' => 403)
			);
		}

		$session_id = isset($_POST['session_id']) ? absint($_POST['session_id']) : 0;

		if (! $session_id || ! check_admin_referer('fbks_delete_proofing_session_' . $session_id)) {
			wp_die(
				esc_html__('Security check failed. Please refresh the page and try again.', 'folioblocks'),
				esc_html__('Security check failed', 'folioblocks'),
				array('response' => 403)
			);
		}

		$deleted = function_exists('fbks_delete_proofing_session')
			? fbks_delete_proofing_session($session_id)
			: false;
		$redirect_to = isset($_POST['redirect_to']) ? esc_url_raw(wp_unslash($_POST['redirect_to'])) : admin_url('admin.php?page=folioblocks-proofing-sessions');

		wp_safe_redirect(add_query_arg('proofing_deleted', $deleted ? '1' : '0', $redirect_to));
		exit;
	}
}
add_action('admin_post_fbks_delete_proofing_session', 'fbks_handle_delete_proofing_session');

if (! function_exists('fbks_render_proofing_session_status_badge')) {
	function fbks_render_proofing_session_status_badge($session)
	{
		$display_status = fbks_get_proofing_session_display_status($session);
		?>
		<span class="fbks-proofing-status-badge <?php echo esc_attr($display_status['class']); ?>">
			<?php echo esc_html($display_status['label']); ?>
		</span>
		<?php
	}
}

if (! function_exists('fbks_get_proofing_session_counts')) {
	function fbks_get_proofing_session_counts($images)
	{
		$counts = array(
			'total'    => 0,
			'hearted'  => 0,
			'flagged'  => 0,
			'comments' => 0,
		);

		if (! is_array($images)) {
			return $counts;
		}

		foreach ($images as $image) {
			if (! is_array($image)) {
				continue;
			}

			$counts['total']++;

			if (! empty($image['hearted'])) {
				$counts['hearted']++;
			}

			if (! empty($image['flag'])) {
				$counts['flagged']++;
			}

			if (! empty($image['comment'])) {
				$counts['comments']++;
			}
		}

		return $counts;
	}
}

if (! function_exists('fbks_backfill_proofing_image_titles')) {
	function fbks_backfill_proofing_image_titles($images)
	{
		if (! is_array($images)) {
			return array();
		}

		foreach ($images as $index => $image) {
			if (! is_array($image) || ! empty($image['title']) || empty($image['attachmentId'])) {
				continue;
			}

			$title = get_the_title(absint($image['attachmentId']));
			if ('' !== $title) {
				$images[$index]['title'] = $title;
			}
		}

		return $images;
	}
}

if (! function_exists('fbks_get_proofing_attachment_filename')) {
	function fbks_get_proofing_attachment_filename($attachment_id)
	{
		$attachment_id = absint($attachment_id);

		if (! $attachment_id) {
			return '';
		}

		$metadata = wp_get_attachment_metadata($attachment_id);

		if (is_array($metadata) && ! empty($metadata['original_image'])) {
			return wp_basename((string) $metadata['original_image']);
		}

		$get_existing_unscaled_filename = static function ($file_path) {
			$file_path = (string) $file_path;

			if ('' === $file_path || ! preg_match('/-scaled(\.[^.]+)$/i', $file_path)) {
				return '';
			}

			$unscaled_path = preg_replace('/-scaled(\.[^.]+)$/i', '$1', $file_path);

			return $unscaled_path && file_exists($unscaled_path) ? wp_basename($unscaled_path) : '';
		};

		$file_path = '';

		if (function_exists('wp_get_original_image_path')) {
			$file_path = wp_get_original_image_path($attachment_id);
		}

		if (! $file_path) {
			$file_path = get_attached_file($attachment_id);
		}

		if ($file_path) {
			$unscaled_filename = $get_existing_unscaled_filename($file_path);

			if ($unscaled_filename) {
				return $unscaled_filename;
			}

			return wp_basename($file_path);
		}

		$file_url = wp_get_attachment_url($attachment_id);
		$file_path = $file_url ? wp_parse_url($file_url, PHP_URL_PATH) : '';

		if (! $file_path) {
			return '';
		}

		$upload_dir = wp_get_upload_dir();

		if (
			! empty($upload_dir['baseurl']) &&
			! empty($upload_dir['basedir']) &&
			$file_url &&
			0 === strpos($file_url, $upload_dir['baseurl'])
		) {
			$local_path = $upload_dir['basedir'] . substr($file_url, strlen($upload_dir['baseurl']));
			$unscaled_filename = $get_existing_unscaled_filename($local_path);

			if ($unscaled_filename) {
				return $unscaled_filename;
			}
		}

		return wp_basename($file_path);
	}
}

if (! function_exists('fbks_get_proofing_session_admin_data')) {
	function fbks_get_proofing_session_admin_data($post_id)
	{
		$post_id = absint($post_id);

		if (! $post_id || get_post_type($post_id) !== FBKS_PROOFING_SESSION_POST_TYPE) {
			return null;
		}

		$images = get_post_meta($post_id, '_fbks_proofing_images', true);
		$images = is_array($images) && function_exists('fbks_normalize_proofing_images')
			? fbks_normalize_proofing_images($images)
			: array();
		$images = fbks_backfill_proofing_image_titles($images);

		return array(
			'id'          => $post_id,
			'galleryKey'  => sanitize_text_field((string) get_post_meta($post_id, '_fbks_proofing_gallery_key', true)),
			'status'      => sanitize_key((string) get_post_meta($post_id, '_fbks_proofing_status', true)),
			'presence'    => sanitize_key((string) get_post_meta($post_id, '_fbks_proofing_presence', true)),
			'clientEmail' => sanitize_email((string) get_post_meta($post_id, '_fbks_proofing_client_email', true)),
			'pageId'      => absint(get_post_meta($post_id, '_fbks_proofing_page_id', true)),
			'galleryId'   => sanitize_text_field((string) get_post_meta($post_id, '_fbks_proofing_gallery_id', true)),
			'updatedAt'   => sanitize_text_field((string) get_post_meta($post_id, '_fbks_proofing_updated_at', true)),
			'lastSeenAt'  => sanitize_text_field((string) get_post_meta($post_id, '_fbks_proofing_last_seen_at', true)),
			'images'      => $images,
			'counts'      => fbks_get_proofing_session_counts($images),
			'isCurrent'   => function_exists('fbks_is_proofing_session_current_for_page') ? fbks_is_proofing_session_current_for_page($post_id) : true,
		);
	}
}

if (! function_exists('fbks_get_proofing_session_page_title')) {
	function fbks_get_proofing_session_page_title($page_id)
	{
		$page_id = absint($page_id);

		if (! $page_id) {
			return __('Unknown page', 'folioblocks');
		}

		$title = get_post_field('post_title', $page_id);

		return '' !== $title ? $title : __('Untitled page', 'folioblocks');
	}
}

if (! function_exists('fbks_render_proofing_session_page_reference')) {
	function fbks_render_proofing_session_page_reference($session)
	{
		$page_id = isset($session['pageId']) ? absint($session['pageId']) : 0;
		$page_title = fbks_get_proofing_session_page_title($page_id);
		$is_current = ! empty($session['isCurrent']);

		if ($page_id && $is_current) {
			echo '<a href="' . esc_url(get_edit_post_link($page_id)) . '">' . esc_html($page_title) . '</a>';
			return;
		}

		echo esc_html($page_title);

		if ($page_id && ! $is_current) {
			echo '<br /><span class="fbks-proofing-session-meta">';
			echo esc_html__('Detached from current page content', 'folioblocks');
			echo '</span>';
		}
	}
}

if (! function_exists('fbks_get_proofing_sessions_for_admin')) {
	function fbks_get_proofing_sessions_for_admin($status = '')
	{
		$status = sanitize_key($status);

		$query = new WP_Query(array(
			'post_type'              => FBKS_PROOFING_SESSION_POST_TYPE,
			'post_status'            => array('private', 'draft', 'publish'),
			'posts_per_page'         => 100,
			'fields'                 => 'ids',
			'no_found_rows'          => true,
			'orderby'                => 'modified',
			'order'                  => 'DESC',
			'update_post_meta_cache' => true,
			'update_post_term_cache' => false,
		));

		$sessions = array_values(array_filter(array_map('fbks_get_proofing_session_admin_data', $query->posts)));

		if (! in_array($status, array('viewing', 'in_progress', 'submitted'), true)) {
			return $sessions;
		}

		return array_values(array_filter(
			$sessions,
			static function ($session) use ($status) {
				$display_status = fbks_get_proofing_session_display_status($session);
				$status_classes = preg_split('/\s+/', (string) $display_status['class'], -1, PREG_SPLIT_NO_EMPTY);

				if ('viewing' === $status) {
					return (bool) array_intersect($status_classes, array('is-active', 'is-viewing'));
				}

				if ('in_progress' === $status) {
					return (bool) array_intersect($status_classes, array('is-in_progress', 'is-closed'));
				}

				return in_array('is-submitted', $status_classes, true);
			}
		));
	}
}

if (! function_exists('fbks_render_proofing_sessions_summary')) {
	function fbks_render_proofing_sessions_summary($counts)
	{
		?>
		<ul class="fbks-proofing-summary">
			<li><strong><?php echo esc_html(absint($counts['total'])); ?></strong><span><?php esc_html_e('Images', 'folioblocks'); ?></span></li>
			<li><strong><?php echo esc_html(absint($counts['hearted'])); ?></strong><span><?php esc_html_e('Hearted', 'folioblocks'); ?></span></li>
			<li><strong><?php echo esc_html(absint($counts['flagged'])); ?></strong><span><?php esc_html_e('Flagged', 'folioblocks'); ?></span></li>
			<li><strong><?php echo esc_html(absint($counts['comments'])); ?></strong><span><?php esc_html_e('Comments', 'folioblocks'); ?></span></li>
		</ul>
		<?php
	}
}

if (! function_exists('fbks_render_proofing_sessions_page_header')) {
	function fbks_render_proofing_sessions_page_header($subtitle = '')
	{
		?>
		<div class="pb-settings-header">
			<img src="<?php echo esc_url(FBKS_PLUGIN_URL . 'includes/icons/pb-brand-icon.svg'); ?>" alt="<?php echo esc_attr__('FolioBlocks', 'folioblocks'); ?>" class="pb-settings-logo" />
			<h1><?php esc_html_e('FolioBlocks Pro - Proofing Sessions', 'folioblocks'); ?></h1>
		</div>
		<?php if ('' !== $subtitle) : ?>
			<p class="fbks-proofing-page-subtitle"><?php echo esc_html($subtitle); ?></p>
		<?php endif; ?>
		<?php
	}
}

if (! function_exists('fbks_render_proofing_sessions_list')) {
	function fbks_render_proofing_sessions_list()
	{
		if (function_exists('fbks_cleanup_stale_proofing_sessions')) {
			fbks_cleanup_stale_proofing_sessions(20);
		}

		$status = isset($_GET['status']) ? sanitize_key(wp_unslash($_GET['status'])) : '';
		$sessions = fbks_get_proofing_sessions_for_admin($status);
		$base_url = admin_url('admin.php?page=folioblocks-proofing-sessions');
		$tabs = array(
			''            => __('All', 'folioblocks'),
			'submitted'   => __('Submitted', 'folioblocks'),
			'in_progress' => __('In Progress', 'folioblocks'),
			'viewing'     => __('Viewing', 'folioblocks'),
		);
		?>
		<div class="fbks-proofing-tabs" role="navigation" aria-label="<?php esc_attr_e('Proofing session filters', 'folioblocks'); ?>">
			<?php foreach ($tabs as $tab_status => $label) : ?>
				<a class="<?php echo esc_attr($status === $tab_status ? 'is-active' : ''); ?>" href="<?php echo esc_url('' === $tab_status ? $base_url : add_query_arg('status', $tab_status, $base_url)); ?>">
					<?php echo esc_html($label); ?>
				</a>
			<?php endforeach; ?>
		</div>

		<div class="pb-dashboard-box">
			<h2><?php esc_html_e('Proofing Sessions', 'folioblocks'); ?></h2>
			<?php if (empty($sessions)) : ?>
				<p><?php esc_html_e('No proofing sessions found yet.', 'folioblocks'); ?></p>
			<?php else : ?>
				<table class="widefat striped fbks-proofing-session-table">
					<thead>
						<tr>
							<th><?php esc_html_e('Status', 'folioblocks'); ?></th>
							<th><?php esc_html_e('Client', 'folioblocks'); ?></th>
							<th><?php esc_html_e('Page', 'folioblocks'); ?></th>
							<th><?php esc_html_e('Selections', 'folioblocks'); ?></th>
							<th><?php esc_html_e('Updated', 'folioblocks'); ?></th>
							<th><?php esc_html_e('Actions', 'folioblocks'); ?></th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ($sessions as $session) : ?>
							<?php
							$view_url = add_query_arg(
								array(
									'session_id' => absint($session['id']),
								),
								$base_url
							);
							?>
							<tr>
								<td data-label="<?php esc_attr_e('Status', 'folioblocks'); ?>">
									<?php fbks_render_proofing_session_status_badge($session); ?>
								</td>
								<td data-label="<?php esc_attr_e('Client', 'folioblocks'); ?>"><?php echo esc_html($session['clientEmail'] ?: __('Client', 'folioblocks')); ?></td>
								<td data-label="<?php esc_attr_e('Page', 'folioblocks'); ?>">
									<?php fbks_render_proofing_session_page_reference($session); ?>
								</td>
								<td data-label="<?php esc_attr_e('Selections', 'folioblocks'); ?>"><?php fbks_render_proofing_sessions_summary($session['counts']); ?></td>
								<td data-label="<?php esc_attr_e('Updated', 'folioblocks'); ?>"><?php echo esc_html($session['updatedAt'] ? mysql2date(get_option('date_format') . ' ' . get_option('time_format'), $session['updatedAt']) : __('Unknown', 'folioblocks')); ?></td>
								<td class="fbks-proofing-session-actions" data-label="<?php esc_attr_e('Actions', 'folioblocks'); ?>">
									<span class="fbks-proofing-session-action-buttons">
										<a class="button button-primary" href="<?php echo esc_url($view_url); ?>"><?php esc_html_e('Review', 'folioblocks'); ?></a>
										<?php echo fbks_get_proofing_session_delete_form($session['id'], $base_url); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
									</span>
								</td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
			<?php endif; ?>
		</div>
		<?php
	}
}

if (! function_exists('fbks_render_proofing_session_detail')) {
	function fbks_render_proofing_session_detail($session)
	{
		$back_url = admin_url('admin.php?page=folioblocks-proofing-sessions');
		?>
		<?php fbks_render_proofing_session_detail_actions($session['id'], $back_url); ?>

		<div class="pb-dashboard-box">
			<div class="fbks-proofing-detail-header">
				<div>
					<h2><?php echo esc_html($session['clientEmail'] ?: __('Proofing Session', 'folioblocks')); ?></h2>
					<p>
						<?php fbks_render_proofing_session_status_badge($session); ?>
						<?php fbks_render_proofing_session_page_reference($session); ?>
					</p>
					<p class="fbks-proofing-session-meta">
						<?php
						printf(
							/* translators: %s: date and time. */
							esc_html__('Last updated: %s', 'folioblocks'),
							esc_html($session['updatedAt'] ? mysql2date(get_option('date_format') . ' ' . get_option('time_format'), $session['updatedAt']) : __('Unknown', 'folioblocks'))
						);
						?>
					</p>
				</div>
				<?php fbks_render_proofing_sessions_summary($session['counts']); ?>
			</div>
		</div>

		<div class="pb-dashboard-box">
			<h2><?php esc_html_e('Submitted Selections', 'folioblocks'); ?></h2>
			<?php if (empty($session['images'])) : ?>
				<p><?php esc_html_e('No image selections were saved for this session.', 'folioblocks'); ?></p>
			<?php else : ?>
				<table class="widefat striped fbks-proofing-review-table">
					<thead>
						<tr>
							<th><?php esc_html_e('Image', 'folioblocks'); ?></th>
							<th><?php esc_html_e('Image ID', 'folioblocks'); ?></th>
							<th><?php esc_html_e('Heart', 'folioblocks'); ?></th>
							<th><?php esc_html_e('Flag', 'folioblocks'); ?></th>
							<th><?php esc_html_e('Comment', 'folioblocks'); ?></th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ($session['images'] as $image) : ?>
							<?php
							$attachment_id = ! empty($image['attachmentId']) ? absint($image['attachmentId']) : 0;
							$image_url = ! empty($image['thumbnail']) ? esc_url($image['thumbnail']) : '';
							$filename = fbks_get_proofing_attachment_filename($attachment_id);
							$media_url = $attachment_id ? get_edit_post_link($attachment_id) : '';
							?>
							<tr>
								<td class="fbks-proofing-image-cell" data-label="<?php esc_attr_e('Image', 'folioblocks'); ?>">
									<span class="fbks-proofing-image-preview">
										<?php if ($image_url) : ?>
											<img src="<?php echo esc_url($image_url); ?>" alt="" loading="lazy" />
										<?php endif; ?>
									</span>
									<div>
										<strong><?php echo esc_html($image['title'] ?: __('Untitled image', 'folioblocks')); ?></strong>
										<?php if ($filename) : ?>
											<span class="fbks-proofing-image-filename"><?php echo esc_html($filename); ?></span>
										<?php endif; ?>
										<?php if ($media_url) : ?>
											<a href="<?php echo esc_url($media_url); ?>"><?php esc_html_e('Open Media', 'folioblocks'); ?></a>
										<?php endif; ?>
									</div>
								</td>
								<td data-label="<?php esc_attr_e('Image ID', 'folioblocks'); ?>">
									<code><?php echo esc_html($image['imageId']); ?></code>
									<?php if ($attachment_id) : ?>
										<br /><span class="fbks-proofing-session-meta"><?php echo esc_html(sprintf(__('Attachment #%d', 'folioblocks'), $attachment_id)); ?></span>
									<?php endif; ?>
								</td>
								<td data-label="<?php esc_attr_e('Heart', 'folioblocks'); ?>"><?php echo ! empty($image['hearted']) ? esc_html__('Yes', 'folioblocks') : '&mdash;'; ?></td>
								<td data-label="<?php esc_attr_e('Flag', 'folioblocks'); ?>">
									<?php if (! empty($image['flag'])) : ?>
										<span class="fbks-proofing-flag-chip is-<?php echo esc_attr($image['flag']); ?>"><?php echo esc_html(ucfirst($image['flag'])); ?></span>
									<?php else : ?>
										&mdash;
									<?php endif; ?>
								</td>
								<td data-label="<?php esc_attr_e('Comment', 'folioblocks'); ?>"><?php echo ! empty($image['comment']) ? nl2br(esc_html($image['comment'])) : '&mdash;'; ?></td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
			<?php endif; ?>
		</div>
		<?php fbks_render_proofing_session_detail_actions($session['id'], $back_url); ?>
		<?php
	}
}

if (! function_exists('fbks_render_proofing_sessions_page')) {
	function fbks_render_proofing_sessions_page()
	{
		if (! fbks_can_manage_proofing_sessions()) {
			wp_die(
				esc_html__('Sorry, you are not allowed to access proofing sessions.', 'folioblocks'),
				esc_html__('Permission denied', 'folioblocks'),
				array('response' => 403)
			);
		}

		if (! defined('FBKS_PROOFING_SESSION_POST_TYPE')) {
			?>
			<div class="pb-wrap">
				<?php fbks_render_proofing_sessions_page_header(__('Proofing session storage is not available.', 'folioblocks')); ?>
			</div>
			<?php
			return;
		}

		$session_id = isset($_GET['session_id']) ? absint($_GET['session_id']) : 0;
		$session = $session_id ? fbks_get_proofing_session_admin_data($session_id) : null;
		?>
		<div class="pb-wrap pb-proofing-sessions-wrap">
			<?php fbks_render_proofing_sessions_page_header(__('Review saved and submitted client proofing selections.', 'folioblocks')); ?>
			<?php
			if (isset($_GET['proofing_deleted'])) {
				$deleted = '1' === sanitize_text_field(wp_unslash($_GET['proofing_deleted']));
				echo '<div class="notice ' . esc_attr($deleted ? 'notice-success' : 'notice-error') . ' inline"><p>';
				echo esc_html($deleted ? __('Proofing session deleted.', 'folioblocks') : __('Proofing session could not be deleted.', 'folioblocks'));
				echo '</p></div>';
			}

			if ($session_id && ! $session) {
				echo '<div class="notice notice-error inline"><p>' . esc_html__('Proofing session not found.', 'folioblocks') . '</p></div>';
				fbks_render_proofing_sessions_list();
			} elseif ($session) {
				fbks_render_proofing_session_detail($session);
			} else {
				fbks_render_proofing_sessions_list();
			}
			?>
		</div>
		<?php
	}
}
