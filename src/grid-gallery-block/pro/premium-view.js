/**
 * Grid Gallery Block
 * Premium View JS
 **/
document.addEventListener("DOMContentLoaded", function () {
    const galleries = document.querySelectorAll('.wp-block-folioblocks-grid-gallery-block');

    // Disable right-click on entire page if any gallery block has it enabled
    const disableRightClick = document.querySelector('[data-disable-right-click="true"]');
    if (disableRightClick) {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    // Gallery filtering logic 
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

});