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
	ToggleControl,
	TextareaControl,
	TextControl,
	Popover,
	ToolbarGroup,
	ToolbarButton,
	Button,
	SelectControl,
} from '@wordpress/components';
import { useRef, useEffect, useState } from '@wordpress/element';
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
import { imageProFeatureNotice } from '../pb-helpers/imageProFeatureNotices';
import { getShadowStyleClass } from '../pb-helpers/ImageStyleControl';
import { getOverlayTypographyCSS } from '../pb-helpers/overlayTypographyControls';
import { getTiltHoverHandlers } from '../pb-helpers/tiltHoverEffect';
import { useProofingGalleryContext } from '../pb-helpers/useProofingGalleryContext';
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

const PROOFING_COMMENT_MAX_LENGTH = 1000;

const truncateProofingComment = ( comment = '' ) =>
	String( comment || '' ).slice( 0, PROOFING_COMMENT_MAX_LENGTH );

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

const ProofingThumbnailControls = ( {
	enableHeart = true,
	enableFlag = true,
	enableComment = true,
} ) => {
	const [ liked, setLiked ] = useState( false );
	const [ flagColor, setFlagColor ] = useState( '' );
	const [ comment, setComment ] = useState( '' );
	const [ isFlagPickerOpen, setIsFlagPickerOpen ] = useState( false );
	const [ isCommentOpen, setIsCommentOpen ] = useState( false );
	const controlsRef = useRef( null );
	const flagButtonRef = useRef( null );
	const flagColors = [
		{ label: __( 'Red', 'folioblocks' ), value: 'red' },
		{ label: __( 'Orange', 'folioblocks' ), value: 'orange' },
		{ label: __( 'Green', 'folioblocks' ), value: 'green' },
	];
	const enabledProofingControls = [
		enableHeart ? 'heart' : '',
		enableFlag ? 'flag' : '',
		enableComment ? 'comment' : '',
	].filter( Boolean );
	const getProofingControlSlot = ( control ) =>
		enabledProofingControls.indexOf( control ) + 1;
	const stopProofingClick = ( event ) => {
		event.preventDefault();
		event.stopPropagation();
	};
	const stopProofingPanelEvent = ( event ) => {
		event.stopPropagation();
	};

	useEffect( () => {
		const imageBlock = controlsRef.current?.closest(
			'.wp-block-folioblocks-pb-image-block'
		);

		if ( ! imageBlock ) {
			return;
		}

		imageBlock.dataset.proofingHearted = liked ? 'true' : 'false';
		imageBlock.dataset.proofingFlag = flagColor || '';
		imageBlock.dataset.proofingComment = comment;
		imageBlock.dataset.proofingCommented = comment.trim()
			? 'true'
			: 'false';
		window.dispatchEvent(
			new CustomEvent( 'folioblocks:proofing-state-change' )
		);
	}, [ liked, flagColor, comment ] );

	return (
		<div className="fbks-proofing-thumbnail-controls" ref={ controlsRef }>
			{ enableHeart && (
				<button
					type="button"
					className={ `fbks-proofing-thumbnail-control fbks-proofing-thumbnail-control--heart${
						liked ? ' is-active' : ''
					} fbks-proofing-thumbnail-control--slot-${ getProofingControlSlot(
						'heart'
					) }` }
					aria-pressed={ liked }
					aria-label={ __( 'Like image', 'folioblocks' ) }
					onClick={ ( event ) => {
						stopProofingClick( event );
						setLiked( ! liked );
					} }
				>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M12 21s-7-4.4-9.4-8.2C.7 9.8 1.2 6.2 3.8 4.4 6 2.9 8.7 3.4 10.5 5.3L12 6.9l1.5-1.6c1.8-1.9 4.5-2.4 6.7-.9 2.6 1.8 3.1 5.4 1.2 8.4C19 16.6 12 21 12 21z" />
					</svg>
				</button>
			) }
			{ enableFlag && (
				<div className="fbks-proofing-thumbnail-flag-wrap">
					<button
						ref={ flagButtonRef }
						type="button"
						className={ `fbks-proofing-thumbnail-control fbks-proofing-thumbnail-control--flag${
							flagColor ? ` is-${ flagColor }` : ''
						} fbks-proofing-thumbnail-control--slot-${ getProofingControlSlot(
							'flag'
						) }` }
						aria-label={ __( 'Set flag color', 'folioblocks' ) }
						onClick={ ( event ) => {
							stopProofingClick( event );
							setIsFlagPickerOpen( ! isFlagPickerOpen );
						} }
					>
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path d="M6 21V4h10.6l.4 3.1h3v9H9.4L9 13.9H8V21H6z" />
						</svg>
					</button>
					{ isFlagPickerOpen && (
						<Popover
							anchor={ flagButtonRef.current }
							position="bottom right"
							onClose={ () => setIsFlagPickerOpen( false ) }
							focusOnMount={ false }
						>
							<div className="fbks-proofing-flag-popover">
								{ flagColors.map( ( color ) => (
									<button
										type="button"
										key={ color.value }
										className={ `fbks-proofing-flag-swatch is-${ color.value }` }
										aria-label={ color.label }
										onClick={ ( event ) => {
											stopProofingClick( event );
											setFlagColor( color.value );
											setIsFlagPickerOpen( false );
										} }
									/>
								) ) }
								<button
									type="button"
									className="fbks-proofing-flag-clear"
									onClick={ ( event ) => {
										stopProofingClick( event );
										setFlagColor( '' );
										setIsFlagPickerOpen( false );
									} }
								>
									{ __( 'Clear', 'folioblocks' ) }
								</button>
							</div>
						</Popover>
					) }
				</div>
			) }
			{ enableComment && (
				<>
					<button
						type="button"
						className={ `fbks-proofing-thumbnail-control fbks-proofing-thumbnail-control--comment${
							comment.trim() ? ' is-active' : ''
						}${ isCommentOpen ? ' is-open' : '' } fbks-proofing-thumbnail-control--slot-${ getProofingControlSlot(
							'comment'
						) }` }
						aria-label={ __( 'Comment on image', 'folioblocks' ) }
						onClick={ ( event ) => {
							stopProofingClick( event );
							setIsFlagPickerOpen( false );
							setIsCommentOpen( ! isCommentOpen );
						} }
					>
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path d="M5 5h14v10H8.7L5 18.4V5z" />
						</svg>
					</button>
					{ isCommentOpen && (
						<div
							className={ `fbks-proofing-comment-popover is-open fbks-proofing-popover--slot-${ getProofingControlSlot(
								'comment'
							) }` }
							onMouseDown={ stopProofingPanelEvent }
						>
							<div className="fbks-proofing-comment-popover__label">
								<span>{ __( 'Comment', 'folioblocks' ) }</span>
								<textarea
									className="fbks-proofing-comment-popover__field"
									rows="3"
									maxLength={ PROOFING_COMMENT_MAX_LENGTH }
									value={ comment }
									aria-label={ __( 'Comment', 'folioblocks' ) }
									onChange={ ( event ) =>
										setComment(
											truncateProofingComment(
												event.target.value
											)
										)
									}
								/>
								<span className="fbks-proofing-comment-popover__counter">
									{ comment.length } /{ ' ' }
									{ PROOFING_COMMENT_MAX_LENGTH }
								</span>
							</div>
							<div className="fbks-proofing-comment-popover__actions">
								<button
									type="button"
									className="fbks-proofing-comment-popover__button"
									onClick={ ( event ) => {
										stopProofingClick( event );
										setComment( '' );
									} }
								>
									{ __( 'Clear', 'folioblocks' ) }
								</button>
								<button
									type="button"
									className="fbks-proofing-comment-popover__button is-primary"
									onClick={ ( event ) => {
										stopProofingClick( event );
										setIsCommentOpen( false );
									} }
								>
									{ __( 'Done', 'folioblocks' ) }
								</button>
							</div>
						</div>
					) }
				</>
			) }
		</div>
	);
};

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
	const {
		isInsideProofingGallery,
		proofingGalleryAttributes,
	} = useProofingGalleryContext( clientId );

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

	const isInsideGallery = Object.keys( context || {} ).some( ( key ) =>
		key.startsWith( 'folioBlocks/' )
	);
	const galleryOverridesEnabled =
		applyFilters( 'folioBlocks.imageBlock.galleryOverridesEnabled', false );
	const overrideGalleryClickSettings =
		isInsideGallery &&
		galleryOverridesEnabled &&
		!! attributes.overrideGalleryClickSettings;
	const overrideGalleryHoverSettings =
		isInsideGallery &&
		galleryOverridesEnabled &&
		!! attributes.overrideGalleryHoverSettings;
	const clickContext = overrideGalleryClickSettings ? {} : context || {};
	const hoverContext = overrideGalleryHoverSettings ? {} : context || {};
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

	const shadowStyleClass = getShadowStyleClass(
		isInsideGallery
			? context[ 'folioBlocks/shadowStyle' ]
			: attributes.shadowStyle,
		isInsideGallery ? context[ 'folioBlocks/dropShadow' ] : dropShadow
	);

	const ctxHoverStyle = hoverContext?.[ 'folioBlocks/onHoverStyle' ];
	const effectiveOnHoverStyle =
		ctxHoverStyle ?? attributes.onHoverStyle ?? 'fade-overlay';
	const overlayBgColor = isInsideGallery && ! overrideGalleryHoverSettings
		? hoverContext?.[ 'folioBlocks/overlayBgColor' ] ?? ''
		: attributes.overlayBgColor ?? '';
	const overlayBgGradient = isInsideGallery && ! overrideGalleryHoverSettings
		? hoverContext?.[ 'folioBlocks/overlayBgGradient' ] ?? ''
		: attributes.overlayBgGradient ?? '';
	const overlayTextColor = isInsideGallery && ! overrideGalleryHoverSettings
		? hoverContext?.[ 'folioBlocks/overlayTextColor' ] ?? ''
		: attributes.overlayTextColor ?? '';
	const overlayFontFamily = isInsideGallery && ! overrideGalleryHoverSettings
		? hoverContext?.[ 'folioBlocks/overlayFontFamily' ] ?? ''
		: attributes.overlayFontFamily ?? '';
	const overlayFontWeight = isInsideGallery && ! overrideGalleryHoverSettings
		? hoverContext?.[ 'folioBlocks/overlayFontWeight' ] ?? ''
		: attributes.overlayFontWeight ?? '';
	const overlayFontStyle = isInsideGallery && ! overrideGalleryHoverSettings
		? hoverContext?.[ 'folioBlocks/overlayFontStyle' ] ?? ''
		: attributes.overlayFontStyle ?? '';
	const chipOverlayBgColor = isInsideGallery && ! overrideGalleryHoverSettings
		? hoverContext?.[ 'folioBlocks/chipOverlayBgColor' ] ?? ''
		: attributes.chipOverlayBgColor ?? '';
	const chipOverlayTextColor = isInsideGallery && ! overrideGalleryHoverSettings
		? hoverContext?.[ 'folioBlocks/chipOverlayTextColor' ] ?? ''
		: attributes.chipOverlayTextColor ?? '';
	const effectiveHoverTitle = isInsideGallery && ! overrideGalleryHoverSettings
		? hoverContext[ 'folioBlocks/onHoverTitle' ] ?? false
		: attributes.showTitleOnHover ??
		  attributes.hoverTitle ??
		  attributes.onHoverTitle ??
		  false;
	const effectiveHoverEffect =
		( isInsideGallery && ! overrideGalleryHoverSettings
			? hoverContext?.[ 'folioBlocks/hoverEffect' ]
			: attributes.hoverEffect ) || 'none';
	const effectiveOverlayEntrance =
		( isInsideGallery && ! overrideGalleryHoverSettings
			? hoverContext?.[ 'folioBlocks/overlayEntrance' ]
			: attributes.overlayEntrance ) || 'default';
	const configuredOverlayContent =
		hoverContext?.[ 'folioBlocks/overlayContent' ] ??
		attributes.overlayContent ??
		( (
			hoverContext?.[ 'folioBlocks/wooProductPriceOnHover' ] ??
			attributes.wooProductPriceOnHover
		)
			? 'product'
			: 'title' );
	// Compute overlay state and matching CSS class for the chosen variant
	const overlayEnabled =
		( hoverContext?.[ 'folioBlocks/onHoverTitle' ] ??
			attributes.onHoverTitle ??
			effectiveHoverTitle ) === true;

	const hoverClassMap = {
		'blur-overlay': 'pb-hover-blur-overlay',
		'fade-overlay': 'pb-hover-fade-overlay',
		'gradient-bottom': 'pb-hover-gradient-bottom',
		chip: 'pb-hover-chip',
		'color-overlay': 'pb-hover-color-overlay',
		'gradient-overlay': 'pb-hover-gradient-overlay',
	};
	const hoverVariantClass =
		hoverClassMap[ effectiveOnHoverStyle ] || 'pb-hover-fade-overlay';
	const hoverEffectClassMap = {
		'zoom-in': 'pb-effect-zoom-in',
		'zoom-out': 'pb-effect-zoom-out',
		lift: 'pb-effect-lift',
		tilt: 'pb-effect-tilt',
		pop: 'pb-effect-pop',
		glare: 'pb-effect-glare',
		pan: 'pb-effect-pan',
		desaturate: 'pb-effect-desaturate',
	};
	const hoverEffectClass = hoverEffectClassMap[ effectiveHoverEffect ] || '';
	const tiltHoverHandlers =
		effectiveHoverEffect === 'tilt' ? getTiltHoverHandlers() : {};
	const overlayEntranceClassMap = {
		fade: 'pb-overlay-enter-fade',
		'slide-up': 'pb-overlay-enter-slide-up',
		'slide-down': 'pb-overlay-enter-slide-down',
		'slide-left': 'pb-overlay-enter-slide-left',
		'slide-right': 'pb-overlay-enter-slide-right',
	};
	const overlayEntranceClass =
		overlayEntranceClassMap[ effectiveOverlayEntrance ] || '';
	const overlayStyleVars =
		effectiveOnHoverStyle === 'color-overlay' ||
		effectiveOnHoverStyle === 'gradient-overlay'
			? {
					...( effectiveOnHoverStyle === 'gradient-overlay' &&
					overlayBgGradient
						? { '--pb-overlay-bg': overlayBgGradient }
						: {} ),
					...( effectiveOnHoverStyle === 'color-overlay' &&
					overlayBgColor
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
	const overlayTypographyVars = getOverlayTypographyCSS( {
		overlayFontFamily,
		overlayFontWeight,
		overlayFontStyle,
	} );

	const effectiveDownloadEnabled =
		isInsideGallery && ! overrideGalleryClickSettings
		? contextEnableDownload
		: enableDownload;
	const effectiveDownloadOnHover =
		isInsideGallery && ! overrideGalleryClickSettings
		? contextDownloadOnHover
		: downloadOnHover;

	// Icon colors (gallery context wins when inside a gallery; attributes used when standalone)
	const effectiveDownloadIconColor =
		isInsideGallery && ! overrideGalleryClickSettings
		? contextDownloadIconColor ?? ''
		: downloadIconColor ?? '';
	const effectiveDownloadIconBgColor =
		isInsideGallery && ! overrideGalleryClickSettings
		? contextDownloadIconBgColor ?? ''
		: downloadIconBgColor ?? '';
	const effectiveCartIconColor =
		isInsideGallery && ! overrideGalleryClickSettings
		? contextCartIconColor ?? ''
		: cartIconColor ?? '';
	const effectiveCartIconBgColor =
		isInsideGallery && ! overrideGalleryClickSettings
		? contextCartIconBgColor ?? ''
		: cartIconBgColor ?? '';
	const effectiveLinkIconColor =
		isInsideGallery && ! overrideGalleryClickSettings
		? contextLinkIconColor ?? ''
		: attributes.linkIconColor ?? '';
	const effectiveLinkIconBgColor =
		isInsideGallery && ! overrideGalleryClickSettings
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
	const contextImageClickAction =
		clickContext?.[ 'folioBlocks/imageClickAction' ] || '';
	const configuredImageClickAction =
		contextImageClickAction || attributes.imageClickAction || '';
	const enableWooCommerce =
		clickContext?.[ 'folioBlocks/enableWooCommerce' ] ??
		!! attributes.enableWooCommerce;
	const effectiveWooActive =
		hasWooCommerce &&
		enableWooCommerce &&
		( ! configuredImageClickAction ||
			configuredImageClickAction === 'woocommerce' );
	const galleryImageClickAction =
		context?.[ 'folioBlocks/imageClickAction' ] || '';
	const galleryHoverWooActive =
		hasWooCommerce &&
		!! context?.[ 'folioBlocks/enableWooCommerce' ] &&
		( ! galleryImageClickAction ||
			galleryImageClickAction === 'woocommerce' );
	const effectiveHoverWooActive = overrideGalleryHoverSettings
		? effectiveWooActive
		: galleryHoverWooActive;
	const effectiveOverlayContent =
		configuredOverlayContent === 'product' && ! effectiveHoverWooActive
			? 'title'
			: configuredOverlayContent;
	const hasHoverOverlayContent =
		effectiveOverlayContent === 'product'
			? effectiveHoverWooActive && Number( attributes.wooProductId ) > 0
			: effectiveOverlayContent === 'caption'
			? !! caption?.trim()
			: effectiveOverlayContent === 'exif'
			? true
			: !! title?.trim();
	const effectiveImageClickTarget =
		clickContext?.[ 'folioBlocks/imageClickTarget' ] ||
		attributes.imageClickTarget ||
		'icon';
	const effectiveLinkIconDisplay =
		clickContext?.[ 'folioBlocks/linkIconDisplay' ] ||
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
		! isInsideProofingGallery &&
		( ! isInsideGallery ||
			galleryOverridesEnabled ||
			!! effectiveWooActive ||
			contextImageClickAction === 'custom_url' ||
			contextImageClickAction === 'page_post' );

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
	const baseFigureStyle = {
		...imageStyle,
		...overlayStyleVars,
		...overlayTypographyVars,
	};
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
		lightbox:
			clickContext?.[ 'folioBlocks/lightbox' ] ??
			lightbox,
		enableDownload: effectiveDownloadEnabled,
		enableWooCommerce: enableWooCommerce && hasWooCommerce,
		imageClickAction: isInsideGallery && ! overrideGalleryClickSettings
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
		activeImageClickAction === 'custom_url';
	const shouldShowPagePostControls =
		activeImageClickAction === 'page_post';
	const shouldShowWooProductToolbar =
		src &&
		activeImageClickAction === 'woocommerce' &&
		!! hasWooCommerce;
	const shouldShowLinkIcon =
		( activeImageClickAction === 'custom_url' ||
			activeImageClickAction === 'page_post' ) &&
		effectiveLinkIconDisplay !== 'none';
	const shouldShowDownloadIcon =
		!! effectiveDownloadEnabled && effectiveImageClickTarget === 'icon';
	const shouldShowWooIcon =
		activeImageClickAction === 'woocommerce' &&
		!! effectiveWooActive &&
		( clickContext?.[ 'folioBlocks/wooCartIconDisplay' ] ||
			attributes.wooCartIconDisplay ||
			'hover' ) !== 'none';
	const proofingControls = isInsideProofingGallery ? (
		<ProofingThumbnailControls
			enableHeart={ proofingGalleryAttributes.enableHeart !== false }
			enableFlag={ proofingGalleryAttributes.enableFlag !== false }
			enableComment={ proofingGalleryAttributes.enableComment !== false }
		/>
	) : null;

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
							isInsideGallery:
								isInsideGallery &&
								! overrideGalleryClickSettings,
							contextWooDefaultLinkAction:
								overrideGalleryClickSettings
									? ''
									: contextWooDefaultLinkAction,
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
									imageProFeatureNotice( 'protectionPerformance' ),
									{ attributes, setAttributes }
								) }
						</PanelBody>
					) }
					{ isInsideGallery && ! galleryOverridesEnabled && (
						<PanelBody
							title={ __(
								'Per-Image Gallery Overrides',
								'folioblocks'
							) }
							initialOpen={ true }
						>
							{ imageProFeatureNotice( 'imageOverrides' ) }
						</PanelBody>
					) }
					{ showImageClickPanel && (
						<PanelBody
							title={ __( 'Image Click Settings', 'folioblocks' ) }
							initialOpen={ true }
						>
							{ isInsideGallery && galleryOverridesEnabled && (
								<ToggleControl
									label={ __(
										'Override Gallery Click Settings',
										'folioblocks'
									) }
									checked={ overrideGalleryClickSettings }
									onChange={ ( value ) =>
										setAttributes( {
											overrideGalleryClickSettings: value,
										} )
									}
									__nextHasNoMarginBottom
									help={ __(
										'Use click behavior configured specifically for this image.',
										'folioblocks'
									) }
								/>
							) }
							{ ( ! isInsideGallery ||
								overrideGalleryClickSettings ) && (
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
										imageProFeatureNotice( 'clickActions' ),
										{
											attributes,
											setAttributes,
											hasWooCommerce,
											effectiveEnableWoo,
										}
									) }
								</>
							) }
							{ hasWooCommerce &&
								activeImageClickAction === 'woocommerce' &&
								applyFilters(
									'folioBlocks.imageBlock.wooProductLinkControl',
									null,
									{
										attributes,
										setAttributes,
										effectiveWooActive,
										isInsideGallery:
											isInsideGallery &&
											! overrideGalleryClickSettings,
										contextWooDefaultLinkAction:
											overrideGalleryClickSettings
												? ''
												: contextWooDefaultLinkAction,
									}
								) }
							{ ( ! isInsideGallery ||
								overrideGalleryClickSettings ) &&
								activeImageClickAction === 'lightbox' &&
								applyFilters(
									'folioBlocks.imageBlock.lightboxControls',
									null,
									{ attributes, setAttributes, context }
								) }
							{ ( ! isInsideGallery ||
								overrideGalleryClickSettings ) &&
								activeImageClickAction === 'download' &&
								applyFilters(
									'folioBlocks.imageBlock.downloadControls',
									null,
									{
										attributes,
										setAttributes,
										isInsideGallery: false,
									}
								) }
							{ ( ! isInsideGallery ||
								overrideGalleryClickSettings ) &&
								activeImageClickAction === 'woocommerce' &&
								applyFilters(
									'folioBlocks.imageBlock.wooCommerceControls',
									null,
									{
										attributes,
										setAttributes,
										isInsideGallery: false,
									}
								) }
							{ shouldShowCustomUrlControls &&
								applyFilters(
									'folioBlocks.imageBlock.customUrlControls',
									null,
									{
										attributes,
										setAttributes,
										isInsideGallery:
											isInsideGallery &&
											! overrideGalleryClickSettings,
									}
								) }
							{ shouldShowPagePostControls &&
								applyFilters(
									'folioBlocks.imageBlock.pagePostLinkControls',
									null,
									{
										attributes,
										setAttributes,
										isInsideGallery:
											isInsideGallery &&
											! overrideGalleryClickSettings,
									}
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
						{ ! isInsideProofingGallery &&
							( ! isInsideGallery || galleryOverridesEnabled ) && (
							<PanelBody
								title={ __( 'Image Hover Settings', 'folioblocks' ) }
								initialOpen={ true }
							>
								{ isInsideGallery && (
									<ToggleControl
										label={ __(
											'Override Gallery Hover Settings',
											'folioblocks'
										) }
										checked={ overrideGalleryHoverSettings }
										onChange={ ( value ) =>
											setAttributes( {
												overrideGalleryHoverSettings: value,
											} )
										}
										__nextHasNoMarginBottom
										help={ __(
											'Use hover behavior configured specifically for this image.',
											'folioblocks'
										) }
									/>
								) }
								{ ( ! isInsideGallery ||
									overrideGalleryHoverSettings ) &&
									applyFilters(
										'folioBlocks.imageBlock.onHoverTitleToggle',
										imageProFeatureNotice( 'hoverSettings' ),
										{
											attributes: {
												...attributes,
												imageClickAction:
													activeImageClickAction,
												enableWooCommerce:
													effectiveHoverWooActive,
											},
											setAttributes,
											context,
										}
									) }
							</PanelBody>
						) }
						{ ! isInsideGallery && (
							<PanelBody
								title={ __( 'Watermark Overlay', 'folioblocks' ) }
								initialOpen={ false }
							>
								{ applyFilters(
									'folioBlocks.imageBlock.watermarkControls',
									imageProFeatureNotice( 'watermarkOverlay' ),
									{ attributes, setAttributes }
								) }
							</PanelBody>
						) }
						{ ! isInsideGallery && (
							<PanelBody
								title={ __(
									'Social Media Sharing',
									'folioblocks'
								) }
								initialOpen={ false }
							>
								{ applyFilters(
									'folioBlocks.imageBlock.socialSharingControls',
									imageProFeatureNotice( 'socialSharing' ),
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
									imageProFeatureNotice( 'exif' ),
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
						isInsideGallery:
							isInsideGallery && ! overrideGalleryClickSettings,
						context: clickContext,
					}
				) }
				{ applyFilters(
					'folioBlocks.imageBlock.hoverOverlayStyleControls',
					null,
					{
						attributes,
						setAttributes,
						isInsideGallery:
							isInsideGallery && ! overrideGalleryHoverSettings,
						context: hoverContext,
					}
				) }
			</InspectorControls>
			{ isInMasonryGallery ? (
				<div className="pb-image-block-wrapper">
					<div { ...blockProps }>
						<figure
							{ ...tiltHoverHandlers }
							className={ [
								'pb-image-block',
								overlayEnabled ? hoverVariantClass : '',
								overlayEnabled ? overlayEntranceClass : '',
								hoverEffectClass,
								shadowStyleClass,
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
									{ proofingControls }
									{ applyFilters(
										'folioBlocks.imageBlock.watermarkOverlay',
										null,
										{
											attributes,
											context,
											isInsideGallery,
										}
									) }
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
																	effectiveWooActive:
																		effectiveHoverWooActive,
																	context: hoverContext,
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
												context: clickContext,
												isInsideGallery:
													isInsideGallery &&
													! overrideGalleryClickSettings,
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
												context: clickContext,
												isInsideGallery:
													isInsideGallery &&
													! overrideGalleryClickSettings,
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
						{ ...tiltHoverHandlers }
						className={ [
							'pb-image-block',
							overlayEnabled ? hoverVariantClass : '',
							overlayEnabled ? overlayEntranceClass : '',
							hoverEffectClass,
							shadowStyleClass,
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
								{ proofingControls }
								{ applyFilters(
									'folioBlocks.imageBlock.watermarkOverlay',
									null,
									{
										attributes,
										context,
										isInsideGallery,
									}
								) }
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
																effectiveWooActive:
																	effectiveHoverWooActive,
																context: hoverContext,
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
										context: clickContext,
										isInsideGallery:
											isInsideGallery &&
											! overrideGalleryClickSettings,
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
										context: clickContext,
										isInsideGallery:
											isInsideGallery &&
											! overrideGalleryClickSettings,
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
