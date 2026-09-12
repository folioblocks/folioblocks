/* eslint-disable no-alert */
( function () {
	'use strict';

	const config = window.folioBlocksMediaMetadataAdmin || {};

	function parseData( element, attribute, fallback ) {
		try {
			return JSON.parse( element.getAttribute( attribute ) || '' );
		} catch {
			return fallback;
		}
	}

	function getField( form, suffix ) {
		return Array.from( form.elements ).find(
			( field ) => field.name && field.name.endsWith( suffix )
		);
	}

	function comparableValue( value ) {
		return value === null || typeof value === 'undefined'
			? ''
			: String( value );
	}

	function fieldDiffers( form, suffix, embeddedValue ) {
		const field = getField( form, suffix );
		return field
			? comparableValue( field.value ) !==
					comparableValue( embeddedValue )
			: false;
	}

	function exifDiffers( form, embeddedExif ) {
		return Object.entries( embeddedExif || {} ).some( ( [ key, value ] ) =>
			fieldDiffers( form, `[fbks_media_exif][${ key }]`, value )
		);
	}

	function updateResetControl( status, differences ) {
		const reset = status.querySelector( '.fbks-media-metadata-reset' );
		if ( ! reset ) {
			return;
		}

		const hasDifferences = Object.values( differences ).some( Boolean );
		reset.hidden = ! hasDifferences;
		reset
			.querySelectorAll( 'option[data-reset-scope]' )
			.forEach( ( option ) => {
				const scope = option.dataset.resetScope;
				const available =
					scope === 'all'
						? hasDifferences
						: Boolean( differences[ scope ] );
				option.hidden = ! available;
				option.disabled = ! available;
			} );
		status.setAttribute(
			'data-differences',
			JSON.stringify( differences )
		);
	}

	function refreshResetControl( form ) {
		const status = form.querySelector(
			'[data-fbks-media-metadata-status]'
		);
		if ( ! status ) {
			return;
		}

		const embedded = parseData( status, 'data-reset-values', {} );
		const previous = parseData( status, 'data-differences', {} );
		const differences = {
			exif: form.querySelector( '[name*="[fbks_media_exif]"]' )
				? exifDiffers( form, embedded.exif )
				: Boolean( previous.exif ),
			rating: getField( form, '[fbks_media_rating]' )
				? fieldDiffers( form, '[fbks_media_rating]', embedded.rating )
				: Boolean( previous.rating ),
			colorClass: getField( form, '[fbks_media_color_class]' )
				? fieldDiffers(
						form,
						'[fbks_media_color_class]',
						embedded.colorClass
				  )
				: Boolean( previous.colorClass ),
		};

		updateResetControl( status, differences );
	}

	function updateColorSwatch( select ) {
		const wrapper = select.closest( '.fbks-media-metadata-value' );
		const swatch =
			wrapper && wrapper.querySelector( '.fbks-media-metadata-swatch' );
		const option = select.options[ select.selectedIndex ];
		const color = option && option.dataset.color;

		if ( ! swatch ) {
			return;
		}

		swatch.classList.toggle( 'is-hidden', ! color );
		if ( color ) {
			swatch.style.setProperty( '--fbks-media-metadata-color', color );
		} else {
			swatch.style.removeProperty( '--fbks-media-metadata-color' );
		}
	}

	function setFieldValue( form, suffix, value ) {
		const field = getField( form, suffix );
		if ( ! field ) {
			return;
		}

		const normalized = comparableValue( value );
		if (
			field instanceof window.HTMLSelectElement &&
			! Array.from( field.options ).some(
				( option ) => option.value === normalized
			)
		) {
			field.add( new window.Option( normalized, normalized ) );
		}
		field.value = normalized;

		if ( field.matches( '.fbks-media-metadata-select--color-class' ) ) {
			updateColorSwatch( field );
		}
	}

	function applyResetValues( form, library, scope ) {
		if ( scope === 'all' || scope === 'rating' ) {
			setFieldValue( form, '[fbks_media_rating]', library.rating );
		}
		if ( scope === 'all' || scope === 'colorClass' ) {
			setFieldValue(
				form,
				'[fbks_media_color_class]',
				library.colorClass
			);
		}
		if ( scope === 'all' || scope === 'exif' ) {
			Object.entries( library.exif || {} ).forEach(
				( [ key, value ] ) => {
					setFieldValue( form, `[fbks_media_exif][${ key }]`, value );
				}
			);
		}
	}

	async function resetMetadata( reset ) {
		const form = reset.closest( '.compat-item' );
		const status = reset.closest( '[data-fbks-media-metadata-status]' );
		const scope = reset.value;
		if ( ! form || ! status || ! scope ) {
			return;
		}

		if (
			! window.confirm( config.confirmReset || 'Reset this metadata?' )
		) {
			reset.value = '';
			return;
		}

		reset.disabled = true;
		try {
			const body = new URLSearchParams( {
				action: 'fbks_reset_media_metadata',
				nonce: config.nonce || '',
				attachmentId: status.dataset.attachmentId || '',
				scope,
			} );
			const response = await window.fetch(
				config.ajaxUrl || window.ajaxurl,
				{
					method: 'POST',
					credentials: 'same-origin',
					headers: {
						'Content-Type':
							'application/x-www-form-urlencoded; charset=UTF-8',
					},
					body: body.toString(),
				}
			);
			const result = await response.json();
			if ( ! response.ok || ! result.success ) {
				throw new Error( result.data && result.data.message );
			}

			applyResetValues( form, result.data.library || {}, scope );
			updateResetControl( status, result.data.differences || {} );
		} catch ( error ) {
			window.alert(
				error.message ||
					config.errorMessage ||
					'The metadata could not be reset.'
			);
		} finally {
			reset.value = '';
			reset.disabled = false;
		}
	}

	document.addEventListener(
		'change',
		( event ) => {
			const target = event.target;
			if ( ! ( target instanceof window.HTMLElement ) ) {
				return;
			}

			if ( target.matches( '.fbks-media-metadata-reset' ) ) {
				event.preventDefault();
				event.stopPropagation();
				resetMetadata( target );
				return;
			}

			if (
				target.matches( '.fbks-media-metadata-select--color-class' )
			) {
				updateColorSwatch( target );
			}
			if ( target.closest( '.compat-item' ) ) {
				refreshResetControl( target.closest( '.compat-item' ) );
			}
		},
		true
	);

	document.addEventListener(
		'input',
		( event ) => {
			const form =
				event.target.closest && event.target.closest( '.compat-item' );
			if ( form ) {
				refreshResetControl( form );
			}
		},
		true
	);
} )();
