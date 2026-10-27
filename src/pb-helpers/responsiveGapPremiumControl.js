import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import ResponsiveRangeControl from './ResponsiveRangeControl';
import ResponsiveRangeInspector from './ResponsiveRangeInspector';
import { resolveGalleryGaps } from './galleryGap';

export const registerResponsiveGapPremiumControl = ( {
	hookName,
	gapsHookName,
	namespace,
} ) => {
	addFilter(
		gapsHookName,
		`${ namespace }-responsive-gap-values`,
		( defaultGaps, attributes = {} ) => resolveGalleryGaps( attributes )
	);

	// Only the premium bundle registers this fill, matching the normal gap control.
	addFilter(
		`${hookName}.inspector`,
		`${namespace}-responsive-gap-inspector`,
		(defaultContent, { clientId, attributes = {}, setAttributes } = {}) => (
			<ResponsiveRangeInspector
				clientId={clientId}
				label={__("Gap Between Items", "folioblocks")}
				desktopKey="gap"
				tabletKey="tabletGap"
				mobileKey="mobileGap"
				attributes={resolveGalleryGaps(attributes)}
				setAttributes={(newValues) =>
					setAttributes({ ...newValues, noGap: false })
				}
				min={0}
				max={50}
				help={__("Set the space between gallery images.", "folioblocks")}
			/>
		),
	);


	addFilter(
		hookName,
		`${ namespace }-responsive-gap-control`,
		( defaultContent, props = {} ) => {
			const { attributes = {}, setAttributes } = props;
			const responsiveGaps = resolveGalleryGaps( attributes );

			return (
				<ResponsiveRangeControl
					label={ __( 'Gap Between Items', 'folioblocks' ) }
					columns={ responsiveGaps.gap }
					tabletColumns={ responsiveGaps.tabletGap }
					mobileColumns={ responsiveGaps.mobileGap }
					desktopKey="gap"
					tabletKey="tabletGap"
					mobileKey="mobileGap"
					min={ 0 }
					max={ 50 }
					lockTabletMobileToDesktop={ false }
					onChange={ ( newValues ) =>
						setAttributes( { ...newValues, noGap: false } )
					}
					help={ __(
						'Set the space between gallery images.',
						'folioblocks'
					) }
				/>
			);
		}
	);
};
