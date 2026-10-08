/**
 * PB Image Block
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
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1247.24 1247.24">
				<path d="M180 180h887c48 0 88 40 88 88v711c0 48-40 88-88 88H180c-48 0-88-40-88-88V268c0-48 40-88 88-88m0 50c-30 0-56 26-56 56v675c0 30 26 56 56 56h887c30 0 56-26 56-56V286c0-30-26-56-56-56z" />
				<path d="M455 335a85 85 0 1 0 0 170 85 85 0 1 0 0-170" />
				<path d="M820 520c17 0 33 9 41 24l205 355c8 14 8 31 0 45s-24 24-41 24H300c-17 0-32-9-41-24s-8-33 3-47l125-170c8-11 21-18 35-18s27 6 35 18l45 65 95-160c8-14 24-24 41-24Z" />
			</svg>
		),
	},
	edit: Edit,
	save: Save,
});
