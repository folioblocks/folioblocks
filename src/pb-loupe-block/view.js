/**
 * PB Loupe Block
 * View JS
 **/

document.addEventListener('DOMContentLoaded', () => {
    const loupeBlocks = document.querySelectorAll('.wp-block-folioblocks-pb-loupe-block');

    loupeBlocks.forEach(block => {
        const container = block.querySelector('.pb-loupe-container');
        const image     = block.querySelector('.pb-loupe-image');
        const lens      = block.querySelector('.pb-loupe-lens');

        if (!container || !image || !lens) return;

        const resolution = block.getAttribute('data-resolution') || 'large';
        const shape      = block.getAttribute('data-shape') || 'circle';
        const theme      = block.getAttribute('data-theme') || 'light';

        // Apply shape + theme classes
        lens.classList.add(`pb-loupe-${shape}`);
        lens.classList.add(`pb-loupe-${theme}`);

        let isVisible = false;
        let loupeSize = 150;
        let isTouching = false;

        const updateLens = (x, y) => {
            lens.style.width = `${loupeSize}px`;
            lens.style.height = `${loupeSize}px`;
            const crect = container.getBoundingClientRect();
            lens.style.left = `${x - crect.left - loupeSize / 2}px`;

            if (isTouching) {
                // Position loupe ABOVE the finger on touch
                lens.style.top = `${y - crect.top - loupeSize + 20}px`; 
            } else {
                // Normal centered behaviour for mouse
                lens.style.top = `${y - crect.top - loupeSize / 2}px`;
            }

            const rect = container.getBoundingClientRect();
            const relX = ((x - rect.left) / rect.width) * 100;
            const relY = ((y - rect.top)  / rect.height) * 100;

            const baseZoom = 2000;
            const scale = rect.width / 600;

            lens.style.backgroundImage    = `url(${image.src})`;
            lens.style.backgroundSize     = `${baseZoom * scale}% auto`;
            lens.style.backgroundPosition = `${relX}% ${relY}%`;
        };

        const show = () => {
            lens.style.opacity = '1';
            isVisible = true;
        };

        const hide = () => {
            lens.style.opacity = '0';
            isVisible = false;
        };

        container.addEventListener('mousemove', e => {
            isTouching = false;
            const rect = image.getBoundingClientRect();
            const x = e.clientX;
            const y = e.clientY;
            container.style.cursor = 'none';
            show();
            updateLens(x, y);
        });

        container.addEventListener('mouseleave', () => {
            hide();
            container.style.cursor = 'auto';
        });

        // Touch support: tap to toggle, drag to move
        let lastTap = 0;

        container.addEventListener('touchstart', e => {
            isTouching = true;
            e.preventDefault();
            const now = Date.now();
            const elapsed = now - lastTap;

            const touch = e.touches[0];
            const x = touch.clientX;
            const y = touch.clientY;

            if (elapsed < 300) {
                hide();
            } else {
                show();
                updateLens(x, y);
            }

            lastTap = now;
        }, { passive: false });

        container.addEventListener('touchmove', e => {
            isTouching = true;
            if (!isVisible) return;
            e.preventDefault();
            const touch = e.touches[0];
            updateLens(touch.clientX, touch.clientY);
        }, { passive: false });
    });
});
