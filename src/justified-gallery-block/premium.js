/**
 * Justified Gallery Block
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
