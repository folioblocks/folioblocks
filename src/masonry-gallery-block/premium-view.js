/**
 * Masonry Gallery Block
 * Premium View JS
 **/
document.addEventListener('DOMContentLoaded', () => {

    
    // Disable right-click on entire page if any gallery block has it enabled
    const disableRightClick = document.querySelector('[data-disable-right-click="true"]');
    if (disableRightClick) {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    // Helper to trigger a relayout from premium script
    const requestRelayout = (galleryEl) => {
        if (typeof window.pbApplyMasonryLayout === 'function') {
            // Preferred: free script exposes relayout helper
            window.pbApplyMasonryLayout(galleryEl);
        } else if (typeof window.applyCustomMasonryLayout === 'function') {
            // Back-compat, if function was exposed under this name
            window.applyCustomMasonryLayout(galleryEl);
        } else {
            // Fallback: kick resize listeners
            window.dispatchEvent(new Event('resize'));
        }
    };

    // Wire filter bars per gallery instance
    document.querySelectorAll('.pb-masonry-gallery').forEach((gallery) => {
        // The filter bar is rendered by render.php as a sibling within the same wrapper
        const wrapper = gallery.closest('.wp-block-folioblocks-masonry-gallery-block, [data-active-filter]') || gallery.parentElement;
        const filterBar = wrapper ? wrapper.querySelector('.pb-image-gallery-filters') : null;
        if (!filterBar) return;

        filterBar.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-button');
            if (!btn) return;

            const selected = btn.textContent.trim();

            // Update active state only within this filter bar
            filterBar.querySelectorAll('.filter-button').forEach((b) => {
                b.classList.toggle('is-active', b === btn);
            });

            // Show/hide items only within this gallery
            const items = gallery.querySelectorAll('.wp-block-folioblocks-pb-image-block');
            items.forEach((item) => {
                const category = item.getAttribute('data-filter');
                if (selected === 'All' || (category && category.toLowerCase() === selected.toLowerCase())) {
                    item.classList.remove('is-hidden');
                } else {
                    item.classList.add('is-hidden');
                }
            });

            // Ask free script to recompute layout
            requestRelayout(gallery);
        });
    });
});