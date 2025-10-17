import { __ } from '@wordpress/i18n';
import { ToggleControl, BaseControl, ColorPalette, RangeControl, SelectControl } from '@wordpress/components';
import { createElement } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';

addFilter(
    'portfolioBlocks.videoGallery.disableRightClickToggle',
    'portfolio-blocks/video-gallery-premium-disable-right-click',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return createElement(ToggleControl, {
            label: __('Disable Right-Click on Page', 'portfolio-blocks'),
            help: __('Prevents visitors from right-clicking.', 'portfolio-blocks'),
            __nextHasNoMarginBottom: true,
            checked: !!attributes.disableRightClick,
            onChange: (value) => setAttributes({ disableRightClick: value })
        });
    }
);
addFilter(
    'portfolioBlocks.videoGallery.lazyLoadToggle',
    'portfolio-blocks/video-gallery-premium-lazy-load',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return createElement(ToggleControl, {
            label: __('Enable Lazy Load of Images', 'portfolio-blocks'),
            help: __('Enables lazy loading of Video Gallery thumbnails.', 'portfolio-blocks'),
            __nextHasNoMarginBottom: true,
            checked: !!attributes.lazyLoad,
            onChange: (value) => setAttributes({ lazyLoad: value })
        });
    }
);

addFilter(
    'portfolioBlocks.videoGallery.lightboxLayout',
    'portfolio-blocks/video-gallery-premium-lightbox-layout',
    (defaultContent, props) => {
        const { setAttributes, attributes } = props;

        return (
            <SelectControl
                label={__('Lightbox Layout', 'portfolio-blocks')}
                value={attributes.lightboxLayout}
                options={[
                    { label: __('Video Only', 'portfolio-blocks'), value: 'video-only' },
                    { label: __('Video + Info Split', 'portfolio-blocks'), value: 'split' },
                ]}
                onChange={(value) => setAttributes({ lightboxLayout: value })}
                __nextHasNoMarginBottom
                __next40pxDefaultSize
            />
        );
    }
);


addFilter(
    'portfolioBlocks.videoGallery.enableFilterToggle',
    'portfolio-blocks/video-gallery-premium-filter-toggle',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return createElement(ToggleControl, {
            label: __('Enable Video Filtering', 'portfolio-blocks'),
            checked: !!attributes.enableFilter,
            onChange: (val) => setAttributes({ enableFilter: val }),
            __nextHasNoMarginBottom: true,
            help: __('Enable video filtering with categories.', 'portfolio-blocks')
        });
    }
);


addFilter(
    'portfolioBlocks.videoGallery.borderColorControl',
    'portfolio-blocks/video-gallery-premium-border-color',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        return createElement(
            BaseControl,
            {
                label: __('Border Color', 'portfolio-blocks'),
                __nextHasNoMarginBottom: true
            },
            createElement(ColorPalette, {
                value: attributes.borderColor,
                onChange: (value) => setAttributes({ borderColor: value }),
                clearable: false,
                help: __('Set border color.', 'portfolio-blocks')
            })
        );
    }
);

addFilter(
    'portfolioBlocks.videoGallery.borderWidthControl',
    'portfolio-blocks/video-gallery-premium-border-width',
    (defaultContent, props) => {
        const { attributes, setAttributes, clientId, updateBlockAttributes } = props;

        return createElement(RangeControl, {
            label: __('Border Width', 'portfolio-blocks'),
            value: attributes.borderWidth,
            onChange: (value) => {
                setAttributes({ borderWidth: value });
                setTimeout(() => {
                    updateBlockAttributes(clientId, { _forceRefresh: Date.now() });
                }, 50);
            },
            min: 0,
            max: 20,
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true,
            help: __('Set border width in pixels.', 'portfolio-blocks')
        });
    }
);

addFilter(
    'portfolioBlocks.videoGallery.borderRadiusControl',
    'portfolio-blocks/video-gallery-premium-border-radius',
    (defaultContent, props) => {
        const { attributes, setAttributes, clientId, updateBlockAttributes } = props;

        return createElement(RangeControl, {
            label: __('Border Radius', 'portfolio-blocks'),
            value: attributes.borderRadius,
            onChange: (value) => {
                setAttributes({ borderRadius: value });
                setTimeout(() => {
                    updateBlockAttributes(clientId, { _forceRefresh: Date.now() });
                }, 50);
            },
            min: 0,
            max: 100,
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true,
            help: __('Set border radius in pixels.', 'portfolio-blocks')
        });
    }
);

addFilter(
    'portfolioBlocks.videoGallery.dropShadowToggle',
    'portfolio-blocks/video-gallery-premium-drop-shadow',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return createElement(ToggleControl, {
            label: __('Enable Drop Shadow', 'portfolio-blocks'),
            checked: !!attributes.dropShadow,
            onChange: (newDropShadow) => setAttributes({ dropShadow: newDropShadow }),
            __nextHasNoMarginBottom: true,
            help: __('Applies a subtle drop shadow to images.', 'portfolio-blocks')
        });
    }
);