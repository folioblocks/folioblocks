<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'fbks_render_system_info_page' ) ) {
	function fbks_render_system_info_page() {
		global $wpdb;

		// Theme info.
		$theme       = wp_get_theme();
		$theme_name  = $theme->get( 'Name' );
		$theme_ver   = $theme->get( 'Version' );
		$theme_parent = $theme->parent();
		// Detect if active theme is block‑based.
		$is_block_theme = function_exists( 'wp_is_block_theme' ) ? ( wp_is_block_theme() ? 'Yes' : 'No' ) : 'Unknown';

		// Basic URLs.
		$site_url = get_site_url();
		$home_url = get_home_url();

		// Plugin version (safe).
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

		// Freemius / license info (safe-guarded).
		$license_type = 'Unknown';
		if ( function_exists( 'fbks_fs' ) ) {
			$license_type = fbks_fs()->can_use_premium_code() ? 'Pro (active)' : 'Free';
		}

		// WooCommerce detection.
		$woocommerce_status = 'Not installed';
		$active_plugins     = (array) get_option( 'active_plugins', array() );
		if ( in_array( 'woocommerce/woocommerce.php', $active_plugins, true ) || class_exists( 'WooCommerce' ) ) {
			$woocommerce_status = 'Active';
		}

		// PHP extensions & wrappers.
		$gd_loaded       = extension_loaded( 'gd' ) ? 'Loaded' : 'Not loaded';
		$imagick_loaded  = class_exists( 'Imagick' ) ? 'Loaded' : 'Not found';
		$openssl_loaded  = extension_loaded( 'openssl' ) ? 'Loaded' : 'Not loaded';
		$stream_wrappers = function_exists( 'stream_get_wrappers' ) ? stream_get_wrappers() : array();
		$http_wrapper    = in_array( 'http', $stream_wrappers, true ) ? 'Found' : 'Not found';
		$https_wrapper   = in_array( 'https', $stream_wrappers, true ) ? 'Found' : 'Not found';
		$allow_url_fopen = ini_get( 'allow_url_fopen' );
		$allow_url_inc   = ini_get( 'allow_url_include' );

		// WP Image Editors.
		$available_image_editors = array();
		if ( function_exists( 'wp_get_image_editor' ) && function_exists( 'wp_get_image_editors' ) ) {
			$available_image_editors = wp_get_image_editors();
		}

		// Determine default image editor class (if possible).
		$default_image_editor = '';
		if ( function_exists( 'wp_get_image_editor' ) ) {
			// Use test image in includes/icons/ for editor instantiation test.
			$test_image_path = plugin_dir_path( __DIR__ ) . 'icons/pb-thumb-test.jpg';
			if ( file_exists( $test_image_path ) ) {
				$editor = wp_get_image_editor( $test_image_path );
				if ( ! is_wp_error( $editor ) ) {
					$default_image_editor = get_class( $editor );
				}
			}
		}

		// Thumbnail generation test.
		$thumb_test_url    = plugin_dir_url( __DIR__ ) . 'icons/pb-thumb-test.jpg';
		$thumb_test_result = 'Not run (test image missing)';
		$test_image_path   = plugin_dir_path( __DIR__ ) . 'icons/pb-thumb-test.jpg';

		if ( function_exists( 'wp_get_image_editor' ) && file_exists( $test_image_path ) ) {
			$editor = wp_get_image_editor( $test_image_path );
			if ( is_wp_error( $editor ) ) {
				$thumb_test_result = 'Failed: ' . $editor->get_error_message();
			} else {
				$thumb_test_result = 'OK';
			}
		}

		// HTTPS thumbnail mismatch placeholder (we don’t modify URLs here, just note protocol).
		$https_thumb_mismatch = 'None';
		if ( strpos( $site_url, 'https://' ) === 0 && strpos( $thumb_test_url, 'https://' ) !== 0 ) {
			$https_thumb_mismatch = 'Possible mismatch (site is HTTPS, thumb URL is not).';
		}

		// REST API status.
		$rest_api_status = 'Not tested';
		if ( function_exists( 'rest_url' ) && function_exists( 'wp_remote_get' ) ) {
			$response = wp_remote_get( rest_url( 'wp/v2/types' ), array( 'timeout' => 5 ) );
			if ( is_wp_error( $response ) ) {
				$rest_api_status = 'Error: ' . $response->get_error_message();
			} else {
				$code            = wp_remote_retrieve_response_code( $response );
				$rest_api_status = 'HTTP ' . $code;
			}
		}

		// WP constants.
		$wp_debug        = defined( 'WP_DEBUG' ) && WP_DEBUG ? 'Enabled' : 'Disabled';
		$wp_debug_log    = defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG ? 'Enabled' : 'Disabled';
		$wp_debug_display = defined( 'WP_DEBUG_DISPLAY' ) && WP_DEBUG_DISPLAY ? 'Enabled' : 'Disabled';
		$wp_cron         = defined( 'DISABLE_WP_CRON' ) && DISABLE_WP_CRON ? 'Disabled' : 'Enabled';
		$script_debug    = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? 'Enabled' : 'Disabled';

		// Active plugins (name + version).
		$plugins      = $active_plugins;
		$plugins_list = array();
		if ( is_array( $plugins ) ) {
			foreach ( $plugins as $plugin_file ) {
				$plugin_path = WP_PLUGIN_DIR . '/' . $plugin_file;
				if ( ! file_exists( $plugin_path ) ) {
					continue;
				}

				$data = function_exists( 'get_plugin_data' ) ? get_plugin_data( $plugin_path, false, false ) : array();
				$name = ! empty( $data['Name'] ) ? $data['Name'] : $plugin_file;
				$ver  = ! empty( $data['Version'] ) ? $data['Version'] : '';

				$plugins_list[] = trim( $name . ( $ver ? ' ' . $ver : '' ) );
			}
		}

		// FolioBlocks blocks overview (dynamic list from registered block types).
		$folioblocks_blocks = array();
		if ( class_exists( 'WP_Block_Type_Registry' ) ) {
			$registry = WP_Block_Type_Registry::get_instance();
			if ( $registry && method_exists( $registry, 'get_all_registered' ) ) {
				$all_blocks = $registry->get_all_registered();
				foreach ( $all_blocks as $block_name => $block_type ) {
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

		// Build the text blob in sections.
		$lines   = array();
		$lines[] = '=== Environment ===';
		$lines[] = 'Site URL: ' . $site_url;
		$lines[] = 'Home URL: ' . $home_url;
		$lines[] = 'Multisite: ' . ( is_multisite() ? 'Yes' : 'No' );
		$lines[] = 'WordPress Version: ' . get_bloginfo( 'version' );
		$lines[] = 'PHP Version: ' . PHP_VERSION;
		$lines[] = 'MySQL Version: ' . $wpdb->db_version();
		$server_software = '';
		if ( isset( $_SERVER['SERVER_SOFTWARE'] ) ) {
			$server_software = sanitize_text_field( wp_unslash( $_SERVER['SERVER_SOFTWARE'] ) );
		}
		$lines[] = 'Server Software: ' . $server_software;
		$lines[] = '';

		$lines[] = '=== Theme ===';
		$lines[] = 'Active Theme: ' . $theme_name . ' ' . $theme_ver;
		if ( $theme_parent ) {
			$lines[] = 'Parent Theme: ' . $theme_parent->get( 'Name' ) . ' ' . $theme_parent->get( 'Version' );
		}
		$lines[] = 'Block Theme: ' . $is_block_theme;
		$lines[] = '';

		$lines[] = '=== FolioBlocks ===';
		$lines[] = 'FolioBlocks Version: ' . ( $plugin_version ? $plugin_version : 'Unknown' );
		$lines[] = 'FolioBlocks License: ' . $license_type;
		$lines[] = 'WooCommerce: ' . $woocommerce_status;
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
		$lines[] = 'PHP GD: ' . $gd_loaded;
		$lines[] = 'PHP Imagick: ' . $imagick_loaded;
		$lines[] = 'PHP OpenSSL: ' . $openssl_loaded;
		$lines[] = 'PHP HTTP Wrapper: ' . $http_wrapper;
		$lines[] = 'PHP HTTPS Wrapper: ' . $https_wrapper;
		$lines[] = 'PHP Config[allow_url_fopen]: ' . $allow_url_fopen;
		$lines[] = 'PHP Config[allow_url_include]: ' . $allow_url_inc;
		$lines[] = 'PHP Memory Limit: ' . ini_get( 'memory_limit' );
		$lines[] = 'PHP Max Execution Time: ' . ini_get( 'max_execution_time' );
		$lines[] = 'PHP Post Max Size: ' . ini_get( 'post_max_size' );
		$lines[] = 'Max Upload Size: ' . size_format( wp_max_upload_size() );
		$lines[] = '';

		$lines[] = '=== Images & Thumbnails ===';
		$lines[] = 'Available Image Editors: ' . ( ! empty( $available_image_editors ) ? implode( ', ', $available_image_editors ) : 'Unknown' );
		$lines[] = 'Default Image Editor: ' . ( $default_image_editor ? $default_image_editor : 'Unknown' );
		$lines[] = 'Thumbnail Generation Test URL: ' . $thumb_test_url;
		$lines[] = 'Thumbnail Generation Test Result: ' . $thumb_test_result;
		$lines[] = 'HTTPS Thumb Mismatch: ' . $https_thumb_mismatch;
		$lines[] = '';

		$lines[] = '=== WordPress Configuration ===';
		$lines[] = 'WP_DEBUG: ' . $wp_debug;
		$lines[] = 'WP_DEBUG_LOG: ' . $wp_debug_log;
		$lines[] = 'WP_DEBUG_DISPLAY: ' . $wp_debug_display;
		$lines[] = 'DISABLE_WP_CRON: ' . $wp_cron;
		$lines[] = 'SCRIPT_DEBUG: ' . $script_debug;
		$lines[] = 'REST API Status: ' . $rest_api_status;
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
				<img src="<?php echo esc_url( plugin_dir_url( __DIR__ ) . '/icons/pb-brand-icon.svg' ); ?>" alt="FolioBlocks" class="pb-settings-logo" />
				<h1><?php esc_html_e( 'FolioBlocks', 'folioblocks' ); ?><?php if ( fbks_fs()->can_use_premium_code() ) : ?> Pro<?php endif; ?> - System Information</h1>
			</div>
			<div class="settings-container">
        		<div class="settings-left">
					<div class="pb-dashboard-box">
					<h2>Server Configuration</h2>
					<p><?php esc_html_e( 'Bellow you can find information regarding your server configuration. This can be used to help debug any issues you have with FolioBlocks. Copy and paste the information when requesting support.', 'folioblocks' ); ?></p>
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
						<h2>Quick Links:</h2>
						<ul class="pb-quick-links">
						<li>
							<a href="mailto:info@folioblocks.com" target="_blank" rel="noopener noreferrer">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M125.4 128C91.5 128 64 155.5 64 189.4C64 190.3 64 191.1 64.1 192L64 192L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 192L575.9 192C575.9 191.1 576 190.3 576 189.4C576 155.5 548.5 128 514.6 128L125.4 128zM528 256.3L528 448C528 456.8 520.8 464 512 464L128 464C119.2 464 112 456.8 112 448L112 256.3L266.8 373.7C298.2 397.6 341.7 397.6 373.2 373.7L528 256.3zM112 189.4C112 182 118 176 125.4 176L514.6 176C522 176 528 182 528 189.4C528 193.6 526 197.6 522.7 200.1L344.2 335.5C329.9 346.3 310.1 346.3 295.8 335.5L117.3 200.1C114 197.6 112 193.6 112 189.4z"/></svg>
								Feedback
							</a>
						</li>
						<li>
							<a href="https://wordpress.org/support/plugin/folioblocks" target="_blank" rel="noopener noreferrer">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M320 128C241 128 175.3 185.3 162.3 260.7C171.6 257.7 181.6 256 192 256L208 256C234.5 256 256 277.5 256 304L256 400C256 426.5 234.5 448 208 448L192 448C139 448 96 405 96 352L96 288C96 164.3 196.3 64 320 64C443.7 64 544 164.3 544 288L544 456.1C544 522.4 490.2 576.1 423.9 576.1L336 576L304 576C277.5 576 256 554.5 256 528C256 501.5 277.5 480 304 480L336 480C362.5 480 384 501.5 384 528L384 528L424 528C463.8 528 496 495.8 496 456L496 435.1C481.9 443.3 465.5 447.9 448 447.9L432 447.9C405.5 447.9 384 426.4 384 399.9L384 303.9C384 277.4 405.5 255.9 432 255.9L448 255.9C458.4 255.9 468.3 257.5 477.7 260.6C464.7 185.3 399.1 127.9 320 127.9z"/></svg>
								Support
							</a>
						</li>
						<li>
							<a href="https://wordpress.org/support/plugin/folioblocks/reviews/#new-post" target="_blank" rel="noopener noreferrer">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M320.1 32C329.1 32 337.4 37.1 341.5 45.1L415 189.3L574.9 214.7C583.8 216.1 591.2 222.4 594 231C596.8 239.6 594.5 249 588.2 255.4L473.7 369.9L499 529.8C500.4 538.7 496.7 547.7 489.4 553C482.1 558.3 472.4 559.1 464.4 555L320.1 481.6L175.8 555C167.8 559.1 158.1 558.3 150.8 553C143.5 547.7 139.8 538.8 141.2 529.8L166.4 369.9L52 255.4C45.6 249 43.4 239.6 46.2 231C49 222.4 56.3 216.1 65.3 214.7L225.2 189.3L298.8 45.1C302.9 37.1 311.2 32 320.2 32zM320.1 108.8L262.3 222C258.8 228.8 252.3 233.6 244.7 234.8L119.2 254.8L209 344.7C214.4 350.1 216.9 357.8 215.7 365.4L195.9 490.9L309.2 433.3C316 429.8 324.1 429.8 331 433.3L444.3 490.9L424.5 365.4C423.3 357.8 425.8 350.1 431.2 344.7L521 254.8L395.5 234.8C387.9 233.6 381.4 228.8 377.9 222L320.1 108.8z"/></svg>
								Rate Us
							</a>
						</li>
						<li>
							<a href="https://folioblocks.com" target="_blank" rel="noopener noreferrer"> 
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M451.5 160C434.9 160 418.8 164.5 404.7 172.7C388.9 156.7 370.5 143.3 350.2 133.2C378.4 109.2 414.3 96 451.5 96C537.9 96 608 166 608 252.5C608 294 591.5 333.8 562.2 363.1L491.1 434.2C461.8 463.5 422 480 380.5 480C294.1 480 224 410 224 323.5C224 322 224 320.5 224.1 319C224.6 301.3 239.3 287.4 257 287.9C274.7 288.4 288.6 303.1 288.1 320.8C288.1 321.7 288.1 322.6 288.1 323.4C288.1 374.5 329.5 415.9 380.6 415.9C405.1 415.9 428.6 406.2 446 388.8L517.1 317.7C534.4 300.4 544.2 276.8 544.2 252.3C544.2 201.2 502.8 159.8 451.7 159.8zM307.2 237.3C305.3 236.5 303.4 235.4 301.7 234.2C289.1 227.7 274.7 224 259.6 224C235.1 224 211.6 233.7 194.2 251.1L123.1 322.2C105.8 339.5 96 363.1 96 387.6C96 438.7 137.4 480.1 188.5 480.1C205 480.1 221.1 475.7 235.2 467.5C251 483.5 269.4 496.9 289.8 507C261.6 530.9 225.8 544.2 188.5 544.2C102.1 544.2 32 474.2 32 387.7C32 346.2 48.5 306.4 77.8 277.1L148.9 206C178.2 176.7 218 160.2 259.5 160.2C346.1 160.2 416 230.8 416 317.1C416 318.4 416 319.7 416 321C415.6 338.7 400.9 352.6 383.2 352.2C365.5 351.8 351.6 337.1 352 319.4C352 318.6 352 317.9 352 317.1C352 283.4 334 253.8 307.2 237.5z"/></svg>
								Website
							</a>
						</li>
						<li>
							<a href="https://bsky.app/profile/folioblocks.com" target="_blank" rel="noopener noreferrer">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M439.8 358.7C436.5 358.3 433.1 357.9 429.8 357.4C433.2 357.8 436.5 358.3 439.8 358.7zM320 291.1C293.9 240.4 222.9 145.9 156.9 99.3C93.6 54.6 69.5 62.3 53.6 69.5C35.3 77.8 32 105.9 32 122.4C32 138.9 41.1 258 47 277.9C66.5 343.6 136.1 365.8 200.2 358.6C203.5 358.1 206.8 357.7 210.2 357.2C206.9 357.7 203.6 358.2 200.2 358.6C106.3 372.6 22.9 406.8 132.3 528.5C252.6 653.1 297.1 501.8 320 425.1C342.9 501.8 369.2 647.6 505.6 528.5C608 425.1 533.7 372.5 439.8 358.6C436.5 358.2 433.1 357.8 429.8 357.3C433.2 357.7 436.5 358.2 439.8 358.6C503.9 365.7 573.4 343.5 593 277.9C598.9 258 608 139 608 122.4C608 105.8 604.7 77.7 586.4 69.5C570.6 62.4 546.4 54.6 483.2 99.3C417.1 145.9 346.1 240.4 320 291.1z"/></svg>
								BlueSky
							</a>
						</li>
						<li>
							<a href="https://www.youtube.com/@FolioBlocks" target="_blank" rel="noopener noreferrer">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M581.7 188.1C575.5 164.4 556.9 145.8 533.4 139.5C490.9 128 320.1 128 320.1 128C320.1 128 149.3 128 106.7 139.5C83.2 145.8 64.7 164.4 58.4 188.1C47 231 47 320.4 47 320.4C47 320.4 47 409.8 58.4 452.7C64.7 476.3 83.2 494.2 106.7 500.5C149.3 512 320.1 512 320.1 512C320.1 512 490.9 512 533.5 500.5C557 494.2 575.5 476.3 581.8 452.7C593.2 409.8 593.2 320.4 593.2 320.4C593.2 320.4 593.2 231 581.8 188.1zM264.2 401.6L264.2 239.2L406.9 320.4L264.2 401.6z"/></svg>
								YouTube
							</a>
						</li>
						<li>
							<a href="https://www.facebook.com/folioblocks/" target="_blank" rel="noopener noreferrer">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 440 146.7 540.8 258.2 568.5L258.2 398.2L205.4 398.2L205.4 320L258.2 320L258.2 286.3C258.2 199.2 297.6 158.8 383.2 158.8C399.4 158.8 427.4 162 438.9 165.2L438.9 236C432.9 235.4 422.4 235 409.3 235C367.3 235 351.1 250.9 351.1 292.2L351.1 320L434.7 320L420.3 398.2L351 398.2L351 574.1C477.8 558.8 576 450.9 576 320z"/></svg>
								Facebook
							</a>
						</li>
						</ul>
					</div>
					</div>
				</div>
			</div>
		</div>
	</div>
<?php } }
