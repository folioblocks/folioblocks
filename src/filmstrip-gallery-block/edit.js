/**
 * Filmstrip Gallery Block
 * Edit JS
 **/
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { IconFilmstripGallery } from '../pb-helpers/icons';
import './editor.scss';

export default function Edit({ attributes }) {
	const { preview } = attributes;

	// Block Preview Image
	if (preview) {
		return (
			<div className="pb-block-preview">
				<IconFilmstripGallery />
			</div>
		);
	}

	return (
		<p { ...useBlockProps() }>
			{ __( 'Filmstrip Gallery Block – hello from the editor!', 'filmstrip-gallery-block' ) }
		</p>
	);
}
