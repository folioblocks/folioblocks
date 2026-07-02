/**
 * Justified Gallery Block
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
	ToggleControl,
	SelectControl,
	ToolbarGroup,
	ToolbarButton,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { plus } from '@wordpress/icons';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { applyFilters } from '@wordpress/hooks';
import { IconJustifiedGallery, IconPBSpinner } from '../pb-helpers/icons';
import { fbksNormalizeActiveFilterValue } from '../pb-helpers/filterConstants';
import { getExifAttributesFromMedia } from '../pb-helpers/exifMetadata';
import { getImageSizeOptions } from '../pb-helpers/imageSizeOptions';
import { imageProFeatureNotice } from '../pb-helpers/imageProFeatureNotices';
import {
	getGalleryGapForWidth,
	resolveLegacyGalleryGaps,
} from '../pb-helpers/galleryGap';
import { calculateJustifiedLayout } from '../pb-helpers/justifiedLayout';
import ResponsiveRangeControl from '../pb-helpers/ResponsiveRangeControl';
import './editor.scss';

const ALLOWED_BLOCKS = [ 'folioblocks/pb-image-block' ];

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

const getRowHeightForWidth = (
	width,
	{ desktop = 250, tablet = 250, mobile = 250 }
) => {
	if ( width <= 600 ) {
		return mobile;
	}
	if ( width <= 1024 ) {
		return tablet;
	}
	return desktop;
};

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { preview, lightbox, lightboxCaption } = attributes;
	const rowHeight = attributes.rowHeight ?? 250;
	const tabletRowHeight = attributes.tabletRowHeight ?? rowHeight;
	const mobileRowHeight = attributes.mobileRowHeight ?? rowHeight;
	const responsiveGaps = applyFilters(
		'folioBlocks.justifiedGallery.responsiveGaps',
		resolveLegacyGalleryGaps( attributes ),
		attributes
	);
	const effectiveGapAttributes = {
		...attributes,
		...responsiveGaps,
		noGap: false,
	};

	// Block Preview Image
	if ( preview ) {
		return (
			<div className="pb-block-preview">
				<IconJustifiedGallery />
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

	const [ isLoading, setIsLoading ] = useState( false );
	const { replaceInnerBlocks, updateBlockAttributes } =
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
	const imageSizeOptions = getImageSizeOptions( availableImageSizes, __ );

	const galleryRef = useRef( null );

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'pb-justified-gallery' },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			orientation: 'horizontal',
			renderAppender: false,
		}
	);

	const { ref: innerRef, ...restInnerBlocksProps } = innerBlocksProps;

	const combinedRef = useCallback(
		( node ) => {
			galleryRef.current = node;
			if ( typeof innerRef === 'function' ) {
				innerRef( node );
			} else if ( innerRef && typeof innerRef === 'object' ) {
				innerRef.current = node;
			}
			// console.log('📌 combinedRef node:', node);
		},
		[ innerRef ]
	);

	// Select Images Handler
	const onSelectImages = async ( media ) => {
		if ( ! media || media.length === 0 ) {
			return;
		}

		setIsLoading( true ); // <-- start spinner

		// Preserve randomization logic
		const images = attributes.randomizeOrder
			? [ ...media ].sort( () => 0.5 - Math.random() )
			: media;

		// Fetch titles in a single batch for performance
			const imageIds = images.map( ( image ) => image.id );
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
			console.error( 'Failed to fetch image titles:', error );
		}

		const newBlocks = images.map( ( image ) => {
			const fullSize = image.sizes?.full || {};
			const width = fullSize.width || image.width || 1;
			const height = fullSize.height || image.height || 1;

			return wp.blocks.createBlock( 'folioblocks/pb-image-block', {
				id: image.id,
				src: image.url,
				alt: image.alt || '',
				title: titleMap[ image.id ] || image.title || '',
				caption: image.caption || '',
				width,
					height,
					sizes: image.sizes || {},
					...( getExifAttributesFromMedia(
						mediaMap[ image.id ] || image
					) || {} ),
				} );
			} );

		replaceInnerBlocks( clientId, newBlocks );
		updateBlockAttributes( clientId, { _forceRefresh: Date.now() } );

		// Trigger a layout recalculation
		setTimeout( () => {
			const container = galleryRef.current;
			if ( container ) {
				container.dispatchEvent( new Event( 'resize' ) );
			}
			setIsLoading( false ); // <-- stop spinner
		}, 100 );
	};

	useEffect( () => {
		if ( ! galleryRef.current ) {
			return;
		}

		let resizeTimeout;

		const handleResizeEnd = () => {
			clearTimeout( resizeTimeout );
			resizeTimeout = setTimeout( () => {
				requestAnimationFrame( calculateLayout );
			}, 150 );
		};

		const container = galleryRef.current;

		const calculateLayout = () => {
			const node = container; // use the captured element observed by ResizeObserver
			if ( ! node || ! node.isConnected ) {
				return; // element not mounted anymore; abort silently
			}

			const containerWidth = node.clientWidth - 1;

			if ( ! containerWidth ) {
				return;
			}

			const wrappers = node.querySelectorAll(
				'.wp-block-folioblocks-pb-image-block:not(.is-hidden)'
			);
			const images = Array.from( wrappers ).map( ( wrapper ) => {
				const img = wrapper.querySelector( 'img' );
				const width = parseInt( img.getAttribute( 'width' ) ) || 1;
				const height = parseInt( img.getAttribute( 'height' ) ) || 1;
				return { wrapper, width, height };
			} );

			const targetRowHeight = getRowHeightForWidth( node.clientWidth, {
				desktop: rowHeight,
				tablet: tabletRowHeight,
				mobile: mobileRowHeight,
			} );
			const gap = getGalleryGapForWidth(
				effectiveGapAttributes,
				node.clientWidth
			);
			const rows = calculateJustifiedLayout( {
				items: images.map( ( img ) => ( {
					...img,
					aspectRatio: img.width / img.height,
				} ) ),
				containerWidth,
				targetRowHeight,
				gap,
			} );

			rows.forEach( ( row ) => {
				row.forEach( ( img, index ) => {
					img.wrapper.style.setProperty(
						'--pb-width',
						`${ img.layoutWidth }px`
					);
					img.wrapper.style.setProperty(
						'--pb-height',
						`${ img.layoutHeight }px`
					);
					const isLastInRow = index === row.length - 1;
					const inlineMarginValue =
						! isLastInRow && gap > 0 ? `${ gap }px` : '0px';
					const blockMarginValue = gap > 0 ? `${ gap }px` : '0px';
					img.wrapper.style.setProperty(
						'--pb-margin-inline',
						inlineMarginValue
					);
					img.wrapper.style.setProperty(
						'--pb-margin-block',
						blockMarginValue
					);
				} );
			} );
		};

		const resizeObserver = new ResizeObserver( () => {
			requestAnimationFrame( calculateLayout );
			handleResizeEnd(); // NEW: schedule final pass after resize ends
		} );

		resizeObserver.observe( container );
		setTimeout( calculateLayout, 50 );

		return () => {
			resizeObserver.disconnect();
			clearTimeout( resizeTimeout );
		};
	}, [
		innerBlocks,
		rowHeight,
		tabletRowHeight,
		mobileRowHeight,
		attributes.noGap,
		attributes.gap,
		attributes.tabletGap,
		attributes.mobileGap,
		attributes.activeFilter,
		attributes.filterCategories,
	] );

	const blockProps = useBlockProps( {
		context: {
			'folioBlocks/activeFilter': fbksNormalizeActiveFilterValue(
				attributes.activeFilter
			),
			'folioBlocks/filterCategories': attributes.filterCategories,
			'folioBlocks/enableWooCommerce': effectiveEnableWoo,
			'folioBlocks/hasWooCommerce': hasWooCommerce,
		},
		style: {
			'--pb--filter-text-color': attributes.filterTextColor || '#000',
			'--pb--filter-bg-color': attributes.filterBgColor || 'transparent',
			'--pb--filter-active-text':
				attributes.activeFilterTextColor || '#fff',
			'--pb--filter-active-bg': attributes.activeFilterBgColor || '#000',
			'--pb-gallery-gap-desktop': `${ responsiveGaps.gap }px`,
			'--pb-gallery-gap-tablet': `${ responsiveGaps.tabletGap }px`,
			'--pb-gallery-gap-mobile': `${ responsiveGaps.mobileGap }px`,
		},
	} );

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
	const selectedBlock = useSelect( ( select ) => {
		const { getSelectedBlock } = select( blockEditorStore );
		return getSelectedBlock();
	}, [] );

	applyFilters( 'folioBlocks.justifiedGallery.filterLogic', null, {
		clientId,
		attributes,
		setAttributes,
		selectedBlock,
	} );
	applyFilters( 'folioBlocks.justifiedGallery.editorEnhancements', null, {
		clientId,
		attributes,
		innerBlocks,
		isBlockOrChildSelected,
		replaceInnerBlocks,
	} );

	const imageClickAction = getImageClickAction( {
		lightbox,
		enableDownload: attributes.enableDownload,
		enableWooCommerce: effectiveEnableWoo,
		imageClickAction: attributes.imageClickAction,
	} );
	const imageClickActionOptions = applyFilters(
		'folioBlocks.justifiedGallery.imageClickActionOptions',
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
					title={ __( 'Justified Gallery Settings', 'folioblocks' ) }
					initialOpen={ true }
				>
					<SelectControl
						label={ __( 'Resolution', 'folioblocks' ) }
						value={ attributes.resolution || 'large' }
						options={ imageSizeOptions }
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
						help={ __(
							'Select the size of the source image.',
							'folioblocks'
						) }
					/>
					<ResponsiveRangeControl
						label={ __( 'Row Height', 'folioblocks' ) }
						columns={ rowHeight }
						tabletColumns={ tabletRowHeight }
						mobileColumns={ mobileRowHeight }
						desktopKey="rowHeight"
						tabletKey="tabletRowHeight"
						mobileKey="mobileRowHeight"
						min={ 100 }
						max={ 1500 }
						lockTabletMobileToDesktop={ false }
						onChange={ ( newValues ) => setAttributes( newValues ) }
						help={ __(
							'Set the preferred row height. Rows adjust as needed to fill the gallery width.',
							'folioblocks'
						) }
					/>
					{ applyFilters(
							'folioBlocks.justifiedGallery.responsiveGapControl',
							<>
								<ToggleControl
									label={ __( 'Remove Image Gap', 'folioblocks' ) }
									checked={ !! attributes.noGap }
									onChange={ ( noGap ) =>
										setAttributes( { noGap } )
									}
									help={ __(
										'Remove gap between images.',
										'folioblocks'
									) }
									__nextHasNoMarginBottom
								/>
								{ imageProFeatureNotice( 'responsiveGaps' ) }
							</>,
							{ attributes, setAttributes }
					) }

					{ applyFilters(
						'folioBlocks.justifiedGallery.randomizeToggle',
						imageProFeatureNotice( 'randomize' ),
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
						help={ __( 'Choose what happens when visitors click gallery images.', 'folioblocks' ) }
					/>
					{ applyFilters(
						'folioBlocks.justifiedGallery.imageClickActionNotice',
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
								'folioBlocks.justifiedGallery.lightboxControls',
								null,
								{ attributes, setAttributes }
							) }
						{ activeImageClickAction === 'download' &&
							applyFilters(
								'folioBlocks.justifiedGallery.downloadControls',
								null,
								{ attributes, setAttributes }
							) }
						{ ( activeImageClickAction === 'custom_url' ||
							activeImageClickAction === 'page_post' ) &&
							applyFilters(
								'folioBlocks.justifiedGallery.linkTargetControls',
								null,
								{
									attributes,
									setAttributes,
									imageClickAction: activeImageClickAction,
								}
							) }
						{ activeImageClickAction === 'woocommerce' &&
							applyFilters(
								'folioBlocks.justifiedGallery.wooCommerceControls',
								null,
								{ attributes, setAttributes }
							) }
					</PanelBody>
					<PanelBody
						title={ __( 'Gallery Hover Settings', 'folioblocks' ) }
						initialOpen={ true }
					>
						{ applyFilters(
							'folioBlocks.justifiedGallery.onHoverTitleToggle',
							imageProFeatureNotice( 'hoverSettings' ),
							{ attributes, setAttributes }
						) }
					</PanelBody>
					<PanelBody
						title={ __( 'Gallery Filtering Settings', 'folioblocks' ) }
						initialOpen={ true }
				>
					{ applyFilters(
						'folioBlocks.justifiedGallery.enableFilterToggle',
						imageProFeatureNotice( 'filtering' ),
						{ attributes, setAttributes }
					) }
				</PanelBody>
				<PanelBody
					title={ __( 'Watermark Overlay', 'folioblocks' ) }
					initialOpen={ false }
				>
					{ applyFilters(
						'folioBlocks.justifiedGallery.watermarkControls',
						imageProFeatureNotice( 'watermarkOverlay' ),
						{ attributes, setAttributes }
					) }
				</PanelBody>
				<PanelBody
					title={ __( 'Social Media Sharing', 'folioblocks' ) }
					initialOpen={ false }
				>
					{ applyFilters(
						'folioBlocks.justifiedGallery.socialSharingControls',
						imageProFeatureNotice( 'socialSharing' ),
						{ attributes, setAttributes }
					) }
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="advanced">
				{ applyFilters(
					'folioBlocks.justifiedGallery.disableRightClickToggle',
					imageProFeatureNotice( 'protectionPerformance' ),
					{ attributes, setAttributes }
				) }
				{ applyFilters(
					'folioBlocks.justifiedGallery.lazyLoadToggle',
					null,
					{ attributes, setAttributes }
				) }
			</InspectorControls>
			<InspectorControls group="styles">
				<PanelBody
					title={ __( 'Gallery Image Styles', 'folioblocks' ) }
					initialOpen={ true }
				>
					{ applyFilters(
						'folioBlocks.justifiedGallery.imageStyles',
						imageProFeatureNotice( 'imageStyles' ),
						{ attributes, setAttributes }
					) }
				</PanelBody>
				{ applyFilters(
					'folioBlocks.justifiedGallery.iconStyleControls',
					null,
					{
						attributes,
						setAttributes,
					}
				) }
				{ applyFilters(
					'folioBlocks.justifiedGallery.hoverOverlayStyleControls',
					null,
					{
						attributes,
						setAttributes,
					}
				) }
				{ applyFilters(
					'folioBlocks.justifiedGallery.filterStyleSettings',
					<PanelBody title={ __( 'Gallery Filtering Styles', 'folioblocks' ) } initialOpen={ true }>{ imageProFeatureNotice( 'filterStyles' ) }</PanelBody>,
					{ attributes, setAttributes }
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
						icon={ <IconJustifiedGallery /> }
						labels={ {
							title: __( 'Justified Gallery', 'folioblocks' ),
							instructions: __(
								'Upload or select images to create a Justified Gallery.',
								'folioblocks'
							),
						} }
						onSelect={ onSelectImages }
						allowedTypes={ [ 'image' ] }
						multiple
					/>
				) : (
					<>
						{ applyFilters(
							'folioBlocks.justifiedGallery.renderFilterBar',
							null,
							{ attributes, setAttributes }
						) }
						<div ref={ combinedRef } { ...restInnerBlocksProps } />
					</>
				) }
			</div>
		</>
	);
}
