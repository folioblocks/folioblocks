import { cloneBlock, createBlock, getBlockType } from '@wordpress/blocks';
import { select } from '@wordpress/data';
import { decodeEntities } from '@wordpress/html-entities';
import { getExifAttributesFromMedia } from './exifMetadata';

const DEFAULT_GALLERY_BLOCKS = [
	'folioblocks/grid-gallery-block',
	'folioblocks/justified-gallery-block',
	'folioblocks/masonry-gallery-block',
	'folioblocks/carousel-gallery-block',
	'folioblocks/filmstrip-gallery-block',
];

const EXCLUDED_ATTRS = new Set( [
	'columns',
	'tabletColumns',
	'mobileColumns',
	'rowHeight',
	'rowWidth',
	'gap',
	'noGap',
	'preview',
	'isGridGallery',
] );

const CORE_GALLERY_ATTRS = new Set( [
	'align',
	'anchor',
	'backgroundColor',
	'className',
	'gradient',
	'style',
	'textColor',
] );

const DISABLED_TARGET_BLOCKS = [ 'core/group', 'core/columns', 'core/details' ];
const TRANSFORM_PATCH_FLAG = '__fbksGalleryTransformPatched';
const GALLERY_BLOCK_NAMES = new Set( [
	...DEFAULT_GALLERY_BLOCKS,
	'folioblocks/video-gallery-block',
	'folioblocks/modular-gallery-block',
] );
let hasPatchedWrapperTransforms = false;
let patchAttempts = 0;

const getTransformAttributes = ( attributes = {} ) => {
	const next = {};
	Object.entries( attributes ).forEach( ( [ key, value ] ) => {
		if ( EXCLUDED_ATTRS.has( key ) ) {
			return;
		}
		if ( typeof value === 'undefined' ) {
			return;
		}
		next[ key ] = value;
	} );
	return next;
};

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

const cloneInnerBlockTree = ( block ) =>
	cloneBlock(
		block,
		{},
		( block.innerBlocks || [] ).map( cloneInnerBlockTree )
	);

const cloneInnerBlocks = ( innerBlocks = [] ) =>
	innerBlocks.map( cloneInnerBlockTree );

export const transformCoreImageToPbImage = ( attributes = {} ) => {
	const imageId = Number( attributes.id ) || 0;
	const mediaRecord =
		imageId > 0
			? select( 'core' )?.getEntityRecord(
					'postType',
					'attachment',
					imageId
			  )
			: null;
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

	if (
		! normalizedSizes.full &&
		( mediaRecord?.source_url || attributes.url )
	) {
		normalizedSizes.full = {
			url: mediaRecord?.source_url || attributes.url,
			width: mediaDetails.width || attributes.width || 0,
			height: mediaDetails.height || attributes.height || 0,
		};
	}

	return createBlock( 'folioblocks/pb-image-block', {
		id: imageId,
		src,
		imageSize: attributes.sizeSlug || attributes.imageSize || 'large',
		sizes: normalizedSizes,
		width: mediaDetails.width || attributes.width || 0,
		height: mediaDetails.height || attributes.height || 0,
		alt: mediaRecord?.alt_text || attributes.alt || '',
		caption: mediaRecord?.caption?.raw || attributes.caption || '',
		title: decodeEntities(
			mediaRecord?.title?.rendered || attributes.title || ''
		),
		class: attributes.className || '',
		...( getExifAttributesFromMedia( mediaRecord ) || {} ),
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

const transformCoreGalleryImage = ( block ) => {
	if ( block?.name === 'folioblocks/pb-image-block' ) {
		return cloneInnerBlockTree( block );
	}

	if ( block?.name !== 'core/image' ) {
		return null;
	}

	return transformCoreImageToPbImage( block.attributes );
};

const getCoreGalleryInnerBlocks = ( attributes = {}, innerBlocks = [] ) => {
	const transformedInnerBlocks = innerBlocks
		.map( transformCoreGalleryImage )
		.filter( Boolean );

	if ( transformedInnerBlocks.length ) {
		return transformedInnerBlocks;
	}

	return ( attributes.images || [] )
		.map( ( image ) =>
			transformCoreImageToPbImage( {
				id: image.id,
				url: image.url || image.src,
				alt: image.alt,
				caption: image.caption,
				title: image.title,
				width: image.width,
				height: image.height,
				sizeSlug: attributes.sizeSlug || image.sizeSlug,
				className: image.className,
			} )
		)
		.filter( ( block ) => Boolean( block.attributes.src ) );
};

const getCoreGalleryAttributes = ( currentBlockName, attributes = {} ) => {
	const next = {};

	Object.entries( attributes ).forEach( ( [ key, value ] ) => {
		if ( CORE_GALLERY_ATTRS.has( key ) && typeof value !== 'undefined' ) {
			next[ key ] = value;
		}
	} );

	if ( attributes.sizeSlug ) {
		next.resolution = attributes.sizeSlug;
	}

	if (
		currentBlockName === 'folioblocks/grid-gallery-block' &&
		Number( attributes.columns ) > 0
	) {
		next.columns = Number( attributes.columns );
	}

	return next;
};

const transformCoreGalleryToFolioGallery = (
	currentBlockName,
	attributes,
	innerBlocks
) =>
	createBlock(
		currentBlockName,
		getCoreGalleryAttributes( currentBlockName, attributes ),
		getCoreGalleryInnerBlocks( attributes, innerBlocks )
	);

export const disableGalleryWrapperTransforms = () => {
	if ( hasPatchedWrapperTransforms ) {
		return;
	}
	patchAttempts += 1;
	let allFound = true;

	DISABLED_TARGET_BLOCKS.forEach( ( targetName ) => {
		const blockType = getBlockType( targetName );
		if ( ! blockType?.transforms?.from ) {
			allFound = false;
			return;
		}

		const patchedFrom = blockType.transforms.from.map( ( transform ) => {
			if ( transform.type !== 'block' ) {
				return transform;
			}
			if ( transform[ TRANSFORM_PATCH_FLAG ] ) {
				return transform;
			}
			const originalIsMatch = transform.isMatch;
			const patched = {
				...transform,
				isMatch: ( attributes, block ) => {
					const blocks = Array.isArray( block ) ? block : [ block ];
					const hasFolioBlocks = blocks.some( ( item ) => {
						const name = item?.name || '';
						return name.startsWith( 'folioblocks/' );
					} );
					if ( hasFolioBlocks ) {
						return false;
					}
					return originalIsMatch
						? originalIsMatch( attributes, block )
						: true;
				},
			};
			patched[ TRANSFORM_PATCH_FLAG ] = true;
			return patched;
		} );

		blockType.transforms = {
			...blockType.transforms,
			from: patchedFrom,
		};
	} );

	if ( ! allFound && patchAttempts < 5 ) {
		setTimeout( disableGalleryWrapperTransforms, 50 );
		return;
	}

	hasPatchedWrapperTransforms = true;
};

export const buildGalleryTransforms = (
	currentBlockName,
	sourceBlockNames = DEFAULT_GALLERY_BLOCKS
) => {
	const sourceBlocks = sourceBlockNames.filter(
		( blockName ) => blockName !== currentBlockName
	);

	return {
		from: [
			...sourceBlocks.map( ( sourceName ) => ( {
				type: 'block',
				blocks: [ sourceName ],
				transform: ( attributes, innerBlocks ) =>
					createBlock(
						currentBlockName,
						getTransformAttributes( attributes ),
						cloneInnerBlocks( innerBlocks )
					),
			} ) ),
			{
				type: 'block',
				blocks: [ 'core/gallery' ],
				isMatch: ( attributes, block ) =>
					getCoreGalleryInnerBlocks(
						attributes,
						block?.innerBlocks || []
					).length > 0,
				transform: ( attributes, innerBlocks ) =>
					transformCoreGalleryToFolioGallery(
						currentBlockName,
						attributes,
						innerBlocks
					),
			},
		],
		to: [],
	};
};

export const enableGalleryTransforms = ( blockName ) => {
	const blockType = getBlockType( blockName );

	if ( ! blockType ) {
		return;
	}

	disableGalleryWrapperTransforms();
	blockType.transforms = buildGalleryTransforms( blockName );
};

export const enableImageTransforms = ( blockName ) => {
	const blockType = getBlockType( blockName );

	if ( ! blockType ) {
		return;
	}

	disableGalleryWrapperTransforms();
	blockType.transforms = {
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
	};
};

const transformCoreVideoToPbVideo = ( blockName, attributes = {} ) =>
	createBlock( blockName, {
		videoUrl: attributes.src || '',
		thumbnail: attributes.poster || '',
		title: attributes.title || '',
		description: attributes.caption || '',
	} );

const isSupportedVideoEmbed = ( attributes = {} ) => {
	const providerSlug = ( attributes.providerNameSlug || '' ).toLowerCase();
	const providerName = ( attributes.providerName || '' ).toLowerCase();
	const url = ( attributes.url || '' ).toLowerCase();

	return (
		providerSlug === 'youtube' ||
		providerSlug === 'vimeo' ||
		providerName === 'youtube' ||
		providerName === 'vimeo' ||
		url.includes( 'youtube.com' ) ||
		url.includes( 'youtu.be' ) ||
		url.includes( 'vimeo.com' )
	);
};

export const enableVideoTransforms = ( blockName ) => {
	const blockType = getBlockType( blockName );

	if ( ! blockType ) {
		return;
	}

	blockType.transforms = {
		from: [
			{
				type: 'block',
				blocks: [ 'core/video' ],
				isMatch: ( attributes ) => Boolean( attributes.src ),
				transform: ( attributes ) =>
					transformCoreVideoToPbVideo( blockName, attributes ),
			},
			{
				type: 'block',
				blocks: [ 'core/embed' ],
				isMatch: isSupportedVideoEmbed,
				transform: ( attributes ) =>
					createBlock( blockName, {
						videoUrl: attributes.url || '',
						description: attributes.caption || '',
					} ),
			},
		],
	};
};
