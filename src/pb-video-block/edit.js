/**
 * PB Video Block
 * Edit JS
 */
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	BlockControls,
	MediaPlaceholder,
} from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	TextareaControl,
	Button,
	SelectControl,
	ToolbarButton,
	ToolbarGroup,
	Modal,
	RangeControl,
	ToggleControl,
	Notice,
} from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { applyFilters } from '@wordpress/hooks';
import { IconVideoBlock, IconPlayButton } from '../pb-helpers/icons';
import CompactColorControl from '../pb-helpers/CompactColorControl.js';
import './editor.scss';

const ASPECT_RATIOS = {
	'21:9': 'aspect-21-9',
	'16:9': 'aspect-16-9',
	'9:16': 'aspect-9-16',
	'4:3': 'aspect-4-3',
	'3:2': 'aspect-3-2',
	'1:1': 'aspect-1-1',
};
const checkoutUrl =
	window.folioBlocksData?.checkoutUrl ||
	'https://folioblocks.com/folioblocks-pricing/?utm_source=folioblocks&utm_medium=video-block&utm_campaign=upgrade';

// Function to support YouTube & Vimeo Videos
function getVideoEmbedMarkup( videoUrl ) {
	const origin = window.location.origin;
	if ( ! videoUrl ) {
		return null;
	}

	// Handle YouTube URLs
	if (
		videoUrl.includes( 'youtube.com' ) ||
		videoUrl.includes( 'youtu.be' )
	) {
		let videoId = '';
		try {
			const url = new URL( videoUrl );
			if ( url.hostname.includes( 'youtu.be' ) ) {
				videoId = url.pathname.replace( '/', '' );
			} else if ( url.searchParams.has( 'v' ) ) {
				videoId = url.searchParams.get( 'v' );
			}
		} catch ( e ) {
			console.warn( 'Invalid YouTube URL:', videoUrl );
		}
		if ( videoId ) {
			return (
				<iframe
					src={ `https://www.youtube-nocookie.com/embed/${ videoId }?rel=0&modestbranding=1` }
					style={ { border: 'none' } }
					allow="autoplay; fullscreen"
					allowFullScreen
					title="YouTube Video"
					sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
					referrerPolicy="strict-origin-when-cross-origin"
				></iframe>
			);
		}
	}
	// Handle Vimeo URLs
	if ( videoUrl.includes( 'vimeo.com' ) ) {
		const videoId = videoUrl.split( '/' ).pop().split( '?' )[ 0 ];
		return (
			<iframe
				src={ `https://player.vimeo.com/video/${ videoId }` }
				style={ { border: 'none' } }
				allow="autoplay; fullscreen"
				allowFullScreen
				title="Vimeo Video"
			/>
		);
	}
	// Fallback for self-hosted videos
	return <video src={ videoUrl } controls autoPlay />;
}

export default function Edit( { attributes, setAttributes, context } ) {
	const {
		videoUrl,
		thumbnail,
		thumbnailId,
		title,
		description,
		aspectRatio,
		playButtonVisibility,
		titleVisibility,
		overlayStyle,
		overlayBgColor,
		overlayTextColor,
		filterCategory,
		thumbnailSize,
		lightbox,
		lightboxLayout,
		preview,
		cartIconColor,
		cartIconBgColor,
	} = attributes;

	// Block Preview Image
	if ( preview ) {
		return (
			<div className="pb-block-preview">
				<IconVideoBlock />
			</div>
		);
	}

	const [ isVideoModalOpen, setIsVideoModalOpen ] = useState( false );
	const [ isLightboxOpen, setLightboxOpen ] = useState( false );

	// Effect: Listen for Escape key to close lightbox
	useEffect( () => {
		const handleKeyDown = ( e ) => {
			if ( e.key === 'Escape' ) {
				setLightboxOpen( false );
			}
		};
		document.addEventListener( 'keydown', handleKeyDown );
		return () => document.removeEventListener( 'keydown', handleKeyDown );
	}, [] );

	const parentAspectRatio = context?.[ 'folioBlocks/aspectRatio' ];
	const parentPlayButton = context?.[ 'folioBlocks/playButtonVisibility' ];
	const parentTitleVisibility = context?.[ 'folioBlocks/titleVisibility' ];
	const lightboxEnabled =
		typeof context?.[ 'folioBlocks/lightbox' ] !== 'undefined'
			? !! context[ 'folioBlocks/lightbox' ]
			: !! attributes.lightbox;

	const effectiveLightboxLayout =
		typeof context?.[ 'folioBlocks/lightboxLayout' ] !== 'undefined'
			? context[ 'folioBlocks/lightboxLayout' ]
			: attributes.lightboxLayout || 'video-only';
	const inheritedAspectRatio = context?.[ 'folioBlocks/aspectRatio' ];
	const inheritedPlayButtonVisibility =
		context?.[ 'folioBlocks/playButtonVisibility' ];
	const inheritedTitleVisibility = context?.[ 'folioBlocks/titleVisibility' ];
	const inheritedOverlayStyle = context?.[ 'folioBlocks/overlayStyle' ];
	const inheritedOverlayBgColor = context?.[ 'folioBlocks/overlayBgColor' ];
	const inheritedOverlayTextColor =
		context?.[ 'folioBlocks/overlayTextColor' ];
	const inheritedThumbnailSize = context?.[ 'folioBlocks/thumbnailSize' ];

	const isInVideoGallery =
		typeof context?.[ 'folioBlocks/gallery' ] !== 'undefined' ||
		typeof context?.[ 'folioBlocks/thumbnailSize' ] !== 'undefined' ||
		typeof context?.[ 'folioBlocks/aspectRatio' ] !== 'undefined' ||
		typeof context?.[ 'folioBlocks/enableWooCommerce' ] !== 'undefined';
	const isInsideGallery = isInVideoGallery;
	const activeFilter = context?.[ 'folioBlocks/activeFilter' ] || 'All';

	const lazyLoad = context?.[ 'folioBlocks/lazyLoad' ];
	const enableWooCommerce =
		typeof context?.[ 'folioBlocks/enableWooCommerce' ] !== 'undefined'
			? !! context[ 'folioBlocks/enableWooCommerce' ]
			: !! attributes.enableWooCommerce;
	const hasWooCommerce = window.folioBlocksData?.hasWooCommerce || false;
	const inheritedBorderColor = context?.[ 'folioBlocks/borderColor' ];
	const inheritedBorderWidth = context?.[ 'folioBlocks/borderWidth' ];
	const inheritedBorderRadius = context?.[ 'folioBlocks/borderRadius' ];
	const inheritedDropShadow = context?.[ 'folioBlocks/dropShadow' ];
	// Cart icon styling (provided by Video Gallery via context)
	const inheritedCartIconColor = context?.[ 'folioBlocks/cartIconColor' ];
	const inheritedCartIconBgColor = context?.[ 'folioBlocks/cartIconBgColor' ];

	// Effect: Sync with parent/inherited values
	useEffect( () => {
		if ( parentAspectRatio && aspectRatio !== parentAspectRatio ) {
			setAttributes( { aspectRatio: parentAspectRatio } );
		}
		if ( parentPlayButton && playButtonVisibility !== parentPlayButton ) {
			setAttributes( { playButtonVisibility: parentPlayButton } );
		}
		if (
			parentTitleVisibility &&
			titleVisibility !== parentTitleVisibility
		) {
			setAttributes( { titleVisibility: parentTitleVisibility } );
		}
		if ( inheritedBorderColor !== undefined ) {
			setAttributes( { borderColor: inheritedBorderColor } );
		}
		if ( inheritedBorderWidth !== undefined ) {
			setAttributes( { borderWidth: inheritedBorderWidth } );
		}
		if ( inheritedBorderRadius !== undefined ) {
			setAttributes( { borderRadius: inheritedBorderRadius } );
		}
		if ( inheritedDropShadow !== undefined ) {
			setAttributes( { dropShadow: inheritedDropShadow } );
		}
		if ( lazyLoad !== undefined && attributes.lazyLoad !== lazyLoad ) {
			setAttributes( { lazyLoad } );
		}
		if ( lightboxLayout && attributes.lightboxLayout !== lightboxLayout ) {
			setAttributes( { lightboxLayout } );
		}
		// Optionally clear WooCommerce product data if Woo is not available
		if ( ! hasWooCommerce ) {
			setAttributes( {
				wooProductId: 0,
				wooProductName: '',
				wooProductPrice: '',
				wooProductURL: '',
				wooProductDescription: '',
				wooProductImage: '',
			} );
		}
	}, [
		parentAspectRatio,
		parentPlayButton,
		parentTitleVisibility,
		inheritedBorderColor,
		inheritedBorderWidth,
		inheritedBorderRadius,
		inheritedDropShadow,
		lazyLoad,
		lightboxLayout,
		hasWooCommerce,
	] );

	// ---------------------------
	// Derived / Effective Values
	// ---------------------------
	const effectiveThumbnailSize = inheritedThumbnailSize ?? thumbnailSize;
	const effectiveAspectRatio = inheritedAspectRatio || aspectRatio;
	const effectivePlayButtonVisibility =
		inheritedPlayButtonVisibility ?? playButtonVisibility ?? 'always';
	const effectiveTitleVisibility =
		inheritedTitleVisibility ?? titleVisibility ?? 'always';
	const effectiveOverlayStyle =
		inheritedOverlayStyle ?? overlayStyle ?? 'default';
	const effectiveOverlayBgColor =
		inheritedOverlayBgColor ?? overlayBgColor ?? '';
	const effectiveOverlayTextColor =
		inheritedOverlayTextColor ?? overlayTextColor ?? '';
	const combinedVisibility =
		titleVisibility === 'hidden' && playButtonVisibility !== 'hidden'
			? playButtonVisibility
			: titleVisibility;
	const hidePlayButton =
		combinedVisibility !== 'hidden' && playButtonVisibility === 'hidden';
	const effectiveCombinedVisibility =
		effectiveTitleVisibility === 'hidden' &&
		effectivePlayButtonVisibility !== 'hidden'
			? effectivePlayButtonVisibility
			: effectiveTitleVisibility;
	const currentCategory = filterCategory?.trim() || '';
	const isHidden =
		activeFilter !== 'All' &&
		currentCategory.toLowerCase() !== activeFilter.toLowerCase();
	const showOverlayAlways =
		effectivePlayButtonVisibility === 'always' ||
		effectiveTitleVisibility === 'always';
	const showOverlayOnHover =
		effectivePlayButtonVisibility === 'onHover' ||
		effectiveTitleVisibility === 'onHover';
	const isColorOverlayOnHover =
		effectiveOverlayStyle === 'color' &&
		effectiveCombinedVisibility === 'onHover';
	const isBlurOverlayOnHover =
		effectiveOverlayStyle === 'blur' &&
		effectiveCombinedVisibility === 'onHover';
	const overlayStyleVars = {
		...( isColorOverlayOnHover && effectiveOverlayBgColor
			? { '--pb-video-overlay-bg': effectiveOverlayBgColor }
			: {} ),
		...( isColorOverlayOnHover && effectiveOverlayTextColor
			? { '--pb-video-overlay-text': effectiveOverlayTextColor }
			: {} ),
	};

	// ---------------------------
	// Icon styles (context > attribute)
	// ---------------------------
	const effectiveCartIconColor = isInsideGallery
		? inheritedCartIconColor ?? ''
		: cartIconColor ?? '';
	const effectiveCartIconBgColor = isInsideGallery
		? inheritedCartIconBgColor ?? ''
		: cartIconBgColor ?? '';

	const cartIconStyleVars = {
		...( effectiveCartIconColor
			? { '--pb-cart-icon-color': effectiveCartIconColor }
			: {} ),
		...( effectiveCartIconBgColor
			? { '--pb-cart-icon-bg': effectiveCartIconBgColor }
			: {} ),
	};

	const imageSizeOptions = wp.data
		.select( 'core/block-editor' )
		.getSettings()
		.imageSizes.map( ( size ) => ( {
			label: size.name,
			value: size.slug,
		} ) )
		.sort( ( a, b ) => {
			const order = [ 'thumbnail', 'medium', 'large', 'full' ];
			const indexA = order.indexOf( a.value );
			const indexB = order.indexOf( b.value );
			if ( indexA === -1 && indexB === -1 ) {
				return 0;
			}
			if ( indexA === -1 ) {
				return 1;
			}
			if ( indexB === -1 ) {
				return -1;
			}
			return indexA - indexB;
		} );

	// Effective border values (context > attribute)
	const effectiveBorderColor = inheritedBorderColor ?? attributes.borderColor;
	const effectiveBorderWidth = inheritedBorderWidth ?? attributes.borderWidth;
	const effectiveBorderRadius =
		inheritedBorderRadius ?? attributes.borderRadius;

	// Set Block Thumbnail
	const setThumbnail = ( media ) => {
		if ( ! media || ! media.url || ! media.id ) {
			return;
		}
		setAttributes( {
			thumbnailId: media.id,
			thumbnail: media.url, // fallback display
		} );
	};
	const thumbnailData = useSelect(
		( select ) => {
			if ( ! thumbnailId ) {
				return null;
			}
			// WP 6.9+: use core.getEntityRecord for attachments
			return (
				select( 'core' ).getEntityRecord(
					'postType',
					'attachment',
					thumbnailId
				) || null
			);
		},
		[ thumbnailId, effectiveThumbnailSize ]
	);
	const resolvedThumbnailUrl =
		thumbnailData?.media_details?.sizes?.[ effectiveThumbnailSize ]
			?.source_url || thumbnail;
	const openMediaLibrary = () => {
		const frame = wp.media( {
			title: __( 'Select a video', 'folioblocks' ),
			library: { type: 'video' },
			multiple: false,
			button: { text: __( 'Use this video', 'folioblocks' ) },
		} );
		frame.on( 'select', () => {
			const media = frame.state().get( 'selection' ).first().toJSON();
			if ( media && media.url ) {
				setAttributes( { videoUrl: media.url } );
			}
		} );
		frame.open();
	};
	const blockProps = useBlockProps( {
		className: isHidden ? 'is-hidden' : undefined,
	} );

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						label={ __( 'Change Video', 'folioblocks' ) }
						icon="format-video"
						onClick={ () => setIsVideoModalOpen( true ) }
					>
						{ __( 'Change Video', 'folioblocks' ) }
					</ToolbarButton>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ ( media ) => {
								if ( ! media || ! media.id || ! media.url ) {
									return;
								}
								setAttributes( {
									thumbnailId: media.id,
									thumbnail: media.url,
								} );
							} }
							allowedTypes={ [ 'image' ] }
							render={ ( { open } ) => (
								<ToolbarButton
									label={ __(
										'Change Thumbnail',
										'folioblocks'
									) }
									icon="format-image"
									onClick={ open }
								>
									{ __( 'Change Thumbnail', 'folioblocks' ) }
								</ToolbarButton>
							) }
						/>
					</MediaUploadCheck>
					{ isVideoModalOpen && (
						<Modal
							title={ __(
								'Select or Insert Video',
								'folioblocks'
							) }
							onRequestClose={ () =>
								setIsVideoModalOpen( false )
							}
						>
							<MediaPlaceholder
								labels={ {
									title: __(
										'Select or Insert Video',
										'folioblocks'
									),
									instructions: __(
										'Upload, select from media library or insert from URL.',
										'folioblocks'
									),
								} }
								allowedTypes={ [ 'video' ] }
								accept="video/*"
								onSelect={ ( media ) => {
									setAttributes( { videoUrl: media.url } );
									setIsVideoModalOpen( false );
								} }
								onSelectURL={ ( url ) => {
									setAttributes( { videoUrl: url } );
									setIsVideoModalOpen( false );
								} }
								onError={ ( errorMessage ) => {
									console.error( errorMessage );
								} }
							/>
						</Modal>
					) }
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				<PanelBody
					title={ __( 'Video Block Settings', 'folioblocks' ) }
					initialOpen={ true }
				>
					{ thumbnail && (
						<div style={ { marginBottom: '16px' } }>
							<div
								className={ `pb-video-thumbnail-preview ${ ASPECT_RATIOS[ effectiveAspectRatio ] }` }
							>
								<img
									src={ resolvedThumbnailUrl }
									alt={ title || '' }
								/>
							</div>
							<MediaUploadCheck>
								<MediaUpload
									onSelect={ setThumbnail }
									allowedTypes={ [ 'image' ] }
									render={ ( { open } ) => (
										<div
											style={ {
												display: 'flex',
												justifyContent: 'center',
												marginTop: '8px',
											} }
										>
											<Button
												onClick={ open }
												variant="secondary"
											>
												{ __(
													'Change Thumbnail',
													'folioblocks'
												) }
											</Button>
										</div>
									) }
								/>
							</MediaUploadCheck>
						</div>
					) }
					<TextControl
						label={ __( 'Video URL', 'folioblocks' ) }
						value={ videoUrl }
						onChange={ ( val ) =>
							setAttributes( { videoUrl: val } )
						}
						help={
							<>
								{ __( 'Supports YouTube, Vimeo, or' ) }
								<a
									href="#"
									onClick={ ( e ) => {
										e.preventDefault();
										openMediaLibrary();
									} }
								>
									{ __( 'self-hosted videos' ) }
								</a>
								{
									'. Note: Some YouTube & Vimeo videos may not work due to privacy settings.'
								}
							</>
						}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					{ ! inheritedThumbnailSize && (
						<>
							<hr
								style={ {
									border: '0.5px solid #e0e0e0',
									margin: '12px 0',
								} }
							/>
							<SelectControl
								label={ __(
									'Thumbnail Resolution',
									'folioblocks'
								) }
								value={ thumbnailSize }
								onChange={ ( val ) =>
									setAttributes( { thumbnailSize: val } )
								}
								options={ imageSizeOptions }
								__nextHasNoMarginBottom
								__next40pxDefaultSize
							/>
						</>
					) }
					{ ! inheritedAspectRatio && (
						<>
							<SelectControl
								label={ __(
									'Thumbnail Aspect Ratio',
									'folioblocks'
								) }
								value={ aspectRatio }
								onChange={ ( val ) =>
									setAttributes( { aspectRatio: val } )
								}
								options={ Object.keys( ASPECT_RATIOS ).map(
									( ratio ) => ( {
										label: ratio,
										value: ratio,
									} )
								) }
								help={ __(
									'Set video Thumbnail aspect ratio.'
								) }
								__nextHasNoMarginBottom
								__next40pxDefaultSize
							/>
						</>
					) }
					<TextControl
						label={ __( 'Video Title', 'folioblocks' ) }
						value={ title }
						onChange={ ( val ) => {
							setAttributes( {
								title: val,
								alt: val, // keep alt synced with title edits
							} );
						} }
						help={ __(
							'Set Video Title used in the Hover Overlay, Lightbox, and for Alt-text.'
						) }
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<TextareaControl
						label={ __( 'Description', 'folioblocks' ) }
						value={ description }
						onChange={ ( value ) =>
							setAttributes( { description: value } )
						}
						help={ __(
							'Shown in the lightbox when enabled in Gallery Lightbox Settings.',
							'folioblocks'
						) }
						__nextHasNoMarginBottom
					/>
					{ applyFilters(
						'folioBlocks.pbVideoBlock.filterCategories',
						null,
						{
							attributes,
							setAttributes,
							context,
						}
					) }
				</PanelBody>

				{ typeof inheritedPlayButtonVisibility === 'undefined' && (
					<>
						<PanelBody
							title={ __(
								'Lightbox & Hover Overlay Settings',
								'folioblocks'
							) }
							initialOpen={ true }
						>
							<ToggleControl
								label={ __(
									'Enable Lightbox in Editor',
									'folioblocks'
								) }
								checked={ !! lightbox }
								onChange={ ( val ) =>
									setAttributes( { lightbox: !! val } )
								}
								__nextHasNoMarginBottom
								help={ __(
									'Allows video to open in a Lightbox while editing.',
									'folioblocks'
								) }
							/>
							{ applyFilters(
								'folioBlocks.videoBlock.lightboxLayout',
								null,
								{
									attributes,
									setAttributes,
									isInsideGallery,
								}
							) }
							<SelectControl
								label={ __(
									'Title & Play Button Visibility',
									'folioblocks'
								) }
								value={ combinedVisibility }
								onChange={ ( val ) => {
									if ( val === 'hidden' ) {
										setAttributes( {
											titleVisibility: 'hidden',
											playButtonVisibility: 'hidden',
										} );
										return;
									}
									setAttributes( {
										titleVisibility: val,
										playButtonVisibility: hidePlayButton
											? 'hidden'
											: val,
									} );
								} }
								options={ [
									{
										label: __(
											'Always Show',
											'folioblocks'
										),
										value: 'always',
									},
									{
										label: __( 'On Hover', 'folioblocks' ),
										value: 'onHover',
									},
									{
										label: __( 'Hidden', 'folioblocks' ),
										value: 'hidden',
									},
								] }
								help={ __(
									'Set visibility for title and play button overlays.'
								) }
								__nextHasNoMarginBottom
								__next40pxDefaultSize
							/>
							{ combinedVisibility !== 'hidden' && (
								<ToggleControl
									label={ __(
										'Hide Play Button',
										'folioblocks'
									) }
									checked={ hidePlayButton }
									onChange={ ( val ) =>
										setAttributes( {
											playButtonVisibility: val
												? 'hidden'
												: combinedVisibility,
										} )
									}
									help={ __(
										'Hide only the play button overlay.'
									) }
									__nextHasNoMarginBottom
								/>
							) }
							{ combinedVisibility === 'onHover' &&
								applyFilters(
									'folioBlocks.videoBlock.customOverlayControls',
									<div style={ { marginBottom: '8px' } }>
										<Notice
											status="info"
											isDismissible={ false }
										>
											<strong>
												{ __(
													'Custom Overlay',
													'folioblocks'
												) }
											</strong>
											<br />
											{ __(
												'This is a premium feature. Unlock all features:',
												'folioblocks'
											) }
											<a
												href={ checkoutUrl }
												target="_blank"
												rel="noopener noreferrer"
											>
												{ __(
													'Upgrade to Pro',
													'folioblocks'
												) }
											</a>
										</Notice>
									</div>,
									{
										attributes,
										setAttributes,
										combinedVisibility,
										isInsideGallery,
									}
								) }
						</PanelBody>
					</>
				) }
				{ typeof inheritedPlayButtonVisibility === 'undefined' && (
					<PanelBody
						title={ __( 'E-Commerce Settings', 'folioblocks' ) }
						initialOpen={ true }
					>
						{ applyFilters(
							'folioBlocks.videoBlock.wooCommerceControls',
							null,
							{
								attributes,
								setAttributes,
								isInsideGallery: isInVideoGallery,
							}
						) }
						{ applyFilters(
							'folioBlocks.pbVideoBlock.WooProductSearch',
							null,
							{
								attributes,
								setAttributes,
								hasWooCommerce,
								enableWooCommerce:
									attributes.enableWooCommerce ?? false,
							}
						) }
					</PanelBody>
				) }
			</InspectorControls>
			{ ! isInsideGallery && (
				<InspectorControls group="advanced">
					{ applyFilters(
						'folioBlocks.videoBlock.disableRightClickToggle',
						<div style={ { marginBottom: '8px' } }>
							<Notice status="info" isDismissible={ false }>
								<strong>
									{ __(
										'Disable Right-Click',
										'folioblocks'
									) }
								</strong>
								<br />
								{ __(
									'This is a premium feature. Unlock all features:',
									'folioblocks'
								) }
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
					{ applyFilters(
						'folioBlocks.videoBlock.lazyLoadToggle',
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
								) }
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
				</InspectorControls>
			) }
			{ typeof inheritedBorderColor === 'undefined' &&
				typeof inheritedBorderWidth === 'undefined' &&
				typeof inheritedBorderRadius === 'undefined' && (
					<InspectorControls group="styles">
						<PanelBody
							title={ __(
								'Video Block Styles',
								'pb-video-block'
							) }
							initialOpen={ true }
						>
							<CompactColorControl
								label={ __( 'Border Color', 'folioblocks' ) }
								value={ attributes.borderColor }
								onChange={ ( borderColor ) =>
									setAttributes( { borderColor } )
								}
								help={ __( 'Set Video border color.' ) }
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
								help={ __( 'Set Video border width.' ) }
							/>
							<RangeControl
								label={ __( 'Border Radius', 'folioblocks' ) }
								value={ attributes.borderRadius }
								onChange={ ( value ) =>
									setAttributes( { borderRadius: value } )
								}
								min={ 0 }
								max={ 100 }
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								help={ __( 'Set Video border radius.' ) }
							/>
							<ToggleControl
								label={ __(
									'Enable Drop Shadow',
									'folioblocks'
								) }
								checked={ !! attributes.dropShadow }
								onChange={ ( value ) =>
									setAttributes( { dropShadow: value } )
								}
								help={ __( 'Enable drop shadow effect.' ) }
							/>
						</PanelBody>
						{ applyFilters(
							'folioBlocks.videoBlock.iconStyleControls',
							null,
							{
								attributes,
								setAttributes,
								isInsideGallery,
								enableWooCommerce,
								hasWooCommerce,
							}
						) }
					</InspectorControls>
				) }

			{ /* Visual layout: thumbnail or placeholder or video */ }
			<div { ...blockProps }>
				{ ! thumbnail ? (
					<div
						className={ `pb-video-block ${ ASPECT_RATIOS[ effectiveAspectRatio ] }` }
					>
						<div className="video-thumbnail-placeholder">
							<span className="placeholder-label">
								{ __( 'No Thumbnail Selected', 'folioblocks' ) }
							</span>
							<MediaUploadCheck>
								<MediaUpload
									onSelect={ ( media ) => {
										setThumbnail( media );
									} }
									allowedTypes={ [ 'image' ] }
									render={ ( { open } ) => (
										<Button
											onClick={ open }
											variant="secondary"
										>
											{ __(
												'Select Thumbnail',
												'folioblocks'
											) }
										</Button>
									) }
								/>
							</MediaUploadCheck>
						</div>
					</div>
				) : ! videoUrl ? (
					<MediaPlaceholder
						icon="format-video"
						labels={ { title: __( 'Add Video', 'folioblocks' ) } }
						allowedTypes={ [ 'video' ] }
						onSelect={ ( media ) =>
							setAttributes( { videoUrl: media.url } )
						}
						onSelectURL={ ( url ) =>
							setAttributes( { videoUrl: url } )
						}
						accept="video/*"
						addToGallery={ false }
						notices={ [] }
					/>
				) : (
					<div
						className={ `pb-video-block ${
							ASPECT_RATIOS[ effectiveAspectRatio ]
						}${ showOverlayAlways ? ' has-overlay-always' : '' }${
							showOverlayOnHover ? ' has-overlay-hover' : ''
						}${
							isColorOverlayOnHover ? ' has-color-overlay' : ''
						}${ isBlurOverlayOnHover ? ' has-blur-overlay' : '' }${
							attributes.dropShadow ? ' drop-shadow' : ''
						}` }
						style={ {
							borderWidth: effectiveBorderWidth
								? `${ effectiveBorderWidth }px`
								: undefined,
							borderStyle: effectiveBorderWidth
								? 'solid'
								: undefined,
							borderColor: effectiveBorderColor || undefined,
							borderRadius: effectiveBorderRadius
								? `${ effectiveBorderRadius }px`
								: undefined,
							...overlayStyleVars,
						} }
						data-filter={ currentCategory }
						onClick={ () => {
							if ( ! lightboxEnabled ) {
								return;
							}
							if ( videoUrl ) {
								setLightboxOpen( true );
							}
						} }
					>
						<img
							src={ resolvedThumbnailUrl }
							alt={ title || '' }
							className="pb-video-block-img"
						/>

						{ applyFilters(
							'folioBlocks.pbVideoBlock.renderAddToCart',
							null,
							{
								attributes,
								context,
								isInVideoGallery,
								isInsideGallery,
								cartIconStyleVars,
								effectiveCartIconColor,
								effectiveCartIconBgColor,
							}
						) }
						<div className="video-overlay">
							<div className="overlay-content">
								{ title &&
									effectiveTitleVisibility !== 'hidden' && (
										<div
											className={ `video-title-overlay ${ effectiveTitleVisibility }` }
										>
											{ title }
										</div>
									) }
								{ effectivePlayButtonVisibility !==
									'hidden' && (
									<div
										className={ `video-play-button ${ effectivePlayButtonVisibility }` }
									>
										<IconPlayButton />
									</div>
								) }
							</div>
						</div>
					</div>
				) }

				{ isLightboxOpen && (
					<div
						className={ `pb-video-lightbox ${
							isLightboxOpen ? 'active' : ''
						} ${
							lightboxLayout === 'split' ? 'split-layout' : ''
						} ${
							lightboxLayout === 'video-product'
								? 'video-product-layout'
								: ''
						}` }
						onClick={ ( e ) => {
							if (
								e.target.classList.contains(
									'pb-video-lightbox'
								)
							) {
								setLightboxOpen( false );
							}
						} }
					>
						<div className="pb-video-lightbox-inner">
							<button
								className="pb-video-lightbox-close"
								onClick={ () => setLightboxOpen( false ) }
								aria-label={ __(
									'Close lightbox',
									'folioblocks'
								) }
							>
								×
							</button>

							{ effectiveLightboxLayout === 'video-only' && (
								<div className="pb-video-lightbox-video">
									{ getVideoEmbedMarkup(
										videoUrl,
										isInVideoGallery
											? { controls: false }
											: undefined
									) }
								</div>
							) }

							{ effectiveLightboxLayout === 'split' && (
								<>
									<div
										className="pb-video-lightbox-video"
										style={ { flex: '0 0 70%' } }
									>
										{ getVideoEmbedMarkup(
											videoUrl,
											isInVideoGallery
												? { controls: false }
												: undefined
										) }
									</div>
									<div
										className="pb-video-lightbox-info"
										style={ { flex: '0 0 30%' } }
									>
										{ title && (
											<h2 className="lightbox-title">
												{ title }
											</h2>
										) }
										{ description && (
											<p className="lightbox-description">
												{ description }
											</p>
										) }
									</div>
								</>
							) }

							{ applyFilters(
								'folioBlocks.pbVideoBlock.renderLightbox',
								null,
								{
									attributes,
									videoUrl,
									isInVideoGallery,
									lightboxLayout: effectiveLightboxLayout,
									enableWooCommerce,
									getVideoEmbedMarkup,
									title,
									description,
									__,
								}
							) }
						</div>
					</div>
				) }
			</div>
		</>
	);
}
