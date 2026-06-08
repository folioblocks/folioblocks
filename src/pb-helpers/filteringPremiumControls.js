import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import {
	FontSizePicker,
	ToggleControl,
	TextControl,
	SelectControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import {
	LineHeightControl,
	__experimentalFontAppearanceControl as FontAppearanceControl,
	__experimentalTextDecorationControl as TextDecorationControl,
	__experimentalTextTransformControl as TextTransformControl,
	__experimentalUnitControl as UnitControl,
	useSettings,
} from '@wordpress/block-editor';
import { useEffect } from '@wordpress/element';
import { CompactTwoColorControl } from './CompactColorControl';
import {
	FBKS_ALL_FILTER_TOKEN,
	fbksIsAllFilterValue,
	fbksNormalizeActiveFilterValue,
} from './filterConstants';
import {
	getFilterTypographyCSS,
	getFontFamilyOptions,
	getFontSizeOptions,
	normalizeFontFamilies,
	normalizeFontSizes,
} from './getThemeSettings';

export const getBlockFilterCategories = ( blockAttributes = {} ) => {
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

const parseFilterInput = ( filtersInput = '' ) =>
	filtersInput
		.split( ',' )
		.map( ( item ) => item.trim() )
		.filter( Boolean );

export const registerFilteringPremiumControls = ( {
	hookPrefix,
	namespace,
	childBlockName,
	enableFilterLabel = __( 'Enable Image Filtering', 'folioblocks' ),
	enableFilterHelp = __(
		'Enable image filtering with categories.',
		'folioblocks'
	),
	filterBarClassName = 'pb-image-gallery-filters',
} ) => {
	addFilter(
		`${ hookPrefix }.filterLogic`,
		`${ namespace }-premium-filter-logic`,
		( _, { attributes = {}, setAttributes, selectedBlock } = {} ) => {
			const {
				enableFilter = false,
				filterAlign = 'center',
				filtersInput = '',
				activeFilter = FBKS_ALL_FILTER_TOKEN,
			} = attributes;
			const filterCategories = parseFilterInput( filtersInput );

			useEffect( () => {
				setAttributes( { filterCategories } );
			}, [ filtersInput ] );

			useEffect( () => {
				if ( selectedBlock?.name !== childBlockName ) {
					return;
				}

				const selectedCategories = getBlockFilterCategories(
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
			}, [ selectedBlock, activeFilter ] );

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
		`${ hookPrefix }.enableFilterToggle`,
		`${ namespace }-premium-filter-toggle`,
		( defaultContent, { attributes = {}, setAttributes } = {} ) => {
			const { enableFilter, filterAlign = 'center' } = attributes;
			const filtersInput = attributes.filtersInput || '';

			return (
				<>
					<ToggleControl
						label={ enableFilterLabel }
						checked={ !! enableFilter }
						onChange={ ( value ) =>
							setAttributes( { enableFilter: value } )
						}
						__nextHasNoMarginBottom
						help={ enableFilterHelp }
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
								label={ __(
									'Filter Categories',
									'folioblocks'
								) }
								value={ filtersInput }
								onChange={ ( value ) =>
									setAttributes( { filtersInput: value } )
								}
								onBlur={ () =>
									setAttributes( {
										filterCategories:
											parseFilterInput( filtersInput ),
									} )
								}
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
		`${ hookPrefix }.renderFilterBar`,
		`${ namespace }-premium-filter-bar`,
		( defaultContent, { attributes = {}, setAttributes } = {} ) => {
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
					className={ `${ filterBarClassName } align-${ filterAlign } ${ decorationClass }` }
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

	addFilter(
		`${ hookPrefix }.filterStyleSettings`,
		`${ namespace }-premium-filter-styles`,
		( defaultContent, { attributes = {}, setAttributes } = {} ) => {
			const [ themeFontSizes ] = useSettings( 'typography.fontSizes' );
			const normalizedFontSizes = normalizeFontSizes( themeFontSizes );
			const fontSizeOptions = getFontSizeOptions( normalizedFontSizes );

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
			);
		}
	);
};
