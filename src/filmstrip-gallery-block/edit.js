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
import { imageProFeatureNotice } from '../pb-helpers/imageProFeatureNotices';
import { getOverlayTypographyCSS } from '../pb-helpers/overlayTypographyControls';
import { getTiltHoverHandlers } from '../pb-helpers/tiltHoverEffect';
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

const FilmstripExifOverlay = ( { attributes, hideUnknownFields = false } ) => {
	const unknownValue = __( 'Unknown', 'folioblocks' );
	const isUnknownValue = ( value ) => {
		const normalizedValue = String( value || '' )
			.trim()
			.toLowerCase();
		return (
			! normalizedValue ||
			normalizedValue === 'unknown' ||
			normalizedValue === unknownValue.trim().toLowerCase()
		);
	};
	const fields = [
		{ icon: capturePhoto, value: attributes.exifCamera },
		{ icon: aspectRatio, value: attributes.exifFocalLength },
		{ icon: timeToRead, value: attributes.exifShutterSpeed },
		{ icon: apertureIcon, value: attributes.exifAperture },
		{ icon: 'iso', value: attributes.exifIso },
	]
		.filter(
			( field ) => ! hideUnknownFields || ! isUnknownValue( field.value )
		)
		.map( ( field ) => ( {
			...field,
			value: field.value || unknownValue,
		} ) );

	return (
		<div className="pb-hover-exif">
			{ fields.map( ( field, index ) => (
				<span className="pb-hover-exif__item" key={ index }>
					<span className="pb-hover-exif__icon">
						{ field.icon === 'iso' ? (
							<span className="pb-hover-exif-icon__iso">
								ISO
							</span>
						) : (
							<Icon icon={ field.icon } size={ 18 } />
						) }
					</span>
					<span className="pb-hover-exif__value">
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
		case 'lightbox':
			return {
				imageClickAction: 'lightbox',
				imageClickTarget: 'icon',
				lightbox: true,
				enableDownload: false,
				enableWooCommerce: false,
			};
		case 'download':
			return {
				imageClickAction: 'download',
				imageClickTarget: 'icon',
				lightbox: false,
				enableDownload: true,
				enableWooCommerce: false,
			};
		case 'woocommerce':
			return {
				imageClickAction: 'woocommerce',
				imageClickTarget: 'icon',
				lightbox: false,
				enableDownload: false,
				enableWooCommerce: true,
			};
		case 'media_file':
			return {
				imageClickAction: 'media_file',
				lightbox: false,
				enableDownload: false,
				enableWooCommerce: false,
			};
		case 'custom_url':
			return {
				imageClickAction: 'custom_url',
				imageClickTarget: 'icon',
				lightbox: false,
				enableDownload: false,
				enableWooCommerce: false,
			};
		case 'page_post':
			return {
				imageClickAction: 'page_post',
				imageClickTarget: 'icon',
				lightbox: false,
				enableDownload: false,
				enableWooCommerce: false,
			};
		case 'none':
		default:
			return {
				imageClickAction: 'none',
				lightbox: false,
				enableDownload: false,
				enableWooCommerce: false,
			};
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
	const [ loadedImageAspectRatio, setLoadedImageAspectRatio ] =
		useState( null );
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
	const activeImageAspectRatio =
		loadedImageAspectRatio ||
		( Number( activeImageAttributes.width ) > 0 &&
		Number( activeImageAttributes.height ) > 0
			? Number( activeImageAttributes.width ) /
			  Number( activeImageAttributes.height )
			: 1 );
	useEffect( () => {
		setLoadedImageAspectRatio( null );
	}, [ activeImageSrc ] );
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
	const overrideGalleryHoverSettings =
		!! activeImageAttributes.overrideGalleryHoverSettings;
	const effectiveHoverAttributes = overrideGalleryHoverSettings
		? activeImageAttributes
		: attributes;
	const effectiveHoverEnabled =
		effectiveHoverAttributes.showTitleOnHover ??
		effectiveHoverAttributes.hoverTitle ??
		effectiveHoverAttributes.onHoverTitle ??
		false;
	const effectiveHoverWooActive = overrideGalleryHoverSettings
		? hasWooCommerce &&
		  !! activeImageAttributes.enableWooCommerce &&
		  ( ! activeImageAttributes.imageClickAction ||
				activeImageAttributes.imageClickAction === 'woocommerce' )
		: effectiveEnableWoo;
	const overlayContent =
		effectiveHoverAttributes.overlayContent ||
		( effectiveHoverAttributes.wooProductPriceOnHover
			? 'product'
			: 'title' );
	const effectiveOverlayContent =
		overlayContent === 'product' && ! effectiveHoverWooActive
			? 'title'
			: overlayContent;
	const showOverlay =
		!! effectiveHoverEnabled &&
		( effectiveOverlayContent === 'product'
			? effectiveHoverWooActive && activeImageProductId > 0
			: effectiveOverlayContent === 'caption'
			? !! activeImageCaption
			: effectiveOverlayContent === 'exif'
			? true
			: !! activeImageTitle );
	const showProductOverlay =
		showOverlay &&
		effectiveHoverWooActive &&
		effectiveOverlayContent === 'product' &&
		activeImageProductId > 0;
	const showCaptionOverlay = effectiveOverlayContent === 'caption';
	const showExifOverlay = effectiveOverlayContent === 'exif';
	const hoverClassMap = {
		'blur-overlay': 'pb-hover-blur-overlay',
		'fade-overlay': 'pb-hover-fade-overlay',
		'gradient-bottom': 'pb-hover-gradient-bottom',
		chip: 'pb-hover-chip',
		'color-overlay': 'pb-hover-color-overlay',
		'gradient-overlay': 'pb-hover-gradient-overlay',
	};
	const hoverVariantClass =
		hoverClassMap[ effectiveHoverAttributes.onHoverStyle ] ||
		'pb-hover-blur-overlay';
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
	const hoverEffectClass =
		hoverEffectClassMap[ effectiveHoverAttributes.hoverEffect ] || '';
	const tiltHoverHandlers =
		effectiveHoverAttributes.hoverEffect === 'tilt'
			? getTiltHoverHandlers()
			: {};
	const overlayEntranceClassMap = {
		fade: 'pb-overlay-enter-fade',
		'slide-up': 'pb-overlay-enter-slide-up',
		'slide-down': 'pb-overlay-enter-slide-down',
		'slide-left': 'pb-overlay-enter-slide-left',
		'slide-right': 'pb-overlay-enter-slide-right',
	};
	const overlayEntranceClass =
		overlayEntranceClassMap[ effectiveHoverAttributes.overlayEntrance ] ||
		'';
	const hoverStyleVars =
		effectiveHoverAttributes.onHoverStyle === 'color-overlay' ||
		effectiveHoverAttributes.onHoverStyle === 'gradient-overlay'
			? {
					'--pb-overlay-bg':
						effectiveHoverAttributes.onHoverStyle ===
						'gradient-overlay'
							? effectiveHoverAttributes.overlayBgGradient ||
							  'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(226,232,240,0.82) 100%)'
							: effectiveHoverAttributes.overlayBgColor ||
							  '#f9f9f9',
					'--pb-overlay-color':
						effectiveHoverAttributes.overlayTextColor || '#000000',
			  }
			: effectiveHoverAttributes.onHoverStyle === 'chip'
			? {
					'--pb-chip-overlay-bg':
						effectiveHoverAttributes.chipOverlayBgColor ||
						'#f9f9f9',
					'--pb-chip-overlay-color':
						effectiveHoverAttributes.chipOverlayTextColor ||
						'#000000',
			  }
			: {};
	const overlayTypographyVars = getOverlayTypographyCSS(
		effectiveHoverAttributes
	);
	const hasMultipleImages = innerBlocks.length > 1;
	const showStripArrowsBottom =
		filmstripPosition === 'bottom' && hasMultipleImages;
	const showStripArrowsVertical =
		filmstripPosition !== 'bottom' && hasMultipleImages;
	const overrideGalleryClickSettings =
		!! activeImageAttributes.overrideGalleryClickSettings;
	const effectiveClickAttributes = overrideGalleryClickSettings
		? activeImageAttributes
		: attributes;
	const effectiveClickAction = getImageClickAction( {
		enableDownload: effectiveClickAttributes.enableDownload,
		enableWooCommerce:
			hasWooCommerce && !! effectiveClickAttributes.enableWooCommerce,
		imageClickAction: effectiveClickAttributes.imageClickAction,
	} );
	const effectiveClickWoo =
		hasWooCommerce &&
		!! effectiveClickAttributes.enableWooCommerce &&
		effectiveClickAction === 'woocommerce';
	const effectiveDownloadEnabled =
		!! effectiveClickAttributes.enableDownload &&
		! effectiveClickWoo &&
		( effectiveClickAttributes.imageClickTarget || 'icon' ) === 'icon';
	const downloadIconStyleVars = {
		...( isCustomIconColor(
			effectiveClickAttributes.downloadIconColor,
			'#000000'
		)
			? {
					'--pb-download-icon-color':
						effectiveClickAttributes.downloadIconColor,
			  }
			: {} ),
		...( isCustomIconColor(
			effectiveClickAttributes.downloadIconBgColor,
			'#ffffff'
		)
			? {
					'--pb-download-icon-bg':
						effectiveClickAttributes.downloadIconBgColor,
			  }
			: {} ),
	};
	const cartIconStyleVars = {
		...( isCustomIconColor(
			effectiveClickAttributes.cartIconColor,
			'#000000'
		)
			? { '--pb-cart-icon-color': effectiveClickAttributes.cartIconColor }
			: {} ),
		...( isCustomIconColor(
			effectiveClickAttributes.cartIconBgColor,
			'#ffffff'
		)
			? {
					'--pb-cart-icon-bg':
						effectiveClickAttributes.cartIconBgColor,
			  }
			: {} ),
	};
	const linkIconStyleVars = {
		...( isCustomIconColor(
			effectiveClickAttributes.linkIconColor,
			'#000000'
		)
			? { '--pb-link-icon-color': effectiveClickAttributes.linkIconColor }
			: {} ),
		...( isCustomIconColor(
			effectiveClickAttributes.linkIconBgColor,
			'#ffffff'
		)
			? {
					'--pb-link-icon-bg':
						effectiveClickAttributes.linkIconBgColor,
			  }
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
						<div
							{ ...tiltHoverHandlers }
							className={ `pb-filmstrip-gallery-main-media pb-image-block ${
								showOverlay ? hoverVariantClass : ''
							} ${ showOverlay ? overlayEntranceClass : '' } ${ hoverEffectClass }` }
							style={ {
								'--pb-filmstrip-image-ratio':
									activeImageAspectRatio,
								...hoverStyleVars,
								...overlayTypographyVars,
							} }
						>
						{ applyFilters(
							'folioBlocks.imageBlock.downloadButton',
						null,
						{
							attributes: activeImageAttributes,
							setAttributes: () => {},
							effectiveDownloadEnabled,
							effectiveDownloadOnHover:
								effectiveClickAttributes.downloadOnHover ?? true,
							sizes: activeImageSizes,
							src: activeImageSrc,
							context: {
								'folioBlocks/enableDownload':
									effectiveClickAttributes.enableDownload,
								'folioBlocks/downloadOnHover':
									effectiveClickAttributes.downloadOnHover ??
									true,
							},
							isInsideGallery: true,
							downloadIconStyleVars,
							effectiveDownloadIconColor:
								effectiveClickAttributes.downloadIconColor ?? '',
							effectiveDownloadIconBgColor:
								effectiveClickAttributes.downloadIconBgColor ??
								'',
						}
					) }
					{ applyFilters(
						'folioBlocks.imageBlock.addToCartButton',
						null,
						{
							attributes: activeImageAttributes,
							setAttributes: () => {},
							effectiveWooActive: effectiveClickWoo,
							context: {
								'folioBlocks/wooCartIconDisplay':
									effectiveClickAttributes.wooCartIconDisplay,
								'folioBlocks/wooDefaultLinkAction':
									effectiveClickAttributes.wooDefaultLinkAction,
							},
							isInsideGallery: true,
							cartIconStyleVars,
							effectiveCartIconColor:
								effectiveClickAttributes.cartIconColor ?? '',
							effectiveCartIconBgColor:
								effectiveClickAttributes.cartIconBgColor ?? '',
						}
					) }
						{ [ 'custom_url', 'page_post' ].includes(
							effectiveClickAction
						) &&
							applyFilters(
								'folioBlocks.imageBlock.linkButton',
								null,
								{
									attributes: activeImageAttributes,
									setAttributes: () => {},
									activeImageClickAction: effectiveClickAction,
									effectiveLinkIconDisplay:
										effectiveClickAttributes.linkIconDisplay ||
										'hover',
									linkIconStyleVars,
								}
							) }

						{ activeImageSrc ? (
							<img
								className="pb-filmstrip-gallery-main-image pb-image-block-img"
								src={ activeImageSrc }
								alt={ activeImageAlt }
								onLoad={ ( event ) => {
									const image = event.currentTarget;
									if (
										image.naturalWidth > 0 &&
										image.naturalHeight > 0
									) {
										setLoadedImageAspectRatio(
											image.naturalWidth /
												image.naturalHeight
										);
									}
								} }
							/>
					) : (
						<div className="pb-filmstrip-gallery-main-empty">
							{ __(
								'Select an image to preview it.',
								'folioblocks'
							) }
						</div>
					) }
					{ showOverlay && (
							<div className="pb-image-block-title-container">
								<figcaption className="pb-image-block-title">
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
									</>
									) : showExifOverlay ? (
											<FilmstripExifOverlay
												attributes={ activeImageAttributes }
												hideUnknownFields={
													!! effectiveHoverAttributes.hideUnknownExifFields
												}
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
								</figcaption>
							</div>
						) }
						</div>
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
						imageProFeatureNotice( 'filmstripPlayback' ),
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
						null,
						{ attributes, setAttributes }
					) }
					{ applyFilters(
						'folioBlocks.filmstripGallery.randomizeOrderToggle',
						null,
						{ attributes, setAttributes }
					) }
				</PanelBody>
				<PanelBody
					title={ __( 'Gallery Click Settings', 'folioblocks' ) }
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
						imageProFeatureNotice( 'clickActions' ),
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
					{ activeImageClickAction === 'lightbox' &&
						applyFilters(
							'folioBlocks.filmstripGallery.lightboxControls',
							null,
							{
								attributes,
								setAttributes,
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
					title={ __( 'Gallery Hover Settings', 'folioblocks' ) }
					initialOpen={ true }
				>
					{ applyFilters(
						'folioBlocks.filmstripGallery.onHoverTitleToggle',
						imageProFeatureNotice( 'hoverSettings' ),
						{ attributes, setAttributes }
					) }
				</PanelBody>
				<PanelBody
					title={ __( 'Watermark Overlay', 'folioblocks' ) }
					initialOpen={ false }
				>
					{ applyFilters(
						'folioBlocks.filmstripGallery.watermarkControls',
						imageProFeatureNotice( 'watermarkOverlay' ),
						{ attributes, setAttributes }
					) }
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="advanced">
				{ applyFilters(
					'folioBlocks.filmstripGallery.disableRightClickToggle',
					imageProFeatureNotice( 'protectionPerformance' ),
					{ attributes, setAttributes }
				) }
				{ applyFilters(
					'folioBlocks.filmstripGallery.lazyLoadToggle',
					null,
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
						imageProFeatureNotice( 'filmstripColorMode' ),
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
				{ applyFilters(
					'folioBlocks.filmstripGallery.hoverOverlayStyleControls',
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
