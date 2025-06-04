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

	function waitForImage(img) {
		return new Promise((resolve) => {
			const timeout = setTimeout(() => {
				console.warn('Timeout reached for image', img);
				resolve();
			}, 3000); // fallback after 3s

			if (img.complete && img.naturalWidth) {
				clearTimeout(timeout);
				resolve();
			} else {
				img.addEventListener('load', () => {
					clearTimeout(timeout);
					resolve();
				}, { once: true });

				img.addEventListener('error', () => {
					clearTimeout(timeout);
					resolve();
				}, { once: true });
			}
		});
	}

	const imageLoadPromises = Array.from(galleries).flatMap((gallery) => {
		const galleryImages = Array.from(gallery.querySelectorAll('img'));
		return galleryImages.map(waitForImage);
	});
	console.log('Found images to wait for:', imageLoadPromises.length);

	Promise.all(imageLoadPromises).then(() => {
		console.log('All images loaded, running layout logic');
		const wrappers = document.querySelectorAll(".pb-image-block-wrapper");

		wrappers.forEach((wrapper) => {
			const figure = wrapper.querySelector(".pb-image-block");
			const img = wrapper.querySelector("img");

			if (!figure || !img) return;

			const observer = new ResizeObserver((entries) => {
				for (const entry of entries) {
					const wrapperWidth = entry.contentRect.width;
					const wrapperHeight = entry.contentRect.height;

					if (!img.complete || !img.naturalWidth || !img.naturalHeight) return;

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

			observer.observe(wrapper);
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

		requestAnimationFrame(() => {
			galleries.forEach((gallery) => {
				console.log('Removing .is-loading from', gallery);
				gallery.classList.remove('is-loading');
			});
		});
	});
});