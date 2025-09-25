import { __ } from '@wordpress/i18n';
import { ToggleControl, SelectControl, BaseControl, ColorPalette, RangeControl } from '@wordpress/components';
import { Fragment, createElement } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';

addFilter(
    'portfolioBlocks.carouselGallery.randomizeToggle',
    'portfolio-blocks/carousel-gallery-premium-toggle',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        return createElement(ToggleControl, {
            label: __('Randomize Image Order', 'portfolio-blocks'),
            checked: !!attributes.randomizeOrder,
            onChange: (value) => setAttributes({ randomizeOrder: value }),
            __nextHasNoMarginBottom: true,
            help: __('Randomize order of images.', 'portfolio-blocks')
        });
    }
);
addFilter(
    'portfolioBlocks.carouselGallery.downloadControls',
    'portfolio-blocks/carousel-gallery-premium-downloads',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        const { enableDownload, downloadOnHover } = attributes;

        return createElement(Fragment, {}, [
            createElement(ToggleControl, {
                key: 'enable-download',
                label: __('Enable Image Downloads', 'portfolio-blocks'),
                checked: !!enableDownload,
                onChange: (value) => setAttributes({ enableDownload: value }),
                __nextHasNoMarginBottom: true,
                help: __('Enable visitors to download images from the gallery.', 'portfolio-blocks')
            }),
            enableDownload &&
                createElement(SelectControl, {
                    key: 'download-icon-display',
                    label: __('Display Image Download Icon', 'portfolio-blocks'),
                    value: downloadOnHover ? 'hover' : 'always',
                    options: [
                        { label: __('Always', 'portfolio-blocks'), value: 'always' },
                        { label: __('On Hover', 'portfolio-blocks'), value: 'hover' }
                    ],
                    onChange: (value) => setAttributes({ downloadOnHover: value === 'hover' }),
                    __nextHasNoMarginBottom: true,
                    help: __('Set display preference for Image Download icon.')
                })
        ]);
    }
);
addFilter(
    'portfolioBlocks.carouselGallery.disableRightClickToggle',
    'portfolio-blocks/carousel-gallery-premium-disable-right-click',
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
    'portfolioBlocks.carouselGallery.lazyLoadToggle',
    'portfolio-blocks/carousel-gallery-premium-lazy-load',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return createElement(ToggleControl, {
            label: __('Enable Lazy Load of Images', 'portfolio-blocks'),
            help: __('Enables lazy loading of gallery images.', 'portfolio-blocks'),
            __nextHasNoMarginBottom: true,
            checked: !!attributes.lazyLoad,
            onChange: (value) => setAttributes({ lazyLoad: value })
        });
    }
);
addFilter(
	'portfolioBlocks.carouselGallery.showControlsToggle',
	'portfolio-blocks/carousel-gallery-premium-controls',
	(defaultContent, props) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={__('Enable Carousel Controls', 'portfolio-blocks')}
				checked={attributes.showControls}
				onChange={(value) => setAttributes({ showControls: value })}
				__nextHasNoMarginBottom
				help={__('Toggle visibility of navigation arrows.', 'portfolio-blocks')}
			/>
		);
	}
);
addFilter(
    'portfolioBlocks.carouselGallery.lightboxControls',
    'portfolio-blocks/carousel-gallery-premium-lightbox',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return createElement(Fragment, {}, [
            createElement(ToggleControl, {
                key: 'enable-lightbox',
                label: __('Enable Lightbox', 'portfolio-blocks'),
                checked: !!attributes.lightbox,
                onChange: (newLightbox) => setAttributes({ lightbox: newLightbox }),
                __nextHasNoMarginBottom: true,
                help: __('Enable image Lightbox on click.', 'portfolio-blocks')
            }),
            attributes.lightbox &&
                createElement(ToggleControl, {
                    key: 'show-lightbox-caption',
                    label: __('Show Caption in Lightbox', 'portfolio-blocks'),
                    checked: !!attributes.lightboxCaption,
                    onChange: (newLightboxCaption) => setAttributes({ lightboxCaption: newLightboxCaption }),
                    __nextHasNoMarginBottom: true,
                    help: __('Display image Captions inside the lightbox.', 'portfolio-blocks')
                })
        ]);
    }
);
addFilter(
    'portfolioBlocks.carouselGallery.onHoverTitleToggle',
    'portfolio-blocks/carousel-gallery-premium-title-toggle',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return createElement(ToggleControl, {
            label: __('Show Title on Hover', 'portfolio-blocks'),
            help: __('Display image title when hovering over image.', 'portfolio-blocks'),
            __nextHasNoMarginBottom: true,
            checked: !!attributes.onHoverTitle,
            onChange: (value) => setAttributes({ onHoverTitle: value })
        });
    }
);
addFilter(
    'portfolioBlocks.carouselGallery.enableFilterToggle',
    'portfolio-blocks/carousel-gallery-premium-filter-toggle',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return createElement(ToggleControl, {
            label: __('Enable Image Filtering', 'portfolio-blocks'),
            checked: !!attributes.enableFilter,
            onChange: (val) => setAttributes({ enableFilter: val }),
            __nextHasNoMarginBottom: true,
            help: __('Enable image filtering with categories.', 'portfolio-blocks')
        });
    }
);
addFilter(
    'portfolioBlocks.carouselGallery.borderColorControl',
    'portfolio-blocks/carousel-gallery-premium-border-color',
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
    'portfolioBlocks.carouselGallery.borderWidthControl',
    'portfolio-blocks/carousel-gallery-premium-border-width',
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
    'portfolioBlocks.carouselGallery.borderRadiusControl',
    'portfolio-blocks/carousel-gallery-premium-border-radius',
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
    'portfolioBlocks.carouselGallery.dropShadowToggle',
    'portfolio-blocks/carousel-gallery-premium-drop-shadow',
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