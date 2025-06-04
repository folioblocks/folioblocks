/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * All files containing `style` keyword are bundled together. The code used
 * gets applied both to the front of your site and to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './style.scss';

/**
 * Internal dependencies
 */
import Edit from './edit';
import Save from './save';
import metadata from './block.json';

/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
registerBlockType(
	metadata,
	{
		icon: {
			src:
				<svg id="Layer_2" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1644.09 1644.09">
					<g id="Layer_1-2">
						<g>
							<path d="M1584.39,698.83l-103.55-76.77c-7.14-5.36-19.64-3.57-24.99,3.57-5.36,7.14-3.57,19.64,3.57,24.99l83.91,62.49-83.91,62.49c-7.14,5.36-8.93,17.85-3.57,24.99,3.57,5.36,8.93,7.14,14.28,7.14,3.57,0,7.14-1.79,10.71-3.57l103.55-76.77c3.57-3.57,7.14-8.93,7.14-14.28s-1.79-10.71-7.14-14.28Z" />
							<path d="M1339.59,282.05H301.27c-12.45,0-22.55,10.09-22.55,22.55v675.19c0,12.45,10.1,22.55,22.55,22.55h1038.33c12.45,0,22.55-10.1,22.55-22.55V304.6c0-12.45-10.1-22.55-22.55-22.55h0ZM1313.85,954.05H327.01V330.34h986.84v623.71Z" />
							<path d="M570.98,1140.73h-269.72c-10.93,0-19.84,8.9-19.84,19.84v181.65c0,10.93,8.9,19.84,19.84,19.84h269.73c10.93,0,19.84-8.9,19.84-19.84v-181.65c0-10.93-8.9-19.84-19.84-19.84h-.01ZM547.94,1319.19h-223.63v-135.57h223.63v135.57Z" />
							<path d="M953.85,1140.73h-269.7c-10.93,0-19.84,8.9-19.84,19.84v181.65c0,10.93,8.9,19.84,19.84,19.84h269.7c10.95,0,19.86-8.9,19.86-19.84v-181.65c0-10.93-8.9-19.84-19.86-19.84ZM930.82,1319.19h-223.65v-135.57h223.65v135.57Z" />
							<path d="M1339.58,1140.73h-269.7c-10.93,0-19.84,8.9-19.84,19.84v181.65c0,10.93,8.9,19.84,19.84,19.84h269.7c10.95,0,19.86-8.9,19.86-19.84v-181.65c0-10.93-8.9-19.84-19.86-19.84ZM1316.55,1319.19h-223.65v-135.57h223.65v135.57Z" />
							<path d="M188.26,625.63c-5.36-7.14-17.85-8.93-24.99-3.57l-103.56,76.77c-3.57,3.57-7.14,8.93-7.14,14.28s1.79,10.71,7.14,14.28l103.55,76.77c3.57,1.79,7.14,3.57,10.71,3.57,5.36,0,10.71-3.57,14.28-7.14,5.36-7.14,3.57-19.64-3.57-25l-83.91-62.49,83.91-62.49c7.14-5.36,8.93-17.85,3.57-24.99h0Z" />
						</g>
					</g>
				</svg>
		},
		edit: Edit,
		save: Save
	}
);
