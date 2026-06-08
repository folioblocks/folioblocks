/**
 * Masonry Gallery Block
 * Edit JS
 */
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	MediaPlaceholder,
	BlockControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	PanelBody,
	Notice,
	ToggleControl,
	SelectControl,
	ToolbarGroup,
	ToolbarButton,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import ResponsiveRangeControl from '../pb-helpers/ResponsiveRangeControl';
import { plus } from '@wordpress/icons';
import { applyFilters } from '@wordpress/hooks';
import { decodeEntities } from '@wordpress/html-entities';
import { IconMasonryGallery, IconPBSpinner } from '../pb-helpers/icons';
import { fbksNormalizeActiveFilterValue } from '../pb-helpers/filterConstants';
import { getExifAttributesFromMedia } from '../pb-helpers/exifMetadata';
import { getImageSizeOptions } from '../pb-helpers/imageSizeOptions';
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

export default function Edit( { clientId, attributes, setAttributes } ) {
	const {
		columns,
		tabletColumns,
		mobileColumns,
		lightbox,
		lightboxCaption,
		preview,
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
	}, [ window.folioBlocksData?.hasWooCommerce ] );

	const [ isLoading, setIsLoading ] = useState( false );
	const checkoutUrl =
		window.folioBlocksData?.checkoutUrl ||
		'https://folioblocks.com/folioblocks-pricing/?utm_source=folioblocks&utm_medium=masonry-gallery-block&utm_campaign=upgrade';

	// Block Preview Image
	if ( preview ) {
		return (
			<div className="pb-block-preview">
				<IconMasonryGallery />
			</div>
		);
	}

	const activeFilter = fbksNormalizeActiveFilterValue(
		attributes.activeFilter
	);

	const blockProps = useBlockProps( {
		context: {
			'folioBlocks/activeFilter': activeFilter,
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
		},
	} );

	const galleryRef = useRef( null );
	const layoutRafRef = useRef( null );
	const itemResizeObserverRef = useRef( null );
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

	const { children, ...innerBlocksProps } = useInnerBlocksProps(
		{ ref: galleryRef, className: 'pb-masonry-gallery' },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			orientation: 'horizontal',
			renderAppender: false,
		}
	);
	const isBlockOrChildSelected = useSelect(
		( select ) => {
			const blockEditor = select( 'core/block-editor' );
			const selectedId = blockEditor.getSelectedBlockClientId();
			if ( ! selectedId ) {
				return false;
			}

			// Gallery itself selected
			if ( selectedId === clientId ) {
				return true;
			}

			// A child pb-image-block inside this gallery selected
			const selectedBlock = blockEditor.getBlock( selectedId );
			if ( ! selectedBlock ) {
				return false;
			}

			if (
				selectedBlock.name === 'folioblocks/pb-image-block' &&
				blockEditor.getBlockRootClientId( selectedId ) === clientId
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

	// Select Images Handler
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
		const newImageIds = media
			.filter( ( image ) => ! existingImageIds.includes( image.id ) )
			.map( ( image ) => image.id );

		// Fetch all media titles in a single API call
		const responses = await wp.apiFetch( {
			path: `/wp/v2/media?include=${ newImageIds.join(
				','
			) }&per_page=100`,
		} );

			const titleMap = responses.reduce( ( acc, item ) => {
				acc[ item.id ] = item.title.rendered || '';
				return acc;
			}, {} );
			const mediaMap = responses.reduce( ( acc, item ) => {
				acc[ item.id ] = item;
				return acc;
			}, {} );

		// Create new blocks
		const newBlocks = media
			.filter( ( image ) => ! existingImageIds.includes( image.id ) )
			.map( ( image ) => {
				const title = decodeEntities( titleMap[ image.id ] || '' );
				return wp.blocks.createBlock( 'folioblocks/pb-image-block', {
					id: image.id,
					src: image.url,
					alt: image.alt || '',
						title,
						sizes: image.sizes || {},
						caption: image.caption || '',
						...( getExifAttributesFromMedia(
							mediaMap[ image.id ] || image
						) || {} ),
					} );
				} );

		// Replace inner blocks with the newly created blocks
		replaceInnerBlocks( clientId, [ ...currentBlocks, ...newBlocks ] );
		updateBlockAttributes( clientId, { _forceRefresh: Date.now() } );
		setIsLoading( false ); // <-- stop spinner
	};

	useEffect( () => {
		setAttributes( {
			images: innerBlocks.map( ( block ) => ( {
				id: block.attributes.id,
				src: block.attributes.src,
				alt: block.attributes.alt,
				title: block.attributes.title,
				caption: block.attributes.caption,
			} ) ),
		} );
	}, [ innerBlocks, attributes.randomizeOrder, setAttributes ] );

	const getColumnsForWidth = ( width ) => {
		if ( width <= 600 ) {
			return attributes.mobileColumns || 2;
		}
		if ( width <= 1024 ) {
			return attributes.tabletColumns || 4;
		}
		return attributes.columns || 6;
	};

	const applyCustomMasonryLayout = () => {
		const gallery = galleryRef.current;
		if ( ! gallery ) {
			return;
		}

		const gap = attributes.noGap ? 0 : 10;
		const columns = getColumnsForWidth( gallery.offsetWidth );
		const columnHeights = Array( columns ).fill( 0 );

		// Use rounded column width like front-end
		const columnWidth = Math.round(
			( gallery.offsetWidth - gap * ( columns - 1 ) ) / columns
		);

		gallery.style.position = 'relative';

		// Reset styles
		// NOTE: Filtering logic may apply `.is-hidden` to the inner block element.
		// We normalize that state by mirroring `.is-hidden` on the OUTER wrapper so
		// the masonry layout can reliably exclude hidden items.
		gallery
			.querySelectorAll( '.pb-image-block-wrapper' )
			.forEach( ( item ) => {
				item.style.position = '';
				item.style.top = '';
				item.style.left = '';
				item.style.width = '';

				// If the inner pb-image-block is hidden, also hide the wrapper.
				const inner = item.querySelector(
					'.wp-block-folioblocks-pb-image-block'
				);
				const shouldBeHidden =
					!! inner?.classList.contains( 'is-hidden' );
				item.classList.toggle( 'is-hidden', shouldBeHidden );
			} );

		const items = gallery.querySelectorAll(
			'.pb-image-block-wrapper:not(.is-hidden):not(:has(.wp-block-folioblocks-pb-image-block.is-hidden))'
		);
		items.forEach( ( item ) => {
			const minCol = columnHeights.indexOf(
				Math.min( ...columnHeights )
			);

			// Position with rounding like front-end
			item.style.position = 'absolute';
			item.style.width = `${ columnWidth }px`;
			item.style.top = `${ Math.round( columnHeights[ minCol ] ) }px`;
			item.style.left = `${ Math.round(
				( columnWidth + gap ) * minCol
			) }px`;

			// Include computed margin-bottom like front-end
			const style = window.getComputedStyle( item );
			const marginBottom = parseFloat( style.marginBottom ) || 0;

			columnHeights[ minCol ] += item.offsetHeight + gap + marginBottom;
		} );

		gallery.style.height = `${ Math.max( ...columnHeights ) }px`;
	};

	useEffect( () => {
		applyCustomMasonryLayout();
	}, [ activeFilter ] );

	useEffect( () => {
		const gallery = galleryRef.current;
		if ( ! gallery || innerBlocks.length === 0 ) {
			return;
		}

		const scheduleLayout = () => {
			if ( layoutRafRef.current ) {
				cancelAnimationFrame( layoutRafRef.current );
			}
			layoutRafRef.current = requestAnimationFrame( () => {
				applyCustomMasonryLayout();
			} );
		};

		const images = gallery.querySelectorAll( 'img' );
		let loadedImages = 0;

		const imageLoaded = () => {
			loadedImages += 1;
			if ( loadedImages === images.length ) {
				scheduleLayout();
			}
		};

		images.forEach( ( img ) => {
			if ( img.complete && img.naturalHeight !== 0 ) {
				imageLoaded();
			} else {
				img.onload = img.onerror = imageLoaded;
			}
		} );

		const fallbackTimeout = setTimeout( scheduleLayout, 1000 );

		const resizeObserver = new ResizeObserver( () => {
			scheduleLayout();
		} );

		// Observe individual items so border/shadow/style changes reflow the masonry
		const itemObserver = new ResizeObserver( () => {
			scheduleLayout();
		} );
		itemResizeObserverRef.current = itemObserver;
		const itemsForObserver = gallery.querySelectorAll(
			'.wp-block-folioblocks-pb-image-block'
		);
		itemsForObserver.forEach( ( el ) => itemObserver.observe( el ) );

		resizeObserver.observe( gallery );

		window.addEventListener( 'resize', scheduleLayout );

		return () => {
			clearTimeout( fallbackTimeout );
			if ( layoutRafRef.current ) {
				cancelAnimationFrame( layoutRafRef.current );
				layoutRafRef.current = null;
			}
			if ( itemResizeObserverRef.current ) {
				itemResizeObserverRef.current.disconnect();
				itemResizeObserverRef.current = null;
			}
			window.removeEventListener( 'resize', scheduleLayout );
			resizeObserver.disconnect(); // ✅ Cleanup observer on unmount
		};
	}, [
		innerBlocks,
		attributes.noGap,
		attributes.columns,
		attributes.tabletColumns,
		attributes.mobileColumns,
	] );

	applyFilters( 'folioBlocks.masonryGallery.filterLogic', null, {
		clientId,
		attributes,
		setAttributes,
		selectedBlock,
	} );
	applyFilters( 'folioBlocks.masonryGallery.editorEnhancements', null, {
		attributes,
		clientId,
		innerBlocks,
		replaceInnerBlocks,
		isBlockOrChildSelected,
		updateBlockAttributes,
	} );

	const imageClickAction = getImageClickAction( {
		lightbox,
		enableDownload: attributes.enableDownload,
		enableWooCommerce: effectiveEnableWoo,
		imageClickAction: attributes.imageClickAction,
	} );
	const imageClickActionOptions = applyFilters(
		'folioBlocks.masonryGallery.imageClickActionOptions',
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
							// Trigger the MediaUpload dialog
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
					title={ __( 'Masonry Gallery Settings', 'folioblocks' ) }
					initialOpen={ true }
				>
					<SelectControl
						label={ __( 'Resolution', 'folioblocks' ) }
						value={ attributes.resolution || 'large' }
						options={ imageSizeOptions }
						onChange={ ( newResolution ) => {
							setAttributes( { resolution: newResolution } );

							// Apply new resolution to all inner blocks and trigger a re-render
							innerBlocks.forEach( ( block ) => {
								const newSrc =
									block.attributes.sizes?.[ newResolution ]
										?.url || block.attributes.src;

								wp.data
									.dispatch( 'core/block-editor' )
									.updateBlockAttributes( block.clientId, {
										src: newSrc,
										imageSize: newResolution,
									} );
							} );

							updateBlockAttributes( clientId, {
								_forceRefresh: Date.now(),
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
						label={ __( 'Columns', 'folioblocks' ) }
						columns={ columns }
						tabletColumns={ tabletColumns }
						mobileColumns={ mobileColumns }
						onChange={ ( newValues ) => setAttributes( newValues ) }
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
					{ applyFilters(
						'folioBlocks.masonryGallery.randomizeToggle',
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
						'folioBlocks.masonryGallery.imageClickActionNotice',
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
						{ activeImageClickAction === 'lightbox' &&
							applyFilters(
								'folioBlocks.masonryGallery.lightboxControls',
								null,
								{ attributes, setAttributes }
							) }
						{ activeImageClickAction === 'download' &&
							applyFilters(
								'folioBlocks.masonryGallery.downloadControls',
								null,
								{ attributes, setAttributes }
							) }
						{ ( activeImageClickAction === 'custom_url' ||
							activeImageClickAction === 'page_post' ) &&
							applyFilters(
								'folioBlocks.masonryGallery.linkTargetControls',
								null,
								{
									attributes,
									setAttributes,
									imageClickAction: activeImageClickAction,
								}
							) }
						{ activeImageClickAction === 'woocommerce' &&
							applyFilters(
								'folioBlocks.masonryGallery.wooCommerceControls',
								null,
								{ attributes, setAttributes }
							) }
					</PanelBody>
					<PanelBody
						title={ __( 'Gallery Hover Settings', 'folioblocks' ) }
						initialOpen={ true }
					>
						{ applyFilters(
							'folioBlocks.masonryGallery.onHoverTitleToggle',
							<div style={ { marginBottom: '8px' } }>
								<Notice status="info" isDismissible={ false }>
									<strong>
										{ __( 'Gallery Hover Settings', 'folioblocks' ) }
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
						title={ __( 'Gallery Filtering Settings', 'folioblocks' ) }
						initialOpen={ true }
				>
					{ applyFilters(
						'folioBlocks.masonryGallery.enableFilterToggle',
						<div style={ { marginBottom: '8px' } }>
							<Notice status="info" isDismissible={ false }>
								<strong>
									{ __(
										'Enable Image Filtering',
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
			</InspectorControls>
			<InspectorControls group="advanced">
				{ applyFilters(
					'folioBlocks.masonryGallery.disableRightClickToggle',
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
					'folioBlocks.masonryGallery.lazyLoadToggle',
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
					title={ __( 'Gallery Image Styles', 'folioblocks' ) }
					initialOpen={ true }
				>
					{ applyFilters(
						'folioBlocks.masonryGallery.imageStyles',
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
					'folioBlocks.masonryGallery.filterStyleSettings',
					<PanelBody
						title={ __(
							'Gallery Filtering Styles',
							'folioblocks'
						) }
						initialOpen={ true }
					>
						<Notice status="info" isDismissible={ false }>
							<strong>
								{ __( 'Filter Bar Styles', 'folioblocks' ) }
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
					</PanelBody>,
					{ attributes, setAttributes }
				) }
				{ applyFilters(
					'folioBlocks.masonryGallery.iconStyleControls',
					null,
					{
						attributes,
						setAttributes,
					}
				) }
				{ applyFilters(
					'folioBlocks.masonryGallery.hoverOverlayStyleControls',
					null,
					{
						attributes,
						setAttributes,
					}
				) }
			</InspectorControls>

			<div
				{ ...blockProps }
				className={ `${ blockProps.className } ${
					attributes.dropShadow ? 'drop-shadow' : ''
				}` }
			>
				{ isLoading && (
					<div className="pb-spinner-wrapper">
						<IconPBSpinner />
					</div>
				) }
				{ ! isLoading && innerBlocks.length === 0 ? (
					<MediaPlaceholder
						icon={ <IconMasonryGallery /> }
						labels={ {
							title: __( 'Masonry Gallery', 'folioblocks' ),
							instructions: __(
								'Upload or select images to create a Masonry Gallery.',
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
							'folioBlocks.masonryGallery.renderFilterBar',
							null,
							{
								attributes,
								setAttributes,
							}
						) }
						<div { ...innerBlocksProps }>{ children }</div>
					</>
				) }
			</div>
		</>
	);
}
