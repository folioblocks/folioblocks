/**
 * PB Image Block
 * Index JS
 **/
import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import Save from './save';
import metadata from './block.json';

registerBlockType(
    metadata,
    {
        icon: {
            src:
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1247.24 1247.24">
                    <path d="M180 180H1067C1115 180 1155 220 1155 268V979C1155 1027 1115 1067 1067 1067H180C132 1067 92 1027 92 979V268C92 220 132 180 180 180ZM180 230C150 230 124 256 124 286V961C124 991 150 1017 180 1017H1067C1097 1017 1123 991 1123 961V286C1123 256 1097 230 1067 230H180Z"/>
                    <circle cx="455" cy="420" r="85"/>
                    <path d="M820 520c17 0 33 9 41 24l205 355c8 14 8 31 0 45-8 14-24 24-41 24H300c-17 0-32-9-41-24-9-15-8-33 3-47l125-170c8-11 21-18 35-18 14 0 27 6 35 18l45 65 95-160c8-14 24-24 41-24Z"/>
                </svg>     
            },
        edit: Edit,
        save: Save,
    }
);