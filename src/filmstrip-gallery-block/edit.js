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
import {
	Icon,
	aspectRatio,
	capturePhoto,
	plus,
	fullscreen,
	timeToRead,
} from '@wordpress/icons';
import { decodeEntities } from '@wordpress/html-entities';
import { IconFilmstripGallery, IconPBSpinner } from '../pb-helpers/icons';
import { getExifAttributesFromMedia } from '../pb-helpers/exifMetadata';
import { getImageSizeOptions } from '../pb-helpers/imageSizeOptions';
import './editor.scss';

const ALLOWED_BLOCKS = [ 'folioblocks/pb-image-block' ];

const isCustomIconColor = ( value, defaultValue ) =>
	!! value && value.trim().toLowerCase() !== defaultValue;

const apertureIcon = (
	<svg viewBox="-16 -16 495 495" aria-hidden="true" focusable="false">
		<path
			fill="currentColor"
			d="M395.195,67.805C351.47,24.08,293.335,0,231.5,0S111.529,24.08,67.805,67.805S0,169.664,0,231.5S24.08,351.47,67.805,395.195S169.664,463,231.5,463s119.971-24.08,163.695-67.805S463,293.335,463,231.5S438.919,111.529,395.195,67.805z M443.392,186.803c-0.321,0.232-0.631,0.484-0.92,0.772l-79.886,79.886V59.168c7.689,5.873,15.045,12.285,22.002,19.243C414.732,108.555,434.877,146.025,443.392,186.803z M188.262,347.586l-72.848-72.848v-94.2l65.124-65.124h94.2l72.848,72.848v94.201l-65.124,65.124H188.262z M347.586,48.671v118.378L198.094,17.557C209.049,15.871,220.207,15,231.5,15C273.258,15,313.208,26.748,347.586,48.671z M78.411,78.411c28.553-28.552,63.68-48.134,101.964-57.36l79.362,79.362H59.168C65.042,92.725,71.454,85.369,78.411,78.411z M48.67,115.414h110.654L16.613,258.126C15.544,249.358,15,240.471,15,231.5C15,189.741,26.748,149.791,48.67,115.414z M19.607,276.196c0.321-0.232,0.631-0.484,0.92-0.772l79.886-79.886v208.294c-7.688-5.873-15.045-12.285-22.002-19.243C48.268,354.445,28.123,316.974,19.607,276.196z M115.414,414.329V295.951l149.491,149.491C253.951,447.129,242.792,448,231.5,448C189.741,448,149.791,436.252,115.414,414.329z M384.588,384.588c-28.553,28.552-63.68,48.134-101.965,57.36l-79.362-79.362h200.569C397.958,370.275,391.546,377.631,384.588,384.588z M414.329,347.586H303.675l142.712-142.712c1.068,8.767,1.613,17.655,1.613,26.626C448,273.258,436.252,313.208,414.329,347.586z"
		/>
	</svg>
);

const FilmstripExifOverlay = ( { attributes } ) => {
	const unknownValue = __( 'Unknown', 'folioblocks' );
	const fields = [
		{ icon: capturePhoto, value: attributes.exifCamera || unknownValue },
		{ icon: aspectRatio, value: attributes.exifFocalLength || unknownValue },
		{ icon: timeToRead, value: attributes.exifShutterSpeed || unknownValue },
		{ icon: apertureIcon, value: attributes.exifAperture || unknownValue },
		{ icon: 'iso', value: attributes.exifIso || unknownValue },
	];

	return (
		<div className="pb-filmstrip-gallery-exif">
			{ fields.map( ( field, index ) => (
				<span className="pb-filmstrip-gallery-exif__item" key={ index }>
					<span className="pb-filmstrip-gallery-exif__icon">
						{ field.icon === 'iso' ? (
							<span className="pb-filmstrip-gallery-exif-icon__iso">
								ISO
							</span>
						) : (
							<Icon icon={ field.icon } size={ 18 } />
						) }
					</span>
					<span className="pb-filmstrip-gallery-exif__value">
						{ field.value }
					</span>
				</span>
			) ) }
		</div>
	);
};

const getImageClickAction = ( {
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
	return 'none';
};

const getImageClickAttributes = ( value ) => {
	switch ( value ) {
		case 'download':
			return {
				imageClickAction: 'download',
				imageClickTarget: 'icon',
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
				enableDownload: false,
				enableWooCommerce: false,
			};
		case 'custom_url':
			return {
				imageClickAction: 'custom_url',
				imageClickTarget: 'icon',
				enableDownload: false,
				enableWooCommerce: false,
			};
		case 'page_post':
			return {
				imageClickAction: 'page_post',
				imageClickTarget: 'icon',
				enableDownload: false,
				enableWooCommerce: false,
			};
		case 'none':
		default:
			return {
				imageClickAction: 'none',
				enableDownload: false,
				enableWooCommerce: false,
			};
	}
};

const getImageClickHelp = ( value ) => {
	switch ( value ) {
		case 'woocommerce':
			return __(
				'Choose WooCommerce products from the individual Image Block settings.',
				'folioblocks'
			);
		case 'custom_url':
			return __(
				'Add custom URLs from the individual Image Block settings.',
				'folioblocks'
			);
		case 'page_post':
			return __(
				'Choose pages or posts from the individual Image Block settings.',
				'folioblocks'
			);
		default:
			return __(
				'Choose what happens when visitors click gallery images.',
				'folioblocks'
			);
	}
};

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
		// Avoid pulling the editor viewport back to this block while working elsewhere.
		if ( ! isBlockOrChildSelected ) {
			return;
		}

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
	}, [ activeIndex, filmstripPosition, isBlockOrChildSelected ] );

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
			const mediaMap = {};
			try {
				const responses = await wp.apiFetch( {
				path: `/wp/v2/media?include=${ imageIds.join(
					','
				) }&per_page=100`,
			} );

				responses.forEach( ( item ) => {
					mediaMap[ item.id ] = item;
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
					...( getExifAttributesFromMedia(
						mediaMap[ image.id ] || image
					) || {} ),
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
	const activeImageCaption = String(
		activeBlock?.attributes?.caption || ''
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
	const overlayContent =
		attributes.overlayContent ||
		( attributes.wooProductPriceOnHover ? 'product' : 'title' );
		const showOverlay =
			!! attributes.onHoverTitle &&
			( activeImageProductId > 0 ||
				!! activeImageTitle ||
				!! activeImageCaption ||
				overlayContent === 'exif' );
	const showProductOverlay =
		showOverlay &&
		effectiveEnableWoo &&
		overlayContent === 'product' &&
		activeImageProductId > 0;
		const showCaptionOverlay = overlayContent === 'caption';
		const showExifOverlay = overlayContent === 'exif';
	const hasMultipleImages = innerBlocks.length > 1;
	const showStripArrowsBottom =
		filmstripPosition === 'bottom' && hasMultipleImages;
	const showStripArrowsVertical =
		filmstripPosition !== 'bottom' && hasMultipleImages;
	const effectiveDownloadEnabled =
		!! attributes.enableDownload && ! effectiveEnableWoo;
	const downloadIconStyleVars = {
		...( isCustomIconColor( attributes.downloadIconColor, '#000000' )
			? { '--pb-download-icon-color': attributes.downloadIconColor }
			: {} ),
		...( isCustomIconColor( attributes.downloadIconBgColor, '#ffffff' )
			? { '--pb-download-icon-bg': attributes.downloadIconBgColor }
			: {} ),
	};
	const cartIconStyleVars = {
		...( isCustomIconColor( attributes.cartIconColor, '#000000' )
			? { '--pb-cart-icon-color': attributes.cartIconColor }
			: {} ),
		...( isCustomIconColor( attributes.cartIconBgColor, '#ffffff' )
			? { '--pb-cart-icon-bg': attributes.cartIconBgColor }
			: {} ),
	};
	const imageSizeOptions = getImageSizeOptions( availableImageSizes, __ );
	const imageClickAction = getImageClickAction( {
		enableDownload: attributes.enableDownload,
		enableWooCommerce: effectiveEnableWoo,
		imageClickAction: attributes.imageClickAction,
	} );
	const imageClickActionOptions = applyFilters(
		'folioBlocks.filmstripGallery.imageClickActionOptions',
		[ { label: __( 'None', 'folioblocks' ), value: 'none' } ],
		{ attributes, hasWooCommerce }
	);
	const activeImageClickAction = imageClickActionOptions.some(
		( option ) => option.value === imageClickAction
	)
		? imageClickAction
		: 'none';

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
		replaceInnerBlocks,
		setActiveIndex,
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
									) : showExifOverlay ? (
										<FilmstripExifOverlay
											attributes={ activeImageAttributes }
										/>
									) : showCaptionOverlay &&
									  activeImageCaption ? (
									<span
										dangerouslySetInnerHTML={ {
											__html: activeImageCaption,
										} }
									/>
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
					{ applyFilters(
						'folioBlocks.filmstripGallery.randomizeOrderToggle',
						<div style={ { marginBottom: '8px' } }>
							<Notice status="info" isDismissible={ false }>
								<strong>
									{ __(
										'Randomize Image Order',
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
				<PanelBody
					title={ __( 'Image Click Settings', 'folioblocks' ) }
					initialOpen={ true }
				>
					<SelectControl
						label={ __( 'Image Click Behavior', 'folioblocks' ) }
						value={ activeImageClickAction }
						options={ imageClickActionOptions }
						onChange={ ( value ) =>
							setAttributes( getImageClickAttributes( value ) )
						}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={ __(
							'Choose what happens when visitors click gallery images.',
							'folioblocks'
						) }
					/>
					{ applyFilters(
						'folioBlocks.filmstripGallery.imageClickActionNotice',
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
					{ activeImageClickAction === 'download' &&
						applyFilters(
							'folioBlocks.filmstripGallery.downloadControls',
							null,
							{
								attributes,
								setAttributes,
								hasWooCommerce,
								effectiveEnableWoo,
							}
						) }
					{ ( activeImageClickAction === 'custom_url' ||
						activeImageClickAction === 'page_post' ) &&
						applyFilters(
							'folioBlocks.filmstripGallery.linkTargetControls',
							null,
							{
								attributes,
								setAttributes,
								imageClickAction: activeImageClickAction,
								showLightboxControls: false,
							}
						) }
					{ window.folioBlocksData?.hasWooCommerce &&
						activeImageClickAction === 'woocommerce' &&
						applyFilters(
							'folioBlocks.filmstripGallery.wooCommerceControls',
							null,
							{
								attributes,
								setAttributes,
								hasWooCommerce,
								effectiveEnableWoo,
								imageClickAction: activeImageClickAction,
							}
						) }
				</PanelBody>
				<PanelBody
					title={ __( 'Custom Hover Overlays', 'folioblocks' ) }
					initialOpen={ true }
				>
					{ applyFilters(
						'folioBlocks.filmstripGallery.onHoverTitleToggle',
						<div style={ { marginBottom: '8px' } }>
							<Notice status="info" isDismissible={ false }>
								<strong>
									{ __( 'Custom Hover Overlays', 'folioblocks' ) }
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
