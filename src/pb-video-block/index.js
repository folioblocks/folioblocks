/**
 * PB Video Block
 * Index JS
 */
import { createBlock, registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import Save from './save';
import metadata from './block.json';

const transformCoreVideoToPbVideo = ( attributes = {} ) => {
	const videoUrl = attributes.src || '';

	return createBlock( metadata.name, {
		videoUrl,
		thumbnail: attributes.poster || '',
		title: attributes.title || '',
		description: attributes.caption || '',
	} );
};

const isSupportedVideoEmbed = ( attributes = {} ) => {
	const providerSlug = ( attributes.providerNameSlug || '' ).toLowerCase();
	const providerName = ( attributes.providerName || '' ).toLowerCase();
	const url = ( attributes.url || '' ).toLowerCase();

	return (
		providerSlug === 'youtube' ||
		providerSlug === 'vimeo' ||
		providerName === 'youtube' ||
		providerName === 'vimeo' ||
		url.includes( 'youtube.com' ) ||
		url.includes( 'youtu.be' ) ||
		url.includes( 'vimeo.com' )
	);
};

const transformVideoEmbedToPbVideo = ( attributes = {} ) =>
	createBlock( metadata.name, {
		videoUrl: attributes.url || '',
		description: attributes.caption || '',
	} );

registerBlockType( metadata.name, {
	icon: {
		src: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 1247.24 1247.24"
			>
				<path d="M180 180H1067C1115 180 1155 220 1155 268V979C1155 1027 1115 1067 1067 1067H180C132 1067 92 1027 92 979V268C92 220 132 180 180 180ZM180 230C150 230 124 256 124 286V961C124 991 150 1027 180 1027H1067C1097 1027 1123 991 1123 961V286C1123 256 1097 230 1067 230H180Z" />
				<path d="M460 445v360c0 15 10 25 24 25 6 0 12-2 17-6l268-180c19-13 19-43 0-56L501 394c-5-4-11-6-17-6-14 0-24 10-24 25z" />
			</svg>
		),
	},
	edit: Edit,
	save: Save,
	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'core/video' ],
				isMatch: ( attributes ) => !! attributes.src,
				transform: transformCoreVideoToPbVideo,
			},
			{
				type: 'block',
				blocks: [ 'core/embed' ],
				isMatch: isSupportedVideoEmbed,
				transform: transformVideoEmbedToPbVideo,
			},
		],
	},
} );
