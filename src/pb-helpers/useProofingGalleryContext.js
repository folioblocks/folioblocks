import { store as blockEditorStore } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

const EMPTY_PROOFING_GALLERY_ATTRIBUTES = {};
const OUTSIDE_PROOFING_GALLERY_CONTEXT = {
	isInsideProofingGallery: false,
	proofingGalleryAttributes: EMPTY_PROOFING_GALLERY_ATTRIBUTES,
};

export const useProofingGalleryContext = ( clientId ) =>
	useSelect(
		( select ) => {
			const blockEditor = select( blockEditorStore );
			const parents = blockEditor.getBlockParents( clientId, true ) || [];
			const proofingParentId = parents.find(
				( parentId ) =>
					blockEditor.getBlockName( parentId ) ===
					'folioblocks/proofing-gallery-block'
			);

			if ( ! proofingParentId ) {
				return OUTSIDE_PROOFING_GALLERY_CONTEXT;
			}

			return {
				isInsideProofingGallery: true,
				proofingGalleryAttributes:
					blockEditor.getBlock( proofingParentId )?.attributes ||
					EMPTY_PROOFING_GALLERY_ATTRIBUTES,
			};
		},
		[ clientId ]
	);
