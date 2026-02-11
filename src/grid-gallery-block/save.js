/**
 * Grid Gallery Block
 * Save JS
 */
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { columns, tabletColumns, mobileColumns } = attributes;

	const style = {
		'--grid-cols-desktop': `${ columns }`,
		'--grid-cols-tablet': `${ tabletColumns }`,
		'--grid-cols-mobile': `${ mobileColumns }`,
	};

	return (
		<div className="pb-grid-gallery" style={ style }>
			<InnerBlocks.Content />
		</div>
	);
}
