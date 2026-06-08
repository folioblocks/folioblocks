/**
 * Masonry Gallery Block
 * Premium JS
 */
import { __ } from '@wordpress/i18n';
import {
	ToggleControl,
	RangeControl,
} from '@wordpress/components';
import { addFilter } from '@wordpress/hooks';
import { useEffect, useRef } from '@wordpress/element';
import CompactColorControl from '../pb-helpers/CompactColorControl';
import { registerImageClickActionPremiumControls } from '../pb-helpers/imageClickActionPremiumControls';
import { registerImageClickStylePremiumControls } from '../pb-helpers/imageClickStylePremiumControls';
import { registerImageHoverActionPremiumControls } from '../pb-helpers/imageHoverActionPremiumControls';
import { registerFilteringPremiumControls } from '../pb-helpers/filteringPremiumControls';
import { registerListViewThumbnailEnhancements } from '../pb-helpers/listViewThumbnailEnhancements';
import {
	registerDisableRightClickPremiumControl,
	registerLazyLoadPremiumControl,
	registerRandomizeOrderPremiumControl,
} from '../pb-helpers/simplePremiumControls';
registerListViewThumbnailEnhancements( {
	hookPrefix: 'folioBlocks.masonryGallery',
	namespace: 'folioblocks/masonry-gallery',
} );

registerFilteringPremiumControls( {
	hookPrefix: 'folioBlocks.masonryGallery',
	namespace: 'folioblocks/masonry-gallery',
	childBlockName: 'folioblocks/pb-image-block',
} );

addFilter(
	'folioBlocks.masonryGallery.editorEnhancements',
	'folioblocks/masonry-gallery-randomize',
	( _, props ) => {
		if ( ! props ) {
			return null;
		}
		const {
			attributes,
			innerBlocks,
			clientId,
			replaceInnerBlocks,
			updateBlockAttributes,
		} = props;
		if ( ! attributes || ! innerBlocks || ! replaceInnerBlocks ) {
			return null;
		}

		const hasShuffledRef = useRef( false );
		const previousRandomizeOrder = useRef(
			!! attributes.randomizeOrder
		);

		useEffect( () => {
			const didToggleOn =
				!! attributes.randomizeOrder &&
				! previousRandomizeOrder.current;
			previousRandomizeOrder.current = !! attributes.randomizeOrder;

			// Only shuffle once when toggle changes to true
			if (
				didToggleOn &&
				! hasShuffledRef.current &&
				innerBlocks.length > 0
			) {
				const shuffled = [ ...innerBlocks ];
				for ( let i = shuffled.length - 1; i > 0; i-- ) {
					const j = Math.floor( Math.random() * ( i + 1 ) );
					[ shuffled[ i ], shuffled[ j ] ] = [
						shuffled[ j ],
						shuffled[ i ],
					];
				}

				replaceInnerBlocks( clientId, shuffled, false );
				if ( typeof updateBlockAttributes === 'function' ) {
					setTimeout(
						() =>
							updateBlockAttributes( clientId, {
								_forceRefresh: Date.now(),
							} ),
						50
					);
				}

				hasShuffledRef.current = true;
			}

			// Reset flag when toggle is turned off
			if ( ! attributes.randomizeOrder ) {
				hasShuffledRef.current = false;
			}
		}, [ attributes.randomizeOrder ] ); // ✅ run only when toggle changes

		return null;
	}
);
registerImageClickActionPremiumControls( {
	hookPrefix: 'folioBlocks.masonryGallery',
	namespace: 'folioblocks/masonry-gallery',
} );

registerImageClickStylePremiumControls( {
	hookPrefix: 'folioBlocks.masonryGallery',
	namespace: 'folioblocks/masonry-gallery',
} );

registerImageHoverActionPremiumControls( {
	hookPrefix: 'folioBlocks.masonryGallery',
	namespace: 'folioblocks/masonry-gallery',
	stylePanelLabel: __( 'Gallery Hover Styles', 'folioblocks' ),
} );

registerRandomizeOrderPremiumControl( {
	hookPrefix: 'folioBlocks.masonryGallery',
	namespace: 'folioblocks/masonry-gallery',
} );

registerDisableRightClickPremiumControl( {
	hookPrefix: 'folioBlocks.masonryGallery',
	namespace: 'folioblocks/masonry-gallery',
} );

registerLazyLoadPremiumControl( {
	hookPrefix: 'folioBlocks.masonryGallery',
	namespace: 'folioblocks/masonry-gallery',
} );

;
;

addFilter(
	'folioBlocks.masonryGallery.imageStyles',
	'folioblocks/masonry-gallery-premium-image-styles',
	( defaultContent, props ) => {
		const { attributes, setAttributes, clientId, updateBlockAttributes } =
			props;

		const forceRefresh = () => {
			if ( typeof updateBlockAttributes === 'function' ) {
				setTimeout( () => {
					updateBlockAttributes( clientId, {
						_forceRefresh: Date.now(),
					} );
				}, 50 );
			}
		};

		return (
			<>
				<CompactColorControl
					label={ __( 'Border Color', 'folioblocks' ) }
					value={ attributes.borderColor }
					onChange={ ( borderColor ) => {
						setAttributes( { borderColor } );
						forceRefresh();
					} }
					help={ __( 'Set Image border color.', 'folioblocks' ) }
				/>

				<RangeControl
					label={ __( 'Border Width', 'folioblocks' ) }
					value={ attributes.borderWidth }
					onChange={ ( value ) => {
						setAttributes( { borderWidth: value } );
						forceRefresh();
					} }
					min={ 0 }
					max={ 15 }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					help={ __( 'Set Image border width.', 'folioblocks' ) }
				/>

				<RangeControl
					label={ __( 'Border Radius', 'folioblocks' ) }
					value={ attributes.borderRadius }
					onChange={ ( value ) => {
						setAttributes( { borderRadius: value } );
						forceRefresh();
					} }
					min={ 0 }
					max={ 50 }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					help={ __( 'Set Image border radius.', 'folioblocks' ) }
				/>

				<ToggleControl
					label={ __( 'Enable Drop Shadow', 'folioblocks' ) }
					checked={ !! attributes.dropShadow }
					onChange={ ( newDropShadow ) =>
						setAttributes( { dropShadow: newDropShadow } )
					}
					__nextHasNoMarginBottom
					help={ __(
						'Applies a subtle drop shadow to images.',
						'folioblocks'
					) }
				/>
			</>
		);
	}
);


;
