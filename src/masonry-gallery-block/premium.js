/**
 * Masonry Gallery Block
 * Premium JS
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { useEffect, useRef } from '@wordpress/element';
import ImageStyleControl from '../pb-helpers/ImageStyleControl';
import { registerImageClickActionPremiumControls } from '../pb-helpers/imageClickActionPremiumControls';
import { registerImageClickStylePremiumControls } from '../pb-helpers/imageClickStylePremiumControls';
import { registerImageHoverActionPremiumControls } from '../pb-helpers/imageHoverActionPremiumControls';
import { registerFilteringPremiumControls } from '../pb-helpers/filteringPremiumControls';
import { registerListViewThumbnailEnhancements } from '../pb-helpers/listViewThumbnailEnhancements';
import { enableGalleryTransforms } from '../pb-helpers/galleryTransforms';
import { registerResponsiveGapPremiumControl } from '../pb-helpers/responsiveGapPremiumControl';
import { registerWatermarkOverlayControls } from '../pb-helpers/watermarkOverlayControls';
import { registerSocialMediaSharingControls } from '../pb-helpers/socialSharingControls';
import {
	registerDisableRightClickPremiumControl,
	registerLazyLoadPremiumControl,
	registerRandomizeOrderPremiumControl,
} from '../pb-helpers/simplePremiumControls';

enableGalleryTransforms( 'folioblocks/masonry-gallery-block' );
registerResponsiveGapPremiumControl( {
	hookName: 'folioBlocks.masonryGallery.responsiveGapControl',
	gapsHookName: 'folioBlocks.masonryGallery.responsiveGaps',
	namespace: 'folioblocks/masonry-gallery',
} );

registerListViewThumbnailEnhancements( {
	hookPrefix: 'folioBlocks.masonryGallery',
	namespace: 'folioblocks/masonry-gallery',
} );

registerWatermarkOverlayControls( {
	hookPrefix: 'folioBlocks.masonryGallery',
	namespace: 'folioblocks/masonry-gallery',
} );

registerSocialMediaSharingControls( {
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
			<ImageStyleControl
				attributes={ attributes }
				setAttributes={ setAttributes }
				onChange={ forceRefresh }
			/>
		);
	}
);


;
