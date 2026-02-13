/**
 * Filmstrip Gallery Block
 * Index JS
 */
import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import Save from './save';
import metadata from './block.json';
import {
	buildGalleryTransforms,
	disableGalleryWrapperTransforms,
} from '../pb-helpers/galleryTransforms';

disableGalleryWrapperTransforms();

const FILMSTRIP_CAROUSEL_TRANSFORM_BLOCKS = [
	'folioblocks/filmstrip-gallery-block',
	'folioblocks/carousel-gallery-block',
];

registerBlockType( metadata, {
	icon: {
		src: (
			<svg
				id="Layer_2"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 1247.24 1247.24"
			>
				<g id="Layer_1-2">
					<g>
						<path d="M1095.04,145.72v677.92H159.54V145.72h935.5m25.03-46.24H135.8c-11.54,0-21.17,9.77-21.17,21.49v727.41c0,11.72,9.63,21.49,21.17,21.49h984.27c11.54,0,21.17-9.77,21.17-21.49V120.97c0-11.72-9.63-21.49-21.17-21.49Z" />

						<path d="M1093.75,969.51v125.03h-211.74v-125.03h211.74m24.38-46.23h-260.5c-11.54,0-21.17,9.77-21.17,21.49v174.53c0,11.72,9.63,21.49,21.17,21.49h260.5c11.54,0,21.17-9.77,21.17-21.49V944.78c0-11.72-9.63-21.49-21.17-21.49Z" />
						<path d="M733.16,969.51v125.03H521.42v-125.03h211.74m24.38-46.23h-260.5c-11.54,0-21.17,9.77-21.17,21.49v174.53c0,11.72,9.63,21.49,21.17,21.49h260.5c11.54,0,21.17-9.77,21.17-21.49V944.78c0-11.72-9.63-21.49-21.17-21.49Z" />
						<path d="M372.57,969.51v125.03H160.83v-125.03h211.74m24.38-46.23h-260.5c-11.54,0-21.17,9.77-21.17,21.49v174.53c0,11.72,9.63,21.49,21.17,21.49h260.5c11.54,0,21.17-9.77,21.17-21.49V944.78c0-11.72-9.63-21.49-21.17-21.49Z" />

						<path d="M873.03,605.49c-5.14,0-10.26-1.95-13.47-7.17-5.14-7.17-3.21-18.88,3.21-24.1l79.56-59.91-79.56-59.91c-7.06-5.21-8.35-16.93-3.21-24.1s16.68-8.47,23.74-3.26l98.17,73.58c5.14,3.26,7.06,8.47,7.06,13.67s-3.21,10.41-7.06,13.67l-98.17,73.58c-3.21,1.95-7.06,3.26-10.26,3.26Z" />
						<path d="M381.54,605.49c-3.21,0-7.06-1.95-10.26-3.26l-98.17-73.58c-5.14-3.26-7.06-8.47-7.06-13.67s3.21-10.41,7.06-13.67l98.17-73.58c7.06-5.21,18.61-3.26,23.74,3.26,5.14,7.17,3.21,18.88-3.21,24.1l-79.56,59.91,79.56,59.91c7.06,5.21,8.35,16.93,3.21,24.1-3.21,3.26-8.35,7.17-13.47,7.17Z" />
					</g>
				</g>
			</svg>
		),
	},
	edit: Edit,
	save: Save,
	transforms: buildGalleryTransforms(
		metadata.name,
		FILMSTRIP_CAROUSEL_TRANSFORM_BLOCKS
	),
} );
