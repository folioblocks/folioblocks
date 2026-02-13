/**
 * Background Video Block
 * Index JS
 */

import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import Save from './save';
import metadata from './block.json';

registerBlockType(metadata.name, {
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
				<path fillRule="evenodd" d="M180 180H1067C1115 180 1155 220 1155 268V979C1155 1027 1115 1067 1067 1067H180C132 1067 92 1027 92 979V268C92 220 132 180 180 180ZM180 230C150 230 124 256 124 286V961C124 991 150 1017 180 1017H1067C1097 1017 1123 991 1123 961V286C1123 256 1097 230 1067 230H180Z" />
				<path d="m414,329.78717l420,0c21,0 38,17 38,38s-17,38 -38,38l-420,0c-21,0 -38,-17 -38,-38s17,-38 38,-38z" />
				<path d="m517.44678,547l0,153c0,17 18,28 33,21l180,-90c15,-7 16,-28 1,-36l-180,-90c-15,-8 -34,4 -34,21l0,21z" />
				<path d="m414,810.82983l420,0c21,0 38,17 38,38s-17,38 -38,38l-420,0c-21,0 -38,-17 -38,-38s17,-38 38,-38z" />
			</svg>
		),
	},
	edit: Edit,
	save: Save,
});
