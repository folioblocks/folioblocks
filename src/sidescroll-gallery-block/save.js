import { useBlockProps } from '@wordpress/block-editor';
export default function save({ attributes }) {
    const { images, scrollDirection, scrollSpeed, slideHeight, pauseOnHover } = attributes;

    return (
        <div
            {...useBlockProps.save({
                className: 'pb-sidescroll-gallery',
                'data-direction': scrollDirection,
                'data-speed': scrollSpeed,
                'data-pause-on-hover': pauseOnHover,
                style: { height: `${slideHeight}px` }
            })}
        >
            <div className="pb-sidescroll-gallery-track">
                {images.map((image) => (
                    <figure key={image.id} className="pb-sidescroll-gallery-item">
                        <img src={image.src} alt={image.alt} />
                    </figure>
                ))}
            </div>
        </div>
    );
}