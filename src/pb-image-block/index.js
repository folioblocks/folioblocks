import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import edit from './edit';
import save from './save';

registerBlockType('portfolio-blocks/pb-image-block', {
    edit,
    save, // Ensure save function is included
});