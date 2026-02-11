/**
 * PB Loupe Block
 * Index JS
 */
import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import metadata from './block.json';

registerBlockType( metadata.name, {
	/**
	 * @see ./edit.js
	 */
	icon: {
		src: (
			<svg
				viewBox="0 0 1247.24 1247.24"
				width="24"
				height="24"
				role="img"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g id="Layer_1-2">
					<g
						fill="none"
						stroke="currentColor"
						strokeWidth="45"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeMiterlimit="10"
					>
						<path d="M415,130 H176 c-25.65,0 -46.53,20.89 -46.53,46.57 V415" />
						<path d="M832,130 h238 c25.65,0 46.53,20.89 46.53,46.57 V415" />
						<path d="M1117,832 v238 c0,25.68 -20.88,46.57 -46.53,46.57 H832" />
						<path d="M415,1117 H176 c-25.65,0 -46.53,-20.89 -46.53,-46.57 V832" />
						<circle cx="580" cy="580" r="230" />
						<line x1="745" y1="745" x2="950" y2="950" />
					</g>
				</g>
			</svg>
		),
	},
	edit: Edit,
} );
