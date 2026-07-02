/**
 * Proofing Gallery Block
 * Edit JS
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import './editor.scss';
import { IconProofingGallery, IconPBSpinner } from '../pb-helpers/icons';
export default function Edit( { attributes } ) {
		const {
		preview,
	} = attributes;
	
	// Block Preview Image
	if ( preview ) {
			return (
				<div className="pb-block-preview">
					<IconProofingGallery />
				</div>
			);
	}
	return (
		<p { ...useBlockProps() }>
			{ __( 'Proofing Gallery Block - hello from the editor!', 'folioblocks' ) }
		</p>
	);
}
