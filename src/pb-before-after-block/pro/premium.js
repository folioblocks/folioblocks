/**
 * Before & After Block
 * Premium JS
 **/
import { __ } from '@wordpress/i18n';
import { RangeControl, ToggleControl, SelectControl } from '@wordpress/components';
import { PanelColorSettings } from '@wordpress/block-editor';
import { addFilter } from '@wordpress/hooks';

addFilter(
	'portfolioBlocks.beforeAfter.dragHandlePosition',
	'pb-gallery/before-after-drag-handle-position',
	(defaultContent, props) => {
		const { setAttributes, attributes } = props;

		return (
			<RangeControl
				label={__('Drag Handle Starting Position (%)', 'pb-gallery')}
				value={attributes.startingPosition}
				onChange={(value) => setAttributes({ startingPosition: value })}
				min={0}
				max={100}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				help={__('Set starting position for slider drag handle.', 'pb-gallery')}
			/>
		);
	}
);
addFilter(
	'portfolioBlocks.beforeAfter.showLabelsToggle',
	'pb-gallery/before-after-premium-labels',
	(defaultContent, props) => {
		const { setAttributes, attributes } = props;
		const { showLabels, labelPosition, sliderOrientation } = attributes;

		return (
			<>
				<ToggleControl
					label={__('Show Before & After Labels', 'pb-gallery')}
					checked={showLabels}
					onChange={(value) => setAttributes({ showLabels: value })}
					help={__('Display Before & After labels.', 'pb-gallery')}
					__nextHasNoMarginBottom
				/>
				{
					showLabels && (
						<SelectControl
							label={__('Label Position', 'pb-gallery')}
							value={labelPosition}
							options={
								sliderOrientation === 'vertical'
									? [
										{ label: __('Left', 'pb-gallery'), value: 'left' },
										{ label: __('Center', 'pb-gallery'), value: 'center' },
										{ label: __('Right', 'pb-gallery'), value: 'right' },
									]
									: [
										{ label: __('Top', 'pb-gallery'), value: 'top' },
										{ label: __('Center', 'pb-gallery'), value: 'center' },
										{ label: __('Bottom', 'pb-gallery'), value: 'bottom' },
									]
							}
							onChange={(value) => setAttributes({ labelPosition: value })}
							help={__('Set Before & After label position.', 'pb-gallery')}
							__nextHasNoMarginBottom
							__next40pxDefaultSize
						/>
					)
				}
			</>
		);
	}
);
addFilter(
  'portfolioBlocks.beforeAfter.renderBeforeLabel',
  'pb-gallery/premium-render-before-label',
  (content, { attributes }) => {
    const { showLabels, labelPosition, labelTextColor, labelBackgroundColor } = attributes;
    if (!showLabels) return content;

    return (
      <>
        {content}
        <div
          className={`pb-label pb-before-label label-${labelPosition}`}
          style={{
            color: labelTextColor,
            backgroundColor: labelBackgroundColor,
          }}
        >
          {__('Before', 'pb-gallery')}
        </div>
      </>
    );
  }
);
addFilter(
  'portfolioBlocks.beforeAfter.renderAfterLabel',
  'pb-gallery/premium-render-after-label',
  (content, { attributes }) => {
    const { showLabels, labelPosition, labelTextColor, labelBackgroundColor } = attributes;
    if (!showLabels) return content;

    return (
      <>
        {content}
        <div
          className={`pb-label pb-after-label label-${labelPosition}`}
          style={{
            color: labelTextColor,
            backgroundColor: labelBackgroundColor,
          }}
        >
          {__('After', 'pb-gallery')}
        </div>
      </>
    );
  }
);
addFilter(
	'portfolioBlocks.beforeAfter.disableRightClickToggle',
	'pb-gallery/before-after-premium-disable-right-click',
	(defaultContent, props) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={__('Disable Right-Click on Page', 'pb-gallery')}
				help={__('Prevents visitors from right-clicking.', 'pb-gallery')}
				__nextHasNoMarginBottom
				checked={!!attributes.disableRightClick}
				onChange={(value) => setAttributes({ disableRightClick: value })}
			/>
		);
	}
);
addFilter(
	'portfolioBlocks.beforeAfter.lazyLoadToggle',
	'pb-gallery/before-after-premium-lazy-load',
	(defaultContent, props) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={__('Enable Lazy Load of Images', 'pb-gallery')}
				help={__('Enables lazy loading of gallery images.', 'pb-gallery')}
				__nextHasNoMarginBottom
				checked={!!attributes.lazyLoad}
				onChange={(value) => setAttributes({ lazyLoad: value })}
			/>
		);
	}
);
addFilter(
	'portfolioBlocks.beforeAfter.colorSettingsPanel',
	'pb-gallery/before-after-premium-colors',
	(defaultContent, props) => {
		const { setAttributes, attributes } = props;
		const {
			sliderColor,
			labelTextColor,
			labelBackgroundColor,
		} = attributes;

		return (
			<PanelColorSettings
				title={__('Before & After Block Styles', 'pb-gallery')}
				initialOpen={true}
				colorSettings={[
					{
						label: __('Slider Handle & Line Color', 'pb-gallery'),
						value: sliderColor,
						onChange: (value) => setAttributes({ sliderColor: value }),
					},
					{
						label: __('Label Text Color', 'pb-gallery'),
						value: labelTextColor,
						onChange: (value) => setAttributes({ labelTextColor: value }),
					},
					{
						label: __('Label Background Color', 'pb-gallery'),
						value: labelBackgroundColor,
						onChange: (value) => setAttributes({ labelBackgroundColor: value }),
					},
				]}
			/>
		);
	}
);