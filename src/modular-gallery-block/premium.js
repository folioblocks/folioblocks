/**
 * Modular Gallery Block
 * Premium JS
 */
import { __ } from '@wordpress/i18n';
import {
	ToggleControl,
	RangeControl,
} from '@wordpress/components';
import { addFilter } from '@wordpress/hooks';
import CompactColorControl from '../pb-helpers/CompactColorControl';
import { registerImageClickActionPremiumControls } from '../pb-helpers/imageClickActionPremiumControls';
import { registerImageClickStylePremiumControls } from '../pb-helpers/imageClickStylePremiumControls';
import { registerImageHoverActionPremiumControls } from '../pb-helpers/imageHoverActionPremiumControls';
import { registerListViewThumbnailEnhancements } from '../pb-helpers/listViewThumbnailEnhancements';
import {
	registerDisableRightClickPremiumControl,
	registerLazyLoadPremiumControl,
} from '../pb-helpers/simplePremiumControls';

registerListViewThumbnailEnhancements( {
	hookPrefix: 'folioBlocks.modularGallery',
	namespace: 'folioblocks/modular-gallery',
} );

registerImageClickActionPremiumControls( {
	hookPrefix: 'folioBlocks.modularGallery',
	namespace: 'folioblocks/modular-gallery',
} );

registerImageClickStylePremiumControls( {
	hookPrefix: 'folioBlocks.modularGallery',
	namespace: 'folioblocks/modular-gallery',
} );

registerDisableRightClickPremiumControl( {
	hookPrefix: 'folioBlocks.modularGallery',
	namespace: 'folioblocks/modular-gallery',
} );

registerLazyLoadPremiumControl( {
	hookPrefix: 'folioBlocks.modularGallery',
	namespace: 'folioblocks/modular-gallery',
} );

registerImageHoverActionPremiumControls( {
	hookPrefix: 'folioBlocks.modularGallery',
	namespace: 'folioblocks/modular-gallery',
	stylePanelLabel: __( 'Gallery Hover Styles', 'folioblocks' ),
} );


addFilter(
	'folioBlocks.modularGallery.imageStyles',
	'folioblocks/modular-gallery-premium-image-styles',
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
