/**
 * Modular Gallery Block
 * Edit JS
 */
import { __ } from '@wordpress/i18n';
import { select, useSelect, useDispatch } from '@wordpress/data';
import { useState, useEffect, useRef } from '@wordpress/element';
import {
	BlockControls,
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	MediaPlaceholder,
} from '@wordpress/block-editor';
import {
	ToolbarGroup,
	ToolbarButton,
	PanelBody,
	ToggleControl,
	SelectControl,
	Panel,
} from '@wordpress/components';
import { createBlock } from '@wordpress/blocks';
import { row } from '@wordpress/icons';
import { applyFilters } from '@wordpress/hooks';
import { IconModularGallery } from '../pb-helpers/icons';
import { getExifAttributesFromMedia } from '../pb-helpers/exifMetadata';
import { getImageSizeOptions } from '../pb-helpers/imageSizeOptions';
import { imageProFeatureNotice } from '../pb-helpers/imageProFeatureNotices';

import './editor.scss';

const ALLOWED_BLOCKS = [ 'folioblocks/pb-image-row' ];

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

// Debounce utility to throttle function calls
const debounce = ( fn, delay ) => {
	let timer;
	return ( ...args ) => {
		clearTimeout( timer );
		timer = setTimeout( () => fn( ...args ), delay );
	};
};

export default function Edit( props ) {
	const { clientId, attributes, setAttributes } = props;
	const { noGap, lightbox, lightboxCaption, preview } = attributes;


	// Block Preview Image
	if ( preview ) {
		return (
			<div className="pb-block-preview">
				<IconModularGallery />
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

	const { insertBlock, replaceBlocks, selectBlock } =
		useDispatch( 'core/block-editor' );

	const innerBlocks = useSelect(
		( select ) => {
			return (
				select( 'core/block-editor' ).getBlock( clientId )
					?.innerBlocks || []
			);
		},
		[ clientId ]
	);
	const availableImageSizes = useSelect(
		( select ) =>
			select( 'core/block-editor' ).getSettings()?.imageSizes || [],
		[]
	);
	const imageSizeOptions = getImageSizeOptions( availableImageSizes, __ );

	const handleImageSelect = async ( media ) => {
		try {
			// Fetch the full media object to ensure we get raw fields
			const response = await wp.apiFetch( {
				path: `/wp/v2/media/${ media.id }`,
			} );

			const title = response.title?.rendered || '';
			// Prefer raw caption, fallback to media.caption
			const caption = response.caption?.raw || media.caption || '';
			const alt = response.alt_text || media.alt || '';

			const rowBlock = wp.blocks.createBlock(
				'folioblocks/pb-image-row',
				{},
				[
					wp.blocks.createBlock( 'folioblocks/pb-image-block', {
						id: media.id,
						src: media.url,
						alt,
						title,
						caption,
							sizes: media.sizes || {},
							width: media.width || 0,
							height: media.height || 0,
							...( getExifAttributesFromMedia( response ) ||
								getExifAttributesFromMedia( media ) ||
								{} ),
						} ),
					]
				);

			wp.data
				.dispatch( 'core/block-editor' )
				.replaceInnerBlocks( clientId, [ rowBlock ], false );
		} catch ( error ) {
			console.error( 'Failed to fetch image metadata:', error );
		}
	};

	useEffect( () => {
		const onAddToImageStack = ( e ) => {
			const targetId = e?.detail?.clientId;
			if ( ! targetId ) {
				return;
			}

			const beSelect = select( 'core/block-editor' );
			const parents = beSelect.getBlockParents( targetId, true ) || [];
			// ensure the image is inside THIS gallery instance
			if ( ! parents.includes( clientId ) ) {
				return;
			}

			const getName = beSelect.getBlockName;
			const names = parents.map( getName );

			// must be inside an Image Row and NOT already in an Image Stack
			const inRow = names.includes( 'folioblocks/pb-image-row' );
			const inStack = names.includes( 'folioblocks/pb-image-stack' );
			if ( ! inRow || inStack ) {
				return;
			}

			const imgBlock = beSelect.getBlock( targetId );
			if (
				! imgBlock ||
				imgBlock.name !== 'folioblocks/pb-image-block'
			) {
				return;
			}

			// Build a new stack with a cloned image child
			const childImage = createBlock( 'folioblocks/pb-image-block', {
				...imgBlock.attributes,
			} );
			const stackBlock = createBlock( 'folioblocks/pb-image-stack', {}, [
				childImage,
			] );

			// Replace the image with the new stack
			replaceBlocks( targetId, stackBlock );

			// Optional: focus the new child image
			// setTimeout(() => {
			//   const tree = select('core/block-editor').getBlock(stackBlock.clientId);
			//   const newChildId = tree?.innerBlocks?.[0]?.clientId;
			//   if (newChildId) {
			//     selectBlock(newChildId);
			//   }
			// }, 0);
		};

		window.addEventListener(
			'folioblocks:add-to-image-stack',
			onAddToImageStack
		);
		return () =>
			window.removeEventListener(
				'folioblocks:add-to-image-stack',
				onAddToImageStack
			);
	}, [ clientId ] );

	const handleAddRow = () => {
		const { createBlock } = wp.blocks;
		const newRow = createBlock( 'folioblocks/pb-image-row' );
		insertBlock( newRow, innerBlocks.length, clientId );
	};
	const [ layoutVersion, setLayoutVersion ] = useState( 0 );
	const containerRef = useRef( null );
	const [ rowLayouts, setRowLayouts ] = useState( {} );
	const prevLayouts = useRef( {} );

	// Used to prevent a jarring first paint (images briefly appear at natural size)
	// by fading the gallery in only after we have applied the first successful layout.
	const [ isLayoutReady, setIsLayoutReady ] = useState( false );
	// Only fade-in once (initial load). After that, never hide the gallery during edits/reordering.
	const hasCompletedInitialFade = useRef( false );

	const recalculateLayout = () => {
		if ( ! containerRef.current ) {
			return;
		}
		const rowWrappers =
			containerRef.current.querySelectorAll( '.pb-image-row' );
		const layouts = {};
		let allRowsReady = true;

		rowWrappers.forEach( ( row, rowIndex ) => {
			const wrappers = Array.from( row.children ).filter(
				( child ) =>
					child.classList.contains(
						'wp-block-folioblocks-pb-image-block'
					) ||
					child.classList.contains(
						'wp-block-folioblocks-pb-image-stack'
					)
			);
			if ( ! wrappers.length ) {
				return;
			}

			// Guard: Only proceed if all images in the row are fully loaded
			const images = row.querySelectorAll( 'img' );
			const anyNotLoaded = Array.from( images ).some(
				( img ) => ! img.complete
			);
			if ( anyNotLoaded ) {
				allRowsReady = false;
				return;
			}

			// Proceed with layout calculation for the row (unchanged)
			const containerWidth = row.clientWidth;
			const gap = noGap ? 0 : 10;
			const totalGaps = gap * ( wrappers.length - 1 );

			const aspectRatios = [];
			let totalNaturalWidth = 0;
			const stackMeta = [];

			wrappers.forEach( ( wrapper ) => {
				let ratio;
				let isStack = false;

				if (
					wrapper.classList.contains(
						'wp-block-folioblocks-pb-image-block'
					)
				) {
					const img = wrapper.querySelector( 'img' );
					if ( img && img.naturalWidth && img.naturalHeight ) {
						ratio = img.naturalWidth / img.naturalHeight;
					}
				} else if (
					wrapper.classList.contains(
						'wp-block-folioblocks-pb-image-stack'
					)
				) {
					isStack = true;
					const images = wrapper.querySelectorAll( 'img' );
					let totalStackHeight = 0;
					images.forEach( ( img ) => {
						if ( img.naturalWidth && img.naturalHeight ) {
							totalStackHeight +=
								img.naturalHeight / img.naturalWidth;
						}
					} );
					if ( totalStackHeight > 0 ) {
						ratio = 1 / totalStackHeight;
					}
				}

				if ( ratio ) {
					aspectRatios.push( ratio );
					totalNaturalWidth += ratio;
					stackMeta.push( { isStack, wrapper } );
				}
			} );

			if (
				aspectRatios.length !== wrappers.length ||
				totalNaturalWidth === 0
			) {
				return;
			}

			const targetHeight = Math.round(
				( containerWidth - totalGaps ) / totalNaturalWidth
			);

			let usedWidth = 0;
			const widths = aspectRatios.map( ( ratio ) =>
				Math.floor( ratio * targetHeight )
			);
			widths.forEach( ( width ) => {
				usedWidth += width;
			} );
			const remainingWidth = containerWidth - usedWidth - totalGaps;

			const widthAdjustments = new Array( wrappers.length ).fill( 0 );
			for ( let i = 0; i < remainingWidth; i++ ) {
				widthAdjustments[ i % wrappers.length ]++;
			}

			layouts[ rowIndex ] = widths.map( ( w, i ) => ( {
				width: w + widthAdjustments[ i ],
				height: targetHeight,
				marginRight: i === wrappers.length - 1 ? '0' : `${ gap }px`,
				isStack: stackMeta[ i ].isStack,
			} ) );

			wrappers.forEach( ( wrapper, index ) => {
				const layout = layouts[ rowIndex ][ index ];
				if ( ! layout ) {
					return;
				}

				if ( ! layout.isStack ) {
					wrapper.style.width = `${ layout.width }px`;
					wrapper.style.height = `${ layout.height }px`;
					wrapper.style.marginRight = layout.marginRight;

					const figure = wrapper.querySelector( '.pb-image-block' );
					if ( figure ) {
						figure.style.width = '';
						figure.style.height = '';
						figure.style.marginRight = '';
					}
				} else {
					// Stack logic (already present above)
					const stackWrapper = wrapper;
					stackWrapper.style.width = `${ layout.width }px`;
					stackWrapper.style.height = `${ layout.height }px`;
					stackWrapper.style.marginRight = layout.marginRight;

					const images = stackWrapper.querySelectorAll( 'img' );
					let totalRatio = 0;
					const ratios = [];
					images.forEach( ( img ) => {
						if ( img.naturalWidth && img.naturalHeight ) {
							const r = img.naturalHeight / img.naturalWidth;
							ratios.push( r );
							totalRatio += r;
						}
					} );

					const totalStackGaps = noGap
						? 0
						: ( images.length - 1 ) * 10;
					const usableHeight = layout.height - totalStackGaps;

					images.forEach( ( img, idx ) => {
						const share = ratios[ idx ] / totalRatio;
						const imgHeight = Math.round( share * usableHeight );

						// The <figure> is inside a wrapper div that receives block props.
						// If we put margin on the <figure>, the selection outline (on the wrapper)
						// ends up with an empty gap below the image when selected.
						// So: set height on the figure, but set spacing on the wrapper.
						const figure = img.closest( '.pb-image-block' );
						const blockWrapper = img.closest(
							'.wp-block-folioblocks-pb-image-block'
						);

						if ( figure ) {
							figure.style.height = `${ imgHeight }px`;
							// Ensure we don't create a visual gap between the selection border and the image.
							figure.style.marginBottom = '0px';
						}

						if ( blockWrapper ) {
							blockWrapper.style.marginBottom =
								noGap || idx === images.length - 1
									? '0px'
									: '10px';
						}
					} );
				}
			} );
		} );

		// If any row's images are not loaded, skip layout recalculation.
		// IMPORTANT: we only hide during the initial load fade-in.
		if ( ! allRowsReady ) {
			if ( ! hasCompletedInitialFade.current ) {
				// Keep hidden until we can apply the first full layout.
				if ( isLayoutReady ) {
					setIsLayoutReady( false );
				}
			}
			return;
		}

		// At this point the layout has been applied for all rows.
		// Only fade in once. After that, keep the gallery visible even when reordering.
		if ( ! hasCompletedInitialFade.current ) {
			if ( ! isLayoutReady ) {
				setIsLayoutReady( true );
			}
			hasCompletedInitialFade.current = true;
		}

		const layoutsEqual = ( a, b ) =>
			JSON.stringify( a ) === JSON.stringify( b );
		if ( ! layoutsEqual( prevLayouts.current, layouts ) ) {
			setRowLayouts( layouts );
			setLayoutVersion( Date.now() );
			prevLayouts.current = layouts;
		}
	};

	const recalculateLayoutDebounced = debounce( recalculateLayout, 150 );

	// Recalculate after add/remove/reorder. This does NOT hide the gallery.
	useEffect( () => {
		requestAnimationFrame( () => {
			recalculateLayoutDebounced();
		} );
	}, [ innerBlocks, noGap ] );

	useEffect( () => {
		const observer = new ResizeObserver( () => {
			requestAnimationFrame( () => {
				recalculateLayoutDebounced();
			} );
		} );
		const container = containerRef.current;
		if ( container ) {
			observer.observe( container );
		}
		return () => observer.disconnect();
	}, [ innerBlocks, noGap ] );

	const blockProps = useBlockProps( {
		ref: containerRef,
		context: {
			'folioBlocks/noGap': noGap,
			'folioBlocks/layoutVersion': layoutVersion,
			'folioBlocks/rowLayouts': rowLayouts,
			'folioBlocks/enableWooCommerce': effectiveEnableWoo,
			'folioBlocks/hasWooCommerce': hasWooCommerce,
		},
	} );
	const innerBlocksProps = useInnerBlocksProps(
		{
			className: [
				'pb-modular-gallery',
				noGap ? 'no-row-gap' : '',
				attributes.collapseOnMobile ? 'collapse-on-mobile' : '',
			]
				.filter( Boolean )
				.join( ' ' ),
			style: {
				opacity: isLayoutReady ? 1 : 0,
				transition: 'opacity 200ms ease',
				willChange: 'opacity',
			},
		},
		{
			allowedBlocks: ALLOWED_BLOCKS,
			orientation: 'vertical',
			template: [ [ 'folioblocks/pb-image-row' ] ],
			templateLock: false,
		}
	);

	// Determine if the Modular Gallery block or any of its children is selected
	const isBlockOrChildSelected = useSelect(
		( select ) => {
			const blockEditorStore = 'core/block-editor';
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

			// Direct selection
			if ( selectedBlock.clientId === clientId ) {
				return true;
			}

			// Check if selected block is a pb-image-block nested within a pb-image-row or pb-image-stack
			if ( selectedBlock.name === 'folioblocks/pb-image-block' ) {
				const parents =
					select( blockEditorStore ).getBlockParents( selectedId );
				return parents.includes( clientId );
			}

			return false;
		},
		[ clientId ]
	);

	// Always call editorEnhancements filter for consistent hook ordering
	applyFilters( 'folioBlocks.modularGallery.editorEnhancements', null, {
		attributes,
		clientId,
		innerBlocks,
		isBlockOrChildSelected,
	} );

	const imageClickAction = getImageClickAction( {
		lightbox,
		enableDownload: attributes.enableDownload,
		enableWooCommerce: effectiveEnableWoo,
		imageClickAction: attributes.imageClickAction,
	} );
	const imageClickActionOptions = applyFilters(
		'folioBlocks.modularGallery.imageClickActionOptions',
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

	if ( innerBlocks.length === 0 ) {
		return (
			<div { ...blockProps }>
				<MediaPlaceholder
					icon={ <IconModularGallery /> }
					labels={ { title: __( 'Add First Image', 'folioblocks' ) } }
					accept="image/*"
					allowedTypes={ [ 'image' ] }
					multiple={ false }
					onSelect={ handleImageSelect }
				/>
			</div>
		);
	}

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={ row }
						label="Add Image Row"
						onClick={ handleAddRow }
					>
						{ __( 'Add Image Row', 'folioblocks' ) }
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody
					title={ __( 'General Gallery Settings', 'folioblocks' ) }
					initialOpen={ true }
				>
					<SelectControl
						label={ __( 'Image Resolution', 'folioblocks' ) }
						value={ attributes.resolution }
						options={ imageSizeOptions }
						onChange={ ( value ) => {
							setAttributes( { resolution: value } );
						} }
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={ __( 'Select the size of the source image.' ) }
					/>
					<ToggleControl
						label={ __(
							'Collapse layout on Mobile',
							'folioblocks'
						) }
						checked={ attributes.collapseOnMobile }
						onChange={ ( value ) =>
							setAttributes( { collapseOnMobile: value } )
						}
						__nextHasNoMarginBottom
						help={ __(
							'Stack all images vertically on mobile devices.',
							'folioblocks'
						) }
					/>
					<ToggleControl
						label={ __( 'Remove Image Gap', 'folioblocks' ) }
						checked={ attributes.noGap || false }
						onChange={ ( noGap ) => setAttributes( { noGap } ) }
						help={ __(
							'Remove gap between images.',
							'folioblocks'
						) }
						__nextHasNoMarginBottom
					/>
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
						help={ __( 'Choose what happens when visitors click gallery images.', 'folioblocks' ) }
					/>
					{ applyFilters(
						'folioBlocks.modularGallery.imageClickActionNotice',
						imageProFeatureNotice( 'clickActions' ),
						{
							attributes,
							setAttributes,
							hasWooCommerce,
							effectiveEnableWoo,
						}
					) }
						{ activeImageClickAction === 'lightbox' &&
							applyFilters(
								'folioBlocks.modularGallery.lightboxControls',
								null,
								{ attributes, setAttributes }
							) }
						{ activeImageClickAction === 'download' &&
							applyFilters(
								'folioBlocks.modularGallery.downloadControls',
								null,
								{ attributes, setAttributes }
							) }
						{ ( activeImageClickAction === 'custom_url' ||
							activeImageClickAction === 'page_post' ) &&
							applyFilters(
								'folioBlocks.modularGallery.linkTargetControls',
								null,
								{
									attributes,
									setAttributes,
									imageClickAction: activeImageClickAction,
								}
							) }
						{ activeImageClickAction === 'woocommerce' &&
							applyFilters(
								'folioBlocks.modularGallery.wooCommerceControls',
								null,
								{ attributes, setAttributes }
							) }
						</PanelBody>
						<PanelBody
							title={ __( 'Gallery Hover Settings', 'folioblocks' ) }
							initialOpen={ true }
						>
							{ applyFilters(
								'folioBlocks.modularGallery.onHoverTitleToggle',
								imageProFeatureNotice( 'hoverSettings' ),
								{ attributes, setAttributes }
							) }
						</PanelBody>
						{ applyFilters(
							'folioBlocks.modularGallery.lazyLoadToggle',
					imageProFeatureNotice( 'protectionPerformance' ),
					{ attributes, setAttributes }
				) }
			</InspectorControls>
			<InspectorControls group="styles">
				<PanelBody
					title={ __( 'Gallery Image Styles', 'folioblocks' ) }
					initialOpen={ true }
				>
					{ applyFilters(
						'folioBlocks.modularGallery.imageStyles',
						imageProFeatureNotice( 'imageStyles' ),
						{ attributes, setAttributes }
					) }
				</PanelBody>
				{ applyFilters(
					'folioBlocks.modularGallery.iconStyleControls',
					null,
					{
						attributes,
						setAttributes,
					}
				) }
				{ applyFilters(
					'folioBlocks.modularGallery.hoverOverlayStyleControls',
					null,
					{
						attributes,
						setAttributes,
					}
				) }
			</InspectorControls>

			<div { ...blockProps }>
				<div { ...innerBlocksProps } />
			</div>
		</>
	);
}
