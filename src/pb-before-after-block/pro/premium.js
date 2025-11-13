/**
 * Before & After Block
 * Premium JS
 **/
import { __ } from '@wordpress/i18n';
import { RangeControl, ToggleControl, SelectControl } from '@wordpress/components';
import { PanelColorSettings } from '@wordpress/block-editor';
import { addFilter } from '@wordpress/hooks';

addFilter(
	'folioBlocks.beforeAfter.dragHandlePosition',
	'folioblocks/before-after-drag-handle-position',
	(defaultContent, props) => {
		const { setAttributes, attributes } = props;

		return (
			<RangeControl
				label={__('Drag Handle Starting Position (%)', 'folioblocks')}
				value={attributes.startingPosition}
				onChange={(value) => setAttributes({ startingPosition: value })}
				min={0}
				max={100}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				help={__('Set starting position for slider drag handle.', 'folioblocks')}
			/>
		);
	}
);
addFilter(
	'folioBlocks.beforeAfter.showLabelsToggle',
	'folioblocks/before-after-premium-labels',
	(defaultContent, props) => {
		const { setAttributes, attributes } = props;
		const { showLabels, labelPosition, sliderOrientation } = attributes;

		return (
			<>
				<ToggleControl
					label={__('Show Before & After Labels', 'folioblocks')}
					checked={showLabels}
					onChange={(value) => setAttributes({ showLabels: value })}
					help={__('Display Before & After labels.', 'folioblocks')}
					__nextHasNoMarginBottom
				/>
				{
					showLabels && (
						<SelectControl
							label={__('Label Position', 'folioblocks')}
							value={labelPosition}
							options={
								sliderOrientation === 'vertical'
									? [
										{ label: __('Left', 'folioblocks'), value: 'left' },
										{ label: __('Center', 'folioblocks'), value: 'center' },
										{ label: __('Right', 'folioblocks'), value: 'right' },
									]
									: [
										{ label: __('Top', 'folioblocks'), value: 'top' },
										{ label: __('Center', 'folioblocks'), value: 'center' },
										{ label: __('Bottom', 'folioblocks'), value: 'bottom' },
									]
							}
							onChange={(value) => setAttributes({ labelPosition: value })}
							help={__('Set Before & After label position.', 'folioblocks')}
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
  'folioBlocks.beforeAfter.renderBeforeLabel',
  'folioblocks/premium-render-before-label',
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
          {__('Before', 'folioblocks')}
        </div>
      </>
    );
  }
);
addFilter(
  'folioBlocks.beforeAfter.renderAfterLabel',
  'folioblocks/premium-render-after-label',
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
          {__('After', 'folioblocks')}
        </div>
      </>
    );
  }
);
addFilter(
	'folioBlocks.beforeAfter.disableRightClickToggle',
	'folioblocks/before-after-premium-disable-right-click',
	(defaultContent, props) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={__('Disable Right-Click on Page', 'folioblocks')}
				help={__('Prevents visitors from right-clicking.', 'folioblocks')}
				__nextHasNoMarginBottom
				checked={!!attributes.disableRightClick}
				onChange={(value) => setAttributes({ disableRightClick: value })}
			/>
		);
	}
);
addFilter(
	'folioBlocks.beforeAfter.lazyLoadToggle',
	'folioblocks/before-after-premium-lazy-load',
	(defaultContent, props) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={__('Enable Lazy Load of Images', 'folioblocks')}
				help={__('Enables lazy loading of gallery images.', 'folioblocks')}
				__nextHasNoMarginBottom
				checked={!!attributes.lazyLoad}
				onChange={(value) => setAttributes({ lazyLoad: value })}
			/>
		);
	}
);
addFilter(
	'folioBlocks.beforeAfter.colorSettingsPanel',
	'folioblocks/before-after-premium-colors',
	(defaultContent, props) => {
		const { setAttributes, attributes } = props;
		const {
			sliderColor,
			labelTextColor,
			labelBackgroundColor,
		} = attributes;

		return (
			<PanelColorSettings
				title={__('Before & After Block Styles', 'folioblocks')}
				initialOpen={true}
				colorSettings={[
					{
						label: __('Slider Handle & Line Color', 'folioblocks'),
						value: sliderColor,
						onChange: (value) => setAttributes({ sliderColor: value }),
					},
					{
						label: __('Label Text Color', 'folioblocks'),
						value: labelTextColor,
						onChange: (value) => setAttributes({ labelTextColor: value }),
					},
					{
						label: __('Label Background Color', 'folioblocks'),
						value: labelBackgroundColor,
						onChange: (value) => setAttributes({ labelBackgroundColor: value }),
					},
				]}
			/>
		);
	}
);