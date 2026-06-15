import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import ResponsiveRangeControl from './ResponsiveRangeControl';
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
