/**
 * PB Image Block
 * Index JS
 */
import { createBlock, registerBlockType } from '@wordpress/blocks';
import { select } from '@wordpress/data';
import { decodeEntities } from '@wordpress/html-entities';
import './style.scss';
import Edit from './edit';
import Save from './save';
import metadata from './block.json';
import { disableGalleryWrapperTransforms } from '../pb-helpers/galleryTransforms';

disableGalleryWrapperTransforms();

const GALLERY_BLOCK_NAMES = new Set( [
	'folioblocks/grid-gallery-block',
	'folioblocks/masonry-gallery-block',
	'folioblocks/justified-gallery-block',
	'folioblocks/carousel-gallery-block',
	'folioblocks/filmstrip-gallery-block',
	'folioblocks/video-gallery-block',
	'folioblocks/modular-gallery-block',
] );

const normalizeImageSizes = ( sizes = {} ) =>
	Object.fromEntries(
		Object.entries( sizes )
			.filter( ( [ , size ] ) => size?.url || size?.source_url )
			.map( ( [ slug, size ] ) => [
				slug,
				{
					...size,
					url: size.url || size.source_url,
				},
			] )
	);

const getSelectedImageSize = ( attributes = {}, sizes = {} ) =>
	sizes[ attributes.sizeSlug ] ||
	sizes[ attributes.imageSize ] ||
	sizes.large ||
	sizes.full ||
	null;

const hasGalleryParent = ( block ) => {
	if ( ! block?.clientId ) {
		return false;
	}

	const blockEditor = select( 'core/block-editor' );

	if ( ! blockEditor ) {
		return false;
	}

	const parentIds = blockEditor.getBlockParents( block.clientId, true ) || [];

	return parentIds.some( ( parentId ) =>
		GALLERY_BLOCK_NAMES.has( blockEditor.getBlockName( parentId ) )
	);
};

const transformCoreImageToPbImage = ( attributes = {} ) => {
	const imageId = Number( attributes.id ) || 0;
	const mediaRecord = imageId > 0 ? select( 'core' )?.getMedia( imageId ) : null;
	const mediaDetails = mediaRecord?.media_details || {};
	const normalizedSizes = normalizeImageSizes( mediaDetails.sizes || {} );
	const selectedSize = getSelectedImageSize( attributes, normalizedSizes );
	const fullSize = normalizedSizes.full || {};
	const src =
		selectedSize?.url ||
		attributes.url ||
		fullSize.url ||
		mediaRecord?.source_url ||
		'';

	if ( ! normalizedSizes.full && ( mediaRecord?.source_url || attributes.url ) ) {
		normalizedSizes.full = {
			url: mediaRecord?.source_url || attributes.url,
			width: mediaDetails.width || attributes.width || 0,
			height: mediaDetails.height || attributes.height || 0,
		};
	}

	return createBlock( metadata.name, {
		id: imageId,
		src,
		imageSize: attributes.sizeSlug || 'large',
		sizes: normalizedSizes,
		width: mediaDetails.width || attributes.width || 0,
		height: mediaDetails.height || attributes.height || 0,
		alt: mediaRecord?.alt_text || attributes.alt || '',
		caption: mediaRecord?.caption?.raw || attributes.caption || '',
		title: decodeEntities( mediaRecord?.title?.rendered || '' ),
		class: attributes.className || '',
	} );
};

const transformPbImageToCoreImage = ( attributes = {} ) => {
	const normalizedSizes = normalizeImageSizes( attributes.sizes || {} );
	const selectedSize = getSelectedImageSize( attributes, normalizedSizes );

	return createBlock( 'core/image', {
		id: attributes.id || undefined,
		url: selectedSize?.url || attributes.src || '',
		alt: attributes.alt || '',
		caption: attributes.caption || '',
		sizeSlug: attributes.imageSize || 'large',
		className: attributes.class || undefined,
	} );
};

registerBlockType( metadata, {
	icon: {
		src: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 1247.24 1247.24"
			>
				<path d="M180 180H1067C1115 180 1155 220 1155 268V979C1155 1027 1115 1067 1067 1067H180C132 1067 92 1027 92 979V268C92 220 132 180 180 180ZM180 230C150 230 124 256 124 286V961C124 991 150 1017 180 1017H1067C1097 1017 1123 991 1123 961V286C1123 256 1097 230 1067 230H180Z" />
				<circle cx="455" cy="420" r="85" />
				<path d="M820 520c17 0 33 9 41 24l205 355c8 14 8 31 0 45-8 14-24 24-41 24H300c-17 0-32-9-41-24-9-15-8-33 3-47l125-170c8-11 21-18 35-18 14 0 27 6 35 18l45 65 95-160c8-14 24-24 41-24Z" />
			</svg>
		),
	},
	edit: Edit,
	save: Save,
	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'core/image' ],
				isMatch: ( attributes ) => Number( attributes?.id ) > 0,
				transform: transformCoreImageToPbImage,
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/image' ],
				isMatch: ( attributes, block ) =>
					Boolean( attributes?.src ) && ! hasGalleryParent( block ),
				transform: transformPbImageToCoreImage,
			},
		],
	},
} );
