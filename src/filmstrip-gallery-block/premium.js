/**
 * Filmstrip Gallery Block
 * Premium JS
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { useEffect, useRef } from '@wordpress/element';
import {
	ToggleControl,
	SelectControl,
	RangeControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { registerImageClickActionPremiumControls } from '../pb-helpers/imageClickActionPremiumControls';
import { registerImageClickStylePremiumControls } from '../pb-helpers/imageClickStylePremiumControls';
import { registerImageHoverActionPremiumControls } from '../pb-helpers/imageHoverActionPremiumControls';
import { registerListViewThumbnailEnhancements } from '../pb-helpers/listViewThumbnailEnhancements';
import { enableGalleryTransforms } from '../pb-helpers/galleryTransforms';
import { registerWatermarkOverlayControls } from '../pb-helpers/watermarkOverlayControls';
import {
	registerDisableRightClickPremiumControl,
	registerLazyLoadPremiumControl,
	registerRandomizeOrderPremiumControl,
} from '../pb-helpers/simplePremiumControls';

enableGalleryTransforms( 'folioblocks/filmstrip-gallery-block' );

registerImageHoverActionPremiumControls( {
	hookPrefix: 'folioBlocks.filmstripGallery',
	namespace: 'folioblocks/filmstrip-gallery',
	stylePanelLabel: __( 'Gallery Hover Styles', 'folioblocks' ),
} );

registerWatermarkOverlayControls( {
	hookPrefix: 'folioBlocks.filmstripGallery',
	namespace: 'folioblocks/filmstrip-gallery',
} );

const shuffleBlocks = ( blocks ) => {
	const shuffled = [ ...blocks ];

	if ( shuffled.length < 2 ) {
		return shuffled;
	}

	for ( let i = shuffled.length - 1; i > 0; i-- ) {
		const j = Math.floor( Math.random() * ( i + 1 ) );
		[ shuffled[ i ], shuffled[ j ] ] = [ shuffled[ j ], shuffled[ i ] ];
	}

	// Ensure the shuffled result is visually different from the original order.
	const isSameOrder = shuffled.every(
		( block, index ) => block.clientId === blocks[ index ]?.clientId
	);
	if ( isSameOrder ) {
		const first = shuffled.shift();
		if ( first ) {
			shuffled.push( first );
		}
	}

	return shuffled;
};

addFilter(
	'folioBlocks.filmstripGallery.colorModeControl',
	'folioblocks/filmstrip-gallery-premium-color-mode',
	( _, { attributes, setAttributes } ) => {
		return (
			<ToggleGroupControl
				label={ __( 'Color Mode', 'folioblocks' ) }
				value={ attributes.colorMode || 'light' }
				onChange={ ( value ) => {
					if ( value ) {
						setAttributes( { colorMode: value } );
					}
				} }
				isBlock
				__nextHasNoMarginBottom
				help={ __(
					'Switch between light and dark editor themes.',
					'folioblocks'
				) }
			>
				<ToggleGroupControlOption
					value="light"
					label={ __( 'Light', 'folioblocks' ) }
				/>
				<ToggleGroupControlOption
					value="dark"
					label={ __( 'Dark', 'folioblocks' ) }
				/>
			</ToggleGroupControl>
		);
	}
);

registerListViewThumbnailEnhancements( {
	hookPrefix: 'folioBlocks.filmstripGallery',
	namespace: 'folioblocks/filmstrip-gallery',
} );

addFilter(
	'folioBlocks.filmstripGallery.editorEnhancements',
	'folioblocks/filmstrip-gallery-randomize',
	(
		_,
		{
			clientId,
			innerBlocks,
			attributes,
			replaceInnerBlocks,
			setActiveIndex,
		}
	) => {
		const wasRandomizeEnabledRef = useRef(
			!! attributes.randomizeOrder
		);

		// Shuffle actual inner block order once when randomization is enabled.
		useEffect( () => {
			const isRandomizeEnabled = !! attributes.randomizeOrder;
			const wasRandomizeEnabled = wasRandomizeEnabledRef.current;
			wasRandomizeEnabledRef.current = isRandomizeEnabled;

			if (
				! isRandomizeEnabled ||
				wasRandomizeEnabled ||
				innerBlocks.length < 2 ||
				typeof replaceInnerBlocks !== 'function'
			) {
				return;
			}

			const shuffled = shuffleBlocks( innerBlocks );
			const hasOrderChanged = shuffled.some(
				( block, index ) =>
					block.clientId !== innerBlocks[ index ]?.clientId
			);

			if ( ! hasOrderChanged ) {
				return;
			}

			replaceInnerBlocks( clientId, shuffled );
			if ( typeof setActiveIndex === 'function' ) {
				setActiveIndex( 0 );
			}
		}, [
			attributes.randomizeOrder,
			clientId,
			innerBlocks,
			replaceInnerBlocks,
			setActiveIndex,
		] );

		return null;
	}
);
addFilter(
	'folioBlocks.filmstripGallery.enableAutoplayToggle',
	'folioblocks/filmstrip-gallery-premium-controls',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;

		return (
			<>
				<ToggleControl
					label={ __( 'Enable Autoplay', 'folioblocks' ) }
					checked={ attributes.autoplay || false }
					onChange={ ( value ) =>
						setAttributes( { autoplay: value } )
					}
					__nextHasNoMarginBottom
					help={ __(
						'Automatically advance to the next image in the gallery.',
						'folioblocks'
					) }
				/>
				{ attributes.autoplay && (
					<>
						<RangeControl
							label={ __(
								'Autoplay Speed (seconds)',
								'folioblocks'
							) }
							value={ attributes.autoplaySpeed || 3 }
							onChange={ ( value ) =>
								setAttributes( { autoplaySpeed: value } )
							}
							min={ 1 }
							max={ 5 }
							step={ 0.25 }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							help={ __(
								'Time between automatic image transitions.',
								'folioblocks'
							) }
						/>
						<ToggleControl
							label={ __( 'Pause on Hover', 'folioblocks' ) }
							checked={ !! attributes.pauseOnHover }
							onChange={ ( value ) =>
								setAttributes( { pauseOnHover: value } )
							}
							__nextHasNoMarginBottom
							help={ __(
								'Pause autoplay while hovering over the main image.',
								'folioblocks'
							) }
						/>
					</>
				) }
			</>
		);
	}
);

addFilter(
	'folioBlocks.filmstripGallery.enableFullscreenToggle',
	'folioblocks/filmstrip-gallery-premium-fullscreen',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={ __( 'Enable Full-Screen Mode', 'folioblocks' ) }
				checked={ !! attributes.enableFullscreen }
				onChange={ ( value ) =>
					setAttributes( { enableFullscreen: value } )
				}
				help={ __(
					'Enable Full-Screen Mode for the gallery on the frontend.',
					'folioblocks'
				) }
				__nextHasNoMarginBottom
			/>
		);
	}
);

registerImageClickActionPremiumControls( {
	hookPrefix: 'folioBlocks.filmstripGallery',
	namespace: 'folioblocks/filmstrip-gallery',
	supportsLightbox: true,
} );

registerImageClickStylePremiumControls( {
	hookPrefix: 'folioBlocks.filmstripGallery',
	namespace: 'folioblocks/filmstrip-gallery',
} );

registerRandomizeOrderPremiumControl( {
	hookPrefix: 'folioBlocks.filmstripGallery',
	namespace: 'folioblocks/filmstrip-gallery',
	hookName: 'folioBlocks.filmstripGallery.randomizeOrderToggle',
} );

registerDisableRightClickPremiumControl( {
	hookPrefix: 'folioBlocks.filmstripGallery',
	namespace: 'folioblocks/filmstrip-gallery',
} );

registerLazyLoadPremiumControl( {
	hookPrefix: 'folioBlocks.filmstripGallery',
	namespace: 'folioblocks/filmstrip-gallery',
} );
