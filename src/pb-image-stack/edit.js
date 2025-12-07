/**
 * PB Image Stack Block
 * Edit JS
 **/
import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { BlockControls, useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { ToolbarGroup, ToolbarButton, Icon } from '@wordpress/components';
import { decodeEntities } from '@wordpress/html-entities';
import IconImageBlock from '../pb-helpers/IconImageBlock';

const ALLOWED_BLOCKS = ['folioblocks/pb-image-block'];

export default function Edit({ clientId, context }) {
	const MAX_IMAGES = 4;
	const { replaceInnerBlocks } = useDispatch('core/block-editor');
	const noGap = context?.['folioBlocks/noGap'] || false;
	const hasOpenedMediaFrame = useRef(false);

	const innerBlocks = useSelect(
		(select) => select('core/block-editor').getBlocks(clientId),
		[clientId]
	);

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'pb-image-stack' },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			orientation: 'vertical',
		}
	);

	const addImageBlock = async () => {
		if (innerBlocks.length >= MAX_IMAGES) return;

		const mediaFrame = wp.media({
			title: __('Select Image', 'folioblocks'),
			multiple: false,
			library: { type: 'image' },
			button: { text: __('Add Image', 'folioblocks') },
		});

		mediaFrame.on('select', async () => {
			const image = mediaFrame.state().get('selection').first().toJSON();

			// Fetch the full media object to get the title
			try {
				const response = await wp.apiFetch({
					path: `/wp/v2/media/${image.id}`
				});

				const title = decodeEntities(response.title?.rendered || '');

				const newBlock = createBlock('folioblocks/pb-image-block', {
					id: image.id,
					src: image.url,
					alt: image.alt || '',
					title: title,
					caption: image.caption || '',
					sizes: image.sizes || {},
					width: image.width || 0,
					height: image.height || 0,
				});

				replaceInnerBlocks(clientId, [...innerBlocks, newBlock], false);

			} catch (error) {
				console.error("Failed to fetch image title:", error);
			}
		});

		mediaFrame.open();
	};

	useEffect(() => {
		const timer = setTimeout(() => {
			if (innerBlocks.length === 0 && !hasOpenedMediaFrame.current) {
				const mediaFrame = wp.media({
					title: __('Select Image', 'folioblocks'),
					multiple: false,
					library: { type: 'image' },
					button: { text: __('Add Image', 'folioblocks') },
				});

				mediaFrame.on('select', () => {
					const image = mediaFrame.state().get('selection').first().toJSON();
					const newBlock = createBlock('folioblocks/pb-image-block', {
						id: image.id,
						src: image.url,
						alt: image.alt,
						title: image.title,
						caption: image.caption,
						sizes: image.sizes,
						width: image.width,
						height: image.height,
					});

					replaceInnerBlocks(clientId, [newBlock], false);
					mediaFrame.close();
					hasOpenedMediaFrame.current = true;
				});

				mediaFrame.open();
			}
		}, 50); // Allow React updates to settle

		return () => clearTimeout(timer);
	}, [innerBlocks, clientId, replaceInnerBlocks]);

	useEffect(() => {
		if (innerBlocks.length > MAX_IMAGES) {
			const trimmedBlocks = innerBlocks.slice(0, MAX_IMAGES);
			replaceInnerBlocks(clientId, trimmedBlocks, false);
		}
	}, [innerBlocks, clientId, replaceInnerBlocks]);

	const blockProps = useBlockProps();

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={IconImageBlock}
						label={__('Add Image', 'folioblocks')}
						onClick={addImageBlock}
						disabled={innerBlocks.length >= MAX_IMAGES}
					>
						{__('Add Image', 'folioblocks')}
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>
			<div {...blockProps}>
				<div {...innerBlocksProps} />
			</div>
		</>
	);
}