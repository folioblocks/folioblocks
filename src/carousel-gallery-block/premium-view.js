/**
 * Carousel Gallery Block
 * Premium View JS
 */

document.addEventListener( 'DOMContentLoaded', () => {
	const blocks = document.querySelectorAll(
		'.wp-block-folioblocks-carousel-gallery-block'
	);

	blocks.forEach( ( block ) => {
		// Guard: don’t double-init this block if something re-runs DOMContentLoaded
		if ( block.dataset.pbPremiumInited === 'true' ) {
			return;
		}
		block.dataset.pbPremiumInited = 'true';

		const gallery = block.querySelector( '.pb-carousel-gallery' );
		if ( ! gallery ) {
			return;
		}

		// ---- Premium: Disable right-click (if enabled) ----
		if ( block.dataset.disableRightClick === 'true' ) {
			document.addEventListener(
				'contextmenu',
				( e ) => e.preventDefault(),
				{ passive: false }
			);
		}

		// ---- Premium: Autoplay wiring ----
		const autoplayEnabled = block.dataset.autoplay === 'true';
		if ( ! autoplayEnabled ) {
			return;
		} // Nothing else to do if autoplay is off

		const autoplaySpeed = Number( block.dataset.autoplaySpeed ) || 3;
		const carousel = gallery.__pbCarousel;
		if ( ! carousel ) {
			return;
		}
		// NOTE: dataset can be missing/incorrect depending on how the controls are rendered.
		// Treat "controls visible" as the source of truth.
		const showControlsFromDataset = block.dataset.showControls === 'true';
		const hasControlsMarkup =
			!! block.querySelector( '.pb-carousel-controls' ) ||
			!! block.querySelector( '.pb-carousel-play-button' );
		const showControls = showControlsFromDataset || hasControlsMarkup;

		let intervalId = null;

		// Icons and play/pause button(s) (controls markup can vary)
		// We support either:
		//  1) A single toggle button: .pb-carousel-play-button containing .play-icon + .pause-icon
		//  2) Separate buttons: .pb-carousel-play-button (play) and .pb-carousel-pause-button (pause)
		const playButton = block.querySelector( '.pb-carousel-play-button' );
		const pauseButton = block.querySelector( '.pb-carousel-pause-button' );

		// Icons may live inside the toggle button (common case)
		const playIcon = playButton?.querySelector( '.play-icon' );
		const pauseIcon = playButton?.querySelector( '.pause-icon' );

		const updateIcons = ( isPlaying ) => {
			// If we have a toggle button with icons, switch icons.
			if ( playIcon && pauseIcon ) {
				playIcon.style.display = isPlaying ? 'none' : 'inline';
				pauseIcon.style.display = isPlaying ? 'inline' : 'none';
			}

			// If we have separate buttons, optionally reflect state via aria-pressed.
			if ( playButton ) {
				playButton.setAttribute(
					'aria-pressed',
					String( !! isPlaying )
				);
			}
			if ( pauseButton ) {
				pauseButton.setAttribute(
					'aria-pressed',
					String( ! isPlaying )
				);
			}
		};

		const startAutoplay = () => {
			if ( intervalId ) {
				return;
			}

			// If the base carousel script hasn't finished positioning yet, wait for it.
			if ( ! gallery.classList.contains( 'pb-carousel-ready' ) ) {
				const readyObserver = new MutationObserver( () => {
					if ( gallery.classList.contains( 'pb-carousel-ready' ) ) {
						readyObserver.disconnect();
						carousel.syncCurrentIndex();
						startAutoplay();
					}
				} );
				readyObserver.observe( gallery, {
					attributes: true,
					attributeFilter: [ 'class' ],
				} );
				return;
			}

			updateIcons( true );
			intervalId = setInterval( () => {
				if ( ! carousel.next() ) {
					clearInterval( intervalId );
					intervalId = null;
					updateIcons( false );
				}
			}, autoplaySpeed * 1000 );
		};

		const stopAutoplay = () => {
			if ( ! intervalId ) {
				// Still update icons/state so UI never gets stuck showing “pause”.
				updateIcons( false );
				return;
			}
			clearInterval( intervalId );
			intervalId = null;
			updateIcons( false );
		};

		// Bind controls
		const bindControls = () => {
			// Avoid double-binding (some themes/plugins may re-run scripts)
			if ( block.dataset.pbPremiumControlsBound === 'true' ) {
				return;
			}
			block.dataset.pbPremiumControlsBound = 'true';

			// Separate pause button support
			if ( pauseButton ) {
				pauseButton.addEventListener( 'click', ( e ) => {
					e.preventDefault();
					e.stopPropagation();
					stopAutoplay();
				} );
			}

			// Toggle button support (or play-only button if pauseButton exists)
			if ( playButton ) {
				playButton.addEventListener( 'click', ( e ) => {
					e.preventDefault();
					e.stopPropagation();

					// If we have a separate pause button, treat play button as play-only.
					if ( pauseButton ) {
						startAutoplay();
						return;
					}

					// Otherwise toggle play/pause.
					if ( intervalId ) {
						stopAutoplay();
					} else {
						startAutoplay();
					}
				} );
			}
		};

		// If controls are shown, NEVER auto-start. Require user interaction.
		if ( showControls ) {
			bindControls();
			// Ensure initial icon state is “play”
			updateIcons( false );
		} else {
			// No controls visible: auto-start once the base script marks the gallery ready
			const maybeStart = () => {
				if ( gallery.classList.contains( 'pb-carousel-ready' ) ) {
					carousel.syncCurrentIndex();
					startAutoplay();
					observer.disconnect();
				}
			};
			const observer = new MutationObserver( maybeStart );
			observer.observe( gallery, {
				attributes: true,
				attributeFilter: [ 'class' ],
			} );
			// Fallback: if already ready by the time we run
			maybeStart();
		}

		// Keep index in sync with user swipe
		let t;
		gallery.addEventListener( 'scroll', () => {
			clearTimeout( t );
			t = setTimeout( carousel.syncCurrentIndex, 100 );
		} );

		window.addEventListener( 'resize', carousel.syncCurrentIndex );
	} );
} );
