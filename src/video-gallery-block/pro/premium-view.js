/**
 * Video Gallery Block
 * Premium View JS
 **/
document.addEventListener('DOMContentLoaded', () => {
	const galleries = document.querySelectorAll('.wp-block-folioblocks-video-gallery-block');

	galleries.forEach((galleryBlock) => {
		
		const filterButtons = galleryBlock.querySelectorAll('.pb-video-gallery-filters .filter-button');
		const videoBlockWrappers = galleryBlock.querySelectorAll('.wp-block-folioblocks-pb-video-block');

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

	// Disable right-click on entire page if any gallery block has it enabled
	const disableRightClick = document.querySelector('[data-disable-right-click="true"]');
	if (disableRightClick) {
		document.addEventListener('contextmenu', (e) => {
			e.preventDefault();
		});
	}
});