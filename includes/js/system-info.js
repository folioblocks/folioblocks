( function () {
	const copyWithSelection = ( textarea ) => {
		textarea.focus();
		textarea.select();

		try {
			document.execCommand( 'copy' );
		} catch ( error ) {
			// The selected text remains available for a manual copy if the fallback fails.
		}
	};

	document.addEventListener( 'click', async ( event ) => {
		const button = event.target.closest( '[data-fbks-copy-system-info]' );

		if ( ! button ) {
			return;
		}

		const textarea = document.querySelector( '[data-fbks-system-info]' );

		if ( ! textarea ) {
			return;
		}

		if ( navigator.clipboard && window.isSecureContext ) {
			try {
				await navigator.clipboard.writeText( textarea.value );
				return;
			} catch ( error ) {
				copyWithSelection( textarea );
				return;
			}
		}

		copyWithSelection( textarea );
	} );
}() );
