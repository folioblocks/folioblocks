/**
 * Proofing Gallery Block
 * View.js
 */
document.addEventListener( 'DOMContentLoaded', () => {
	const galleries = document.querySelectorAll( '.fbks-proofing-gallery' );

	const icons = {
		heart:
			'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.4-9.4-8.2C.7 9.8 1.2 6.2 3.8 4.4 6 2.9 8.7 3.4 10.5 5.3L12 6.9l1.5-1.6c1.8-1.9 4.5-2.4 6.7-.9 2.6 1.8 3.1 5.4 1.2 8.4C19 16.6 12 21 12 21z" /></svg>',
		flag:
			'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4h10.6l.4 3.1h3v9H9.4L9 13.9H8V21H6z" /></svg>',
		comment:
			'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v10H8.7L5 18.4V5z" /></svg>',
	};

	const stopProofingClick = ( event ) => {
		event.preventDefault();
		event.stopPropagation();
	};

	const createIconButton = ( className, label, icon ) => {
		const button = document.createElement( 'button' );
		button.type = 'button';
		button.className = className;
		button.setAttribute( 'aria-label', label );
		button.innerHTML = icons[ icon ];
		return button;
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

	const applyFilter = ( gallery, filter ) => {
		const imageBlocks = gallery.querySelectorAll(
			'.wp-block-folioblocks-pb-image-block'
		);

		imageBlocks.forEach( ( imageBlock ) => {
			const flagColor = imageBlock.dataset.proofingFlag || '';
			const shouldShow =
				filter === 'all' ||
				( filter === 'hearted' &&
					imageBlock.dataset.proofingHearted === 'true' ) ||
				( filter === 'commented' &&
					imageBlock.dataset.proofingCommented === 'true' ) ||
				( filter.startsWith( 'flag-' ) &&
					flagColor === filter.replace( 'flag-', '' ) );

			imageBlock.classList.toggle( 'is-hidden', ! shouldShow );
		} );

		scheduleReflow( gallery );
	};

	const getActiveFilter = ( gallery ) =>
		gallery.querySelector(
			'.fbks-proofing-filter-button.is-active'
		)?.dataset.proofingFilter || 'all';

	const updateActiveFilter = ( gallery ) => {
		applyFilter( gallery, getActiveFilter( gallery ) );
	};

	const setFlagColor = ( imageBlock, flagButton, color ) => {
		imageBlock.dataset.proofingFlag = color || '';
		flagButton.classList.remove( 'is-red', 'is-orange', 'is-green' );
		if ( color ) {
			flagButton.classList.add( `is-${ color }` );
		}
		updateActiveFilter( imageBlock.closest( '.fbks-proofing-gallery' ) );
	};

	const toggleCommentPanel = ( imageBlock, commentButton ) => {
		const existingPanel = imageBlock.querySelector(
			'.fbks-proofing-comment-popover'
		);

		if ( existingPanel ) {
			existingPanel.remove();
			commentButton.classList.remove( 'is-open' );
			return;
		}

		imageBlock
			.querySelectorAll(
				'.fbks-proofing-comment-popover, .fbks-proofing-flag-popover'
			)
			.forEach( ( panel ) => panel.remove() );

		const panel = document.createElement( 'div' );
		panel.className = 'fbks-proofing-comment-popover';
		panel.innerHTML = `
			<label class="fbks-proofing-comment-popover__label">
				<span>Comment</span>
				<textarea class="fbks-proofing-comment-popover__field" rows="3" maxlength="500"></textarea>
			</label>
			<div class="fbks-proofing-comment-popover__actions">
				<button type="button" class="fbks-proofing-comment-popover__button" data-proofing-comment-action="clear">Clear</button>
				<button type="button" class="fbks-proofing-comment-popover__button is-primary" data-proofing-comment-action="done">Done</button>
			</div>
		`;

		const textarea = panel.querySelector( 'textarea' );
		textarea.value = imageBlock.dataset.proofingComment || '';
		textarea.addEventListener( 'click', stopProofingClick );
		textarea.addEventListener( 'input', () => {
			const value = textarea.value.trim();
			imageBlock.dataset.proofingComment = textarea.value;
			imageBlock.dataset.proofingCommented = value ? 'true' : 'false';
			commentButton.classList.toggle( 'is-active', !! value );
			updateActiveFilter( imageBlock.closest( '.fbks-proofing-gallery' ) );
		} );

		panel.addEventListener( 'click', ( event ) => {
			stopProofingClick( event );
			const action = event.target?.dataset?.proofingCommentAction;
			if ( action === 'clear' ) {
				textarea.value = '';
				imageBlock.dataset.proofingComment = '';
				imageBlock.dataset.proofingCommented = 'false';
				commentButton.classList.remove( 'is-active' );
				updateActiveFilter(
					imageBlock.closest( '.fbks-proofing-gallery' )
				);
			}
			if ( action === 'done' ) {
				panel.remove();
				commentButton.classList.remove( 'is-open' );
			}
		} );

		imageBlock.querySelector( '.pb-image-block' )?.appendChild( panel );
		commentButton.classList.add( 'is-open' );
		textarea.focus();
	};

	const toggleFlagPanel = ( imageBlock, flagButton ) => {
		const existingPanel = imageBlock.querySelector(
			'.fbks-proofing-flag-popover'
		);

		if ( existingPanel ) {
			existingPanel.remove();
			return;
		}

		imageBlock
			.querySelectorAll(
				'.fbks-proofing-comment-popover, .fbks-proofing-flag-popover'
			)
			.forEach( ( panel ) => panel.remove() );

		const panel = document.createElement( 'div' );
		panel.className = 'fbks-proofing-flag-popover';
		panel.innerHTML = `
			<button type="button" class="fbks-proofing-flag-swatch is-red" data-proofing-flag-color="red" aria-label="Red Flag"></button>
			<button type="button" class="fbks-proofing-flag-swatch is-orange" data-proofing-flag-color="orange" aria-label="Orange Flag"></button>
			<button type="button" class="fbks-proofing-flag-swatch is-green" data-proofing-flag-color="green" aria-label="Green Flag"></button>
			<button type="button" class="fbks-proofing-flag-clear" data-proofing-flag-color="">Clear</button>
		`;

		panel.addEventListener( 'click', ( event ) => {
			stopProofingClick( event );
			if ( ! Object.prototype.hasOwnProperty.call(
				event.target.dataset,
				'proofingFlagColor'
			) ) {
				return;
			}
			setFlagColor(
				imageBlock,
				flagButton,
				event.target.dataset.proofingFlagColor
			);
			panel.remove();
		} );

		imageBlock.querySelector( '.pb-image-block' )?.appendChild( panel );
	};

	const initImageBlock = ( gallery, imageBlock ) => {
		const figure = imageBlock.querySelector( '.pb-image-block' );
		if ( ! figure || figure.querySelector( '.fbks-proofing-thumbnail-controls' ) ) {
			return;
		}

		imageBlock.dataset.proofingHearted = 'false';
		imageBlock.dataset.proofingFlag = '';
		imageBlock.dataset.proofingCommented = 'false';
		imageBlock.dataset.proofingComment = '';

		const controls = document.createElement( 'div' );
		controls.className = 'fbks-proofing-thumbnail-controls';

		if ( gallery.dataset.enableHeart !== 'false' ) {
			const heartButton = createIconButton(
				'fbks-proofing-thumbnail-control fbks-proofing-thumbnail-control--heart',
				'Like image',
				'heart'
			);
			heartButton.setAttribute( 'aria-pressed', 'false' );
			heartButton.addEventListener( 'click', ( event ) => {
				stopProofingClick( event );
				const isLiked =
					imageBlock.dataset.proofingHearted !== 'true';
				imageBlock.dataset.proofingHearted = isLiked
					? 'true'
					: 'false';
				heartButton.classList.toggle( 'is-active', isLiked );
				heartButton.setAttribute(
					'aria-pressed',
					isLiked ? 'true' : 'false'
				);
				updateActiveFilter( gallery );
			} );
			controls.appendChild( heartButton );
		}

		if ( gallery.dataset.enableFlag !== 'false' ) {
			const flagButton = createIconButton(
				'fbks-proofing-thumbnail-control fbks-proofing-thumbnail-control--flag',
				'Set flag color',
				'flag'
			);
			flagButton.addEventListener( 'click', ( event ) => {
				stopProofingClick( event );
				toggleFlagPanel( imageBlock, flagButton );
			} );
			controls.appendChild( flagButton );
		}

		if ( gallery.dataset.enableComment !== 'false' ) {
			const commentButton = createIconButton(
				'fbks-proofing-thumbnail-control fbks-proofing-thumbnail-control--comment',
				'Comment on image',
				'comment'
			);
			commentButton.addEventListener( 'click', ( event ) => {
				stopProofingClick( event );
				toggleCommentPanel( imageBlock, commentButton );
			} );
			controls.appendChild( commentButton );
		}

		figure.appendChild( controls );
	};

	const initGallery = ( gallery ) => {
		gallery
			.querySelectorAll( '.wp-block-folioblocks-pb-image-block' )
			.forEach( ( imageBlock ) => initImageBlock( gallery, imageBlock ) );

		gallery
			.querySelectorAll( '.fbks-proofing-filter-button' )
			.forEach( ( button ) => {
				button.addEventListener( 'click', ( event ) => {
					stopProofingClick( event );
					gallery
						.querySelectorAll( '.fbks-proofing-filter-button' )
						.forEach( ( filterButton ) => {
							const isActive = filterButton === button;
							filterButton.classList.toggle(
								'is-active',
								isActive
							);
							filterButton.setAttribute(
								'aria-pressed',
								isActive ? 'true' : 'false'
							);
						} );
					applyFilter( gallery, button.dataset.proofingFilter );
				} );
			} );

		gallery
			.querySelectorAll(
				'.fbks-proofing-gallery__action-button--save, .fbks-proofing-gallery__action-button--submit'
			)
			.forEach( ( button ) => {
				button.addEventListener( 'click', stopProofingClick );
			} );
	};

	galleries.forEach( initGallery );
} );
