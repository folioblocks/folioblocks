<?php
    if ( ! defined( 'ABSPATH' ) ) exit;
    function fbks_render_free_pro_page() {
?>
<div class="pb-wrap">
	<div class="pb-settings-header">
		<img src="<?php echo esc_url( plugin_dir_url( __DIR__ ) . '/icons/pb-brand-icon.svg' ); ?>" alt="FolioBlocks" class="pb-settings-logo" />
		<h1><?php esc_html_e( 'FolioBlocks', 'folioblocks' ); ?> - Free Vs Pro</h1>
	</div>

	<div class="settings-container">
        <div class="settings-left">
			<div class="pb-dashboard-box">
                <h2>Compare Features</h2>
                <p>Compare the features to find the best option for your website.</p>

                <table class="pb-comparison-table">
                    <thead>
                        <tr>
                            <th>Background Video Block</th>
                            <th>Free</th>
                            <th>Pro</th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr><td>Support for Self-Hosted &amp; Vimeo Videos</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Place any blocks on top of the video (headings, text, buttons, galleries)</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Adjustable video position (X / Y) </td><td>✅</td><td>✅</td></tr>
                    <tr><td>Adjustable video position (X / Y) for Tablet & Mobile </td><td>❌</td><td>✅</td></tr>
                    <tr><td>Loop Video</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Disable Video on Mobile</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Set Backup Poster Image </td><td>✅</td><td>✅</td></tr>
                    <tr><td>Disable Right-Click</td><td>❌</td><td>✅</td></tr>
                    <tr><td>Set Custom Block Height on Desktop</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Set Custom Block Height on Tablet & Mobile</td><td>❌</td><td>✅</td></tr>
                    </tbody>
                </table>

                <table class="pb-comparison-table">
                    <thead>
                        <tr>
                            <th>Before &amp; After Block</th>
                            <th>Free</th>
                            <th>Pro</th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr><td>Set Image Resolution</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Responsive Design works on Desktop, Tablet, and Mobile Ready</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Custom Slider Orientation</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Custom Drag Handle Starting Position</td><td>❌</td><td>✅</td></tr>
                    <tr><td>Show Before &amp; After Labels</td><td>❌</td><td>✅</td></tr>
                    <tr><td>Before/After Label Position</td><td>❌</td><td>✅</td></tr>
                    <tr><td>Disable Right-Click</td><td>❌</td><td>✅</td></tr>
                    <tr><td>Custom Lazy Load</td><td>❌</td><td>✅</td></tr>
                    <tr><td>Custom Border &amp; Border Radius</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Drop Shadow Effect on Images</td><td>✅</td><td>✅</td></tr>
                    </tbody>
                </table>

                <table class="pb-comparison-table">
                    <thead>
                        <tr>
                            <th>Carousel Gallery Block</th>
                            <th>Free</th>
                            <th>Pro</th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr><td>Set Image Resolution on Slides</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Responsive Design works on Desktop, Tablet, and Mobile</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Enable Image Downloads</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Link to store products with WooCommerce Integration</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Disable Right-Click</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Custom Lazy Load</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Autoplay Carousel</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Carousel Playback Controls</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Lightbox</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Show Caption in Lightbox</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Show Title in Overlay on Hover</td><td>❌</td><td>✅</td></tr>
                    <tr><td>Custom Hover Overlays (Blur, Fade, Gradient, Chip, & Color)</td><td>❌</td><td>✅</td></tr>
                    <tr><td>Carousel Playback Control Styles</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Custom Border &amp; Border Radius on Slides</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Drop Shadow Effect on Images</td><td class="unavailable">❌</td><td>✅</td></tr>
                    </tbody>
                </table>

                <table class="pb-comparison-table">
                    <thead>
                        <tr>
                            <th>Filmstrip Gallery Block</th>
                            <th>Free</th>
                            <th>Pro</th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr><td>Set Image Resolution on Slides</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Responsive Design works on Desktop, Tablet, and Mobile</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Multiple Layout Options</td><td class="unavailable">✅</td><td>✅</td></tr>
                    <tr><td>Light Mode & Dark Mode Styles</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Enable Image Downloads</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Link to store products with WooCommerce Integration</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Disable Right-Click</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Custom Lazy Load</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Autoplay Gallery</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Full-Screen Mode</td><td>❌</td><td>✅</td></tr>
                    <tr><td>Show Title in Overlay on Hover</td><td>❌</td><td>✅</td></tr>
                    </tbody>
                </table>

                <table class="pb-comparison-table">
                    <thead>
                        <tr>
                            <th>Grid Gallery Block</th>
                            <th>Free</th>
                            <th>Pro</th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr><td>Set Image Resolution</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Responsive Design works on Desktop, Tablet, and Mobile Ready</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Set Column Amount (Desktop/Tablet/Mobile)</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Drag &amp; Drop Image Re-Ordering</td><td>✅</td><td>✅</td></tr>
                    <tr><td>List View Thumbnails</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Randomize Image Order</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Enable Image Downloads</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Link to store products with WooCommerce Integration</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Disable Right-Click</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Custom Lazy Load</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Lightbox</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Show Caption in Lightbox</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Show Title in Overlay on Hover</td><td>❌</td><td>✅</td></tr>
                    <tr><td>Custom Hover Overlays (Blur, Fade, Gradient, Chip, & Color)</td><td>❌</td><td>✅</td></tr>
                    <tr><td>Gallery Image Filtering</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Custom Typography & Styles on Gallery Filter Bar</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Custom Border &amp; Border Radius</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Drop Shadow Effect on Images</td><td class="unavailable">❌</td><td>✅</td></tr>
                    </tbody>
                </table>

                <table class="pb-comparison-table">
                    <thead>
                        <tr>
                            <th>Image Block</th>
                            <th>Free</th>
                            <th>Pro</th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr><td>Set Image Resolution</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Responsive Design works on Desktop, Tablet, and Mobile Ready</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Enable Image Downloads</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Link to store products with WooCommerce Integration</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Disable Right-Click</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Custom Lazy Load</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Lightbox</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Show Caption in Lightbox</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Show Title in Overlay on Hover</td><td>❌</td><td>✅</td></tr>
                    <tr><td>Custom Hover Overlays (Blur, Fade, Gradient, Chip, & Color)</td><td>❌</td><td>✅</td></tr>
                    <tr><td>Custom Border &amp; Border Radius</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Drop Shadow Effect on Images</td><td class="unavailable">❌</td><td>✅</td></tr>
                    </tbody>
                </table>

                <table class="pb-comparison-table">
                    <thead>
                        <tr>
                            <th>Justified Gallery Block</th>
                            <th>Free</th>
                            <th>Pro</th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr><td>Set Image Resolution</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Responsive Design works on Desktop, Tablet, and Mobile Ready</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Set Row Height</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Drag &amp; Drop Image Re-Ordering</td><td>✅</td><td>✅</td></tr>
                    <tr><td>List View Thumbnails</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Remove Image Gap</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Randomize Image Order</td><td>❌</td><td>✅</td></tr>
                    <tr><td>Enable Image Downloads</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Link to store products with WooCommerce Integration</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Disable Right-Click</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Custom Lazy Load</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Image Lightbox</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Show Caption in Lightbox</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Show Title in Overlay on Hover</td><td>❌</td><td>✅</td></tr>
                    <tr><td>Custom Hover Overlays (Blur, Fade, Gradient, Chip, & Color)</td><td>❌</td><td>✅</td></tr>
                    <tr><td>Gallery Image Filtering</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Custom Typography & Styles on Gallery Filter Bar</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Custom Border &amp; Border Radius</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Drop Shadow Effect on Images</td><td class="unavailable">❌</td><td>✅</td></tr>
                    </tbody>
                </table>

                <table class="pb-comparison-table">
                    <thead>
                        <tr>
                            <th>Loupe Block</th>
                            <th>Free</th>
                            <th>Pro</th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr><td>Set Image Resolution</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Responsive Design works on Desktop, Tablet, and Mobile Ready</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Set Magnification Strength</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Set Loupe Shape</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Set Loupe Theme (Light & Dark)</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Disable Right-Click</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Custom Border &amp; Border Radius</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Drop Shadow Effect on block</td><td class="unavailable">❌</td><td>✅</td></tr>
                    </tbody>
                </table>

                <table class="pb-comparison-table">
                    <thead>
                        <tr>
                            <th>Masonry Gallery Block</th>
                            <th>Free</th>
                            <th>Pro</th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr><td>Set Image Resolution</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Responsive Design works on Desktop, Tablet, and Mobile Ready</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Set Column Amount (Desktop/Tablet/Mobile)</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Drag &amp; Drop Image Re-Ordering</td><td>✅</td><td>✅</td></tr>
                    <tr><td>List View Thumbnails</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Remove Image Gap</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Randomize Image Order</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Enable Image Downloads</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Link to store products with WooCommerce Integration</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Disable Right-Click</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Custom Lazy Load</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Image Lightbox</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Show Caption in Lightbox</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Show Title in Overlay on Hover</td><td>❌</td><td>✅</td></tr>
                    <tr><td>Custom Hover Overlays (Blur, Fade, Gradient, Chip, & Color)</td><td>❌</td><td>✅</td></tr>
                    <tr><td>Gallery Image Filtering</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Custom Typography & Styles on Gallery Filter Bar</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Custom Border &amp; Border Radius</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Drop Shadow Effect on Images</td><td class="unavailable">❌</td><td>✅</td></tr>
                    </tbody>
                </table>

                <table class="pb-comparison-table">
                    <thead>
                        <tr>
                            <th>Modular Gallery Block (Pro Only)</th>
                            <th>Free</th>
                            <th>Pro</th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr><td>Set Image Resolution</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Responsive Design works on Desktop, Tablet, and Mobile Ready</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Drag &amp; Drop Image Re-Ordering</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>List View Thumbnails</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Remove Image Gap</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Randomize Image Order</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Enable Image Downloads</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Link to store products with WooCommerce Integration</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Disable Right-Click</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Custom Lazy Load</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Image Lightbox</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Show Caption in Lightbox</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Show Title in Overlay on Hover</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Custom Hover Overlays (Blur, Fade, Gradient, Chip, & Color)</td><td>❌</td><td>✅</td></tr>
                    <tr><td>Custom Border &amp; Border Radius on Slides</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Drop Shadow Effect on Images</td><td class="unavailable">❌</td><td>✅</td></tr>
                    </tbody>
                </table>

                <table class="pb-comparison-table">
                    <thead>
                        <tr>
                            <th>Video Block</th>
                            <th>Free</th>
                            <th>Pro</th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr><td>Support for Self-Hosted, YouTube, &amp; Vimeo Videos</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Set Thumbnail Resolution &amp; Aspect Ratio</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Responsive Design works on Desktop, Tablet, and Mobile Ready</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Link to store products with WooCommerce Integration</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Disable Right-Click</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Lazy Load Images</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Hide/Display Video Title Overlay</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Hide/Display Video Play Button Overlay</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Disable Lightbox in Editor</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Show video description in Lightbox</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Custom Border &amp; Border Radius on Slides</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Drop Shadow Effect on Video Thumbnails</td><td class="unavailable">❌</td><td>✅</td></tr>
                    </tbody>
                </table>

                <table class="pb-comparison-table">
                    <thead>
                        <tr>
                            <th>Video Gallery Block</th>
                            <th>Free</th>
                            <th>Pro</th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr><td>Support for Self-Hosted, YouTube, &amp; Vimeo Videos</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Set Thumbnail Resolution &amp; Aspect Ratio</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Responsive Design works on Desktop, Tablet, and Mobile Ready</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Drag &amp; Drop Video Re-Ordering</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Remove Gap</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Link to store products with WooCommerce Integration</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Disable Right-Click</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Lazy Load Images</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Hide/Display Video Title Overlay</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Hide/Display Video Play Button Overlay</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Disable Lightbox in Editor</td><td>✅</td><td>✅</td></tr>
                    <tr><td>Show video description in Lightbox</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Video Gallery Filtering</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Custom Typography & Styles on Gallery Filter Bar</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Custom Border &amp; Border Radius on Slides</td><td class="unavailable">❌</td><td>✅</td></tr>
                    <tr><td>Drop Shadow Effect on Video Thumbnails</td><td class="unavailable">❌</td><td>✅</td></tr>
                    </tbody>
                </table>

            </div>
        </div>
        <div class="settings-right">
            <div class="pb-dashboard-box">
                <h2>Unlock Pro</h2>
                <p>Upgrade to pro to unlock all of these features.</p>
                <p class="buy-button-wrapper">
    				<a class="button button-primary buy-button" href="https://folioblocks.com/folioblocks-pricing/?utm_source=folioblocks-plugin&utm_medium=free-vs-pro-page&utm_campaign=upgrade" target="_blank" rel="noopener noreferrer">
        				<?php esc_html_e( 'Upgrade Today', 'folioblocks' ); ?>
    				</a>
				</p>
            </div>
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

<?php }