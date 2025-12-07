// Justified Gallery Block - View JS
document.addEventListener('DOMContentLoaded', () => {

	const container = document.querySelector('.pb-justified-gallery');
	if (!container) return;

	const wrapper = container.closest('.wp-block-folioblocks-justified-gallery-block');
	if (wrapper) wrapper.classList.add('is-loading');

	const rowHeight = parseInt(container.dataset.rowHeight) || 250;
	const noGap = container.dataset.noGap === 'true';
	const gap = noGap ? 0 : 10;

	let resizeTimeout;

	const calculateLayout = (targetContainer = container) => {
		if (!(targetContainer instanceof Element)) {
			targetContainer = container;
		}
		const containerWidth = targetContainer.clientWidth - 1;
		if (!containerWidth) return;

		const wrappers = targetContainer.querySelectorAll('.wp-block-folioblocks-pb-image-block:not(.is-hidden)');
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
				const isLastInRow = index === row.length - 1;
				const marginValue = (!isLastInRow && !noGap) ? `${gap}px` : '0px';
				img.wrapper.style.setProperty('--pb-margin', marginValue);
			});
		});

		const host = targetContainer.closest('.wp-block-folioblocks-justified-gallery-block');
		if (host) host.classList.remove('is-loading');
	};

	// Expose a public reflow helper for premium-view.js (accepts either the gallery block or the inner .pb-justified-gallery)
	window.folioBlocksJustifiedLayout = function (targetNode) {
		let target = targetNode;
		if (!target || !(target instanceof Element)) target = container;
		if (target && !target.classList.contains('pb-justified-gallery')) {
			target = target.querySelector?.('.pb-justified-gallery') || container;
		}
		if (!target) return;
		requestAnimationFrame(() => calculateLayout(target));
	};

	// Also listen for an event-based reflow from premium-view.js
	container.addEventListener('pb:justified:reflow', () => {
		requestAnimationFrame(() => calculateLayout(container));
	});

	const handleResizeEnd = () => {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(() => {
			requestAnimationFrame(() => calculateLayout());
		}, 150);
	};

	window.addEventListener('load', () => {
		requestAnimationFrame(() => calculateLayout());
	});

	window.addEventListener('resize', () => {
		requestAnimationFrame(() => calculateLayout());
		handleResizeEnd();
	});

	setTimeout(() => {
		requestAnimationFrame(() => calculateLayout());
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