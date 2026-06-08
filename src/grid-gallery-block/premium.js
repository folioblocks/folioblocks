/**
 * Grid Gallery Block
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

registerImageHoverActionPremiumControls( {
	hookPrefix: 'folioBlocks.gridGallery',
	namespace: 'folioblocks/grid-gallery',
	stylePanelLabel: __( 'Gallery Hover Styles', 'folioblocks' ),
} );

registerImageClickActionPremiumControls( {
	hookPrefix: 'folioBlocks.gridGallery',
	namespace: 'folioblocks/grid-gallery',
} );

registerImageClickStylePremiumControls( {
	hookPrefix: 'folioBlocks.gridGallery',
	namespace: 'folioblocks/grid-gallery',
} );

registerRandomizeOrderPremiumControl( {
	hookPrefix: 'folioBlocks.gridGallery',
	namespace: 'folioblocks/grid-gallery',
} );

registerDisableRightClickPremiumControl( {
	hookPrefix: 'folioBlocks.gridGallery',
	namespace: 'folioblocks/grid-gallery',
} );

registerLazyLoadPremiumControl( {
	hookPrefix: 'folioBlocks.gridGallery',
	namespace: 'folioblocks/grid-gallery',
} );

registerListViewThumbnailEnhancements( {
	hookPrefix: 'folioBlocks.gridGallery',
	namespace: 'folioblocks/grid-gallery',
} );

addFilter(
	'folioBlocks.gridGallery.editorEnhancements',
	'folioblocks/grid-gallery-randomize',
	( _, props = {} ) => {
		const { clientId, innerBlocks = [], attributes = {} } = props;
		const { randomizeOrder } = attributes;
		const ranOnce = useRef( false );
		const previousRandomizeOrder = useRef( !! randomizeOrder );

		useEffect( () => {
			const didToggleOn =
				!! randomizeOrder && ! previousRandomizeOrder.current;
			previousRandomizeOrder.current = !! randomizeOrder;

			if ( ! didToggleOn || innerBlocks.length === 0 ) {
				return;
			}
			if ( ranOnce.current ) {
				return;
			} // already shuffled
			ranOnce.current = true;

			const shuffled = [ ...innerBlocks ];
			for ( let i = shuffled.length - 1; i > 0; i-- ) {
				const j = Math.floor( Math.random() * ( i + 1 ) );
				[ shuffled[ i ], shuffled[ j ] ] = [
					shuffled[ j ],
					shuffled[ i ],
				];
			}

			wp.data
				.dispatch( 'core/block-editor' )
				.replaceInnerBlocks( clientId, shuffled, false );
		}, [ randomizeOrder ] );

		// Reset when user toggles randomize off
		useEffect( () => {
			if ( ! randomizeOrder ) {
				ranOnce.current = false;
			}
		}, [ randomizeOrder ] );

		return null;
	}
);
registerFilteringPremiumControls( {
	hookPrefix: 'folioBlocks.gridGallery',
	namespace: 'folioblocks/grid-gallery',
	childBlockName: 'folioblocks/pb-image-block',
} );

addFilter(
	'folioBlocks.gridGallery.imageStyles',
	'folioblocks/grid-gallery-premium-image-styles',
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
