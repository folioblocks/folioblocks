/**
 * Proofing Gallery Block
 * View.js
 */
import { getContext, getElement, store } from '@wordpress/interactivity';
import { createFrontendScope } from '../fbks-helpers/frontendScope';

import {
	normalizeClientRating,
	getPointerRating,
	getKeyboardRating,
} from '../fbks-helpers/proofingRatings';

const mounts = new Map();

const PROOFING_COMMENT_MAX_LENGTH = 1000;

const truncateProofingComment = ( comment = '' ) =>
	String( comment || '' ).slice( 0, PROOFING_COMMENT_MAX_LENGTH );

const createEmptyImageState = () => ( {
	registered: false,
	attachmentId: 0,
	thumbnail: '',
	title: '',
	hearted: false,
	clientRating: null,
	flag: '',
	comment: '',
} );

const ensureGalleryState = ( galleryId ) => {
	if ( ! state.galleries[ galleryId ] ) {
		state.galleries[ galleryId ] = {
			activeFilter: 'all',
			galleryKey: '',
			clientEmail: '',
			pageId: 0,
			restUrl: '',
			presenceUrl: '',
			trackPresence: false,
			initialized: false,
			emailAdminOnSubmit: false,
			isSaving: false,
			notice: '',
			openRatingPanel: '',
			openFlagPanel: '',
			openCommentPanel: '',
			savedImages: {},
			images: {},
		};
	}

	return state.galleries[ galleryId ];
};

const ensureImageState = ( galleryId, imageId ) => {
	const gallery = ensureGalleryState( galleryId );

	if ( ! gallery.images[ imageId ] ) {
		gallery.images[ imageId ] = createEmptyImageState();
	}

	return gallery.images[ imageId ];
};

const getCurrentGalleryId = () => {
	const context = getContext();
	const element = getElement().ref;
	const galleryId =
		context.galleryId ||
		element?.closest( '.fbks-proofing-gallery' )?.dataset
			?.proofingGalleryId ||
		'';

	return galleryId;
};

const getCurrentImageState = () => {
	const context = getContext();
	return ensureImageState( getCurrentGalleryId(), context.imageId );
};

const getCurrentGalleryState = () => {
	return ensureGalleryState( getCurrentGalleryId() );
};

const stopProofingClick = ( event ) => {
	event?.preventDefault();
	event?.stopPropagation();
};

const scheduleReflow = ( gallery ) => {
	const mount = mounts.get( gallery.dataset.proofingGalleryId );
	mount?.scope.frame( () => {
		gallery
			.querySelectorAll( '.wp-block-folioblocks-grid-gallery-block' )
			.forEach( ( root ) =>
				root.dispatchEvent( new Event( 'pbGridUpdated' ) )
			);
		gallery
			.querySelectorAll( '.pb-masonry-gallery' )
			.forEach( ( root ) =>
				root.dispatchEvent( new Event( 'pb:masonry:reflow' ) )
			);
		gallery
			.querySelectorAll( '.pb-justified-gallery' )
			.forEach( ( root ) =>
				root.dispatchEvent( new Event( 'pb:justified:reflow' ) )
			);
	} );
};

const getGalleryId = ( gallery ) => gallery.dataset.proofingGalleryId;

const getImageId = ( imageBlock ) => imageBlock.dataset.proofingImageId;

const getCurrentImageBlock = () =>
	getElement().ref.closest( '.wp-block-folioblocks-pb-image-block' );

const imageMatchesFilter = ( image, filter ) =>
	filter === 'all' ||
	( filter === 'hearted' && image.hearted ) ||
	( filter.startsWith( 'rating-' ) &&
		image.clientRating === Number( filter.slice( 7 ) ) ) ||
	( filter === 'commented' && !! image.comment.trim() ) ||
	( filter.startsWith( 'flag-' ) &&
		image.flag === filter.replace( 'flag-', '' ) );

const applyFilter = ( gallery ) => {
	const galleryId = getGalleryId( gallery );
	const filter = state.galleries[ galleryId ]?.activeFilter || 'all';
	const imageBlocks = gallery.querySelectorAll(
		'.wp-block-folioblocks-pb-image-block'
	);

	imageBlocks.forEach( ( imageBlock ) => {
		const imageId = getImageId( imageBlock );

		if ( ! imageId ) {
			return;
		}

		const image = ensureImageState( galleryId, imageId );
		imageBlock.classList.toggle(
			'is-hidden',
			! imageMatchesFilter( image, filter )
		);
	} );

	scheduleReflow( gallery );
};

const refreshCurrentGallery = () => {
	const gallery = getElement().ref.closest( '.fbks-proofing-gallery' );

	if ( gallery ) {
		applyFilter( gallery );
	}
};

const imagesToMap = ( images = [] ) =>
	images.reduce( ( result, image ) => {
		if ( image?.imageId ) {
			result[ image.imageId ] = image;
		}

		return result;
	}, {} );

const serializeGalleryImages = ( galleryId, gallery ) =>
	Array.from(
		mounts
			.get( galleryId )
			?.element.querySelectorAll( '.fbks-proofing-thumbnail-controls' ) ||
			[]
	).map( ( controls ) => {
		const imageBlock = controls.closest(
			'.wp-block-folioblocks-pb-image-block'
		);
		const imageId =
			imageBlock?.dataset.proofingImageId ||
			controls.dataset.proofingImageId;
		const image = gallery.images[ imageId ] || createEmptyImageState();

		return {
			imageId,
			attachmentId: Number(
				controls.dataset.proofingAttachmentId || image.attachmentId || 0
			),
			thumbnail: controls.dataset.proofingThumbnail || image.thumbnail,
			title: controls.dataset.proofingTitle || image.title,
			hearted:
				imageBlock?.dataset.proofingHearted === 'true' ||
				!! image.hearted,
			clientRating: normalizeClientRating( image.clientRating ),
			flag: imageBlock?.dataset.proofingFlag || image.flag || '',
			comment: truncateProofingComment(
				imageBlock?.dataset.proofingComment || image.comment || ''
			),
		};
	} );

const syncImageDom = ( controlRoot, imageBlock, image ) => {
	if ( ! controlRoot || ! imageBlock || ! image ) {
		return;
	}

	const heartButton = controlRoot.querySelector(
		'.fbks-proofing-thumbnail-control--heart'
	);
	const flagButton = controlRoot.querySelector(
		'.fbks-proofing-thumbnail-control--flag'
	);
	const commentButton = controlRoot.querySelector(
		'.fbks-proofing-thumbnail-control--comment'
	);
	const textarea = controlRoot.querySelector(
		'.fbks-proofing-comment-popover__field'
	);

	imageBlock.dataset.proofingHearted = image.hearted ? 'true' : 'false';
	imageBlock.dataset.proofingFlag = image.flag || '';
	imageBlock.dataset.proofingRating = String(
		normalizeClientRating( image.clientRating ) ?? ''
	);
	image.comment = truncateProofingComment( image.comment );
	imageBlock.dataset.proofingComment = image.comment;
	imageBlock.dataset.proofingCommented = image.comment.trim()
		? 'true'
		: 'false';

	heartButton?.classList.toggle( 'is-active', !! image.hearted );
	heartButton?.setAttribute(
		'aria-pressed',
		image.hearted ? 'true' : 'false'
	);

	// Gallery initialization and animation frames do not have an Interactivity scope.
	// Read this image's rendered palette instead of relying on callback context.
	const flagOption = Array.from(
		controlRoot.querySelectorAll( '[data-proofing-flag-color]' )
	).find( ( option ) => option.dataset.proofingFlagColor === image.flag );
	flagButton?.setAttribute( 'data-has-flag', image.flag ? 'true' : 'false' );
	flagButton?.style.setProperty(
		'--fbks-proofing-flag-color',
		flagOption?.style.backgroundColor || ''
	);

	commentButton?.classList.toggle( 'is-active', !! image.comment.trim() );
	if ( textarea ) {
		textarea.value = image.comment || '';
	}
};

const syncGalleryDom = ( galleryId ) => {
	mounts
		.get( galleryId )
		?.element.querySelectorAll( '.fbks-proofing-thumbnail-controls' )
		.forEach( ( controlRoot ) => {
			const imageBlock = controlRoot.closest(
				'.wp-block-folioblocks-pb-image-block'
			);
			const imageId =
				imageBlock?.dataset.proofingImageId ||
				controlRoot.dataset.proofingImageId;

			if ( ! imageId ) {
				return;
			}

			syncImageDom(
				controlRoot,
				imageBlock,
				ensureImageState( galleryId, imageId )
			);
		} );
};

const sendGalleryPresence = ( galleryId, presence, useBeacon = false ) => {
	const gallery = state.galleries[ galleryId ];
	const mount = mounts.get( galleryId );

	if (
		! gallery ||
		! mount ||
		! gallery.trackPresence ||
		! gallery.presenceUrl ||
		! gallery.galleryKey
	) {
		return;
	}

	const payload = {
		presence,
		galleryId,
		galleryKey: gallery.galleryKey,
		clientEmail: gallery.clientEmail,
		pageId: gallery.pageId,
	};
	const body = JSON.stringify( payload );

	if ( useBeacon && window.navigator?.sendBeacon && window.Blob ) {
		if (
			window.navigator.sendBeacon(
				gallery.presenceUrl,
				new window.Blob( [ body ], { type: 'application/json' } )
			)
		) {
			return;
		}
	}

	return window
		.fetch( gallery.presenceUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body,
			keepalive: useBeacon,
			signal: useBeacon ? undefined : mount.scope.signal,
		} )
		.catch( () => {} );
};

const bindPresenceEvents = ( galleryId, scope ) => {
	const gallery = ensureGalleryState( galleryId );
	if ( ! gallery.trackPresence ) {
		return;
	}
	scope.interval( () => {
		if ( document.visibilityState !== 'hidden' ) {
			sendGalleryPresence( galleryId, 'active' );
		}
	}, 45000 );
	scope.listen( window, 'pagehide', () =>
		sendGalleryPresence( galleryId, 'closed', true )
	);
	scope.listen( window, 'pageshow', () => {
		if ( document.visibilityState !== 'hidden' ) {
			sendGalleryPresence( galleryId, 'active' );
		}
	} );
	scope.listen( document, 'visibilitychange', () => {
		const hidden = document.visibilityState === 'hidden';
		sendGalleryPresence( galleryId, hidden ? 'closed' : 'active', hidden );
	} );
};

const storeLocalSession = ( galleryKey, session ) => {
	try {
		window.localStorage?.setItem(
			`fbksProofingSession:${ galleryKey }`,
			JSON.stringify( session )
		);
		return true;
	} catch {
		return false;
	}
};

const persistGallery = async ( galleryId, status ) => {
	const gallery = ensureGalleryState( galleryId );
	const mount = mounts.get( galleryId );
	if ( ! mount || gallery.isSaving ) {
		return;
	}
	if ( ! gallery.restUrl || ! gallery.galleryKey ) {
		gallery.notice = 'This proofing gallery is missing save settings.';
		return;
	}

	const isCurrentMount = () =>
		mounts.get( galleryId ) === mount && ! mount.scope.signal.aborted;
	gallery.isSaving = true;
	gallery.notice = '';

	const images = serializeGalleryImages( galleryId, gallery );
	const localSession = {
		status,
		updatedAt: new Date().toISOString(),
		images,
	};

	const savedLocally = storeLocalSession( gallery.galleryKey, localSession );
	gallery.savedImages = imagesToMap( images );
	if ( savedLocally ) {
		gallery.notice =
			status === 'submitted'
				? `Proofing selections submitted locally (${ images.length } images).`
				: `Progress saved locally (${ images.length } images).`;
	}

	try {
		const response = await window.fetch( gallery.restUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			signal: mount.scope.signal,
			body: JSON.stringify( {
				status,
				galleryId,
				galleryKey: gallery.galleryKey,
				clientEmail: gallery.clientEmail,
				pageId: gallery.pageId,
				emailAdminOnSubmit: gallery.emailAdminOnSubmit,
				images,
			} ),
		} );

		if ( ! response.ok ) {
			throw new Error( 'Unable to save proofing session.' );
		}

		const result = await response.json();
		if ( ! isCurrentMount() ) {
			return;
		}
		gallery.savedImages = imagesToMap( result.images || [] );
		storeLocalSession( gallery.galleryKey, {
			status,
			updatedAt: result.updatedAt || new Date().toISOString(),
			images: result.images || images,
		} );
		gallery.notice =
			status === 'submitted'
				? `Proofing selections submitted (${ images.length } images).`
				: `Progress saved (${ images.length } images). You can return later to continue.`;
	} catch ( error ) {
		if ( isCurrentMount() ) {
			gallery.notice = `${
				error?.message || 'Unable to save proofing session.'
			}${
				savedLocally ? ' Your progress was saved in this browser.' : ''
			}`;
		}
	} finally {
		if ( isCurrentMount() ) {
			gallery.isSaving = false;
		}
	}
};

const { state, actions } = store( 'folioblocks/proofing-gallery', {
	state: {
		galleries: {},
		get ratingFilterValue() {
			const gallery = getCurrentGalleryState();
			return (
				gallery.ratingFilterPreview ??
				( gallery.activeFilter.startsWith( 'rating-' )
					? Number( gallery.activeFilter.slice( 7 ) )
					: 0 )
			);
		},
		get isRatingFilterFilled() {
			return state.ratingFilterValue >= getContext().ratingChoice;
		},
		get isActiveFilter() {
			const context = getContext();
			const activeFilter =
				state.galleries[ context.galleryId ]?.activeFilter || 'all';

			return activeFilter === context.filter;
		},
		get isCurrentImageRated() {
			return (
				normalizeClientRating( getCurrentImageState().clientRating ) !==
				null
			);
		},
		get currentImageRatingText() {
			return getCurrentImageState().clientRating || '';
		},
		get currentImageRatingLabel() {
			const context = getContext();
			const rating = normalizeClientRating(
				getCurrentImageState().clientRating
			);
			return rating
				? `${ context.ratingLabel }: ${ rating }/5`
				: context.unratedLabel;
		},
		get currentRatingSliderValue() {
			return (
				getCurrentGalleryState().ratingPreview ??
				getCurrentImageState().clientRating ??
				0
			);
		},
		get isCurrentRatingFilled() {
			return state.currentRatingSliderValue >= getContext().ratingChoice;
		},
		get isCurrentImageRatingPanelOpen() {
			return (
				getCurrentGalleryState().openRatingPanel ===
				getContext().imageId
			);
		},
		get isCurrentImageHearted() {
			return getCurrentImageState().hearted;
		},
		get hasCurrentImageFlag() {
			return !! getCurrentImageState().flag;
		},
		get currentImageFlagColor() {
			return (
				getContext().flagOptions?.find(
					( item ) => item.value === getCurrentImageState().flag
				)?.color || ''
			);
		},
		get isCurrentImageCommented() {
			return !! getCurrentImageState().comment.trim();
		},
		get isCurrentImageFlagPanelOpen() {
			const context = getContext();
			return getCurrentGalleryState().openFlagPanel === context.imageId;
		},
		get isCurrentImageCommentPanelOpen() {
			const context = getContext();
			return (
				getCurrentGalleryState().openCommentPanel === context.imageId
			);
		},
		get currentImageComment() {
			return getCurrentImageState().comment;
		},
		get currentImageCommentCounter() {
			return `${
				getCurrentImageState().comment.length
			} / ${ PROOFING_COMMENT_MAX_LENGTH }`;
		},
		get isCurrentGallerySaving() {
			return getCurrentGalleryState().isSaving;
		},
		get currentGalleryNotice() {
			return getCurrentGalleryState().notice;
		},
	},
	actions: {
		registerGallery( galleryId, galleryData = {} ) {
			const element = galleryData.element;
			if ( ! element ) {
				return;
			}
			const gallery = ensureGalleryState( galleryId );
			const scope = createFrontendScope();
			const mount = { element, scope };
			mounts.set( galleryId, mount );
			gallery.isSaving = false;
			gallery.notice = '';
			gallery.openRatingPanel = '';
			gallery.ratingPreview = null;
			gallery.ratingDragging = false;
			gallery.openFlagPanel = '';
			gallery.openCommentPanel = '';
			gallery.galleryKey = galleryData.galleryKey || gallery.galleryKey;
			gallery.clientEmail =
				galleryData.clientEmail || gallery.clientEmail;
			gallery.pageId = Number( galleryData.pageId || gallery.pageId );
			gallery.restUrl = galleryData.restUrl || gallery.restUrl;
			gallery.presenceUrl =
				galleryData.presenceUrl || gallery.presenceUrl;
			gallery.trackPresence =
				galleryData.trackPresence ?? gallery.trackPresence;
			gallery.emailAdminOnSubmit =
				galleryData.emailAdminOnSubmit ?? gallery.emailAdminOnSubmit;
			if ( ! gallery.initialized ) {
				const savedSession = galleryData.savedSession || {};
				let savedImages = savedSession.images || [];

				if ( gallery.galleryKey && savedImages.length === 0 ) {
					try {
						const localSession = JSON.parse(
							window.localStorage?.getItem(
								`fbksProofingSession:${ gallery.galleryKey }`
							) || '{}'
						);
						savedImages = localSession.images || [];
					} catch {}
				}

				gallery.savedImages = imagesToMap( savedImages );
				Object.entries( gallery.savedImages ).forEach(
					( [ imageId, savedImage ] ) => {
						const image = ensureImageState( galleryId, imageId );
						image.clientRating = normalizeClientRating(
							savedImage.clientRating
						);
						image.hearted = !! savedImage.hearted;
						image.flag = savedImage.flag || '';
						image.comment = truncateProofingComment(
							savedImage.comment || ''
						);
					}
				);
				gallery.initialized = true;
			}
			syncGalleryDom( galleryId );
			sendGalleryPresence( galleryId, 'active' );
			bindPresenceEvents( galleryId, scope );
			// Image and inner-gallery callbacks can mount before their parent.
			scope.frame( () => {
				syncGalleryDom( galleryId );
				applyFilter( element );
			} );
			return () => {
				if ( mounts.get( galleryId ) !== mount ) {
					return;
				}
				sendGalleryPresence( galleryId, 'closed', true );
				scope.dispose();
				mounts.delete( galleryId );
				gallery.isSaving = false;
				gallery.openRatingPanel = '';
				gallery.openFlagPanel = '';
				gallery.openCommentPanel = '';
			};
		},
		registerImage( galleryId, imageId, imageData = {} ) {
			const gallery = ensureGalleryState( galleryId );
			const image = ensureImageState( galleryId, imageId );
			const savedImage = gallery.savedImages[ imageId ];
			image.attachmentId = Number( imageData.attachmentId || 0 );
			image.thumbnail = imageData.thumbnail || '';
			image.title = imageData.title || '';

			if ( savedImage && ! image.registered ) {
				image.clientRating = normalizeClientRating(
					savedImage.clientRating
				);
				image.hearted = !! savedImage.hearted;
				image.flag = savedImage.flag || '';
				image.comment = truncateProofingComment(
					savedImage.comment || ''
				);
			}

			image.registered = true;
			if ( imageData.element ) {
				imageData.element.dataset.proofingImageId = imageId;
				imageData.element.dataset.proofingAttachmentId = String(
					image.attachmentId
				);
				imageData.element.dataset.proofingThumbnail = image.thumbnail;
				imageData.element.dataset.proofingTitle = image.title;
			}
		},
		setFilter( galleryId, filter ) {
			ensureGalleryState( galleryId ).ratingFilterPreview = null;
			ensureGalleryState( galleryId ).activeFilter = filter || 'all';
		},
		startRatingFilterDrag( event ) {
			stopProofingClick( event );
			getCurrentGalleryState().ratingFilterDragging = true;
			getElement().ref.setPointerCapture?.( event.pointerId );
			actions.previewRatingFilter( event );
		},
		previewRatingFilter( event ) {
			getCurrentGalleryState().ratingFilterPreview = getPointerRating(
				event.clientX,
				getElement().ref.getBoundingClientRect()
			);
		},
		commitRatingFilterDrag( event ) {
			if ( ! getCurrentGalleryState().ratingFilterDragging ) return;
			getCurrentGalleryState().ratingFilterDragging = false;
			actions.updateRatingFilter(
				getPointerRating(
					event.clientX,
					getElement().ref.getBoundingClientRect()
				)
			);
		},
		cancelRatingFilterDrag() {
			getCurrentGalleryState().ratingFilterDragging = false;
			getCurrentGalleryState().ratingFilterPreview = null;
		},
		leaveRatingFilterPreview() {
			if ( ! getCurrentGalleryState().ratingFilterDragging )
				getCurrentGalleryState().ratingFilterPreview = null;
		},
		updateRatingFilter( rating ) {
			actions.setFilter(
				getCurrentGalleryId(),
				rating ? `rating-${ rating }` : 'all'
			);
			refreshCurrentGallery();
		},
		ratingFilterKeyDown( event ) {
			const filter = getCurrentGalleryState().activeFilter;
			const next = getKeyboardRating(
				event.key,
				filter.startsWith( 'rating-' ) ? Number( filter.slice( 7 ) ) : 0
			);
			if ( next !== undefined ) {
				stopProofingClick( event );
				actions.updateRatingFilter( next );
			}
		},
		chooseFilter( event ) {
			stopProofingClick( event );

			const context = getContext();
			actions.setFilter( context.galleryId, context.filter );
			refreshCurrentGallery();
		},
		toggleRatingPanel( event ) {
			stopProofingClick( event );
			const gallery = getCurrentGalleryState();
			const imageId = getContext().imageId;
			const imageBlock = getCurrentImageBlock();
			gallery.openFlagPanel = '';
			gallery.openCommentPanel = '';
			gallery.openRatingPanel =
				gallery.openRatingPanel === imageId ? '' : imageId;
			if ( gallery.openRatingPanel && event.detail === 0 ) {
				mounts.get( getCurrentGalleryId() )?.scope.frame( () => {
					imageBlock
						?.querySelector( '.fbks-proofing-rating-slider' )
						?.focus();
				} );
			}
		},
		startRatingDrag( event ) {
			stopProofingClick( event );
			getCurrentGalleryState().ratingDragging = true;
			getElement().ref.setPointerCapture?.( event.pointerId );
			actions.previewRating( event );
		},
		previewRating( event ) {
			getCurrentGalleryState().ratingPreview = getPointerRating(
				event.clientX,
				getElement().ref.getBoundingClientRect()
			);
		},
		commitRatingDrag( event ) {
			if ( ! getCurrentGalleryState().ratingDragging ) return;
			getCurrentGalleryState().ratingDragging = false;
			actions.updateRating(
				getPointerRating(
					event.clientX,
					getElement().ref.getBoundingClientRect()
				)
			);
		},
		cancelRatingDrag() {
			getCurrentGalleryState().ratingDragging = false;
			getCurrentGalleryState().ratingPreview = null;
		},
		leaveRatingPreview() {
			if ( ! getCurrentGalleryState().ratingDragging )
				getCurrentGalleryState().ratingPreview = null;
		},
		updateRating( rating ) {
			getCurrentImageState().clientRating =
				normalizeClientRating( rating );
			getCurrentGalleryState().ratingPreview = null;
			const block = getCurrentImageBlock();
			if ( block )
				block.dataset.proofingRating = String(
					getCurrentImageState().clientRating ?? ''
				);
			refreshCurrentGallery();
		},
		ratingSliderKeyDown( event ) {
			const next = getKeyboardRating(
				event.key,
				getCurrentImageState().clientRating
			);
			if ( next !== undefined ) {
				stopProofingClick( event );
				actions.updateRating( next );
			}
		},
		closeRatingPanel( event ) {
			stopProofingClick( event );
			actions.cancelRatingDrag();
			getCurrentGalleryState().openRatingPanel = '';
			getCurrentImageBlock()
				?.querySelector( '.fbks-proofing-thumbnail-control--rating' )
				?.focus();
		},
		ratingPanelKeyDown( event ) {
			if ( event.key !== 'Escape' ) {
				return;
			}
			stopProofingClick( event );
			getCurrentGalleryState().openRatingPanel = '';
			getCurrentImageBlock()
				?.querySelector( '.fbks-proofing-thumbnail-control--rating' )
				?.focus();
		},
		toggleHeart( event ) {
			stopProofingClick( event );

			const image = getCurrentImageState();
			const imageBlock = getCurrentImageBlock();
			image.hearted = ! image.hearted;
			if ( imageBlock ) {
				imageBlock.dataset.proofingHearted = image.hearted
					? 'true'
					: 'false';
			}
			refreshCurrentGallery();
		},
		toggleFlagPanel( event ) {
			stopProofingClick( event );
			getCurrentGalleryState().openRatingPanel = '';

			const context = getContext();
			const gallery = getCurrentGalleryState();
			gallery.openCommentPanel = '';
			gallery.openFlagPanel =
				gallery.openFlagPanel === context.imageId
					? ''
					: context.imageId;
		},
		setFlagFromContext( event ) {
			stopProofingClick( event );

			const color = getElement().ref.dataset.proofingFlagColor || '';
			const imageBlock = getCurrentImageBlock();
			getCurrentImageState().flag = color;
			if ( imageBlock ) {
				imageBlock.dataset.proofingFlag = color;
			}
			getCurrentGalleryState().openFlagPanel = '';
			refreshCurrentGallery();
		},
		toggleCommentPanel( event ) {
			stopProofingClick( event );

			const context = getContext();
			const gallery = getCurrentGalleryState();
			gallery.openRatingPanel = '';
			gallery.openFlagPanel = '';
			gallery.openCommentPanel =
				gallery.openCommentPanel === context.imageId
					? ''
					: context.imageId;
		},
		setCommentFromInput( event ) {
			const comment = truncateProofingComment(
				event?.target?.value || ''
			);
			if ( event?.target && event.target.value !== comment ) {
				event.target.value = comment;
			}
			const imageBlock = getCurrentImageBlock();
			getCurrentImageState().comment = comment;
			if ( imageBlock ) {
				imageBlock.dataset.proofingComment = comment;
				imageBlock.dataset.proofingCommented = comment.trim()
					? 'true'
					: 'false';
			}
			refreshCurrentGallery();
		},
		clearComment( event ) {
			stopProofingClick( event );

			const imageBlock = getCurrentImageBlock();
			getCurrentImageState().comment = '';
			if ( imageBlock ) {
				imageBlock.dataset.proofingComment = '';
				imageBlock.dataset.proofingCommented = 'false';
			}
			refreshCurrentGallery();
		},
		closePanels( event ) {
			stopProofingClick( event );

			const gallery = getCurrentGalleryState();
			gallery.openRatingPanel = '';
			gallery.openFlagPanel = '';
			gallery.openCommentPanel = '';
		},
		saveProgress( event ) {
			stopProofingClick( event );

			return persistGallery( getCurrentGalleryId(), 'in_progress' );
		},
		submitProofing( event ) {
			stopProofingClick( event );

			return persistGallery( getCurrentGalleryId(), 'submitted' );
		},
	},
	callbacks: {
		registerGallery() {
			const context = getContext();
			const element = getElement().ref;
			const scope = createFrontendScope();
			let unmount;
			// Read/update the proofing store outside the watcher so selections
			// cannot retrigger initialization and close an open control panel.
			scope.frame( () => {
				unmount = actions.registerGallery( context.galleryId, {
					element,
					galleryKey: context.galleryKey,
					clientEmail: context.clientEmail,
					pageId: context.pageId,
					restUrl: context.restUrl,
					presenceUrl: context.presenceUrl,
					trackPresence: context.trackPresence,
					emailAdminOnSubmit: context.emailAdminOnSubmit,
					savedSession: context.savedSession,
				} );
			} );
			return () => {
				scope.dispose();
				unmount?.();
			};
		},
		registerImage() {
			const context = getContext();
			const controlRoot = getElement().ref;
			const galleryId = getCurrentGalleryId();
			const imageBlock = controlRoot.closest(
				'.wp-block-folioblocks-pb-image-block'
			);

			actions.registerImage( galleryId, context.imageId, {
				attachmentId: context.attachmentId,
				thumbnail: context.thumbnail,
				title: context.title,
				element: controlRoot,
			} );

			if ( imageBlock ) {
				imageBlock.dataset.proofingImageId = context.imageId;
				const image = ensureImageState( galleryId, context.imageId );
				syncImageDom( controlRoot, imageBlock, image );
			}
		},
	},
} );
