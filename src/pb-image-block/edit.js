/**
 * PB Image Block
 * Edit JS
 */
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	MediaPlaceholder,
	BlockControls,
	MediaUpload,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import {
	PanelBody,
	Notice,
	ToggleControl,
	TextareaControl,
	TextControl,
	ToolbarGroup,
	ToolbarButton,
	Button,
	SelectControl,
} from '@wordpress/components';
import { useRef, useEffect } from '@wordpress/element';
import { stack } from '@wordpress/icons';
import { applyFilters } from '@wordpress/hooks';
import { IconImageBlock } from '../pb-helpers/icons';
import {
	FBKS_ALL_FILTER_TOKEN,
	fbksNormalizeActiveFilterValue,
} from '../pb-helpers/filterConstants';
import {
	getEmptyExifAttributes,
	getExifAttributesFromMedia,
	hasStoredExifAttributes,
} from '../pb-helpers/exifMetadata';
import { getImageSizeOptions } from '../pb-helpers/imageSizeOptions';
import './editor.scss';

const getImageClickAction = ( {
	lightbox,
	enableDownload,
	enableWooCommerce,
	imageClickAction,
} ) => {
	if ( imageClickAction ) {
		return imageClickAction;
	}
	if ( enableWooCommerce ) {
		return 'woocommerce';
	}
	if ( enableDownload ) {
		return 'download';
	}
	if ( lightbox ) {
		return 'lightbox';
	}
	return 'none';
};

const getImageClickAttributes = ( value ) => {
	switch ( value ) {
		case 'lightbox':
			return {
				imageClickAction: 'lightbox',
				lightbox: true,
				enableLightbox: true,
				enableDownload: false,
				enableWooCommerce: false,
			};
		case 'download':
			return {
				imageClickAction: 'download',
				imageClickTarget: 'icon',
				lightbox: false,
				enableLightbox: false,
				enableDownload: true,
				enableWooCommerce: false,
			};
		case 'woocommerce':
			return {
				imageClickAction: 'woocommerce',
				imageClickTarget: 'icon',
				enableDownload: false,
				enableWooCommerce: true,
			};
		case 'media_file':
			return {
				imageClickAction: 'media_file',
				lightbox: false,
				enableLightbox: false,
				enableDownload: false,
				enableWooCommerce: false,
			};
		case 'custom_url':
			return {
				imageClickAction: 'custom_url',
				imageClickTarget: 'icon',
				lightbox: false,
				enableLightbox: false,
				enableDownload: false,
				enableWooCommerce: false,
			};
		case 'page_post':
			return {
				imageClickAction: 'page_post',
				imageClickTarget: 'icon',
				lightbox: false,
				enableLightbox: false,
				enableDownload: false,
				enableWooCommerce: false,
			};
		case 'none':
		default:
			return {
				imageClickAction: 'none',
				lightbox: false,
				enableLightbox: false,
				enableDownload: false,
				enableWooCommerce: false,
			};
	}
};

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

const isWordPressVersionAtLeast = ( version, minimumVersion ) => {
	const currentParts = String( version || '' )
		.split( '.' )
		.map( ( part ) => parseInt( part, 10 ) || 0 );
	const minimumParts = String( minimumVersion )
		.split( '.' )
		.map( ( part ) => parseInt( part, 10 ) || 0 );
	const length = Math.max( currentParts.length, minimumParts.length );

	for ( let index = 0; index < length; index++ ) {
		const current = currentParts[ index ] || 0;
		const minimum = minimumParts[ index ] || 0;

		if ( current > minimum ) {
			return true;
		}
		if ( current < minimum ) {
			return false;
		}
	}

	return true;
};

const ImagePreviewControl = ( { id, selectedSrc, title, onSelectImage } ) => {
	if ( ! selectedSrc ) {
		return null;
	}

	return (
		<div style={ { marginBottom: '15px' } }>
			<div className="pb-imgage-block-thumbnail-preview">
				<img src={ selectedSrc } alt={ title || '' } />
			</div>
			<MediaUpload
				onSelect={ onSelectImage }
				allowedTypes={ [ 'image' ] }
				value={ id }
				render={ ( { open } ) => (
					<div
						style={ {
							display: 'flex',
							justifyContent: 'center',
							marginTop: '8px',
						} }
					>
						<Button onClick={ open } variant="secondary">
							{ __( 'Change Image', 'folioblocks' ) }
						</Button>
					</div>
				) }
			/>
		</div>
	);
};

const ImageMetadataControls = ( {
	alt,
	title,
	caption,
	setAttributes,
} ) => (
	<>
		<TextareaControl
			label={ __( 'Image Caption', 'folioblocks' ) }
			value={ caption }
			onChange={ ( value ) => setAttributes( { caption: value } ) }
			help={ __( 'Add image caption.', 'folioblocks' ) }
			__nextHasNoMarginBottom
			__next40pxDefaultSize
		/>
		<TextControl
			label={ __( 'Image Title', 'folioblocks' ) }
			value={ title }
			onChange={ ( value ) => setAttributes( { title: value } ) }
			help={ __( 'Describe the role of this image on the page.' ) }
			__nextHasNoMarginBottom
			__next40pxDefaultSize
		/>
		<TextControl
			label={ __( 'Alternative Text', 'folioblocks' ) }
			value={ alt }
			onChange={ ( value ) => setAttributes( { alt: value } ) }
			help={ __(
				'Describe the purpose of the image. Leave empty if decorative.'
			) }
			__nextHasNoMarginBottom
			__next40pxDefaultSize
		/>
	</>
);

export default function Edit( {
	attributes,
	setAttributes,
	context,
	clientId,
} ) {
	const {
		id,
		src,
		sizes,
		alt,
		title,
		caption,
		width,
		height,
		enableLightbox,
		showCaptionInLightbox,
		dropShadow,
		enableDownload,
		downloadOnHover,
		preview,
		downloadIconColor,
		downloadIconBgColor,
		cartIconColor,
		cartIconBgColor,
	} = attributes;
	const availableImageSizes = useSelect(
		( select ) =>
			select( 'core/block-editor' ).getSettings()?.imageSizes || [],
		[]
	);
	const shouldUseContentInspector = isWordPressVersionAtLeast(
		window.folioBlocksData?.wpVersion,
		'7.0'
	);
	const unknownExifValue = __( 'Unknown', 'folioblocks' );
	const hasStoredExif = hasStoredExifAttributes(
		attributes,
		unknownExifValue
	);
	const selectedMedia = useSelect(
		( select ) =>
			id && shouldUseContentInspector && ! hasStoredExif
				? select( 'core' )?.getEntityRecord(
						'postType',
						'attachment',
						id
				  )
				: null,
		[ id, shouldUseContentInspector, hasStoredExif ]
	);
	const imageSizeOptions = getImageSizeOptions( availableImageSizes, __ );

	// Block Preview Image
	if ( preview ) {
		return (
			<div className="pb-block-preview">
				<IconImageBlock />
			</div>
		);
	}

	// Back-compat normalization: unify enableLightbox vs lightbox; showCaptionInLightbox vs lightboxCaption
	const lightbox = ( attributes.lightbox ?? enableLightbox ) || false;
	const lightboxCaption =
		( attributes.lightboxCaption ?? showCaptionInLightbox ) || false;

	const {
		'folioBlocks/enableDownload': contextEnableDownload = enableDownload,
		'folioBlocks/downloadOnHover': contextDownloadOnHover = downloadOnHover,
		'folioBlocks/wooDefaultLinkAction': contextWooDefaultLinkAction,
		'folioBlocks/downloadIconColor': contextDownloadIconColor,
		'folioBlocks/downloadIconBgColor': contextDownloadIconBgColor,
		'folioBlocks/cartIconColor': contextCartIconColor,
		'folioBlocks/cartIconBgColor': contextCartIconBgColor,
		'folioBlocks/linkIconColor': contextLinkIconColor,
		'folioBlocks/linkIconBgColor': contextLinkIconBgColor,
	} = context || {};

	const checkoutUrl =
		window.folioBlocksData?.checkoutUrl ||
		'https://folioblocks.com/folioblocks-pricing/?utm_source=folioblocks&utm_medium=image-block&utm_campaign=upgrade';
	const isInsideGallery = Object.keys( context || {} ).some( ( key ) =>
		key.startsWith( 'folioBlocks/' )
	);
	const imageSizeAttr = attributes.imageSize || 'large';
	const effectiveResolution = isInsideGallery
		? context[ 'folioBlocks/resolution' ] || imageSizeAttr
		: imageSizeAttr;

	const imageStyle = {
		borderColor: isInsideGallery
			? context[ 'folioBlocks/borderColor' ] || '#ffffff'
			: attributes.borderColor || '#ffffff',
		borderWidth: isInsideGallery
			? `${ context[ 'folioBlocks/borderWidth' ] || 0 }px`
			: attributes.borderWidth
			? `${ attributes.borderWidth }px`
			: undefined,
		borderStyle: (
			isInsideGallery
				? context[ 'folioBlocks/borderWidth' ]
				: attributes.borderWidth
		)
			? 'solid'
			: undefined,
		borderRadius: isInsideGallery
			? `${ context[ 'folioBlocks/borderRadius' ] || 0 }px`
			: attributes.borderRadius
			? `${ attributes.borderRadius }px`
			: undefined,
	};
	const captionStyle = {
		borderColor: isInsideGallery
			? context[ 'folioBlocks/borderColor' ] || '#ffffff'
			: attributes.borderColor || '#ffffff',
		borderWidth: isInsideGallery
			? `${ context[ 'folioBlocks/borderWidth' ] || 0 }px`
			: attributes.borderWidth
			? `${ attributes.borderWidth }px`
			: undefined,
		borderStyle: (
			isInsideGallery
				? context[ 'folioBlocks/borderWidth' ]
				: attributes.borderWidth
		)
			? 'solid'
			: undefined,
		borderRadius: isInsideGallery
			? `${ context[ 'folioBlocks/borderRadius' ] || 0 }px`
			: attributes.borderRadius
			? `${ attributes.borderRadius }px`
			: undefined,
	};

	const effectiveDropShadow = isInsideGallery
		? context[ 'folioBlocks/dropShadow' ]
		: dropShadow;

	const ctxHoverStyle = context?.[ 'folioBlocks/onHoverStyle' ];
	const effectiveOnHoverStyle =
		ctxHoverStyle ?? attributes.onHoverStyle ?? 'fade-overlay';
	const overlayBgColor = isInsideGallery
		? context?.[ 'folioBlocks/overlayBgColor' ] ?? ''
		: attributes.overlayBgColor ?? '';
	const overlayTextColor = isInsideGallery
		? context?.[ 'folioBlocks/overlayTextColor' ] ?? ''
		: attributes.overlayTextColor ?? '';
	const chipOverlayBgColor = isInsideGallery
		? context?.[ 'folioBlocks/chipOverlayBgColor' ] ?? ''
		: attributes.chipOverlayBgColor ?? '';
	const chipOverlayTextColor = isInsideGallery
		? context?.[ 'folioBlocks/chipOverlayTextColor' ] ?? ''
		: attributes.chipOverlayTextColor ?? '';
	const effectiveHoverTitle = isInsideGallery
		? context[ 'folioBlocks/onHoverTitle' ] ?? false
		: attributes.showTitleOnHover ??
		  attributes.hoverTitle ??
		  attributes.onHoverTitle ??
		  false;
	const effectiveOverlayContent =
		context?.[ 'folioBlocks/overlayContent' ] ??
		attributes.overlayContent ??
		( (
			context?.[ 'folioBlocks/wooProductPriceOnHover' ] ??
			attributes.wooProductPriceOnHover
		)
			? 'product'
			: 'title' );
	// Compute overlay state and matching CSS class for the chosen variant
	const overlayEnabled =
		( context?.[ 'folioBlocks/onHoverTitle' ] ??
			attributes.onHoverTitle ??
			effectiveHoverTitle ) === true;

	const hoverClassMap = {
		'blur-overlay': 'pb-hover-blur-overlay',
		'fade-overlay': 'pb-hover-fade-overlay',
		'gradient-bottom': 'pb-hover-gradient-bottom',
		chip: 'pb-hover-chip',
		'color-overlay': 'pb-hover-color-overlay',
	};
	const hoverVariantClass =
		hoverClassMap[ effectiveOnHoverStyle ] || 'pb-hover-fade-overlay';
	const overlayStyleVars =
		effectiveOnHoverStyle === 'color-overlay'
			? {
					...( overlayBgColor
						? { '--pb-overlay-bg': overlayBgColor }
						: {} ),
					...( overlayTextColor
						? { '--pb-overlay-color': overlayTextColor }
						: {} ),
			  }
			: effectiveOnHoverStyle === 'chip'
			? {
					...( chipOverlayBgColor
						? { '--pb-chip-overlay-bg': chipOverlayBgColor }
						: {} ),
					...( chipOverlayTextColor
						? { '--pb-chip-overlay-color': chipOverlayTextColor }
						: {} ),
			  }
			: {};

	const effectiveDownloadEnabled = isInsideGallery
		? contextEnableDownload
		: enableDownload;
	const effectiveDownloadOnHover = isInsideGallery
		? contextDownloadOnHover
		: downloadOnHover;

	// Icon colors (gallery context wins when inside a gallery; attributes used when standalone)
	const effectiveDownloadIconColor = isInsideGallery
		? contextDownloadIconColor ?? ''
		: downloadIconColor ?? '';
	const effectiveDownloadIconBgColor = isInsideGallery
		? contextDownloadIconBgColor ?? ''
		: downloadIconBgColor ?? '';
	const effectiveCartIconColor = isInsideGallery
		? contextCartIconColor ?? ''
		: cartIconColor ?? '';
	const effectiveCartIconBgColor = isInsideGallery
		? contextCartIconBgColor ?? ''
		: cartIconBgColor ?? '';
	const effectiveLinkIconColor = isInsideGallery
		? contextLinkIconColor ?? ''
		: attributes.linkIconColor ?? '';
	const effectiveLinkIconBgColor = isInsideGallery
		? contextLinkIconBgColor ?? ''
		: attributes.linkIconBgColor ?? '';

	// CSS variables for icon/button styling (used by the button render filters)
	const downloadIconStyleVars = {
		...( effectiveDownloadIconColor
			? { '--pb-download-icon-color': effectiveDownloadIconColor }
			: {} ),
		...( effectiveDownloadIconBgColor
			? { '--pb-download-icon-bg': effectiveDownloadIconBgColor }
			: {} ),
	};
	const cartIconStyleVars = {
		...( effectiveCartIconColor
			? { '--pb-cart-icon-color': effectiveCartIconColor }
			: {} ),
		...( effectiveCartIconBgColor
			? { '--pb-cart-icon-bg': effectiveCartIconBgColor }
			: {} ),
	};
	const linkIconStyleVars = {
		...( effectiveLinkIconColor
			? { '--pb-link-icon-color': effectiveLinkIconColor }
			: {} ),
		...( effectiveLinkIconBgColor
			? { '--pb-link-icon-bg': effectiveLinkIconBgColor }
			: {} ),
	};

	// WooCommerce state (context when inside a gallery, runtime when standalone)
	const hasWooCommerce =
		context?.[ 'folioBlocks/hasWooCommerce' ] ??
		window.folioBlocksData?.hasWooCommerce ??
		false;
	const enableWooCommerce =
		context?.[ 'folioBlocks/enableWooCommerce' ] ??
		!! attributes.enableWooCommerce;
	const effectiveWooActive = hasWooCommerce && enableWooCommerce;
	const hasHoverOverlayContent =
		effectiveOverlayContent === 'product'
			? effectiveWooActive && Number( attributes.wooProductId ) > 0
			: effectiveOverlayContent === 'caption'
			? !! caption?.trim()
			: effectiveOverlayContent === 'exif'
			? true
			: !! title?.trim();
	const contextImageClickAction =
		context?.[ 'folioBlocks/imageClickAction' ] || '';
	const effectiveImageClickTarget =
		context?.[ 'folioBlocks/imageClickTarget' ] ||
		attributes.imageClickTarget ||
		'icon';
	const effectiveLinkIconDisplay =
		context?.[ 'folioBlocks/linkIconDisplay' ] ||
		attributes.linkIconDisplay ||
		'hover';
	// Alias used by premium controls (keep naming consistent with other galleries)
	const effectiveEnableWoo = effectiveWooActive;

	// Runtime override: keep hasWooCommerce attribute synced to environment (without mutating other Woo settings)
	useEffect( () => {
		const wooActive = window.folioBlocksData?.hasWooCommerce ?? false;
		if ( wooActive !== attributes.hasWooCommerce ) {
			setAttributes( { hasWooCommerce: wooActive } );
		}
	}, [ window.folioBlocksData?.hasWooCommerce ] );
	// Show panel if (A) we're standalone (so Download + Woo controls can render)
	// OR (B) Woo is effectively active (so the product link control can render)
	const showImageClickPanel =
		! isInsideGallery ||
		!! effectiveWooActive ||
		contextImageClickAction === 'custom_url' ||
		contextImageClickAction === 'page_post';

	// Migrate legacy keys to new ones (non-destructive, only when new keys are undefined)
	useEffect( () => {
		if (
			enableLightbox !== undefined &&
			attributes.lightbox === undefined
		) {
			setAttributes( { lightbox: !! enableLightbox } );
		}
	}, [ enableLightbox ] );

	useEffect( () => {
		if (
			showCaptionInLightbox !== undefined &&
			attributes.lightboxCaption === undefined
		) {
			setAttributes( { lightboxCaption: !! showCaptionInLightbox } );
		}
	}, [ showCaptionInLightbox ] );

	const filterCategories = context[ 'folioBlocks/filterCategories' ] || [];
	const activeFilter =
		context?.[ 'folioBlocks/activeFilter' ] || FBKS_ALL_FILTER_TOKEN;
	const assignedCategories = getAssignedFilterCategories( attributes );
	const normalizedActiveFilter =
		fbksNormalizeActiveFilterValue( activeFilter ).toLowerCase();
	const isHidden =
		normalizedActiveFilter !== 'all' &&
		! assignedCategories.some(
			( category ) => category.toLowerCase() === normalizedActiveFilter
		);

	const carouselHeight = context[ 'folioBlocks/carouselHeight' ] || 400;
	const displayHeight = carouselHeight;

	const blockProps = useBlockProps( {
		className: isHidden ? 'is-hidden' : undefined,
	} );
	const baseFigureStyle = { ...imageStyle, ...overlayStyleVars };
	const figureStyle = context[ 'folioBlocks/inCarousel' ]
		? { ...baseFigureStyle, height: `${ displayHeight }px` }
		: baseFigureStyle;

	// Detect: in Image Row, Image Stack, or Masonry Gallery
	const { isInImageRow, isInImageStack, isInMasonryGallery } = useSelect(
		( select ) => {
			const { getBlockParents, getBlockName } =
				select( 'core/block-editor' );
			const parents = getBlockParents( clientId, true ) || [];
			const names = parents.map( ( id ) => getBlockName( id ) );
			return {
				isInImageRow: names.includes( 'folioblocks/pb-image-row' ),
				isInImageStack: names.includes( 'folioblocks/pb-image-stack' ),
				isInMasonryGallery: names.includes(
					'folioblocks/masonry-gallery-block'
				),
			};
		},
		[ clientId ]
	);

	useEffect( () => {
		if ( ! sizes ) {
			return;
		}
		const nextUrl = sizes[ effectiveResolution ]?.url;
		if ( nextUrl && nextUrl !== src ) {
			setAttributes( { src: nextUrl } );
		}
	}, [ effectiveResolution, sizes, src, setAttributes ] );

	useEffect( () => {
		if ( hasStoredExif || ! selectedMedia ) {
			return;
		}

		const exifAttributes = getExifAttributesFromMedia(
			selectedMedia,
			unknownExifValue
		);

		if ( exifAttributes ) {
			setAttributes( exifAttributes );
		}
	}, [ hasStoredExif, selectedMedia, setAttributes ] );

	const onSelectImage = ( media ) => {
		if ( ! media?.id ) {
			return;
		}

		const fullSize = media.sizes?.full || {};
		const width = fullSize.width || media.width || 0;
		const height = fullSize.height || media.height || 0;
		const exifAttributes =
			getExifAttributesFromMedia(
				media,
				unknownExifValue
			) || getEmptyExifAttributes();

		setAttributes( {
			id: media.id,
			src: media.url || media.source_url || '',
			alt: media.alt || '',
			title: media.title || '',
			caption: media.caption || '',
			width,
			height,
			sizes: media.sizes || {},
			...exifAttributes,
		} );
	};

	const selectedSrc = sizes?.[ effectiveResolution ]?.url || src || '';
	const shouldShowImageBlockSettingsPanel =
		! shouldUseContentInspector || ! isInsideGallery;
	const imageClickAction = getImageClickAction( {
		lightbox,
		enableDownload: effectiveDownloadEnabled,
		enableWooCommerce: effectiveWooActive,
		imageClickAction: isInsideGallery
			? contextImageClickAction
			: attributes.imageClickAction,
	} );
	const imageClickActionOptions = applyFilters(
		'folioBlocks.imageBlock.imageClickActionOptions',
		[
			{ label: __( 'None', 'folioblocks' ), value: 'none' },
			{
				label: __( 'Open in Lightbox', 'folioblocks' ),
				value: 'lightbox',
			},
		],
		{ attributes, hasWooCommerce }
	);
	const activeImageClickAction = imageClickActionOptions.some(
		( option ) => option.value === imageClickAction
	)
		? imageClickAction
		: 'none';
	const shouldShowCustomUrlControls =
		activeImageClickAction === 'custom_url' &&
		( ! isInsideGallery || contextImageClickAction === 'custom_url' );
	const shouldShowPagePostControls =
		activeImageClickAction === 'page_post' &&
		( ! isInsideGallery || contextImageClickAction === 'page_post' );
	const shouldShowWooProductToolbar =
		src &&
		activeImageClickAction === 'woocommerce' &&
		!! effectiveWooActive;
	const shouldShowLinkIcon =
		( activeImageClickAction === 'custom_url' ||
			activeImageClickAction === 'page_post' ) &&
		effectiveImageClickTarget === 'icon';
	const shouldShowDownloadIcon =
		!! effectiveDownloadEnabled && effectiveImageClickTarget === 'icon';
	const shouldShowWooIcon =
		!! effectiveWooActive && effectiveImageClickTarget === 'icon';

	return (
		<>
			<BlockControls>
				{ src && (
					<ToolbarGroup>
						<MediaUpload
							onSelect={ onSelectImage }
							allowedTypes={ [ 'image' ] }
							value={ id }
							render={ ( { open } ) => (
								<ToolbarButton
									icon={ IconImageBlock }
									label={ __(
										'Replace Image',
										'folioblocks'
									) }
									onClick={ open }
								>
									{ __( 'Change Image', 'folioblocks' ) }
								</ToolbarButton>
							) }
						/>
					</ToolbarGroup>
				) }
				{ src &&
					shouldShowCustomUrlControls &&
					applyFilters(
						'folioBlocks.imageBlock.customUrlToolbarButton',
						null,
						{
							attributes,
							setAttributes,
							isInsideGallery,
						}
					) }
				{ src &&
					shouldShowPagePostControls &&
					applyFilters(
						'folioBlocks.imageBlock.pagePostLinkToolbarButton',
						null,
						{
							attributes,
							setAttributes,
							isInsideGallery,
						}
					) }
				{ shouldShowWooProductToolbar &&
					applyFilters(
						'folioBlocks.imageBlock.wooProductToolbarButton',
						null,
						{
							attributes,
							setAttributes,
							isInsideGallery,
							contextWooDefaultLinkAction,
						}
					) }
				{ isInImageRow && ! isInImageStack && (
					<ToolbarGroup>
						<ToolbarButton
							icon={ stack }
							onClick={ () => {
								window.dispatchEvent(
									new CustomEvent(
										'folioblocks:add-to-image-stack',
										{
											detail: { clientId },
										}
									)
								);
							} }
							label={ __( 'Add to Image Stack', 'folioblocks' ) }
						>
							{ __( 'Add to Image Stack', 'folioblocks' ) }
						</ToolbarButton>
					</ToolbarGroup>
				) }
			</BlockControls>
			<InspectorControls>
					{ shouldShowImageBlockSettingsPanel && (
						<PanelBody
							title={ __( 'Image Block Settings', 'folioblocks' ) }
							initialOpen={ true }
						>
						{ src && ! shouldUseContentInspector && (
							<ImagePreviewControl
								id={ id }
								selectedSrc={ selectedSrc }
								title={ title }
								onSelectImage={ onSelectImage }
							/>
						) }
						{ ! isInsideGallery && (
							<SelectControl
								label={ __( 'Resolution', 'folioblocks' ) }
								value={ attributes.imageSize || 'large' }
								options={ imageSizeOptions }
								onChange={ ( newSize ) => {
									setAttributes( { imageSize: newSize } );
									const nextUrl = sizes?.[ newSize ]?.url;
									if ( nextUrl && nextUrl !== src ) {
										setAttributes( { src: nextUrl } );
									}
								} }
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								help={ __(
									'Select the size of the source image.'
								) }
							/>
						) }
							{ ! shouldUseContentInspector && (
								<>
									<ImageMetadataControls
										alt={ alt }
										title={ title }
										caption={ caption }
										setAttributes={ setAttributes }
									/>
									{ applyFilters(
										'folioBlocks.imageBlock.metadataSyncControl',
										null,
										{ attributes }
									) }
								</>
							) }
							{ ! isInsideGallery &&
								applyFilters(
									'folioBlocks.imageBlock.lazyLoadToggle',
									<div style={ { marginBottom: '8px' } }>
										<Notice status="info" isDismissible={ false }>
											<strong>
												{ __(
													'Enable Lazy Load of Images',
													'folioblocks'
												) }
											</strong>
											<br />
											{ __(
												'This is a premium feature. Unlock all features:',
												'folioblocks'
											) }{ ' ' }
											<a
												href={ checkoutUrl }
												target="_blank"
												rel="noopener noreferrer"
											>
												{ __( 'Upgrade to Pro', 'folioblocks' ) }
											</a>
										</Notice>
									</div>,
									{ attributes, setAttributes }
								) }
						</PanelBody>
					) }
					{ showImageClickPanel && (
						<PanelBody
							title={ __( 'Image Click Settings', 'folioblocks' ) }
							initialOpen={ true }
						>
							{ ! isInsideGallery && (
								<>
									<SelectControl
										label={ __(
											'Image Click Behavior',
											'folioblocks'
										) }
										value={ activeImageClickAction }
										options={ imageClickActionOptions }
										onChange={ ( value ) =>
											setAttributes(
												getImageClickAttributes( value )
											)
										}
										__nextHasNoMarginBottom
										__next40pxDefaultSize
										help={ __(
											'Choose what happens when visitors click this image.',
											'folioblocks'
										) }
									/>
									{ applyFilters(
										'folioBlocks.imageBlock.imageClickActionNotice',
										<div style={ { marginBottom: '8px' } }>
											<Notice status="info" isDismissible={ false }>
												<strong>
													{ __( 'Custom Image Linking', 'folioblocks' ) }
												</strong>
												<br />
												{ __(
													'This is a premium feature. Unlock all features:',
													'folioblocks'
												) }{ ' ' }
												<a
													href={ checkoutUrl }
													target="_blank"
													rel="noopener noreferrer"
												>
													{ __( 'Upgrade to Pro', 'folioblocks' ) }
												</a>
											</Notice>
										</div>,
										{
											attributes,
											setAttributes,
											hasWooCommerce,
											effectiveEnableWoo,
										}
									) }
								</>
							) }
							{ effectiveWooActive &&
								activeImageClickAction === 'woocommerce' &&
								applyFilters(
									'folioBlocks.imageBlock.wooProductLinkControl',
									null,
									{
										attributes,
										setAttributes,
										effectiveWooActive,
										isInsideGallery,
										contextWooDefaultLinkAction,
									}
								) }
							{ ! isInsideGallery &&
								activeImageClickAction === 'lightbox' &&
								applyFilters(
									'folioBlocks.imageBlock.lightboxControls',
									null,
									{ attributes, setAttributes }
								) }
							{ ! isInsideGallery &&
								activeImageClickAction === 'download' &&
								applyFilters(
									'folioBlocks.imageBlock.downloadControls',
									null,
									{ attributes, setAttributes, isInsideGallery }
								) }
							{ ! isInsideGallery &&
								activeImageClickAction === 'woocommerce' &&
								applyFilters(
									'folioBlocks.imageBlock.wooCommerceControls',
									null,
									{ attributes, setAttributes, isInsideGallery }
								) }
							{ shouldShowCustomUrlControls &&
								applyFilters(
									'folioBlocks.imageBlock.customUrlControls',
									null,
									{ attributes, setAttributes, isInsideGallery }
								) }
							{ shouldShowPagePostControls &&
								applyFilters(
									'folioBlocks.imageBlock.pagePostLinkControls',
									null,
									{ attributes, setAttributes, isInsideGallery }
								) }
							</PanelBody>
						) }
						{ ! shouldUseContentInspector &&
							applyFilters(
								'folioBlocks.imageBlock.filterCategoryControl',
								null,
								{
									attributes,
									setAttributes,
									filterCategories,
									context,
									isInsideGallery,
								}
							) }
						{ ! isInsideGallery && (
							<PanelBody
								title={ __( 'Image Hover Settings', 'folioblocks' ) }
								initialOpen={ true }
							>
								{ applyFilters(
									'folioBlocks.imageBlock.onHoverTitleToggle',
									<div style={ { marginBottom: '8px' } }>
										<Notice status="info" isDismissible={ false }>
											<strong>
												{ __( 'Image Hover Settings', 'folioblocks' ) }
											</strong>
											<br />
											{ __(
												'This is a premium feature. Unlock all features:',
												'folioblocks'
											) }{ ' ' }
											<a
												href={ checkoutUrl }
												target="_blank"
												rel="noopener noreferrer"
											>
												{ __( 'Upgrade to Pro', 'folioblocks' ) }
											</a>
										</Notice>
									</div>,
									{ attributes, setAttributes }
								) }
							</PanelBody>
						) }
					</InspectorControls>
					{ shouldUseContentInspector && (
						<InspectorControls group="content">
							<PanelBody
								title={ __( 'Image Content', 'folioblocks' ) }
								initialOpen={ true }
							>
								{ src && (
									<ImagePreviewControl
										id={ id }
										selectedSrc={ selectedSrc }
										title={ title }
										onSelectImage={ onSelectImage }
									/>
								) }
								<ImageMetadataControls
									alt={ alt }
									title={ title }
									caption={ caption }
									setAttributes={ setAttributes }
								/>
								{ applyFilters(
									'folioBlocks.imageBlock.metadataSyncControl',
									null,
									{ attributes }
								) }
								{ applyFilters(
									'folioBlocks.imageBlock.cameraMetadataControls',
									<div style={ { marginBottom: '8px' } }>
										<Notice status="info" isDismissible={ false }>
											<strong>
												{ __( 'EXIF Data', 'folioblocks' ) }
											</strong>
											<br />
											{ __(
												'This is a premium feature. Unlock all features:',
												'folioblocks'
											) }{ ' ' }
											<a
												href={ checkoutUrl }
												target="_blank"
												rel="noopener noreferrer"
											>
												{ __( 'Upgrade to Pro', 'folioblocks' ) }
											</a>
										</Notice>
									</div>,
									{ attributes, setAttributes }
								) }
							</PanelBody>
							{ applyFilters(
								'folioBlocks.imageBlock.filterCategoryControl',
								null,
								{
									attributes,
									setAttributes,
									filterCategories,
									context,
									isInsideGallery,
								}
							) }
						</InspectorControls>
					) }
					<InspectorControls group="styles">
				{ applyFilters( 'folioBlocks.imageBlock.styleControls', null, {
					attributes,
					setAttributes,
					isInsideGallery,
				} ) }
				{ applyFilters(
					'folioBlocks.imageBlock.iconStyleControls',
					null,
					{
						attributes,
						setAttributes,
						isInsideGallery,
						context,
					}
				) }
				{ applyFilters(
					'folioBlocks.imageBlock.hoverOverlayStyleControls',
					null,
					{
						attributes,
						setAttributes,
						isInsideGallery,
						context,
					}
				) }
			</InspectorControls>
			{ isInMasonryGallery ? (
				<div className="pb-image-block-wrapper">
					<div { ...blockProps }>
						<figure
							className={ [
								'pb-image-block',
								overlayEnabled ? hoverVariantClass : '',
								effectiveDropShadow ? 'dropshadow' : '',
								shouldShowDownloadIcon ? 'has-download' : '',
							]
								.filter( Boolean )
								.join( ' ' ) }
							style={ figureStyle }
						>
							{ ! src ? (
								<MediaPlaceholder
									icon={ <IconImageBlock /> }
									labels={ {
										title: __(
											'Select Image',
											'folioblocks'
										),
									} }
									onSelect={ onSelectImage }
									allowedTypes={ [ 'image' ] }
									multiple={ false }
								/>
							) : (
								<>
									<img
										src={ selectedSrc }
										alt={ alt }
										width={ width }
										height={ height }
										className="pb-image-block-img"
									/>
										{ effectiveHoverTitle &&
											hasHoverOverlayContent && (
											<div className="pb-image-block-title-container">
												<figcaption className="pb-image-block-title">
													{ ( () => {
														const hoverContent =
															applyFilters(
																'folioBlocks.imageBlock.hoverOverlayContent',
																null,
																{
																	attributes,
																	setAttributes,
																	effectiveWooActive,
																	context,
																	title,
																	caption,
																	effectiveOverlayContent,
																}
															);
														if (
															hoverContent !== null &&
															hoverContent !== undefined
														) {
															return hoverContent;
														}
														if (
															effectiveOverlayContent ===
															'exif'
														) {
															return null;
														}
														return effectiveOverlayContent ===
															'caption'
															? caption
															: title;
													} )() }
												</figcaption>
											</div>
										) }
									{ applyFilters(
										'folioBlocks.imageBlock.downloadButton',
										null,
										{
											attributes,
											setAttributes,
												effectiveDownloadEnabled:
													shouldShowDownloadIcon,
											effectiveDownloadOnHover,
											sizes,
											src,
											context,
											isInsideGallery,
											downloadIconStyleVars,
											effectiveDownloadIconColor,
											effectiveDownloadIconBgColor,
										}
									) }
									{ applyFilters(
										'folioBlocks.imageBlock.addToCartButton',
										null,
										{
											attributes,
											setAttributes,
												effectiveWooActive:
													shouldShowWooIcon,
											context,
											isInsideGallery,
											cartIconStyleVars,
											effectiveCartIconColor,
											effectiveCartIconBgColor,
										}
									) }
									{ shouldShowLinkIcon &&
										applyFilters(
											'folioBlocks.imageBlock.linkButton',
											null,
											{
												attributes,
												setAttributes,
													activeImageClickAction,
													effectiveLinkIconDisplay,
													linkIconStyleVars,
												}
											) }
								</>
							) }
						</figure>
					</div>
				</div>
			) : (
				<div { ...blockProps }>
					<figure
						className={ [
							'pb-image-block',
							overlayEnabled ? hoverVariantClass : '',
							effectiveDropShadow ? 'dropshadow' : '',
							shouldShowDownloadIcon ? 'has-download' : '',
						]
							.filter( Boolean )
							.join( ' ' ) }
						style={ figureStyle }
					>
						{ ! src ? (
							<MediaPlaceholder
								icon={ <IconImageBlock /> }
								labels={ {
									title: __( 'Select Image', 'folioblocks' ),
								} }
								onSelect={ onSelectImage }
								allowedTypes={ [ 'image' ] }
								multiple={ false }
							/>
						) : (
							<>
								<img
									src={ selectedSrc }
									alt={ alt }
									width={ width }
									height={ height }
									className="pb-image-block-img"
								/>
									{ effectiveHoverTitle &&
										hasHoverOverlayContent && (
										<div className="pb-image-block-title-container">
											<figcaption className="pb-image-block-title">
												{ ( () => {
													const hoverContent =
														applyFilters(
															'folioBlocks.imageBlock.hoverOverlayContent',
															null,
															{
																attributes,
																setAttributes,
																effectiveWooActive,
																context,
																title,
																caption,
																effectiveOverlayContent,
															}
														);
													if (
														hoverContent !== null &&
														hoverContent !== undefined
													) {
														return hoverContent;
													}
													if (
														effectiveOverlayContent === 'exif'
													) {
														return null;
													}
													return effectiveOverlayContent ===
														'caption'
														? caption
														: title;
												} )() }
											</figcaption>
										</div>
									) }
								{ applyFilters(
									'folioBlocks.imageBlock.downloadButton',
									null,
									{
										attributes,
										setAttributes,
											effectiveDownloadEnabled:
												shouldShowDownloadIcon,
										effectiveDownloadOnHover,
										sizes,
										src,
										context,
										isInsideGallery,
										downloadIconStyleVars,
										effectiveDownloadIconColor,
										effectiveDownloadIconBgColor,
									}
								) }
								{ applyFilters(
									'folioBlocks.imageBlock.addToCartButton',
									null,
									{
										attributes,
										setAttributes,
										effectiveWooActive: shouldShowWooIcon,
										context,
										isInsideGallery,
										cartIconStyleVars,
										effectiveCartIconColor,
										effectiveCartIconBgColor,
									}
								) }
								{ shouldShowLinkIcon &&
									applyFilters(
										'folioBlocks.imageBlock.linkButton',
										null,
										{
											attributes,
											setAttributes,
												activeImageClickAction,
												effectiveLinkIconDisplay,
												linkIconStyleVars,
											}
										) }
							</>
						) }
					</figure>
				</div>
			) }
		</>
	);
}
