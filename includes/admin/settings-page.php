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
		<h1><?php esc_html_e( 'Portfolio Blocks Settings', 'portfolio-blocks' ); ?></h1>

		<div class="settings-container">
        	<div class="settings-left">

                <p>
                    Thank you for downloading Portfolio Blocks. Portfolio Blocks is a WordPress plugin 
					purpose-built for the block editor and full site editor, giving you the tools to create 
					beautiful photo and video galleries with ease.
                </p>
				<div class="settings-features">
					<div class="feature-column">
						<h2>Free - Features:</h2>
						<ul>
							<li>Galleries limited to 15 images</li>
							<li>Block Settings Disabled</li>
					</div>
					<div class="feature-column">
						<h2>Pro - Features:</h2>
						<ul>
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
							<li>Woo Integration</li>
						</ul>
					</div>
				</div>

                <p>
                    Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae 
                    pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean 
                    sed diam urna tempor. 
                </p>
		        <p>
                    Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer 
                    nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra 
                    inceptos himenaeos.
                </p>

				<div class="license-key-container">
					<h2>License Key</h2>
                    <p>Enter you license kdy to activate the pro features.</p>
					<div class="input-row">
						<input type="text" name="portfolio_blocks_license_key" value="" class="regular-text" placeholder="Enter your license key" />
						<button class="button button-primary" type="button">Verify License</button>
						<button class="button" type="button">Deactivate License</button>
					</div>
				</div>

			</div>

			<div class="settings-right">
				<h2>Changelog</h2>
				<ul>
					<li>
						<strong>0.6.9</strong><br/>  
						- Add Before & After comparison block<br/>
						- Fixed block previews for all blocks
					</li>
					<li>
						<strong>0.6.8</strong><br/>
						- Fixed stability on thumbnail injection into List View
					</li>
					<li>
						<strong>0.6.7</strong><br/>
						- Render.php on Carousel Gallery Block complete<br/>
						- Fixed bug container-type bug on PB Image Block
					</li>
					<li>
						<strong>0.6.6</strong><br/>
						- Building Carousel Gallery Block
					</li>
					<li>
						<strong>0.6.5</strong><br/>
						- Added custom icons to all blocks
					</li>
					<li>
						<strong>0.6.4</strong><br/>
						- Fixed download icon in lightbox on Grid, Justified, Masonry, and Modular galleries<br/>
						- Fixed arrow placement in lightbox on Mobile<br/>
						- Tweaked styles for download icon
					</li>
					<li>
						<strong>0.6.3</strong><br/>
						- Organized gallery settings
					</li>
					<li>
						<strong>0.6.2</strong><br/>
						- Added Right-Click Prevention to Grid, Justified, Masonry, and Modular galleries
					</li>
					<li>
						<strong>0.6.1</strong><br/> 
						- Fixed a bug in Masonry where adding border messed up the layout in the block editor<br/>
						- Fixed margin-bottom bug in Justified gallery on Mobile
					</li>
					<li>
						<strong>0.6.0</strong><br/> 
						- Added support for Image downloads in Grid, Justified, Masonry, and Modular galleries<br/>
						- Switched the on Image hover to show Title instead of caption
					</li>
					<li>
						<strong>0.5.5</strong><br/> 
						- Added support for borders and border-radius to PB Image Block<br/>
						- Added support for borders and border-radius to Grid, Justifed, Masonry, and Modular galleries<br/>
						- Moved layout logic for Grid Gallery out of PB Image Block and into Grid Gallery
					</li>
					<li>
						<strong>0.5.4</strong><br/> 
						- Tested in WordPress 6.8<br/>
						- Moved Filter Bar color settings into Styles panel on all blocks<br/>
						- Started scaffolding the Modular Gallery and ImageRow block
					</li>
					<li>
						<strong>0.5.3</strong><br/> 
						- Created custom component for managing columns' responsive vallues.<br/>
						- Fixed bug in Masonry that prevented collumn value from being used in front-end.
					</li>
					<li>
						<strong>0.5.2</strong><br/> 
						- Fixed compliance issues on all render files.
					</li>
					<li>
						<strong>0.5.1</strong><br/> 
						- Initial release of the settings page.
						- Improved license management UI.
					</li>
					<li>
						<strong>0.5.0</strong><br/> 
						- Grid, Masonry, Justified, and Video gallery blocks feature complete.
					</li>
				</ul>
			</div>
		</div>
	</div>
	<?php
}
?>