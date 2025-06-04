document.addEventListener('DOMContentLoaded', () => {

  // Disable right-click on entire page if any gallery block has it enabled
	const disableRightClick = document.querySelector('[data-disable-right-click="true"]');
	if (disableRightClick) {
		document.addEventListener('contextmenu', (e) => {
			e.preventDefault();
		});
	}

  const gallery = document.querySelector('.wp-block-portfolio-blocks-masonry-gallery-block');

  if (!gallery) return;

  gallery.classList.add('is-loading');

  const filterBar = document.querySelector('.pb-image-gallery-filters');
  const allItems = gallery.querySelectorAll('.pb-image-block-wrapper');

  if (filterBar) {
    filterBar.addEventListener('click', (e) => {
      if (!e.target.matches('.filter-button')) return;

      const selected = e.target.textContent.trim();

      // Update active class
      document.querySelectorAll('.filter-button').forEach((btn) => {
        btn.classList.toggle('is-active', btn === e.target);
      });

      // Show/hide images
      allItems.forEach((item) => {
        const category = item.getAttribute('data-filter');
        if (selected === 'All' || (category && category.toLowerCase() === selected.toLowerCase())) {
          item.classList.remove('is-hidden');
        } else {
          item.classList.add('is-hidden');
        }
      });

      applyCustomMasonryLayout();
    });
  }

const getColumnsForWidth = (width) => {
  const innerGallery = gallery.querySelector('.pb-masonry-gallery');
  if (!innerGallery) return 4; // default fallback

  const desktopCols = parseInt(innerGallery.className.match(/cols-d-(\d+)/)?.[1] || 6, 10);
  const tabletCols  = parseInt(innerGallery.className.match(/cols-t-(\d+)/)?.[1] || 4, 10);
  const mobileCols  = parseInt(innerGallery.className.match(/cols-m-(\d+)/)?.[1] || 2, 10);

  if (width <= 600) return mobileCols;
  if (width <= 1024) return tabletCols;
  return desktopCols;
};

  const applyCustomMasonryLayout = () => {
    if (!gallery) return;

    // Get the inner container for setting height
    const innerGallery = gallery.querySelector('.pb-masonry-gallery');
    if (!innerGallery) return;

    const gap = gallery.closest('.no-gap') ? 0 : 10;
    const columns = getColumnsForWidth(innerGallery.offsetWidth);
    const columnHeights = Array(columns).fill(0);
    const columnWidth = (innerGallery.offsetWidth - gap * (columns - 1)) / columns;


    // Reset layout styles
    gallery.querySelectorAll('.pb-image-block-wrapper').forEach(item => {
      item.style.position = '';
      item.style.top = '';
      item.style.left = '';
      item.style.width = '';
    });

    // Only visible items
    const items = gallery.querySelectorAll('.pb-image-block-wrapper:not(.is-hidden)');

    items.forEach((item) => {
      const minCol = columnHeights.indexOf(Math.min(...columnHeights));

      item.style.position = 'absolute';
      item.style.width = `${columnWidth}px`;
      item.style.top = `${columnHeights[minCol]}px`;
      item.style.left = `${(columnWidth + gap) * minCol}px`;

      const style = window.getComputedStyle(item);
      const marginBottom = parseFloat(style.marginBottom) || 0;
      columnHeights[minCol] += item.offsetHeight + gap + marginBottom;
    });

    innerGallery.style.height = `${Math.max(...columnHeights)}px`;
  };

  const images = gallery.querySelectorAll('img');
  let loadedImages = 0;

  const imageLoaded = () => {
    loadedImages += 1;
    if (loadedImages === images.length) {
      applyCustomMasonryLayout();
      gallery.classList.remove('is-loading');
    }
  };

  images.forEach((img) => {
    if (img.complete && img.naturalHeight !== 0) imageLoaded();
    else img.onload = img.onerror = imageLoaded;
  });

  const fallbackTimeout = setTimeout(applyCustomMasonryLayout, 1000);

  const resizeObserver = new ResizeObserver(() => {
    applyCustomMasonryLayout();
  });

  resizeObserver.observe(gallery);

  window.addEventListener('resize', applyCustomMasonryLayout);

  window.addEventListener('pagehide', () => {
    clearTimeout(fallbackTimeout);
    window.removeEventListener('resize', applyCustomMasonryLayout);
    resizeObserver.disconnect();
});
});