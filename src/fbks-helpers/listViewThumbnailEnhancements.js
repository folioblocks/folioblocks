import { addFilter } from '@wordpress/hooks';
import { useEffect } from '@wordpress/element';
import { applyThumbnails } from './applyThumbnails';

export const registerListViewThumbnailEnhancements = ( {
	hookPrefix,
	namespace,
	hookName = `${ hookPrefix }.editorEnhancements`,
	selectedDelay = 200,
	fallbackDelay = 300,
} ) => {
	addFilter(
		hookName,
		`${ namespace }-premium-thumbnails`,
		(
			_,
			{
				clientId,
				innerBlocks = [],
				isBlockOrChildSelected = false,
			} = {}
		) => {
			useEffect( () => {
				if ( ! clientId || ! isBlockOrChildSelected ) {
					return;
				}

				const timer = setTimeout( () => {
					applyThumbnails( clientId );
				}, selectedDelay );

				return () => clearTimeout( timer );
			}, [ clientId, isBlockOrChildSelected ] );

			useEffect( () => {
				if ( ! clientId || innerBlocks.length === 0 ) {
					return;
				}

				const listViewHasThumbnails = document.querySelector(
					'[data-pb-thumbnail-applied="true"]'
				);

				if ( listViewHasThumbnails ) {
					return;
				}

				const timer = setTimeout( () => {
					applyThumbnails( clientId );
				}, fallbackDelay );

				return () => clearTimeout( timer );
			}, [ clientId, innerBlocks ] );

			return null;
		}
	);
};
