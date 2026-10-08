/**
 * Background Video Block
 * Index JS
 */

import { registerBlockType } from "@wordpress/blocks";
import { InnerBlocks, useBlockProps } from "@wordpress/block-editor";
import "./style.scss";
import Edit from "./edit";
import Save from "./save";
import metadata from "./block.json";

const deprecated = [
	{
		save: () => {
			const blockProps = useBlockProps.save();
			return (
				<div {...blockProps}>
					<InnerBlocks.Content />
				</div>
			);
		},
	},
];

registerBlockType(metadata.name, {
	icon: {
		src: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				aria-hidden="true"
				viewBox="0 0 1247.24 1247.24"
			>
				<path
					fillRule="evenodd"
					d="M180 180h887c48 0 88 40 88 88v711c0 48-40 88-88 88H180c-48 0-88-40-88-88V268c0-48 40-88 88-88m0 50c-30 0-56 26-56 56v675c0 30 26 56 56 56h887c30 0 56-26 56-56V286c0-30-26-56-56-56z"
				/>
				<path d="M414 329.78717h420c21 0 38 17 38 38s-17 38-38 38H414c-21 0-38-17-38-38s17-38 38-38" />
				<path d="M517.44678 547v153c0 17 18 28 33 21l180-90c15-7 16-28 1-36l-180-90c-15-8-34 4-34 21z" />
				<path d="M414 810.82983h420c21 0 38 17 38 38s-17 38-38 38H414c-21 0-38-17-38-38s17-38 38-38" />
			</svg>
		),
	},
	edit: Edit,
	save: Save,
	deprecated,
});
