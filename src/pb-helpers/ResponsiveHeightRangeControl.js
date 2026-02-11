/**
 * Responsive Height Range Control
 *
 * Device-aware RangeControl for height values (desktop / tablet / mobile).
 * Designed primarily for viewport-based heights (vh).
 *
 * Behavior:
 * - Desktop is the master value.
 * - Tablet and mobile values are clamped to desktop unless explicit max values are provided.
 */

import { useState } from '@wordpress/element';
import { RangeControl, Button, Popover } from '@wordpress/components';
import { desktop, tablet, mobile } from '@wordpress/icons';
import PropTypes from 'prop-types';

const ResponsiveHeightRangeControl = ( {
	label,
	heightDesktop,
	heightTablet,
	heightMobile,
	onChange,
	min = 0,
	maxDesktop = 100,
	step = 1,
	unitLabel = 'vh',
	maxTablet,
	maxMobile,
	lockToDesktop = true,
	helpText,
} ) => {
	const [ device, setDevice ] = useState( 'desktop' );
	const [ showPopover, setShowPopover ] = useState( false );

	// Defensive numeric fallbacks (prevents RangeControl crashes if attributes are undefined).
	const safeDesktop = Number.isFinite( heightDesktop ) ? heightDesktop : 0;
	const safeTablet = Number.isFinite( heightTablet )
		? heightTablet
		: safeDesktop;
	const safeMobile = Number.isFinite( heightMobile )
		? heightMobile
		: safeDesktop;

	const getValue = () => {
		if ( device === 'tablet' ) {
			return safeTablet;
		}
		if ( device === 'mobile' ) {
			return safeMobile;
		}
		return safeDesktop;
	};

	const resolvedMaxTablet =
		typeof maxTablet === 'number'
			? maxTablet
			: lockToDesktop
			? safeDesktop
			: maxDesktop;
	const resolvedMaxMobile =
		typeof maxMobile === 'number'
			? maxMobile
			: lockToDesktop
			? safeDesktop
			: maxDesktop;

	const getMax = () => {
		if ( device === 'tablet' ) {
			return resolvedMaxTablet;
		}
		if ( device === 'mobile' ) {
			return resolvedMaxMobile;
		}
		return maxDesktop;
	};

	const sanitizeValue = ( raw, max ) => {
		// RangeControl can emit `undefined` while editing/clearing the input.
		const num = typeof raw === 'number' ? raw : Number( raw );
		if ( ! Number.isFinite( num ) ) {
			return undefined;
		}
		const clamped = Math.min( Math.max( num, min ), max );
		return clamped;
	};

	const setValue = ( rawValue ) => {
		const maxForDevice = getMax();
		const value = sanitizeValue( rawValue, maxForDevice );

		// If the user is mid-edit and the value is temporarily invalid, do nothing.
		if ( value === undefined ) {
			return;
		}

		if ( device === 'tablet' ) {
			onChange( {
				heightTablet: value,
			} );
			return;
		}

		if ( device === 'mobile' ) {
			onChange( {
				heightMobile: value,
			} );
			return;
		}

		// Desktop is the master value for some controls (e.g. responsive height).
		// For others (e.g. focal point), device values should be independent.
		onChange( {
			heightDesktop: value,
			heightTablet: lockToDesktop
				? Math.min( value, safeTablet )
				: safeTablet,
			heightMobile: lockToDesktop
				? Math.min( value, safeMobile )
				: safeMobile,
		} );
	};

	const deviceIcons = {
		desktop,
		tablet,
		mobile,
	};

	const defaultHelp = `Adjust the height (${ unitLabel }) on ${
		device.charAt( 0 ).toUpperCase() + device.slice( 1 )
	}.`;

	return (
		<div
			className="pb-responsive-height-control"
			style={ { marginBottom: 16 } }
		>
			<div
				style={ {
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					marginBottom: 8,
				} }
			>
				<span
					style={ {
						fontSize: 11,
						fontWeight: 500,
						lineHeight: 1.4,
						textTransform: 'uppercase',
					} }
				>
					{ label }
				</span>

				<Button
					icon={ deviceIcons[ device ] }
					variant="secondary"
					size="small"
					onClick={ () => setShowPopover( ! showPopover ) }
					style={ { padding: '2px 4px' } }
					aria-label="Change device"
				/>

				{ showPopover && (
					<Popover
						position="bottom center"
						onClose={ () => setShowPopover( false ) }
						focusOnMount={ false }
					>
						<div style={ { padding: 8, display: 'flex', gap: 8 } }>
							<Button
								icon={ desktop }
								label="Desktop"
								onClick={ () => {
									setDevice( 'desktop' );
									setShowPopover( false );
								} }
							/>
							<Button
								icon={ tablet }
								label="Tablet"
								onClick={ () => {
									setDevice( 'tablet' );
									setShowPopover( false );
								} }
							/>
							<Button
								icon={ mobile }
								label="Mobile"
								onClick={ () => {
									setDevice( 'mobile' );
									setShowPopover( false );
								} }
							/>
						</div>
					</Popover>
				) }
			</div>

			<RangeControl
				min={ min }
				max={ getMax() }
				step={ step }
				value={ getValue() }
				onChange={ setValue }
				help={ helpText || defaultHelp }
				__nextHasNoMarginBottom
				__next40pxDefaultSize
			/>
		</div>
	);
};

ResponsiveHeightRangeControl.propTypes = {
	label: PropTypes.string.isRequired,
	heightDesktop: PropTypes.number.isRequired,
	heightTablet: PropTypes.number.isRequired,
	heightMobile: PropTypes.number.isRequired,
	onChange: PropTypes.func.isRequired,
	min: PropTypes.number,
	maxDesktop: PropTypes.number,
	step: PropTypes.number,
	unitLabel: PropTypes.string,
	maxTablet: PropTypes.number,
	maxMobile: PropTypes.number,
	lockToDesktop: PropTypes.bool,
	helpText: PropTypes.string,
};

export default ResponsiveHeightRangeControl;
