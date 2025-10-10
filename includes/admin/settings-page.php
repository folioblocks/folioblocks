<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly.

add_action( 'admin_enqueue_scripts', 'portfolio_blocks_admin_styles' );

function portfolio_blocks_admin_styles( $hook ) {
    if ( $hook !== 'toplevel_page_portfolio-blocks-settings' ) {
        return;
    }

    wp_enqueue_style( 
        'portfolio-blocks-admin', 
        plugin_dir_url( __FILE__ ) . 'settings-page.css',
        array(), 
        filemtime( plugin_dir_path( __FILE__ ) . 'settings-page.css' )
    );
}

function portfolio_blocks_render_settings_page() {
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Portfolio Blocks', 'portfolio-blocks' ); ?></h1>

		<div class="settings-container">
        	<div class="settings-left">
				<?php if ( pb_fs()->can_use_premium_code() ) : ?>
					<p>
                	    Thank you for purchasing Portfolio Blocks Pro. Portfolio Blocks is a WordPress plugin 
						purpose-built for the block editor and full site editor, giving you the tools to create 
						beautiful photo and video galleries with ease directly in your posts or pages.
                	</p>
					<p>
						All of the blocks and galleries work entirely from the block editor. There are no external 
						settings pages for any of the blocks, you work entirely from the block editor. If you find 
						that you need any help using the plugin, we have prepared walktrough video tutorials on our 
						for all YouTube channel the blocks:
					</p>
					<hr/>
					<h2>Video Tutorials:</h2>
				<?php else : ?>
                	<p>
                	    Thank you for downloading Portfolio Blocks. Portfolio Blocks is a WordPress plugin 
						purpose-built for the block editor and full site editor, giving you the tools to create 
						beautiful photo and video galleries with ease directly in your posts or pages.
                	</p>
					<p>
						Portfolio Blocks is a paid premiuim plugin, this free version available in the WordPress plugin repository
						is only meant to give you a taste of what the full version can do.
					</p>
					<div class="settings-features">

						<h2>Free - Features:</h2>
						<ul class="features">
							<li>Galleries limited to 15 images</li>
							<li>Responsive Design Controls</li>
							<li>All Other Block Settings <Strong>Disabled</strong></li>
						</ul>
						<h2>Pro - Features:</h2>
						<ul class="features">
							<li>Unlimited galleries</li>
							<li>Filterable Image & Video galleries</li>
							<li>Add border width, radius & color to images</li>
							<li>Add drop shadow to images</li>
							<li>Image Lightbox</li>
							<li>Show Captions in Image Lightbox</li>
							<li>Show Image Title on hover</li>
							<li>Option to allow Image downloads</li>
                            <li>Randomize Image order</li>
							<li>Right-click prevention</li>
							<li>Lazy Load galleries</li>
						</ul>
					</div>
					<p>
						Purchase a license for Portfolio Blocks today and enjoy the best gallery plugin for modern WordPress and the block editor.
					</p>
					<p class="buy-button-wrapper">
    					<a class="button button-primary buy-button" href="<?php echo esc_url( admin_url( 'admin.php?page=portfolio-blocks-settings-pricing' ) ); ?>">
        					<?php esc_html_e( 'Upgrade Now', 'portfolio-blocks' ); ?>
    					</a>
					</p>
					<hr/>
					<h2>Video Tutorials:</h2>
					<p>
						Still undecided? Check out the video tutorials of all the blocks so you can see all the premium features in action:
					</p>
				
				<?php endif; ?>
				<p>
					NOTE TO BETA TESTERS: VIDEOS COMING SOON!
				</p>
				<div class="video-grid">
					<div class="video-block before-after">
						<a href="#">
							<span class="play-icon">▶</span>
							<span class="video-label">Before &amp; After Block</span>
						</a>
					</div>
					<div class="video-block carousel-gallery">
						<a href="#">
							<span class="play-icon">▶</span>
							<span class="video-label">Carousel Gallery Block</span>
						</a>
					</div>
					<div class="video-block grid-gallery">
						<a href="#">
							<span class="play-icon">▶</span>
							<span class="video-label">Grid Gallery Block</span>
						</a>
					</div>
					<div class="video-block justified-gallery">
						<a href="#">
							<span class="play-icon">▶</span>
							<span class="video-label">Justified Gallery Block</span>
						</a>
					</div>
					<div class="video-block masonry-gallery">
						<a href="#">
							<span class="play-icon">▶</span>
							<span class="video-label">Masonry Gallery Block</span>
						</a>
					</div>
					<div class="video-block modular-gallery">
						<a href="#">
							<span class="play-icon">▶</span>
							<span class="video-label">Modular Gallery Block</span>
						</a>
					</div>
					<div class="video-block video-gallery">
						<a href="#">
							<span class="play-icon">▶</span>
							<span class="video-label">Video Gallery Block</span>
						</a>
					</div>
				</div>
				<hr/>
				<?php
    				// --- Latest News from portfolio-blocks.com ---
    				// Load WordPress feed functions (SimplePie wrapper)
    				if ( ! function_exists( 'fetch_feed' ) ) {
        				require_once ABSPATH . WPINC . '/feed.php';
    				}

    				// Cache the feed for 6 hours to avoid slow admin loads
    				$pb_feed_cache_lifetime = function( $seconds ) { return 6 * HOUR_IN_SECONDS; };
    				add_filter( 'wp_feed_cache_transient_lifetime', $pb_feed_cache_lifetime );

    				$pb_rss = fetch_feed( 'https://portfolio-blocks.com/feed/' );

    				// Remove our temporary cache lifetime filter
    				remove_filter( 'wp_feed_cache_transient_lifetime', $pb_feed_cache_lifetime );

    				$pb_has_items = false;
    				$pb_rss_items = array();

    				if ( ! is_wp_error( $pb_rss ) ) {
        				$pb_maxitems   = $pb_rss->get_item_quantity( 5 );
        				$pb_rss_items  = $pb_rss->get_items( 0, $pb_maxitems );
        				$pb_has_items  = ( $pb_maxitems > 0 );
    				}
				?>

				<h2><?php esc_html_e( 'Latest News From Portfolio Blocks Website:', 'portfolio-blocks' ); ?></h2>
				<ul class="pb-latest-news">
    				<?php if ( $pb_has_items ) : ?>
        				<?php foreach ( $pb_rss_items as $item ) :
            				// Prepare safe values
            				$pb_title = wp_kses( $item->get_title(), array() );
            				$pb_link  = $item->get_permalink();
            				$pb_date  = date_i18n( get_option( 'date_format' ), (int) $item->get_date( 'U' ) );

            				// Build a short excerpt from the item description/content
            				$pb_desc_raw = $item->get_description();
            				if ( empty( $pb_desc_raw ) && method_exists( $item, 'get_content' ) ) {
                				$pb_desc_raw = $item->get_content();
            				}
            				$pb_desc = wp_strip_all_tags( $pb_desc_raw );
        				?>
            		<li class="pb-news-item">
                		<a href="<?php echo esc_url( $pb_link ); ?>" target="_blank" rel="noopener noreferrer">
                    		<?php echo esc_html( $pb_title ); ?>
                		</a>
                		<div class="pb-news-meta"><?php echo esc_html( $pb_date ); ?></div>
                			<?php if ( ! empty( $pb_desc ) ) : ?>
                    			<div class="pb-news-excerpt"><?php echo esc_html( $pb_desc ); ?></div>
                			<?php endif; ?>
            		</li>
        			<?php endforeach; ?>
    				<?php else : ?>
        			<li class="pb-news-item--empty">
            			<?php esc_html_e( 'No news items found right now. Please check back later.', 'portfolio-blocks' ); ?>
        			</li>
    				<?php endif; ?>
				</ul>
				<p class="pb-news-view-all">
    				<a href="https://portfolio-blocks.com/news/" target="_blank" rel="noopener noreferrer">
       					 <?php esc_html_e( 'View all news', 'portfolio-blocks' ); ?> &rarr;
    				</a>
				</p>
			</div>

			<div class="settings-right">
				<h2>Changelog:</h2>
				<?php
				$readme_path = plugin_dir_path( __DIR__ ) . '../readme.txt';

				if ( file_exists( $readme_path ) ) {
				    $readme = file_get_contents( $readme_path );
				    preg_match( '/==\s*Changelog\s*==(.+)/s', $readme, $matches );
				    if ( isset( $matches[1] ) ) {
				        $changelog = trim( $matches[1] );
				        $entries = preg_split( '/^\s*(?=\d+\.\d+)/m', $changelog, -1, PREG_SPLIT_NO_EMPTY );
				        echo '<ul class="pb-changelog">';
				        foreach ( array_slice( $entries, 0, 15 ) as $entry ) {
				            $lines = array_filter( array_map( 'trim', explode( "\n", $entry ) ) );
				            $version = array_shift( $lines );
				            echo '<li>';
				            echo '<strong>' . esc_html( $version ) . '</strong><br/>';
				            foreach ( $lines as $line ) {
				                echo esc_html( $line ) . '<br/>';
				            }
				            echo '</li>';
				        }
				        echo '</ul>';
				    } else {
				        echo '<p>No changelog found in readme.txt.</p>';
				    }
				} else {
				    echo '<p>readme.txt file not found at ' . esc_html( $readme_path ) . '</p>';
				}
				?>
			</div>
		</div>
	</div>
	<?php
}
?>