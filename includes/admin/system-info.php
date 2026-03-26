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
			return $value ? __( 'Yes', 'folioblocks' ) : __( 'No', 'folioblocks' );
		};

		$is_block_theme = function_exists( 'wp_is_block_theme' )
			? $get_yes_no( wp_is_block_theme() )
			: __( 'Unknown', 'folioblocks' );

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

		$license_type = __( 'Unknown', 'folioblocks' );
		if ( function_exists( 'fbks_fs' ) ) {
			$license_type = fbks_fs()->can_use_premium_code()
				? __( 'Pro (active)', 'folioblocks' )
				: __( 'Free', 'folioblocks' );
		}

		$woocommerce_status = __( 'Not installed', 'folioblocks' );
		$active_plugins     = (array) get_option( 'active_plugins', array() );
		if ( in_array( 'woocommerce/woocommerce.php', $active_plugins, true ) || class_exists( 'WooCommerce' ) ) {
			$woocommerce_status = __( 'Active', 'folioblocks' );
		}

		$gd_loaded       = extension_loaded( 'gd' ) ? __( 'Loaded', 'folioblocks' ) : __( 'Not loaded', 'folioblocks' );
		$imagick_loaded  = class_exists( 'Imagick' ) ? __( 'Loaded', 'folioblocks' ) : __( 'Not found', 'folioblocks' );
		$openssl_loaded  = extension_loaded( 'openssl' ) ? __( 'Loaded', 'folioblocks' ) : __( 'Not loaded', 'folioblocks' );
		$stream_wrappers = function_exists( 'stream_get_wrappers' ) ? stream_get_wrappers() : array();
		$http_wrapper    = in_array( 'http', $stream_wrappers, true ) ? __( 'Found', 'folioblocks' ) : __( 'Not found', 'folioblocks' );
		$https_wrapper   = in_array( 'https', $stream_wrappers, true ) ? __( 'Found', 'folioblocks' ) : __( 'Not found', 'folioblocks' );
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
		$thumb_test_result = __( 'Not run (test image missing)', 'folioblocks' );
		$test_image_path   = plugin_dir_path( __DIR__ ) . 'icons/pb-thumb-test.jpg';

		if ( function_exists( 'wp_get_image_editor' ) && file_exists( $test_image_path ) ) {
			$editor = wp_get_image_editor( $test_image_path );
			if ( is_wp_error( $editor ) ) {
				$thumb_test_result = sprintf(
					/* translators: %s: WordPress error message. */
					__( 'Failed: %s', 'folioblocks' ),
					$editor->get_error_message()
				);
			} else {
				$thumb_test_result = __( 'OK', 'folioblocks' );
			}
		}

		$https_thumb_mismatch = __( 'None', 'folioblocks' );
		if ( strpos( $site_url, 'https://' ) === 0 && strpos( $thumb_test_url, 'https://' ) !== 0 ) {
			$https_thumb_mismatch = __( 'Possible mismatch (site is HTTPS, thumb URL is not).', 'folioblocks' );
		}

		$rest_api_status = __( 'Not tested', 'folioblocks' );
		if ( function_exists( 'rest_url' ) && function_exists( 'wp_remote_get' ) ) {
			$response = wp_remote_get( rest_url( 'wp/v2/types' ), array( 'timeout' => 5 ) );
			if ( is_wp_error( $response ) ) {
				$rest_api_status = sprintf(
					/* translators: %s: WordPress error message. */
					__( 'Error: %s', 'folioblocks' ),
					$response->get_error_message()
				);
			} else {
				$rest_api_status = sprintf(
					/* translators: %d: HTTP response code. */
					__( 'HTTP %d', 'folioblocks' ),
					wp_remote_retrieve_response_code( $response )
				);
			}
		}

		$wp_debug         = defined( 'WP_DEBUG' ) && WP_DEBUG ? __( 'Enabled', 'folioblocks' ) : __( 'Disabled', 'folioblocks' );
		$wp_debug_log     = defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG ? __( 'Enabled', 'folioblocks' ) : __( 'Disabled', 'folioblocks' );
		$wp_debug_display = defined( 'WP_DEBUG_DISPLAY' ) && WP_DEBUG_DISPLAY ? __( 'Enabled', 'folioblocks' ) : __( 'Disabled', 'folioblocks' );
		$wp_cron          = defined( 'DISABLE_WP_CRON' ) && DISABLE_WP_CRON ? __( 'Disabled', 'folioblocks' ) : __( 'Enabled', 'folioblocks' );
		$script_debug     = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? __( 'Enabled', 'folioblocks' ) : __( 'Disabled', 'folioblocks' );

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

		$lines   = array();
		$lines[] = __( '=== Environment ===', 'folioblocks' );
		$lines[] = sprintf( __( 'Site URL: %s', 'folioblocks' ), $site_url );
		$lines[] = sprintf( __( 'Home URL: %s', 'folioblocks' ), $home_url );
		$lines[] = sprintf( __( 'Multisite: %s', 'folioblocks' ), $get_yes_no( is_multisite() ) );
		$lines[] = sprintf( __( 'WordPress Version: %s', 'folioblocks' ), get_bloginfo( 'version' ) );
		$lines[] = sprintf( __( 'PHP Version: %s', 'folioblocks' ), PHP_VERSION );
		$lines[] = sprintf( __( 'MySQL Version: %s', 'folioblocks' ), $wpdb->db_version() );
		$lines[] = sprintf( __( 'Server Software: %s', 'folioblocks' ), $server_software );
		$lines[] = '';

		$lines[] = __( '=== Theme ===', 'folioblocks' );
		$lines[] = sprintf( __( 'Active Theme: %s', 'folioblocks' ), trim( $theme_name . ' ' . $theme_ver ) );
		if ( $theme_parent ) {
			$lines[] = sprintf(
				__( 'Parent Theme: %s', 'folioblocks' ),
				trim( $theme_parent->get( 'Name' ) . ' ' . $theme_parent->get( 'Version' ) )
			);
		}
		$lines[] = sprintf( __( 'Block Theme: %s', 'folioblocks' ), $is_block_theme );
		$lines[] = '';

		$lines[] = __( '=== FolioBlocks ===', 'folioblocks' );
		$lines[] = sprintf( __( 'FolioBlocks Version: %s', 'folioblocks' ), $plugin_version ? $plugin_version : __( 'Unknown', 'folioblocks' ) );
		$lines[] = sprintf( __( 'FolioBlocks License: %s', 'folioblocks' ), $license_type );
		$lines[] = sprintf( __( 'WooCommerce: %s', 'folioblocks' ), $woocommerce_status );
		$lines[] = '';
		$lines[] = __( 'Available Blocks:', 'folioblocks' );
		if ( ! empty( $folioblocks_blocks ) ) {
			foreach ( $folioblocks_blocks as $block_label ) {
				$lines[] = '  - ' . $block_label;
			}
		} else {
			$lines[] = '  ' . __( '(No FolioBlocks blocks registered)', 'folioblocks' );
		}
		$lines[] = '';

		$lines[] = __( '=== PHP & Server Extensions ===', 'folioblocks' );
		$lines[] = sprintf( __( 'PHP GD: %s', 'folioblocks' ), $gd_loaded );
		$lines[] = sprintf( __( 'PHP Imagick: %s', 'folioblocks' ), $imagick_loaded );
		$lines[] = sprintf( __( 'PHP OpenSSL: %s', 'folioblocks' ), $openssl_loaded );
		$lines[] = sprintf( __( 'PHP HTTP Wrapper: %s', 'folioblocks' ), $http_wrapper );
		$lines[] = sprintf( __( 'PHP HTTPS Wrapper: %s', 'folioblocks' ), $https_wrapper );
		$lines[] = sprintf( __( 'PHP Config[allow_url_fopen]: %s', 'folioblocks' ), $allow_url_fopen );
		$lines[] = sprintf( __( 'PHP Config[allow_url_include]: %s', 'folioblocks' ), $allow_url_inc );
		$lines[] = sprintf( __( 'PHP Memory Limit: %s', 'folioblocks' ), ini_get( 'memory_limit' ) );
		$lines[] = sprintf( __( 'PHP Max Execution Time: %s', 'folioblocks' ), ini_get( 'max_execution_time' ) );
		$lines[] = sprintf( __( 'PHP Post Max Size: %s', 'folioblocks' ), ini_get( 'post_max_size' ) );
		$lines[] = sprintf( __( 'Max Upload Size: %s', 'folioblocks' ), size_format( wp_max_upload_size() ) );
		$lines[] = '';

		$lines[] = __( '=== Images & Thumbnails ===', 'folioblocks' );
		$lines[] = sprintf(
			__( 'Available Image Editors: %s', 'folioblocks' ),
			! empty( $available_image_editors ) ? implode( ', ', $available_image_editors ) : __( 'Unknown', 'folioblocks' )
		);
		$lines[] = sprintf(
			__( 'Default Image Editor: %s', 'folioblocks' ),
			$default_image_editor ? $default_image_editor : __( 'Unknown', 'folioblocks' )
		);
		$lines[] = sprintf( __( 'Thumbnail Generation Test URL: %s', 'folioblocks' ), $thumb_test_url );
		$lines[] = sprintf( __( 'Thumbnail Generation Test Result: %s', 'folioblocks' ), $thumb_test_result );
		$lines[] = sprintf( __( 'HTTPS Thumb Mismatch: %s', 'folioblocks' ), $https_thumb_mismatch );
		$lines[] = '';

		$lines[] = __( '=== WordPress Configuration ===', 'folioblocks' );
		$lines[] = sprintf( __( 'WP_DEBUG: %s', 'folioblocks' ), $wp_debug );
		$lines[] = sprintf( __( 'WP_DEBUG_LOG: %s', 'folioblocks' ), $wp_debug_log );
		$lines[] = sprintf( __( 'WP_DEBUG_DISPLAY: %s', 'folioblocks' ), $wp_debug_display );
		$lines[] = sprintf( __( 'DISABLE_WP_CRON: %s', 'folioblocks' ), $wp_cron );
		$lines[] = sprintf( __( 'SCRIPT_DEBUG: %s', 'folioblocks' ), $script_debug );
		$lines[] = sprintf( __( 'REST API Status: %s', 'folioblocks' ), $rest_api_status );
		$lines[] = '';

		$lines[] = __( '=== Active Plugins ===', 'folioblocks' );
		if ( ! empty( $plugins_list ) ) {
			foreach ( $plugins_list as $plugin_line ) {
				$lines[] = '  - ' . $plugin_line;
			}
		} else {
			$lines[] = '  ' . __( '(No active plugins found)', 'folioblocks' );
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
