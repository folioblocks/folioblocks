document.addEventListener('DOMContentLoaded', () => {

    // Track input method for focus visibility control
    let userUsedKeyboard = false;

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ') {
            userUsedKeyboard = true;
        }
    });

    window.addEventListener('mousedown', () => {
        userUsedKeyboard = false;
    });

    window.addEventListener('touchstart', () => {
        userUsedKeyboard = false;
    });

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

    // Add lightbox functionality to image blocks
    document.body.addEventListener('click', (event) => {
        const trigger = event.target.closest('.pb-image-block-lightbox');
        if (!trigger) return;

        event.preventDefault();
        event.stopPropagation();

        const allImages = Array.from(document.querySelectorAll('.pb-image-block-lightbox'));
        let currentIndex = allImages.indexOf(trigger);

        const existing = document.querySelector('.pb-image-lightbox');
        if (existing) existing.remove();

        const wrapper = document.createElement('div');
        wrapper.className = 'pb-image-lightbox';

        const previouslyFocused = document.activeElement;

        const inner = document.createElement('div');
        inner.className = 'lightbox-inner';

        wrapper.appendChild(inner);
        document.body.appendChild(wrapper);

        const focusStart = document.createElement('span');
        focusStart.tabIndex = 0;
        focusStart.className = 'pb-focus-sentinel-start';

        const focusEnd = document.createElement('span');
        focusEnd.tabIndex = 0;
        focusEnd.className = 'pb-focus-sentinel-end';

        document.body.insertBefore(focusStart, wrapper);
        document.body.insertBefore(focusEnd, wrapper.nextSibling);

        focusStart.addEventListener('focus', () => {
            const focusable = wrapper.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable.length) focusable[focusable.length - 1].focus();
        });
        focusEnd.addEventListener('focus', () => {
            const focusable = wrapper.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable.length) focusable[0].focus();
        });

        // Close lightbox when clicking outside the image and controls (on the backdrop)
        wrapper.addEventListener('click', (e) => {
            if (e.target === wrapper) {
                wrapper.remove();
                focusStart.remove();
                focusEnd.remove();
                document.removeEventListener('keydown', keyHandler);
                if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
                    previouslyFocused.focus();
                }
            }
        });

        function renderLightbox(index) {
            const imageData = allImages[index];
            if (!imageData) return;

            const src = imageData.getAttribute('data-src');
            const caption = imageData.getAttribute('data-caption');

            inner.innerHTML = '';

            const close = document.createElement('button');
            close.className = 'lightbox-close';
            close.innerHTML = '&times;';
            close.setAttribute('aria-label', 'Close lightbox');
            close.addEventListener('click', () => {
                wrapper.remove();
                focusStart.remove();
                focusEnd.remove();
                document.removeEventListener('keydown', keyHandler);
                if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
                    previouslyFocused.focus();
                }
            });

            const imageWrapper = document.createElement('div');
            imageWrapper.className = 'lightbox-image';

            const img = document.createElement('img');
            img.src = src;
            img.alt = '';

            imageWrapper.appendChild(img);

            if (caption) {
                const captionEl = document.createElement('div');
                captionEl.className = 'lightbox-caption';
                captionEl.innerHTML = caption;
                imageWrapper.appendChild(captionEl);
            }

            inner.appendChild(close);
            inner.appendChild(imageWrapper);
            if (allImages.length > 1) {
                const prev = document.createElement('button');
                prev.className = 'lightbox-prev';
                prev.innerHTML = '&#10094;';
                prev.setAttribute('aria-label', 'Previous image');
                prev.addEventListener('click', () => {
                    currentIndex = (currentIndex - 1 + allImages.length) % allImages.length;
                    renderLightbox(currentIndex);
                });

                const next = document.createElement('button');
                next.className = 'lightbox-next';
                next.innerHTML = '&#10095;';
                next.setAttribute('aria-label', 'Next image');
                next.addEventListener('click', () => {
                    currentIndex = (currentIndex + 1) % allImages.length;
                    renderLightbox(currentIndex);
                });

                // Append outside of .lightbox-inner so they’re overlaying the entire wrapper
                wrapper.appendChild(prev);
                wrapper.appendChild(next);
            }
            const closeBtn = wrapper.querySelector('.lightbox-close');
            if (closeBtn && userUsedKeyboard) {
                closeBtn.focus();
            }
        }

        function keyHandler(e) {
            if (e.key === 'Escape') {
                wrapper.remove();
                focusStart.remove();
                focusEnd.remove();
                document.removeEventListener('keydown', keyHandler);
                if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
                    previouslyFocused.focus();
                }
            } else if (e.key === 'ArrowRight') {
                currentIndex = (currentIndex + 1) % allImages.length;
                renderLightbox(currentIndex);
            } else if (e.key === 'ArrowLeft') {
                currentIndex = (currentIndex - 1 + allImages.length) % allImages.length;
                renderLightbox(currentIndex);
            }
        }

        document.addEventListener('keydown', keyHandler);
        renderLightbox(currentIndex);

        // Handle Tab and Shift+Tab navigation inside the lightbox (explicit control)
        wrapper.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            const focusable = Array.from(
                wrapper.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
            ).filter(el => !el.disabled && el.offsetParent !== null);

            if (!focusable.length) return;

            const currentIndex = focusable.indexOf(document.activeElement);
            let nextIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;

            // Loop focus when reaching start or end
            if (nextIndex >= focusable.length) nextIndex = 0;
            if (nextIndex < 0) nextIndex = focusable.length - 1;

            e.preventDefault();
            focusable[nextIndex].focus();
        });
    });

    // Image Download Button
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

});