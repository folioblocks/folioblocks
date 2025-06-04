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
				<svg id="Layer_2" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1247.24 1247.24">
					<g id="Layer_1-2">
						<g>
							<path d="M1141.13,83.62h-599.75c-12.42,0-22.49,10.07-22.49,22.49v279.01c0,12.42,10.07,22.49,22.49,22.49h599.74c12.42,0,22.49-10.07,22.49-22.49V106.11c.01-12.42-10.06-22.49-22.48-22.49ZM1115.45,359.45h-548.39v-227.66h548.39v227.66h0Z" />
							<path d="M1141.13,461.62h-408.62c-12.42,0-22.49,10.07-22.49,22.49v279.01c0,12.42,10.07,22.49,22.49,22.49h408.62c12.42,0,22.49-10.07,22.49-22.49v-279.01c0-12.42-10.07-22.49-22.49-22.49ZM1115.45,737.45h-357.27v-227.66h357.27v227.66Z" />
							<path d="M1141.13,839.62h-408.62c-12.42,0-22.49,10.07-22.49,22.49v279.01c0,12.42,10.07,22.49,22.49,22.49h408.62c12.42,0,22.49-10.07,22.49-22.49v-279.01c0-12.42-10.07-22.49-22.49-22.49ZM1115.45,1115.45h-357.27v-227.66h357.27v227.66Z" />
							<path d="M633.99,461.62H106.11c-12.42,0-22.49,10.07-22.49,22.49v657.01c0,12.42,10.07,22.49,22.49,22.49h527.88c12.42,0,22.49-10.07,22.49-22.49V484.11c0-12.42-10.07-22.49-22.49-22.49ZM608.32,1115.45H131.79V509.79h476.53v605.66Z" />
							<path d="M106.11,407.62h336.76c12.42,0,22.49-10.07,22.49-22.49V106.11c.01-12.42-10.07-22.49-22.49-22.49H106.11c-12.42,0-22.49,10.07-22.49,22.49v279.01c0,12.42,10.07,22.49,22.49,22.49h0ZM131.79,131.79h285.41v227.66H131.79v-227.66Z" />
						</g>
					</g>
				</svg>
		},
		edit: Edit,
		save: Save
	}
);
