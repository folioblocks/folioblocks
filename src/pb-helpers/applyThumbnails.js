/**
 * Apply Thumbnails
 * Helper file for galleries
 * @param clientId
 */
import { __ } from '@wordpress/i18n';

const LIST_VIEW_CONTENT_SELECTOR = '.block-editor-list-view__content';
const OVERRIDE_ICON_COLOR = '#3b82f6';
const OVERRIDE_TOOLTIP = __( 'Image has per-image overrides', 'folioblocks' );
const observedListViews = new WeakSet();
let queuedThumbnailPass = null;

const getAllBlocksRecursive = ( clientId ) => {
	const blocks = wp.data.select( 'core/block-editor' ).getBlocks( clientId );
	let all = [ ...blocks ];
	blocks.forEach( ( b ) => {
		all = all.concat( getAllBlocksRecursive( b.clientId ) );
	} );
	return all;
};

const getBlocksForThumbnails = ( clientId ) => {
	if ( clientId ) {
		return getAllBlocksRecursive( clientId );
	}

	const rootBlocks = wp.data.select( 'core/block-editor' ).getBlocks();
	let allBlocks = [ ...rootBlocks ];
	rootBlocks.forEach( ( block ) => {
		allBlocks = allBlocks.concat( getAllBlocksRecursive( block.clientId ) );
	} );

	return allBlocks;
};

const observeListViewChanges = ( clientId = null ) => {
	const listViewContainers = document.querySelectorAll(
		LIST_VIEW_CONTENT_SELECTOR
	);

	listViewContainers.forEach( ( listViewContainer ) => {
		if ( observedListViews.has( listViewContainer ) ) {
			return;
		}

		observedListViews.add( listViewContainer );

		const observer = new window.MutationObserver( () => {
			queueThumbnailPass( clientId );
		} );

		observer.observe( listViewContainer, {
			childList: true,
			subtree: true,
		} );
	} );
};

const runThumbnailPass = ( clientId = null ) => {
	observeListViewChanges();
	applyThumbnails( clientId );
};

const queueThumbnailPass = ( clientId = null ) => {
	if ( queuedThumbnailPass ) {
		window.clearTimeout( queuedThumbnailPass );
	}

	queuedThumbnailPass = window.setTimeout( () => {
		queuedThumbnailPass = null;
		runThumbnailPass( clientId );
	}, 50 );
};

const getListItemsForBlock = ( block ) => {
	return document.querySelectorAll( `[data-block="${ block.clientId }"]` );
};

const getThumbnailSrc = ( block ) => {
	if ( block.name === 'folioblocks/pb-image-block' ) {
		return block.attributes?.src || '';
	}

	if ( block.name === 'folioblocks/pb-video-block' ) {
		return block.attributes?.thumbnail || '';
	}

	return '';
};

const hasPerImageOverrides = ( block ) =>
	block.name === 'folioblocks/pb-image-block' &&
	!! (
		block.attributes?.overrideGalleryClickSettings ||
		block.attributes?.overrideGalleryHoverSettings
	);

const getListItemIconNodes = ( listItem ) =>
	listItem.querySelectorAll(
		[
			'.block-editor-block-icon',
			'.block-editor-list-view-block-select-button__icon',
			'.block-editor-list-view-block-select-button svg',
		].join( ',' )
	);

const applyOverrideCue = ( listItem, isActive ) => {
	const selectButton = listItem.querySelector(
		'.block-editor-list-view-block-select-button'
	);
	const tooltipTarget = selectButton || listItem;
	const iconNodes = getListItemIconNodes( listItem );

	if ( isActive ) {
		listItem.dataset.pbPerImageOverrides = 'true';
		tooltipTarget.title = OVERRIDE_TOOLTIP;
		tooltipTarget.dataset.pbOverrideTooltip = 'true';

		iconNodes.forEach( ( iconNode ) => {
			iconNode.style.color = OVERRIDE_ICON_COLOR;
			iconNode.style.fill = 'currentColor';
			iconNode.style.stroke = 'currentColor';
		} );
		return;
	}

	delete listItem.dataset.pbPerImageOverrides;

	if ( tooltipTarget.dataset.pbOverrideTooltip === 'true' ) {
		tooltipTarget.removeAttribute( 'title' );
		delete tooltipTarget.dataset.pbOverrideTooltip;
	}

	iconNodes.forEach( ( iconNode ) => {
		iconNode.style.removeProperty( 'color' );
		iconNode.style.removeProperty( 'fill' );
		iconNode.style.removeProperty( 'stroke' );
	} );
};

// Wait for List View to appear, then initialize observer
const waitForListView = () => {
	const editorLayout =
		document.querySelector( '.edit-post-editor-layout' ) || document.body;

	if ( ! editorLayout ) {
		return;
	}

	const observer = new window.MutationObserver( () => {
		const listView = document.querySelector( LIST_VIEW_CONTENT_SELECTOR );
		if ( ! listView ) {
			return;
		}

		queueThumbnailPass();
	} );

	observer.observe( editorLayout, {
		childList: true,
		subtree: true,
	} );

	runThumbnailPass();
};

if ( ! window.folioBlocksThumbnailsInitialized ) {
	window.folioBlocksThumbnailsInitialized = true;
	waitForListView();
	wp.data.subscribe( () => {
		queueThumbnailPass();
	} );
}

export const applyThumbnails = ( clientId = null, retries = 10 ) => {
	const delay = 300;
	let allApplied = true;

	const blocks = getBlocksForThumbnails( clientId );

	blocks.forEach( ( block ) => {
		const thumbnailSrc = getThumbnailSrc( block );
		const shouldApplyOverrideCue =
			block.name === 'folioblocks/pb-image-block';

		if ( ! thumbnailSrc && ! shouldApplyOverrideCue ) {
			return;
		}

		const listItems = getListItemsForBlock( block );
		if ( ! listItems.length ) {
			allApplied = false;
			return;
		}

		listItems.forEach( ( listItem ) => {
			applyOverrideCue( listItem, hasPerImageOverrides( block ) );

			if ( ! thumbnailSrc ) {
				return;
			}

			let thumbnailContainer = listItem.querySelector(
				'.block-editor-list-view-block-select-button__image'
			);
			if ( ! thumbnailContainer ) {
				const selectButton = listItem.querySelector(
					'.block-editor-list-view-block-select-button'
				);
				if ( selectButton ) {
					thumbnailContainer = document.createElement( 'span' );
					thumbnailContainer.className =
						'block-editor-list-view-block-select-button__image';
					thumbnailContainer.dataset.pbThumbnail = 'true';
					selectButton.appendChild( thumbnailContainer );
				} else {
					allApplied = false;
					return;
				}
			}

			if (
				thumbnailContainer.dataset.pbThumbnailApplied === 'true' &&
				thumbnailContainer.dataset.pbThumbnailSrc === thumbnailSrc
			) {
				return;
			}

			window.requestAnimationFrame( () => {
				thumbnailContainer.style.backgroundImage = `url("${ thumbnailSrc }")`;
				thumbnailContainer.style.backgroundSize = 'cover';
				thumbnailContainer.style.backgroundPosition = 'center';
				thumbnailContainer.style.setProperty(
					'width',
					'30px',
					'important'
				);
				thumbnailContainer.style.height = '20px';
				thumbnailContainer.style.zIndex = '1';
				thumbnailContainer.dataset.pbThumbnailApplied = 'true';
				thumbnailContainer.dataset.pbThumbnailSrc = thumbnailSrc;
			} );
		} );
	} );

	if ( ! allApplied && retries > 0 ) {
		setTimeout( () => {
			applyThumbnails( clientId, retries - 1 );
		}, delay );
	}
};
