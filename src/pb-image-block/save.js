import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
	const {
		id,
		src,
		alt,
		title,
		caption,
		width,
		height,
		filterCategory = '',
		borderWidth,
		borderRadius,
		borderColor,
		enableDownload, 
	} = attributes;

	const imageStyle = {
		borderWidth: borderWidth ? `${borderWidth}px` : undefined,
		borderRadius: borderRadius ? `${borderRadius}px` : undefined,
		borderColor: borderColor || undefined,
		borderStyle: borderWidth ? 'solid' : undefined,
	};

	const captionStyle = {
		borderRadius: borderRadius ? `${borderRadius}px` : undefined,
	};

	return (
		<figure
			{...useBlockProps.save()}
			data-id={id}
			data-width={width}
			data-height={height}
			data-filter={filterCategory}
			data-enable-download={enableDownload}
		>
			<img
				src={src}
				alt={alt}
				title={title}
				width={width}
				height={height}
				style={imageStyle}
			/>
			{caption && <figcaption style={captionStyle}>{caption}</figcaption>}
		</figure>
	);
}