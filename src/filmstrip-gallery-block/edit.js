/**
 * Filmstrip Gallery Block
 * Edit JS
 **/
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import './editor.scss';

export default function Edit() {
	return (
		<p { ...useBlockProps() }>
			{ __( 'Filmstrip Gallery Block – hello from the editor!', 'filmstrip-gallery-block' ) }
		</p>
	);
}
