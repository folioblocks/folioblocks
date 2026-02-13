/**
 * Before & After Block
 * Edit JS
 */
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	MediaUpload,
	BlockControls,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	Button,
	Icon,
	PanelBody,
	Notice,
	ToolbarGroup,
	ToolbarButton,
	SelectControl,
} from '@wordpress/components';
import { useState, useRef, useEffect } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { media } from '@wordpress/icons';
import { IconBeforeAfter } from '../pb-helpers/icons';
import './editor.scss';

function CustomPlaceholder( {
	beforeImage,
	afterImage,
	onSelectBefore,
	onSelectAfter,
} ) {
	return (
		<div className="pb-split-placeholder">
			<div className="pb-placeholder-header">
				<Icon icon={ IconBeforeAfter } />
				<h2>{ __( 'Before & After Block', 'folioblocks' ) }</h2>
			</div>
			<p className="pb-placeholder-instructions">
				{ __(
					'Select two images for Before & After Block. For best results, use images with the same dimensions (width and height).',
					'folioblocks'
				) }
			</p>
			<div className="pb-placeholder-fields">
				<div>
					<p>{ __( 'Before Image', 'folioblocks' ) }</p>
					<MediaUpload
						onSelect={ onSelectBefore }
						allowedTypes={ [ 'image' ] }
						render={ ( { open } ) =>
							beforeImage?.src ? (
								<div
									onClick={ open }
									style={ { cursor: 'pointer' } }
								>
									<img
										src={ beforeImage.src }
										alt={ beforeImage.alt || '' }
										style={ {
											maxWidth: '100%',
											height: 'auto',
										} }
									/>
								</div>
							) : (
								<Button variant="primary" onClick={ open }>
									{ __( 'Select Before Image' ) }
								</Button>
							)
						}
					/>
				</div>
				<div>
					<p>{ __( 'After Image', 'folioblocks' ) }</p>
					<MediaUpload
						onSelect={ onSelectAfter }
						allowedTypes={ [ 'image' ] }
						render={ ( { open } ) =>
							afterImage?.src ? (
								<div
									onClick={ open }
									style={ { cursor: 'pointer' } }
								>
									<img
										src={ afterImage.src }
										alt={ afterImage.alt || '' }
										style={ {
											maxWidth: '100%',
											height: 'auto',
										} }
									/>
								</div>
							) : (
								<Button variant="secondary" onClick={ open }>
									{ __( 'Select After Image' ) }
								</Button>
							)
						}
					/>
				</div>
			</div>
		</div>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		beforeImage = {},
		afterImage = {},
		sliderOrientation = 'horizontal',
		sliderColor,
		preview,
	} = attributes;
	const [ sliderValue, setSliderValue ] = useState( 50 );
	const containerRef = useRef( null );
	const afterImageRef = useRef( null );

	const checkoutUrl =
		window.folioBlocksData?.checkoutUrl ||
		'https://folioblocks.com/folioblocks-pricing/?utm_source=folioblocks&utm_medium=before-after-block&utm_campaign=upgrade';

	// Block Preview Image
	if ( preview ) {
		return (
			<div className="pb-block-preview">
				<IconBeforeAfter />
			</div>
		);
	}

	useEffect( () => {
		if ( ! containerRef.current || ! afterImageRef.current ) {
			return;
		}

		const container = containerRef.current;
		const img = afterImageRef.current;

		const updateHeight = () => {
			if ( img.naturalWidth && img.naturalHeight ) {
				const aspectRatio = img.naturalHeight / img.naturalWidth;
				container.style.height = `${
					container.offsetWidth * aspectRatio
				}px`;
			}
		};

		if ( img.complete ) {
			updateHeight();
		} else {
			img.onload = updateHeight;
		}

		const observer = new ResizeObserver( updateHeight );
		observer.observe( container );

		return () => {
			observer.disconnect();
		};
	}, [ afterImage?.src ] );

	useEffect( () => {
		if ( beforeImage?.sizes ) {
			const newSrc =
				beforeImage.sizes[ attributes.resolution ]?.url ||
				beforeImage.src;
			setAttributes( {
				beforeImage: {
					...beforeImage,
					src: newSrc,
				},
			} );
		}
		if ( afterImage?.sizes ) {
			const newSrc =
				afterImage.sizes[ attributes.resolution ]?.url ||
				afterImage.src;
			setAttributes( {
				afterImage: {
					...afterImage,
					src: newSrc,
				},
			} );
		}
	}, [ attributes.resolution ] );

	const handleBeforeSelect = ( media ) => {
		const resolution = attributes.resolution || 'full';
		const src = media.sizes?.[ resolution ]?.url || media.url;
		setAttributes( {
			beforeImage: {
				id: media.id,
				src,
				alt: media.alt || '',
				sizes: media.sizes || {},
			},
		} );
	};

	const handleAfterSelect = ( media ) => {
		const resolution = attributes.resolution || 'full';
		const src = media.sizes?.[ resolution ]?.url || media.url;
		setAttributes( {
			afterImage: {
				id: media.id,
				src,
				alt: media.alt || '',
				sizes: media.sizes || {},
			},
		} );
	};

	const toolbarControls = (
		<BlockControls>
			<ToolbarGroup>
				<MediaUpload
					onSelect={ handleBeforeSelect }
					allowedTypes={ [ 'image' ] }
					render={ ( { open } ) => (
						<ToolbarButton
							label={ __(
								'Replace Before Image',
								'folioblocks'
							) }
							icon={ media }
							onClick={ open }
						>
							{ __( 'Replace Before Image', 'folioblocks' ) }
						</ToolbarButton>
					) }
				/>
				<MediaUpload
					onSelect={ handleAfterSelect }
					allowedTypes={ [ 'image' ] }
					render={ ( { open } ) => (
						<ToolbarButton
							label={ __( 'Replace After Image', 'folioblocks' ) }
							icon={ media }
							onClick={ open }
						>
							{ __( 'Replace After Image', 'folioblocks' ) }
						</ToolbarButton>
					) }
				/>
			</ToolbarGroup>
		</BlockControls>
	);

	const blockProps = useBlockProps();

	return (
		<>
			{ toolbarControls }
			{ beforeImage?.src && afterImage?.src && (
				<>
					<InspectorControls>
						<PanelBody
							title={ __(
								'Before & After Block Settings',
								'folioblocks'
							) }
							initialOpen={ true }
						>
							<div className="pb-thumbnail-row">
								<div className="pb-thumbnail">
									<p>{ __( 'Before', 'folioblocks' ) }</p>
									<div className="pb-thumbnail-wrapper">
										<img
											src={ beforeImage.src }
											alt={ beforeImage.alt || '' }
										/>
									</div>
								</div>
								<div className="pb-thumbnail">
									<p>{ __( 'After', 'folioblocks' ) }</p>
									<div className="pb-thumbnail-wrapper">
										<img
											src={ afterImage.src }
											alt={ afterImage.alt || '' }
										/>
									</div>
								</div>
							</div>
							<div className="pb-swap-button" marginBottom="15px">
								<Button
									variant="secondary"
									onClick={ () =>
										setAttributes( {
											beforeImage: afterImage,
											afterImage: beforeImage,
										} )
									}
								>
									{ __( 'Swap Position', 'folioblocks' ) }
								</Button>
							</div>
							<hr
								style={ {
									border: '0.5px solid #e0e0e0',
									margin: '12px 0',
								} }
							/>
							<SelectControl
								label={ __( 'Resolution', 'folioblocks' ) }
								value={ attributes.resolution }
								options={ [
									{ label: 'Thumbnail', value: 'thumbnail' },
									{ label: 'Medium', value: 'medium' },
									{ label: 'Large', value: 'large' },
									{ label: 'Full', value: 'full' },
								] }
								onChange={ ( value ) =>
									setAttributes( { resolution: value } )
								}
								help={ __(
									'Select the size of the source image.'
								) }
								__nextHasNoMarginBottom
								__next40pxDefaultSize
							/>
							<SelectControl
								label={ __(
									'Slider Orientation',
									'folioblocks'
								) }
								value={ attributes.sliderOrientation }
								options={ [
									{
										label: __(
											'Horizontal',
											'folioblocks'
										),
										value: 'horizontal',
									},
									{
										label: __( 'Vertical', 'folioblocks' ),
										value: 'vertical',
									},
								] }
								onChange={ ( newOrientation ) =>
									setAttributes( {
										sliderOrientation: newOrientation,
									} )
								}
								help={ __(
									'Choose whether the slider moves left-to-right or top-to-bottom.',
									'folioblocks'
								) }
								__nextHasNoMarginBottom
								__next40pxDefaultSize
							/>
							{ applyFilters(
								'folioBlocks.beforeAfter.dragHandlePosition',
								<div style={ { marginBottom: '8px' } }>
									<Notice
										status="info"
										isDismissible={ false }
									>
										<strong>
											{ __(
												'Drag Handle Starting Postion',
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
								{ attributes, setAttributes }
							) }

							{ applyFilters(
								'folioBlocks.beforeAfter.showLabelsToggle',
								<div style={ { marginBottom: '8px' } }>
									<Notice
										status="info"
										isDismissible={ false }
									>
										<strong>
											{ __(
												'Show Before & After Labels',
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
								{ attributes, setAttributes }
							) }
						</PanelBody>
					</InspectorControls>
					<InspectorControls group="advanced">
						{ applyFilters(
							'folioBlocks.beforeAfter.disableRightClickToggle',
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
							{ attributes, setAttributes }
						) }
						{ applyFilters(
							'folioBlocks.beforeAfter.lazyLoadToggle',
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
										{ __(
											'Upgrade to Pro',
											'folioblocks'
										) }
									</a>
								</Notice>
							</div>,
							{ attributes, setAttributes }
						) }
					</InspectorControls>
					<InspectorControls group="styles">
						{ applyFilters(
							'folioBlocks.beforeAfter.colorSettingsPanel',
							<PanelBody
								title={ __(
									'Slider & Label Styles',
									'folioblocks'
								) }
								initialOpen={ true }
							>
								<div style={ { marginBottom: '8px' } }>
									<Notice
										status="info"
										isDismissible={ false }
									>
										<strong>
											{ __(
												'Enable Slider & Label Style Controls',
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
								</div>
							</PanelBody>,
							{ attributes, setAttributes }
						) }
					</InspectorControls>
				</>
			) }
			<div { ...blockProps }>
				{ beforeImage?.src && afterImage?.src ? (
					<div
						className={ `pb-before-after-container ${
							sliderOrientation === 'vertical'
								? 'is-vertical'
								: ''
						}` }
						ref={ containerRef }
					>
						<div className="pb-after-wrapper">
							<img
								ref={ afterImageRef }
								className="pb-after-image"
								src={ afterImage.src }
								alt={ afterImage.alt }
							/>
							{ applyFilters(
								'folioBlocks.beforeAfter.renderAfterLabel',
								null,
								{ attributes }
							) }
						</div>
						<div
							className="pb-before-wrapper"
							style={
								sliderOrientation === 'vertical'
									? {
											clipPath: `inset(0 0 ${
												100 - sliderValue
											}% 0)`,
									  }
									: {
											clipPath: `inset(0 ${
												100 - sliderValue
											}% 0 0)`,
									  }
							}
						>
							<img
								className="pb-before-image"
								src={ beforeImage.src }
								alt={ beforeImage.alt }
							/>
							{ applyFilters(
								'folioBlocks.beforeAfter.renderBeforeLabel',
								null,
								{ attributes }
							) }
						</div>
						<input
							type="range"
							min="0"
							max="100"
							value={
								sliderOrientation === 'vertical'
									? 100 - sliderValue
									: sliderValue
							}
							className={ `pb-slider ${
								sliderOrientation === 'vertical'
									? 'is-vertical'
									: ''
							}` }
							onChange={ ( e ) =>
								sliderOrientation === 'vertical'
									? setSliderValue(
											100 - Number( e.target.value )
									  )
									: setSliderValue( Number( e.target.value ) )
							}
						/>
						<div
							className="pb-slider-handle"
							style={ {
								...( sliderOrientation === 'vertical'
									? { top: `${ sliderValue }%` }
									: { left: `${ sliderValue }%` } ),
								'--pb-slider-color': sliderColor,
								backgroundColor: sliderColor,
							} }
						></div>
					</div>
				) : (
					<CustomPlaceholder
						beforeImage={ beforeImage }
						afterImage={ afterImage }
						onSelectBefore={ handleBeforeSelect }
						onSelectAfter={ handleAfterSelect }
					/>
				) }
			</div>
		</>
	);
}
