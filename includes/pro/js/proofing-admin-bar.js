( function () {
	const settings = window.fbksProofingAdminBar || {};

	if ( ! settings.endpoint || ! settings.nonce ) {
		return;
	}

	const pollInterval = Number( settings.interval ) || 30000;
	let timerId = null;
	let stopped = false;
	let clearingSubmitted = false;

	const getNode = () =>
		document.getElementById( 'wp-admin-bar-fbks-proofing-gallery' );

	const requestState = () => {
		if ( window.wp?.apiFetch ) {
			return window.wp.apiFetch( {
				url: settings.endpoint,
				headers: {
					'X-WP-Nonce': settings.nonce,
				},
			} );
		}

		return window
			.fetch( settings.endpoint, {
				credentials: 'same-origin',
				headers: {
					'X-WP-Nonce': settings.nonce,
				},
			} )
			.then( ( response ) => {
				if ( response.status === 401 || response.status === 403 ) {
					const error = new Error( 'Permission denied' );
					error.status = response.status;
					throw error;
				}

				return response.json();
			} );
	};

	const clearSubmittedSessions = () => {
		if ( clearingSubmitted || ! settings.clearSubmittedEndpoint ) {
			return;
		}

		clearingSubmitted = true;

		const request = window.wp?.apiFetch
			? window.wp.apiFetch( {
					url: settings.clearSubmittedEndpoint,
					method: 'POST',
					headers: {
						'X-WP-Nonce': settings.nonce,
					},
			  } )
			: window
					.fetch( settings.clearSubmittedEndpoint, {
						method: 'POST',
						credentials: 'same-origin',
						headers: {
							'X-WP-Nonce': settings.nonce,
						},
					} )
					.then( ( response ) => response.json() );

		request
			.then( applyState )
			.catch( ( error ) => {
				if ( window.console?.debug ) {
					window.console.debug(
						'FolioBlocks proofing submitted session clearing failed.',
						error
					);
				}
			} )
			.finally( () => {
				clearingSubmitted = false;
			} );
	};

	const getErrorStatus = ( error ) => error?.status || error?.data?.status;

	const updateClasses = ( node, state ) => {
		node.classList.remove(
			'has-active',
			'has-submitted',
			'has-unfinished',
			'is-empty',
			'is-disabled'
		);

		if ( ! state.enabled ) {
			node.classList.add( 'is-disabled' );
			return;
		}

		if ( state.hasActive ) {
			node.classList.add( 'has-active' );
			return;
		}

		if ( state.hasSubmitted ) {
			node.classList.add( 'has-submitted' );
			return;
		}

		if ( state.hasAttention ) {
			node.classList.add( 'has-unfinished' );
			return;
		}

		node.classList.add( 'is-empty' );
	};

	const updateCount = ( node, state ) => {
		const count = node.querySelector( '.fbks-proofing-admin-bar-count' );

		if ( ! count ) {
			return;
		}

		const value = Number( state.titleCount ) || 0;
		count.textContent = String( value );
		count.classList.toggle( 'is-hidden', value === 0 );
	};

	const updateDropdown = ( state ) => {
		const dropdownItem = document.querySelector(
			'#wp-admin-bar-fbks-proofing-gallery-dropdown > .ab-item'
		);

		if ( dropdownItem && state.dropdownHtml ) {
			dropdownItem.innerHTML = state.dropdownHtml;
		}
	};

	const applyState = ( state ) => {
		const node = getNode();

		if ( ! node ) {
			return;
		}

		node.hidden = ! state.enabled;
		updateClasses( node, state );

		if ( ! state.enabled ) {
			return;
		}

		updateCount( node, state );
		updateDropdown( state );
	};

	const schedule = () => {
		window.clearTimeout( timerId );

		if ( stopped || document.visibilityState !== 'visible' ) {
			return;
		}

		timerId = window.setTimeout( refresh, pollInterval );
	};

	function refresh() {
		if ( stopped || document.visibilityState !== 'visible' ) {
			schedule();
			return;
		}

		requestState()
			.then( applyState )
			.catch( ( error ) => {
				const status = getErrorStatus( error );

				if ( status === 401 || status === 403 ) {
					stopped = true;
					window.clearTimeout( timerId );
					return;
				}

				if ( window.console?.debug ) {
					window.console.debug(
						'FolioBlocks proofing admin bar polling failed.',
						error
					);
				}
			} )
			.finally( schedule );
	}

	document.addEventListener( 'visibilitychange', () => {
		if ( document.visibilityState === 'visible' ) {
			refresh();
			return;
		}

		window.clearTimeout( timerId );
	} );

	document.addEventListener( 'click', ( event ) => {
		const allSessionsButton = event.target.closest(
			'.fbks-proofing-admin-bar-all'
		);
		if ( allSessionsButton ) {
			const href = allSessionsButton.dataset.href;

			if ( href ) {
				event.preventDefault();
				window.location.assign( href );
			}

			return;
		}

		if (
			event.target.closest( '.fbks-proofing-admin-bar-clear-submitted' )
		) {
			event.preventDefault();
			clearSubmittedSessions();
		}
	} );

	refresh();
} )();
