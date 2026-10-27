/**
 * Background Video Block
 * Premium JS
 */
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { ToggleControl } from '@wordpress/components';
import ResponsiveHeightRangeControl from '../pb-helpers/ResponsiveHeightRangeControl';
import ResponsiveRangeInspector from '../pb-helpers/ResponsiveRangeInspector';

addFilter(
	'folioBlocks.backgroundVideoBlock.sizingFocalControls',
	'folioblocks/background-video-sizing-focal-premium',
	( _original, { attributes, setAttributes } ) => (
		<>
			<ResponsiveHeightRangeControl
				label={ __( 'Height', 'folioblocks' ) }
				heightDesktop={ attributes.heightDesktop }
				heightTablet={ attributes.heightTablet }
				heightMobile={ attributes.heightMobile }
				onChange={ ( next ) => setAttributes( next ) }
				min={ 1 }
				maxDesktop={ 100 }
				unitLabel="vh"
			/>

			<ResponsiveHeightRangeControl
				label={ __( 'Focal Point X (Left - Right)', 'folioblocks' ) }
				heightDesktop={ attributes.objectPositionXDesktop }
				heightTablet={ attributes.objectPositionXTablet }
				heightMobile={ attributes.objectPositionXMobile }
				onChange={ ( next ) =>
					setAttributes( {
						objectPositionXDesktop: next.heightDesktop,
						objectPositionXTablet: next.heightTablet,
						objectPositionXMobile: next.heightMobile,
					} )
				}
				min={ 0 }
				maxDesktop={ 100 }
				step={ 1 }
				unitLabel="%"
				lockToDesktop={ false }
				helpText={ __(
					'Adjust the horizontal focal point per device.',
					'folioblocks'
				) }
			/>

			<ResponsiveHeightRangeControl
				label={ __( 'Focal Point Y (Up - Down)', 'folioblocks' ) }
				heightDesktop={ attributes.objectPositionYDesktop }
				heightTablet={ attributes.objectPositionYTablet }
				heightMobile={ attributes.objectPositionYMobile }
				onChange={ ( next ) =>
					setAttributes( {
						objectPositionYDesktop: next.heightDesktop,
						objectPositionYTablet: next.heightTablet,
						objectPositionYMobile: next.heightMobile,
					} )
				}
				min={ 0 }
				maxDesktop={ 100 }
				step={ 1 }
				unitLabel="%"
				lockToDesktop={ false }
				helpText={ __(
					'Adjust the vertical focal point per device.',
					'folioblocks'
				) }
			/>
		</>
	)
);
addFilter(
	'folioBlocks.backgroundVideoBlock.disableRightClickToggle',
	'folioblocks/background-video-block-disable-right-click',
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

// Responsive sizing remains available through the premium editor bundle.
addFilter(
    'folioBlocks.backgroundVideoBlock.sizingFocalControls.inspector',
    'folioblocks/background-video-responsive-inspector',
    ( _original, { clientId, attributes, setAttributes } ) => (
        <>
            <ResponsiveRangeInspector
                clientId={clientId}
                attributes={attributes}
                setAttributes={setAttributes}
                label={__( 'Height', 'folioblocks' )}
                desktopKey="heightDesktop"
                tabletKey="heightTablet"
                mobileKey="heightMobile"
                min={1}
                max={attributes.heightDesktop || 100}
                help={__( 'Set the height (vh) for this screen size.', 'folioblocks' )}
            />
            <ResponsiveRangeInspector
                clientId={clientId}
                attributes={attributes}
                setAttributes={setAttributes}
                label={__( 'Focal Point X (Left - Right)', 'folioblocks' )}
                desktopKey="objectPositionXDesktop"
                tabletKey="objectPositionXTablet"
                mobileKey="objectPositionXMobile"
                min={0}
                max={100}
                help={__( 'Adjust the horizontal focal point (%) for this screen size.', 'folioblocks' )}
            />
            <ResponsiveRangeInspector
                clientId={clientId}
                attributes={attributes}
                setAttributes={setAttributes}
                label={__( 'Focal Point Y (Up - Down)', 'folioblocks' )}
                desktopKey="objectPositionYDesktop"
                tabletKey="objectPositionYTablet"
                mobileKey="objectPositionYMobile"
                min={0}
                max={100}
                help={__( 'Adjust the vertical focal point (%) for this screen size.', 'folioblocks' )}
            />
        </>
    )
);
