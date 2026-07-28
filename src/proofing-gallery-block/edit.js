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
	BaseControl,
	Button,
	Notice,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { createBlock } from '@wordpress/blocks';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { applyFilters } from '@wordpress/hooks';
import apiFetch from '@wordpress/api-fetch';
import { Icon, sidesHorizontal, sidesVertical } from '@wordpress/icons';
import { getExifAttributesFromMedia } from '../pb-helpers/exifMetadata';
import { IconProofingGallery } from '../pb-helpers/icons';
import { imageProFeatureNotice } from '../pb-helpers/imageProFeatureNotices';
import { CompactTwoColorControl } from '../pb-helpers/CompactColorControl';
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

const GALLERY_STYLE_BY_BLOCK = Object.fromEntries(
	Object.entries( GALLERY_BLOCK_BY_STYLE ).map( ( [ style, blockName ] ) => [
		blockName,
		style,
	] )
);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PROOFING_BUTTON_STYLE_DEFAULTS = {
	saveButtonTextColor: '#3858e9',
	saveButtonBackgroundColor: '#ffffff',
	submitButtonTextColor: '#ffffff',
	submitButtonBackgroundColor: '#3858e9',
	buttonBorderRadius: 2,
	buttonBorderWidth: 1,
	buttonPaddingVertical: 6,
	buttonPaddingHorizontal: 12,
	buttonFontSize: 13,
	buttonGap: 12,
};

const getGlobalProofingSettings = () =>
	typeof window !== 'undefined'
		? window.folioBlocksData?.proofing || {}
		: {};

const getProofingButtonStyleVars = ( attributes = {} ) => ( {
	'--fbks-proofing-save-button-color':
		attributes.saveButtonTextColor ||
		PROOFING_BUTTON_STYLE_DEFAULTS.saveButtonTextColor,
	'--fbks-proofing-save-button-bg':
		attributes.saveButtonBackgroundColor ||
		PROOFING_BUTTON_STYLE_DEFAULTS.saveButtonBackgroundColor,
	'--fbks-proofing-submit-button-color':
		attributes.submitButtonTextColor ||
		PROOFING_BUTTON_STYLE_DEFAULTS.submitButtonTextColor,
	'--fbks-proofing-submit-button-bg':
		attributes.submitButtonBackgroundColor ||
		PROOFING_BUTTON_STYLE_DEFAULTS.submitButtonBackgroundColor,
	'--fbks-proofing-button-radius': `${
		attributes.buttonBorderRadius ??
		PROOFING_BUTTON_STYLE_DEFAULTS.buttonBorderRadius
	}px`,
	'--fbks-proofing-button-border-width': `${
		attributes.buttonBorderWidth ??
		PROOFING_BUTTON_STYLE_DEFAULTS.buttonBorderWidth
	}px`,
	'--fbks-proofing-button-padding-y': `${
		attributes.buttonPaddingVertical ??
		PROOFING_BUTTON_STYLE_DEFAULTS.buttonPaddingVertical
	}px`,
	'--fbks-proofing-button-padding-x': `${
		attributes.buttonPaddingHorizontal ??
		PROOFING_BUTTON_STYLE_DEFAULTS.buttonPaddingHorizontal
	}px`,
	'--fbks-proofing-button-font-size': `${
		attributes.buttonFontSize ??
		PROOFING_BUTTON_STYLE_DEFAULTS.buttonFontSize
	}px`,
	'--fbks-proofing-button-gap': `${
		attributes.buttonGap ?? PROOFING_BUTTON_STYLE_DEFAULTS.buttonGap
	}px`,
} );

const hasCustomProofingButtonValue = ( attributes, key ) =>
	attributes[ key ] !== undefined &&
	attributes[ key ] !== PROOFING_BUTTON_STYLE_DEFAULTS[ key ];

const AlignmentControl = ( { label, help, value, onChange } ) => (
	<ToggleGroupControl
		__next40pxDefaultSize
		__nextHasNoMarginBottom
		value={ value }
		isBlock
		label={ label }
		help={ help }
		onChange={ onChange }
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
);

const ProofingThemeControl = ( { value, onChange } ) => (
	<ToggleGroupControl
		__next40pxDefaultSize
		__nextHasNoMarginBottom
		value={ value }
		isBlock
		label={ __( 'Proofing UI Mode', 'folioblocks' ) }
		help={ __(
			'Choose light or dark styling for proofing filters, flags, and comments.',
			'folioblocks'
		) }
		onChange={ onChange }
	>
		<ToggleGroupControlOption
			label={ __( 'Light', 'folioblocks' ) }
			value="light"
		/>
		<ToggleGroupControlOption
			label={ __( 'Dark', 'folioblocks' ) }
			value="dark"
		/>
	</ToggleGroupControl>
);

const ProofingButtonPaddingControl = ( { attributes, setAttributes } ) => (
	<BaseControl
		label={ __( 'Padding', 'folioblocks' ) }
		__nextHasNoMarginBottom
		className="fbks-proofing-button-padding-control"
	>
		<div className="fbks-proofing-button-padding-control__rows">
			<div className="fbks-proofing-button-padding-control__row">
				<Icon
					icon={ sidesVertical }
					className="fbks-proofing-button-padding-control__icon"
				/>
				<RangeControl
					label={ __( 'Vertical Padding', 'folioblocks' ) }
					hideLabelFromVision
					value={
						attributes.buttonPaddingVertical ??
						PROOFING_BUTTON_STYLE_DEFAULTS.buttonPaddingVertical
					}
					onChange={ ( buttonPaddingVertical ) =>
						setAttributes( { buttonPaddingVertical } )
					}
					min={ 0 }
					max={ 24 }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			</div>
			<div className="fbks-proofing-button-padding-control__row">
				<Icon
					icon={ sidesHorizontal }
					className="fbks-proofing-button-padding-control__icon"
				/>
				<RangeControl
					label={ __( 'Horizontal Padding', 'folioblocks' ) }
					hideLabelFromVision
					value={
						attributes.buttonPaddingHorizontal ??
						PROOFING_BUTTON_STYLE_DEFAULTS.buttonPaddingHorizontal
					}
					onChange={ ( buttonPaddingHorizontal ) =>
						setAttributes( { buttonPaddingHorizontal } )
					}
					min={ 4 }
					max={ 48 }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			</div>
		</div>
	</BaseControl>
);

const ProofingButtonStyleToolsPanel = ( { attributes, setAttributes } ) => {
	const resetButtonColors = () =>
		setAttributes( {
			saveButtonTextColor:
				PROOFING_BUTTON_STYLE_DEFAULTS.saveButtonTextColor,
			saveButtonBackgroundColor:
				PROOFING_BUTTON_STYLE_DEFAULTS.saveButtonBackgroundColor,
			submitButtonTextColor:
				PROOFING_BUTTON_STYLE_DEFAULTS.submitButtonTextColor,
			submitButtonBackgroundColor:
				PROOFING_BUTTON_STYLE_DEFAULTS.submitButtonBackgroundColor,
		} );
	const resetButtonShape = () =>
		setAttributes( {
			buttonBorderRadius:
				PROOFING_BUTTON_STYLE_DEFAULTS.buttonBorderRadius,
			buttonBorderWidth:
				PROOFING_BUTTON_STYLE_DEFAULTS.buttonBorderWidth,
		} );
	const resetButtonSize = () =>
		setAttributes( {
			buttonPaddingVertical:
				PROOFING_BUTTON_STYLE_DEFAULTS.buttonPaddingVertical,
			buttonPaddingHorizontal:
				PROOFING_BUTTON_STYLE_DEFAULTS.buttonPaddingHorizontal,
			buttonFontSize: PROOFING_BUTTON_STYLE_DEFAULTS.buttonFontSize,
			buttonGap: PROOFING_BUTTON_STYLE_DEFAULTS.buttonGap,
		} );

	return (
		<ToolsPanel
			label={ __( 'Save & Submit Button Styles', 'folioblocks' ) }
			className="fbks-proofing-button-style-panel"
			resetAll={ () =>
				setAttributes( { ...PROOFING_BUTTON_STYLE_DEFAULTS } )
			}
		>
			<ToolsPanelItem
				label={ __( 'Colors', 'folioblocks' ) }
				hasValue={ () =>
					[
						'saveButtonTextColor',
						'saveButtonBackgroundColor',
						'submitButtonTextColor',
						'submitButtonBackgroundColor',
					].some( ( key ) =>
						hasCustomProofingButtonValue( attributes, key )
					)
				}
				onDeselect={ resetButtonColors }
				isShownByDefault
			>
				<div className="fbks-proofing-button-color-controls">
					<CompactTwoColorControl
						label={ __( 'Save Button', 'folioblocks' ) }
						value={ {
							first:
								attributes.saveButtonTextColor ||
								PROOFING_BUTTON_STYLE_DEFAULTS.saveButtonTextColor,
							second:
								attributes.saveButtonBackgroundColor ||
								PROOFING_BUTTON_STYLE_DEFAULTS.saveButtonBackgroundColor,
						} }
						onChange={ ( next ) =>
							setAttributes( {
								saveButtonTextColor:
									next?.first ||
									PROOFING_BUTTON_STYLE_DEFAULTS.saveButtonTextColor,
								saveButtonBackgroundColor:
									next?.second ||
									PROOFING_BUTTON_STYLE_DEFAULTS.saveButtonBackgroundColor,
							} )
						}
						firstLabel={ __( 'Text & Border', 'folioblocks' ) }
						secondLabel={ __( 'Background', 'folioblocks' ) }
					/>
					<CompactTwoColorControl
						label={ __( 'Submit Button', 'folioblocks' ) }
						value={ {
							first:
								attributes.submitButtonTextColor ||
								PROOFING_BUTTON_STYLE_DEFAULTS.submitButtonTextColor,
							second:
								attributes.submitButtonBackgroundColor ||
								PROOFING_BUTTON_STYLE_DEFAULTS.submitButtonBackgroundColor,
						} }
						onChange={ ( next ) =>
							setAttributes( {
								submitButtonTextColor:
									next?.first ||
									PROOFING_BUTTON_STYLE_DEFAULTS.submitButtonTextColor,
								submitButtonBackgroundColor:
									next?.second ||
									PROOFING_BUTTON_STYLE_DEFAULTS.submitButtonBackgroundColor,
							} )
						}
						firstLabel={ __( 'Text', 'folioblocks' ) }
						secondLabel={ __(
							'Background & Border',
							'folioblocks'
						) }
					/>
				</div>
			</ToolsPanelItem>
			<ToolsPanelItem
				label={ __( 'Shape', 'folioblocks' ) }
				hasValue={ () =>
					[ 'buttonBorderRadius', 'buttonBorderWidth' ].some(
						( key ) =>
							hasCustomProofingButtonValue( attributes, key )
					)
				}
				onDeselect={ resetButtonShape }
				isShownByDefault
			>
				<RangeControl
					label={ __( 'Border Radius', 'folioblocks' ) }
					value={
						attributes.buttonBorderRadius ??
						PROOFING_BUTTON_STYLE_DEFAULTS.buttonBorderRadius
					}
					onChange={ ( buttonBorderRadius ) =>
						setAttributes( { buttonBorderRadius } )
					}
					min={ 0 }
					max={ 40 }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				<RangeControl
					label={ __( 'Border Width', 'folioblocks' ) }
					value={
						attributes.buttonBorderWidth ??
						PROOFING_BUTTON_STYLE_DEFAULTS.buttonBorderWidth
					}
					onChange={ ( buttonBorderWidth ) =>
						setAttributes( { buttonBorderWidth } )
					}
					min={ 0 }
					max={ 8 }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			</ToolsPanelItem>
			<ToolsPanelItem
				label={ __( 'Size & Spacing', 'folioblocks' ) }
				hasValue={ () =>
					[
						'buttonPaddingVertical',
						'buttonPaddingHorizontal',
						'buttonFontSize',
						'buttonGap',
					].some( ( key ) =>
						hasCustomProofingButtonValue( attributes, key )
					)
				}
				onDeselect={ resetButtonSize }
				isShownByDefault
			>
				<ProofingButtonPaddingControl
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
				<RangeControl
					label={ __( 'Font Size', 'folioblocks' ) }
					value={
						attributes.buttonFontSize ??
						PROOFING_BUTTON_STYLE_DEFAULTS.buttonFontSize
					}
					onChange={ ( buttonFontSize ) =>
						setAttributes( { buttonFontSize } )
					}
					min={ 10 }
					max={ 24 }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				<RangeControl
					label={ __( 'Button Gap', 'folioblocks' ) }
					value={
						attributes.buttonGap ??
						PROOFING_BUTTON_STYLE_DEFAULTS.buttonGap
					}
					onChange={ ( buttonGap ) =>
						setAttributes( { buttonGap } )
					}
					min={ 0 }
					max={ 40 }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			</ToolsPanelItem>
		</ToolsPanel>
	);
};

const getGalleryPasswordControlProps = ( isVisible = false ) => ( {
	type: 'text',
	className: [ 'fbks-proofing-password-field', isVisible ? '' : 'is-masked' ]
		.filter( Boolean )
		.join( ' ' ),
	autoComplete: 'new-password',
	autoCorrect: 'off',
	autoCapitalize: 'off',
	spellCheck: false,
	name: 'fbks-proofing-client-gallery-key',
	'data-lpignore': 'true',
	'data-1p-ignore': 'true',
	'data-form-type': 'other',
} );

const clientEmailControlProps = {
	type: 'text',
	inputMode: 'email',
	autoComplete: 'off',
	autoCorrect: 'off',
	autoCapitalize: 'off',
	spellCheck: false,
	name: 'fbks-proofing-client-reference',
	'data-lpignore': 'true',
	'data-1p-ignore': 'true',
	'data-form-type': 'other',
};

const getProofingGalleryWorkflowAttributes = () => ( {
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

const getGalleryDefaultsForStyle = ( style, attributes ) => {
	const sharedDefaults = {
		resolution: attributes.resolution || 'large',
		gap: attributes.gap ?? 10,
		tabletGap: attributes.tabletGap ?? 10,
		mobileGap: attributes.mobileGap ?? 10,
		borderWidth: attributes.borderWidth ?? 0,
		borderRadius: attributes.borderRadius ?? 0,
		borderColor: attributes.borderColor || '#ffffff',
		dropShadow: !! attributes.dropShadow,
		shadowStyle: attributes.shadowStyle || '',
		enableWatermarking: !! attributes.enableWatermarking,
		watermarkId: attributes.watermarkId || '',
		watermarkDisplay: attributes.watermarkDisplay || 'none',
	};

	if ( style === 'justified' ) {
		return {
			...sharedDefaults,
			rowHeight: attributes.rowHeight ?? 220,
			tabletRowHeight: attributes.tabletRowHeight ?? 190,
			mobileRowHeight: attributes.mobileRowHeight ?? 160,
		};
	}

	return {
		...sharedDefaults,
		columns: attributes.columns ?? 4,
		tabletColumns: attributes.tabletColumns ?? 3,
		mobileColumns: attributes.mobileColumns ?? 2,
	};
};

const getGalleryTypeSettings = ( attributes ) =>
	attributes.galleryTypeSettings &&
	typeof attributes.galleryTypeSettings === 'object'
		? attributes.galleryTypeSettings
		: {};

const getGalleryAttributesForStyle = ( style, attributes, typeSettings ) => ( {
	...getGalleryDefaultsForStyle( style, attributes ),
	...( typeSettings?.[ style ] || {} ),
	...getProofingGalleryWorkflowAttributes(),
} );

const getStyleFromGalleryBlock = ( gallery ) =>
	GALLERY_STYLE_BY_BLOCK[ gallery?.name ] || '';

const serializeGallerySettings = ( gallery ) => ( {
	...( gallery?.attributes || {} ),
	preview: false,
} );

const getGalleryTypeSettingsWithCurrentGallery = ( attributes, gallery ) => {
	const currentStyle = getStyleFromGalleryBlock( gallery );
	const currentSettings = getGalleryTypeSettings( attributes );

	if ( ! currentStyle || ! gallery ) {
		return currentSettings;
	}

	return {
		...currentSettings,
		[ currentStyle ]: serializeGallerySettings( gallery ),
	};
};

const isSameGalleryTypeSettings = ( first, second ) =>
	JSON.stringify( first || {} ) === JSON.stringify( second || {} );

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
		buttonAlign = 'right',
		proofingTheme = 'light',
		align,
		preview,
	} = attributes;
	const globalProofingSettings = getGlobalProofingSettings();
	const emailAdminOnSubmit =
		attributes.emailAdminOnSubmit ??
		!! globalProofingSettings.emailAdminOnSubmit;
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
		'data-align': align || undefined,
		style: getProofingButtonStyleVars( attributes ),
		className: [
			'fbks-proofing-gallery',
			align ? `align${ align }` : '',
			proofingTheme === 'dark' ? 'is-proofing-dark' : '',
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

	useEffect( () => {
		const gallery = innerBlocks[ 0 ];
		if ( ! gallery ) {
			return;
		}

		const nextTypeSettings = getGalleryTypeSettingsWithCurrentGallery(
			attributes,
			gallery
		);

		if (
			! isSameGalleryTypeSettings(
				nextTypeSettings,
				attributes.galleryTypeSettings
			)
		) {
			setAttributes( { galleryTypeSettings: nextTypeSettings } );
		}
	}, [
		attributes,
		attributes.galleryTypeSettings,
		innerBlocks,
		setAttributes,
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
		const typeSettings = getGalleryTypeSettings( attributes );
		const galleryBlock = createBlock(
			galleryBlockName,
			getGalleryAttributesForStyle( style, attributes, typeSettings ),
			imageBlocks
		);

		replaceInnerBlocks( clientId, [ galleryBlock ], false );
		setSetupError( '' );
	};

	const changeGalleryStyle = ( nextStyle ) => {
		const gallery = innerBlocks[ 0 ];
		const nextTypeSettings = getGalleryTypeSettingsWithCurrentGallery(
			attributes,
			gallery
		);

		setAttributes( {
			galleryStyle: nextStyle,
			galleryTypeSettings: nextTypeSettings,
		} );

		if ( ! gallery ) {
			return;
		}

		const nextBlockName = GALLERY_BLOCK_BY_STYLE[ nextStyle ];
		if ( gallery.name === nextBlockName ) {
			updateBlockAttributes(
				gallery.clientId,
				getGalleryAttributesForStyle(
					nextStyle,
					attributes,
					nextTypeSettings
				)
			);
			return;
		}

		replaceInnerBlocks(
			clientId,
			[
				createBlock(
					nextBlockName,
					getGalleryAttributesForStyle(
						nextStyle,
						attributes,
						nextTypeSettings
					),
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
					title={ __( 'Proofing Client Settings', 'folioblocks' ) }
					initialOpen={ true }
				>
					<TextControl
						label={ __( 'Client Email Address', 'folioblocks' ) }
						value={ clientEmail }
						{ ...clientEmailControlProps }
						onChange={ ( value ) =>
							setAttributes( { clientEmail: value } )
						}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						help={ __(
							'Used to identify the client connected to this Proofing Gallery.',
							'folioblocks'
						) }
					/>
					<TextControl
						label={ __( 'Gallery Password', 'folioblocks' ) }
						value={ galleryPassword }
						{ ...getGalleryPasswordControlProps( showPassword ) }
						onChange={ ( value ) =>
							setAttributes( { galleryPassword: value } )
						}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						help={ __(
							'Visitors must enter this password before they can view the Proofing Gallery.',
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
				</PanelBody>
				<PanelBody
					title={ __( 'Proofing Gallery Settings', 'folioblocks' ) }
					initialOpen={ true }
				>
					<div className="fbks-proofing-inspector__gallery-style">
						<SelectControl
							label={ __( 'Gallery Type', 'folioblocks' ) }
							value={ galleryStyle }
							options={ GALLERY_STYLE_OPTIONS }
							onChange={ changeGalleryStyle }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							help={ __(
								'Choose which gallery block is used for layout. Columns, gap, row height, and resolution are edited on that nested gallery.',
								'folioblocks'
							) }
						/>
					</div>
					<AlignmentControl
						value={ filterAlign }
						label={ __( 'Filter Bar Alignment', 'folioblocks' ) }
						help={ __(
							'Set alignment of the proofing filter bar.',
							'folioblocks'
						) }
						onChange={ ( value ) =>
							setAttributes( { filterAlign: value } )
						}
					/>
					<div
						className="fbks-proofing-inspector__divider"
						aria-hidden="true"
					/>
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
							'Show Heart icon so clients can mark images they like.',
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
							'Show Flag icon so clients can assign a red, orange, or green status to images.',
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
							'Show Comment icon for image-specific client notes.',
							'folioblocks'
						) }
					/>					
				</PanelBody>
				<PanelBody
					title={ __( 'Proofing Save & Submit Settings', 'folioblocks' ) }
					initialOpen={ false }
				>
					<AlignmentControl
						value={ buttonAlign }
						label={ __(
							'Save & Submit Button Alignment',
							'folioblocks'
						) }
						help={ __(
							'Set alignment of the Save & Continue and Submit buttons.',
							'folioblocks'
						) }
						onChange={ ( value ) =>
							setAttributes( { buttonAlign: value } )
						}
					/>
					<ToggleControl
						label={ __(
							'Email site admin on Submit',
							'folioblocks'
						) }
						checked={ emailAdminOnSubmit }
						onChange={ ( value ) =>
							setAttributes( { emailAdminOnSubmit: value } )
						}
						__nextHasNoMarginBottom
						help={ __(
							'Send email to the site admin when the client has submitted the session on the Proofing Gallery.',
							'folioblocks'
						) }
					/>
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
			<InspectorControls group="styles">
				<PanelBody
					title={ __( 'Proofing Appearance', 'folioblocks' ) }
					initialOpen={ true }
				>
					<ProofingThemeControl
						value={ proofingTheme }
						onChange={ ( value ) =>
							setAttributes( { proofingTheme: value } )
						}
					/>
				</PanelBody>
				<ProofingButtonStyleToolsPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
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
												'Set the client email address and gallery password in Client Settings.',
												'folioblocks'
										  )
										: __(
												'Choose the gallery layout clients will use to proof these images.',
												'folioblocks'
										  ) }
								</div>
								{ setupStep === 'credentials' ? (
									<div className="fbks-proofing-gallery__setup-summary">
										<ul>
											<li
												className={
													EMAIL_PATTERN.test(
														clientEmail.trim()
													)
														? 'is-complete'
														: ''
												}
											>
												{ __(
													'Client email',
													'folioblocks'
												) }
											</li>
											<li
												className={
													galleryPassword.trim()
														? 'is-complete'
														: ''
												}
											>
												{ __(
													'Gallery password',
													'folioblocks'
												) }
											</li>
										</ul>
									</div>
								) : (
									<div className="fbks-proofing-gallery__style-field">
										<SelectControl
											label={ __(
												'Gallery Type',
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
						<div
							className={ `fbks-proofing-gallery__actions align-${ buttonAlign }` }
						>
							<button
								type="button"
								className="fbks-proofing-gallery__action-button fbks-proofing-gallery__action-button--save"
								tabIndex={ -1 }
							>
								{ __( 'Save & Continue', 'folioblocks' ) }
							</button>
							<button
								type="button"
								className="fbks-proofing-gallery__action-button fbks-proofing-gallery__action-button--submit"
								tabIndex={ -1 }
							>
								{ __( 'Submit', 'folioblocks' ) }
							</button>
						</div>
					</>
				) }
			</div>
		</>
	);
}
