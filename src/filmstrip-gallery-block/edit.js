/**
 * Filmstrip Gallery Block
 * Edit JS
 */
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	MediaPlaceholder,
	BlockControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	Notice,
	SelectControl,
	ToolbarGroup,
	ToolbarButton,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { Icon, plus, fullscreen } from '@wordpress/icons';
import { decodeEntities } from '@wordpress/html-entities';
import { IconFilmstripGallery, IconPBSpinner } from '../pb-helpers/icons';
import './editor.scss';

const ALLOWED_BLOCKS = [ 'folioblocks/pb-image-block' ];

const getImageSrcForResolution = ( block, resolution ) =>
	block?.attributes?.sizes?.[ resolution ]?.url ||
	block?.attributes?.src ||
	'';

export default function Edit( { attributes, setAttributes, clientId } ) {
	const {
		preview,
		resolution = 'large',
		filmstripPosition = 'bottom',
		colorMode = 'light',
		autoplay = false,
		autoplaySpeed = 3,
		pauseOnHover = false,
		enableFullscreen = false,
	} = attributes;
	const checkoutUrl =
		window.folioBlocksData?.checkoutUrl ||
		'https://folioblocks.com/folioblocks-pricing/?utm_source=folioblocks&utm_medium=filmstrip-gallery-block&utm_campaign=upgrade';

	// Runtime override: if WooCommerce is not active, force Woo features off without mutating saved attributes
	const hasWooCommerce = window.folioBlocksData?.hasWooCommerce ?? false;
	const effectiveEnableWoo = hasWooCommerce
		? attributes.enableWooCommerce || false
		: false;
	useEffect( () => {
		const wooActive = window.folioBlocksData?.hasWooCommerce ?? false;
		if ( wooActive !== attributes.hasWooCommerce ) {
			setAttributes( { hasWooCommerce: wooActive } );
		}
	}, [ attributes.hasWooCommerce, setAttributes ] );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ activeIndex, setActiveIndex ] = useState( 0 );
	const thumbnailsRef = useRef( null );
	const { replaceInnerBlocks, updateBlockAttributes, selectBlock } =
		useDispatch( 'core/block-editor' );

	const innerBlocks = useSelect(
		( select ) => select( 'core/block-editor' ).getBlocks( clientId ),
		[ clientId ]
	);
	const availableImageSizes = useSelect(
		( select ) =>
			select( 'core/block-editor' ).getSettings()?.imageSizes || [],
		[]
	);
	const selectedBlockClientId = useSelect(
		( select ) => select( 'core/block-editor' ).getSelectedBlockClientId(),
		[]
	);
	const isBlockOrChildSelected = useSelect(
		( select ) => {
			const blockEditor = select( 'core/block-editor' );
			const selectedId = blockEditor.getSelectedBlockClientId();
			if ( ! selectedId ) {
				return false;
			}

			if ( selectedId === clientId ) {
				return true;
			}

			const selectedBlock = blockEditor.getBlock( selectedId );
			if ( ! selectedBlock ) {
				return false;
			}

			return (
				selectedBlock.name === 'folioblocks/pb-image-block' &&
				blockEditor.getBlockRootClientId( selectedId ) === clientId
			);
		},
		[ clientId ]
	);

	const { children, ...innerBlocksProps } = useInnerBlocksProps(
		{ className: 'pb-filmstrip-gallery-inner-blocks' },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			orientation: 'horizontal',
			renderAppender: false,
		}
	);

	useEffect( () => {
		setAttributes( {
			images: innerBlocks.map( ( block ) => ( {
				id: block.attributes.id,
				src: block.attributes.src,
				alt: block.attributes.alt,
				title: block.attributes.title,
				caption: block.attributes.caption,
				sizes: block.attributes.sizes,
				width: block.attributes.width,
				height: block.attributes.height,
			} ) ),
		} );
	}, [ innerBlocks, setAttributes ] );

	useEffect( () => {
		if ( innerBlocks.length === 0 ) {
			setActiveIndex( 0 );
			return;
		}
		if ( activeIndex > innerBlocks.length - 1 ) {
			setActiveIndex( innerBlocks.length - 1 );
		}
	}, [ activeIndex, innerBlocks.length ] );

	useEffect( () => {
		if ( ! selectedBlockClientId ) {
			return;
		}

		const selectedIndex = innerBlocks.findIndex(
			( block ) => block.clientId === selectedBlockClientId
		);

		if ( selectedIndex !== -1 ) {
			setActiveIndex( selectedIndex );
		}
	}, [ selectedBlockClientId, innerBlocks ] );

	useEffect( () => {
		const thumbnailsNode = thumbnailsRef.current;
		if ( ! thumbnailsNode ) {
			return;
		}

		const activeThumbnail = thumbnailsNode.querySelector(
			'.pb-filmstrip-gallery-thumb.is-active'
		);
		if ( activeThumbnail ) {
			activeThumbnail.scrollIntoView( {
				block: 'nearest',
				inline: 'nearest',
			} );
		}
	}, [ activeIndex, filmstripPosition ] );

	const [ isPlaying, setIsPlaying ] = useState( false );
	const [ isMainHovered, setIsMainHovered ] = useState( false );

	useEffect( () => {
		setIsPlaying( !! autoplay );
	}, [ autoplay ] );

	// Autoplay in editor: advance active preview image when enabled.
	useEffect( () => {
		if (
			! autoplay ||
			! isPlaying ||
			isLoading ||
			innerBlocks.length < 2 ||
			( pauseOnHover && isMainHovered )
		) {
			return;
		}

		const speedSeconds = Number( autoplaySpeed ) || 3;
		const intervalMs = Math.max( 0.25, speedSeconds ) * 1000;

		const timer = setInterval( () => {
			setActiveIndex(
				( current ) => ( current + 1 ) % innerBlocks.length
			);
		}, intervalMs );

		return () => clearInterval( timer );
	}, [
		autoplay,
		autoplaySpeed,
		innerBlocks.length,
		isLoading,
		isPlaying,
		pauseOnHover,
		isMainHovered,
	] );

	const setActiveImage = ( nextIndex, shouldSelect = false ) => {
		if ( innerBlocks.length === 0 ) {
			return;
		}

		const totalImages = innerBlocks.length;
		const normalizedIndex =
			( ( nextIndex % totalImages ) + totalImages ) % totalImages;

		setActiveIndex( normalizedIndex );

		if ( shouldSelect ) {
			const nextBlockClientId = innerBlocks[ normalizedIndex ]?.clientId;
			if ( nextBlockClientId ) {
				selectBlock( nextBlockClientId );
			}
		}
	};

	const onSelectImages = async ( media ) => {
		if ( ! media || media.length === 0 ) {
			return;
		}

		setIsLoading( true );

		const currentBlocks = wp.data
			.select( 'core/block-editor' )
			.getBlocks( clientId );
		const existingImageIds = currentBlocks.map(
			( block ) => block.attributes.id
		);
		const imagesToAdd = media.filter(
			( image ) => ! existingImageIds.includes( image.id )
		);

		if ( imagesToAdd.length === 0 ) {
			setIsLoading( false );
			return;
		}

		const imageIds = imagesToAdd.map( ( image ) => image.id );
		const titleMap = {};
		try {
			const responses = await wp.apiFetch( {
				path: `/wp/v2/media?include=${ imageIds.join(
					','
				) }&per_page=100`,
			} );

			responses.forEach( ( item ) => {
				titleMap[ item.id ] = decodeEntities(
					item.title?.rendered || ''
				);
			} );
		} catch ( error ) {
			// Fallback: use title data from selected media objects.
		}

		const newBlocks = imagesToAdd.map( ( image ) => {
			const fullSize = image.sizes?.full || {};
			const width = fullSize.width || image.width || 0;
			const height = fullSize.height || image.height || 0;
			const caption =
				typeof image.caption === 'string'
					? image.caption
					: image.caption?.raw || image.caption?.rendered || '';

			return wp.blocks.createBlock( 'folioblocks/pb-image-block', {
				id: image.id,
				src: image.url,
				alt: image.alt || '',
				title:
					titleMap[ image.id ] ||
					decodeEntities(
						image.title?.rendered || image.title || ''
					),
				caption,
				width,
				height,
				sizes: image.sizes || {},
			} );
		} );

		replaceInnerBlocks( clientId, [ ...currentBlocks, ...newBlocks ] );
		updateBlockAttributes( clientId, { _forceRefresh: Date.now() } );
		setActiveIndex( currentBlocks.length );
		setIsLoading( false );
	};

	const openMediaFrame = () => {
		wp.media( {
			title: __( 'Select Images', 'folioblocks' ),
			multiple: true,
			library: { type: 'image' },
			button: { text: __( 'Add to Gallery', 'folioblocks' ) },
		} )
			.on( 'select', () => {
				const selection = wp.media.frame
					.state()
					.get( 'selection' )
					.toJSON();
				onSelectImages( selection );
			} )
			.open();
	};

	const activeBlock = innerBlocks[ activeIndex ];
	const activeImageAttributes = activeBlock?.attributes || {};
	const activeImageSrc = getImageSrcForResolution( activeBlock, resolution );
	const activeImageSizes = activeBlock?.attributes?.sizes || {};
	const activeImageAlt =
		activeBlock?.attributes?.alt ||
		activeBlock?.attributes?.title ||
		__( 'Selected gallery image', 'folioblocks' );
	const activeImageTitle = String(
		activeBlock?.attributes?.title || ''
	).trim();
	const activeImageProductId = Number(
		activeImageAttributes.wooProductId || 0
	);
	const activeImageProductName = String(
		activeImageAttributes.wooProductName || ''
	).trim();
	const activeImageProductPrice = String(
		activeImageAttributes.wooProductPrice || ''
	).trim();
	const showOverlay =
		!! attributes.onHoverTitle &&
		( activeImageProductId > 0 || !! activeImageTitle );
	const showProductOverlay =
		showOverlay &&
		effectiveEnableWoo &&
		!! attributes.wooProductPriceOnHover &&
		activeImageProductId > 0;
	const hasMultipleImages = innerBlocks.length > 1;
	const showStripArrowsBottom =
		filmstripPosition === 'bottom' && hasMultipleImages;
	const showStripArrowsVertical =
		filmstripPosition !== 'bottom' && hasMultipleImages;
	const effectiveDownloadEnabled =
		!! attributes.enableDownload && ! effectiveEnableWoo;
	const downloadIconStyleVars = {
		...( attributes.downloadIconColor
			? { '--pb-download-icon-color': attributes.downloadIconColor }
			: {} ),
		...( attributes.downloadIconBgColor
			? { '--pb-download-icon-bg': attributes.downloadIconBgColor }
			: {} ),
	};
	const cartIconStyleVars = {
		...( attributes.cartIconColor
			? { '--pb-cart-icon-color': attributes.cartIconColor }
			: {} ),
		...( attributes.cartIconBgColor
			? { '--pb-cart-icon-bg': attributes.cartIconBgColor }
			: {} ),
	};
	const fallbackImageSizes = [
		{ name: __( 'Thumbnail', 'folioblocks' ), slug: 'thumbnail' },
		{ name: __( 'Medium', 'folioblocks' ), slug: 'medium' },
		{ name: __( 'Large', 'folioblocks' ), slug: 'large' },
		{ name: __( 'Full', 'folioblocks' ), slug: 'full' },
	];
	let imageSizeOptions = (
		availableImageSizes.length ? availableImageSizes : fallbackImageSizes
	)
		.map( ( size ) => ( {
			label: size?.name || size?.slug || '',
			value: size?.slug || '',
		} ) )
		.filter( ( option ) => option.value )
		.sort( ( a, b ) => {
			const order = [ 'thumbnail', 'medium', 'large', 'full' ];
			const indexA = order.indexOf( a.value );
			const indexB = order.indexOf( b.value );
			if ( indexA === -1 && indexB === -1 ) {
				return a.label.localeCompare( b.label );
			}
			if ( indexA === -1 ) {
				return 1;
			}
			if ( indexB === -1 ) {
				return -1;
			}
			return indexA - indexB;
		} );
	if ( ! imageSizeOptions.some( ( option ) => option.value === 'full' ) ) {
		imageSizeOptions = [
			...imageSizeOptions,
			{ label: __( 'Full', 'folioblocks' ), value: 'full' },
		];
	}

	const hasGalleryContent = innerBlocks.length > 0;
	const blockProps = useBlockProps( {
		className: hasGalleryContent
			? `pb-filmstrip-gallery is-${ filmstripPosition } is-theme-${ colorMode }`
			: 'pb-filmstrip-gallery is-editor-empty',
	} );

	applyFilters( 'folioBlocks.filmstripGallery.editorEnhancements', null, {
		clientId,
		innerBlocks,
		isBlockOrChildSelected,
		attributes,
		setAttributes,
	} );

	// Block Preview Image
	if ( preview ) {
		return (
			<div className="pb-block-preview">
				<IconFilmstripGallery />
			</div>
		);
	}

	let editorContent;
	if ( isLoading ) {
		editorContent = (
			<div className="pb-spinner-wrapper">
				<IconPBSpinner />
			</div>
		);
	} else if ( innerBlocks.length === 0 ) {
		editorContent = (
			<MediaPlaceholder
				icon={ <IconFilmstripGallery /> }
				labels={ {
					title: __( 'Filmstrip Gallery', 'folioblocks' ),
					instructions: __(
						'Upload or select images to create a Filmstrip Gallery.',
						'folioblocks'
					),
				} }
				onSelect={ onSelectImages }
				allowedTypes={ [ 'image' ] }
				multiple
			/>
		);
	} else {
		editorContent = (
			<div
				className={ `pb-filmstrip-gallery-preview is-${ filmstripPosition }` }
			>
				<div
					className={ `pb-filmstrip-gallery-main ${
						effectiveDownloadEnabled ? 'has-download' : ''
					}` }
					onMouseEnter={ () => setIsMainHovered( true ) }
					onMouseLeave={ () => setIsMainHovered( false ) }
				>
					{ hasMultipleImages && (
						<>
							<button
								type="button"
								className="pb-filmstrip-gallery-nav pb-filmstrip-gallery-nav-prev"
								onClick={ () =>
									setActiveImage( activeIndex - 1, true )
								}
								aria-label={ __(
									'Previous image',
									'folioblocks'
								) }
							>
								&#8249;
							</button>
							<button
								type="button"
								className="pb-filmstrip-gallery-nav pb-filmstrip-gallery-nav-next"
								onClick={ () =>
									setActiveImage( activeIndex + 1, true )
								}
								aria-label={ __( 'Next image', 'folioblocks' ) }
							>
								&#8250;
							</button>
						</>
					) }
					{ ( autoplay || enableFullscreen ) && (
						<div className="pb-filmstrip-gallery-bottom-controls">
							{ autoplay && (
								<button
									type="button"
									className="pb-filmstrip-gallery-autoplay-button"
									onClick={ () =>
										setIsPlaying( ( prev ) => ! prev )
									}
									aria-label={
										isPlaying
											? __(
													'Pause autoplay',
													'folioblocks'
											  )
											: __(
													'Play autoplay',
													'folioblocks'
											  )
									}
								>
									{ isPlaying ? (
										<svg
											viewBox="0 0 24 24"
											width="16"
											height="16"
											fill="currentColor"
											aria-hidden="true"
										>
											<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
										</svg>
									) : (
										<svg
											viewBox="0 0 24 24"
											width="16"
											height="16"
											fill="currentColor"
											aria-hidden="true"
										>
											<path d="M8 5v14l11-7z" />
										</svg>
									) }
								</button>
							) }
							{ enableFullscreen && (
								<button
									type="button"
									className="pb-filmstrip-gallery-fullscreen-button"
									onClick={ ( event ) =>
										event.preventDefault()
									}
									aria-label={ __(
										'Open Fullscreen',
										'folioblocks'
									) }
								>
									<Icon icon={ fullscreen } size={ 16 } />
								</button>
							) }
						</div>
					) }
					{ applyFilters(
						'folioBlocks.imageBlock.downloadButton',
						null,
						{
							attributes: activeImageAttributes,
							setAttributes: () => {},
							effectiveDownloadEnabled,
							effectiveDownloadOnHover:
								attributes.downloadOnHover ?? true,
							sizes: activeImageSizes,
							src: activeImageSrc,
							context: {
								'folioBlocks/enableDownload':
									attributes.enableDownload,
								'folioBlocks/downloadOnHover':
									attributes.downloadOnHover ?? true,
							},
							isInsideGallery: true,
							downloadIconStyleVars,
							effectiveDownloadIconColor:
								attributes.downloadIconColor ?? '',
							effectiveDownloadIconBgColor:
								attributes.downloadIconBgColor ?? '',
						}
					) }
					{ applyFilters(
						'folioBlocks.imageBlock.addToCartButton',
						null,
						{
							attributes: activeImageAttributes,
							setAttributes: () => {},
							effectiveWooActive: effectiveEnableWoo,
							context: {
								'folioBlocks/wooCartIconDisplay':
									attributes.wooCartIconDisplay,
								'folioBlocks/wooDefaultLinkAction':
									attributes.wooDefaultLinkAction,
							},
							isInsideGallery: true,
							cartIconStyleVars,
							effectiveCartIconColor:
								attributes.cartIconColor ?? '',
							effectiveCartIconBgColor:
								attributes.cartIconBgColor ?? '',
						}
					) }

					{ activeImageSrc ? (
						<img src={ activeImageSrc } alt={ activeImageAlt } />
					) : (
						<div className="pb-filmstrip-gallery-main-empty">
							{ __(
								'Select an image to preview it.',
								'folioblocks'
							) }
						</div>
					) }
					{ showOverlay && (
						<div className="pb-filmstrip-gallery-main-overlay-container">
							<div className="pb-filmstrip-gallery-main-overlay">
								{ showProductOverlay ? (
									<>
										{ activeImageProductName && (
											<div className="pb-product-name">
												{ activeImageProductName }
											</div>
										) }
										{ activeImageProductPrice && (
											<div
												className="pb-product-price"
												dangerouslySetInnerHTML={ {
													__html: activeImageProductPrice,
												} }
											/>
										) }
										{ ! activeImageProductName &&
											! activeImageProductPrice &&
											activeImageTitle }
									</>
								) : (
									activeImageTitle
								) }
							</div>
						</div>
					) }
				</div>

				<div className="pb-filmstrip-gallery-thumbnails-wrapper">
					{ showStripArrowsBottom && (
						<button
							type="button"
							className="pb-filmstrip-gallery-strip-nav"
							onClick={ () =>
								setActiveImage( activeIndex - 1, true )
							}
							aria-label={ __(
								'Previous thumbnail',
								'folioblocks'
							) }
						>
							&#8249;
						</button>
					) }
					{ showStripArrowsVertical && (
						<button
							type="button"
							className="pb-filmstrip-gallery-strip-nav is-vertical"
							onClick={ () =>
								setActiveImage( activeIndex - 1, true )
							}
							aria-label={ __(
								'Previous thumbnail',
								'folioblocks'
							) }
						>
							&#9650;
						</button>
					) }
					<div
						ref={ thumbnailsRef }
						className="pb-filmstrip-gallery-thumbnails"
						role="tablist"
						aria-label={ __(
							'Filmstrip thumbnails',
							'folioblocks'
						) }
					>
						{ innerBlocks.map( ( block, index ) => {
							const thumbnailSrc = getImageSrcForResolution(
								block,
								'thumbnail'
							);
							const fallbackSrc = getImageSrcForResolution(
								block,
								resolution
							);
							const src = thumbnailSrc || fallbackSrc;
							const isActive = index === activeIndex;

							return (
								<button
									key={ block.clientId }
									type="button"
									role="tab"
									aria-selected={ isActive }
									className={ `pb-filmstrip-gallery-thumb ${
										isActive ? 'is-active' : ''
									}` }
									onClick={ () =>
										setActiveImage( index, true )
									}
								>
									{ src ? (
										<img
											src={ src }
											alt={
												block.attributes.alt ||
												block.attributes.title ||
												__(
													'Gallery thumbnail',
													'folioblocks'
												)
											}
										/>
									) : (
										<span>{ index + 1 }</span>
									) }
								</button>
							);
						} ) }
					</div>
					{ showStripArrowsBottom && (
						<button
							type="button"
							className="pb-filmstrip-gallery-strip-nav"
							onClick={ () =>
								setActiveImage( activeIndex + 1, true )
							}
							aria-label={ __( 'Next thumbnail', 'folioblocks' ) }
						>
							&#8250;
						</button>
					) }
					{ showStripArrowsVertical && (
						<button
							type="button"
							className="pb-filmstrip-gallery-strip-nav is-vertical"
							onClick={ () =>
								setActiveImage( activeIndex + 1, true )
							}
							aria-label={ __( 'Next thumbnail', 'folioblocks' ) }
						>
							&#9660;
						</button>
					) }
				</div>

				<div { ...innerBlocksProps } aria-hidden="true">
					{ children }
				</div>
			</div>
		);
	}

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={ plus }
						label={ __( 'Add Images', 'folioblocks' ) }
						onClick={ openMediaFrame }
					>
						{ __( 'Add Images', 'folioblocks' ) }
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				<PanelBody
					title={ __( 'Filmstrip Gallery Settings', 'folioblocks' ) }
					initialOpen={ true }
				>
					<SelectControl
						label={ __( 'Main Image Resolution', 'folioblocks' ) }
						value={ resolution }
						options={ imageSizeOptions }
						onChange={ ( newResolution ) => {
							setAttributes( { resolution: newResolution } );
							innerBlocks.forEach( ( block ) => {
								updateBlockAttributes( block.clientId, {
									src: getImageSrcForResolution(
										block,
										newResolution
									),
									imageSize: newResolution,
								} );
							} );
						} }
						help={ __(
							'Select the size of the main gallery image.',
							'folioblocks'
						) }
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>

					{ applyFilters(
						'folioBlocks.filmstripGallery.enableAutoplayToggle',
						<div style={ { marginBottom: '8px' } }>
							<Notice status="info" isDismissible={ false }>
								<strong>
									{ __( 'Enable Autoplay', 'folioblocks' ) }
								</strong>
								<br />
								{ __(
									'This is a premium feature. Unlock all features: ',
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
					<SelectControl
						label={ __( 'Thumbnail Position', 'folioblocks' ) }
						value={ filmstripPosition }
						options={ [
							{
								label: __( 'Bottom', 'folioblocks' ),
								value: 'bottom',
							},
							{
								label: __( 'Left', 'folioblocks' ),
								value: 'left',
							},
							{
								label: __( 'Right', 'folioblocks' ),
								value: 'right',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { filmstripPosition: value } )
						}
						help={ __(
							'Choose where the thumbnail strip appears.',
							'folioblocks'
						) }
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					{ applyFilters(
						'folioBlocks.filmstripGallery.enableFullscreenToggle',
						<div style={ { marginBottom: '8px' } }>
							<Notice status="info" isDismissible={ false }>
								<strong>
									{ __(
										'Enable Full-Screen Mode',
										'folioblocks'
									) }
								</strong>
								<br />
								{ __(
									'This is a premium feature. Unlock all features: ',
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
				</PanelBody>
				<PanelBody
					title={ __( 'Hover Overlay Settings', 'folioblocks' ) }
					initialOpen={ true }
				>
					{ applyFilters(
						'folioBlocks.filmstripGallery.onHoverTitleToggle',
						<div style={ { marginBottom: '8px' } }>
							<Notice status="info" isDismissible={ false }>
								<strong>
									{ __(
										'Show Image Title on Hover',
										'folioblocks'
									) }
								</strong>
								<br />
								{ __(
									'This is a premium feature. Unlock all features: ',
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
				</PanelBody>
				<PanelBody
					title={ __( 'E-Commerce Settings', 'folioblocks' ) }
					initialOpen={ true }
				>
					{ applyFilters(
						'folioBlocks.filmstripGallery.downloadControls',
						<div style={ { marginBottom: '8px' } }>
							<Notice status="info" isDismissible={ false }>
								<strong>
									{ __(
										'Enable Image Downloads',
										'folioblocks'
									) }
								</strong>
								<br />
								{ __(
									'This is a premium feature. Unlock all features: ',
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
						{
							attributes,
							setAttributes,
							hasWooCommerce,
							effectiveEnableWoo,
						}
					) }
					{ window.folioBlocksData?.hasWooCommerce &&
						applyFilters(
							'folioBlocks.filmstripGallery.wooCommerceControls',
							<div style={ { marginBottom: '8px' } }>
								<Notice status="info" isDismissible={ false }>
									<strong>
										{ __(
											'Enable Woo Commerce',
											'folioblocks'
										) }
									</strong>
									<br />
									{ __(
										'This is a premium feature. Unlock all features: ',
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
								hasWooCommerce,
								effectiveEnableWoo,
							}
						) }
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="advanced">
				{ applyFilters(
					'folioBlocks.filmstripGallery.disableRightClickToggle',
					<div style={ { marginBottom: '8px' } }>
						<Notice status="info" isDismissible={ false }>
							<strong>
								{ __( 'Disable Right-Click', 'folioblocks' ) }
							</strong>
							<br />
							{ __(
								'This is a premium feature. Unlock all features: ',
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
					'folioBlocks.filmstripGallery.lazyLoadToggle',
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
								'This is a premium feature. Unlock all features: ',
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
			<InspectorControls group="styles">
				<PanelBody
					title={ __( 'Gallery Styles', 'folioblocks' ) }
					initialOpen={ true }
				>
					{ applyFilters(
						'folioBlocks.filmstripGallery.colorModeControl',
						<div style={ { marginBottom: '8px' } }>
							<Notice status="info" isDismissible={ false }>
								<strong>
									{ __( 'Color Mode', 'folioblocks' ) }
								</strong>
								<br />
								{ __(
									'This is a premium feature. Unlock all features: ',
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
						{
							attributes,
							setAttributes,
						}
					) }
				</PanelBody>
				{ applyFilters(
					'folioBlocks.filmstripGallery.iconStyleControls',
					null,
					{
						attributes,
						setAttributes,
					}
				) }
			</InspectorControls>

			<div { ...blockProps }>{ editorContent }</div>
		</>
	);
}
