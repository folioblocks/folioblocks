/**
 * PB Image Row Block
 * Edit JS
 */
import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	BlockControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { stack } from '@wordpress/icons';
import { decodeEntities } from '@wordpress/html-entities';
import { IconImageBlock } from '../pb-helpers/icons';

const ALLOWED_BLOCKS = [
	'folioblocks/pb-image-block',
	'folioblocks/pb-image-stack',
];

export default function Edit( { clientId, context } ) {
	const MAX_IMAGES = 8;
	const { replaceInnerBlocks } = useDispatch( 'core/block-editor' );
	const noGap = context?.[ 'folioBlocks/noGap' ] || false;
	const layoutVersion = context?.[ 'folioBlocks/layoutVersion' ];

	const innerBlocks = useSelect(
		( select ) => select( 'core/block-editor' ).getBlocks( clientId ),
		[ clientId ]
	);

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'pb-image-row' },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			orientation: 'horizontal',
		}
	);

	const addImageBlock = async () => {
		if ( innerBlocks.length >= MAX_IMAGES ) {
			return;
		}

		const mediaFrame = wp.media( {
			title: __( 'Select Image', 'folioblocks' ),
			multiple: false,
			library: { type: 'image' },
			button: { text: __( 'Add Image', 'folioblocks' ) },
		} );

		mediaFrame.on( 'select', async () => {
			const image = mediaFrame
				.state()
				.get( 'selection' )
				.first()
				.toJSON();

			// Fetch the full media object to get the title
			try {
				const response = await wp.apiFetch( {
					path: `/wp/v2/media/${ image.id }`,
				} );

				const title = decodeEntities( response.title?.rendered || '' );

				const newBlock = createBlock( 'folioblocks/pb-image-block', {
					id: image.id,
					src: image.url,
					alt: image.alt || '',
					title,
					caption: image.caption || '',
					sizes: image.sizes || {},
					width: image.width || 0,
					height: image.height || 0,
				} );

				replaceInnerBlocks(
					clientId,
					[ ...innerBlocks, newBlock ],
					false
				);
			} catch ( error ) {
				console.error( 'Failed to fetch image title:', error );
			}
		} );

		mediaFrame.open();
	};

	useEffect( () => {
		if ( innerBlocks.length === 0 ) {
			const defaultBlock = createBlock( 'folioblocks/pb-image-block' );
			replaceInnerBlocks( clientId, [ defaultBlock ], false );
		}
	}, [ innerBlocks, clientId, replaceInnerBlocks ] );

	useEffect( () => {
		if ( innerBlocks.length > MAX_IMAGES ) {
			const trimmedBlocks = innerBlocks.slice( 0, MAX_IMAGES );
			replaceInnerBlocks( clientId, trimmedBlocks, false );
		}
	}, [ innerBlocks, clientId, replaceInnerBlocks ] );

	const rowLayouts = context?.[ 'folioBlocks/rowLayouts' ] || {};
	useEffect( () => {
		const layouts = rowLayouts[ 0 ]; // Adjust row index if needed
		if ( ! layouts ) {
			return;
		}
		const wrappers = document.querySelectorAll(
			`[data-block="${ clientId }"] .wp-block-folioblocks-pb-image-block, 
			 [data-block="${ clientId }"] .wp-block-folioblocks-pb-image-stack`
		);
		wrappers.forEach( ( wrapper, index ) => {
			const layout = layouts[ index ];
			if ( ! layout ) {
				return;
			}
			wrapper.style.width = `${ layout.width }px`;
			wrapper.style.height = `${ layout.height }px`;
			wrapper.style.marginRight = layout.marginRight;
		} );
	}, [ rowLayouts, layoutVersion ] );

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={ IconImageBlock }
						label={ __( 'Add Image', 'folioblocks' ) }
						onClick={ addImageBlock }
						disabled={ innerBlocks.length >= MAX_IMAGES }
					>
						{ __( 'Add Image', 'folioblocks' ) }
					</ToolbarButton>
					<ToolbarButton
						icon={ stack }
						label={ __( 'Add Image Stack', 'folioblocks' ) }
						onClick={ () => {
							const newStackBlock = createBlock(
								'folioblocks/pb-image-stack'
							);
							replaceInnerBlocks(
								clientId,
								[ ...innerBlocks, newStackBlock ],
								false
							);
						} }
						disabled={ innerBlocks.length >= MAX_IMAGES }
					>
						{ __( 'Add Image Stack', 'folioblocks' ) }
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>
			<div { ...useBlockProps() }>
				<div { ...innerBlocksProps } />
			</div>
		</>
	);
}
