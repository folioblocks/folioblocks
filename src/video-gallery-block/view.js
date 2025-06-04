document.addEventListener('DOMContentLoaded', () => {
	const galleries = document.querySelectorAll('.wp-block-portfolio-blocks-video-gallery-block');

	galleries.forEach((galleryBlock) => {
		// Immediately remove is-loading when DOM is ready
		galleryBlock.classList.remove('is-loading');

		const filterButtons = galleryBlock.querySelectorAll('.pb-video-gallery-filters .filter-button');
		const videoBlockWrappers = galleryBlock.querySelectorAll('.wp-block-portfolio-blocks-pb-video-block');

		// Filter functionality
		filterButtons.forEach((button) => {
			button.addEventListener('click', () => {
				const selected = button.getAttribute('data-filter');

				filterButtons.forEach((btn) => btn.classList.remove('is-active'));
				button.classList.add('is-active');

				videoBlockWrappers.forEach((wrapper) => {
					const figure = wrapper.querySelector('.pb-video-block');
					const blockCategory = figure?.getAttribute('data-filter') || '';

					if (selected === 'All' || blockCategory === selected) {
						wrapper.classList.remove('is-hidden');
					} else {
						wrapper.classList.add('is-hidden');
					}
				});
			});
		});
	});
});