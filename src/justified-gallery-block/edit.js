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
	Notice,
	ToggleControl,
	RangeControl,
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
import './editor.scss';

const ALLOWED_BLOCKS = [ 'folioblocks/pb-image-block' ];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { rowHeight = 250, noGap = false, preview, lightbox } = attributes;

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
	const checkoutUrl =
		window.folioBlocksData?.checkoutUrl ||
		'https://folioblocks.com/folioblocks-pricing/?utm_source=folioblocks&utm_medium=justified-gallery-block&utm_campaign=upgrade';
	const { replaceInnerBlocks, updateBlockAttributes } =
		useDispatch( 'core/block-editor' );

	const innerBlocks = useSelect(
		( select ) => select( 'core/block-editor' ).getBlocks( clientId ),
		[ clientId ]
	);

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

			const targetRowHeight = attributes.rowHeight || 250;
			const gap = attributes.noGap ? 0 : 10;
			const rows = [];
			let currentRow = [];
			let currentRowWidth = 0;

			images.forEach( ( img, i ) => {
				const aspectRatio = img.width / img.height;
				const scaledWidth = aspectRatio * targetRowHeight;
				currentRow.push( { ...img, scaledWidth, aspectRatio } );
				currentRowWidth += scaledWidth + gap;

				if (
					currentRowWidth >= containerWidth &&
					currentRow.length > 0
				) {
					rows.push( currentRow );
					currentRow = [];
					currentRowWidth = 0;
				}
			} );

			if ( currentRow.length > 0 ) {
				rows.push( currentRow );
			}

			rows.forEach( ( row ) => {
				const totalScaledWidth = row.reduce(
					( sum, img ) => sum + img.scaledWidth,
					0
				);
				const totalGaps = ( row.length - 1 ) * gap;
				const isFinalRow = row === rows[ rows.length - 1 ];
				const rowFillRatio =
					( totalScaledWidth + totalGaps ) / containerWidth;
				const shouldScale = ! isFinalRow || rowFillRatio > 0.9;
				const scale = shouldScale
					? Math.min(
							( containerWidth - totalGaps ) / totalScaledWidth,
							1
					  )
					: 1;

				row.forEach( ( img, index ) => {
					const isLast = index === row.length - 1;
					const finalWidth =
						Math.round( img.scaledWidth * scale ) -
						( isLast ? 1 : 0 );
					const finalHeight = Math.round( targetRowHeight * scale );
					img.wrapper.style.setProperty(
						'--pb-width',
						`${ finalWidth }px`
					);
					img.wrapper.style.setProperty(
						'--pb-height',
						`${ finalHeight }px`
					);
					img.wrapper.style.setProperty(
						'--pb-margin',
						index !== row.length - 1 ? `${ gap }px` : `0px`
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
		attributes.rowHeight,
		attributes.noGap,
		attributes.activeFilter,
		attributes.filterCategories,
	] );

	const blockProps = useBlockProps( {
		context: {
			'folioBlocks/activeFilter': attributes.activeFilter,
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
					<RangeControl
						label={ __( 'Row Height', 'folioblocks' ) }
						value={ rowHeight }
						onChange={ ( value ) =>
							setAttributes( { rowHeight: value } )
						}
						min={ 100 }
						max={ 500 }
						help={ __(
							'Approximate target Row Height for Justified layout.'
						) }
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<ToggleControl
						label={ __( 'Remove Image Gap', 'folioblocks' ) }
						checked={ noGap }
						onChange={ ( value ) =>
							setAttributes( { noGap: value } )
						}
						help={ __( 'Remove image gap from gallery.' ) }
						__nextHasNoMarginBottom
					/>

					{ applyFilters(
						'folioBlocks.justifiedGallery.randomizeToggle',
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
					title={ __( 'Lightbox & Hover Settings', 'folioblocks' ) }
					initialOpen={ true }
				>
					{ applyFilters(
						'folioBlocks.justifiedGallery.lightboxControls',
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
						'folioBlocks.justifiedGallery.onHoverTitleToggle',
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
				</PanelBody>
				<PanelBody
					title={ __( 'Gallery Filtering Settings', 'folioblocks' ) }
					initialOpen={ true }
				>
					{ applyFilters(
						'folioBlocks.justifiedGallery.enableFilterToggle',
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
						'folioBlocks.justifiedGallery.downloadControls',
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
						{
							attributes,
							setAttributes,
							hasWooCommerce,
							effectiveEnableWoo,
						}
					) }
					{ window.folioBlocksData?.hasWooCommerce &&
						applyFilters(
							'folioBlocks.justifiedGallery.wooCommerceControls',
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
								hasWooCommerce,
								effectiveEnableWoo,
							}
						) }
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="advanced">
				{ applyFilters(
					'folioBlocks.justifiedGallery.disableRightClickToggle',
					<div style={ { marginBottom: '8px' } }>
						<Notice status="info" isDismissible={ false }>
							<strong>
								{ __( 'Disable Right-Click', 'folioblocks' ) }
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
					'folioBlocks.justifiedGallery.lazyLoadToggle',
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
			<InspectorControls group="styles">
				<PanelBody
					title={ __( 'Gallery Image Styles', 'folioblocks' ) }
					initialOpen={ true }
				>
					{ applyFilters(
						'folioBlocks.justifiedGallery.imageStyles',
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
					'folioBlocks.justifiedGallery.filterStyleSettings',
					<div style={ { marginBottom: '8px' } }>
						<Notice status="info" isDismissible={ false }>
							<strong>
								{ __( 'Filter Bar Styles', 'folioblocks' ) }
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
					'folioBlocks.justifiedGallery.iconStyleControls',
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
