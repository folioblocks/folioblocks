import { createBlock, getBlockType } from '@wordpress/blocks';

const DEFAULT_GALLERY_BLOCKS = [
	'folioblocks/grid-gallery-block',
	'folioblocks/justified-gallery-block',
	'folioblocks/masonry-gallery-block',
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

const DISABLED_TARGET_BLOCKS = [ 'core/group', 'core/columns', 'core/details' ];
const TRANSFORM_PATCH_FLAG = '__fbksGalleryTransformPatched';
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
						return (
							name.startsWith( 'folioblocks/' ) ||
							name.startsWith( 'portfolio-blocks/' )
						);
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
		from: sourceBlocks.map( ( sourceName ) => ( {
			type: 'block',
			blocks: [ sourceName ],
			transform: ( attributes, innerBlocks ) =>
				createBlock(
					currentBlockName,
					getTransformAttributes( attributes ),
					innerBlocks
				),
		} ) ),
	};
};
