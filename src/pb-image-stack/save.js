/**
 * PB Image Stack Block
 * Save JS
 **/
import { InnerBlocks } from '@wordpress/block-editor';

export default function save() {
    return (
        <div className="pb-image-stack">
            <InnerBlocks.Content />
        </div>
    );
}