/**
 * Modular Gallery Block
 * Save JS
 */
import { InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { noGap, collapseOnMobile } = attributes;

	const classes = [
		'pb-modular-gallery',
		noGap ? 'no-gap' : '',
		collapseOnMobile ? 'collapse-on-mobile' : '',
	]
		.filter( Boolean )
		.join( ' ' );

	return (
		<div className={ classes }>
			<InnerBlocks.Content />
		</div>
	);
}
