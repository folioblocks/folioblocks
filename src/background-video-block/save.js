/**
 * Background Video Block
 * Save
 *
 * Even though the block renders dynamically on the front end (render.php),
 * we MUST serialize InnerBlocks into post content so nested blocks persist
 * after saving and reloading the editor.
 */

import { InnerBlocks } from '@wordpress/block-editor';

export default function save() {
	return <InnerBlocks.Content />;
}
