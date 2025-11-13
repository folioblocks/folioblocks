/**
 * Video Gallery Block
 * View JS
 **/
document.addEventListener('DOMContentLoaded', () => {
	const galleries = document.querySelectorAll('.wp-block-folioblocks-video-gallery-block');

	galleries.forEach((galleryBlock) => {
		// Immediately remove is-loading when DOM is ready
		galleryBlock.classList.remove('is-loading');
	});
});