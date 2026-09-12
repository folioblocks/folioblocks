( () => {
	const config = window.folioBlocksGlobalSettingsAutosave || {};
	const form = document.querySelector( '.pb-global-settings-form' );

	if ( ! form || ! config.ajaxUrl || ! config.nonce || ! window.fetch ) {
		return;
	}

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
