import { __ } from '@wordpress/i18n';
import { RangeControl, ToggleControl } from '@wordpress/components';
import { PanelColorSettings } from '@wordpress/block-editor';
import { addFilter } from '@wordpress/hooks';

addFilter(
	'portfolioBlocks.beforeAfter.dragHandlePosition',
	'portfolio-blocks/before-after-drag-handle-position',
	(defaultContent, props) => {
		const { setAttributes, attributes } = props;

		return (
			<RangeControl
				label={__('Drag Handle Starting Position (%)', 'portfolio-blocks')}
				value={attributes.startingPosition}
				onChange={(value) => setAttributes({ startingPosition: value })}
				min={0}
				max={100}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				help={__('Set starting position for slider drag handle.', 'portfolio-blocks')}
			/>
		);
	}
);
addFilter(
	'portfolioBlocks.beforeAfter.showLabelsToggle',
	'portfolio-blocks/before-after-premium-labels',
	(defaultContent, props) => {
		const { setAttributes, attributes } = props;
		const { showLabels } = attributes;

		return (
			<ToggleControl
				label={__('Show Before & After Labels', 'portfolio-blocks')}
				checked={showLabels}
				onChange={(value) => setAttributes({ showLabels: value })}
				help={__('Display Before & After labels.', 'portfolio-blocks')}
				__nextHasNoMarginBottom
			/>
		);
	}
);
addFilter(
	'portfolioBlocks.beforeAfter.disableRightClickToggle',
	'portfolio-blocks/before-after-premium-disable-right-click',
	(defaultContent, props) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={__('Disable Right-Click on Page', 'portfolio-blocks')}
				help={__('Prevents visitors from right-clicking.', 'portfolio-blocks')}
				__nextHasNoMarginBottom
				checked={!!attributes.disableRightClick}
				onChange={(value) => setAttributes({ disableRightClick: value })}
			/>
		);
	}
);
addFilter(
	'portfolioBlocks.beforeAfter.lazyLoadToggle',
	'portfolio-blocks/before-after-premium-lazy-load',
	(defaultContent, props) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={__('Enable Lazy Load of Images', 'portfolio-blocks')}
				help={__('Enables lazy loading of gallery images.', 'portfolio-blocks')}
				__nextHasNoMarginBottom
				checked={!!attributes.lazyLoad}
				onChange={(value) => setAttributes({ lazyLoad: value })}
			/>
		);
	}
);
addFilter(
	'portfolioBlocks.beforeAfter.colorSettingsPanel',
	'portfolio-blocks/before-after-premium-colors',
	(defaultContent, props) => {
		const { setAttributes, attributes } = props;
		const {
			sliderColor,
			labelTextColor,
			labelBackgroundColor,
		} = attributes;

		return (
			<PanelColorSettings
				title={__('Before & After Block Styles', 'portfolio-blocks')}
				initialOpen={true}
				colorSettings={[
					{
						label: __('Slider Handle & Line Color', 'portfolio-blocks'),
						value: sliderColor,
						onChange: (value) => setAttributes({ sliderColor: value }),
					},
					{
						label: __('Label Text Color', 'portfolio-blocks'),
						value: labelTextColor,
						onChange: (value) => setAttributes({ labelTextColor: value }),
					},
					{
						label: __('Label Background Color', 'portfolio-blocks'),
						value: labelBackgroundColor,
						onChange: (value) => setAttributes({ labelBackgroundColor: value }),
					},
				]}
			/>
		);
	}
);
