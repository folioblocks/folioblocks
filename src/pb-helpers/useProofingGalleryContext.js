import { store as blockEditorStore } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

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
				return {
					isInsideProofingGallery: false,
					proofingGalleryAttributes: {},
				};
			}

			return {
				isInsideProofingGallery: true,
				proofingGalleryAttributes:
					blockEditor.getBlock( proofingParentId )?.attributes || {},
			};
		},
		[ clientId ]
	);
