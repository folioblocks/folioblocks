import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
	const { beforeImage, afterImage } = attributes;

	return (
		<div {...useBlockProps.save()}>
			{beforeImage?.src && afterImage?.src && (
				<div className="pb-before-after-frontend">
					<img src={beforeImage.src} alt={beforeImage.alt || ''} />
					<img src={afterImage.src} alt={afterImage.alt || ''} />
				</div>
			)}
		</div>
	);
}