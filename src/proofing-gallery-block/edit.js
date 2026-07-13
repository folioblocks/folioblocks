/**
 * Proofing Gallery Block
 * Edit JS
 */
import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	MediaPlaceholder,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import {
	Button,
	Notice,
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { createBlock } from '@wordpress/blocks';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { applyFilters } from '@wordpress/hooks';
import apiFetch from '@wordpress/api-fetch';
import { getExifAttributesFromMedia } from '../pb-helpers/exifMetadata';
import { IconProofingGallery } from '../pb-helpers/icons';
import { imageProFeatureNotice } from '../pb-helpers/imageProFeatureNotices';
import './editor.scss';

const ALLOWED_BLOCKS = [
	'folioblocks/grid-gallery-block',
	'folioblocks/justified-gallery-block',
	'folioblocks/masonry-gallery-block',
];

const GALLERY_STYLE_OPTIONS = [
	{ label: __( 'Grid', 'folioblocks' ), value: 'grid' },
	{ label: __( 'Justified', 'folioblocks' ), value: 'justified' },
	{ label: __( 'Masonry', 'folioblocks' ), value: 'masonry' },
];

const PROOFING_FILTER_OPTIONS = [
	{ label: __( 'All Images', 'folioblocks' ), value: 'all', icon: 'all' },
	{ label: __( 'Hearted', 'folioblocks' ), value: 'hearted', icon: 'heart' },
	{
		label: __( 'Red Flag', 'folioblocks' ),
		value: 'flag-red',
		icon: 'flag',
		color: 'red',
	},
	{
		label: __( 'Orange Flag', 'folioblocks' ),
		value: 'flag-orange',
		icon: 'flag',
		color: 'orange',
	},
	{
		label: __( 'Green Flag', 'folioblocks' ),
		value: 'flag-green',
		icon: 'flag',
		color: 'green',
	},
	{
		label: __( 'Commented', 'folioblocks' ),
		value: 'commented',
		icon: 'comment',
	},
];

const GALLERY_BLOCK_BY_STYLE = {
	grid: 'folioblocks/grid-gallery-block',
	justified: 'folioblocks/justified-gallery-block',
	masonry: 'folioblocks/masonry-gallery-block',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getGalleryAttributesForStyle = () => ( {
	lightbox: true,
	lightboxTheme: 'dark',
	lightboxContent: 'none',
	imageClickAction: 'lightbox',
	imageClickTarget: 'thumbnail',
	enableDownload: false,
	enableWooCommerce: false,
	enableFilter: false,
	randomizeOrder: false,
	onHoverTitle: false,
} );

const createImageBlocks = ( media = [] ) =>
	media.map( ( image ) => {
		const fullSize = image.sizes?.full || {};
		return createBlock( 'folioblocks/pb-image-block', {
			id: image.id,
			src: image.url,
			alt: image.alt || '',
			title: decodeEntities( image.title || '' ),
			caption: image.caption || '',
			width: fullSize.width || image.width || 0,
			height: fullSize.height || image.height || 0,
			sizes: image.sizes || {},
			...( getExifAttributesFromMedia( image ) || {} ),
		} );
	} );

const ProofingFilterIcon = ( { icon } ) => {
	if ( icon === 'heart' ) {
		return (
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path d="M12 21s-7-4.4-9.4-8.2C.7 9.8 1.2 6.2 3.8 4.4 6 2.9 8.7 3.4 10.5 5.3L12 6.9l1.5-1.6c1.8-1.9 4.5-2.4 6.7-.9 2.6 1.8 3.1 5.4 1.2 8.4C19 16.6 12 21 12 21z" />
			</svg>
		);
	}

	if ( icon === 'flag' ) {
		return (
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path d="M6 21V4h10.6l.4 3.1h3v9H9.4L9 13.9H8V21H6z" />
			</svg>
		);
	}

	if ( icon === 'comment' ) {
		return (
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path d="M5 5h14v10H8.7L5 18.4V5z" />
			</svg>
		);
	}

	return <span aria-hidden="true">All</span>;
};

export default function Edit( { attributes, setAttributes, clientId } ) {
	const {
		clientEmail,
		galleryPassword,
		galleryStyle,
		filterAlign = 'center',
		preview,
	} = attributes;
	const [ setupError, setSetupError ] = useState( '' );
	const [ setupStep, setSetupStep ] = useState( 'credentials' );
	const [ showPassword, setShowPassword ] = useState( false );
	const [ proofingFilter, setProofingFilter ] = useState( 'all' );
	const [ activeSessionWarning, setActiveSessionWarning ] = useState( '' );
	const proofingGalleryRef = useRef( null );
	const { replaceInnerBlocks, updateBlockAttributes } =
		useDispatch( 'core/block-editor' );
	const innerBlocks = useSelect(
		( select ) => select( 'core/block-editor' ).getBlocks( clientId ),
		[ clientId ]
	);
	const currentPostId = useSelect(
		( select ) => select( 'core/editor' )?.getCurrentPostId?.() || 0,
		[]
	);
	const hasGallery = innerBlocks.length > 0;
	const blockProps = useBlockProps( {
		ref: proofingGalleryRef,
		className: [
			'fbks-proofing-gallery',
			hasGallery ? '' : 'is-setup',
			hasGallery && proofingFilter !== 'all'
				? `is-filter-${ proofingFilter }`
				: '',
		]
			.filter( Boolean )
			.join( ' ' ),
	} );
	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'fbks-proofing-gallery__inner',
		},
		{
			allowedBlocks: ALLOWED_BLOCKS,
			templateLock: false,
			renderAppender: hasGallery ? false : undefined,
		}
	);

	useEffect( () => {
		const gallery = proofingGalleryRef.current;
		if ( ! gallery || ! hasGallery ) {
			return;
		}

		const applyProofingFilter = () => {
			const images = gallery.querySelectorAll(
				'.wp-block-folioblocks-pb-image-block'
			);

			images.forEach( ( image ) => {
				const flagColor = image.dataset.proofingFlag || '';
				const shouldShow =
					proofingFilter === 'all' ||
					( proofingFilter === 'hearted' &&
						image.dataset.proofingHearted === 'true' ) ||
					( proofingFilter === 'commented' &&
						image.dataset.proofingCommented === 'true' ) ||
					( proofingFilter.startsWith( 'flag-' ) &&
						flagColor === proofingFilter.replace( 'flag-', '' ) );

				image.classList.toggle( 'is-hidden', ! shouldShow );
			} );

			requestAnimationFrame( () => {
				window.dispatchEvent(
					new CustomEvent( 'folioblocks:proofing-filter-change', {
						detail: { clientId, filter: proofingFilter },
					} )
				);
			} );
		};

		applyProofingFilter();

		const handleProofingStateChange = () => {
			requestAnimationFrame( applyProofingFilter );
		};

		window.addEventListener(
			'folioblocks:proofing-state-change',
			handleProofingStateChange
		);

		return () => {
			window.removeEventListener(
				'folioblocks:proofing-state-change',
				handleProofingStateChange
			);
		};
	}, [ clientId, hasGallery, proofingFilter ] );

	useEffect( () => {
		if ( ! currentPostId || ! hasGallery ) {
			setActiveSessionWarning( '' );
			return;
		}

		let isMounted = true;

		apiFetch( {
			path: `/folioblocks/v1/proofing-gallery/page-sessions?pageId=${ currentPostId }`,
		} )
			.then( ( response ) => {
				if ( ! isMounted ) {
					return;
				}

				setActiveSessionWarning(
					response?.inProgress
						? __(
								'A client proofing session is in progress for this page. Avoid updating this page until the client submits their selections.',
								'folioblocks'
						  )
						: ''
				);
			} )
			.catch( () => {
				if ( isMounted ) {
					setActiveSessionWarning( '' );
				}
			} );

		return () => {
			isMounted = false;
		};
	}, [ currentPostId, hasGallery ] );

	useEffect( () => {
		const gallery = innerBlocks[ 0 ];
		if ( ! gallery ) {
			return;
		}

		const proofingWatermarkWasConfigured =
			!! attributes.enableWatermarking ||
			!! attributes.watermarkId ||
			( attributes.watermarkDisplay &&
				attributes.watermarkDisplay !== 'none' );

		if ( ! proofingWatermarkWasConfigured ) {
			return;
		}

		const nextWatermarkAttributes = {
			enableWatermarking: !! attributes.enableWatermarking,
			watermarkId: attributes.watermarkId || '',
			watermarkDisplay: attributes.watermarkDisplay || 'none',
		};
		const currentGalleryAttributes = gallery.attributes || {};
		const shouldSyncWatermark =
			currentGalleryAttributes.enableWatermarking !==
				nextWatermarkAttributes.enableWatermarking ||
			currentGalleryAttributes.watermarkId !==
				nextWatermarkAttributes.watermarkId ||
			currentGalleryAttributes.watermarkDisplay !==
				nextWatermarkAttributes.watermarkDisplay;

		if ( shouldSyncWatermark ) {
			updateBlockAttributes( gallery.clientId, nextWatermarkAttributes );
		}
	}, [
		attributes.enableWatermarking,
		attributes.watermarkId,
		attributes.watermarkDisplay,
		innerBlocks,
		updateBlockAttributes,
	] );

	if ( preview ) {
		return (
			<div className="pb-block-preview">
				<IconProofingGallery />
			</div>
		);
	}

	const validateSetup = () => {
		if ( ! EMAIL_PATTERN.test( clientEmail.trim() ) ) {
			return __(
				'Enter a valid client email address before creating the proofing gallery.',
				'folioblocks'
			);
		}
		if ( ! galleryPassword.trim() ) {
			return __(
				'Set a gallery password before creating the proofing gallery.',
				'folioblocks'
			);
		}
		return '';
	};

	const goToGalleryStyleStep = () => {
		const error = validateSetup();
		if ( error ) {
			setSetupError( error );
			return;
		}

		setSetupError( '' );
		setSetupStep( 'style' );
	};

	const goToImagesStep = () => {
		setSetupError( '' );
		setSetupStep( 'images' );
	};

	const createProofingGallery = ( media ) => {
		const error = validateSetup();
		if ( error ) {
			setSetupError( error );
			return;
		}

		const style = galleryStyle || 'grid';
		const galleryBlockName = GALLERY_BLOCK_BY_STYLE[ style ];
		const imageBlocks = createImageBlocks( media || [] );
		const galleryBlock = createBlock(
			galleryBlockName,
			getGalleryAttributesForStyle( style, attributes ),
			imageBlocks
		);

		replaceInnerBlocks( clientId, [ galleryBlock ], false );
		setSetupError( '' );
	};

	const changeGalleryStyle = ( nextStyle ) => {
		setAttributes( { galleryStyle: nextStyle } );

		const gallery = innerBlocks[ 0 ];
		if ( ! gallery ) {
			return;
		}

		const nextBlockName = GALLERY_BLOCK_BY_STYLE[ nextStyle ];
		if ( gallery.name === nextBlockName ) {
			updateBlockAttributes(
				gallery.clientId,
				getGalleryAttributesForStyle( nextStyle, attributes )
			);
			return;
		}

		replaceInnerBlocks(
			clientId,
			[
				createBlock(
					nextBlockName,
					getGalleryAttributesForStyle( nextStyle, attributes ),
					gallery.innerBlocks || []
				),
			],
			false
		);
	};

	return (
		<>
			<InspectorControls>
				{ activeSessionWarning && (
					<Notice status="warning" isDismissible={ false }>
						{ activeSessionWarning }
					</Notice>
				) }
				<PanelBody
					title={ __( 'Proofing Gallery Settings', 'folioblocks' ) }
					initialOpen={ true }
				>
					<TextControl
						label={ __( 'Client Email Address', 'folioblocks' ) }
						value={ clientEmail }
						type="email"
						onChange={ ( value ) =>
							setAttributes( { clientEmail: value } )
						}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						help={ __(
							'Used to identify the client connected to this private proofing gallery.',
							'folioblocks'
						) }
					/>
					<TextControl
						label={ __( 'Gallery Password', 'folioblocks' ) }
						value={ galleryPassword }
						type={ showPassword ? 'text' : 'password' }
						onChange={ ( value ) =>
							setAttributes( { galleryPassword: value } )
						}
						autoComplete="new-password"
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						help={ __(
							'Visitors must enter this password before they can view the proofing gallery. Site admins bypass this lock.',
							'folioblocks'
						) }
					/>
					<div className="fbks-proofing-inspector__password-action">
						<Button
							variant="secondary"
							size="compact"
							onClick={ () => setShowPassword( ! showPassword ) }
						>
							{ showPassword
								? __( 'Hide Password', 'folioblocks' )
								: __( 'View Password', 'folioblocks' ) }
						</Button>
					</div>
					<div className="fbks-proofing-inspector__gallery-style">
						<SelectControl
							label={ __( 'Gallery Style', 'folioblocks' ) }
							value={ galleryStyle }
							options={ GALLERY_STYLE_OPTIONS }
							onChange={ changeGalleryStyle }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							help={ __(
								'Choose which inner gallery block is used for layout. Columns, gap, row height, and resolution are edited on that nested gallery.',
								'folioblocks'
							) }
						/>
					</div>
					<div className="fbks-proofing-inspector__section-label">
						{ __( 'Proofing Options', 'folioblocks' ) }
					</div>
					<ToggleControl
						label={ __( 'Enable Heart', 'folioblocks' ) }
						checked={ attributes.enableHeart !== false }
						onChange={ ( value ) =>
							setAttributes( { enableHeart: value } )
						}
						__nextHasNoMarginBottom
						help={ __(
							'Show a heart icon so clients can mark images they like.',
							'folioblocks'
						) }
					/>
					<ToggleControl
						label={ __( 'Enable Flag', 'folioblocks' ) }
						checked={ attributes.enableFlag !== false }
						onChange={ ( value ) =>
							setAttributes( { enableFlag: value } )
						}
						__nextHasNoMarginBottom
						help={ __(
							'Show a flag icon so clients can assign a red, orange, or green status to images.',
							'folioblocks'
						) }
					/>
					<ToggleControl
						label={ __( 'Enable Comment', 'folioblocks' ) }
						checked={ attributes.enableComment !== false }
						onChange={ ( value ) =>
							setAttributes( { enableComment: value } )
						}
						__nextHasNoMarginBottom
						help={ __(
							'Show a comment icon for image-specific client notes. The comment workflow is front-end only.',
							'folioblocks'
						) }
					/>
					<ToggleGroupControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						value={ filterAlign }
						isBlock
						label={ __( 'Filter Bar Alignment', 'folioblocks' ) }
						help={ __(
							'Set alignment of the proofing filter bar.',
							'folioblocks'
						) }
						onChange={ ( value ) =>
							setAttributes( { filterAlign: value } )
						}
					>
						<ToggleGroupControlOption
							label={ __( 'Left', 'folioblocks' ) }
							value="left"
						/>
						<ToggleGroupControlOption
							label={ __( 'Center', 'folioblocks' ) }
							value="center"
						/>
						<ToggleGroupControlOption
							label={ __( 'Right', 'folioblocks' ) }
							value="right"
						/>
					</ToggleGroupControl>
				</PanelBody>
				<PanelBody
					title={ __( 'Watermark Overlay', 'folioblocks' ) }
					initialOpen={ false }
				>
					{ applyFilters(
						'folioBlocks.proofingGallery.watermarkControls',
						imageProFeatureNotice( 'watermarkOverlay' ),
						{ attributes, setAttributes }
					) }
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				{ ! hasGallery ? (
					<div className="fbks-proofing-gallery__setup">
						{ setupStep === 'images' ? (
							<div className="fbks-proofing-gallery__image-step">
								<Button
									className="fbks-proofing-gallery__image-back"
									variant="secondary"
									onClick={ () => setSetupStep( 'style' ) }
								>
									{ __( 'Back', 'folioblocks' ) }
								</Button>
								<MediaPlaceholder
									icon={ <IconProofingGallery /> }
									labels={ {
										title: __(
											'Proofing Gallery',
											'folioblocks'
										),
										instructions: __(
											'Upload images or select them from the Media Library.',
											'folioblocks'
										),
									} }
									onSelect={ createProofingGallery }
									allowedTypes={ [ 'image' ] }
									multiple
								/>
							</div>
						) : (
							<div className="components-placeholder fbks-proofing-gallery__placeholder">
								<div className="components-placeholder__label">
									<IconProofingGallery />
									{ __( 'Proofing Gallery', 'folioblocks' ) }
								</div>
								<div className="components-placeholder__instructions">
									{ setupStep === 'credentials'
										? __(
												'Add the client email address and set a password for this proofing gallery.',
												'folioblocks'
										  )
										: __(
												'Choose the gallery layout clients will use to proof these images.',
												'folioblocks'
										  ) }
								</div>
								{ setupStep === 'credentials' ? (
									<div className="fbks-proofing-gallery__setup-fields">
										<TextControl
											label={ __(
												'Client Email Address',
												'folioblocks'
											) }
											value={ clientEmail }
											type="email"
											onChange={ ( value ) =>
												setAttributes( {
													clientEmail: value,
												} )
											}
											__next40pxDefaultSize
											__nextHasNoMarginBottom
										/>
										<TextControl
											label={ __(
												'Gallery Password',
												'folioblocks'
											) }
											value={ galleryPassword }
											type="password"
											onChange={ ( value ) =>
												setAttributes( {
													galleryPassword: value,
												} )
											}
											autoComplete="new-password"
											__next40pxDefaultSize
											__nextHasNoMarginBottom
										/>
									</div>
								) : (
									<div className="fbks-proofing-gallery__style-field">
										<SelectControl
											label={ __(
												'Gallery Style',
												'folioblocks'
											) }
											value={ galleryStyle }
											options={ GALLERY_STYLE_OPTIONS }
											onChange={ ( value ) =>
												setAttributes( {
													galleryStyle: value,
												} )
											}
											__next40pxDefaultSize
											__nextHasNoMarginBottom
										/>
									</div>
								) }
								{ setupError && (
									<Notice
										status="warning"
										isDismissible={ false }
									>
										{ setupError }
									</Notice>
								) }
								<div className="fbks-proofing-gallery__setup-actions">
									{ setupStep === 'style' && (
										<Button
											variant="secondary"
											onClick={ () =>
												setSetupStep( 'credentials' )
											}
										>
											{ __( 'Back', 'folioblocks' ) }
										</Button>
									) }
									<Button
										variant="primary"
										onClick={
											setupStep === 'credentials'
												? goToGalleryStyleStep
												: goToImagesStep
										}
									>
										{ __( 'Next', 'folioblocks' ) }
									</Button>
								</div>
							</div>
						) }
					</div>
				) : (
					<>
						<div
							className={ `fbks-proofing-gallery__filter-bar align-${ filterAlign }` }
							aria-label={ __(
								'Proofing filters',
								'folioblocks'
							) }
						>
							{ PROOFING_FILTER_OPTIONS.map( ( option ) => (
								<button
									type="button"
									key={ option.value }
									className={ [
										'fbks-proofing-filter-button',
										proofingFilter === option.value
											? 'is-active'
											: '',
										option.color
											? `is-${ option.color }`
											: '',
										`is-${ option.icon }`,
									]
										.filter( Boolean )
										.join( ' ' ) }
									onClick={ () =>
										setProofingFilter( option.value )
									}
									aria-pressed={
										proofingFilter === option.value
									}
									aria-label={ option.label }
									title={ option.label }
								>
									<ProofingFilterIcon icon={ option.icon } />
								</button>
							) ) }
						</div>
						<div { ...innerBlocksProps } />
						<div className="fbks-proofing-gallery__actions">
							<Button variant="secondary" disabled>
								{ __( 'Save & Continue', 'folioblocks' ) }
							</Button>
							<Button variant="primary" disabled>
								{ __( 'Submit', 'folioblocks' ) }
							</Button>
						</div>
					</>
				) }
			</div>
		</>
	);
}
