/**
 * PB Image Stack Block
 * Index JS
 */
import { registerBlockType } from "@wordpress/blocks";
import "./style.scss";
import Edit from "./edit";
import Save from "./save";
import metadata from "./block.json";

registerBlockType(metadata, {
	icon: {
		src: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				aria-hidden="true"
				viewBox="0 0 24 24"
			>
				<path d="M17.5 4v5a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2V4H8v5a.5.5 0 0 0 .5.5h7A.5.5 0 0 0 16 9V4zm0 16v-5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v5H8v-5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v5z" />
			</svg>
		),
	},
	edit: Edit,
	save: Save,
});
