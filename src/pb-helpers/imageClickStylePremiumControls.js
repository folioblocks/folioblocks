import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import {
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { CompactTwoColorControl } from './CompactColorControl';

const RESET_ICON_COLOR_ATTRIBUTES = {
	downloadIconColor: '',
	downloadIconBgColor: '',
	cartIconColor: '',
	cartIconBgColor: '',
	linkIconColor: '',
	linkIconBgColor: '',
};

const isLinkIconEnabled = ( attributes = {} ) =>
	( attributes.imageClickAction === 'custom_url' ||
		attributes.imageClickAction === 'page_post' ) &&
	( attributes.imageClickTarget || 'icon' ) === 'icon';

const IconColorPanelItem = ( {
	attributes,
	setAttributes,
	label,
	controlLabel,
	colorAttribute,
	backgroundAttribute,
} ) => (
	<ToolsPanelItem
		label={ label }
		hasValue={ () =>
			!! attributes[ colorAttribute ] ||
			!! attributes[ backgroundAttribute ]
		}
		onDeselect={ () =>
			setAttributes( {
				[ colorAttribute ]: '',
				[ backgroundAttribute ]: '',
			} )
		}
		isShownByDefault
	>
		<CompactTwoColorControl
			label={ controlLabel }
			value={ {
				first: attributes[ colorAttribute ],
				second: attributes[ backgroundAttribute ],
			} }
			onChange={ ( next ) =>
				setAttributes( {
					[ colorAttribute ]: next?.first || '',
					[ backgroundAttribute ]: next?.second || '',
				} )
			}
			firstLabel={ __( 'Icon', 'folioblocks' ) }
			secondLabel={ __( 'Background', 'folioblocks' ) }
		/>
	</ToolsPanelItem>
);

export const registerImageClickStylePremiumControls = ( {
	hookPrefix,
	namespace,
	panelLabel = __( 'Gallery Click Styles', 'folioblocks' ),
	hideInsideGallery = false,
} ) => {
	addFilter(
		`${ hookPrefix }.iconStyleControls`,
		`${ namespace }-icon-style-controls`,
		( defaultContent, props ) => {
			const { attributes, setAttributes, isInsideGallery } = props;

			if ( hideInsideGallery && isInsideGallery ) {
				return null;
			}

			const enableDownload = !! attributes.enableDownload;
			const enableWooCommerce = !! attributes.enableWooCommerce;
			const enableLinkIcon = isLinkIconEnabled( attributes );

			if ( ! enableDownload && ! enableWooCommerce && ! enableLinkIcon ) {
				return null;
			}

			return (
				<ToolsPanel
					label={ panelLabel }
					resetAll={ () =>
						setAttributes( RESET_ICON_COLOR_ATTRIBUTES )
					}
				>
					{ enableDownload && (
						<IconColorPanelItem
							attributes={ attributes }
							setAttributes={ setAttributes }
							label={ __(
								'Download Icon Colors',
								'folioblocks'
							) }
							controlLabel={ __(
								'Download Icon',
								'folioblocks'
							) }
							colorAttribute="downloadIconColor"
							backgroundAttribute="downloadIconBgColor"
						/>
					) }

					{ enableWooCommerce && (
						<IconColorPanelItem
							attributes={ attributes }
							setAttributes={ setAttributes }
							label={ __(
								'Add to Cart Icon Colors',
								'folioblocks'
							) }
							controlLabel={ __(
								'Add to Cart Icon',
								'folioblocks'
							) }
							colorAttribute="cartIconColor"
							backgroundAttribute="cartIconBgColor"
						/>
					) }

					{ enableLinkIcon && (
						<IconColorPanelItem
							attributes={ attributes }
							setAttributes={ setAttributes }
							label={ __(
								'Link Target Icon Colors',
								'folioblocks'
							) }
							controlLabel={ __(
								'Link Target Icon',
								'folioblocks'
							) }
							colorAttribute="linkIconColor"
							backgroundAttribute="linkIconBgColor"
						/>
					) }
				</ToolsPanel>
			);
		}
	);
};
