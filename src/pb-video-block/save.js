import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
	const {
		thumbnail,
		title,
		alt,
		description,
		aspectRatio = '16:9',
		filterCategory = '',
		playButtonVisibility = 'always',
		titleVisibility = 'always',
		lightboxLayout = 'video-only',
		borderWidth,
		borderColor,
		borderRadius,
		dropShadow,
	} = attributes;

	const style = {
		borderWidth: borderWidth ? `${borderWidth}px` : undefined,
		borderStyle: borderWidth ? 'solid' : undefined,
		borderColor: borderColor || undefined,
		borderRadius: borderRadius ? `${borderRadius}px` : undefined,
	};

	if (!thumbnail) {
		return (
			<div {...useBlockProps.save()}>
				<p>No thumbnail selected.</p>
			</div>
		);
	}

	return (
		<div
			{...useBlockProps.save({
				className: `pb-video-block${dropShadow ? ' drop-shadow' : ''}`,
				style,
			})}
			data-aspect-ratio={aspectRatio}
			data-filter={filterCategory}
			data-title-visibility={titleVisibility}
			data-play-button={playButtonVisibility}
			data-video-description={description}
			title={title}

		>
			<img src={thumbnail} alt={alt || title || ''} />
			<div className="video-overlay">{title}</div>
		</div>
	);
}