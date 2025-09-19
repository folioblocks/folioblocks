import { __ } from '@wordpress/i18n';
import { ToggleControl } from '@wordpress/components';
import { PanelColorSettings } from '@wordpress/block-editor';
import { addFilter } from '@wordpress/hooks';

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
