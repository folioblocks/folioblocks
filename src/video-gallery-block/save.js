import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save({ attributes }) {
	const {
		columns,
		tabletColumns,
		mobileColumns,
		gap,
	} = attributes;

	return (
		<div {...useBlockProps.save()}>
			<div
				className={`pb-video-gallery cols-d-${columns} cols-t-${tabletColumns} cols-m-${mobileColumns}`}
				style={{ '--gap': `${gap}px` }}
			>
				<InnerBlocks.Content />
			</div>
		</div>
	);
}