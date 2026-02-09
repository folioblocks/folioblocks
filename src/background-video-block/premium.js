/**
 * Background Video Block
 * Premium JS
 **/
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { ToggleControl } from '@wordpress/components';
import ResponsiveHeightRangeControl from '../pb-helpers/ResponsiveHeightRangeControl';

addFilter(
	'folioBlocks.backgroundVideoBlock.sizingFocalControls',
	'folioblocks/background-video-sizing-focal-premium',
	(_original, { attributes, setAttributes }) => (
		<>
			<ResponsiveHeightRangeControl
				label={__('Height', 'folioblocks')}
				heightDesktop={attributes.heightDesktop}
				heightTablet={attributes.heightTablet}
				heightMobile={attributes.heightMobile}
				onChange={(next) => setAttributes(next)}
				min={1}
				maxDesktop={100}
				unitLabel="vh"
			/>

			<ResponsiveHeightRangeControl
				label={__('Focal Point X (Left - Right)', 'folioblocks')}
				heightDesktop={attributes.objectPositionXDesktop}
				heightTablet={attributes.objectPositionXTablet}
				heightMobile={attributes.objectPositionXMobile}
				onChange={(next) => setAttributes({
					objectPositionXDesktop: next.heightDesktop,
					objectPositionXTablet: next.heightTablet,
					objectPositionXMobile: next.heightMobile,
				})}
				min={0}
				maxDesktop={100}
				step={1}
				unitLabel="%"
				lockToDesktop={false}
				helpText={__('Adjust the horizontal focal point per device.', 'folioblocks')}
			/>

			<ResponsiveHeightRangeControl
				label={__('Focal Point Y (Up - Down)', 'folioblocks')}
				heightDesktop={attributes.objectPositionYDesktop}
				heightTablet={attributes.objectPositionYTablet}
				heightMobile={attributes.objectPositionYMobile}
				onChange={(next) => setAttributes({
					objectPositionYDesktop: next.heightDesktop,
					objectPositionYTablet: next.heightTablet,
					objectPositionYMobile: next.heightMobile,
				})}
				min={0}
				maxDesktop={100}
				step={1}
				unitLabel="%"
				lockToDesktop={false}
				helpText={__('Adjust the vertical focal point per device.', 'folioblocks')}
			/>
		</>
	),
);
addFilter(
	"folioBlocks.backgroundVideoBlock.disableRightClickToggle",
	"folioblocks/background-video-block-disable-right-click",
	(defaultContent, props) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={__("Disable Right-Click on Page", "folioblocks")}
				help={__("Prevents visitors from right-clicking.", "folioblocks")}
				__nextHasNoMarginBottom
				checked={!!attributes.disableRightClick}
				onChange={(value) => setAttributes({ disableRightClick: value })}
			/>
		);
	},
);
