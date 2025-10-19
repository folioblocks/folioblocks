document.addEventListener('DOMContentLoaded', () => {

	// Disable right-click on entire page if any gallery block has it enabled
	const disableRightClick = document.querySelector('[data-disable-right-click="true"]');
	if (disableRightClick) {
		document.addEventListener('contextmenu', (e) => {
			e.preventDefault();
		});
	}

	const container = document.querySelector('.pb-justified-gallery');
	if (!container) return;

	const wrapper = container.closest('.wp-block-portfolio-blocks-justified-gallery-block');
	if (wrapper) wrapper.classList.add('is-loading');

	const rowHeight = parseInt(container.dataset.rowHeight) || 250;
	const noGap = container.dataset.noGap === 'true';
	const gap = noGap ? 0 : 10;

	let resizeTimeout;

	const calculateLayout = () => {
		const containerWidth = container.clientWidth - 1;
		if (!containerWidth) return;

		const wrappers = container.querySelectorAll('.pb-image-block-wrapper:not(.is-hidden)');
		const images = Array.from(wrappers).map((wrapper) => {
			const img = wrapper.querySelector('img');
			const width = parseInt(img.getAttribute('width')) || 1;
			const height = parseInt(img.getAttribute('height')) || 1;
			return { wrapper, width, height };
		});

		const rows = [];
		let currentRow = [];
		let currentRowWidth = 0;

		images.forEach((img) => {
			const aspectRatio = img.width / img.height;
			const scaledWidth = aspectRatio * rowHeight;
			currentRow.push({ ...img, scaledWidth, aspectRatio });
			currentRowWidth += scaledWidth + gap;

			if (currentRowWidth >= containerWidth && currentRow.length > 0) {
				rows.push(currentRow);
				currentRow = [];
				currentRowWidth = 0;
			}
		});

		if (currentRow.length > 0) rows.push(currentRow);

		rows.forEach((row) => {
			const totalScaledWidth = row.reduce((sum, img) => sum + img.scaledWidth, 0);
			const totalGaps = (row.length - 1) * gap;
			const isFinalRow = row === rows[rows.length - 1];
			const rowFillRatio = (totalScaledWidth + totalGaps) / containerWidth;
			const shouldScale = !isFinalRow || rowFillRatio > 0.9;
			const scale = shouldScale ? Math.min((containerWidth - totalGaps) / totalScaledWidth, 1) : 1;

			row.forEach((img, index) => {
				const isLast = index === row.length - 1;
				const finalWidth = Math.round(img.scaledWidth * scale) - (isLast ? 1 : 0);
				const finalHeight = Math.round(rowHeight * scale);
				img.wrapper.style.setProperty('--pb-width', `${finalWidth}px`);
				img.wrapper.style.setProperty('--pb-height', `${finalHeight}px`);
				// Set the margin for each image in the row
				row.forEach((img, index) => {
					const isLast = index === row.length - 1;
					const isFinalRowImage = isFinalRow && !noGap;
					const isSingleImageRow = row.length === 1;
					const marginValue = (isLast && !isFinalRowImage && !isSingleImageRow) ? `0px` : `${gap}px`;
					img.wrapper.style.setProperty('--pb-margin', marginValue);
				});
			});
		});

		if (wrapper) wrapper.classList.remove('is-loading');
	};

	const handleResizeEnd = () => {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(() => {
			requestAnimationFrame(calculateLayout);
		}, 150);
	};

	const setupFilterControls = () => {
		const filterBar = document.querySelector('.pb-image-gallery-filters');
		const allItems = container.querySelectorAll('.pb-image-block-wrapper');

		if (!filterBar) return;

		filterBar.addEventListener('click', (e) => {
			if (!e.target.matches('.filter-button')) return;

			const selected = e.target.textContent.trim();

			document.querySelectorAll('.filter-button').forEach((btn) => {
				btn.classList.toggle('is-active', btn === e.target);
			});

			allItems.forEach((item) => {
				const category = item.getAttribute('data-filter');
				if (selected === 'All' || (category && category.toLowerCase() === selected.toLowerCase())) {
					item.classList.remove('is-hidden');
				} else {
					item.classList.add('is-hidden');
				}
			});

			requestAnimationFrame(() => calculateLayout());
		});
	};

	window.addEventListener('load', () => {
		requestAnimationFrame(calculateLayout);
		setupFilterControls();
	});

	window.addEventListener('resize', () => {
		requestAnimationFrame(calculateLayout);
		handleResizeEnd();
	});

	setTimeout(() => {
		requestAnimationFrame(calculateLayout);
	}, 100);

	// Sequential fade-in for justified gallery images
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