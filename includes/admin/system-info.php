<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'fbks_render_system_info_page' ) ) {
	function fbks_render_system_info_page() {
		global $wpdb;

		$theme        = wp_get_theme();
		$theme_name   = $theme->get( 'Name' );
		$theme_ver    = $theme->get( 'Version' );
		$theme_parent = $theme->parent();

		$get_yes_no = static function ( $value ) {
			return $value ? 'Yes' : 'No';
		};

		$is_block_theme = function_exists( 'wp_is_block_theme' )
			? $get_yes_no( wp_is_block_theme() )
			: 'Unknown';

		$site_url = get_site_url();
		$home_url = get_home_url();

		$plugin_version = '';
		if ( function_exists( 'get_plugin_data' ) ) {
			$plugin_file = WP_PLUGIN_DIR . '/folioblocks/folioblocks.php';
			if ( file_exists( $plugin_file ) ) {
				$plugin_data = get_plugin_data( $plugin_file, false, false );
				if ( ! empty( $plugin_data['Version'] ) ) {
					$plugin_version = $plugin_data['Version'];
				}
			}
		}

		$license_type = 'Unknown';
		if ( function_exists( 'fbks_fs' ) ) {
			$license_type = fbks_fs()->can_use_premium_code()
				? 'Pro (active)'
				: 'Free';
		}

		$woocommerce_status = 'Not installed';
		$active_plugins     = (array) get_option( 'active_plugins', array() );
		if ( in_array( 'woocommerce/woocommerce.php', $active_plugins, true ) || class_exists( 'WooCommerce' ) ) {
			$woocommerce_status = 'Active';
		}

		$gd_loaded       = extension_loaded( 'gd' ) ? 'Loaded' : 'Not loaded';
		$imagick_loaded  = class_exists( 'Imagick' ) ? 'Loaded' : 'Not found';
		$openssl_loaded  = extension_loaded( 'openssl' ) ? 'Loaded' : 'Not loaded';
		$stream_wrappers = function_exists( 'stream_get_wrappers' ) ? stream_get_wrappers() : array();
		$http_wrapper    = in_array( 'http', $stream_wrappers, true ) ? 'Found' : 'Not found';
		$https_wrapper   = in_array( 'https', $stream_wrappers, true ) ? 'Found' : 'Not found';
		$allow_url_fopen = ini_get( 'allow_url_fopen' );
		$allow_url_inc   = ini_get( 'allow_url_include' );

		$available_image_editors = array();
		if ( function_exists( 'wp_get_image_editor' ) && function_exists( 'wp_get_image_editors' ) ) {
			$available_image_editors = wp_get_image_editors();
		}

		$default_image_editor = '';
		if ( function_exists( 'wp_get_image_editor' ) ) {
			$test_image_path = plugin_dir_path( __DIR__ ) . 'icons/pb-thumb-test.jpg';
			if ( file_exists( $test_image_path ) ) {
				$editor = wp_get_image_editor( $test_image_path );
				if ( ! is_wp_error( $editor ) ) {
					$default_image_editor = get_class( $editor );
				}
			}
		}

		$thumb_test_url    = plugin_dir_url( __DIR__ ) . 'icons/pb-thumb-test.jpg';
		$thumb_test_result = 'Not run (test image missing)';
		$test_image_path   = plugin_dir_path( __DIR__ ) . 'icons/pb-thumb-test.jpg';

		if ( function_exists( 'wp_get_image_editor' ) && file_exists( $test_image_path ) ) {
			$editor = wp_get_image_editor( $test_image_path );
			if ( is_wp_error( $editor ) ) {
				$thumb_test_result = sprintf( 'Failed: %s', $editor->get_error_message() );
			} else {
				$thumb_test_result = 'OK';
			}
		}

		$https_thumb_mismatch = 'None';
		if ( strpos( $site_url, 'https://' ) === 0 && strpos( $thumb_test_url, 'https://' ) !== 0 ) {
			$https_thumb_mismatch = 'Possible mismatch (site is HTTPS, thumb URL is not).';
		}

		$rest_api_status = 'Not tested';
		if ( function_exists( 'rest_url' ) && function_exists( 'wp_remote_get' ) ) {
			$response = wp_remote_get( rest_url( 'wp/v2/types' ), array( 'timeout' => 5 ) );
			if ( is_wp_error( $response ) ) {
				$rest_api_status = sprintf( 'Error: %s', $response->get_error_message() );
			} else {
				$rest_api_status = sprintf( 'HTTP %d', wp_remote_retrieve_response_code( $response ) );
			}
		}

		$wp_debug         = defined( 'WP_DEBUG' ) && WP_DEBUG ? 'Enabled' : 'Disabled';
		$wp_debug_log     = defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG ? 'Enabled' : 'Disabled';
		$wp_debug_display = defined( 'WP_DEBUG_DISPLAY' ) && WP_DEBUG_DISPLAY ? 'Enabled' : 'Disabled';
		$wp_cron          = defined( 'DISABLE_WP_CRON' ) && DISABLE_WP_CRON ? 'Disabled' : 'Enabled';
		$script_debug     = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? 'Enabled' : 'Disabled';

		$plugins_list = array();
		foreach ( $active_plugins as $plugin_file ) {
			$plugin_path = WP_PLUGIN_DIR . '/' . $plugin_file;
			if ( ! file_exists( $plugin_path ) ) {
				continue;
			}

			$data = function_exists( 'get_plugin_data' ) ? get_plugin_data( $plugin_path, false, false ) : array();
			$name = ! empty( $data['Name'] ) ? $data['Name'] : $plugin_file;
			$ver  = ! empty( $data['Version'] ) ? $data['Version'] : '';

			$plugins_list[] = trim( $name . ( $ver ? ' ' . $ver : '' ) );
		}

		$folioblocks_blocks = array();
		if ( class_exists( 'WP_Block_Type_Registry' ) ) {
			$registry = WP_Block_Type_Registry::get_instance();
			if ( $registry && method_exists( $registry, 'get_all_registered' ) ) {
				foreach ( $registry->get_all_registered() as $block_name => $block_type ) {
					if ( strpos( $block_name, 'folioblocks/' ) !== 0 ) {
						continue;
					}

					$label = '';
					if ( is_object( $block_type ) && property_exists( $block_type, 'title' ) ) {
						$label = $block_type->title;
					}

					$folioblocks_blocks[] = $label ? $label : $block_name;
				}
			}
		}

		if ( ! empty( $folioblocks_blocks ) ) {
			sort( $folioblocks_blocks, SORT_NATURAL | SORT_FLAG_CASE );
		}

		$server_software = '';
		if ( isset( $_SERVER['SERVER_SOFTWARE'] ) ) {
			$server_software = sanitize_text_field( wp_unslash( $_SERVER['SERVER_SOFTWARE'] ) );
		}

		// Keep the support export in English so support requests stay consistent across sites.
		// Only the admin UI rendered below should be localized.
		$lines   = array();
		$lines[] = '=== Environment ===';
		$lines[] = sprintf( 'Site URL: %s', $site_url );
		$lines[] = sprintf( 'Home URL: %s', $home_url );
		$lines[] = sprintf( 'Multisite: %s', $get_yes_no( is_multisite() ) );
		$lines[] = sprintf( 'WordPress Version: %s', get_bloginfo( 'version' ) );
		$lines[] = sprintf( 'PHP Version: %s', PHP_VERSION );
		$lines[] = sprintf( 'MySQL Version: %s', $wpdb->db_version() );
		$lines[] = sprintf( 'Server Software: %s', $server_software );
		$lines[] = '';

		$lines[] = '=== Theme ===';
		$lines[] = sprintf( 'Active Theme: %s', trim( $theme_name . ' ' . $theme_ver ) );
		if ( $theme_parent ) {
			$lines[] = sprintf(
				'Parent Theme: %s',
				trim( $theme_parent->get( 'Name' ) . ' ' . $theme_parent->get( 'Version' ) )
			);
		}
		$lines[] = sprintf( 'Block Theme: %s', $is_block_theme );
		$lines[] = '';

		$lines[] = '=== FolioBlocks ===';
		$lines[] = sprintf( 'FolioBlocks Version: %s', $plugin_version ? $plugin_version : 'Unknown' );
		$lines[] = sprintf( 'FolioBlocks License: %s', $license_type );
		$lines[] = sprintf( 'WooCommerce: %s', $woocommerce_status );
		$lines[] = '';
		$lines[] = 'Available Blocks:';
		if ( ! empty( $folioblocks_blocks ) ) {
			foreach ( $folioblocks_blocks as $block_label ) {
				$lines[] = '  - ' . $block_label;
			}
		} else {
			$lines[] = '  (No FolioBlocks blocks registered)';
		}
		$lines[] = '';

		$lines[] = '=== PHP & Server Extensions ===';
		$lines[] = sprintf( 'PHP GD: %s', $gd_loaded );
		$lines[] = sprintf( 'PHP Imagick: %s', $imagick_loaded );
		$lines[] = sprintf( 'PHP OpenSSL: %s', $openssl_loaded );
		$lines[] = sprintf( 'PHP HTTP Wrapper: %s', $http_wrapper );
		$lines[] = sprintf( 'PHP HTTPS Wrapper: %s', $https_wrapper );
		$lines[] = sprintf( 'PHP Config[allow_url_fopen]: %s', $allow_url_fopen );
		$lines[] = sprintf( 'PHP Config[allow_url_include]: %s', $allow_url_inc );
		$lines[] = sprintf( 'PHP Memory Limit: %s', ini_get( 'memory_limit' ) );
		$lines[] = sprintf( 'PHP Max Execution Time: %s', ini_get( 'max_execution_time' ) );
		$lines[] = sprintf( 'PHP Post Max Size: %s', ini_get( 'post_max_size' ) );
		$lines[] = sprintf( 'Max Upload Size: %s', size_format( wp_max_upload_size() ) );
		$lines[] = '';

		$lines[] = '=== Images & Thumbnails ===';
		$lines[] = sprintf(
			'Available Image Editors: %s',
			! empty( $available_image_editors ) ? implode( ', ', $available_image_editors ) : 'Unknown'
		);
		$lines[] = sprintf(
			'Default Image Editor: %s',
			$default_image_editor ? $default_image_editor : 'Unknown'
		);
		$lines[] = sprintf( 'Thumbnail Generation Test URL: %s', $thumb_test_url );
		$lines[] = sprintf( 'Thumbnail Generation Test Result: %s', $thumb_test_result );
		$lines[] = sprintf( 'HTTPS Thumb Mismatch: %s', $https_thumb_mismatch );
		$lines[] = '';

		$lines[] = '=== WordPress Configuration ===';
		$lines[] = sprintf( 'WP_DEBUG: %s', $wp_debug );
		$lines[] = sprintf( 'WP_DEBUG_LOG: %s', $wp_debug_log );
		$lines[] = sprintf( 'WP_DEBUG_DISPLAY: %s', $wp_debug_display );
		$lines[] = sprintf( 'DISABLE_WP_CRON: %s', $wp_cron );
		$lines[] = sprintf( 'SCRIPT_DEBUG: %s', $script_debug );
		$lines[] = sprintf( 'REST API Status: %s', $rest_api_status );
		$lines[] = '';

		$lines[] = '=== Active Plugins ===';
		if ( ! empty( $plugins_list ) ) {
			foreach ( $plugins_list as $plugin_line ) {
				$lines[] = '  - ' . $plugin_line;
			}
		} else {
			$lines[] = '  (No active plugins found)';
		}
		$lines[] = '';

		$export = implode( "\n", $lines );
		?>
		<div class="pb-wrap">
			<div class="pb-settings-header">
				<img src="<?php echo esc_url( plugin_dir_url( __DIR__ ) . '/icons/pb-brand-icon.svg' ); ?>" alt="<?php echo esc_attr__( 'FolioBlocks', 'folioblocks' ); ?>" class="pb-settings-logo" />
				<h1>
					<?php esc_html_e( 'FolioBlocks', 'folioblocks' ); ?>
					<?php if ( fbks_fs()->can_use_premium_code() ) : ?>
						<?php echo ' ' . esc_html__( 'Pro', 'folioblocks' ); ?>
					<?php endif; ?>
					<?php echo ' - ' . esc_html__( 'System Information', 'folioblocks' ); ?>
				</h1>
			</div>
			<div class="settings-container">
				<div class="settings-left">
					<div class="pb-dashboard-box">
						<h2><?php esc_html_e( 'Server Configuration', 'folioblocks' ); ?></h2>
						<p><?php esc_html_e( 'Below you can find information regarding your server configuration. This can be used to help debug any issues you have with FolioBlocks. Copy and paste the information when requesting support.', 'folioblocks' ); ?></p>
						<textarea
							readonly
							class="large-text code"
							rows="25"
							style="white-space: pre; overflow: auto;"
						><?php echo esc_textarea( $export ); ?></textarea>

						<p>
							<button
								type="button"
								class="button button-secondary"
								onclick="(function(){const ta=document.querySelector('.wrap textarea');if(ta){ta.focus();ta.select();document.execCommand('copy');}})();"
							>
								<?php esc_html_e( 'Copy to clipboard', 'folioblocks' ); ?>
							</button>
						</p>
					</div>
				</div>
				<div class="settings-right">
					<div class="pb-dashboard-box">
						<h2><?php esc_html_e( 'Quick Links:', 'folioblocks' ); ?></h2>
						<?php fbks_render_quick_links(); ?>
					</div>
				</div>
			</div>
		</div>
		<?php
	}
}
