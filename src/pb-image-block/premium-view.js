/**
 * PB Image Block
 * Premium View JS
 **/
document.addEventListener('DOMContentLoaded', () => {

    // Add Disable -Right-Click
    document.addEventListener('contextmenu', (e) => {
        const el = e.target.closest('[data-disable-right-click]');
        if (el) e.preventDefault();
    }, { capture: true });

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

    // WooCommerce Icon Logic (Add to Cart / View Product)
    document.addEventListener('click', (e) => {
        const cartBtn = e.target.closest('.pb-add-to-cart-icon');
        if (!cartBtn) return;

        // Prevent any parent handlers (lightbox, figure click, etc.)
        e.preventDefault();
        e.stopPropagation();

        const action = cartBtn.dataset.wooAction || 'add_to_cart';
        const productId = cartBtn.dataset.productId;
        const productUrl = cartBtn.dataset.productUrl;

        // If the user chose "Open Product Page", navigate to the product URL.
        if (action === 'product') {
            if (productUrl) {
                window.location.href = productUrl;
            }
            return;
        }

        // Default: Add to cart.
        if (!productId) return;

        // Try AJAX add-to-cart first for a smoother UX (no page reload).
        // If anything fails (endpoint missing, network error, non-simple product, etc.), fall back to redirect.

        const fallbackRedirect = () => {
            try {
                const url = new URL(window.location.href);
                url.searchParams.set('add-to-cart', String(productId));
                window.location.href = url.toString();
            } catch (err) {
                const sep = window.location.href.includes('?') ? '&' : '?';
                window.location.href = `${window.location.href}${sep}add-to-cart=${encodeURIComponent(
                    String(productId),
                )}`;
            }
        };

        const getAjaxUrl = () => {
            // WooCommerce usually localizes this on pages where add-to-cart scripts run.
            if (window.wc_add_to_cart_params?.wc_ajax_url) {
                return window.wc_add_to_cart_params.wc_ajax_url
                    .toString()
                    .replace('%%endpoint%%', 'add_to_cart');
            }

            // Fallback: wc-ajax endpoint at site root.
            // This works on most Woo setups when pretty permalinks are enabled.
            return `${window.location.origin}/?wc-ajax=add_to_cart`;
        };

        const ajaxUrl = getAjaxUrl();

        const body = new URLSearchParams();
        body.set('product_id', String(productId));
        body.set('quantity', '1');

        fetch(ajaxUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: body.toString(),
            credentials: 'same-origin',
        })
            .then(async (res) => {
                if (!res.ok) throw new Error(`Woo AJAX failed (${res.status})`);
                return res.json();
            })
            .then((data) => {
                // Woo returns an error + product_url for things like variable products.
                if (data?.error) {
                    if (data?.product_url) {
                        window.location.href = data.product_url;
                        return;
                    }
                    fallbackRedirect();
                    return;
                }

                // Update cart fragments if provided (mini-cart, cart count, etc.).
                if (data?.fragments && typeof data.fragments === 'object') {
                    Object.keys(data.fragments).forEach((selector) => {
                        const html = data.fragments[selector];
                        if (!html) return;
                        const el = document.querySelector(selector);
                        if (!el) return;

                        // Woo's fragments are full HTML strings for the selector.
                        // Replace the element with the returned fragment.
                        try {
                            el.outerHTML = html;
                        } catch (err) {
                            // Ignore fragment update failures.
                        }
                    });
                }

                // Fire Woo's standard event for themes/plugins that listen to it.
                if (window.jQuery) {
                    window.jQuery(document.body).trigger('added_to_cart', [
                        data?.fragments || {},
                        data?.cart_hash || '',
                        window.jQuery(cartBtn),
                    ]);
                } else {
                    document.body.dispatchEvent(
                        new CustomEvent('added_to_cart', {
                            detail: {
                                fragments: data?.fragments || {},
                                cart_hash: data?.cart_hash || '',
                            },
                        }),
                    );
                }

                // Optional: if the theme uses a cart counter, it may update via fragments.
            })
            .catch(() => {
                // If AJAX doesn't work in this environment, fall back to the reliable redirect.
                fallbackRedirect();
            });
    }, { capture: true });
});