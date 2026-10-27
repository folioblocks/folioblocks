/**
 * PB Video Block
 * Index JS
 */
import { registerBlockType } from "@wordpress/blocks";
import "./style.scss";
import Edit from "./edit";
import Save from "./save";
import metadata from "./block.json";

registerBlockType(metadata.name, {
	icon: {
		src: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1247.24 1247.24">
				<path d="M180 180h887c48 0 88 40 88 88v711c0 48-40 88-88 88H180c-48 0-88-40-88-88V268c0-48 40-88 88-88m0 50c-30 0-56 26-56 56v675c0 30 26 66 56 66h887c30 0 56-36 56-66V286c0-30-26-56-56-56z" />
				<path d="M460 445v360c0 15 10 25 24 25 6 0 12-2 17-6l268-180c19-13 19-43 0-56L501 394c-5-4-11-6-17-6-14 0-24 10-24 25z" />
			</svg>
		),
	},
	edit: Edit,
	save: Save,
});
