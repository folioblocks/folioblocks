// Frontend layout logic for Modular Gallery Block

// Disable right-click on entire page if any gallery block has it enabled
const disableRightClick = document.querySelector('[data-disable-right-click="true"]');
if (disableRightClick) {
	document.addEventListener('contextmenu', (e) => {
		e.preventDefault();
	});
}

// Helper function to wait for all images to load
function waitForImages(container, callback) {
	const images = container.querySelectorAll('img');
	let loadedCount = 0;

	if (images.length === 0) {
		callback();
		return;
	}

	images.forEach((img) => {
		if (img.complete) {
			loadedCount++;
			if (loadedCount === images.length) {
				callback();
			}
		} else {
			img.addEventListener('load', () => {
				loadedCount++;
				if (loadedCount === images.length) {
					callback();
				}
			});
			img.addEventListener('error', () => {
				loadedCount++;
				if (loadedCount === images.length) {
					callback();
				}
			});
		}
	});
}

// Function to recalculate layout
function recalculateLayout(container) {
	// Skip layout on mobile if collapse-on-mobile is active
const gallery = container.closest('.pb-modular-gallery');
if (gallery?.classList.contains('collapse-on-mobile') && window.innerWidth < 768) {
	Array.from(container.children).forEach((child) => {
		// Clear layout styles
		child.style.width = '';
		child.style.height = '';
		child.style.marginRight = '';
		child.style.marginBottom = '';

		const figures = child.querySelectorAll('.pb-image-block');
		figures.forEach((figure) => {
			figure.style.width = '';
			figure.style.height = '';
			figure.style.marginRight = '';
			figure.style.marginBottom = '';
		});
	});
	return;
}
	const gap = container.closest('.no-gap') ? 0 : 10;
	const children = Array.from(container.children);
	const totalAspectRatio = children.reduce((sum, child) => {
		if (child.classList.contains('pb-image-block-wrapper')) {
			const img = child.querySelector('img');
			if (img) {
				const width = img.naturalWidth || img.width;
				const height = img.naturalHeight || img.height;
				if (width && height) {
					return sum + width / height;
				}
			}
		} else if (child.classList.contains('pb-image-stack')) {
			const imgs = child.querySelectorAll('img');
			if (imgs.length > 0) {
				let totalHeight = 0;
				let maxWidth = 0;
				imgs.forEach((img) => {
					const width = img.naturalWidth || img.width;
					const height = img.naturalHeight || img.height;
					if (width && height) {
						totalHeight += height;
						if (width > maxWidth) {
							maxWidth = width;
						}
					}
				});
				// Add gap space between stacked images
				const gapCount = imgs.length - 1;
				const effectiveTotalHeight = totalHeight + gap * gapCount;
				if (maxWidth > 0 && effectiveTotalHeight > 0) {
					return sum + (maxWidth / effectiveTotalHeight);
				}
			}
		}
		return sum;
	}, 0);

	const containerWidth = container.clientWidth;
	const targetHeight = (containerWidth - gap * (children.length - 1)) / totalAspectRatio;

	children.forEach((child) => {
		if (child.classList.contains('pb-image-block-wrapper')) {
			const img = child.querySelector('figure img');
			if (img) {
				const aspectRatio = img.naturalWidth / img.naturalHeight;
				const width = targetHeight * aspectRatio;
				const figure = child.querySelector('.pb-image-block');
				if (figure) {
					figure.style.width = `${width}px`;
					figure.style.height = `${targetHeight}px`;
					figure.style.marginRight = `${gap}px`;
					figure.style.marginBottom = `${gap}px`;
				}
			}
		} else if (child.classList.contains('pb-image-stack')) {
			const imgs = child.querySelectorAll('img');
			const stackAspectRatios = Array.from(imgs).map((img) => {
				const width = img.naturalWidth || img.width;
				const height = img.naturalHeight || img.height;
				return width / height;
			});
			const stackAspectRatio = Math.max(...stackAspectRatios, 1);
			const width = targetHeight * stackAspectRatio;
			child.style.width = `${width}px`;
			child.style.height = `${targetHeight}px`;
			child.style.marginRight = `${gap}px`;
			child.style.marginBottom = `${gap}px`;

			const figures = child.querySelectorAll('.pb-image-block');
			let totalOriginalHeight = 0;
			imgs.forEach((img) => {
				const h = img.naturalHeight;
				if (h) totalOriginalHeight += h;
			});

			figures.forEach((figure, index) => {
				const img = figure.querySelector('img');
				const imgOriginalHeight = img?.naturalHeight || 0;
				const effectiveStackHeight = totalOriginalHeight > 0
					? (targetHeight - (gap * (figures.length - 1)))
					: targetHeight;

				const figureHeight = totalOriginalHeight > 0
					? (effectiveStackHeight * imgOriginalHeight) / totalOriginalHeight
					: effectiveStackHeight / figures.length;

				figure.style.width = '100%';
				figure.style.height = `${figureHeight}px`;
				figure.style.marginRight = `0`;
				figure.style.marginBottom = index < figures.length - 1 ? `${gap}px` : `0`;
			});
		}
	});

	// Remove right margin from last child
	if (children.length > 0) {
		const lastChild = children[children.length - 1];
		if (lastChild.classList.contains('pb-image-block-wrapper')) {
			const figure = lastChild.querySelector('.pb-image-block');
			if (figure) {
				figure.style.marginRight = '0';
			}
		} else {
			lastChild.style.marginRight = '0';
		}
	}
}

// Initialize layout on DOMContentLoaded and resize
document.addEventListener('DOMContentLoaded', () => {
	const rows = document.querySelectorAll('.pb-image-row');
	rows.forEach((row) => {
		waitForImages(row, () => {
			// Wait again specifically for all images in stacks inside the row
			const stacks = row.querySelectorAll('.pb-image-stack');
			if (stacks.length === 0) {
				recalculateLayout(row);
			} else {
				let stacksLoaded = 0;
				stacks.forEach((stack) => {
					waitForImages(stack, () => {
						stacksLoaded++;
						if (stacksLoaded === stacks.length) {
							recalculateLayout(row);
						}
					});
				});
			}
		});
		window.addEventListener('resize', () => recalculateLayout(row));
	});
	
	// Sequential fade-in for Modular gallery images
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