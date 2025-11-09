/**
 * PB Image Block
 * Premium View JS
 **/
document.addEventListener('DOMContentLoaded', () => {

    // Add randomizer to galleries
    const galleries = document.querySelectorAll(".pb-randomized");
    galleries.forEach((wrapper) => {
        const gallery = wrapper.querySelector(':scope > div:has(.pb-image-block-wrapper)');
        if (!gallery) return;

        const items = Array.from(gallery.querySelectorAll('.pb-image-block-wrapper'));

        // Shuffle using Fisher-Yates
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            gallery.appendChild(items[j]);
        }

        setTimeout(() => {
            document.dispatchEvent(new Event("pbGalleryUpdated"));
        }, 100);
    });

    // Image Download Button Logic
    const downloadButtons = document.querySelectorAll('.pb-image-block-download');
    downloadButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();

            const fileUrl = button.getAttribute('data-full-src');
            const fileName = fileUrl.split('/').pop();

            // Create and click the download link
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileName;
            link.click();
        });
    });

    // Add to Cart Button Logic
    document.addEventListener('click', (e) => {
        const cartBtn = e.target.closest('.pb-add-to-cart-icon');
        if (!cartBtn) return;

        e.preventDefault();

        const productId = cartBtn.dataset.addToCart;
        if (!productId) return;

        // Send request to WooCommerce add-to-cart endpoint
        fetch(`?add-to-cart=${productId}`, { method: 'GET' })
            .then(() => {
                // Reload page without query string
                const url = new URL(window.location.href);
                url.searchParams.delete('add-to-cart');
                window.location.href = url.pathname + url.hash;
            });
    });
});