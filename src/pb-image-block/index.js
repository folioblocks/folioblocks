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
        edit: Edit,
        save: Save, // Ensure save function is included
        
    }
);