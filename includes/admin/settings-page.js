( function () {
	const config = window.folioBlocksDashboardNews;

	if ( ! config || ! config.ajaxUrl || ! config.nonce ) {
		return;
	}

	const newsList = document.querySelector( '[data-fbks-dashboard-news]' );

	if ( ! newsList ) {
		return;
	}

	const refreshButton = document.querySelector(
		'[data-fbks-dashboard-news-refresh]'
	);

	const showFallback = () => {
		newsList.innerHTML = `<li class="pb-news-item--empty">${ config.emptyText }</li>`;
	};

	const setLoading = ( isLoading ) => {
		newsList.setAttribute( 'aria-busy', isLoading ? 'true' : 'false' );
		if ( refreshButton ) {
			refreshButton.disabled = isLoading;
			refreshButton.classList.toggle( 'is-loading', isLoading );
		}
	};

	const loadNews = ( forceRefresh = false ) => {
		const formData = new FormData();
		formData.append( 'action', 'fbks_dashboard_news' );
		formData.append( 'nonce', config.nonce );
		if ( forceRefresh ) {
			formData.append( 'refresh', '1' );
		}

		setLoading( true );

		return fetch( config.ajaxUrl, {
			method: 'POST',
			credentials: 'same-origin',
			body: formData,
		} )
			.then( ( response ) => {
				if ( ! response.ok ) {
					throw new Error( 'Unable to load FolioBlocks news.' );
				}

				return response.json();
			} )
			.then( ( result ) => {
				if ( ! result.success || ! result.data || ! result.data.html ) {
					throw new Error( 'Unable to load FolioBlocks news.' );
				}

				newsList.innerHTML = result.data.html;
			} )
			.catch( () => {
				if ( ! forceRefresh ) {
					showFallback();
				}
			} )
			.finally( () => setLoading( false ) );
	};

	if ( refreshButton ) {
		refreshButton.addEventListener( 'click', () => loadNews( true ) );
	}

	loadNews();
} )();
