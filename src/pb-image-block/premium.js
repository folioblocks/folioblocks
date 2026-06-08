/**
 * PB Image Block
 * Premium JS
 */
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import {
	CheckboxControl,
	Dropdown,
	SelectControl,
	Spinner,
	PanelBody,
	RangeControl,
	TextControl,
	ToolbarButton,
	ToolbarGroup,
	ToggleControl,
} from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { useDebounce } from '@wordpress/compose';
import apiFetch from '@wordpress/api-fetch';
import ProductSearchControl from '../pb-helpers/ProductSearchControl.js';
import CompactColorControl from '../pb-helpers/CompactColorControl.js';
import '../pb-helpers/applyThumbnails';
import { registerImageClickStylePremiumControls } from '../pb-helpers/imageClickStylePremiumControls.js';
import { registerImageHoverActionPremiumControls } from '../pb-helpers/imageHoverActionPremiumControls.js';
import {
	registerDisableRightClickPremiumControl,
	registerLazyLoadPremiumControl,
} from '../pb-helpers/simplePremiumControls.js';
import {
	Icon,
	aspectRatio,
	capturePhoto,
	download,
	link,
	timeToRead,
} from '@wordpress/icons';
import { wooCartIcon } from '../pb-helpers/icons.js';

const getAssignedFilterCategories = ( attributes = {} ) => {
	const assignedCategories = Array.isArray( attributes.filterCategories )
		? attributes.filterCategories
				.map( ( category ) =>
					typeof category === 'string' ? category.trim() : ''
				)
				.filter( Boolean )
		: [];

	if ( assignedCategories.length > 0 ) {
		return [ ...new Set( assignedCategories ) ];
	}

	const legacyCategory =
		typeof attributes.filterCategory === 'string'
			? attributes.filterCategory.trim()
			: '';
	return legacyCategory ? [ legacyCategory ] : [];
};

const getWooProductValue = ( attributes = {} ) =>
	attributes.wooProductId
		? {
				id: attributes.wooProductId,
				name: attributes.wooProductName,
				price_html: attributes.wooProductPrice,
				permalink: attributes.wooProductURL,
				image: attributes.wooProductImage || '',
		  }
		: null;

const getWooLinkActionSelectState = (
	attributes = {},
	isInsideGallery = false,
	contextWooDefaultLinkAction = ''
) => {
	const hasGalleryDefault =
		isInsideGallery &&
		typeof contextWooDefaultLinkAction === 'string' &&
		contextWooDefaultLinkAction.length > 0;
	const effectiveDefault = hasGalleryDefault
		? contextWooDefaultLinkAction
		: 'add_to_cart';
	const currentAction =
		attributes.wooLinkAction && attributes.wooLinkAction !== 'inherit'
			? attributes.wooLinkAction
			: 'inherit';
	const effectiveSelectedAction =
		currentAction === 'inherit' ? effectiveDefault : currentAction;

	return {
		hasGalleryDefault,
		selectValue: hasGalleryDefault ? currentAction : effectiveSelectedAction,
	};
};

const setWooProductAttributes = ( product, setAttributes ) => {
	if ( ! product || ! product.id ) {
		setAttributes( {
			wooProductId: 0,
			wooProductName: '',
			wooProductPrice: '',
			wooProductURL: '',
			wooProductDescription: '',
			wooProductImage: '',
		} );
		return;
	}

	setAttributes( {
		wooProductId: product.id,
		wooProductName: product.name,
		wooProductPrice: product.price_html || product.price || '',
		wooProductURL: product.permalink || '',
		wooProductImage: product.image || product.images?.[ 0 ]?.src || '',
	} );
};

const apertureIcon = (
	<svg viewBox="-16 -16 495 495" aria-hidden="true" focusable="false">
		<path
			fill="currentColor"
			d="M395.195,67.805C351.47,24.08,293.335,0,231.5,0S111.529,24.08,67.805,67.805S0,169.664,0,231.5S24.08,351.47,67.805,395.195S169.664,463,231.5,463s119.971-24.08,163.695-67.805S463,293.335,463,231.5S438.919,111.529,395.195,67.805z M443.392,186.803c-0.321,0.232-0.631,0.484-0.92,0.772l-79.886,79.886V59.168c7.689,5.873,15.045,12.285,22.002,19.243C414.732,108.555,434.877,146.025,443.392,186.803z M188.262,347.586l-72.848-72.848v-94.2l65.124-65.124h94.2l72.848,72.848v94.201l-65.124,65.124H188.262z M347.586,48.671v118.378L198.094,17.557C209.049,15.871,220.207,15,231.5,15C273.258,15,313.208,26.748,347.586,48.671z M78.411,78.411c28.553-28.552,63.68-48.134,101.964-57.36l79.362,79.362H59.168C65.042,92.725,71.454,85.369,78.411,78.411z M48.67,115.414h110.654L16.613,258.126C15.544,249.358,15,240.471,15,231.5C15,189.741,26.748,149.791,48.67,115.414z M19.607,276.196c0.321-0.232,0.631-0.484,0.92-0.772l79.886-79.886v208.294c-7.688-5.873-15.045-12.285-22.002-19.243C48.268,354.445,28.123,316.974,19.607,276.196z M115.414,414.329V295.951l149.491,149.491C253.951,447.129,242.792,448,231.5,448C189.741,448,149.791,436.252,115.414,414.329z M384.588,384.588c-28.553,28.552-63.68,48.134-101.965,57.36l-79.362-79.362h200.569C397.958,370.275,391.546,377.631,384.588,384.588z M414.329,347.586H303.675l142.712-142.712c1.068,8.767,1.613,17.655,1.613,26.626C448,273.258,436.252,313.208,414.329,347.586z"
		/>
	</svg>
);

const isUnknownExifValue = ( value, unknownValue ) => {
	if ( ! value ) {
		return true;
	}

	return (
		String( value ).trim().toLowerCase() ===
		String( unknownValue ).trim().toLowerCase()
	);
};

const OverlayExifContent = ( { attributes, hideUnknownExifFields = false } ) => {
	const unknownValue = __( 'Unknown', 'folioblocks' );
	const fields = [
		{ icon: capturePhoto, value: attributes.exifCamera || unknownValue },
		{ icon: aspectRatio, value: attributes.exifFocalLength || unknownValue },
		{ icon: timeToRead, value: attributes.exifShutterSpeed || unknownValue },
		{ icon: apertureIcon, value: attributes.exifAperture || unknownValue },
		{ icon: 'iso', value: attributes.exifIso || unknownValue },
	].filter(
		( field ) =>
			! hideUnknownExifFields ||
			! isUnknownExifValue( field.value, unknownValue )
	);

	if ( fields.length === 0 ) {
		return null;
	}

	return (
		<div className="pb-hover-exif">
			{ fields.map( ( field, index ) => (
				<span className="pb-hover-exif__item" key={ index }>
					<span className="pb-hover-exif__icon">
						{ field.icon === 'iso' ? (
							<span className="pb-hover-exif-icon__iso">ISO</span>
						) : (
							<Icon icon={ field.icon } size={ 18 } />
						) }
					</span>
					<span className="pb-hover-exif__value">{ field.value }</span>
				</span>
			) ) }
		</div>
	);
};

const getCameraMetadataFields = ( attributes ) => {
	const unknownValue = __( 'Unknown', 'folioblocks' );

	return [
		{
			icon: capturePhoto,
			label: __( 'Camera Model', 'folioblocks' ),
			value: attributes.exifCamera || unknownValue,
		},
		{
			icon: aspectRatio,
			label: __( 'Focal Length', 'folioblocks' ),
			value: attributes.exifFocalLength || unknownValue,
		},
		{
			icon: timeToRead,
			label: __( 'Shutter Speed', 'folioblocks' ),
			value: attributes.exifShutterSpeed || unknownValue,
		},
		{
			icon: apertureIcon,
			label: __( 'Aperture', 'folioblocks' ),
			value: attributes.exifAperture || unknownValue,
		},
		{
			icon: 'iso',
			label: __( 'ISO', 'folioblocks' ),
			value: attributes.exifIso || unknownValue,
		},
	];
};

const CameraMetadataIcon = ( { icon } ) => {
	if ( icon === 'iso' ) {
		return <span className="pb-image-block-camera-metadata__iso">ISO</span>;
	}

	return <Icon icon={ icon } size={ 18 } />;
};

const CameraMetadataControls = ( { attributes } ) => {
	const fields = getCameraMetadataFields( attributes );

	return (
		<div className="pb-image-block-camera-metadata">
			<div className="pb-image-block-camera-metadata__heading">
				{ __( 'EXIF DATA', 'folioblocks' ) }
			</div>
			{ fields.map( ( field ) => (
				<div
					key={ field.label }
					className="pb-image-block-camera-metadata__row"
				>
					<div className="pb-image-block-camera-metadata__icon">
						<CameraMetadataIcon icon={ field.icon } />
					</div>
					<div>
						<div className="pb-image-block-camera-metadata__label">
							{ field.label }
						</div>
						<div className="pb-image-block-camera-metadata__value">
							{ field.value }
						</div>
					</div>
				</div>
			) ) }
		</div>
	);
};

addFilter(
	'folioBlocks.imageBlock.cameraMetadataControls',
	'folioblocks/image-block/camera-metadata-controls',
	( _fallback, { attributes } ) => (
		<CameraMetadataControls attributes={ attributes } />
	)
);

registerImageHoverActionPremiumControls( {
	hookPrefix: 'folioBlocks.imageBlock',
	namespace: 'folioblocks/image-block',
} );

registerImageClickStylePremiumControls( {
	hookPrefix: 'folioBlocks.imageBlock',
	namespace: 'folioblocks/image-block',
	panelLabel: __( 'Image Click Styles', 'folioblocks' ),
	hideInsideGallery: true,
} );

registerDisableRightClickPremiumControl( {
	hookPrefix: 'folioBlocks.imageBlock',
	namespace: 'folioblocks/image-block',
	label: __( 'Disable Right-Click', 'folioblocks' ),
	hideInsideGallery: true,
} );

registerLazyLoadPremiumControl( {
	hookPrefix: 'folioBlocks.imageBlock',
	namespace: 'folioblocks/image-block',
	help: __( 'Enables lazy loading of image.', 'folioblocks' ),
	defaultValue: true,
	hideInsideGallery: true,
} );

const PagePostSearchControl = ( { attributes, setAttributes } ) => {
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ searchResults, setSearchResults ] = useState( [] );
	const [ isSearching, setIsSearching ] = useState( false );

	useEffect( () => {
		if ( ! attributes.linkedPostId && ! attributes.linkedPostUrl ) {
			setSearchTerm( '' );
			setSearchResults( [] );
		}
	}, [ attributes.linkedPostId, attributes.linkedPostUrl ] );

	const debouncedSearch = useDebounce( ( term ) => {
		if ( ! term || term.length < 2 ) {
			setSearchResults( [] );
			return;
		}

		setIsSearching( true );
		apiFetch( {
			path: `/wp/v2/search?search=${ encodeURIComponent(
				term
			) }&type=post&subtype=post,page&per_page=10`,
		} )
			.then( ( results ) => {
				setSearchResults(
					results.map( ( item ) => ( {
						id: item.id,
						title: item.title || '',
						url: item.url || '',
						type: item.subtype || item.type || '',
					} ) )
				);
			} )
			.catch( () => setSearchResults( [] ) )
			.finally( () => setIsSearching( false ) );
	}, 400 );

	useEffect( () => {
		debouncedSearch( searchTerm );
	}, [ searchTerm ] );

	const clearSelection = () => {
		setAttributes( {
			linkedPostId: 0,
			linkedPostTitle: '',
			linkedPostUrl: '',
			linkedPostType: '',
		} );
		setSearchTerm( '' );
		setSearchResults( [] );
	};

	return (
		<>
			<TextControl
				label={ __( 'Linked Page or Post', 'folioblocks' ) }
				value={ searchTerm }
				placeholder={ __( 'Search pages or posts...', 'folioblocks' ) }
				onChange={ ( value ) => setSearchTerm( value ) }
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				help={ __(
					'Images without a selected page or post will not be linked.',
					'folioblocks'
				) }
			/>
			{ isSearching && <Spinner /> }
			{ searchResults.length > 0 && (
				<div className="pb-product-search-results">
					{ searchResults.map( ( item ) => (
						<div
							key={ `${ item.type }-${ item.id }` }
							className="pb-product-search-item"
							onClick={ () => {
								setAttributes( {
									linkedPostId: item.id,
									linkedPostTitle: item.title,
									linkedPostUrl: item.url,
									linkedPostType: item.type,
								} );
								setSearchTerm( '' );
								setSearchResults( [] );
							} }
						>
							<div className="pb-product-search-details">
								<strong>{ item.title }</strong>
								<div className="pb-product-search-price">
									{ item.type }
								</div>
							</div>
						</div>
					) ) }
				</div>
			) }
			{ attributes.linkedPostUrl && (
				<div className="pb-linked-page-preview">
					<a
						href={ attributes.linkedPostUrl }
						target="_blank"
						rel="noopener noreferrer"
						className="pb-linked-page-link"
					>
						<div className="pb-linked-page-info">
							<strong>{ attributes.linkedPostTitle }</strong>
							<div className="pb-linked-page-type">
								{ attributes.linkedPostType }
							</div>
						</div>
					</a>
					<button
						type="button"
						className="pb-remove-page-link"
						onClick={ clearSelection }
						aria-label={ __( 'Remove Link', 'folioblocks' ) }
					>
						<span aria-hidden="true">&times;</span>
					</button>
				</div>
			) }
			<div className="pb-image-click-new-tab-toggle">
				<ToggleControl
					label={ __( 'Open in new tab', 'folioblocks' ) }
					checked={ !! attributes.linkedPostOpenInNewTab }
					onChange={ ( value ) =>
						setAttributes( {
							linkedPostOpenInNewTab: value,
						} )
					}
					__nextHasNoMarginBottom
					help={ __(
						'Open the linked page or post in a new browser tab.',
						'folioblocks'
					) }
				/>
			</div>
		</>
	);
};

const LinkTargetControls = ( {
	attributes,
	setAttributes,
	imageClickAction,
	isInsideGallery = false,
	showLightboxControls = true,
	showIconDisplayControls = true,
} ) => {
	const imageClickTarget = attributes.imageClickTarget || 'icon';
	const linkIconDisplay = attributes.linkIconDisplay || 'hover';
	const lightbox = !! attributes.lightbox;
	const isGalleryChild = !! isInsideGallery;
	const isCustomOrPage =
		imageClickAction === 'custom_url' || imageClickAction === 'page_post';

	return (
		<>
			{ ! isGalleryChild && (
				<SelectControl
					label={ __( 'Link Target', 'folioblocks' ) }
					value={ imageClickTarget }
					options={ [
						{
							label: __( 'Link Target Icon', 'folioblocks' ),
							value: 'icon',
						},
						{
							label: __( 'Thumbnail', 'folioblocks' ),
							value: 'thumbnail',
						},
					] }
					onChange={ ( value ) => {
						const nextAttributes = { imageClickTarget: value };
						if ( value === 'thumbnail' ) {
							nextAttributes.lightbox = false;
							nextAttributes.enableLightbox = false;
						}
						setAttributes( nextAttributes );
					} }
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					help={
						isCustomOrPage && imageClickTarget === 'thumbnail'
							? __(
									'Set the destination on this Image Block.',
									'folioblocks'
							  )
							: __(
									'Choose whether the link is attached to the image or an icon.',
									'folioblocks'
							  )
					}
				/>
			) }
			{ imageClickTarget === 'icon' &&
				! isGalleryChild &&
				showLightboxControls && (
				<>
					{ showIconDisplayControls && (
						<SelectControl
							label={ __( 'Display Link Target Icon', 'folioblocks' ) }
							value={ linkIconDisplay }
							options={ [
								{
									label: __( 'On Hover', 'folioblocks' ),
									value: 'hover',
								},
								{
									label: __( 'Always', 'folioblocks' ),
									value: 'always',
								},
							] }
							onChange={ ( value ) =>
								setAttributes( { linkIconDisplay: value } )
							}
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							help={ __(
								'Choose when to display the link target icon.',
								'folioblocks'
							) }
						/>
					) }
					<ToggleControl
						label={ __( 'Enable Lightbox', 'folioblocks' ) }
						checked={ lightbox }
						onChange={ ( newLightbox ) =>
							setAttributes( {
								lightbox: newLightbox,
								enableLightbox: newLightbox,
							} )
						}
						__nextHasNoMarginBottom
						help={ __(
							'Open images in a lightbox when the thumbnail is clicked.',
							'folioblocks'
						) }
					/>
					{ lightbox && (
						<LightboxContentControl
							attributes={ attributes }
							setAttributes={ setAttributes }
						/>
					) }
				</>
			) }
		</>
	);
};

const getLightboxContent = ( attributes ) => {
	if ( attributes.lightboxContent ) {
		return attributes.lightboxContent;
	}

	if ( attributes.lightboxCaption ) {
		return attributes.wooLightboxInfoType === 'product'
			? 'product'
			: 'caption';
	}

	return 'none';
};

const LightboxContentControl = ( {
	attributes,
	setAttributes,
	showProductInfoOption = false,
} ) => {
	const value = getLightboxContent( attributes );
	const options = [
		{ label: __( 'None', 'folioblocks' ), value: 'none' },
		{ label: __( 'Show Image Title', 'folioblocks' ), value: 'title' },
		{ label: __( 'Show Image Caption', 'folioblocks' ), value: 'caption' },
		{ label: __( 'Show EXIF Data', 'folioblocks' ), value: 'exif' },
	];

	if ( showProductInfoOption ) {
		options.push( {
			label: __( 'Show Product Info', 'folioblocks' ),
			value: 'product',
		} );
	}

	return (
		<>
			<SelectControl
				label={ __( 'Lightbox Content', 'folioblocks' ) }
				value={
					showProductInfoOption || value !== 'product' ? value : 'none'
				}
				options={ options }
				onChange={ ( nextValue ) =>
					setAttributes( {
						lightboxContent: nextValue,
						lightboxCaption: nextValue !== 'none',
						showCaptionInLightbox: nextValue !== 'none',
						wooLightboxInfoType:
							nextValue === 'product' ? 'product' : 'caption',
					} )
				}
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				help={ __(
					'Choose what appears below images in the lightbox.',
					'folioblocks'
				) }
			/>
			{ value === 'exif' && (
				<ToggleControl
					label={ __( 'Hide Unknown EXIF Fields', 'folioblocks' ) }
					checked={ !! attributes.hideUnknownExifFields }
					onChange={ ( hideUnknownExifFields ) =>
						setAttributes( { hideUnknownExifFields } )
					}
					__nextHasNoMarginBottom
					help={ __(
						'Hide EXIF rows that do not have a value.',
						'folioblocks'
					) }
				/>
			) }
		</>
	);
};

addFilter(
	'folioBlocks.imageBlock.imageClickActionOptions',
	'folioblocks/pb-image-block-premium-click-action-options',
	( options ) => {
		const premiumOptions = [
			...options,
			{
				label: __( 'Enable Image Downloads', 'folioblocks' ),
				value: 'download',
			},
			{
				label: __( 'Link Image to Media File', 'folioblocks' ),
				value: 'media_file',
			},
			{
				label: __( 'Link Image to Custom URL', 'folioblocks' ),
				value: 'custom_url',
			},
			{
				label: __( 'Link Image to Page/Post', 'folioblocks' ),
				value: 'page_post',
			},
		];

		if ( window.folioBlocksData?.hasWooCommerce ) {
			premiumOptions.push( {
				label: __( 'WooCommerce Product', 'folioblocks' ),
				value: 'woocommerce',
			} );
		}

		return premiumOptions;
	}
);

addFilter(
	'folioBlocks.imageBlock.imageClickActionNotice',
	'folioblocks/pb-image-block-premium-click-action-notice',
	() => null
);

addFilter(
	'folioBlocks.imageBlock.customUrlControls',
	'folioblocks/pb-image-block-premium-custom-url-controls',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;

		return (
			<>
				<TextControl
					label={ __( 'Custom URL', 'folioblocks' ) }
					type="url"
					value={ attributes.customUrl || '' }
					onChange={ ( value ) =>
						setAttributes( {
							customUrl: value,
						} )
					}
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					help={ __(
						'Images without a URL will not be linked.',
						'folioblocks'
					) }
				/>
				<div className="pb-image-click-new-tab-toggle">
						<ToggleControl
							label={ __( 'Open in new tab', 'folioblocks' ) }
							checked={ !! attributes.customUrlOpenInNewTab }
							onChange={ ( value ) =>
								setAttributes( {
									customUrlOpenInNewTab: value,
								} )
							}
							__nextHasNoMarginBottom
							help={ __(
								'Open the custom URL in a new browser tab.',
								'folioblocks'
							) }
						/>
					</div>
				<LinkTargetControls
					attributes={ attributes }
					setAttributes={ setAttributes }
					imageClickAction="custom_url"
					isInsideGallery={ props.isInsideGallery }
				/>
			</>
		);
	}
);

addFilter(
	'folioBlocks.imageBlock.customUrlToolbarButton',
	'folioblocks/pb-image-block-premium-custom-url-toolbar-button',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;

		return (
			<ToolbarGroup>
				<Dropdown
					popoverProps={ { placement: 'bottom-start' } }
					renderToggle={ ( { isOpen, onToggle } ) => (
						<ToolbarButton
							icon={ link }
							label={ __( 'Edit Custom URL', 'folioblocks' ) }
							onClick={ onToggle }
							isPressed={ isOpen }
						/>
					) }
					renderContent={ () => (
						<div style={ { padding: '12px', width: '280px' } }>
							<TextControl
								label={ __( 'Custom URL', 'folioblocks' ) }
								type="url"
								value={ attributes.customUrl || '' }
								onChange={ ( value ) =>
									setAttributes( {
										customUrl: value,
									} )
								}
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								help={ __(
									'Images without a URL will not be linked.',
									'folioblocks'
								) }
							/>
							<div className="pb-image-click-new-tab-toggle">
									<ToggleControl
										label={ __(
											'Open in new tab',
											'folioblocks'
										) }
									checked={
										!! attributes.customUrlOpenInNewTab
									}
									onChange={ ( value ) =>
										setAttributes( {
											customUrlOpenInNewTab: value,
										} )
										}
										__nextHasNoMarginBottom
										help={ __(
											'Open the custom URL in a new browser tab.',
											'folioblocks'
										) }
									/>
								</div>
						</div>
					) }
				/>
			</ToolbarGroup>
		);
	}
);

addFilter(
	'folioBlocks.imageBlock.pagePostLinkControls',
	'folioblocks/pb-image-block-premium-page-post-link-controls',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;

		return (
			<>
				<PagePostSearchControl
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
				<LinkTargetControls
					attributes={ attributes }
					setAttributes={ setAttributes }
					imageClickAction="page_post"
					isInsideGallery={ props.isInsideGallery }
				/>
			</>
		);
	}
);

addFilter(
	'folioBlocks.imageBlock.pagePostLinkToolbarButton',
	'folioblocks/pb-image-block-premium-page-post-link-toolbar-button',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;

		return (
			<ToolbarGroup>
				<Dropdown
					popoverProps={ { placement: 'bottom-start' } }
					renderToggle={ ( { isOpen, onToggle } ) => (
						<ToolbarButton
							icon={ link }
							label={ __( 'Edit Page/Post Link', 'folioblocks' ) }
							onClick={ onToggle }
							isPressed={ isOpen }
						/>
					) }
					renderContent={ () => (
						<div style={ { padding: '12px', width: '280px' } }>
							<PagePostSearchControl
								attributes={ attributes }
								setAttributes={ setAttributes }
							/>
						</div>
					) }
				/>
			</ToolbarGroup>
		);
	}
);

addFilter(
	'folioBlocks.imageBlock.wooProductToolbarButton',
	'folioblocks/pb-image-block-premium-woo-product-toolbar-button',
	( defaultContent, props ) => {
		const {
			attributes,
			setAttributes,
			isInsideGallery,
			contextWooDefaultLinkAction,
		} = props;
		const { hasGalleryDefault, selectValue } =
			getWooLinkActionSelectState(
				attributes,
				isInsideGallery,
				contextWooDefaultLinkAction
			);

		return (
			<ToolbarGroup>
				<Dropdown
					popoverProps={ { placement: 'bottom-start' } }
					renderToggle={ ( { isOpen, onToggle } ) => (
						<ToolbarButton
							icon={ wooCartIcon }
							label={ __(
								'Edit WooCommerce Product',
								'folioblocks'
							) }
							onClick={ onToggle }
							isPressed={ isOpen }
						/>
					) }
					renderContent={ () => (
						<div style={ { padding: '12px', width: '320px' } }>
							<ProductSearchControl
								value={ getWooProductValue( attributes ) }
								onSelect={ ( product ) =>
									setWooProductAttributes(
										product,
										setAttributes
									)
								}
							/>
							{ Number( attributes.wooProductId ) > 0 && (
								<SelectControl
									label={ __(
										'Product Link Behavior',
										'folioblocks'
									) }
									value={ selectValue }
									options={
										hasGalleryDefault
											? [
													{
														label: __(
															'Inherit (Gallery Default)',
															'folioblocks'
														),
														value: 'inherit',
													},
													{
														label: __(
															'Add to Cart',
															'folioblocks'
														),
														value: 'add_to_cart',
													},
													{
														label: __(
															'Open Product Page',
															'folioblocks'
														),
														value: 'product',
													},
											  ]
											: [
													{
														label: __(
															'Add to Cart',
															'folioblocks'
														),
														value: 'add_to_cart',
													},
													{
														label: __(
															'Open Product Page',
															'folioblocks'
														),
														value: 'product',
													},
											  ]
									}
									onChange={ ( value ) =>
										setAttributes( {
											wooLinkAction: value,
										} )
									}
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									help={ __(
										'Choose what happens when visitors use this image product link.',
										'folioblocks'
									) }
								/>
							) }
						</div>
					) }
				/>
			</ToolbarGroup>
		);
	}
);

// Premium: Standalone PB Image Block Download Controls
addFilter(
	'folioBlocks.imageBlock.downloadControls',
	'folioblocks/pb-image-block-premium-downloads',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;
		const { downloadOnHover, lightbox } = attributes;
		const imageClickTarget = attributes.imageClickTarget || 'icon';

		return (
			<>
					<LinkTargetControls
						attributes={ attributes }
						setAttributes={ setAttributes }
						imageClickAction="download"
						showLightboxControls={ false }
						showIconDisplayControls={ false }
					/>
					{ imageClickTarget === 'icon' && (
					<SelectControl
						label={ __( 'Display Image Download Icon', 'folioblocks' ) }
						value={ downloadOnHover ? 'hover' : 'always' }
						options={ [
							{
								label: __( 'On Hover', 'folioblocks' ),
								value: 'hover',
							},
							{
								label: __( 'Always', 'folioblocks' ),
								value: 'always',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( {
								downloadOnHover: value === 'hover',
							} )
						}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={ __(
							'Set display preference for the download icon.',
							'folioblocks'
							) }
						/>
					) }
					{ imageClickTarget === 'icon' && (
						<ToggleControl
							label={ __( 'Enable Lightbox', 'folioblocks' ) }
							checked={ !! lightbox }
							onChange={ ( newLightbox ) =>
								setAttributes( {
									lightbox: newLightbox,
									enableLightbox: newLightbox,
								} )
							}
							__nextHasNoMarginBottom
							help={ __(
								'Open images in a lightbox when clicked.',
								'folioblocks'
							) }
						/>
					) }
					{ imageClickTarget === 'icon' && lightbox && (
						<LightboxContentControl
							attributes={ attributes }
							setAttributes={ setAttributes }
						/>
					) }
				</>
			);
		}
);

// New premium filter: Lightbox controls for standalone Image Block
addFilter(
	'folioBlocks.imageBlock.lightboxControls',
	'folioblocks/pb-image-block-premium-lightbox',
		( defaultContent, props ) => {
		const { attributes, setAttributes } = props;
		const { enableWooCommerce } = attributes;

		return (
			<LightboxContentControl
				attributes={ attributes }
				setAttributes={ setAttributes }
				showProductInfoOption={ !! enableWooCommerce }
			/>
		);
	}
);

// New premium filter: toggle for Show Title on Hover (standalone)

addFilter(
	'folioBlocks.imageBlock.wooCommerceControls',
	'folioblocks/pb-image-block-premium-woocommerce',
	( defaultContent, props ) => {
		const wooActive = window.folioBlocksData?.hasWooCommerce ?? false;
		if ( ! wooActive ) {
			return null;
		}

		const { attributes, setAttributes } = props;
		const {
			lightbox,
			wooCartIconDisplay,
		} = attributes;
		const imageClickTarget = attributes.imageClickTarget || 'icon';

		return (
			<>
					<LinkTargetControls
					attributes={ attributes }
					setAttributes={ setAttributes }
					imageClickAction="woocommerce"
					showLightboxControls={ false }
					showIconDisplayControls={ false }
				/>
				{ imageClickTarget === 'icon' && (
					<SelectControl
						label={ __( 'Display Add to Cart Icon', 'folioblocks' ) }
						value={ wooCartIconDisplay || 'hover' }
						options={ [
							{
								label: __( 'On Hover', 'folioblocks' ),
								value: 'hover',
							},
							{
								label: __( 'Always', 'folioblocks' ),
								value: 'always',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { wooCartIconDisplay: value } )
						}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={ __(
							'Choose when to display the Add to Cart icon.',
							'folioblocks'
						) }
					/>
				) }
					{ imageClickTarget === 'icon' && (
						<ToggleControl
							label={ __( 'Enable Lightbox', 'folioblocks' ) }
							checked={ !! lightbox }
							onChange={ ( newLightbox ) =>
								setAttributes( {
									lightbox: newLightbox,
									enableLightbox: newLightbox,
								} )
							}
							__nextHasNoMarginBottom
							help={ __(
								'Open images in a lightbox when clicked.',
								'folioblocks'
							) }
						/>
					) }

					{ imageClickTarget === 'icon' && lightbox && (
						<LightboxContentControl
							attributes={ attributes }
							setAttributes={ setAttributes }
							showProductInfoOption
						/>
				) }
			</>
		);
	}
);

addFilter(
	'folioBlocks.imageBlock.wooProductLinkControl',
	'folioblocks/pb-image-block-woo',
	(
		Original,
		{
			attributes,
			setAttributes,
			effectiveWooActive,
			isInsideGallery,
			contextWooDefaultLinkAction,
		}
	) => {
		if ( ! effectiveWooActive ) {
			return null;
		}

		const { hasGalleryDefault, selectValue } =
			getWooLinkActionSelectState(
				attributes,
				isInsideGallery,
				contextWooDefaultLinkAction
			);

		return (
			<>
				<ProductSearchControl
					value={ getWooProductValue( attributes ) }
					onSelect={ ( product ) => {
						setWooProductAttributes( product, setAttributes );
					} }
				/>
				{ Number( attributes.wooProductId ) > 0 && (
						<SelectControl
							label={
								hasGalleryDefault
									? __(
											'Default Product Link Behavior',
											'folioblocks'
									  )
									: __(
											'Default Product Click Behavior',
											'folioblocks'
									  )
							}
						value={ selectValue }
						options={
							hasGalleryDefault
								? [
										{
											label: __(
												'Inherit (Gallery Default)',
												'folioblocks'
											),
											value: 'inherit',
										},
										{
											label: __(
												'Add to Cart',
												'folioblocks'
											),
											value: 'add_to_cart',
										},
										{
											label: __(
												'Open Product Page',
												'folioblocks'
											),
											value: 'product',
										},
								  ]
								: [
										{
											label: __(
												'Add to Cart',
												'folioblocks'
											),
											value: 'add_to_cart',
										},
										{
											label: __(
												'Open Product Page',
												'folioblocks'
											),
											value: 'product',
										},
								  ]
						}
						onChange={ ( value ) =>
							setAttributes( { wooLinkAction: value } )
						}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={
								hasGalleryDefault
									? __(
											'Choose what happens when visitors use this image product link. Select Inherit to follow the gallery default.',
											'folioblocks'
									  )
									: __(
											'Choose what happens when visitors use the WooCommerce action.',
											'folioblocks'
									  )
							}
					/>
				) }
			</>
		);
	}
);

addFilter(
	'folioBlocks.imageBlock.filterCategoryControl',
	'folioblocks/pb-image-block-filter-category',
	(
		Original,
		{
			attributes,
			setAttributes,
			filterCategories,
			context,
			isInsideGallery,
		}
	) => {
		const galleryFilterEnabled = !! context?.[ 'folioBlocks/enableFilter' ];
		if (
			! isInsideGallery ||
			! galleryFilterEnabled ||
			! filterCategories?.length
		) {
			return null;
		}

		const assignedCategories = getAssignedFilterCategories( attributes );
		const availableCategories = [
			...new Set( [ ...filterCategories, ...assignedCategories ] ),
		];

		const updateAssignedCategories = ( nextCategories ) => {
			const cleanedCategories = [
				...new Set(
					nextCategories
						.map( ( category ) =>
							typeof category === 'string' ? category.trim() : ''
						)
						.filter( Boolean )
				),
			];

			setAttributes( {
				filterCategories: cleanedCategories,
				// Keep legacy attribute in sync for backward compatibility.
				filterCategory: cleanedCategories[ 0 ] || '',
			} );
		};

		return (
			<>
				<PanelBody
					title={ __( 'Image Filtering Settings', 'folioblocks' ) }
					initialOpen={ true }
				>
					<p
						style={ {
							fontSize: '11px',
							fontWeight: 500,
							lineHeight: 1.4,
							textTransform: 'uppercase',
						} }
					>
						{ __( 'Filter Categories', 'folioblocks' ) }
					</p>
					{ availableCategories.map( ( category ) => (
						<CheckboxControl
							key={ category }
							label={ category }
							checked={ assignedCategories.includes( category ) }
							onChange={ ( isChecked ) => {
								const nextCategories = isChecked
									? [ ...assignedCategories, category ]
									: assignedCategories.filter(
											( assignedCategory ) =>
												assignedCategory !== category
									  );
								updateAssignedCategories( nextCategories );
							} }
							__nextHasNoMarginBottom
						/>
					) ) }
					<p
						style={ {
							fontSize: '12px',
							fontStyle: 'normal',
							color: 'rgb(117, 117, 117)',
						} }
					>
						{ __(
							'Select one or more categories for this image.',
							'folioblocks'
						) }
					</p>
				</PanelBody>
			</>
		);
	}
);

addFilter(
	'folioBlocks.imageBlock.styleControls',
	'folioblocks/pb-image-block-style-controls',
	( Original, { attributes, setAttributes, isInsideGallery } ) => {
		if ( isInsideGallery ) {
			return null;
		}

		return (
			<PanelBody
				title={ __( 'Image Styles', 'folioblocks' ) }
				initialOpen={ true }
			>
				<CompactColorControl
					label={ __( 'Border Color', 'folioblocks' ) }
					value={ attributes.borderColor }
					onChange={ ( borderColor ) =>
						setAttributes( { borderColor } )
					}
					help={ __( 'Set Image border color.', 'folioblocks' ) }
				/>
				<RangeControl
					label={ __( 'Border Width', 'folioblocks' ) }
					value={ attributes.borderWidth }
					onChange={ ( value ) =>
						setAttributes( { borderWidth: value } )
					}
					min={ 0 }
					max={ 20 }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					help={ __( 'Set Image border width.', 'folioblocks' ) }
				/>
				<RangeControl
					label={ __( 'Border Radius', 'folioblocks' ) }
					value={ attributes.borderRadius }
					onChange={ ( value ) =>
						setAttributes( { borderRadius: value } )
					}
					min={ 0 }
					max={ 50 }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					help={ __( 'Set Image border radius.', 'folioblocks' ) }
				/>
				<ToggleControl
					label={ __( 'Enable Drop Shadow', 'folioblocks' ) }
					checked={ !! attributes.dropShadow }
					onChange={ ( newDropShadow ) =>
						setAttributes( { dropShadow: newDropShadow } )
					}
					__nextHasNoMarginBottom
					help={ __(
						'Applies a subtle drop shadow to images.',
						'folioblocks'
					) }
				/>
			</PanelBody>
		);
	}
);

addFilter(
	'folioBlocks.imageBlock.downloadButton',
	'folioblocks/pb-image-block-download-button',
	(
		Original,
		{
			attributes,
			setAttributes,
			effectiveDownloadEnabled,
			effectiveDownloadOnHover,
			sizes,
			src,
			context,
			isInsideGallery,
			downloadIconStyleVars,
		}
	) => {
		if ( ! effectiveDownloadEnabled || ! src ) {
			return null;
		}

		const handleDownload = ( e ) => {
			e.stopPropagation();

			// Prevent actual download inside the block editor
			if ( wp?.data?.select( 'core/editor' )?.getCurrentPostId() ) {
				return;
			}

			const fileUrl = sizes?.full?.url || src;
			const fileName = fileUrl.substring(
				fileUrl.lastIndexOf( '/' ) + 1
			);
			const link = document.createElement( 'a' );
			link.href = fileUrl;
			link.download = fileName || 'download';
			link.click();
		};

		return (
			<button
				className={ `pb-image-block-download ${
					effectiveDownloadOnHover ? 'hover-only' : ''
				}` }
				style={ downloadIconStyleVars }
				onClick={ handleDownload }
				aria-label={ __( 'Download Image', 'folioblocks' ) }
			>
				{ download }
			</button>
		);
	}
);

addFilter(
	'folioBlocks.imageBlock.linkButton',
	'folioblocks/pb-image-block-link-button',
	(
		Original,
		{
			attributes,
				activeImageClickAction,
				effectiveLinkIconDisplay,
				linkIconStyleVars,
			}
	) => {
		const url =
			activeImageClickAction === 'custom_url'
				? attributes.customUrl
				: attributes.linkedPostUrl;

		if ( ! url ) {
			return null;
		}

		return (
			<a
				className={ `pb-image-block-link-icon ${
					effectiveLinkIconDisplay === 'hover' ? 'hover-only' : ''
					}` }
					style={ linkIconStyleVars }
					href={ url }
				onClick={ ( e ) => {
					e.preventDefault();
					e.stopPropagation();
				} }
				aria-label={ __( 'Open Link', 'folioblocks' ) }
			>
				{ link }
			</a>
		);
	}
);

addFilter(
	'folioBlocks.imageBlock.hoverOverlayContent',
	'folioblocks/pb-image-block-hover-overlay-content',
	(
		Original,
		{
			attributes,
			setAttributes,
			effectiveWooActive,
			context,
			title,
			caption,
			effectiveOverlayContent,
		}
	) => {
		const showTitle =
			context?.[ 'folioBlocks/onHoverTitle' ] ??
			attributes.hoverTitle ??
			attributes.showTitleOnHover ??
			attributes.onHoverTitle ??
			false;
		const overlayContent =
			effectiveOverlayContent ||
			context?.[ 'folioBlocks/overlayContent' ] ||
			attributes.overlayContent ||
			( (
				context?.[ 'folioBlocks/wooProductPriceOnHover' ] ??
				attributes.wooProductPriceOnHover
			)
				? 'product'
				: 'title' );

			if ( overlayContent === 'caption' ) {
				return showTitle && caption ? <>{ caption }</> : null;
			}

			if ( overlayContent === 'exif' ) {
				return showTitle ? (
					<OverlayExifContent
						attributes={ attributes }
						hideUnknownExifFields={
							context?.[ 'folioBlocks/hideUnknownExifFields' ] ??
							attributes.hideUnknownExifFields ??
							false
						}
					/>
				) : null;
			}

			if ( overlayContent !== 'product' || ! effectiveWooActive ) {
			return showTitle && title ? <>{ title }</> : null;
		}

		if ( Number( attributes.wooProductId ) > 0 ) {
			return (
				<>
					{ attributes.wooProductName && (
						<div className="pb-product-name">
							{ attributes.wooProductName }
						</div>
					) }
					{ attributes.wooProductPrice && (
						<div
							className="pb-product-price"
							dangerouslySetInnerHTML={ {
								__html: attributes.wooProductPrice,
							} }
						/>
					) }
				</>
			);
		}

		return showTitle && title ? <>{ title }</> : null;
	}
);
addFilter(
	'folioBlocks.imageBlock.addToCartButton',
	'folioblocks/pb-image-block-add-to-cart-button',
	(
		Original,
		{
			attributes,
			setAttributes,
			effectiveWooActive,
			context,
			isInsideGallery,
			cartIconStyleVars,
		}
	) => {
		if ( ! effectiveWooActive || Number( attributes.wooProductId ) <= 0 ) {
			return null;
		}
		const cartDisplay =
			context?.[ 'folioBlocks/wooCartIconDisplay' ] ??
			attributes.wooCartIconDisplay ??
			'hover';
		const galleryDefault = context?.[ 'folioBlocks/wooDefaultLinkAction' ];
		const attrAction = attributes.wooLinkAction ?? 'inherit';
		const linkAction =
			attrAction && attrAction !== 'inherit'
				? attrAction
				: galleryDefault || 'add_to_cart';

		return (
			<button
				className={ `pb-add-to-cart-icon ${
					cartDisplay === 'hover' ? 'hover-only' : ''
				}` }
				style={ cartIconStyleVars }
				aria-label={
					linkAction === 'add_to_cart'
						? __( 'Add to Cart', 'folioblocks' )
						: __( 'View Product', 'folioblocks' )
				}
				data-woo-action={ linkAction }
				onClick={ ( e ) => {
					e.preventDefault();
					e.stopPropagation();
				} }
			>
				{ wooCartIcon }
			</button>
		);
	}
);
