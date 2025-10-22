document.addEventListener("DOMContentLoaded", function () {
	const galleries = document.querySelectorAll('.wp-block-portfolio-blocks-grid-gallery-block');

	// Disable right-click on entire page if any gallery block has it enabled
	const disableRightClick = document.querySelector('[data-disable-right-click="true"]');
	if (disableRightClick) {
		document.addEventListener('contextmenu', (e) => {
			e.preventDefault();
		});
	}

	galleries.forEach((gallery) => gallery.classList.add('is-loading'));

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;

			const img = entry.target;
			const wrapper = img.closest('.pb-image-block-wrapper');
			const figure = wrapper?.querySelector('.pb-image-block');

			if (!wrapper || !figure || !img.complete || !img.naturalWidth) return;

			const resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					const wrapperWidth = entry.contentRect.width;
					const wrapperHeight = entry.contentRect.height;

					const borderWidth = parseFloat(getComputedStyle(img).borderWidth) || 0;
					const aspectRatio = img.naturalWidth / img.naturalHeight;

					const maxWidth = wrapperWidth * 0.85;
					const maxHeight = wrapperHeight * 0.85;

					let scaledWidth = maxWidth;
					let scaledHeight = scaledWidth / aspectRatio;

					if (scaledHeight > maxHeight) {
						scaledHeight = maxHeight;
						scaledWidth = scaledHeight * aspectRatio;
					}

					const adjustedWidth = scaledWidth + borderWidth * 2;
					const adjustedHeight = scaledHeight + borderWidth * 2;

					requestAnimationFrame(() => {
						if (figure.style.width !== `${adjustedWidth}px`) {
							figure.style.width = `${adjustedWidth}px`;
						}
						if (figure.style.height !== `${adjustedHeight}px`) {
							figure.style.height = `${adjustedHeight}px`;
						}
					});
				}
			});

			resizeObserver.observe(wrapper);
			img.classList.add('is-visible');
			observer.unobserve(img);
		});
	}, {
		rootMargin: '100px',
		threshold: 0.1,
	});

	galleries.forEach((gallery) => {
		gallery.classList.remove('is-loading');
		const imgs = gallery.querySelectorAll('img.pb-image-block-img');

		imgs.forEach((img) => {
			if (img.complete) {
				observer.observe(img); // may trigger immediately
			} else {
				img.onload = () => observer.observe(img);
				img.onerror = () => observer.observe(img);
			}
		});
	});

	galleries.forEach((galleryBlock) => {
		const filterButtons = galleryBlock.querySelectorAll('.pb-image-gallery-filters .filter-button');
		const imageBlockWrappers = galleryBlock.querySelectorAll('.pb-image-block-wrapper');

		filterButtons.forEach((button) => {
			button.addEventListener('click', () => {
				const selected = button.getAttribute('data-filter');

				// Toggle active state
				filterButtons.forEach((btn) => btn.classList.remove('is-active'));
				button.classList.add('is-active');

				// Show/hide full wrapper blocks based on filter
				imageBlockWrappers.forEach((wrapper) => {
					const blockCategory = wrapper.getAttribute('data-filter') || '';

					if (selected === 'All' || blockCategory === selected) {
						wrapper.classList.remove('is-hidden');
					} else {
						wrapper.classList.add('is-hidden');
					}
				});
			});
		});
	});

	// Sequential fade-in for grid gallery images
	const gridBlocks = document.querySelectorAll('.pb-image-block-wrapper');
	gridBlocks.forEach((block, index) => {
		block.style.opacity = 0;
		block.style.transform = 'translateY(20px)';
		block.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
		setTimeout(() => {
			block.style.opacity = 1;
			block.style.transform = 'translateY(0)';
		}, index * 150);
	});
});