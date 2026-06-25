/**
 * Justified Gallery Block
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
import {
	registerDisableRightClickPremiumControl,
	registerLazyLoadPremiumControl,
	registerRandomizeOrderPremiumControl,
} from '../pb-helpers/simplePremiumControls';

enableGalleryTransforms( 'folioblocks/justified-gallery-block' );
registerResponsiveGapPremiumControl( {
	hookName: 'folioBlocks.justifiedGallery.responsiveGapControl',
	gapsHookName: 'folioBlocks.justifiedGallery.responsiveGaps',
	namespace: 'folioblocks/justified-gallery',
} );

registerListViewThumbnailEnhancements( {
	hookPrefix: 'folioBlocks.justifiedGallery',
	namespace: 'folioblocks/justified-gallery',
} );

registerFilteringPremiumControls( {
	hookPrefix: 'folioBlocks.justifiedGallery',
	namespace: 'folioblocks/justified-gallery',
	childBlockName: 'folioblocks/pb-image-block',
} );

addFilter(
	'folioBlocks.justifiedGallery.editorEnhancements',
	'folioblocks/justified-gallery-randomize',
	( _, { attributes, innerBlocks, clientId, replaceInnerBlocks } ) => {
		const previousRandomizeOrder = useRef(
			!! attributes?.randomizeOrder
		);

		// Shuffle images if randomizeOrder is enabled
		useEffect( () => {
			const didToggleOn =
				!! attributes?.randomizeOrder &&
				! previousRandomizeOrder.current;
			previousRandomizeOrder.current = !! attributes?.randomizeOrder;

			if (
				! attributes ||
				! didToggleOn ||
				innerBlocks.length === 0
			) {
				return;
			}

			// Use a small delay to avoid nested updates inside React render phase
			const timer = setTimeout( () => {
				const shuffled = [ ...innerBlocks ];
				for ( let i = shuffled.length - 1; i > 0; i-- ) {
					const j = Math.floor( Math.random() * ( i + 1 ) );
					[ shuffled[ i ], shuffled[ j ] ] = [
						shuffled[ j ],
						shuffled[ i ],
					];
				}

				if ( typeof replaceInnerBlocks === 'function' ) {
					replaceInnerBlocks( clientId, shuffled );
				}
			}, 100 );

			return () => clearTimeout( timer );
		}, [ attributes?.randomizeOrder ] );

		return null;
	}
);
registerImageClickActionPremiumControls( {
	hookPrefix: 'folioBlocks.justifiedGallery',
	namespace: 'folioblocks/justified-gallery',
} );

registerImageClickStylePremiumControls( {
	hookPrefix: 'folioBlocks.justifiedGallery',
	namespace: 'folioblocks/justified-gallery',
} );

registerImageHoverActionPremiumControls( {
	hookPrefix: 'folioBlocks.justifiedGallery',
	namespace: 'folioblocks/justified-gallery',
	stylePanelLabel: __( 'Gallery Hover Styles', 'folioblocks' ),
} );

registerRandomizeOrderPremiumControl( {
	hookPrefix: 'folioBlocks.justifiedGallery',
	namespace: 'folioblocks/justified-gallery',
	refreshOnChange: true,
} );

registerDisableRightClickPremiumControl( {
	hookPrefix: 'folioBlocks.justifiedGallery',
	namespace: 'folioblocks/justified-gallery',
} );

registerLazyLoadPremiumControl( {
	hookPrefix: 'folioBlocks.justifiedGallery',
	namespace: 'folioblocks/justified-gallery',
} );

;
;

addFilter(
	'folioBlocks.justifiedGallery.imageStyles',
	'folioblocks/justified-gallery-premium-image-styles',
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
