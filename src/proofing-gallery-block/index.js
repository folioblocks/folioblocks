/**
 * Proofing Gallery Block
 * Index JS
 */
import { registerBlockType } from '@wordpress/blocks';
import './style.scss';

import Edit from './edit';
import Save from './save';
import metadata from './block.json';

registerBlockType( metadata, {
	icon: {
		src: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1247.24 1247.24">
				<g fill="none" stroke="currentColor" strokeWidth="45" strokeLinecap="round" strokeLinejoin="round">
					<path d="M415 130H176c-25.65 0-46.53 20.89-46.53 46.57V415" />
					<path d="M832 130h238c25.65 0 46.53 20.89 46.53 46.57V415" />
					<path d="M1117 832v238c0 25.68-20.88 46.57-46.53 46.57H832" />
					<path d="M415 1117H176c-25.65 0-46.53-20.89-46.53-46.57V832" />
					<path strokeWidth="90" d="M365 625l175 175 345-430" />
				</g>
			</svg>
		),
	},
	edit: Edit,
	save: Save,
} );
