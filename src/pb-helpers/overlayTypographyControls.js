import { __ } from '@wordpress/i18n';
import {
	BaseControl,
	Button,
	Dropdown,
	SelectControl,
} from '@wordpress/components';
import { useSettings } from '@wordpress/block-editor';
import {
	getFontFamilyOptions,
	normalizeFontFamilies,
} from './getThemeSettings';
import { useState } from '@wordpress/element';
import { Icon, check, chevronDown } from '@wordpress/icons';

export const getOverlayTypographyCSS = ( attributes = {} ) => {
	const rawWeight = attributes.overlayFontWeight;
	const numericWeight = Number.parseInt( rawWeight, 10 );
	const fontWeight =
		rawWeight === '' || rawWeight == null
			? ''
			: Number.isFinite( numericWeight )
			? String( Math.min( 900, Math.max( 100, numericWeight ) ) )
			: String( rawWeight );

	return {
		...( attributes.overlayFontFamily
			? { '--pb-overlay-font-family': attributes.overlayFontFamily }
			: {} ),
		...( fontWeight ? { '--pb-overlay-font-weight': fontWeight } : {} ),
		...( attributes.overlayFontStyle
			? { '--pb-overlay-font-style': attributes.overlayFontStyle }
			: {} ),
	};
};

const FONT_APPEARANCE_OPTIONS = [
	{
		label: __( 'Default', 'folioblocks' ),
		fontWeight: '',
		fontStyle: '',
	},
	...[
		[ '100', __( 'Thin', 'folioblocks' ) ],
		[ '200', __( 'Extra Light', 'folioblocks' ) ],
		[ '300', __( 'Light', 'folioblocks' ) ],
		[ '400', __( 'Regular', 'folioblocks' ) ],
		[ '500', __( 'Medium', 'folioblocks' ) ],
		[ '600', __( 'Semi Bold', 'folioblocks' ) ],
		[ '700', __( 'Bold', 'folioblocks' ) ],
		[ '800', __( 'Extra Bold', 'folioblocks' ) ],
		[ '900', __( 'Black', 'folioblocks' ) ],
	].flatMap( ( [ fontWeight, label ] ) => [
		{ label, fontWeight, fontStyle: 'normal' },
		{
			label: `${ label } ${ __( 'Italic', 'folioblocks' ) }`,
			fontWeight,
			fontStyle: 'italic',
		},
	] ),
];

function OverlayFontAppearanceControl( { attributes, setAttributes } ) {
	const [ hoveredKey, setHoveredKey ] = useState( '' );
	const current =
		FONT_APPEARANCE_OPTIONS.find(
			( option ) =>
				option.fontWeight === ( attributes.overlayFontWeight || '' ) &&
				option.fontStyle === ( attributes.overlayFontStyle || '' )
		) || FONT_APPEARANCE_OPTIONS[ 0 ];

	return (
		<BaseControl
			label={ __( 'Appearance', 'folioblocks' ) }
			__nextHasNoMarginBottom
		>
			<Dropdown
				popoverProps={ {
					placement: 'top-start',
					shift: true,
					offset: 12,
				} }
				renderToggle={ ( { isOpen, onToggle } ) => (
					<Button
						onClick={ onToggle }
						aria-expanded={ isOpen }
						style={ {
							alignItems: 'center',
							border: '1px solid #949494',
							borderRadius: '2px',
							boxShadow: 'none',
							display: 'flex',
							gap: '8px',
							height: '40px',
							justifyContent: 'space-between',
							padding: '0 8px',
							width: '100%',
						} }
					>
						<span
							style={ {
								minWidth: 0,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							} }
						>
							{ current.label }
						</span>
						<Icon icon={ chevronDown } size={ 20 } />
					</Button>
				) }
				renderContent={ ( { onClose } ) => (
					<div
							style={ {
								maxHeight: '320px',
								minWidth: '220px',
								overflowY: 'auto',
								padding: 0,
							} }
						>
							{ FONT_APPEARANCE_OPTIONS.map( ( option ) => {
								const optionKey = `${ option.fontStyle }-${ option.fontWeight }`;
								const isSelected =
									option.fontWeight === current.fontWeight &&
									option.fontStyle === current.fontStyle;
								const isHovered = hoveredKey === optionKey;

								return (
									<Button
										key={ optionKey }
										onClick={ () => {
											setAttributes( {
												overlayFontWeight:
													option.fontWeight,
											overlayFontStyle: option.fontStyle,
											} );
											onClose();
										} }
										onMouseEnter={ () =>
											setHoveredKey( optionKey )
										}
										onMouseLeave={ () =>
											setHoveredKey( '' )
										}
										style={ {
											alignItems: 'center',
											background: isSelected
												? '#ddd'
												: isHovered
												? '#f0f0f0'
												: '#fff',
											borderRadius: 0,
											boxShadow: 'none',
											display: 'flex',
											fontStyle:
												option.fontStyle || 'normal',
											fontWeight:
												option.fontWeight || 'normal',
											justifyContent: 'space-between',
											minHeight: '48px',
											outline: 'none',
											padding: '10px 16px',
											textAlign: 'left',
											width: '100%',
										} }
									>
										<span>{ option.label }</span>
										{ isSelected && (
											<Icon icon={ check } size={ 24 } />
										) }
									</Button>
								);
							} ) }
					</div>
				) }
			/>
		</BaseControl>
	);
}

export function OverlayTypographyControls( { attributes, setAttributes } ) {
	const [ fontFamilies ] = useSettings( 'typography.fontFamilies' );
	const families = normalizeFontFamilies( fontFamilies );
	const fontFamilyOptions = getFontFamilyOptions( families, __ );

	return (
		<>
			<SelectControl
				label={ __( 'Font Family', 'folioblocks' ) }
				value={ attributes.overlayFontFamily || '' }
				options={ fontFamilyOptions }
				onChange={ ( overlayFontFamily ) =>
					setAttributes( { overlayFontFamily } )
				}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				help={
					fontFamilyOptions.length > 1
						? __(
								'Uses fonts from your theme\'s Global Styles.',
								'folioblocks'
						  )
						: __(
								'No theme fonts found. Add font families in theme.json or Global Styles.',
								'folioblocks'
						  )
				}
			/>
			<div style={ { marginTop: '12px' } }>
				<OverlayFontAppearanceControl
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</div>
		</>
	);
}
