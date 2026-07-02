import { __ } from '@wordpress/i18n';
import { addFilter, applyFilters } from '@wordpress/hooks';
import {
	SelectControl,
	ToggleControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { LightboxSocialSharingControls } from './socialSharingControls';

const getLightboxContent = (attributes) => {
	if (attributes.lightboxContent) {
		return attributes.lightboxContent;
	}

	if (attributes.lightboxCaption) {
		return attributes.wooLightboxInfoType === 'product'
			? 'product'
			: 'caption';
	}

	return 'none';
};

const LightboxContentControl = ({
	attributes,
	setAttributes,
	showProductInfoOption = false,
	showAppearanceControl = true,
	context = {},
}) => {
	const value = getLightboxContent(attributes);
	const options = [
		{
			label: __('None', 'folioblocks'),
			value: 'none',
		},
		{
			label: __('Show Image Title', 'folioblocks'),
			value: 'title',
		},
		{
			label: __('Show Image Caption', 'folioblocks'),
			value: 'caption',
		},
		{
			label: __('Show EXIF Data', 'folioblocks'),
			value: 'exif',
		},
		{
			label: __('Show Image Title & EXIF Data', 'folioblocks'),
			value: 'title_exif',
		},
		{
			label: __('Show Image Caption & EXIF Data', 'folioblocks'),
			value: 'caption_exif',
		},
		{
			label: __('Show Image Title & Caption', 'folioblocks'),
			value: 'title_caption',
		},
		{
			label: __(
				'Show Image Title, Caption, & EXIF Data',
				'folioblocks'
			),
			value: 'title_caption_exif',
		},
	];

	if (showProductInfoOption) {
		options.push({
			label: __('Show Product Info', 'folioblocks'),
			value: 'product',
		});
	}

	return (
		<>
			{showAppearanceControl && (
				<ToggleGroupControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					value={attributes.lightboxTheme || 'dark'}
					isBlock
					label={__('Lightbox Appearance', 'folioblocks')}
					help={__(
						'Choose a light or dark lightbox background.',
						'folioblocks'
					)}
					onChange={(lightboxTheme) => {
						if (lightboxTheme) {
							setAttributes({ lightboxTheme })
						}
					}}
				>
					<ToggleGroupControlOption
						label={__('Light', 'folioblocks')}
						value="light"
					/>
					<ToggleGroupControlOption
						label={__('Dark', 'folioblocks')}
						value="dark"
					/>

				</ToggleGroupControl>
			)}
			<SelectControl
				label={__('Lightbox Content', 'folioblocks')}
				value={
					showProductInfoOption || value !== 'product' ? value : 'none'
				}
				options={options}
				onChange={(nextValue) =>
					setAttributes({
						lightboxContent: nextValue,
						lightboxCaption: nextValue !== 'none',
						showCaptionInLightbox: nextValue !== 'none',
						wooLightboxInfoType:
							nextValue === 'product' ? 'product' : 'caption',
					})
				}
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				help={__(
					'Choose what appears below images in the lightbox.',
					'folioblocks'
				)}
			/>
			{[
				'exif',
				'title_exif',
				'caption_exif',
				'title_caption_exif',
			].includes(value) && (
					<ToggleControl
						label={__('Hide Unknown EXIF Fields', 'folioblocks')}
						checked={!!attributes.hideUnknownExifFields}
						onChange={(hideUnknownExifFields) =>
							setAttributes({ hideUnknownExifFields })
						}
						__nextHasNoMarginBottom
						help={__(
							'Hide EXIF rows that do not have a value.',
							'folioblocks'
						)}
					/>
				)}
			<LightboxSocialSharingControls
				attributes={attributes}
				setAttributes={setAttributes}
				context={context}
			/>
		</>
	);
};

const LinkTargetControls = ({
	hookPrefix,
	attributes,
	setAttributes,
	imageClickAction,
	showLightboxControls = true,
	showIconDisplayControls = true,
}) => {
	const imageClickTarget = attributes.imageClickTarget || 'icon';
	const linkIconDisplay = attributes.linkIconDisplay || 'hover';
	const lightbox = !!attributes.lightbox;
	const isCustomOrPage =
		imageClickAction === 'custom_url' || imageClickAction === 'page_post';

	return (
		<>
			<SelectControl
				label={__('Link Target', 'folioblocks')}
				value={imageClickTarget}
				options={[
					{
						label: __('Link Target Icon', 'folioblocks'),
						value: 'icon',
					},
					{
						label: __('Thumbnail', 'folioblocks'),
						value: 'thumbnail',
					},
				]}
				onChange={(value) => {
					const nextAttributes = { imageClickTarget: value };
					if (value === 'thumbnail') {
						nextAttributes.lightbox = false;
						if (isCustomOrPage) {
							nextAttributes.linkIconDisplay = 'none';
						}
						if (imageClickAction === 'woocommerce') {
							nextAttributes.wooCartIconDisplay = 'none';
						}
					} else {
						if (isCustomOrPage && linkIconDisplay === 'none') {
							nextAttributes.linkIconDisplay = 'hover';
						}
						if (
							imageClickAction === 'woocommerce' &&
							attributes.wooCartIconDisplay === 'none'
						) {
							nextAttributes.wooCartIconDisplay = 'hover';
						}
					}
					setAttributes(nextAttributes);
				}}
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				help={
					isCustomOrPage && imageClickTarget === 'thumbnail'
						? __(
							'Set each image destination from its individual Image Block settings.',
							'folioblocks'
						)
						: __(
							'Choose whether the link is attached to each image or an icon.',
							'folioblocks'
						)
				}
			/>
			{(showIconDisplayControls || showLightboxControls) && (
				<>
					{showIconDisplayControls && (
						<SelectControl
							label={__('Display Link Target Icon', 'folioblocks')}
							value={linkIconDisplay}
							options={[
								{
									label: __('None', 'folioblocks'),
									value: 'none',
								},
								{
									label: __('On Hover', 'folioblocks'),
									value: 'hover',
								},
								{
									label: __('Always', 'folioblocks'),
									value: 'always',
								},
							]}
							onChange={(value) =>
								setAttributes({ linkIconDisplay: value })
							}
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							help={__(
								'Choose when to display the link target icon.',
								'folioblocks'
							)}
						/>
					)}
					{showLightboxControls && imageClickTarget === 'icon' && (
						<ToggleControl
							label={__('Enable Lightbox', 'folioblocks')}
							checked={lightbox}
							onChange={(newLightbox) =>
								setAttributes({ lightbox: newLightbox })
							}
							__nextHasNoMarginBottom
							help={__(
								'Open images in a lightbox when thumbnails are clicked.',
								'folioblocks'
							)}
						/>
					)}
					{showLightboxControls &&
						imageClickTarget === 'icon' &&
						lightbox && (
							<LightboxContentControl
								attributes={attributes}
								setAttributes={setAttributes}
							/>
						)}
				</>
			)}
		</>
	);
};

export const registerImageClickActionPremiumControls = ({
	hookPrefix,
	namespace,
	supportsLightbox = true,
}) => {
	addFilter(
		`${hookPrefix}.imageClickActionOptions`,
		`${namespace}-premium-click-action-options`,
		(options) => {
			const premiumOptions = [
				...options,
				...(supportsLightbox &&
					!options.some((option) => option.value === 'lightbox')
					? [
						{
							label: __('Open in Lightbox', 'folioblocks'),
							value: 'lightbox',
						},
					]
					: []),
				{
					label: __('Enable Image Downloads', 'folioblocks'),
					value: 'download',
				},
				{
					label: __('Link Image to Media File', 'folioblocks'),
					value: 'media_file',
				},
				{
					label: __('Link Image to Custom URL', 'folioblocks'),
					value: 'custom_url',
				},
				{
					label: __('Link Image to Page/Post', 'folioblocks'),
					value: 'page_post',
				},
			];

			if (window.folioBlocksData?.hasWooCommerce) {
				premiumOptions.push({
					label: __('WooCommerce Product', 'folioblocks'),
					value: 'woocommerce',
				});
			}

			return premiumOptions;
		}
	);

	addFilter(
		`${hookPrefix}.imageClickActionNotice`,
		`${namespace}-premium-click-action-notice`,
		() => null
	);

	addFilter(
		`${hookPrefix}.linkTargetControls`,
		`${namespace}-premium-link-target-controls`,
		(defaultContent, props) => (
			<LinkTargetControls hookPrefix={hookPrefix} {...props} />
		)
	);

	addFilter(
		`${hookPrefix}.downloadControls`,
		`${namespace}-premium-click-action-downloads`,
		(defaultContent, props) => {
			const { attributes, setAttributes } = props;
			const { downloadOnHover, lightbox } = attributes;
			const imageClickTarget = attributes.imageClickTarget || 'icon';

			return (
				<>
					{applyFilters(
						`${hookPrefix}.linkTargetControls`,
						null,
						{
							attributes,
							setAttributes,
							imageClickAction: 'download',
							showLightboxControls: false,
							showIconDisplayControls: false,
						}
					)}
					<SelectControl
						label={__(
							'Display Image Download Icon',
							'folioblocks'
						)}
						value={downloadOnHover ?? true ? 'hover' : 'always'}
						options={[
							{
								label: __('On Hover', 'folioblocks'),
								value: 'hover',
							},
							{
								label: __('Always', 'folioblocks'),
								value: 'always',
							},
						]}
						onChange={(value) =>
							setAttributes({
								downloadOnHover: value === 'hover',
							})
						}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={__(
							'Set display preference for Image Download icon.',
							'folioblocks'
						)}
					/>
					{supportsLightbox && imageClickTarget === 'icon' && (
						<ToggleControl
							label={__('Enable Lightbox', 'folioblocks')}
							checked={!!lightbox}
							onChange={(newLightbox) =>
								setAttributes({ lightbox: newLightbox })
							}
							__nextHasNoMarginBottom
							help={__(
								'Open images in a lightbox when clicked.',
								'folioblocks'
							)}
						/>
					)}
					{supportsLightbox && imageClickTarget === 'icon' && lightbox && (
						<LightboxContentControl
							attributes={attributes}
							setAttributes={setAttributes}
						/>
					)}
				</>
			);
		}
	);

	addFilter(
		`${hookPrefix}.wooCommerceControls`,
		`${namespace}-premium-click-action-woocommerce`,
		(defaultContent, props) => {
			const wooActive = window.folioBlocksData?.hasWooCommerce ?? false;
			if (!wooActive) {
				return null;
			}

			const { attributes, setAttributes } = props;
			const {
				lightbox,
				wooCartIconDisplay,
				wooDefaultLinkAction,
			} = attributes;
			const imageClickTarget = attributes.imageClickTarget || 'icon';

			return (
				<>
					<SelectControl
						label={__(
							'Default Product Link Behavior',
							'folioblocks'
						)}
						value={wooDefaultLinkAction}
						options={[
							{
								label: __('Add to Cart', 'folioblocks'),
								value: 'add_to_cart',
							},
							{
								label: __('Open Product Page', 'folioblocks'),
								value: 'product',
							},
						]}
						onChange={(value) =>
							setAttributes({ wooDefaultLinkAction: value })
						}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={__(
							'Sets the default WooCommerce product action for this gallery. Individual images can override this setting.',
							'folioblocks'
						)}
					/>
					{applyFilters(
						`${hookPrefix}.linkTargetControls`,
						null,
						{
							attributes,
							setAttributes,
							imageClickAction: 'woocommerce',
							showLightboxControls: false,
							showIconDisplayControls: false,
						}
					)}
					<SelectControl
						label={__(
							'Display Add to Cart Icon',
							'folioblocks'
						)}
						value={wooCartIconDisplay}
						options={[
							{
								label: __('None', 'folioblocks'),
								value: 'none',
							},
							{
								label: __('On Hover', 'folioblocks'),
								value: 'hover',
							},
							{
								label: __('Always', 'folioblocks'),
								value: 'always',
							},
						]}
						onChange={(value) =>
							setAttributes({ wooCartIconDisplay: value })
						}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={__(
							'Choose when to display the Add to Cart icon.',
							'folioblocks'
						)}
					/>
					{supportsLightbox && imageClickTarget === 'icon' && (
						<ToggleControl
							label={__('Enable Lightbox', 'folioblocks')}
							checked={!!lightbox}
							onChange={(newLightbox) =>
								setAttributes({ lightbox: newLightbox })
							}
							__nextHasNoMarginBottom
							help={__(
								'Open images in a lightbox when clicked.',
								'folioblocks'
							)}
						/>
					)}
					{supportsLightbox && imageClickTarget === 'icon' && lightbox && (
						<LightboxContentControl
							attributes={attributes}
							setAttributes={setAttributes}
							showProductInfoOption={true}
						/>
					)}
				</>
			);
		}
	);

	addFilter(
		`${hookPrefix}.lightboxControls`,
		`${namespace}-premium-click-action-lightbox`,
		(defaultContent, props) => {
			const { attributes, setAttributes, context } = props;
			const { enableWooCommerce } = attributes;

			return (
				<LightboxContentControl
					attributes={attributes}
					setAttributes={setAttributes}
					showProductInfoOption={!!enableWooCommerce}
					showAppearanceControl={supportsLightbox}
					context={context}
				/>
			);
		}
	);
};
