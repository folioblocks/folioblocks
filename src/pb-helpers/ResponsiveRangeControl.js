/**
 * Responsive Range Control
 * Helper file for Galleries responsive component
 */

import { useState } from '@wordpress/element';
import PropTypes from 'prop-types';
import { RangeControl, Popover, Button } from '@wordpress/components';
import { desktop, tablet, mobile } from '@wordpress/icons';

const ResponsiveRangeControl = ( {
	label,
	columns,
	tabletColumns,
	mobileColumns,
	desktopKey = 'columns',
	tabletKey = 'tabletColumns',
	mobileKey = 'mobileColumns',
	min = 1,
	max = 8,
	lockTabletMobileToDesktop = true,
	help,
	onChange,
} ) => {
	const [ device, setDevice ] = useState( 'desktop' );
	const [ showPopover, setShowPopover ] = useState( false );

	const getValue = () => {
		if ( device === 'tablet' ) {
			return tabletColumns ?? columns;
		}
		if ( device === 'mobile' ) {
			return mobileColumns ?? columns;
		}
		return columns;
	};

	const setValue = ( value ) => {
		if ( device === 'tablet' ) {
			onChange( {
				[ tabletKey ]: value,
			} );
		} else if ( device === 'mobile' ) {
			onChange( {
				[ mobileKey ]: value,
			} );
		} else {
			const nextValues = {
				[ desktopKey ]: value,
			};

			if ( lockTabletMobileToDesktop ) {
				const safeTabletValue =
					typeof tabletColumns === 'number'
						? tabletColumns
						: value;
				const safeMobileValue =
					typeof mobileColumns === 'number'
						? mobileColumns
						: value;
				nextValues[ tabletKey ] = Math.min( value, safeTabletValue );
				nextValues[ mobileKey ] = Math.min( value, safeMobileValue );
			}

			onChange( nextValues );
		}
	};

	const deviceIcons = {
		desktop,
		tablet,
		mobile,
	};
	let dynamicMax = max;
	if ( device !== 'desktop' && lockTabletMobileToDesktop ) {
		dynamicMax = columns || max;
	}
	const controlHelp =
		help ||
		`Adjust the default amount of columns on ${
			device.charAt( 0 ).toUpperCase() + device.slice( 1 )
		}.`;

	return (
		<div
			className="pb-responsive-range-control"
			style={ { marginBottom: '16px' } }
		>
			<div
				style={ {
					display: 'flex',
					alignItems: 'center',
					gap: '8px',
					marginBottom: '8px',
				} }
			>
				<span
					style={ {
						fontSize: '11px',
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
						<div
							style={ {
								padding: '8px',
								display: 'flex',
								gap: '8px',
							} }
						>
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
				max={ dynamicMax }
				value={ getValue() }
				onChange={ setValue }
				help={ controlHelp }
				__nextHasNoMarginBottom
				__next40pxDefaultSize
			/>
		</div>
	);
};

ResponsiveRangeControl.propTypes = {
	label: PropTypes.string.isRequired,
	columns: PropTypes.number.isRequired,
	tabletColumns: PropTypes.number,
	mobileColumns: PropTypes.number,
	desktopKey: PropTypes.string,
	tabletKey: PropTypes.string,
	mobileKey: PropTypes.string,
	min: PropTypes.number,
	max: PropTypes.number,
	lockTabletMobileToDesktop: PropTypes.bool,
	help: PropTypes.string,
	onChange: PropTypes.func.isRequired,
};

export default ResponsiveRangeControl;
