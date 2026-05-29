/**
 * Grid Gallery Block
 * Premium JS
 */
import { __ } from '@wordpress/i18n';
import {
	LineHeightControl,
	__experimentalUnitControl as UnitControl,
	__experimentalTextDecorationControl as TextDecorationControl,
	__experimentalTextTransformControl as TextTransformControl,
	__experimentalFontAppearanceControl as FontAppearanceControl,
	useSettings,
} from '@wordpress/block-editor';
import {
	ToggleControl,
	SelectControl,
	RangeControl,
	TextControl,
	FontSizePicker,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { addFilter } from '@wordpress/hooks';
import { useEffect, useRef } from '@wordpress/element';
import { applyThumbnails } from '../pb-helpers/applyThumbnails';
import CompactColorControl, {
	CompactTwoColorControl,
} from '../pb-helpers/CompactColorControl';
import {
	getFontFamilyOptions,
	normalizeFontFamilies,
	normalizeFontSizes,
	getFontSizeOptions,
	getFilterTypographyCSS,
} from '../pb-helpers/GetThemeSettings';
import {
	FBKS_ALL_FILTER_TOKEN,
	fbksIsAllFilterValue,
	fbksNormalizeActiveFilterValue,
} from '../pb-helpers/filterConstants';
import { registerImageClickActionPremiumControls } from '../pb-helpers/imageClickActionPremiumControls';
import { registerImageHoverActionPremiumControls } from '../pb-helpers/imageHoverActionPremiumControls';

const getImageBlockFilterCategories = ( blockAttributes = {} ) => {
	const assignedCategories = Array.isArray( blockAttributes.filterCategories )
		? blockAttributes.filterCategories
				.map( ( category ) =>
					typeof category === 'string' ? category.trim() : ''
				)
				.filter( Boolean )
		: [];

	if ( assignedCategories.length > 0 ) {
		return [ ...new Set( assignedCategories ) ];
	}

	const legacyCategory =
		typeof blockAttributes.filterCategory === 'string'
			? blockAttributes.filterCategory.trim()
			: '';
	return legacyCategory ? [ legacyCategory ] : [];
};

registerImageHoverActionPremiumControls( {
	hookPrefix: 'folioBlocks.gridGallery',
	namespace: 'folioblocks/grid-gallery',
	stylePanelLabel: __( 'Gallery Hover Styles', 'folioblocks' ),
} );

registerImageClickActionPremiumControls( {
	hookPrefix: 'folioBlocks.gridGallery',
	namespace: 'folioblocks/grid-gallery',
} );

addFilter(
	'folioBlocks.gridGallery.editorEnhancements',
	'folioblocks/grid-gallery-premium-thumbnails',
	( _, { clientId, innerBlocks, isBlockOrChildSelected } ) => {
		// This filter injects editor-only enhancements like List View thumbnails
		useEffect( () => {
			if ( isBlockOrChildSelected ) {
				setTimeout( () => {
					applyThumbnails( clientId );
				}, 200 );
			}
		}, [ isBlockOrChildSelected ] );

		useEffect( () => {
			const hasImages = innerBlocks.length > 0;
			const listViewHasThumbnails = document.querySelector(
				'[data-pb-thumbnail-applied="true"]'
			);

			if ( hasImages && ! listViewHasThumbnails ) {
				setTimeout( () => {
					applyThumbnails( clientId );
				}, 300 );
			}
		}, [ innerBlocks ] );

		return null;
	}
);
addFilter(
	'folioBlocks.gridGallery.editorEnhancements',
	'folioblocks/grid-gallery-randomize',
	( _, props = {} ) => {
		const { clientId, innerBlocks = [], attributes = {} } = props;
		const { randomizeOrder } = attributes;
		const ranOnce = useRef( false );

		useEffect( () => {
			if ( ! randomizeOrder || innerBlocks.length === 0 ) {
				return;
			}
			if ( ranOnce.current ) {
				return;
			} // already shuffled
			ranOnce.current = true;

			const shuffled = [ ...innerBlocks ];
			for ( let i = shuffled.length - 1; i > 0; i-- ) {
				const j = Math.floor( Math.random() * ( i + 1 ) );
				[ shuffled[ i ], shuffled[ j ] ] = [
					shuffled[ j ],
					shuffled[ i ],
				];
			}

			wp.data
				.dispatch( 'core/block-editor' )
				.replaceInnerBlocks( clientId, shuffled, false );
		}, [ randomizeOrder ] );

		// Reset when user toggles randomize off
		useEffect( () => {
			if ( ! randomizeOrder ) {
				ranOnce.current = false;
			}
		}, [ randomizeOrder ] );

		return null;
	}
);
addFilter(
	'folioBlocks.gridGallery.randomizeToggle',
	'folioblocks/grid-gallery-premium-toggle',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={ __( 'Randomize Image Order', 'folioblocks' ) }
				checked={ !! attributes.randomizeOrder }
				onChange={ ( value ) =>
					setAttributes( { randomizeOrder: value } )
				}
				__nextHasNoMarginBottom
				help={ __( 'Randomize order of images.', 'folioblocks' ) }
			/>
		);
	}
);

addFilter(
	'folioBlocks.gridGallery.disableRightClickToggle',
	'folioblocks/grid-gallery-premium-disable-right-click',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={ __( 'Disable Right-Click on Page', 'folioblocks' ) }
				help={ __(
					'Prevents visitors from right-clicking.',
					'folioblocks'
				) }
				__nextHasNoMarginBottom
				checked={ !! attributes.disableRightClick }
				onChange={ ( value ) =>
					setAttributes( { disableRightClick: value } )
				}
			/>
		);
	}
);

addFilter(
	'folioBlocks.gridGallery.lazyLoadToggle',
	'folioblocks/grid-gallery-premium-lazy-load',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={ __( 'Enable Lazy Load of Images', 'folioblocks' ) }
				help={ __(
					'Enables lazy loading of gallery images.',
					'folioblocks'
				) }
				__nextHasNoMarginBottom
				checked={ !! attributes.lazyLoad }
				onChange={ ( value ) => setAttributes( { lazyLoad: value } ) }
			/>
		);
	}
);

addFilter(
	'folioBlocks.gridGallery.filterLogic',
	'folioblocks/grid-gallery-premium-filter-logic',
	( _, { attributes, setAttributes, selectedBlock } ) => {
		const {
			enableFilter = false,
			filterAlign = 'center',
			filtersInput = '',
			activeFilter = FBKS_ALL_FILTER_TOKEN,
		} = attributes;

		// Derive categories from filtersInput
		const filterCategories = filtersInput
			.split( ',' )
			.map( ( s ) => s.trim() )
			.filter( Boolean );

		// Sync derived categories
		useEffect( () => {
			setAttributes( { filterCategories } );
		}, [ filtersInput ] );

		// Reset activeFilter if selected block becomes hidden
		useEffect( () => {
			if (
				selectedBlock &&
				selectedBlock.name === 'folioblocks/pb-image-block'
			) {
				const selectedCategories = getImageBlockFilterCategories(
					selectedBlock.attributes || {}
				);
				const normalizedActiveFilter =
					fbksNormalizeActiveFilterValue(
						activeFilter
					).toLowerCase();
				const isFilteredOut =
					! fbksIsAllFilterValue( activeFilter ) &&
					! selectedCategories.some(
						( category ) =>
							category.toLowerCase() === normalizedActiveFilter
					);

				if ( isFilteredOut ) {
					setAttributes( { activeFilter: FBKS_ALL_FILTER_TOKEN } );
				}
			}
		}, [ selectedBlock, activeFilter ] );

		// Keep these base filter attributes consistent
		useEffect( () => {
			if ( attributes.enableFilter !== enableFilter ) {
				setAttributes( { enableFilter } );
			}
			if ( attributes.filterAlign !== filterAlign ) {
				setAttributes( { filterAlign } );
			}
		}, [ enableFilter, filterAlign ] );

		return null;
	}
);
addFilter(
	'folioBlocks.gridGallery.enableFilterToggle',
	'folioblocks/grid-gallery-premium-filter-toggle',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;
		const { enableFilter, filterAlign, filtersInput } = attributes;

		const handleFilterInputChange = ( val ) => {
			setAttributes( { filtersInput: val } );
		};
		const handleFilterInputBlur = () => {
			const rawFilters = filtersInput
				.split( ',' )
				.map( ( f ) => f.trim() );
			const cleanFilters = rawFilters.filter( Boolean );
			setAttributes( { filterCategories: cleanFilters } );
		};
		return (
			<>
				<ToggleControl
					label={ __( 'Enable Image Filtering', 'folioblocks' ) }
					checked={ !! attributes.enableFilter }
					onChange={ ( val ) =>
						setAttributes( { enableFilter: val } )
					}
					__nextHasNoMarginBottom
					help={ __(
						'Enable image filtering with categories.',
						'folioblocks'
					) }
				/>
				{ enableFilter && (
					<>
						<ToggleGroupControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							value={ filterAlign }
							isBlock
							label={ __(
								'Filter Bar Alignment',
								'folioblocks'
							) }
							help={ __(
								'Set alignment of the filter bar.',
								'folioblocks'
							) }
							onChange={ ( value ) =>
								setAttributes( { filterAlign: value } )
							}
						>
							<ToggleGroupControlOption
								label={ __( 'Left', 'folioblocks' ) }
								value="left"
							/>
							<ToggleGroupControlOption
								label={ __( 'Center', 'folioblocks' ) }
								value="center"
							/>
							<ToggleGroupControlOption
								label={ __( 'Right', 'folioblocks' ) }
								value="right"
							/>
						</ToggleGroupControl>
						<TextControl
							label={ __( 'Filter Categories', 'folioblocks' ) }
							value={ filtersInput }
							onChange={ handleFilterInputChange }
							onBlur={ handleFilterInputBlur }
							help={ __(
								'Separate categories with commas',
								'folioblocks'
							) }
							__nextHasNoMarginBottom
							__next40pxDefaultSize
						/>
					</>
				) }
			</>
		);
	}
);

addFilter(
	'folioBlocks.gridGallery.imageStyles',
	'folioblocks/grid-gallery-premium-image-styles',
	( defaultContent, props ) => {
		const { attributes, setAttributes, clientId, updateBlockAttributes } =
			props;

		const forceRefresh = () => {
			if ( typeof updateBlockAttributes === 'function' ) {
				setTimeout( () => {
					updateBlockAttributes( clientId, {
						_forceRefresh: Date.now(),
					} );
				}, 50 );
			}
		};

		return (
			<>
				<CompactColorControl
					label={ __( 'Border Color', 'folioblocks' ) }
					value={ attributes.borderColor }
					onChange={ ( borderColor ) => {
						setAttributes( { borderColor } );
						forceRefresh();
					} }
					help={ __( 'Set Image border color.', 'folioblocks' ) }
				/>

				<RangeControl
					label={ __( 'Border Width', 'folioblocks' ) }
					value={ attributes.borderWidth }
					onChange={ ( value ) => {
						setAttributes( { borderWidth: value } );
						forceRefresh();
					} }
					min={ 0 }
					max={ 15 }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					help={ __( 'Set Image border width.', 'folioblocks' ) }
				/>

				<RangeControl
					label={ __( 'Border Radius', 'folioblocks' ) }
					value={ attributes.borderRadius }
					onChange={ ( value ) => {
						setAttributes( { borderRadius: value } );
						forceRefresh();
					} }
					min={ 0 }
					max={ 50 }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					help={ __( 'Set Image border radius.', 'folioblocks' ) }
				/>

				<ToggleControl
					label={ __( 'Enable Drop Shadow', 'folioblocks' ) }
					checked={ !! attributes.dropShadow }
					onChange={ ( newDropShadow ) =>
						setAttributes( { dropShadow: newDropShadow } )
					}
					__nextHasNoMarginBottom
					help={ __(
						'Applies a subtle drop shadow to images.',
						'folioblocks'
					) }
				/>
			</>
		);
	}
);

addFilter(
	'folioBlocks.gridGallery.filterStyleSettings',
	'folioblocks/grid-gallery-premium-filter-styles',
	( defaultContent, { attributes, setAttributes } ) => {
		// IMPORTANT: Hooks must be called in the same order on every render.
		// We call useSettings() unconditionally, then decide what to render.
		const [ themeFontSizes ] = useSettings( 'typography.fontSizes' );
		const normalizedFontSizes = normalizeFontSizes( themeFontSizes );
		const fontSizeOptions = getFontSizeOptions( normalizedFontSizes );

		// Pull font families from theme.json / Global Styles.
		// Depending on WP version, this can be an array or an object with groups (e.g. { theme: [], custom: [] }).
		const [ fontFamilies ] = useSettings( 'typography.fontFamilies' );
		const families = normalizeFontFamilies( fontFamilies );
		const fontFamilyOptions = getFontFamilyOptions( families, __ );
		const forceRefresh = () => {
			setAttributes( { _forceRefresh: Date.now() } );
		};

		if ( ! attributes.enableFilter ) {
			return null;
		}

		return (
			<>
				<ToolsPanel
					label={ __( 'Filter Bar Styles', 'folioblocks' ) }
					resetAll={ () =>
						setAttributes( {
							filterFontFamily: '',
							filterFontSize: 16,
							filterFontWeight: '',
							filterFontStyle: '',
							filterLineHeight: null,
							filterLetterSpacing: 0,
							filterTextDecoration: 'none',
							filterTextTransform: 'none',
						} )
					}
				>
					<ToolsPanelItem
						label={ __( 'Font Family', 'folioblocks' ) }
						hasValue={ () => !! attributes.filterFontFamily }
						onDeselect={ () =>
							setAttributes( { filterFontFamily: '' } )
						}
						isShownByDefault
					>
						<SelectControl
							label={ __( 'Font Family', 'folioblocks' ) }
							value={ attributes.filterFontFamily || '' }
							options={ fontFamilyOptions }
							onChange={ ( value ) =>
								setAttributes( { filterFontFamily: value } )
							}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							help={
								fontFamilyOptions.length > 1
									? __(
											'Uses fonts from your theme’s Global Styles.',
											'folioblocks'
									  )
									: __(
											'No theme fonts found. Add font families in theme.json or Global Styles.',
											'folioblocks'
									  )
							}
						/>
					</ToolsPanelItem>

					<ToolsPanelItem
						label={ __( 'Font Size', 'folioblocks' ) }
						hasValue={ () =>
							( attributes.filterFontSize ?? 16 ) !== 16
						}
						onDeselect={ () =>
							setAttributes( { filterFontSize: 16 } )
						}
						isShownByDefault
					>
						<FontSizePicker
							__next40pxDefaultSize
							fontSizes={ fontSizeOptions }
							value={
								typeof attributes.filterFontSize === 'number'
									? attributes.filterFontSize
									: 16
							}
							onChange={ ( size ) => {
								// FontSizePicker should return a number (px). Guard to avoid persisting invalid values.
								const next =
									typeof size === 'number' &&
									Number.isFinite( size )
										? size
										: 16;
								setAttributes( { filterFontSize: next } );
							} }
						/>
					</ToolsPanelItem>
					<ToolsPanelItem
						label={ __( 'Appearance', 'folioblocks' ) }
						hasValue={ () =>
							!! attributes.filterFontWeight ||
							!! attributes.filterFontStyle ||
							( attributes.filterLineHeight != null &&
								attributes.filterLineHeight !== '' )
						}
						onDeselect={ () =>
							setAttributes( {
								filterFontWeight: '',
								filterFontStyle: '',
								filterLineHeight: null,
							} )
						}
						isShownByDefault
					>
						<div
							style={ {
								display: 'flex',
								gap: '12px',
								alignItems: 'flex-start',
							} }
						>
							<div style={ { flex: '1 1 0', minWidth: 0 } }>
								<FontAppearanceControl
									label={ __( 'Appearance', 'folioblocks' ) }
									value={ {
										fontWeight:
											attributes.filterFontWeight ||
											undefined,
										fontStyle:
											attributes.filterFontStyle ||
											undefined,
									} }
									onChange={ ( next ) => {
										setAttributes( {
											filterFontWeight:
												next?.fontWeight || '',
											filterFontStyle:
												next?.fontStyle || '',
										} );
									} }
									__next40pxDefaultSize
									help={ __(
										'Select the font’s weight and style (matches WordPress Typography → Appearance).',
										'folioblocks'
									) }
								/>
							</div>

							<div style={ { flex: '1 1 0', minWidth: 0 } }>
								<LineHeightControl
									label={ __( 'Line Height', 'folioblocks' ) }
									value={
										attributes.filterLineHeight == null ||
										attributes.filterLineHeight === ''
											? undefined
											: attributes.filterLineHeight
									}
									__next40pxDefaultSize
									__unstableInputWidth="100px"
									onChange={ ( value ) =>
										setAttributes( {
											filterLineHeight: value,
										} )
									}
								/>
							</div>
						</div>
					</ToolsPanelItem>

					<ToolsPanelItem
						label={ __( 'Typography', 'folioblocks' ) }
						hasValue={ () =>
							( attributes.filterLetterSpacing ?? 0 ) !== 0 ||
							( attributes.filterTextDecoration || 'none' ) !==
								'none'
						}
						onDeselect={ () =>
							setAttributes( {
								filterLetterSpacing: 0,
								filterTextDecoration: 'none',
							} )
						}
						isShownByDefault
					>
						<div
							style={ {
								display: 'flex',
								gap: '12px',
								alignItems: 'flex-start',
							} }
						>
							<div style={ { flex: '1 1 0', minWidth: 0 } }>
								<UnitControl
									label={ __(
										'Letter spacing',
										'folioblocks'
									) }
									value={ attributes.filterLetterSpacing }
									onChange={ ( value ) =>
										setAttributes( {
											filterLetterSpacing: value,
										} )
									}
									min={ 0 }
									max={ 0.2 }
									step={ 0.01 }
									__next40pxDefaultSize
								/>
							</div>

							<div style={ { flex: '1 1 0', minWidth: 0 } }>
								<TextDecorationControl
									value={
										attributes.filterTextDecoration ||
										'none'
									}
									onChange={ ( value ) =>
										setAttributes( {
											filterTextDecoration: value,
										} )
									}
								/>
							</div>
						</div>
					</ToolsPanelItem>

					<ToolsPanelItem
						label={ __( 'Letter case', 'folioblocks' ) }
						hasValue={ () =>
							( attributes.filterTextTransform || 'none' ) !==
							'none'
						}
						onDeselect={ () =>
							setAttributes( { filterTextTransform: 'none' } )
						}
						isShownByDefault
					>
						<TextTransformControl
							value={ attributes.filterTextTransform || 'none' }
							onChange={ ( value ) =>
								setAttributes( { filterTextTransform: value } )
							}
						/>
					</ToolsPanelItem>

					<ToolsPanelItem
						label={ __( 'Filter Bar Colors', 'folioblocks' ) }
						hasValue={ () =>
							!! attributes.activeFilterTextColor ||
							!! attributes.activeFilterBgColor ||
							!! attributes.filterTextColor ||
							!! attributes.filterBgColor
						}
						onDeselect={ () => {
							setAttributes( {
								activeFilterTextColor: undefined,
								activeFilterBgColor: undefined,
								filterTextColor: undefined,
								filterBgColor: undefined,
							} );
							forceRefresh();
						} }
						isShownByDefault
					>
						<div
							style={ {
								display: 'flex',
								flexDirection: 'column',
								gap: 12,
							} }
						>
							<CompactTwoColorControl
								label={ __(
									'Active Item Colors',
									'folioblocks'
								) }
								value={ {
									first: attributes.activeFilterTextColor,
									second: attributes.activeFilterBgColor,
								} }
								onChange={ ( next ) => {
									setAttributes( {
										activeFilterTextColor: next?.first,
										activeFilterBgColor: next?.second,
									} );
									forceRefresh();
								} }
								firstLabel={ __( 'Text', 'folioblocks' ) }
								secondLabel={ __(
									'Background',
									'folioblocks'
								) }
							/>

							<CompactTwoColorControl
								label={ __(
									'Inactive Item Colors',
									'folioblocks'
								) }
								value={ {
									first: attributes.filterTextColor,
									second: attributes.filterBgColor,
								} }
								onChange={ ( next ) => {
									setAttributes( {
										filterTextColor: next?.first,
										filterBgColor: next?.second,
									} );
									forceRefresh();
								} }
								firstLabel={ __( 'Text', 'folioblocks' ) }
								secondLabel={ __(
									'Background',
									'folioblocks'
								) }
							/>
						</div>
					</ToolsPanelItem>
				</ToolsPanel>
			</>
		);
	}
);

addFilter(
	'folioBlocks.gridGallery.iconStyleControls',
	'folioblocks/grid-gallery-icon-style-controls',
	( Original, { attributes, setAttributes } ) => {
		const enableDownload = !! attributes.enableDownload;
		const enableWooCommerce = !! attributes.enableWooCommerce;
		const enableLinkIcon =
			( attributes.imageClickAction === 'custom_url' ||
				attributes.imageClickAction === 'page_post' ) &&
			( attributes.imageClickTarget || 'icon' ) === 'icon';

		if ( ! enableDownload && ! enableWooCommerce && ! enableLinkIcon ) {
			return null;
		}

		return (
			<ToolsPanel
				label={ __( 'Gallery Click Styles', 'folioblocks' ) }
				resetAll={ () =>
					setAttributes( {
						downloadIconColor: '',
						downloadIconBgColor: '',
						cartIconColor: '',
						cartIconBgColor: '',
						linkIconColor: '',
						linkIconBgColor: '',
					} )
				}
			>
				{ enableDownload && (
					<ToolsPanelItem
						label={ __( 'Download Icon Colors', 'folioblocks' ) }
						hasValue={ () =>
							!! attributes.downloadIconColor ||
							!! attributes.downloadIconBgColor
						}
						onDeselect={ () =>
							setAttributes( {
								downloadIconColor: '',
								downloadIconBgColor: '',
							} )
						}
						isShownByDefault
					>
						<CompactTwoColorControl
							label={ __( 'Download Icon', 'folioblocks' ) }
							value={ {
								first: attributes.downloadIconColor,
								second: attributes.downloadIconBgColor,
							} }
							onChange={ ( next ) =>
								setAttributes( {
									downloadIconColor: next?.first || '',
									downloadIconBgColor: next?.second || '',
								} )
							}
							firstLabel={ __( 'Icon', 'folioblocks' ) }
							secondLabel={ __( 'Background', 'folioblocks' ) }
						/>
					</ToolsPanelItem>
				) }

				{ enableWooCommerce && (
					<ToolsPanelItem
						label={ __( 'Add to Cart Icon Colors', 'folioblocks' ) }
						hasValue={ () =>
							!! attributes.cartIconColor ||
							!! attributes.cartIconBgColor
						}
						onDeselect={ () =>
							setAttributes( {
								cartIconColor: '',
								cartIconBgColor: '',
							} )
						}
						isShownByDefault
					>
						<CompactTwoColorControl
							label={ __( 'Add to Cart Icon', 'folioblocks' ) }
							value={ {
								first: attributes.cartIconColor,
								second: attributes.cartIconBgColor,
							} }
							onChange={ ( next ) =>
								setAttributes( {
									cartIconColor: next?.first || '',
									cartIconBgColor: next?.second || '',
								} )
							}
							firstLabel={ __( 'Icon', 'folioblocks' ) }
							secondLabel={ __( 'Background', 'folioblocks' ) }
						/>
					</ToolsPanelItem>
				) }

				{ enableLinkIcon && (
					<ToolsPanelItem
						label={ __( 'Link Target Icon Colors', 'folioblocks' ) }
						hasValue={ () =>
							!! attributes.linkIconColor ||
							!! attributes.linkIconBgColor
						}
						onDeselect={ () =>
							setAttributes( {
								linkIconColor: '',
								linkIconBgColor: '',
							} )
						}
						isShownByDefault
					>
						<CompactTwoColorControl
							label={ __( 'Link Target Icon', 'folioblocks' ) }
							value={ {
								first: attributes.linkIconColor,
								second: attributes.linkIconBgColor,
							} }
							onChange={ ( next ) =>
								setAttributes( {
									linkIconColor: next?.first || '',
									linkIconBgColor: next?.second || '',
								} )
							}
							firstLabel={ __( 'Icon', 'folioblocks' ) }
							secondLabel={ __( 'Background', 'folioblocks' ) }
						/>
					</ToolsPanelItem>
				) }
			</ToolsPanel>
		);
	}
);

addFilter(
	'folioBlocks.gridGallery.renderFilterBar',
	'folioblocks/grid-gallery-premium-filter-bar',
	( defaultContent, { attributes, setAttributes } ) => {
		const {
			enableFilter = false,
			activeFilter = FBKS_ALL_FILTER_TOKEN,
			filterCategories = [],
			filterAlign = 'center',
		} = attributes;

		if ( ! enableFilter || ! Array.isArray( filterCategories ) ) {
			return defaultContent;
		}

		const { decorationClass, cssVars } =
			getFilterTypographyCSS( attributes );
		const normalizedActiveFilter =
			fbksNormalizeActiveFilterValue( activeFilter );
		const filterItems = [
			{
				label: __( 'All', 'folioblocks' ),
				value: FBKS_ALL_FILTER_TOKEN,
			},
			...filterCategories.map( ( term ) => ( {
				label: term,
				value: term,
			} ) ),
		];

		return (
			<div
				className={ `pb-image-gallery-filters align-${ filterAlign } ${ decorationClass }` }
				style={ cssVars }
			>
				{ filterItems.map( ( term ) => (
					<button
						key={ term.value }
						className={ `filter-button${
							normalizedActiveFilter === term.value
								? ' is-active'
								: ''
						}` }
						onClick={ () =>
							setAttributes( { activeFilter: term.value } )
						}
						type="button"
					>
						{ term.label }
					</button>
				) ) }
			</div>
		);
	}
);
