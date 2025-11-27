<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly.

add_action( 'admin_enqueue_scripts', 'fbks_admin_styles' );

function fbks_admin_styles( $hook ) {
    if ( $hook !== 'toplevel_page_folioblocks-settings' ) {
        return;
    }

    wp_enqueue_style( 
        'folioblocks-admin', 
        plugin_dir_url( __FILE__ ) . 'settings-page.css',
        array(), 
        filemtime( plugin_dir_path( __FILE__ ) . 'settings-page.css' )
    );
}

function fbks_render_settings_page() {

?>
	<div class="pb-wrap">
		<div class="pb-settings-header">
			<img src="<?php echo esc_url( plugin_dir_url( __DIR__ ) . '/icons/pb-brand-icon.svg' ); ?>" alt="FolioBlocks" class="pb-settings-logo" />
			<h1><?php esc_html_e( 'FolioBlocks', 'folioblocks' ); ?><?php if ( fbks_fs()->can_use_premium_code() ) : ?> Pro<?php endif; ?> - Dashboard</h1>
		</div>

		<div class="settings-container">
        	<div class="settings-left">
				<div class="pb-dashboard-box">
					<h2>Welcome to FolioBlocks:</h2>
					<?php if ( fbks_fs()->can_use_premium_code() ) : ?>
					<p>
                	    Thank you for purchasing FolioBlocks Pro. FolioBlocks is a WordPress plugin 
						purpose-built for the block editor and full site editor, giving you the tools to create 
						beautiful photo and video galleries with ease directly in your posts or pages.
                	</p>
					<p>
						All of the blocks and galleries work entirely from the block editor. There are no external 
						settings pages for any of the blocks, you work entirely from the block editor. 
					</p>
					<?php else : ?>
                	<p>
                	    Thank you for downloading FolioBlocks. FolioBlocks is a WordPress plugin 
						purpose-built for the block editor and full site editor, giving you the tools to create 
						beautiful photo and video galleries with ease directly in your posts or pages.
                	</p>
					<p>
						FolioBlocks is a paid premiuim plugin, this free version available in the WordPress plugin repository
						is only meant to give you a taste of what the full version can do.
					</p>
					<?php endif; ?>
					<div class="pb-blocks-grid">
						<h3><?php esc_html_e( 'Available Blocks:', 'folioblocks' ); ?></h3>
					    <div class="pb-blocks-list">
					        <div class="pb-block-item">
					            <div class="pb-block-icon">
									<svg viewBox="0 0 1247.24 1247.24" width="38" height="38" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" >
        								<g data-name="Layer 1" id="Layer_1-2">
            								<g>
                								<path d="m946.7782,109.66665l-794.55635,0c-20.65196,0 -37.49961,16.9725 -37.49961,37.7775l0,800.44495c0,20.80505 16.84765,37.77747 37.49961,37.77747l794.55635,0c20.65198,0 37.49963,-16.97241 37.49963,-37.77747l0,-800.44495c0,-20.805 -16.84766,-37.7775 -37.49963,-37.7775zm-793.46941,38.87251l376.62633,0l0,797.70749l-376.62633,0l0,-797.70749zm792.38255,798.25504l-376.62634,0l0,-798.25504l376.62634,0l0,797.70749l0,0.54755z" />
                								<g>
                    								<path d="m407.65381,421.19415l0,252.39758l-125.54214,-126.4726l125.54214,-126.4725m16.3042,-55.29752c-3.80435,0 -7.60864,1.64246 -10.86948,4.92755l-165.21562,166.43994c-5.97818,6.02252 -5.97818,16.42499 0,22.44751l165.21562,166.44006c3.26083,3.28503 7.06512,4.92749 10.86948,4.92749c8.15207,0 15.76065,-6.57001 15.76065,-15.87756l0,-332.87997c0,-9.30746 -7.60858,-15.8775 -15.76065,-15.8775l0,0l0,-0.54752z" />
                    								<path d="m691.34631,421.19415l125.54211,126.47247l-125.54211,126.47247l0,-252.39749m-16.30414,-56.39249c-8.15216,0 -15.76068,6.57004 -15.76068,15.8775l0,332.88007c0,9.3075 7.60852,15.8775 15.76068,15.8775c3.80426,0 7.60852,-1.64252 10.86938,-4.92755l165.21552,-166.44006c5.97821,-6.02246 5.97821,-16.42499 0,-22.44745l-165.21552,-166.43997c-3.26086,-3.285 -7.06512,-4.92752 -10.86938,-4.92752l0,0l0,0.54749z" />
                								</g>
            								</g>
        								</g>
    								</svg>
								</div>
					            <span>Before &amp; After</span>
								<a href="https://folioblocks.com/blocks/before-after-block/" target="_blank">Demo</a>
					        </div>
					        <div class="pb-block-item">
					            <div class="pb-block-icon">
									<svg viewBox="0 0 1247.24 1247.24" width="36" height="36" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        								<g stroke="null" data-name="Layer 1" id="Layer_1">
            								<rect stroke="null" x="-161.50317" y="-161.50317" id="svg_2" fill="none" height="1570.00635" width="1570.00635" />
            								<path stroke="null" id="svg_4" d="m1100.38953,146.61058l0,680.99025l-953.77895,0l0,-680.99025l953.12477,0m25.51257,-46.44603l-1003.49579,0c-11.77504,0 -21.58759,9.81255 -21.58759,21.58759l0,730.70709c0,11.77509 9.81255,21.58765 21.58759,21.58765l1002.84161,0c11.77478,0 21.58752,-9.81256 21.58752,-21.58765l0,-730.70709c0,-11.77504 -9.81274,-21.58759 -21.58752,-21.58759l0,0l0.65417,0z" />
            								<g id="Layer_2">
                								<path stroke="null" id="svg_6" d="m1003.57239,921.80115c-7.19592,0 -14.39172,3.27094 -18.97083,8.50427c-3.27106,4.57922 -4.57916,10.46674 -3.92517,17.00842c0.65411,6.54163 3.92517,11.77496 8.50427,15.04584l96.16272,71.3045l-96.16272,71.30469c-4.5791,3.27075 -7.19592,8.50378 -8.50427,15.04553c-0.65399,6.54175 0,12.42944 3.92517,17.00867c3.92493,5.88745 10.46667,9.1582 18.31653,9.1582c4.57935,0 9.15845,-1.96265 13.73779,-4.5791l121.67529,-90.27539s9.15845,-9.81262 9.15845,-18.31689s-3.271,-14.3916 -9.15845,-18.31665l-121.02124,-89.62115c-3.92505,-2.61676 -8.50415,-3.92505 -13.0835,-3.92505l0,0l-0.65405,0.65411z" />
                								<path stroke="null" id="svg_7" d="m243.42764,921.80115c-4.57922,0 -9.15839,1.30835 -13.08334,3.92517l-121.67554,90.27527s-9.15837,9.8125 -9.15837,18.31689s3.27084,14.3916 9.15837,18.31653l121.67554,90.27551c4.57913,1.9624 8.50412,4.5791 13.08334,4.5791c8.50421,0 15.70001,-6.54187 18.31671,-9.15845c3.27084,-4.57935 4.57919,-10.46667 3.92502,-17.00806c-0.65417,-6.54175 -3.92502,-11.77539 -8.50418,-15.04614l-96.16289,-71.30444l96.16289,-71.30444c9.15836,-7.19592 11.77505,-22.89594 4.57916,-32.05438c-3.92502,-5.88739 -11.77499,-8.50421 -18.97092,-8.50421l0,0l0.65421,-1.30835z" />
                								<polygon id="play_button" stroke="none" points="560,910 710,1023 560,1136" />
            								</g>
        								</g>
    								</svg>
								</div>
					            <span>Carousel Gallery</span>
								<a href="https://folioblocks.com/blocks/carousel-gallery-block/" target="_blank">Demo</a>
					        </div>
					        <div class="pb-block-item">
					            <div class="pb-block-icon">
									<svg viewBox="0 0 1247.24 1247.24" width="36" height="36" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
										<g>
											<path d="M392.02,146.83H130.15c-25.65,0-46.53,20.89-46.53,46.57v136.1c0,25.68,20.88,46.57,46.53,46.57h261.86c25.66,0,46.53-20.89,46.53-46.57v-136.1c0-25.68-20.87-46.57-46.53-46.57h.01ZM390.43,327.91H131.74v-132.92h258.69v132.92h0Z" />
											<path d="M544.94,439.27h160.11c25.66,0,46.53-20.89,46.53-46.57V130.19c0-25.68-20.87-46.57-46.53-46.57h-160.11c-25.66,0-46.53,20.89-46.53,46.57v262.51c0,25.68,20.88,46.57,46.53,46.57h0ZM546.52,131.78h156.93v259.33h-156.93V131.78h0Z" />
											<path d="M344.07,799.73c25.66,0,46.53-20.89,46.53-46.57v-262.51c0-25.68-20.87-46.57-46.53-46.57h-160.11c-25.66,0-46.53,20.89-46.53,46.57v262.51c0,25.68,20.88,46.57,46.53,46.57h160.11ZM185.55,492.24h156.93v259.33h-156.93v-259.33h0Z" />
											<path d="M893.92,801.05h184.78c25.66,0,46.53-20.89,46.53-46.57v-234c0-25.68-20.87-46.57-46.53-46.57h-184.78c-25.66,0-46.53,20.89-46.53,46.57v234c0,25.68,20.87,46.57,46.53,46.57h0ZM895.51,522.07h181.6v230.82h-181.6v-230.82Z" />
											<path d="M711.36,807.97h-172.37c-25.66,0-46.53,20.89-46.53,46.57v262.51c0,25.68,20.87,46.57,46.53,46.57h172.37c25.66,0,46.53-20.89,46.53-46.57v-262.51c0-25.68-20.87-46.57-46.53-46.57h0ZM709.77,1115.46h-169.2v-259.33h169.2v259.33Z" />
											<path d="M896.89,420.06h178.74c25.66,0,46.53-20.89,46.53-46.57v-243.3c0-25.68-20.87-46.57-46.53-46.57h-178.74c-25.66,0-46.53,20.89-46.53,46.57v243.29c0,25.68,20.87,46.57,46.53,46.57h0ZM898.48,131.78h175.56v240.11h-175.56v-240.11Z" />
											<path d="M746.01,494.8h-250.41c-25.66,0-46.53,20.89-46.53,46.57v161.07c0,25.68,20.88,46.57,46.53,46.57h250.41c25.66,0,46.53-20.89,46.53-46.57v-161.07c0-25.68-20.87-46.57-46.53-46.57ZM744.42,700.85h-247.24v-157.89h247.24v157.89Z" />
											<path d="M1117.09,858.69h-261.87c-25.66,0-46.53,20.89-46.53,46.57v161.07c0,25.68,20.87,46.57,46.53,46.57h261.87c25.66,0,46.53-20.89,46.53-46.57v-161.07c0-25.68-20.87-46.57-46.53-46.57ZM1115.5,1064.74h-258.69v-157.89h258.69v157.89Z" />
											<path d="M392.02,858.69H130.15c-25.66,0-46.53,20.89-46.53,46.57v161.07c0,25.68,20.88,46.57,46.53,46.57h261.86c25.66,0,46.53-20.89,46.53-46.57v-161.07c0-25.68-20.87-46.57-46.53-46.57h.01ZM390.43,1064.74H131.74v-157.89h258.69v157.89Z" />
										</g>
									</svg>
								</div>
					            <span>Grid Gallery</span>
								<a href="https://folioblocks.com/blocks/grid-gallery-block/" target="_blank">Demo</a>
					        </div>
					        <div class="pb-block-item">
					            <div class="pb-block-icon">
									<svg viewBox="0 0 1247.24 1247.24" width="36" height="36" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        								<g id="Layer_1-2">
            								<g>
                								<path d="M1139.51,468.79h-590.54c-13.32,0-24.11,9.63-24.11,21.51v266.81c0,11.88,10.79,21.51,24.11,21.51h590.54c13.32,0,24.11-9.63,24.11-21.51v-266.81c0-11.88-10.79-21.51-24.11-21.51h0ZM1115.45,730.45h-542.42v-213.48h542.42v213.48Z" />
                								<path d="M102.75,778.62h327.84c10.56,0,19.13-9.63,19.13-21.51v-266.81c0-11.88-8.56-21.51-19.13-21.51H102.75c-10.56,0-19.13,9.63-19.13,21.51v266.81c0,11.88,8.56,21.51,19.13,21.51ZM131.79,516.97h269.75v213.48H131.79v-213.48h0Z" />
                								<path d="M105.36,393.45h579.62c12.01,0,21.74-9.63,21.74-21.51V105.13c0-11.88-9.73-21.51-21.74-21.51H105.36c-12.01,0-21.74,9.63-21.74,21.51v266.81c0,11.88,9.73,21.51,21.74,21.51h0ZM131.79,131.8h526.76v213.48H131.79v-213.48Z" />
                								<path d="M1141.13,83.62h-336.76c-12.42,0-22.49,9.63-22.49,21.51v266.81c0,11.88,10.07,21.51,22.49,21.51h336.76c12.42,0,22.49-9.63,22.49-21.51V105.13c0-11.88-10.07-21.51-22.49-21.51ZM1115.45,345.27h-285.41v-213.47h285.41v213.48h0Z" />
                								<path d="M568.51,853.79H101.15c-9.68,0-17.53,9.63-17.53,21.51v266.81c0,11.88,7.85,21.51,17.53,21.51h467.36c9.68,0,17.53-9.63,17.53-21.51v-266.81c0-11.88-7.85-21.51-17.53-21.51h0ZM537.87,1115.44H131.79v-213.48h406.09v213.48h-.01Z" />
               									<path d="M1146.09,853.79h-467.36c-9.68,0-17.53,9.63-17.53,21.51v266.81c0,11.88,7.85,21.51,17.53,21.51h467.36c9.68,0,17.53-9.63,17.53-21.51v-266.81c0-11.88-7.85-21.51-17.53-21.51ZM1115.45,1115.44h-406.09v-213.48h406.09v213.48Z" />
            								</g>
        								</g>
    								</svg>
								</div>
					            <span>Justified Gallery</span>
								<a href="https://folioblocks.com/blocks/justified-gallery-block/" target="_blank">Demo</a>
					        </div>
					        <div class="pb-block-item">
					            <div class="pb-block-icon">
									    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1247.24 1247.24">
  											<path d="M415 130H176c-30 0-55 25-55 55v239h55V185h239v-55zM832 130h239c30 0 55 25 55 55v239h-55V185H832v-55zM1117 832v239c0 30-25 55-55 55H832v-55h239V832h55zM415 1117H176c-30 0-55-25-55-55V832h55v239h239v46z"/>
  											<path d="M580 350 A230 230 0 1 1 579.9 350 M580 440 A140 140 0 1 0 580.1 440"/>
  											<path d="M707 707l243 243 40-40-243-243-40 40z"/>
										</svg>
								</div>
					            <span>Loupe</span>
								<span class="pb-pro-badge">NEW</span>
								<a href="https://folioblocks.com/blocks/loupe-block/" target="_blank">Demo</a>
					        </div>							
					        <div class="pb-block-item">
					            <div class="pb-block-icon">
									    <svg viewBox="0 0 1247.24 1247.24" width="36" height="36" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        									<g id="Layer_1-2">
            									<g>
                									<path d="M385.13,518.89H106.11c-12.42,0-22.49,10.07-22.49,22.49v599.74c0,12.42,10.07,22.49,22.49,22.49h279.01c12.42,0,22.49-10.07,22.49-22.49v-599.73c0-12.42-10.07-22.49-22.49-22.49h.01ZM359.45,1115.45h-227.66v-548.39h227.66v548.39h0Z" />
                									<path d="M763.12,83.62h-279.01c-12.42,0-22.49,10.07-22.49,22.49v550.95c0,12.42,10.07,22.49,22.49,22.49h279.01c12.42,0,22.49-10.07,22.49-22.49V106.11c0-12.42-10.07-22.49-22.49-22.49ZM737.45,631.38h-227.66V131.79h227.66v499.59Z" />
                									<path d="M763.12,733.1h-279.01c-12.42,0-22.49,10.07-22.49,22.49v385.53c0,12.42,10.07,22.49,22.49,22.49h279.01c12.42,0,22.49-10.07,22.49-22.49v-385.53c0-12.42-10.07-22.49-22.49-22.49ZM737.45,1115.45h-227.66v-334.18h227.66v334.18Z" />
                									<path d="M1141.13,893.67h-279.01c-12.42,0-22.49,10.07-22.49,22.49v224.97c0,12.42,10.07,22.49,22.49,22.49h279.01c12.42,0,22.49-10.07,22.49-22.49v-224.97c0-12.42-10.07-22.49-22.49-22.49h0ZM1115.45,1115.45h-227.66v-173.62h227.66v173.62Z" />
                									<path d="M1141.13,518.91h-279.01c-12.42,0-22.49,10.07-22.49,22.49v276.29c0,12.42,10.07,22.49,22.49,22.49h279.01c12.42,0,22.49-10.07,22.49-22.49v-276.29c0-12.42-10.07-22.49-22.49-22.49ZM1115.45,792.02h-227.66v-224.94h227.66v224.94Z" />
                									<path d="M1141.13,83.62h-279.01c-12.42,0-22.49,10.07-22.49,22.49v336.76c0,12.42,10.07,22.49,22.49,22.49h279.01c12.42,0,22.49-10.07,22.49-22.49V106.11c0-12.42-10.07-22.49-22.49-22.49ZM1115.45,417.2h-227.66V131.79h227.66v285.41h0Z" />
                									<path d="M385.13,83.62H106.11c-12.42,0-22.49,10.07-22.49,22.49v336.76c0,12.42,10.07,22.49,22.49,22.49h279.01c12.42,0,22.49-10.07,22.49-22.49V106.11c0-12.42-10.07-22.49-22.49-22.49h.01ZM359.45,417.2h-227.66V131.79h227.66v285.41h0Z" />
            									</g>
        									</g>
    									</svg>
								</div>
					            <span>Masonry Gallery</span>
								<a href="https://folioblocks.com/blocks/masonry-gallery-block/" target="_blank">Demo</a>
					        </div>
							<div class="pb-block-item <?php if ( ! fbks_fs()->can_use_premium_code() ) : ?>pb-pro-block<?php endif; ?>">
					            <div class="pb-block-icon">
									<svg viewBox="0 0 1247.24 1247.24" width="36" height="36" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        								<g id="Layer_1-2">
            								<g>
                								<path d="M1141.13,83.62h-599.75c-12.42,0-22.49,10.07-22.49,22.49v279.01c0,12.42,10.07,22.49,22.49,22.49h599.74c12.42,0,22.49-10.07,22.49-22.49V106.11c.01-12.42-10.06-22.49-22.48-22.49ZM1115.45,359.45h-548.39v-227.66h548.39v227.66h0Z" />
                								<path d="M1141.13,461.62h-408.62c-12.42,0-22.49,10.07-22.49,22.49v279.01c0,12.42,10.07,22.49,22.49,22.49h408.62c12.42,0,22.49-10.07,22.49-22.49v-279.01c0-12.42-10.07-22.49-22.49-22.49ZM1115.45,737.45h-357.27v-227.66h357.27v227.66Z" />
                								<path d="M1141.13,839.62h-408.62c-12.42,0-22.49,10.07-22.49,22.49v279.01c0,12.42,10.07,22.49,22.49,22.49h408.62c12.42,0,22.49-10.07,22.49-22.49v-279.01c0-12.42-10.07-22.49-22.49-22.49ZM1115.45,1115.45h-357.27v-227.66h357.27v227.66Z" />
                								<path d="M633.99,461.62H106.11c-12.42,0-22.49,10.07-22.49,22.49v657.01c0,12.42,10.07,22.49,22.49,22.49h527.88c12.42,0,22.49-10.07,22.49-22.49V484.11c0-12.42-10.07-22.49-22.49-22.49ZM608.32,1115.45H131.79V509.79h476.53v605.66Z" />
                								<path d="M106.11,407.62h336.76c12.42,0,22.49-10.07,22.49-22.49V106.11c.01-12.42-10.07-22.49-22.49-22.49H106.11c-12.42,0-22.49,10.07-22.49,22.49v279.01c0,12.42,10.07,22.49,22.49,22.49h0ZM131.79,131.79h285.41v227.66H131.79v-227.66Z" />
            								</g>
        								</g>
    								</svg>
								</div>
					            <span>Modular Gallery</span>
					            <?php if ( ! fbks_fs()->can_use_premium_code() ) : ?>
					                <span class="pb-pro-badge">PRO</span>
					            <?php endif; ?>
								<a href="https://folioblocks.com/blocks/modular-gallery-block/" target="_blank">Demo</a>
					        </div>
					        <div class="pb-block-item">
					            <div class="pb-block-icon">
									<svg viewBox="0 0 1247.24 1247.24" width="36" height="36" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        								<g id="Layer_1-2">
            								<g>
                								<path d="M563,83.62H105.05c-11.84,0-21.43,9.95-21.43,22.23v455.58c0,12.28,9.59,22.23,21.43,22.23h457.95c11.84,0,21.43-9.95,21.43-22.23V105.85c0-12.28-9.59-22.23-21.43-22.23ZM538.49,536.01H129.55V131.27h408.94v404.74h0Z" />
                								<path d="M563,663.58H105.05c-11.83,0-21.43,9.95-21.43,22.23v455.58c0,12.28,9.59,22.23,21.43,22.23h457.95c11.84,0,21.43-9.95,21.43-22.23v-455.58c0-12.28-9.59-22.23-21.43-22.23h0ZM538.49,1115.97H129.55v-404.74h408.94v404.74Z" />
                								<path d="M1142.19,83.62h-457.95c-11.84,0-21.43,9.95-21.43,22.23v455.58c0,12.28,9.59,22.23,21.43,22.23h457.95c11.83,0,21.43-9.95,21.43-22.23V105.85c0-12.28-9.6-22.23-21.43-22.23ZM1117.69,536.01h-408.94V131.27h408.94v404.74h0Z" />
                								<path d="M1142.19,663.58h-457.95c-11.84,0-21.43,9.95-21.43,22.23v455.58c0,12.28,9.59,22.23,21.43,22.23h457.95c11.83,0,21.43-9.95,21.43-22.23v-455.58c0-12.28-9.6-22.23-21.43-22.23h0ZM1117.69,1115.97h-408.94v-404.74h408.94v404.74Z" />
                								<g>
                    								<path d="M394.91,320.93l-106.53-63.99c-4.64-2.78-10.21-2.85-14.9-.19-4.71,2.67-7.52,7.49-7.52,12.9v127.97c0,5.41,2.82,10.24,7.52,12.9,2.3,1.3,4.79,1.95,7.29,1.95s5.24-.71,7.62-2.14l106.52-63.98c4.49-2.71,7.19-7.46,7.19-12.7s-2.69-10-7.19-12.71h0Z" />
                    								<path d="M852.67,410.52c2.3,1.3,4.79,1.95,7.29,1.95s5.24-.71,7.62-2.14l106.52-63.98c4.49-2.71,7.18-7.46,7.18-12.7s-2.69-10-7.18-12.71l-106.53-63.99c-4.64-2.78-10.21-2.85-14.9-.19-4.71,2.67-7.52,7.49-7.52,12.9v127.97c0,5.41,2.82,10.24,7.52,12.9h0Z" />
                    								<path d="M394.91,900.89l-106.52-63.98c-4.65-2.79-10.21-2.86-14.91-.19-4.71,2.66-7.52,7.49-7.52,12.9v127.97c0,5.41,2.81,10.23,7.52,12.9,2.3,1.3,4.79,1.95,7.3,1.95s5.23-.71,7.61-2.13l106.52-63.99c4.49-2.71,7.19-7.46,7.19-12.71s-2.69-10-7.19-12.7v-.02Z" />
                    								<path d="M974.1,900.89l-106.52-63.98c-4.65-2.79-10.21-2.86-14.91-.19-4.71,2.66-7.52,7.49-7.52,12.9v127.97c0,5.41,2.81,10.23,7.52,12.9,2.3,1.3,4.79,1.95,7.3,1.95s5.23-.71,7.61-2.13l106.52-63.99c4.49-2.71,7.18-7.46,7.18-12.71s-2.69-10-7.18-12.7v-.02Z" />
                								</g>
            								</g>
        								</g>
    								</svg>
								</div>
					            <span>Video Gallery</span>
								<a href="https://folioblocks.com/blocks/video-gallery-block/" target="_blank">Demo</a>
					        </div>
					    </div>
						<?php if ( ! fbks_fs()->can_use_premium_code() ) : ?>
							<p>
								Blocks on the free version are limited to only having controls for dealing with responsive design and a simple Lightbox.
							</p>
						<?php endif; ?>
					</div>
				</div>
				<?php if ( ! fbks_fs()->can_use_premium_code() ) : ?>
					<div class="pb-dashboard-box">
						<h2>Pro Version - Features:</h2>
						<p>
							The pro version includes all the blocks from the free version plus Modular Gallery and unlocks all the features:
						</p>
							<ul class="features">
								<li>Filterable Image & Video galleries</li>
								<li>WooCommerce Integration</li>
								<li>Add border width, border radius, & border color to images</li>
								<li>Add Drop Shadow to images</li>
								<li>Image Lightbox</li>
								<li>Show Captions in Image Lightbox</li>
								<li>Show Image Title on Hover</li>
								<li>Option to enable Image downloads</li>
                            	<li>Randomize Image order</li>
								<li>Right-click prevention</li>
								<li>Lazy Load galleries</li>
							</ul>
						<p>
							Purchase a license for FolioBlocks today and enjoy the best gallery plugin for modern WordPress and the block editor.
						</p>
						<p class="buy-button-wrapper">
    						<a class="button button-primary buy-button" href="<?php echo esc_url( admin_url( 'admin.php?page=folioblocks-settings-pricing' ) ); ?>">
        						<?php esc_html_e( 'Upgrade Today', 'folioblocks' ); ?>
    						</a>
    						<a class="button button-outline buy-button-secondary" href="<?php echo esc_url( admin_url( 'admin.php?page=folioblocks-free-vs-pro' ) ); ?>" style="margin-left:10px;">
        						<?php esc_html_e( 'Free vs Pro', 'folioblocks' ); ?>
    						</a>
						</p>
					</div>
				<?php endif; ?>
				
				<div class="pb-dashboard-box">
					<?php
					// --- Latest News from folioblocks.com ---
					// Load WordPress feed functions
					if ( ! function_exists( 'fetch_feed' ) ) {
					    require_once ABSPATH . WPINC . '/feed.php';
					}

					// Try loading cached simplified feed data
					$port_news_cached = get_transient( 'folioblocks_news_safe_cache' );
					$port_rss_items = array();
					$port_has_items = false;

					if ( $port_news_cached !== false ) {
					    // Use cached array
					    $port_rss_items = $port_news_cached;
					    $port_has_items = ! empty( $port_rss_items );
					} else {
					    // Fetch fresh feed from site
					    $port_rss = fetch_feed( 'https://folioblocks.com/feed/' );

					    if ( ! is_wp_error( $port_rss ) ) {
					        $port_maxitems  = $port_rss->get_item_quantity( 5 );
					        $port_items_raw = $port_rss->get_items( 0, $port_maxitems );

					        if ( $port_maxitems > 0 ) {
					            $port_sanitized = array();

					            foreach ( $port_items_raw as $item ) {
					                $port_title = wp_kses( $item->get_title(), array() );
					                $port_link  = esc_url( $item->get_permalink() );
					                $port_date  = date_i18n( get_option( 'date_format' ), (int) $item->get_date( 'U' ) );

					                // Build excerpt
					                $port_desc_raw = $item->get_description();
					                if ( empty( $port_desc_raw ) && method_exists( $item, 'get_content' ) ) {
					                    $port_desc_raw = $item->get_content();
					                }
					                $port_desc_stripped = wp_strip_all_tags( $port_desc_raw );
					                $port_words = explode( ' ', $port_desc_stripped );
					                if ( count( $port_words ) > 25 ) {
					                    $port_words = array_slice( $port_words, 0, 25 );
					                    $port_desc  = implode( ' ', $port_words ) . '…';
					                } else {
					                    $port_desc = $port_desc_stripped;
					                }

					                // Try enclosure
					                $port_image = '';
					                $port_enclosure = $item->get_enclosure();
					                if ( $port_enclosure && $port_enclosure->get_link() ) {
					                    $port_image = esc_url( $port_enclosure->get_link() );
					                }

					                // Try media:content
					                if ( ! $port_image ) {
					                    $port_media = $item->get_item_tags( 'http://search.yahoo.com/mrss/', 'content' );
					                    if ( ! empty( $port_media[0]['attribs']['']['url'] ) ) {
					                        $port_image = esc_url( $port_media[0]['attribs']['']['url'] );
					                    }
					                }

					                // Final fallback: first <img> in description
					                if ( ! $port_image && ! empty( $port_desc_raw ) ) {
					                    if ( preg_match( '/<img[^>]+src="([^">]+)"/i', $port_desc_raw, $match ) ) {
					                        $port_image = esc_url( $match[1] );
					                    }
					                }

					                $port_sanitized[] = array(
					                    'title' => $port_title,
					                    'link'  => $port_link,
					                    'date'  => $port_date,
					                    'desc'  => $port_desc,
					                    'image' => $port_image,
					                );
					            }

					            // Save sanitized array for 6 hours
					            set_transient( 'folioblocks_news_safe_cache', $port_sanitized, 6 * HOUR_IN_SECONDS );

					            $port_rss_items = $port_sanitized;
					            $port_has_items = true;
					        }
					    }
					}
					?>

					<h2><?php esc_html_e( 'Latest News From FolioBlocks Website:', 'folioblocks' ); ?></h2>
					<ul class="pb-latest-news">
    					<?php if ( $port_has_items ) : ?>
        					<?php foreach ( $port_rss_items as $item ) :
            					// Cached simplified news item
            					$port_title = esc_html( $item['title'] );
            					$port_link  = esc_url( $item['link'] );
            					$port_date  = esc_html( $item['date'] );
            					$port_desc  = esc_html( $item['desc'] );
            					$port_image = ! empty( $item['image'] ) ? esc_url( $item['image'] ) : '';
        					?>
            			<li class="pb-news-item">
                            <?php if ( ! empty( $port_image ) ) : ?>
                                <a href="<?php echo esc_url( $port_link ); ?>" class="pb-news-thumb" target="_blank" rel="noopener noreferrer"><img src="<?php echo esc_url( $port_image ); ?>" alt=""></a>
                            <?php endif; ?>
							<div class="pb-news-content">
                				<a href="<?php echo esc_url( $port_link ); ?>" target="_blank" rel="noopener noreferrer">
                	    			<?php echo esc_html( $port_title ); ?>
                				</a>
                				<div class="pb-news-meta"><?php echo esc_html( $port_date ); ?></div>
                					<?php if ( ! empty( $port_desc ) ) : ?>
                	    				<div class="pb-news-excerpt"><?php echo esc_html( $port_desc ); ?></div>
                					<?php endif; ?>
							</div>
            			</li>
        				<?php endforeach; ?>
    					<?php else : ?>
        				<li class="pb-news-item--empty">
            				<?php esc_html_e( 'No news items found right now. Please check back later.', 'folioblocks' ); ?>
        				</li>
    					<?php endif; ?>
					</ul>
					<p class="pb-news-view-all">
    					<a href="https://folioblocks.com/news/" target="_blank" rel="noopener noreferrer">
    	   					 <?php esc_html_e( 'View all news', 'folioblocks' ); ?> &rarr;
   		 				</a>
					</p>
				</div>
			</div>

			<div class="settings-right">
				<div class="pb-dashboard-box">
					<h2>Quick Links:</h2>
					<ul class="pb-quick-links">
						<li>
							<a href="mailto:info@folioblocks.com" target="_blank">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M125.4 128C91.5 128 64 155.5 64 189.4C64 190.3 64 191.1 64.1 192L64 192L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 192L575.9 192C575.9 191.1 576 190.3 576 189.4C576 155.5 548.5 128 514.6 128L125.4 128zM528 256.3L528 448C528 456.8 520.8 464 512 464L128 464C119.2 464 112 456.8 112 448L112 256.3L266.8 373.7C298.2 397.6 341.7 397.6 373.2 373.7L528 256.3zM112 189.4C112 182 118 176 125.4 176L514.6 176C522 176 528 182 528 189.4C528 193.6 526 197.6 522.7 200.1L344.2 335.5C329.9 346.3 310.1 346.3 295.8 335.5L117.3 200.1C114 197.6 112 193.6 112 189.4z"/></svg>
								Feedback
							</a>
						</li>
						<li>
							<a href="https://wordpress.org/support/plugin/folioblocks" target="_blank">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M320 128C241 128 175.3 185.3 162.3 260.7C171.6 257.7 181.6 256 192 256L208 256C234.5 256 256 277.5 256 304L256 400C256 426.5 234.5 448 208 448L192 448C139 448 96 405 96 352L96 288C96 164.3 196.3 64 320 64C443.7 64 544 164.3 544 288L544 456.1C544 522.4 490.2 576.1 423.9 576.1L336 576L304 576C277.5 576 256 554.5 256 528C256 501.5 277.5 480 304 480L336 480C362.5 480 384 501.5 384 528L384 528L424 528C463.8 528 496 495.8 496 456L496 435.1C481.9 443.3 465.5 447.9 448 447.9L432 447.9C405.5 447.9 384 426.4 384 399.9L384 303.9C384 277.4 405.5 255.9 432 255.9L448 255.9C458.4 255.9 468.3 257.5 477.7 260.6C464.7 185.3 399.1 127.9 320 127.9z"/></svg>
								Support
							</a>
						</li>
						<li>
							<a href="https://wordpress.org/support/plugin/folioblocks/reviews/#new-post" target="_blank">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M320.1 32C329.1 32 337.4 37.1 341.5 45.1L415 189.3L574.9 214.7C583.8 216.1 591.2 222.4 594 231C596.8 239.6 594.5 249 588.2 255.4L473.7 369.9L499 529.8C500.4 538.7 496.7 547.7 489.4 553C482.1 558.3 472.4 559.1 464.4 555L320.1 481.6L175.8 555C167.8 559.1 158.1 558.3 150.8 553C143.5 547.7 139.8 538.8 141.2 529.8L166.4 369.9L52 255.4C45.6 249 43.4 239.6 46.2 231C49 222.4 56.3 216.1 65.3 214.7L225.2 189.3L298.8 45.1C302.9 37.1 311.2 32 320.2 32zM320.1 108.8L262.3 222C258.8 228.8 252.3 233.6 244.7 234.8L119.2 254.8L209 344.7C214.4 350.1 216.9 357.8 215.7 365.4L195.9 490.9L309.2 433.3C316 429.8 324.1 429.8 331 433.3L444.3 490.9L424.5 365.4C423.3 357.8 425.8 350.1 431.2 344.7L521 254.8L395.5 234.8C387.9 233.6 381.4 228.8 377.9 222L320.1 108.8z"/></svg>
								Rate Us
							</a>
						</li>
						<li>
							<a href="https:folioblocks.com" target="_blank"> 
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M451.5 160C434.9 160 418.8 164.5 404.7 172.7C388.9 156.7 370.5 143.3 350.2 133.2C378.4 109.2 414.3 96 451.5 96C537.9 96 608 166 608 252.5C608 294 591.5 333.8 562.2 363.1L491.1 434.2C461.8 463.5 422 480 380.5 480C294.1 480 224 410 224 323.5C224 322 224 320.5 224.1 319C224.6 301.3 239.3 287.4 257 287.9C274.7 288.4 288.6 303.1 288.1 320.8C288.1 321.7 288.1 322.6 288.1 323.4C288.1 374.5 329.5 415.9 380.6 415.9C405.1 415.9 428.6 406.2 446 388.8L517.1 317.7C534.4 300.4 544.2 276.8 544.2 252.3C544.2 201.2 502.8 159.8 451.7 159.8zM307.2 237.3C305.3 236.5 303.4 235.4 301.7 234.2C289.1 227.7 274.7 224 259.6 224C235.1 224 211.6 233.7 194.2 251.1L123.1 322.2C105.8 339.5 96 363.1 96 387.6C96 438.7 137.4 480.1 188.5 480.1C205 480.1 221.1 475.7 235.2 467.5C251 483.5 269.4 496.9 289.8 507C261.6 530.9 225.8 544.2 188.5 544.2C102.1 544.2 32 474.2 32 387.7C32 346.2 48.5 306.4 77.8 277.1L148.9 206C178.2 176.7 218 160.2 259.5 160.2C346.1 160.2 416 230.8 416 317.1C416 318.4 416 319.7 416 321C415.6 338.7 400.9 352.6 383.2 352.2C365.5 351.8 351.6 337.1 352 319.4C352 318.6 352 317.9 352 317.1C352 283.4 334 253.8 307.2 237.5z"/></svg>
								Website
							</a>
						</li>
						<li>
							<a href="https://bsky.app/profile/folioblocks.com" target="_blank">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M439.8 358.7C436.5 358.3 433.1 357.9 429.8 357.4C433.2 357.8 436.5 358.3 439.8 358.7zM320 291.1C293.9 240.4 222.9 145.9 156.9 99.3C93.6 54.6 69.5 62.3 53.6 69.5C35.3 77.8 32 105.9 32 122.4C32 138.9 41.1 258 47 277.9C66.5 343.6 136.1 365.8 200.2 358.6C203.5 358.1 206.8 357.7 210.2 357.2C206.9 357.7 203.6 358.2 200.2 358.6C106.3 372.6 22.9 406.8 132.3 528.5C252.6 653.1 297.1 501.8 320 425.1C342.9 501.8 369.2 647.6 505.6 528.5C608 425.1 533.7 372.5 439.8 358.6C436.5 358.2 433.1 357.8 429.8 357.3C433.2 357.7 436.5 358.2 439.8 358.6C503.9 365.7 573.4 343.5 593 277.9C598.9 258 608 139 608 122.4C608 105.8 604.7 77.7 586.4 69.5C570.6 62.4 546.4 54.6 483.2 99.3C417.1 145.9 346.1 240.4 320 291.1z"/></svg>
								BlueSky
							</a>
						</li>
						<li>
							<a href="https://www.youtube.com/@FolioBlocks" target="_blank">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M581.7 188.1C575.5 164.4 556.9 145.8 533.4 139.5C490.9 128 320.1 128 320.1 128C320.1 128 149.3 128 106.7 139.5C83.2 145.8 64.7 164.4 58.4 188.1C47 231 47 320.4 47 320.4C47 320.4 47 409.8 58.4 452.7C64.7 476.3 83.2 494.2 106.7 500.5C149.3 512 320.1 512 320.1 512C320.1 512 490.9 512 533.5 500.5C557 494.2 575.5 476.3 581.8 452.7C593.2 409.8 593.2 320.4 593.2 320.4C593.2 320.4 593.2 231 581.8 188.1zM264.2 401.6L264.2 239.2L406.9 320.4L264.2 401.6z"/></svg>
								YouTube
							</a>
						</li>
						<li>
							<a href="https://www.facebook.com/folioblocks/" target="_blank">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 440 146.7 540.8 258.2 568.5L258.2 398.2L205.4 398.2L205.4 320L258.2 320L258.2 286.3C258.2 199.2 297.6 158.8 383.2 158.8C399.4 158.8 427.4 162 438.9 165.2L438.9 236C432.9 235.4 422.4 235 409.3 235C367.3 235 351.1 250.9 351.1 292.2L351.1 320L434.7 320L420.3 398.2L351 398.2L351 574.1C477.8 558.8 576 450.9 576 320z"/></svg>
								Facebook
							</a>
						</li>
					</ul>
				</div>
				<div class="pb-dashboard-box">
				<h2>Changelog:</h2>
				<?php
				$readme_path = plugin_dir_path( __DIR__ ) . '../readme.txt';

				if ( file_exists( $readme_path ) ) {
				    $readme = file_get_contents( $readme_path );
				    preg_match( '/==\s*Changelog\s*==(.+)/s', $readme, $matches );
				    if ( isset( $matches[1] ) ) {
				        $changelog = trim( $matches[1] );
				        $entries = preg_split( '/^=\s*\d[\d\.]*\s*=/m', $changelog, -1, PREG_SPLIT_NO_EMPTY );

				        // Extract headings separately
				        preg_match_all( '/^=\s*(\d[\d\.]*)\s*=/m', $changelog, $version_matches );
				        $versions = $version_matches[1];

				        echo '<ul class="pb-changelog">';

				        for ( $i = 0; $i < min(5, count($entries)); $i++ ) {
				            $version = isset( $versions[$i] ) ? $versions[$i] : 'Version';
				            
				            $lines = array_filter( array_map( 'trim', explode( "\n", trim($entries[$i]) ) ) );

				            echo '<li>';
				            echo '<strong>' . esc_html( $version ) . '</strong><br/>';

				            foreach ( $lines as $line ) {
				                // prepend dash and remove leading asterisks/whitespace
				                $clean = ltrim( $line, "* \t\n\r\0\x0B" );
				                echo '- ' . esc_html( $clean ) . '<br/>';
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
				<a href="https://folioblocks.com/changelog/" target="_blank">
				    <?php esc_html_e( 'View Full Changelog', 'folioblocks' ); ?> &rarr;
				</a>
			</div>
			</div>
		</div>
	</div>
	<?php
}
?>