/**
 * Modular Gallery Block
 * Premium JS
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import ImageStyleControl from '../pb-helpers/ImageStyleControl';
import { registerImageClickActionPremiumControls } from '../pb-helpers/imageClickActionPremiumControls';
import { registerImageClickStylePremiumControls } from '../pb-helpers/imageClickStylePremiumControls';
import { registerImageHoverActionPremiumControls } from '../pb-helpers/imageHoverActionPremiumControls';
import { registerListViewThumbnailEnhancements } from '../pb-helpers/listViewThumbnailEnhancements';
import { registerWatermarkOverlayControls } from '../pb-helpers/watermarkOverlayControls';
import {
	registerDisableRightClickPremiumControl,
	registerLazyLoadPremiumControl,
} from '../pb-helpers/simplePremiumControls';

registerListViewThumbnailEnhancements( {
	hookPrefix: 'folioBlocks.modularGallery',
	namespace: 'folioblocks/modular-gallery',
} );

registerWatermarkOverlayControls( {
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
			<ImageStyleControl
				attributes={ attributes }
				setAttributes={ setAttributes }
				onChange={ forceRefresh }
			/>
		);
	}
);
