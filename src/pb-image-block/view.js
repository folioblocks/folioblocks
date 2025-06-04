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

        const inner = document.createElement('div');
        inner.className = 'lightbox-inner';

        wrapper.appendChild(inner);
        document.body.appendChild(wrapper);

        function renderLightbox(index) {
            const imageData = allImages[index];
            if (!imageData) return;

            const src = imageData.getAttribute('data-src');
            const caption = imageData.getAttribute('data-caption');

            inner.innerHTML = '';

            const close = document.createElement('button');
            close.className = 'lightbox-close';
            close.innerHTML = '&times;';
            close.addEventListener('click', () => {
                wrapper.remove();
                document.removeEventListener('keydown', keyHandler);
            });

            const imageWrapper = document.createElement('div');
            imageWrapper.className = 'lightbox-image';

            const img = document.createElement('img');
            img.src = src;
            img.alt = '';

            imageWrapper.appendChild(img);

            if (caption) {
                const captionEl = document.createElement('p');
                captionEl.className = 'lightbox-caption';
                captionEl.textContent = caption;
                imageWrapper.appendChild(captionEl);
            }

            const prev = document.createElement('button');
            prev.className = 'lightbox-prev';
            prev.innerHTML = '&#10094;';
            prev.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + allImages.length) % allImages.length;
                renderLightbox(currentIndex);
            });

            const next = document.createElement('button');
            next.className = 'lightbox-next';
            next.innerHTML = '&#10095;';
            next.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % allImages.length;
                renderLightbox(currentIndex);
            });

            // Add download button if enabled
            const parentBlock = imageData.closest('[class*="wp-block-portfolio-blocks-"][class*="-gallery-block"]');
            if (parentBlock && parentBlock.getAttribute('data-enable-download') === 'true') {
                const downloadButton = document.createElement('button');
                downloadButton.className = 'pb-lightbox-download';
                downloadButton.setAttribute('aria-label', 'Download Image');

                // Extract the original file name
                const fileUrl = src;
                const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
                downloadButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const link = document.createElement('a');
                    link.href = fileUrl;
                    link.download = fileName || 'download';
                    link.click();
                });

                // Add the download icon
                downloadButton.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M18 11.3l-1-1.1-4 4V3h-1.5v11.3L7 10.2l-1 1.1 6.2 5.8 5.8-5.8zm.5 3.7v3.5h-13V15H4v5h16v-5h-1.5z"></path></svg>
                `;

                // Append the button
                inner.appendChild(downloadButton);
            }
            inner.appendChild(close);
            inner.appendChild(imageWrapper);
            if (allImages.length > 1) {
                const prev = document.createElement('button');
                prev.className = 'lightbox-prev';
                prev.innerHTML = '&#10094;';
                prev.addEventListener('click', () => {
                    currentIndex = (currentIndex - 1 + allImages.length) % allImages.length;
                    renderLightbox(currentIndex);
                });

                const next = document.createElement('button');
                next.className = 'lightbox-next';
                next.innerHTML = '&#10095;';
                next.addEventListener('click', () => {
                    currentIndex = (currentIndex + 1) % allImages.length;
                    renderLightbox(currentIndex);
                });

                // Append outside of .lightbox-inner so they’re overlaying the entire wrapper
                wrapper.appendChild(prev);
                wrapper.appendChild(next);
            }
        }

        function keyHandler(e) {
            if (e.key === 'Escape') {
                wrapper.remove();
                document.removeEventListener('keydown', keyHandler);
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