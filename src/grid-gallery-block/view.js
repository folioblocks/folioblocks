/**
 * Grid Gallery Block
 * View JS
 **/

document.addEventListener('DOMContentLoaded', function () {
	// Find all Grid Gallery block roots on the page
	const roots = document.querySelectorAll(
		'.wp-block-folioblocks-grid-gallery-block'
	);

	if (!roots.length) {
		return;
	}

	roots.forEach((root) => {
		// The actual grid container inside the block
		const grid = root.querySelector('.pb-grid-gallery') || root;

		// Add loading state to the block wrapper
		root.classList.add('is-loading');

		// Each gallery item wrapper is the block wrapper div
		const itemWrappers = grid.querySelectorAll(
			'.wp-block-folioblocks-pb-image-block'
		);

		if (!itemWrappers.length) {
			root.classList.remove('is-loading');
			return;
		}

		/**
		 * Determine the number of columns currently in use.
		 * We primarily rely on the resolved CSS grid-template-columns value,
		 * which already respects the current breakpoint.
		 */
		const getColumns = () => {
			// Primary: derive tracks from grid-template-columns.
			// Some browsers return expanded tracks ("1fr 1fr ..."), while others may keep repeat().
			const template = window.getComputedStyle(grid).gridTemplateColumns;
			if (template && template !== 'none') {
				// Handle repeat(N, ...) form
				const repeatMatch = template.match(/repeat\((\d+)\s*,/i);
				if (repeatMatch && repeatMatch[1]) {
					const n = parseInt(repeatMatch[1], 10);
					if (!isNaN(n) && n > 0) return n;
				}

				// Otherwise count expanded tracks
				const parts = template
					.split(' ')
					.filter((p) => p && p.trim() !== '');
				const count = parts.length;
				if (count > 0) return count;
			}

			// Fallback: try custom vars, then data attribute
			const style = window.getComputedStyle(grid);
			const desktopVar = parseInt(
				style.getPropertyValue('--grid-cols-desktop'),
				10
			);
			const tabletVar = parseInt(
				style.getPropertyValue('--grid-cols-tablet'),
				10
			);
			const mobileVar = parseInt(
				style.getPropertyValue('--grid-cols-mobile'),
				10
			);
			const candidates = [desktopVar, tabletVar, mobileVar].filter(
				(v) => !isNaN(v) && v > 0
			);
			if (candidates.length) {
				// Use the first valid one as a reasonable fallback
				return candidates[0];
			}

			const attrColumns = parseInt(
				grid.getAttribute('data-columns'),
				10
			);
			if (!isNaN(attrColumns) && attrColumns > 0) {
				return attrColumns;
			}

			return 3; // safe default
		};

		/**
		 * Apply layout to each figure using the same logic as the editor:
		 * - Determine grid cell size from gallery width and current column count.
		 * - Use the image's natural dimensions to compute a uniform scale so that
		 *   it fits inside 80% of the cell size on both sides.
		 * - Always set explicit width/height on the figure (no `auto`).
		 */
		const applyLayout = () => {
			const rect = grid.getBoundingClientRect();
			const galleryWidth = rect.width || 0;
			if (!galleryWidth) return;

			const columns = getColumns();
			if (!columns) return;

			// Cell size = usable width per column (account for padding + column gaps).
			const style = window.getComputedStyle(grid);
			const paddingLeft = parseFloat(style.paddingLeft) || 0;
			const paddingRight = parseFloat(style.paddingRight) || 0;
			const columnGap = parseFloat(style.columnGap) || 0;

			const usableWidth =
				galleryWidth - paddingLeft - paddingRight - columnGap * (columns - 1);
			if (!isFinite(usableWidth) || usableWidth <= 0) return;

			const cellSize = usableWidth / columns;
			const figureMaxSize = cellSize * 0.8;

			// Expose the cell size as a CSS variable (optional but mirrors editor)
			grid.style.setProperty('--pb-grid-cell-size', `${cellSize}px`);

			// Target each image block inside the grid
			const blocks = grid.querySelectorAll(
				'.wp-block-folioblocks-pb-image-block'
			);

			blocks.forEach((block) => {
				// Skip items that are hidden by filtering (Pro feature)
				if (block.classList.contains('is-hidden')) return;

				const figure = block.querySelector('figure.pb-image-block');
				const img = figure ? figure.querySelector('img') : null;
				if (!figure || !img) return;

				// Reset existing sizing
				figure.style.width = '';
				figure.style.height = '';
				img.style.width = '';
				img.style.height = '';

				const naturalWidth = img.naturalWidth;
				const naturalHeight = img.naturalHeight;

				// If we don't yet know the image's intrinsic size, bail for this one.
				if (!naturalWidth || !naturalHeight) return;

				// Compute a uniform scale so the image fits within figureMaxSize
				// on both sides while preserving aspect ratio.
				const maxSize = figureMaxSize;
				const scaleX = maxSize / naturalWidth;
				const scaleY = maxSize / naturalHeight;
				const scale = Math.min(scaleX, scaleY);

				// Fallback guard in case of invalid dimensions
				if (!isFinite(scale) || scale <= 0) return;

				const targetWidth = naturalWidth * scale;
				const targetHeight = naturalHeight * scale;

				// Always set explicit width and height on the figure
				figure.style.width = `${targetWidth}px`;
				figure.style.height = `${targetHeight}px`;

				// Ensure the image fills the figure box explicitly
				img.style.width = '100%';
				img.style.height = '100%';
			});
		};

		/**
		 * Wait for images to load and progressively apply layout +
		 * a staggered fade-in per item, instead of waiting for all.
		 */
		const applyLayoutWhenImagesLoaded = () => {
			const allImages = grid.querySelectorAll(
				'.wp-block-folioblocks-pb-image-block img'
			);
			if (!allImages.length) {
				root.classList.remove('is-loading');
				return;
			}

			let loadedCount = 0;
			const total = allImages.length;

			const handleOneImage = (img) => {
				const wrapper = img.closest('.wp-block-folioblocks-pb-image-block');

				// Compute this wrapper’s index for stagger timing
				let index = 0;
				if (wrapper) {
					index = Array.prototype.indexOf.call(itemWrappers, wrapper);
					if (index < 0) index = 0;
				}

				loadedCount++;

				window.requestAnimationFrame(() => {
					// Re-run layout so newly-loaded image gets correct sizing
					applyLayout();

					// Staggered fade-in via CSS class only
					if (wrapper) {
						// Ensure we start from the hidden state defined in CSS
						wrapper.classList.remove('is-visible');

						setTimeout(() => {
							wrapper.classList.add('is-visible');
						}, index * 120); // tweak for faster/slower stagger
					}

					// Once all images have had their turn, drop loading state
					if (loadedCount === total) {
						root.classList.remove('is-loading');
					}
				});
			};

			allImages.forEach((img) => {
				if (img.complete && img.naturalWidth && img.naturalHeight) {
					// Already cached → handle immediately
					handleOneImage(img);
				} else {
					const once = () => {
						img.removeEventListener('load', once);
						img.removeEventListener('error', once);
						handleOneImage(img);
					};
					img.addEventListener('load', once);
					img.addEventListener('error', once);
				}
			});
		};

		// Initial layout after images load
		applyLayoutWhenImagesLoaded();

		// Re-layout on resize of the grid container and window
		const onResize = () => {
			setTimeout(() => {
				window.requestAnimationFrame(applyLayout);
			}, 50);
		};

		window.addEventListener('resize', onResize);

		const resizeObserver = new ResizeObserver(onResize);
		resizeObserver.observe(grid);
	});
});