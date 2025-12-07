/**
 * Justified Gallery Block
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

    // Filter Controls Setup
    const setupFilterControls = () => {
        const container = document.querySelector('.pb-justified-gallery');
        if (!container) return;

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

            requestAnimationFrame(() => {
                if (typeof window.folioBlocksJustifiedLayout === 'function') {
                    window.folioBlocksJustifiedLayout(container);
                } else {
                    // Fallback: let view.js listen for this event
                    container.dispatchEvent(new CustomEvent('pb:justified:reflow', { bubbles: true }));
                }
            });
        });
    };
    window.addEventListener('load', () => {
        if (typeof setupFilterControls === 'function') {
            setupFilterControls();
        }
    });
    
});