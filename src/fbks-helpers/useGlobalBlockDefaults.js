import { useEffect, useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

/** Preserve saved, duplicated, and explicitly configured content. */
export const getInitialBlockDefaults = ( attributes, defaults, schema ) => {
	const result = {};
	for ( const [ name, value ] of Object.entries( defaults || {} ) ) {
		if (
			schema[ name ] &&
			( attributes[ name ] === undefined ||
				attributes[ name ] === schema[ name ].default ||
                ( typeof schema[ name ].default === 'object' && JSON.stringify( attributes[ name ] ) === JSON.stringify( schema[ name ].default ) ) )
		) {
			result[ name ] = value;
		}
	}
	return result;
};

export default function useGlobalBlockDefaults(
	clientId,
	blockName,
	attributes,
	setAttributes,
	schema,
	inheritGallery = false
) {
	const applied = useRef( false );
	const nested = useSelect( ( select ) =>
        [ 'folioblocks/pb-image-block', 'folioblocks/pb-video-block' ].includes( blockName ) &&
        select( 'core/block-editor' ).getBlockParents( clientId ).length > 0,
        [ clientId, blockName ]
    );
    const hasChildren = useSelect( ( select ) => {
        const editor = select( 'core/block-editor' );
        if ( blockName === 'folioblocks/modular-gallery-block' ) {
            const containsMedia = blocks => blocks.some( block =>
                !!( block.attributes?.id || block.attributes?.src || block.attributes?.videoUrl ) ||
                containsMedia( block.innerBlocks || [] )
            );
            return containsMedia( editor.getBlocks( clientId ) );
        }
        return [ 'folioblocks/carousel-gallery-block', 'folioblocks/filmstrip-gallery-block', 'folioblocks/video-gallery-block', 'folioblocks/grid-gallery-block', 'folioblocks/justified-gallery-block', 'folioblocks/masonry-gallery-block', 'folioblocks/proofing-gallery-block' ].includes( blockName ) &&
            editor.getBlockCount( clientId ) > 0;
    }, [ clientId, blockName ] );
	const justInserted = useSelect(
		( select ) =>
			select( 'core/block-editor' ).wasBlockJustInserted( clientId ),
		[ clientId ]
	);
	useEffect( () => {
		if (
			applied.current ||
			inheritGallery ||
            nested ||
			! justInserted ||
			attributes.globalDefaultsApplied ||
			attributes.preview ||
			! window.folioBlocksData?.isPro
		)
			return;
		applied.current = true;
		// Media-bearing pasted or transformed blocks retain their own configuration.
		const hasMedia = hasChildren || !! (
            attributes.images?.length ||
            attributes.videos?.length ||
            ( blockName === 'folioblocks/proofing-gallery-block' && ( attributes.clientEmail || attributes.galleryPassword ) ) ||
			attributes.id ||
			attributes.beforeImage ||
			attributes.afterImage ||
			attributes.mediaDesktop ||
			attributes.videoUrl
		);
		const defaults = hasMedia
			? {}
			: getInitialBlockDefaults(
					attributes,
					window.folioBlocksData?.blockDefaults?.[ blockName ],
					schema
			  );
		setAttributes( { ...defaults, globalDefaultsApplied: true } );
	}, [
		justInserted,
        nested,
        hasChildren,
		attributes,
		blockName,
		schema,
		setAttributes,
		inheritGallery,
	] );
}
