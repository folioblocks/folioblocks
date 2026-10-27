import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { ToggleControl } from '@wordpress/components';

export const registerPremiumToggleControl = ( {
	hookName,
	namespace,
	attribute,
	label,
	help,
	defaultValue = false,
	hideInsideGallery = false,
	coerceBoolean = false,
	refreshOnChange = false,
} ) => {
	addFilter(
		hookName,
		`${ namespace }-${ attribute }-toggle`,
		( defaultContent, props = {} ) => {
			const {
				attributes = {},
				setAttributes,
				isInsideGallery,
				clientId,
				updateBlockAttributes,
			} = props;

			if ( hideInsideGallery && isInsideGallery ) {
				return null;
			}

			const value = attributes[ attribute ] ?? defaultValue;

			return (
				<ToggleControl
					label={ label }
					help={ help }
					checked={ !! value }
					onChange={ ( nextValue ) => {
						if ( typeof setAttributes !== 'function' ) {
							return;
						}

						const nextAttributeValue = coerceBoolean
							? !! nextValue
							: nextValue;
						setAttributes( { [ attribute ]: nextAttributeValue } );

						if (
							refreshOnChange &&
							typeof updateBlockAttributes === 'function'
						) {
							setTimeout( () => {
								updateBlockAttributes( clientId, {
									_forceRefresh: Date.now(),
								} );
							}, 50 );
						}
					} }
					__nextHasNoMarginBottom
				/>
			);
		}
	);
};

export const registerDisableRightClickPremiumControl = () => {};

export const registerLazyLoadPremiumControl = () => {};

export const registerRandomizeOrderPremiumControl = ( {
	hookPrefix,
	namespace,
	hookName = `${ hookPrefix }.randomizeToggle`,
	refreshOnChange = false,
} ) =>
	registerPremiumToggleControl( {
		hookName,
		namespace,
		attribute: 'randomizeOrder',
		label: __( 'Randomize Image Order', 'folioblocks' ),
		help: __( 'Randomize order of images.', 'folioblocks' ),
		refreshOnChange,
	} );
