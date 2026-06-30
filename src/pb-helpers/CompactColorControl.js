import {
	BaseControl,
	Button,
	Popover,
	ColorPalette,
	TabPanel,
} from '@wordpress/components';
import { useState, useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import {
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalColorGradientControl as ColorGradientControl,
	useSettings,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

function useThemePalette() {
	// WordPress can expose palettes as a combined list OR split into theme/default/custom.
	// In some contexts `color.palette` may only contain custom colors, so we read all.
	const [
		paletteCombinedSetting,
		paletteThemeSetting,
		paletteDefaultSetting,
		paletteCustomSetting,
		customColorsSetting,
	] = useSettings(
		'color.palette',
		'color.palette.theme',
		'color.palette.default',
		'color.palette.custom',
		'color.custom'
	);

	const legacy = useSelect( ( select ) => {
		const settings = select( 'core/block-editor' )?.getSettings?.();
		const features = settings?.__experimentalFeatures;
		const palette = features?.color?.palette;

		return {
			// Older shape sometimes uses `settings.colors`.
			colors: settings?.colors ?? [],
			// Newer shape can split palettes by source.
			paletteTheme: palette?.theme ?? [],
			paletteDefault: palette?.default ?? [],
			paletteCustom: palette?.custom ?? [],
			disableCustomColors: !! settings?.disableCustomColors,
		};
	}, [] );

	// Build palettes by source. We prefer Theme + Custom merged (matches your desired UX).
	const themePalette = paletteThemeSetting ?? legacy.paletteTheme ?? [];
	const customPalette = paletteCustomSetting ?? legacy.paletteCustom ?? [];
	const defaultPalette = paletteDefaultSetting ?? legacy.paletteDefault ?? [];

	// Primary palette: Theme + Custom.
	let palette = [ ...themePalette, ...customPalette ];

	// Fallback: Default palette.
	if ( ! palette.length ) {
		palette = [ ...defaultPalette ];
	}

	// Final fallback: whatever WP exposes as a combined palette / legacy colors.
	if ( ! palette.length ) {
		palette = paletteCombinedSetting ?? legacy.colors ?? [];
	}

	// De-dupe by color value or slug to avoid showing duplicates.
	const seen = new Set();
	const themeColors = ( palette || [] ).filter( ( c ) => {
		const key = c?.color || c?.slug || JSON.stringify( c );
		if ( seen.has( key ) ) {
			return false;
		}
		seen.add( key );
		return true;
	} );

	// If `color.custom` is explicitly false, disable custom colors.
	// Otherwise fall back to legacy `disableCustomColors`.
	const disableCustomColors =
		customColorsSetting === false ? true : legacy.disableCustomColors;

	return { themeColors, disableCustomColors };
}

function useThemeGradients() {
	const [
		gradientsCombinedSetting,
		gradientsThemeSetting,
		gradientsDefaultSetting,
		gradientsCustomSetting,
		customGradientsSetting,
	] = useSettings(
		'color.gradients',
		'color.gradients.theme',
		'color.gradients.default',
		'color.gradients.custom',
		'color.customGradient'
	);

	const legacy = useSelect( ( select ) => {
		const settings = select( 'core/block-editor' )?.getSettings?.();
		const features = settings?.__experimentalFeatures;
		const gradients = features?.color?.gradients;

		return {
			gradients: settings?.gradients ?? [],
			gradientsTheme: gradients?.theme ?? [],
			gradientsDefault: gradients?.default ?? [],
			gradientsCustom: gradients?.custom ?? [],
			disableCustomGradients: !! settings?.disableCustomGradients,
		};
	}, [] );

	const themeGradients = gradientsThemeSetting ?? legacy.gradientsTheme ?? [];
	const customGradients =
		gradientsCustomSetting ?? legacy.gradientsCustom ?? [];
	const defaultGradients =
		gradientsDefaultSetting ?? legacy.gradientsDefault ?? [];

	let gradients = [ ...themeGradients, ...customGradients ];

	if ( ! gradients.length ) {
		gradients = [ ...defaultGradients ];
	}

	if ( ! gradients.length ) {
		gradients = gradientsCombinedSetting ?? legacy.gradients ?? [];
	}

	const seen = new Set();
	const themeGradientsList = ( gradients || [] ).filter( ( gradient ) => {
		const key =
			gradient?.gradient || gradient?.slug || JSON.stringify( gradient );
		if ( seen.has( key ) ) {
			return false;
		}
		seen.add( key );
		return true;
	} );

	const disableCustomGradients =
		customGradientsSetting === false ? true : legacy.disableCustomGradients;

	return { themeGradients: themeGradientsList, disableCustomGradients };
}

const isGradientValue = ( nextValue ) =>
	typeof nextValue === 'string' &&
	/\b(?:linear|radial|conic)-gradient\(/i.test( nextValue );

export default function CompactColorControl( {
	label,
	value,
	onChange,
	help,
} ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const buttonRef = useRef();
	const controlId = useRef(
		`pb-compact-color-control-${ Math.random().toString( 36 ).slice( 2 ) }`
	).current;

	const { themeColors, disableCustomColors } = useThemePalette();

	return (
		<BaseControl
			id={ controlId }
			label={ label }
			help={ help }
			__nextHasNoMarginBottom
			className="pb-compact-color-control"
			style={ { width: '100%' } }
		>
			<div
				style={ {
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					width: '100%',
				} }
			>
				<Button
					ref={ buttonRef }
					onClick={ () => setIsOpen( ( v ) => ! v ) }
					style={ {
						display: 'flex',
						alignItems: 'center',
						gap: 8,
						width: '100%',
						height: 42,
						flex: 1,
						justifyContent: 'space-between',
						border: '1px solid #ddd',
						borderRadius: 2,
					} }
					__next40pxDefaultSize
				>
					<span
						style={ {
							display: 'flex',
							alignItems: 'center',
							gap: 8,
						} }
					>
						<span
							aria-hidden="true"
							style={ {
								width: 20,
								height: 20,
								borderRadius: 999,
								background: value || 'transparent',
								border: '1px solid #ccc',
								display: 'inline-block',
							} }
						/>
						<span
							style={ {
								fontFamily: 'monospace',
								fontSize: 12,
								opacity: 0.9,
							} }
						>
							{ value || __( 'None', 'folioblocks' ) }
						</span>
					</span>
				</Button>
			</div>

			{ isOpen && (
				<Popover
					anchor={ buttonRef.current }
					placement="bottom-start"
					onClose={ () => setIsOpen( false ) }
					focusOnMount="firstElement"
				>
					<div style={ { padding: 12, width: 260 } }>
						<ColorPalette
							colors={ themeColors }
							value={ value }
							onChange={ onChange }
							disableCustomColors={ disableCustomColors }
							__experimentalIsRenderedInSidebar
						/>
					</div>
				</Popover>
			) }
		</BaseControl>
	);
}

export function CompactTwoColorControl( {
	label,
	value,
	onChange,
	firstLabel = __( 'Default', 'folioblocks' ),
	secondLabel = __( 'Hover', 'folioblocks' ),
	secondSupportsGradient = false,
	secondGradientOnly = false,
	secondColorLabel = __( 'Color', 'folioblocks' ),
	secondGradientLabel = __( 'Gradient', 'folioblocks' ),
} ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const buttonRef = useRef();
	const controlId = useRef(
		`pb-compact-two-color-control-${ Math.random()
			.toString( 36 )
			.slice( 2 ) }`
	).current;
	const { themeColors, disableCustomColors } = useThemePalette();
	const { themeGradients, disableCustomGradients } = useThemeGradients();

	const first = value?.first;
	const second = value?.second;

	const setFirst = ( next ) =>
		onChange( { ...( value || {} ), first: next } );
	const setSecond = ( next ) =>
		onChange( { ...( value || {} ), second: next } );
	const setSecondColor = ( next ) => {
		if ( next !== undefined ) {
			setSecond( next );
		}
	};
	const setSecondGradient = ( next ) => {
		if ( next !== undefined ) {
			setSecond( next );
		}
	};

	const renderColorPalette = ( nextValue, nextOnChange ) => (
		<ColorPalette
			colors={ themeColors }
			value={ nextValue }
			onChange={ nextOnChange }
			disableCustomColors={ disableCustomColors }
			__experimentalIsRenderedInSidebar
		/>
	);

	const renderSecondControl = () => {
		if ( ! secondSupportsGradient || ! ColorGradientControl ) {
			return renderColorPalette( second, setSecond );
		}

		if ( secondGradientOnly ) {
			return (
				<ColorGradientControl
					label={ `${ secondLabel } ${ secondGradientLabel }` }
					showTitle={ false }
					gradients={ themeGradients }
					gradientValue={ second }
					onGradientChange={ setSecondGradient }
					disableCustomGradients={ disableCustomGradients }
					__experimentalIsRenderedInSidebar
				/>
			);
		}

		return (
			<ColorGradientControl
				label={ `${ secondLabel } ${ secondColorLabel } / ${ secondGradientLabel }` }
				showTitle={ false }
				colors={ themeColors }
				gradients={ themeGradients }
				colorValue={ isGradientValue( second ) ? undefined : second }
				gradientValue={ isGradientValue( second ) ? second : undefined }
				onColorChange={ setSecondColor }
				onGradientChange={ setSecondGradient }
				disableCustomColors={ disableCustomColors }
				disableCustomGradients={ disableCustomGradients }
				__experimentalIsRenderedInSidebar
			/>
		);
	};

	return (
		<BaseControl
			id={ controlId }
			label={ label }
			__nextHasNoMarginBottom
			className="pb-compact-two-color-control"
			style={ { width: '100%' } }
		>
			<div style={ { width: '100%' } }>
				<div
					style={ {
						display: 'flex',
						alignItems: 'center',
						gap: 8,
						width: '100%',
					} }
				>
					<Button
						ref={ buttonRef }
						onClick={ () => setIsOpen( ( v ) => ! v ) }
						style={ {
							display: 'flex',
							alignItems: 'center',
							gap: 8,
							width: '100%',
							height: 42,
							flex: 1,
							justifyContent: 'space-between',
							border: '1px solid #ddd',
							borderRadius: 2,
						} }
						__next40pxDefaultSize
					>
						<span
							style={ {
								display: 'flex',
								alignItems: 'center',
								gap: 8,
							} }
						>
							<span
								aria-hidden="true"
								style={ {
									width: 20,
									height: 20,
									borderRadius: 999,
									background: first || 'transparent',
									border: '1px solid #ccc',
									display: 'inline-block',
								} }
							/>
							<span
								aria-hidden="true"
								style={ {
									width: 20,
									height: 20,
									borderRadius: 999,
									background: second || 'transparent',
									border: '1px solid #ccc',
									display: 'inline-block',
								} }
							/>
							<span style={ { fontSize: 12, opacity: 0.9 } }>
								{ firstLabel } / { secondLabel }
							</span>
						</span>
					</Button>
				</div>

				{ isOpen && (
					<Popover
						anchor={ buttonRef.current }
						placement="bottom-start"
						onClose={ () => setIsOpen( false ) }
						focusOnMount="firstElement"
					>
						<div style={ { padding: 12, width: 280 } }>
							<TabPanel
								className="pb-compact-two-color-tabs"
								tabs={ [
									{ name: 'first', title: firstLabel },
									{ name: 'second', title: secondLabel },
								] }
							>
								{ ( tab ) =>
									tab.name === 'first'
										? renderColorPalette( first, setFirst )
										: renderSecondControl()
								}
							</TabPanel>
						</div>
					</Popover>
				) }
			</div>
		</BaseControl>
	);
}
