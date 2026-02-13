/**
 * Carousel Gallery Block
 * Edit JS
 */
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	BlockControls,
	MediaPlaceholder,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	PanelBody,
	Notice,
	SelectControl,
	ToolbarGroup,
	ToolbarButton,
	ToggleControl,
} from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { decodeEntities } from '@wordpress/html-entities';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useCallback, useRef, useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { IconCarouselGallery, IconPBSpinner } from '../pb-helpers/icons';
import './editor.scss';

export default function Edit( { clientId, attributes, setAttributes } ) {
	const ALLOWED_BLOCKS = [ 'folioblocks/pb-image-block' ];
	const checkoutUrl =
		window.folioBlocksData?.checkoutUrl ||
		'https://folioblocks.com/folioblocks-pricing/?utm_source=folioblocks&utm_medium=carousel-gallery-block&utm_campaign=upgrade';
	const [ isLoading, setIsLoading ] = useState( false );

	const { carouselHeight, preview, lightbox } = attributes;

	// Block Preview Image
	if ( preview ) {
		return (
			<div className="pb-block-preview">
				<IconCarouselGallery />
			</div>
		);
	}

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
	}, [ window.folioBlocksData?.hasWooCommerce ] );

	const blockProps = useBlockProps( {
		'data-carousel-height': carouselHeight, // optional debug aid
		'data-in-carousel': true, // optional debug aid
	} );
	const galleryRef = useRef( null );

	const { replaceInnerBlocks, updateBlockAttributes } =
		useDispatch( blockEditorStore );

	const innerBlocks = useSelect(
		( select ) => select( blockEditorStore ).getBlocks( clientId ),
		[ clientId ]
	);

	const calculateCarouselHeight = () => {
		const container = galleryRef.current;
		const width = container?.offsetWidth || containerWidth || 0;

		const isMobile = width <= 768;
		const [ w, h ] =
			isMobile && attributes.verticalOnMobile ? [ 2, 3 ] : [ 3, 2 ];
		const ratio = h / w;

		return Math.round( width * 0.85 * ratio );
	};

	const onSelectImages = async ( media ) => {
		if ( ! media || media.length === 0 ) {
			return;
		}

		setIsLoading( true ); // <-- start spinner

		const currentBlocks = wp.data
			.select( 'core/block-editor' )
			.getBlocks( clientId );
		const existingImageIds = currentBlocks.map(
			( block ) => block.attributes.id
		);

		// Fetch titles in a single batch for performance
		const imageIds = media.map( ( image ) => image.id );
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
			// Swallow error, maybe show a user notification in future
		}

		// Create new blocks
		const newBlocks = media
			.filter( ( image ) => ! existingImageIds.includes( image.id ) )
			.map( ( image ) => {
				const fullSize = image.sizes?.full || {};
				const width = fullSize.width || image.width || 0;
				const height = fullSize.height || image.height || 0;

				return wp.blocks.createBlock( 'folioblocks/pb-image-block', {
					id: image.id,
					src: image.url,
					alt: image.alt || '',
					title: titleMap[ image.id ] || image.title || '',
					width,
					height,
					sizes: image.sizes || {},
					caption: image.caption || '',
				} );
			} );

		// Replace inner blocks
		replaceInnerBlocks( clientId, [ ...currentBlocks, ...newBlocks ] );

		// Trigger layout recalculation
		setTimeout( () => {
			updateBlockAttributes( clientId, { _forceRefresh: Date.now() } );
			setIsLoading( false ); // <-- stop spinner
		}, 300 );
	};

	const { ref: innerRef, ...restInnerBlocksProps } = useInnerBlocksProps(
		{
			className: 'pb-carousel-gallery',
			style: { '--pb-carousel-height': `${ carouselHeight || 400 }px` },
		},
		{
			allowedBlocks: ALLOWED_BLOCKS,
			templateLock: false,
			orientation: 'horizontal',
			renderAppender: false,
		}
	);
	// Merge refs for gallery DOM node
	const containerRef = useRef();
	const mergedRef = useCallback(
		( node ) => {
			galleryRef.current = node;
			containerRef.current = node;
			if ( typeof innerRef === 'function' ) {
				innerRef( node );
			} else if ( innerRef && typeof innerRef === 'object' ) {
				innerRef.current = node;
			}
		},
		[ innerRef ]
	);

	// Calculate and set carousel height based on aspect ratio and container width
	const [ containerWidth, setContainerWidth ] = useState( 0 );
	// Watch the carousel container width and update containerWidth
	useEffect( () => {
		if ( ! galleryRef.current ) {
			return;
		}

		const observer = new ResizeObserver( ( [ entry ] ) => {
			setContainerWidth( entry.contentRect.width );
		} );

		observer.observe( galleryRef.current );

		return () => observer.disconnect();
	}, [ innerBlocks.length, isLoading, attributes.align ] );
	useEffect( () => {
		const isMobile = containerWidth <= 768;
		const [ w, h ] =
			isMobile && attributes.verticalOnMobile ? [ 2, 3 ] : [ 3, 2 ];
		const ratio = h / w;
		const idealHeight = Math.round( containerWidth * 0.85 * ratio );
		const maxHeight =
			typeof window !== 'undefined'
				? window.innerHeight * 0.85
				: idealHeight;
		const newHeight = Math.min( idealHeight, maxHeight );

		if ( ! isNaN( newHeight ) && newHeight !== attributes.carouselHeight ) {
			const timeout = setTimeout( () => {
				setAttributes( { carouselHeight: newHeight } );
			}, 100 );
			return () => clearTimeout( timeout );
		}
	}, [ containerWidth ] );

	// Recalculate when block alignment changes (normal → wide → full)
	useEffect( () => {
		// Run even when align is undefined (normal width)
		const runRecalc = () => {
			const newHeight = calculateCarouselHeight();
			const currentAlign = attributes.align || 'normal';

			if (
				! isNaN( newHeight ) &&
				newHeight !== attributes.carouselHeight
			) {
				setAttributes( { carouselHeight: newHeight } );
			}
		};

		// Delay until after DOM updates so wrapper width is correct
		const raf = requestAnimationFrame( () => {
			setTimeout( runRecalc, 0 );
		} );

		return () => cancelAnimationFrame( raf );
	}, [ attributes.align ] );

	// Determine if this block or one of its children is selected
	const isBlockOrChildSelected = useSelect(
		( select ) => {
			const selectedId =
				select( blockEditorStore ).getSelectedBlockClientId();
			if ( ! selectedId ) {
				return false;
			}

			const selectedBlock =
				select( blockEditorStore ).getBlock( selectedId );
			if ( ! selectedBlock ) {
				return false;
			}

			// Check if this block is selected
			if ( selectedBlock.clientId === clientId ) {
				return true;
			}

			// Check if selected block is a pb-image-block inside this gallery
			if (
				selectedBlock.name === 'folioblocks/pb-image-block' &&
				select( blockEditorStore ).getBlockRootClientId(
					selectedId
				) === clientId
			) {
				return true;
			}

			return false;
		},
		[ clientId ]
	);

	// --- Sync images to attributes.images (existing)
	useEffect( () => {
		const updatedImages = innerBlocks.map( ( block ) => ( {
			id: block.attributes.id,
			src: block.attributes.src,
			alt: block.attributes.alt,
			title: block.attributes.title,
			width: block.attributes.width,
			height: block.attributes.height,
			sizes: block.attributes.sizes,
			caption: block.attributes.caption,
		} ) );
		setAttributes( { images: updatedImages } );
	}, [ innerBlocks ] );

	// Carousel navigation state and handlers
	const [ currentSlide, setCurrentSlide ] = useState( 0 );
	const [ isPlaying, setIsPlaying ] = useState( false );

	const goToPrevSlide = () => {
		setCurrentSlide( ( prev ) => Math.max( 0, prev - 1 ) );
	};

	const goToNextSlide = () => {
		setCurrentSlide( ( prev ) =>
			Math.min( innerBlocks.length - 1, prev + 1 )
		);
	};

	// Scroll to active slide on change (center image in container)
	useEffect( () => {
		const scrollContainer = containerRef.current;
		if ( ! scrollContainer ) {
			return;
		}

		const blockOrder = wp.data
			.select( 'core/block-editor' )
			.getBlockOrder( clientId );
		const blockClientId = blockOrder[ currentSlide ];
		const blockNode = scrollContainer.querySelector(
			`[data-block="${ blockClientId }"]`
		);
		if ( ! blockNode ) {
			return;
		}

		const containerRect = scrollContainer.getBoundingClientRect();
		const elementRect = blockNode.getBoundingClientRect();
		const scrollLeft = scrollContainer.scrollLeft;
		// Center the image in the container
		const offset =
			elementRect.left -
			containerRect.left -
			( containerRect.width - elementRect.width ) / 2;

		scrollContainer.scrollTo( {
			left: scrollLeft + offset,
			behavior: 'smooth',
		} );
	}, [ currentSlide, clientId ] );

	// Scroll selected block (from List View) into center if it's part of this carousel
	const selectedBlockClientId = useSelect(
		( select ) => select( blockEditorStore ).getSelectedBlockClientId(),
		[]
	);

	useEffect( () => {
		if ( ! selectedBlockClientId ) {
			return;
		}

		const scrollContainer = containerRef.current;
		if ( ! scrollContainer ) {
			return;
		}

		// Only proceed if selected block is a child of this carousel
		const rootId = wp.data
			.select( 'core/block-editor' )
			.getBlockRootClientId( selectedBlockClientId );
		if ( rootId !== clientId ) {
			return;
		}

		const blockNode = scrollContainer.querySelector(
			`[data-block="${ selectedBlockClientId }"]`
		);
		if ( ! blockNode ) {
			return;
		}

		const containerRect = scrollContainer.getBoundingClientRect();
		const elementRect = blockNode.getBoundingClientRect();
		const scrollLeft = scrollContainer.scrollLeft;

		const offset =
			elementRect.left -
			containerRect.left -
			( containerRect.width - elementRect.width ) / 2;

		scrollContainer.scrollTo( {
			left: scrollLeft + offset,
			behavior: 'smooth',
		} );
	}, [ selectedBlockClientId, clientId ] );

	// Autoplay effect: advance slide automatically if isPlaying and autoplay are true
	useEffect( () => {
		if ( ! attributes.autoplay || ! isPlaying ) {
			return;
		}

		const interval = setInterval(
			() => {
				setCurrentSlide( ( prev ) => {
					if ( prev + 1 < innerBlocks.length ) {
						return prev + 1;
					}
					return 0; // Jump back to the first slide instead of stopping
				} );
			},
			( attributes.autoplaySpeed || 3 ) * 1000
		);

		return () => clearInterval( interval );
	}, [
		isPlaying,
		attributes.autoplaySpeed,
		attributes.autoplay,
		innerBlocks.length,
	] );

	// Automatically start playback when autoplay is enabled and controls are hidden
	useEffect( () => {
		// Only auto-start if autoplay is on, controls are off, and it's not already playing
		if ( attributes.autoplay && ! attributes.showControls && ! isPlaying ) {
			setIsPlaying( true );
		}
	}, [ attributes.autoplay, attributes.showControls ] );

	// Listen for scroll events to update currentSlide
	useEffect( () => {
		const container = containerRef.current;
		if ( ! container ) {
			return;
		}

		let scrollTimeout;

		const handleScroll = () => {
			if ( scrollTimeout ) {
				clearTimeout( scrollTimeout );
			}

			scrollTimeout = setTimeout( () => {
				const children = Array.from(
					container.querySelectorAll( '[data-block]' )
				);
				const containerRect = container.getBoundingClientRect();

				let closestIndex = 0;
				let minOffset = Infinity;

				children.forEach( ( child, index ) => {
					const rect = child.getBoundingClientRect();
					const containerRight = containerRect.right;

					if ( index === children.length - 1 ) {
						// If the last slide is flush with the right edge, mark it as active
						if ( Math.abs( rect.right - containerRight ) < 2 ) {
							closestIndex = index;
							return; // Exit early if last slide is detected
						}
					}

					const offset = Math.abs(
						rect.left -
							containerRect.left -
							containerRect.width / 2 +
							rect.width / 2
					);
					if ( offset < minOffset ) {
						minOffset = offset;
						closestIndex = index;
					}
				} );

				setCurrentSlide( closestIndex );
			}, 100 ); // wait 100ms after scroll ends
		};

		container.addEventListener( 'scroll', handleScroll, { passive: true } );

		return () => {
			container.removeEventListener( 'scroll', handleScroll );
			if ( scrollTimeout ) {
				clearTimeout( scrollTimeout );
			}
		};
	}, [] );

	applyFilters( 'folioBlocks.carouselGallery.editorEnhancements', null, {
		clientId,
		innerBlocks,
		isBlockOrChildSelected,
	} );

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={ plus }
						label={ __( 'Add Images', 'folioblocks' ) }
						onClick={ () => {
							wp.media( {
								title: __( 'Select Images', 'folioblocks' ),
								multiple: true,
								library: { type: 'image' },
								button: {
									text: __( 'Add to Gallery', 'folioblocks' ),
								},
							} )
								.on( 'select', () => {
									const selection = wp.media.frame
										.state()
										.get( 'selection' )
										.toJSON();
									onSelectImages( selection );
								} )
								.open();
						} }
					>
						{ __( 'Add Images', 'folioblocks' ) }
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody
					title={ __( 'Carousel Gallery Settings', 'folioblocks' ) }
					initialOpen={ true }
				>
					<SelectControl
						label={ __( 'Resolution', 'folioblocks' ) }
						value={ attributes.resolution || 'large' }
						options={ [
							{
								label: __( 'Thumbnail', 'folioblocks' ),
								value: 'thumbnail',
							},
							{
								label: __( 'Medium', 'folioblocks' ),
								value: 'medium',
							},
							{
								label: __( 'Large', 'folioblocks' ),
								value: 'large',
							},
							{
								label: __( 'Full', 'folioblocks' ),
								value: 'full',
							},
						].filter( ( option ) => {
							// Check all images for available sizes
							const allSizes = innerBlocks.flatMap( ( block ) =>
								Object.keys( block.attributes.sizes || {} )
							);
							return (
								allSizes.includes( option.value ) ||
								option.value === 'full'
							);
						} ) }
						onChange={ ( newResolution ) => {
							setAttributes( { resolution: newResolution } );
							innerBlocks.forEach( ( block ) => {
								const newSrc =
									block.attributes.sizes?.[ newResolution ]
										?.url || block.attributes.src;
								updateBlockAttributes( block.clientId, {
									src: newSrc,
									imageSize: newResolution,
								} );
							} );
						} }
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={ __( 'Select the size of the source image.' ) }
					/>
					<SelectControl
						label={ __(
							'Image Orientation (Mobile)',
							'folioblocks'
						) }
						value={
							attributes.verticalOnMobile
								? 'vertical'
								: 'horizontal'
						}
						options={ [
							{
								label: __( 'Horizontal Images', 'folioblocks' ),
								value: 'horizontal',
							},
							{
								label: __( 'Vertical Images', 'folioblocks' ),
								value: 'vertical',
							},
						] }
						onChange={ ( val ) =>
							setAttributes( {
								verticalOnMobile: val === 'vertical',
							} )
						}
						help={ __(
							'Affects layout on mobile only. Switch ONLY when all images are vertical in orientation.',
							'folioblocks'
						) }
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					{ applyFilters(
						'folioBlocks.carouselGallery.enableAutoplayToggle',
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
					{ applyFilters(
						'folioBlocks.carouselGallery.showControlsToggle',
						<div style={ { marginBottom: '8px' } }>
							<Notice status="info" isDismissible={ false }>
								<strong>
									{ __(
										'Enable Carousel Controls',
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
					title={ __( 'Lightbox & Hover Overlay Settings', 'folioblocks' ) }
					initialOpen={ true }
				>
					{ applyFilters(
						'folioBlocks.carouselGallery.lightboxControls',
						<>
							<ToggleControl
								label={ __( 'Enable Lightbox', 'folioblocks' ) }
								checked={ !! lightbox }
								onChange={ ( newLightbox ) =>
									setAttributes( { lightbox: newLightbox } )
								}
								__nextHasNoMarginBottom
								help={ __(
									'Open images in a lightbox when clicked.',
									'folioblocks'
								) }
							/>
						</>,
						{ attributes, setAttributes }
					) }
					{ applyFilters(
						'folioBlocks.carouselGallery.onHoverTitleToggle',
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
						'folioBlocks.carouselGallery.downloadControls',
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
							'folioBlocks.carouselGallery.wooCommerceControls',
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
					'folioBlocks.carouselGallery.disableRightClickToggle',
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
					'folioBlocks.carouselGallery.lazyLoadToggle',
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
				{ applyFilters(
					'folioBlocks.carouselGallery.controlStyleSettings',
					<div style={ { marginBottom: '8px' } }>
						<Notice status="info" isDismissible={ false }>
							<strong>
								{ __(
									'Carousel Control Styles',
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
				<PanelBody
					title={ __( 'Gallery Image Styles', 'folioblocks' ) }
					initialOpen={ true }
				>
					{ applyFilters(
						'folioBlocks.carouselGallery.imageStyles',
						<div style={ { marginBottom: '8px' } }>
							<Notice status="info" isDismissible={ false }>
								<strong>
									{ __(
										'Enable Image Styles',
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
				{ applyFilters(
					'folioBlocks.carouselGallery.iconStyleControls',
					null,
					{
						attributes,
						setAttributes,
					}
				) }
			</InspectorControls>

			<div { ...blockProps }>
				{ isLoading && (
					<div className="pb-spinner-wrapper">
						<IconPBSpinner />
					</div>
				) }
				{ ! isLoading && innerBlocks.length === 0 ? (
					<MediaPlaceholder
						icon={ <IconCarouselGallery /> }
						labels={ {
							title: __( 'Carousel Gallery', 'folioblocks' ),
							instructions: __(
								'Upload or select images to create a carousel.',
								'folioblocks'
							),
						} }
						onSelect={ onSelectImages }
						accept="image/*"
						allowedTypes={ [ 'image' ] }
						multiple
					/>
				) : (
					! isLoading && (
						<div ref={ mergedRef } { ...restInnerBlocksProps } />
					)
				) }
				{ applyFilters(
					'folioBlocks.carouselGallery.controlButtons',
					null,
					{
						attributes,
						setAttributes,
						goToPrevSlide,
						goToNextSlide,
						isPlaying,
						setIsPlaying,
						innerBlocks,
					}
				) }
			</div>
		</>
	);
}
