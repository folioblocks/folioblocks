import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { createInterpolateElement } from '@wordpress/element';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import {
	Button,
	TextControl,
	SelectControl,
	ToolbarGroup,
	ToolbarButton,
	Dropdown,
} from '@wordpress/components';

export const VideoPlayIcon = () => (
	<svg
		className="fbks-video-play-glyph"
		viewBox="0 0 24 24"
		aria-hidden="true"
		focusable="false"
	>
		<path d="M8 5v14l11-7z" fill="currentColor" />
	</svg>
);

export const VideoLightboxSourceControl = ( {
	attributes,
	setAttributes,
	openMedia,
} ) => {
	const value = attributes.videoLightboxUrl || '';
	const renderHelp = ( open ) =>
		createInterpolateElement(
			__(
				'Link to a supported video provider or select a <video>self-hosted video</video>. The lightbox will be unavailable until a video is selected.',
				'folioblocks'
			),
			{
				video: (
					<Button
						variant="link"
						onClick={ open }
						style={ {
							display: 'inline',
							height: 'auto',
							minHeight: 0,
							padding: 0,
							fontSize: 'inherit',
							lineHeight: 'inherit',
							verticalAlign: 'baseline',
						} }
					/>
				),
			}
		);
	return (
		<>
			<TextControl
				label={ __( 'Video URL', 'folioblocks' ) }
				value={ value }
				onChange={ ( videoLightboxUrl ) =>
					setAttributes( { videoLightboxUrl } )
				}
				help={
					<MediaUploadCheck
						fallback={ __(
							'Link to a supported video provider or select a self-hosted video. The lightbox will be unavailable until a video is selected.',
							'folioblocks'
						) }
					>
						{ openMedia ? (
							renderHelp( openMedia )
						) : (
							<MediaUpload
								allowedTypes={ [ 'video' ] }
								onSelect={ ( media ) =>
									setAttributes( {
										videoLightboxUrl: media.url || '',
									} )
								}
								render={ ( { open } ) => renderHelp( open ) }
							/>
						) }
					</MediaUploadCheck>
				}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
		</>
	);
};

export const registerVideoLightboxControls = ( {
	hookPrefix,
	namespace,
	LightboxControl,
	includeSource = false,
	showCounterControl = true,
} ) => {
	addFilter(
		`${ hookPrefix }.imageClickActionOptions`,
		`${ namespace }-video-lightbox`,
		( options ) => {
			const ordered = options.filter(
				( option ) => option.value !== 'video_lightbox'
			);
			const commerceIndex = ordered.findIndex(
				( option ) => option.value === 'woocommerce'
			);
			ordered.splice(
				commerceIndex === -1 ? ordered.length : commerceIndex,
				0,
				{
					label: __( 'Play Video in Lightbox', 'folioblocks' ),
					value: 'video_lightbox',
				}
			);
			return ordered;
		},
		20
	);
	addFilter(
		`${ hookPrefix }.imageClickActionNotice`,
		`${ namespace }-video-lightbox-controls`,
		( original, { attributes, setAttributes } ) => {
			if ( attributes.imageClickAction !== 'video_lightbox' )
				return original;
			const icon = ( attributes.imageClickTarget || 'icon' ) === 'icon';
			return (
				<>
					{ includeSource && (
						<VideoLightboxSourceControl
							attributes={ attributes }
							setAttributes={ setAttributes }
						/>
					) }
					<SelectControl
						label={ __( 'Link Target', 'folioblocks' ) }
						value={ attributes.imageClickTarget || 'icon' }
						options={ [
							{
								label: __( 'Icon', 'folioblocks' ),
								value: 'icon',
							},
							{
								label: __( 'Thumbnail', 'folioblocks' ),
								value: 'thumbnail',
							},
						] }
						onChange={ ( imageClickTarget ) =>
							setAttributes( { imageClickTarget } )
						}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					{ icon && (
						<SelectControl
							label={ __(
								'Display Link Target Icon',
								'folioblocks'
							) }
							value={
								attributes.linkIconDisplay === 'always'
									? 'always'
									: 'hover'
							}
							options={ [
								{
									label: __( 'On Hover', 'folioblocks' ),
									value: 'hover',
								},
								{
									label: __( 'Always', 'folioblocks' ),
									value: 'always',
								},
							] }
							onChange={ ( linkIconDisplay ) =>
								setAttributes( { linkIconDisplay } )
							}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					) }
					<LightboxControl
						attributes={ attributes }
						setAttributes={ setAttributes }
						showZoomControl={ false }
						showCounterControl={ showCounterControl }
					/>
				</>
			);
		},
		20
	);
};

export const VideoLightboxToolbar = ( props ) => (
	<ToolbarGroup>
		<MediaUpload
			allowedTypes={ [ 'video' ] }
			onSelect={ ( media ) =>
				props.setAttributes( { videoLightboxUrl: media.url || '' } )
			}
			render={ ( { open } ) => (
				<Dropdown
					popoverProps={ { placement: 'bottom-start' } }
					renderToggle={ ( { isOpen, onToggle } ) => (
						<ToolbarButton
							icon={ <VideoPlayIcon /> }
							label={ __( 'Set Video Link', 'folioblocks' ) }
							onClick={ onToggle }
							isPressed={ isOpen }
						/>
					) }
					renderContent={ ( { onClose } ) => (
						<div style={ { padding: '12px', width: '320px' } }>
							<VideoLightboxSourceControl
								{ ...props }
								openMedia={ () => {
									open();
									onClose();
								} }
							/>
						</div>
					) }
				/>
			) }
		/>
	</ToolbarGroup>
);
