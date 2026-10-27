( () => {
	const config = window.folioBlocksGlobalSettingsAutosave || {};
	const form = document.querySelector( '.pb-global-settings-form' );

	if ( ! form || ! config.ajaxUrl || ! config.nonce || ! window.fetch ) {
		return;
	}

    const imageCards = form.querySelectorAll( '[data-settings-section="block_image"], [data-settings-section="block_carousel"], [data-settings-section="block_filmstrip"], [data-settings-section="block_modular"], [data-settings-section="block_grid"], [data-settings-section="block_justified"], [data-settings-section="block_masonry"]' );
    const updateImageDefaults = () => {
        imageCards.forEach( imageDefaults => {
        const key = imageDefaults.dataset.settingsSection.slice(6);
        const read = name => imageDefaults.querySelector( `#fbks-default-${ key }-${ name }` );
        const action = read( 'imageClickAction' ).value;
        const target = read( 'imageClickTarget' ).value;
        const style = read( 'onHoverStyle' ).value;
        const downloadIcon = action === 'download' && target === 'icon';
        const secondaryLightbox = downloadIcon || ( [ 'carousel', 'modular', 'grid', 'justified', 'masonry' ].includes( key ) && [ 'custom_url', 'page_post' ].includes( action ) && target === 'icon' );
        const lightbox = action === 'lightbox' || ( secondaryLightbox && read( 'lightbox' ).checked );
        const conditions = {
            'link-target': [ 'download', 'media_file', 'custom_url', 'page_post' ].includes( action ),
            'link-icon': [ 'media_file', 'custom_url', 'page_post' ].includes( action ) && target === 'icon',
            'download-icon': downloadIcon,
            'secondary-lightbox': secondaryLightbox,
            download: action === 'download',
            autoplay: !!read( 'autoplay' )?.checked,
            controls: !!read( 'showControls' )?.checked,
            filter: !!read( 'enableFilter' )?.checked,
            lightbox,
            overlay: style !== 'none',
            entrance: [ 'blur-overlay', 'fade-overlay', 'color-overlay', 'gradient-overlay' ].includes( style ),
            exif: ( style !== 'none' && read( 'overlayContent' ).value === 'exif' ) || ( lightbox && read( 'lightboxContent' ).value.includes( 'exif' ) ),
            color: style === 'color-overlay',
            'overlay-text': [ 'color-overlay', 'gradient-overlay' ].includes( style ),
            chip: style === 'chip',
            'chip-text': [ 'chip', 'chip-gradient' ].includes( style ),
            gradient: style === 'gradient-overlay',
            'chip-gradient': style === 'chip-gradient',
        };
        imageDefaults.querySelectorAll( '[data-image-default-condition]' ).forEach( field => {
            field.hidden = ! conditions[ field.dataset.imageDefaultCondition ];
        } );
        } );
    };
    updateImageDefaults();
    imageCards.forEach( card => card.addEventListener( 'change', updateImageDefaults ) );

    const videoCards = form.querySelectorAll( '[data-settings-section="block_video"], [data-settings-section="block_video_gallery"]' );
    const updateVideoDefaults = () => {
        videoCards.forEach( videoDefaults => {
        const key = videoDefaults.dataset.settingsSection.slice(6);
        const input = name => videoDefaults.querySelector( `#fbks-default-${ key }-${ name }` );
        const read = name => input( name ).value;
        const filtering = !!input( 'enableFilter' )?.checked;
        const commerceAvailable = !!config.hasWooCommerce;
        const commerceEnabled = commerceAvailable && !!input( 'enableWooCommerce' )?.checked;
        const productOption = input( 'lightboxLayout' ).querySelector( '[value="video-product"]' );
        if ( productOption ) {
            productOption.hidden = !commerceEnabled;
            productOption.disabled = !commerceEnabled;
            if ( !commerceEnabled && read( 'lightboxLayout' ) === 'video-product' ) input( 'lightboxLayout' ).value = 'split';
        }
        const categoryOption = input( 'defaultOverlayContent' ).querySelector( '[value="title-play-category"]' );
        if ( categoryOption ) {
            categoryOption.hidden = !filtering;
            categoryOption.disabled = !filtering;
            if ( !filtering && read( 'defaultOverlayContent' ) === 'title-play-category' ) input( 'defaultOverlayContent' ).value = 'title-play';
        }
        const style = read( 'overlayStyle' );
        const conditions = {
            'video-color': style === 'color',
            'video-gradient': style === 'gradient',
            'video-text': [ 'color', 'gradient' ].includes( style ),
            'video-content': read( 'defaultOverlayContent' ) !== 'none',
            filter: filtering,
            woocommerce: commerceAvailable,
            commerce: commerceEnabled,
        };
        videoDefaults.querySelectorAll( '[data-image-default-condition]' ).forEach( field => {
            field.hidden = ! conditions[ field.dataset.imageDefaultCondition ];
        } );
        } );
    };
    updateVideoDefaults();
    videoCards.forEach( card => card.addEventListener( 'change', updateVideoDefaults ) );

    const proofingDefaults = form.querySelector( '[data-settings-section="block_proofing"]' );
    const updateProofingDefaults = () => {
        if ( !proofingDefaults ) return;
        const enabled = proofingDefaults.querySelector( '#fbks-default-proofing-enableFlag' ).checked;
        const advanced = proofingDefaults.querySelector( '#fbks-default-proofing-flagMode input:checked' )?.value === 'advanced';
        proofingDefaults.querySelectorAll( '[data-image-default-condition]' ).forEach( field => {
            field.hidden = !enabled || ( field.dataset.imageDefaultCondition === 'proofing-palette' && !advanced );
        } );
    };
    updateProofingDefaults();
    proofingDefaults?.addEventListener( 'change', updateProofingDefaults );

    // Use WordPress's own gradient editor, including color stops and transparency.
    if ( window.wp?.element?.createRoot && window.wp?.components?.GradientPicker ) {
        const { createElement, createRoot, useState, useEffect } = window.wp.element;
        function GradientControl( { input } ) {
            const [ value, setValue ] = useState( input.value );
            useEffect( () => {
                const reset = () => setValue( input.value );
                input.addEventListener( 'fbks:reset', reset );
                return () => input.removeEventListener( 'fbks:reset', reset );
            }, [ input ] );
            return createElement( window.wp.components.GradientPicker, {
                value: value || 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                clearable: false,
                enableAlpha: true,
                onChange: next => {
                    setValue( next || '' );
                    input.value = next || '';
                    input.dispatchEvent( new Event( 'input', { bubbles: true } ) );
                },
            } );
        }
        form.querySelectorAll( '[data-block-gradient-picker]' ).forEach( container => {
            createRoot( container ).render( createElement( GradientControl, { input: container.previousElementSibling } ) );
        } );
    }

    form.querySelectorAll( '[data-block-default-range]' ).forEach( range => {
        range.addEventListener( 'input', () => { range.nextElementSibling.value = range.value; } );
    } );

    const orientation = form.querySelector( '#fbks-default-before_after-sliderOrientation' );
    const labelPosition = form.querySelector( '#fbks-default-before_after-labelPosition' );
    if ( orientation && labelPosition ) {
        const positions = Array.from( labelPosition.options, option => option.cloneNode( true ) );
        const updateLabelPositions = () => {
            const selected = labelPosition.value;
            const allowed = orientation.value === 'vertical' ? [ 'left', 'center', 'right' ] : [ 'top', 'center', 'bottom' ];
            labelPosition.replaceChildren( ...allowed.map( value => positions.find( option => option.value === value ).cloneNode( true ) ) );
            labelPosition.value = allowed.includes( selected ) ? selected : 'center';
        };
        updateLabelPositions();
        orientation.addEventListener( 'change', updateLabelPositions );
    }

    // Keep stored CSS colors behind native pickers; preserve background transparency.
    form.querySelectorAll( '[data-block-color-picker]' ).forEach( picker => {
        const value = picker.querySelector( '[data-block-color-value]' );
        const swatch = picker.querySelector( '[data-block-color-swatch]' );
        const alpha = picker.querySelector( '[data-block-color-alpha]' );
        const output = picker.querySelector( '[data-block-color-opacity]' );
        const syncPicker = () => {
        const sample = document.createElement( 'span' );
        sample.style.color = value.value;
        sample.hidden = true;
        form.appendChild( sample );
        const channels = getComputedStyle( sample ).color.match( /[\d.]+/g );
        sample.remove();
        if ( channels?.length >= 3 ) {
            swatch.value = '#' + channels.slice( 0, 3 ).map( channel => Number( channel ).toString( 16 ).padStart( 2, '0' ) ).join( '' );
            if ( alpha ) { alpha.value = Math.round( Number( channels[3] ?? 1 ) * 100 ); output.value = `${ alpha.value }%`; }
        }
        };
        syncPicker();
        value.addEventListener( 'fbks:reset', syncPicker );
        const update = () => {
            const hex = swatch.value;
            const rgb = [ 1, 3, 5 ].map( offset => parseInt( hex.slice( offset, offset + 2 ), 16 ) );
            value.value = alpha ? `rgba(${ rgb.join( ', ' ) }, ${ Number( alpha.value ) / 100 })` : hex;
            if ( output ) output.value = `${ alpha.value }%`;
            value.dispatchEvent( new Event( 'input', { bubbles: true } ) );
        };
        swatch.addEventListener( 'input', update );
        swatch.addEventListener( 'change', update );
        alpha?.addEventListener( 'input', update );
        alpha?.addEventListener( 'change', update );
    } );

	const sections = Array.from(
		form.querySelectorAll( '[data-settings-section]' )
	);
	const fallbackSave = form.querySelector( '[data-global-save-fallback]' );
	const timers = new WeakMap();
	const queues = new WeakMap();
	const statusTimeouts = new WeakMap();

	if ( fallbackSave ) {
		fallbackSave.hidden = true;
	}

	const storeOpenSections = () => {
		if ( ! config.openPanelsStorageKey ) {
			return;
		}

		const openSections = sections
			.filter( ( section ) => section.open )
			.map( ( section ) => section.dataset.settingsSection )
			.filter( Boolean );

		try {
			window.localStorage.setItem(
				config.openPanelsStorageKey,
				JSON.stringify( openSections )
			);
		} catch {
			// Browser privacy settings may disable local storage.
		}
	};

	if ( config.openPanelsStorageKey ) {
		try {
			const savedOpenSections = JSON.parse(
				window.localStorage.getItem( config.openPanelsStorageKey )
			);

			if ( Array.isArray( savedOpenSections ) ) {
				sections.forEach( ( section ) => {
					section.open = savedOpenSections.includes(
						section.dataset.settingsSection
					);
				} );
			}
		} catch {
			// Ignore invalid or unavailable browser storage.
		}
	}

	sections.forEach( ( section ) => {
		section.addEventListener( 'toggle', storeOpenSections );
	} );

	const mediaMetadataSection = form.querySelector(
		'[data-media-metadata-settings]'
	);
	if ( mediaMetadataSection ) {
		const showControl = mediaMetadataSection.querySelector(
			'[data-media-metadata-show]'
		);
		const editingControl = mediaMetadataSection.querySelector(
			'[data-media-metadata-editing]'
		);
		const colorsControl = mediaMetadataSection.querySelector(
			'[data-media-metadata-colors]'
		);
		const presetControl = mediaMetadataSection.querySelector(
			'[data-media-metadata-preset]'
		);
		const metadataTypes = mediaMetadataSection.querySelector(
			'[data-media-metadata-types]'
		);
		const paletteRows = Array.from(
			mediaMetadataSection.querySelectorAll(
				'[data-media-metadata-palette-row]'
			)
		);
		const editRoleControls = Array.from(
			mediaMetadataSection.querySelectorAll(
				'input[name="fbks_media_metadata[editRoles][]"]'
			)
		).filter( ( control ) => control.value );
		let applyingPreset = false;

		const setHidden = ( selector, hidden ) => {
			mediaMetadataSection
				.querySelectorAll( selector )
				.forEach( ( item ) => {
					item.hidden = hidden;
				} );
		};

		const updateMediaMetadataVisibility = () => {
			const colorsEnabled = Boolean( colorsControl?.checked );

			setHidden(
				'[data-media-metadata-view-roles]',
				! showControl?.checked
			);
			if ( metadataTypes ) {
				metadataTypes.hidden = ! showControl?.checked;
			}
			setHidden(
				'[data-media-metadata-edit-roles]',
				! editingControl?.checked
			);
			setHidden( '[data-media-metadata-color-options]', ! colorsEnabled );
		};

		const updateRoleDependencies = () => {
			editRoleControls.forEach( ( editControl ) => {
				const viewControl = mediaMetadataSection.querySelector(
					`input[name="fbks_media_metadata[viewRoles][]"][value="${ editControl.value }"]`
				);
				if ( ! viewControl ) {
					return;
				}

				if ( editControl.checked ) {
					viewControl.checked = true;
				}
				viewControl.disabled =
					editControl.checked ||
					editControl.value === 'administrator';
			} );
		};

		const applyPalettePreset = ( presetKey ) => {
			const preset = config.mediaMetadataPalettes?.[ presetKey ];
			if ( ! preset?.items ) {
				return;
			}

			applyingPreset = true;
			paletteRows.forEach( ( row ) => {
				const value = row.dataset.mediaMetadataPaletteRow;
				const item = preset.items[ value ];
				if ( ! item ) {
					return;
				}

				const enabled = row.querySelector(
					'input[type="checkbox"][data-palette-field]'
				);
				const color = row.querySelector(
					'input[type="color"][data-palette-field]'
				);
				const label = row.querySelector(
					'input[type="text"][data-palette-field]'
				);

				if ( enabled ) {
					enabled.checked = Boolean( item.enabled );
				}
				if ( color ) {
					color.value = item.color;
				}
				if ( label ) {
					label.value = item.label;
				}
			} );
			applyingPreset = false;
		};

		[ showControl, editingControl, colorsControl ].forEach( ( control ) => {
			control?.addEventListener(
				'change',
				updateMediaMetadataVisibility
			);
		} );

		presetControl?.addEventListener( 'change', () => {
			applyPalettePreset( presetControl.value );
		} );
		editRoleControls.forEach( ( control ) => {
			control.addEventListener( 'change', updateRoleDependencies );
		} );

		mediaMetadataSection
			.querySelectorAll( '[data-palette-field]' )
			.forEach( ( control ) => {
				const markCustom = () => {
					if ( ! applyingPreset && presetControl ) {
						presetControl.value = 'custom';
					}
				};

				control.addEventListener( 'input', markCustom );
				control.addEventListener( 'change', markCustom );
			} );

		updateRoleDependencies();
		updateMediaMetadataVisibility();
	}

	const setSectionStatus = ( section, state, message ) => {
		const status = section.querySelector( '[data-autosave-status]' );
		if ( ! status ) {
			return;
		}

		window.clearTimeout( statusTimeouts.get( section ) );
		status.classList.remove( 'is-saving', 'is-saved', 'is-error' );
		if ( state ) {
			status.classList.add( `is-${ state }` );
		}
		status.textContent = message;
		status.title = state === 'error' ? message : '';

		if ( state === 'saved' ) {
			statusTimeouts.set(
				section,
				window.setTimeout( () => {
					status.textContent = '';
					status.classList.remove( 'is-saved' );
				}, 2500 )
			);
		}
	};

	const appendControls = ( data, scope, includeNewWatermark ) => {
		scope
			.querySelectorAll( 'input[name], select[name], textarea[name]' )
			.forEach( ( control ) => {
				if (
					control.disabled ||
					( ! includeNewWatermark &&
						control.closest( '[data-autosave-ignore]' ) ) ||
					( [ 'checkbox', 'radio' ].includes( control.type ) &&
						! control.checked )
				) {
					return;
				}

				data.append( control.name, control.value );
			} );
	};

	const buildRequest = ( section, operation ) => {
		const data = new URLSearchParams();
		data.set( 'action', 'fbks_save_global_settings_section' );
		data.set( 'nonce', config.nonce );
		data.set( 'section', section.dataset.settingsSection || '' );
		data.set( 'operation', operation );

		if ( operation === 'create_watermark' ) {
			const newWatermark = section.querySelector(
				'[data-watermark-new-item]'
			);
			if ( newWatermark ) {
				appendControls( data, newWatermark, true );
			}
		} else {
			appendControls( data, section, false );
		}

		return data;
	};

	const performSave = async ( section, operation = 'save' ) => {
		setSectionStatus( section, 'saving', config.savingText );

		const response = await window.fetch( config.ajaxUrl, {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type':
					'application/x-www-form-urlencoded; charset=UTF-8',
			},
			body: buildRequest( section, operation ).toString(),
		} );
		let result;

		try {
			result = await response.json();
		} catch {
			throw new Error( config.errorText );
		}

		if ( ! response.ok || ! result.success ) {
			const message = result?.data?.message || config.errorText;
			throw new Error( message );
		}

        const customized = section.querySelector( '[data-block-default-customized]' );
        if ( customized && typeof result?.data?.customized === 'boolean' ) {
            customized.hidden = !result.data.customized;
        }

		setSectionStatus(
			section,
			'saved',
			result?.data?.message || config.savedText
		);
		return result;
	};

	const saveSection = ( section, operation = 'save' ) => {
		const previous = queues.get( section ) || Promise.resolve();
		const next = previous
			.catch( () => undefined )
			.then( () => performSave( section, operation ) )
			.catch( ( error ) => {
				setSectionStatus(
					section,
					'error',
					error.message || config.errorText
				);
				throw error;
			} );

		queues.set( section, next );
		return next;
	};

	const scheduleSave = ( section, delay = 500 ) => {
		window.clearTimeout( timers.get( section ) );
		setSectionStatus( section, 'saving', config.savingText );
		timers.set(
			section,
			window.setTimeout( () => {
				saveSection( section ).catch( () => undefined );
			}, delay )
		);
	};

    form.querySelectorAll( '[data-reset-block-defaults]' ).forEach( button => {
        button.addEventListener( 'click', () => {
            const section = button.closest( '[data-settings-section]' );
            const defaults = JSON.parse( button.dataset.resetBlockDefaults );
            window.clearTimeout( timers.get( section ) );
            section.querySelectorAll( '[name]' ).forEach( control => {
                const key = control.name.match( /\[([^\]]+)\]$/ )?.[1];
                if ( ! Object.prototype.hasOwnProperty.call( defaults, key ) ) return;
                if ( control.type === 'radio' ) control.checked = control.value === defaults[ key ];
                else if ( control.type === 'checkbox' ) control.checked = defaults[ key ];
                else if ( control.type !== 'hidden' || control.hasAttribute( 'data-block-color-value' ) ) control.value = defaults[ key ] ?? '';
                control.dispatchEvent( new Event( 'fbks:reset' ) );
                // Update dependent selects and slider outputs without scheduling partial saves.
                control.dispatchEvent( new Event( 'change' ) );
                if ( control.hasAttribute( 'data-block-default-range' ) ) control.nextElementSibling.value = control.value;
            } );
            updateImageDefaults();
            updateVideoDefaults();
            updateProofingDefaults();
            saveSection( section, 'reset' ).catch( () => undefined );
        } );
    } );

	form.addEventListener( 'input', ( event ) => {
		const section = event.target.closest( '[data-settings-section]' );
		if ( ! section || event.target.closest( '[data-autosave-ignore]' ) ) {
			return;
		}

		scheduleSave( section );
	} );

	form.addEventListener( 'change', ( event ) => {
		const section = event.target.closest( '[data-settings-section]' );
		if ( ! section || event.target.closest( '[data-autosave-ignore]' ) ) {
			return;
		}

		if (
			event.target.matches( '.pb-watermark-delete-control input' ) &&
			event.target.checked &&
			// A destructive autosave needs an explicit confirmation.
			// eslint-disable-next-line no-alert
			! window.confirm( config.deleteConfirmText )
		) {
			event.target.checked = false;
			return;
		}

		window.clearTimeout( timers.get( section ) );
		saveSection( section )
			.then( () => {
				if (
					event.target.matches(
						'.pb-watermark-delete-control input'
					) &&
					event.target.checked
				) {
					window.location.reload();
				}
			} )
			.catch( () => undefined );
	} );

	form.addEventListener( 'submit', ( event ) => {
		event.preventDefault();
		sections.forEach( ( section ) => {
			window.clearTimeout( timers.get( section ) );
			saveSection( section ).catch( () => undefined );
		} );
	} );

	const scanPanel = form.querySelector( '[data-media-metadata-scan]' );
	if ( scanPanel ) {
		const scanButton = scanPanel.querySelector(
			'[data-media-metadata-scan-button]'
		);
		const scanStatus = scanPanel.querySelector(
			'[data-media-metadata-scan-status]'
		);
		const scanProgress = scanPanel.querySelector(
			'[data-media-metadata-scan-progress]'
		);
		const scanSection = scanPanel.closest( '[data-settings-section]' );
		const lastScan = form.querySelector(
			'[data-media-metadata-last-scan]'
		);
		const lastScanValue = lastScan?.querySelector(
			'[data-media-metadata-last-scan-value]'
		);
		let scanState = config.mediaMetadataScanState || { status: 'idle' };
		let scanRunning = false;

		const updateScanDisplay = ( state ) => {
			scanState = state || { status: 'idle' };
			const total = Number( scanState.total ) || 0;
			const processed = Number( scanState.processed ) || 0;

			if ( scanStatus && scanState.message ) {
				scanStatus.textContent = scanState.message;
			}
			if ( lastScan && lastScanValue && scanState.lastScanned ) {
				lastScanValue.textContent = scanState.lastScanned;
				lastScan.hidden = false;
			}

			if ( scanProgress ) {
				scanProgress.max = Math.max( total, 1 );
				scanProgress.value = Math.min(
					processed,
					Math.max( total, 1 )
				);
				scanProgress.hidden =
					scanState.status === 'idle' || total === 0;
			}

			if ( scanButton && ! scanRunning ) {
				let buttonText = config.scanExistingText;
				if ( scanState.status === 'running' ) {
					buttonText = config.resumeScanText;
				} else if ( scanState.status === 'complete' ) {
					buttonText = config.scanAgainText;
				}
				scanButton.textContent = buttonText;
			}
		};

		const requestScan = async ( operation ) => {
			const data = new URLSearchParams();
			data.set( 'action', 'fbks_scan_existing_media_metadata' );
			data.set( 'nonce', config.nonce );
			data.set( 'operation', operation );

			const response = await window.fetch( config.ajaxUrl, {
				method: 'POST',
				credentials: 'same-origin',
				headers: {
					'Content-Type':
						'application/x-www-form-urlencoded; charset=UTF-8',
				},
				body: data.toString(),
			} );
			let result;

			try {
				result = await response.json();
			} catch {
				throw new Error( config.scanErrorText );
			}

			if ( ! response.ok || ! result.success ) {
				throw new Error(
					result?.data?.message || config.scanErrorText
				);
			}

			return result.data;
		};

		const runScan = async () => {
			if ( scanRunning || ! scanButton ) {
				return;
			}

			scanRunning = true;
			scanButton.disabled = true;
			scanButton.textContent = config.scanningText;
			let errorMessage = '';

			try {
				if ( scanState.status !== 'running' ) {
					if ( scanSection ) {
						window.clearTimeout( timers.get( scanSection ) );
						await saveSection( scanSection );
					}
					updateScanDisplay( await requestScan( 'start' ) );
				}

				while ( scanState.status === 'running' ) {
					updateScanDisplay( await requestScan( 'batch' ) );
				}
			} catch ( error ) {
				errorMessage = error.message || config.scanErrorText;
			} finally {
				scanRunning = false;
				scanButton.disabled = false;
				updateScanDisplay( scanState );
				if ( scanStatus && errorMessage ) {
					scanStatus.textContent = errorMessage;
					scanStatus.classList.add( 'is-error' );
				}
			}
		};

		scanButton?.addEventListener( 'click', () => {
			scanStatus?.classList.remove( 'is-error' );
			runScan();
		} );

		updateScanDisplay( scanState );
	}

	const saveNewWatermark = form.querySelector( '[data-save-new-watermark]' );
	if ( saveNewWatermark ) {
		saveNewWatermark.addEventListener( 'click', async () => {
			const section = saveNewWatermark.closest(
				'[data-settings-section]'
			);

			if ( ! section ) {
				return;
			}

			const draftStatus = form.querySelector(
				'[data-new-watermark-status]'
			);

			window.clearTimeout( timers.get( section ) );
			saveNewWatermark.disabled = true;
			if ( draftStatus ) {
				draftStatus.classList.remove( 'is-error' );
				draftStatus.textContent = config.savingWatermarkText;
			}

			try {
				await saveSection( section );
				const result = await saveSection( section, 'create_watermark' );
				if ( draftStatus ) {
					draftStatus.textContent =
						result?.data?.message || config.watermarkSavedText;
				}
				window.setTimeout( () => window.location.reload(), 350 );
			} catch ( error ) {
				saveNewWatermark.disabled = false;
				if ( draftStatus ) {
					draftStatus.classList.add( 'is-error' );
					draftStatus.textContent = error.message || config.errorText;
				}
			}
		} );
	}
} )();
