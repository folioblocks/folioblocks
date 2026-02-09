/**
 * Background Video Block
 * Edit JS
 *
 */

import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import {
	Button,
	PanelBody,
	RangeControl,
	TextControl,
	ToggleControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalDivider as Divider,
	Notice,
} from '@wordpress/components';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import CompactColorControl from "../pb-helpers/CompactColorControl";
import { IconBackgroundVideo } from '../pb-helpers/icons';
import './editor.scss';



/**
 * Attempt to extract a Vimeo video ID from common Vimeo URL formats.
 * Returns a string ID when found, otherwise null.
 */
const extractVimeoId = (url) => {
	if (!url || typeof url !== 'string') return null;

	// Examples:
	// - https://vimeo.com/12345678
	// - https://player.vimeo.com/video/12345678
	// - https://vimeo.com/channels/staffpicks/12345678
	// - https://vimeo.com/album/1234/video/12345678
	const match = url.match(/vimeo\.com\/(?:.*\/)?(\d+)(?:$|\?|#|\/)/);
	return match?.[1] || null;
};

/**
 * Normalize a self-hosted video object.
 */
const buildSelfHostedMediaObject = (media) => {
	if (!media?.url) return null;

	// WP media object commonly includes:
	// - id, url, mime, mime_type
	const mime = media.mime || media.mime_type || '';

	return {
		provider: 'self',
		id: media.id || null,
		url: media.url,
		mime,
	};
};

/**
 * Build a Vimeo background embed URL.
 *
 * Notes:
 * - We force muted=1 because background videos must be silent for reliable autoplay.
 * - `background=1` hides UI and enables the background-style player.
 */
const buildVimeoEmbedSrc = (vimeoId, { loopEnabled }) => {
	if (!vimeoId) return '';

	const params = new URLSearchParams();
	params.set('background', '1');
	params.set('autoplay', '1');
	params.set('loop', loopEnabled ? '1' : '0');
	params.set('muted', '1');
	params.set('title', '0');
	params.set('byline', '0');
	params.set('portrait', '0');
	params.set('dnt', '1');

	return `https://player.vimeo.com/video/${vimeoId}?${params.toString()}`;
};

/**
 * Normalize a poster image object.
 */
const buildPosterObject = (media) => {
	if (!media?.url) return null;

	return {
		id: media.id || null,
		url: media.url,
		alt: media.alt || '',
	};
};

export default function Edit({ attributes, setAttributes }) {
	const {
		layout,
		mediaDesktop,
		posterDesktop,
		sourceProvider,
		heightDesktop,
		heightTablet,
		heightMobile,
		overlayColor,
		overlayOpacity,
		loop,
		disableMobile,
		objectPositionXDesktop,
		objectPositionXTablet,
		objectPositionXMobile,
		objectPositionYDesktop,
		objectPositionYTablet,
		objectPositionYMobile,
		preview,
		vimeoAspectRatio,
	} = attributes;

	const checkoutUrl =
		window.folioBlocksData?.checkoutUrl ||
		"https://folioblocks.com/folioblocks-pricing/?utm_source=folioblocks&utm_medium=background-video-block&utm_campaign=upgrade";

	// Block Preview Image
	if (preview) {
		return (
			<div className="pb-block-preview">
				<IconBackgroundVideo />
			</div>
		);
	}

	const resolvedPosterUrl = posterDesktop?.url || '';

	// Editor preview: choose which responsive focal point to preview based on viewport width.
	// Front-end will be handled via CSS vars + media queries.
	const getEditorFocal = () => {
		const w = typeof window !== 'undefined' ? window.innerWidth : 9999;
		if (w <= 768) {
			return {
				x: objectPositionXMobile,
				y: objectPositionYMobile,
			};
		}
		if (w <= 1024) {
			return {
				x: objectPositionXTablet,
				y: objectPositionYTablet,
			};
		}
		return {
			x: objectPositionXDesktop,
			y: objectPositionYDesktop,
		};
	};

	const editorFocal = getEditorFocal();
	const previewPosX = Number.isFinite(editorFocal.x) ? editorFocal.x : 50;
	const previewPosY = Number.isFinite(editorFocal.y) ? editorFocal.y : 50;

	// Derived editor-friendly media info.
	// Prefer the explicit selector value, but fall back to the saved media object.
	const desktopProvider = sourceProvider || mediaDesktop?.provider || 'self';
	const isSelfHosted = desktopProvider === 'self' && !!mediaDesktop?.url;
	const isVimeo = desktopProvider === 'vimeo' && !!mediaDesktop?.id;

	// Vimeo cover sizing (editor).
	// Vimeo's background player keeps the video at its native aspect ratio inside the iframe.
	// To make it behave like CSS background-size: cover, we oversize the iframe based on the
	// container's aspect ratio vs the video's aspect ratio.
	const vimeoWrapRef = useRef(null);
	const [vimeoIframeStyle, setVimeoIframeStyle] = useState(null);

	// Safe fallback to 16:9 if we don't know the actual ratio yet.
	const safeVimeoRatio = Number.isFinite(vimeoAspectRatio) && vimeoAspectRatio > 0
		? vimeoAspectRatio
		: 16 / 9;
	useEffect(() => {
		// Best-effort: fetch Vimeo oEmbed to get the real width/height of the video.
		// This allows accurate cover sizing for non-16:9 videos.
		// If the request fails (CORS/network), we keep the existing ratio (default 16:9).
		if (desktopProvider !== 'vimeo') return;
		if (!mediaDesktop?.url) return;

		let didCancel = false;

		(async () => {
			try {
				const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(mediaDesktop.url)}`;
				const res = await fetch(oembedUrl, { method: 'GET' });
				if (!res.ok) return;
				const data = await res.json();
				const w = Number(data?.width);
				const h = Number(data?.height);
				if (!didCancel && Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
					const ratio = w / h;
					// Avoid tiny float diffs causing noisy rerenders.
					const rounded = Math.round(ratio * 1000000) / 1000000;
					setAttributes({ vimeoAspectRatio: rounded });
				}
			} catch (e) {
				// Silent fallback.
			}
		})();

		return () => {
			didCancel = true;
		};
	}, [desktopProvider, mediaDesktop, setAttributes]);

	useEffect(() => {
		if (desktopProvider !== 'vimeo') {
			setVimeoIframeStyle(null);
			return;
		}
		if (!isVimeo) {
			setVimeoIframeStyle(null);
			return;
		}

		const el = vimeoWrapRef.current;
		if (!el) return;

		const compute = () => {
			const rect = el.getBoundingClientRect();
			const cw = rect.width;
			const ch = rect.height;
			if (!cw || !ch) return;

			const containerRatio = cw / ch;
			const videoRatio = safeVimeoRatio;

			let width;
			let height;

			// Cover logic:
			// If container is wider than the video, scale by width -> increase height.
			// Else scale by height -> increase width.
			if (containerRatio > videoRatio) {
				width = cw;
				height = cw / videoRatio;
			} else {
				height = ch;
				width = ch * videoRatio;
			}

			setVimeoIframeStyle({
				position: 'absolute',
				// Use the same focal point semantics as CSS background-position.
				top: `${previewPosY}%`,
				left: `${previewPosX}%`,
				transform: `translate(-${previewPosX}%, -${previewPosY}%)`,
				width: `${width}px`,
				height: `${height}px`,
				border: 0,
				display: 'block',
			});
		};

		compute();

		const ro = new ResizeObserver(() => compute());
		ro.observe(el);

		return () => {
			ro.disconnect();
		};
	}, [desktopProvider, isVimeo, safeVimeoRatio, previewPosX, previewPosY]);


	const vimeoUrlValue = useMemo(() => {
		if (mediaDesktop?.provider !== 'vimeo') return '';
		// Keep any saved url if present; otherwise reconstruct.
		return mediaDesktop?.url || (mediaDesktop?.id ? `https://vimeo.com/${mediaDesktop.id}` : '');
	}, [mediaDesktop]);

	const hasAnyBackground = isSelfHosted || isVimeo;

	const blockProps = useBlockProps({
		className: `pb-bgvid${hasAnyBackground ? ' has-media' : ''}`,
		style: {
			// Mirror the front-end variables we will output in render.php.
			'--pb-bgvid-h-desktop': `${heightDesktop}vh`,
			'--pb-bgvid-h-tablet': `${heightTablet}vh`,
			'--pb-bgvid-h-mobile': `${heightMobile}vh`,

			// Responsive focal point vars (front end will switch them via media queries).
			'--pb-bgvid-pos-x-desktop': `${objectPositionXDesktop}%`,
			'--pb-bgvid-pos-x-tablet': `${objectPositionXTablet}%`,
			'--pb-bgvid-pos-x-mobile': `${objectPositionXMobile}%`,
			'--pb-bgvid-pos-y-desktop': `${objectPositionYDesktop}%`,
			'--pb-bgvid-pos-y-tablet': `${objectPositionYTablet}%`,
			'--pb-bgvid-pos-y-mobile': `${objectPositionYMobile}%`,

			// Editor preview uses the active viewport breakpoint.
			'--pb-bgvid-pos-x': `${previewPosX}%`,
			'--pb-bgvid-pos-y': `${previewPosY}%`,

			'--pb-bgvid-overlay': `rgba(0,0,0,0)`,
		},
	});

	// We store overlay as color + opacity, but preview via a computed rgba-like overlay.
	// In v1 we keep it simple: apply the overlayColor directly with an opacity.
	const overlayStyle = {
		background: overlayColor,
		opacity: overlayOpacity,
	};

	const posterStyle = resolvedPosterUrl
		? {
			backgroundImage: `url(${resolvedPosterUrl})`,
			backgroundSize: 'cover',
			backgroundPosition: `${previewPosX}% ${previewPosY}%`,
		}
		: undefined;

	const onSelectDesktopVideo = (media) => {
		setAttributes({
			sourceProvider: 'self',
			mediaDesktop: buildSelfHostedMediaObject(media),
		});
	};

	const onRemoveDesktopVideo = () => {
		setAttributes({ mediaDesktop: null });
	};

	const onChangeVimeoUrl = (nextUrl) => {
		// If the user clears the field, clear the mediaDesktop object.
		if (!nextUrl) {
			setAttributes({ mediaDesktop: null });
			return;
		}

		const id = extractVimeoId(nextUrl);
		setAttributes({
			sourceProvider: 'vimeo',
			mediaDesktop: id
				? { provider: 'vimeo', id, url: nextUrl }
				: { provider: 'vimeo', id: null, url: nextUrl },
		});
	};

	const onSelectDesktopPoster = (media) => {
		setAttributes({ posterDesktop: buildPosterObject(media) });
	};

	const onRemoveDesktopPoster = () => {
		setAttributes({ posterDesktop: null });
	};

	const showVimeoWarning = desktopProvider === 'vimeo' && !isVimeo && !!mediaDesktop?.url;

	const onChangeSourceProvider = (nextProvider) => {
		// Keep the UI clean: when switching provider, clear the current source so the user
		// is not accidentally "using" a hidden source.
		setAttributes({
			sourceProvider: nextProvider,
			mediaDesktop: null,
		});
	};

	/**
	 * Stack-like toolbar mappings
	 *
	 * We intentionally store the same token values the core Row/Stack toolbars use
	 * (left/center/right/space-between + top/center/bottom/space-between).
	 * Then we map them into flexbox values applied to `.pb-bgvid__content`.
	 */
	const contentFlexStyles = {
		// Fill the block height so inner blocks stretch to the container.
		width: '100%',
		height: '100%',
		minHeight: '100%',
	};

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'pb-bgvid__content',
			style: contentFlexStyles,
		},
		{
			__experimentalLayout: layout,
		}
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Sizing & Focal Point', 'folioblocks')} initialOpen={true}>
					{applyFilters(
						'folioBlocks.backgroundVideoBlock.sizingFocalControls',
						<>
							<RangeControl
								label={__('Height', 'folioblocks')}
								value={heightDesktop}
								onChange={(value) => setAttributes({
									heightDesktop: value,
									heightTablet: value,
									heightMobile: value,
								})}
								min={1}
								max={100}
								help={__('Tablet and mobile inherit this value.', 'folioblocks')}
							/>

							<RangeControl
								label={__('Focal Point X (Left - Right)', 'folioblocks')}
								value={objectPositionXDesktop}
								onChange={(value) => setAttributes({
									objectPositionXDesktop: value,
									objectPositionXTablet: value,
									objectPositionXMobile: value,
								})}
								min={0}
								max={100}
								step={1}
								help={__('Tablet and mobile inherit this value.', 'folioblocks')}
							/>

							<RangeControl
								label={__('Focal Point Y (Up - Down)', 'folioblocks')}
								value={objectPositionYDesktop}
								onChange={(value) => setAttributes({
									objectPositionYDesktop: value,
									objectPositionYTablet: value,
									objectPositionYMobile: value,
								})}
								min={0}
								max={100}
								step={1}
								help={__('Tablet and mobile inherit this value.', 'folioblocks')}
							/>
							<div style={{ marginBottom: "8px" }}>
								<Notice status="info" isDismissible={false}>
									<strong>
										{__("Responsive Controls", "folioblocks")}
									</strong>
									<br />
									{__(
										"This is a premium feature. Unlock all features: ",
										"folioblocks",
									)}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__("Upgrade to Pro", "folioblocks")}
									</a>
								</Notice>
							</div>
						</>,
						{ attributes, setAttributes },
					)}
				</PanelBody>

				<PanelBody title={__('Video Settings', 'folioblocks')} initialOpen={true}>

					<ToggleGroupControl
						label={__('Video Source', 'folioblocks')}
						value={desktopProvider}
						onChange={onChangeSourceProvider}
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						<ToggleGroupControlOption
							value="self"
							label={__('Self-Hosted', 'folioblocks')}
						/>
						<ToggleGroupControlOption
							value="vimeo"
							label={__('Vimeo', 'folioblocks')}
						/>
					</ToggleGroupControl>

					{desktopProvider === 'self' && (
						<>
							<MediaUploadCheck>
								<MediaUpload
									onSelect={onSelectDesktopVideo}
									allowedTypes={['video']}
									value={mediaDesktop?.id || undefined}
									render={({ open }) => (
										<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
											{isSelfHosted && mediaDesktop?.url && (
												<div style={{ width: '100%', fontSize: '12px', opacity: 0.75 }}>
													{(() => {
														try {
															const url = new URL(mediaDesktop.url, window.location.origin);
															const name = url.pathname.split('/').pop();
															return name || mediaDesktop.url;
														} catch (e) {
															const parts = String(mediaDesktop.url).split('/');
															return parts[parts.length - 1] || mediaDesktop.url;
														}
													})()}
												</div>
											)}
											<Button variant="primary" onClick={open}>
												{isSelfHosted
													? __('Replace Video', 'folioblocks')
													: __('Select Video', 'folioblocks')}
											</Button>
											{isSelfHosted && (
												<Button variant="secondary" onClick={onRemoveDesktopVideo}>
													{__('Remove', 'folioblocks')}
												</Button>
											)}
										</div>
									)}
								/>
							</MediaUploadCheck>
						</>
					)}

					{desktopProvider === 'vimeo' && (
						<>
							<TextControl
								label={__('Vimeo URL', 'folioblocks')}
								value={vimeoUrlValue}
								placeholder={__('https://vimeo.com/12345678', 'folioblocks')}
								onChange={onChangeVimeoUrl}
								help={__(
									'Paste a Vimeo URL. The block will extract the Vimeo video ID when possible.',
									'folioblocks'
								)}
							/>

							{showVimeoWarning && (
								<Notice status="warning" isDismissible={false}>
									{__(
										'We could not detect a Vimeo video ID from this URL yet. The front end may fall back to the poster until a valid Vimeo URL is provided.',
										'folioblocks'
									)}
								</Notice>
							)}
						</>
					)}
					<Divider />

					<p style={{ marginTop: 0 }}>
						<strong>{__('Playback', 'folioblocks')}</strong>
					</p>

					<ToggleControl
						label={__('Loop', 'folioblocks')}
						checked={loop}
						onChange={(value) => setAttributes({ loop: value })}
						help={__(
							'Automatically loop the video for continous play.',
							'folioblocks'
						)}
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={__('Disable on Mobile', 'folioblocks')}
						checked={disableMobile}
						onChange={(value) => setAttributes({ disableMobile: value })}
						help={__(
							'Disable background video is on mobile and display poster image.',
							'folioblocks'
						)}
						__nextHasNoMarginBottom
					/>

					<Divider />

					<p style={{ marginTop: 0 }}>
						<strong>{__('Poster Image', 'folioblocks')}</strong>
					</p>

					{posterDesktop?.url && (
						<div
							style={{
								marginBottom: 12,
								borderRadius: 6,
								overflow: 'hidden',
								border: '1px solid rgba(0,0,0,0.12)',
								background: 'rgba(0,0,0,0.03)',
							}}
						>
							<img
								src={posterDesktop.url}
								alt={posterDesktop.alt || ''}
								style={{
									display: 'block',
									width: '100%',
									height: 'auto',
								}}
							/>
						</div>
					)}

					<MediaUploadCheck>
						<MediaUpload
							onSelect={onSelectDesktopPoster}
							allowedTypes={['image']}
							value={posterDesktop?.id || undefined}
							render={({ open }) => (
								<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
									<Button variant="primary" onClick={open}>
										{posterDesktop?.url
											? __('Replace Image', 'folioblocks')
											: __('Select Image', 'folioblocks')}
									</Button>
									{posterDesktop?.url && (
										<Button variant="secondary" onClick={onRemoveDesktopPoster}>
											{__('Remove', 'folioblocks')}
										</Button>
									)}
								</div>
							)}
						/>
					</MediaUploadCheck>
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="advanced">
				{applyFilters(
					"folioBlocks.backgroundVideoBlock.disableRightClickToggle",
					<div style={{ marginBottom: "8px" }}>
						<Notice status="info" isDismissible={false}>
							<strong>{__("Disable Right-Click", "folioblocks")}</strong>
							<br />
							{__(
								"This is a premium feature. Unlock all features: ",
								"folioblocks",
							)}
							<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
								{__("Upgrade to Pro", "folioblocks")}
							</a>
						</Notice>
					</div>,
					{ attributes, setAttributes },
				)}
			</InspectorControls>
			<InspectorControls group="styles">
				<PanelBody title={__('Background Video Overlay Styles', 'folioblocks')} initialOpen={true}>
					<CompactColorControl
						label={__('Overlay color', 'folioblocks')}
						value={overlayColor}
						onChange={(value) => setAttributes({ overlayColor: value })}
						help={__('Set the color for the Overlay.', 'folioblocks')}
					/>
					<RangeControl
						label={__('Overlay opacity', 'folioblocks')}
						value={overlayOpacity}
						onChange={(value) => setAttributes({ overlayOpacity: value })}
						min={0}
						max={1}
						step={0.05}
						help={__('Set the level of opacity for the Overlay.', 'folioblocks')}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="pb-bgvid__media" aria-hidden="true">
					<div className="pb-bgvid__poster" style={posterStyle} />

					{ /* Editor preview */}
					{isSelfHosted && (
						<video
							className="pb-bgvid__video"
							src={mediaDesktop.url}
							muted
							loop={!!loop}
							playsInline
							autoPlay
							preload="metadata"
						/>
					)}

					{isVimeo && !!mediaDesktop?.id && (
						<div className="pb-bgvid__vimeo" ref={vimeoWrapRef} style={{ pointerEvents: 'none' }}>
							<iframe
								src={buildVimeoEmbedSrc(mediaDesktop.id, { loopEnabled: !!loop })}
								title={__('Vimeo background video', 'folioblocks')}
								allow="autoplay; fullscreen; picture-in-picture"
								allowFullScreen
								style={vimeoIframeStyle || { position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, display: 'block' }}
							/>
						</div>
					)}

					<div className="pb-bgvid__overlay" style={overlayStyle} />
				</div>

				<div {...innerBlocksProps}>
					{!hasAnyBackground && (
						<div style={{ marginBottom: 12 }}>
							<Notice status="warning" isDismissible={false}>
								{__('Select a self-hosted video or paste a Vimeo URL to set the background. You can still add blocks inside right away.', 'folioblocks')}
							</Notice>
						</div>
					)}
					{innerBlocksProps.children}
				</div>
			</div>
		</>
	);
}
