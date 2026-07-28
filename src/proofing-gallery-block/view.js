/**
 * Proofing Gallery Block
 * View.js
 */
import { getContext, getElement, store } from '@wordpress/interactivity';

const PROOFING_COMMENT_MAX_LENGTH = 1000;

const truncateProofingComment = ( comment = '' ) =>
	String( comment || '' ).slice( 0, PROOFING_COMMENT_MAX_LENGTH );

const createEmptyImageState = () => ( {
	attachmentId: 0,
	thumbnail: '',
	title: '',
	hearted: false,
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
			presenceTimer: null,
			presenceEventsBound: false,
			emailAdminOnSubmit: false,
			isSaving: false,
			notice: '',
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
	window.requestAnimationFrame( () => {
		if ( typeof window.pbApplyMasonryLayout === 'function' ) {
			window.pbApplyMasonryLayout( gallery );
		}
		if ( typeof window.folioBlocksJustifiedLayout === 'function' ) {
			window.folioBlocksJustifiedLayout( gallery );
		}
	} );
};

const getGalleryId = ( gallery ) => gallery.dataset.proofingGalleryId;

const getImageId = ( imageBlock ) => imageBlock.dataset.proofingImageId;

const getCurrentImageBlock = () =>
	getElement().ref.closest( '.wp-block-folioblocks-pb-image-block' );

const imageMatchesFilter = ( image, filter ) =>
	filter === 'all' ||
	( filter === 'hearted' && image.hearted ) ||
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

const serializeGalleryImages = ( gallery ) =>
	Array.from(
		gallery.element?.querySelectorAll(
			'.fbks-proofing-thumbnail-controls'
		) || []
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

	flagButton?.classList.remove( 'is-red', 'is-orange', 'is-green' );
	if ( image.flag ) {
		flagButton?.classList.add( `is-${ image.flag }` );
	}

	commentButton?.classList.toggle( 'is-active', !! image.comment.trim() );
	if ( textarea ) {
		textarea.value = image.comment || '';
	}
};

const syncGalleryDom = ( galleryId ) => {
	const gallery = ensureGalleryState( galleryId );

	gallery.element
		?.querySelectorAll( '.fbks-proofing-thumbnail-controls' )
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
	const gallery = ensureGalleryState( galleryId );

	if (
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
		window.navigator.sendBeacon(
			gallery.presenceUrl,
			new window.Blob( [ body ], { type: 'application/json' } )
		);
		return;
	}

	return window
		.fetch( gallery.presenceUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body,
		} )
		.catch( () => {} );
};

const sendTrackedGalleriesPresence = ( presence, useBeacon = false ) => {
	Object.keys( state.galleries ).forEach( ( galleryId ) => {
		sendGalleryPresence( galleryId, presence, useBeacon );
	} );
};

const bindPresenceEvents = ( galleryId ) => {
	const gallery = ensureGalleryState( galleryId );

	if ( ! gallery.trackPresence ) {
		return;
	}

	if ( gallery.presenceTimer ) {
		window.clearInterval( gallery.presenceTimer );
	}

	gallery.presenceTimer = window.setInterval( () => {
		sendGalleryPresence( galleryId, 'active' );
	}, 45000 );

	if ( window.fbksProofingPresenceEventsBound ) {
		return;
	}

	window.fbksProofingPresenceEventsBound = true;
	window.addEventListener( 'pagehide', () => {
		sendTrackedGalleriesPresence( 'closed', true );
	} );
	document.addEventListener( 'visibilitychange', () => {
		sendTrackedGalleriesPresence(
			document.visibilityState === 'hidden' ? 'closed' : 'active',
			document.visibilityState === 'hidden'
		);
	} );
};

const persistGallery = async ( galleryId, status ) => {
	const gallery = ensureGalleryState( galleryId );

	if ( ! gallery.restUrl || ! gallery.galleryKey ) {
		gallery.notice = 'This proofing gallery is missing save settings.';
		return;
	}

	gallery.isSaving = true;
	gallery.notice = '';

	const images = serializeGalleryImages( gallery );
	const localSession = {
		status,
		updatedAt: new Date().toISOString(),
		images,
	};

	window.localStorage?.setItem(
		`fbksProofingSession:${ gallery.galleryKey }`,
		JSON.stringify( localSession )
	);
	gallery.savedImages = imagesToMap( images );
	gallery.notice =
		status === 'submitted'
			? `Proofing selections submitted locally (${ images.length } images).`
			: `Progress saved locally (${ images.length } images).`;

	try {
		const response = await window.fetch( gallery.restUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
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
		gallery.savedImages = imagesToMap( result.images || [] );
		window.localStorage?.setItem(
			`fbksProofingSession:${ gallery.galleryKey }`,
			JSON.stringify( {
				status,
				updatedAt: result.updatedAt || new Date().toISOString(),
				images: result.images || images,
			} )
		);
		gallery.notice =
			status === 'submitted'
				? `Proofing selections submitted (${ images.length } images).`
				: `Progress saved (${ images.length } images). You can return later to continue.`;
	} catch ( error ) {
		gallery.notice = `${
			error?.message || 'Unable to save proofing session.'
		} Your progress was saved in this browser.`;
	} finally {
		gallery.isSaving = false;
	}
};

const { state, actions } = store( 'folioblocks/proofing-gallery', {
	state: {
		galleries: {},
		get isActiveFilter() {
			const context = getContext();
			const activeFilter =
				state.galleries[ context.galleryId ]?.activeFilter || 'all';

			return activeFilter === context.filter;
		},
		get isCurrentImageHearted() {
			return getCurrentImageState().hearted;
		},
		get isCurrentImageFlagRed() {
			return getCurrentImageState().flag === 'red';
		},
		get isCurrentImageFlagOrange() {
			return getCurrentImageState().flag === 'orange';
		},
		get isCurrentImageFlagGreen() {
			return getCurrentImageState().flag === 'green';
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
			const gallery = ensureGalleryState( galleryId );
			gallery.element =
				galleryData.element || gallery.element || document;
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
				galleryData.emailAdminOnSubmit ??
				gallery.emailAdminOnSubmit;
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
					image.hearted = !! savedImage.hearted;
					image.flag = savedImage.flag || '';
					image.comment = truncateProofingComment(
						savedImage.comment || ''
					);
				}
			);
			syncGalleryDom( galleryId );
			sendGalleryPresence( galleryId, 'active' );
			bindPresenceEvents( galleryId );
		},
		registerImage( galleryId, imageId, imageData = {} ) {
			const gallery = ensureGalleryState( galleryId );
			const image = ensureImageState( galleryId, imageId );
			const savedImage = gallery.savedImages[ imageId ];
			image.attachmentId = Number( imageData.attachmentId || 0 );
			image.thumbnail = imageData.thumbnail || '';
			image.title = imageData.title || '';

			if ( savedImage ) {
				image.hearted = !! savedImage.hearted;
				image.flag = savedImage.flag || '';
				image.comment = truncateProofingComment(
					savedImage.comment || ''
				);
			}

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
			ensureGalleryState( galleryId ).activeFilter = filter || 'all';
		},
		chooseFilter( event ) {
			stopProofingClick( event );

			const context = getContext();
			actions.setFilter( context.galleryId, context.filter );
			refreshCurrentGallery();
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

			actions.registerGallery( context.galleryId, {
				element: getElement().ref,
				galleryKey: context.galleryKey,
				clientEmail: context.clientEmail,
				pageId: context.pageId,
				restUrl: context.restUrl,
				presenceUrl: context.presenceUrl,
				trackPresence: context.trackPresence,
				emailAdminOnSubmit: context.emailAdminOnSubmit,
				savedSession: context.savedSession,
			} );
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
