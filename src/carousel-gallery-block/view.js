// Carousel Gallery Block - View JS
document.addEventListener('DOMContentLoaded', () => {

    const blocks = document.querySelectorAll('.wp-block-pb-gallery-carousel-gallery-block');
    blocks.forEach((block) => {
        const gallery = block.querySelector('.pb-carousel-gallery');
        if (!gallery) return;

        // Normalize starting position and disable browser scroll anchoring (Safari/Chromium quirks)
        gallery.scrollLeft = 0;
        gallery.style.setProperty('overflow-anchor', 'none');

        const showControls = block.dataset.showControls === 'true';

        let slides;

        const waitForFirstImage = () => {
            return new Promise((resolve) => {
                const firstImage = gallery.querySelector('img');
                if (!firstImage || firstImage.complete) {
                    resolve();
                } else {
                    firstImage.onload = resolve;
                    firstImage.onerror = resolve;
                }
            });
        };

        const verticalOnMobile = block.dataset.verticalOnMobile === 'true';

        const applyHeight = () => {
            const width = gallery.offsetWidth;
            const isMobile = width <= 768;
            const [w, h] = (isMobile && verticalOnMobile) ? [2, 3] : [3, 2];
            const ratio = h / w;

            const idealHeight = Math.round(width * 0.85 * ratio);
            const maxHeight = window.innerHeight * 0.85; // leave some breathing room

            const finalHeight = Math.min(idealHeight, maxHeight);
            gallery.style.setProperty('--pb-carousel-height', `${finalHeight}px`);
        };

        let isGalleryVisible = false;
        let hasScrolled = false;

        function forceToFirstNow() {
            // Hard reset to the beginning of the track
            gallery.scrollLeft = 0;
            // Also assert via scrollTo in case of RTL/zoom quirks
            gallery.scrollTo({ left: 0, behavior: 'auto' });
        }

        function initializeCarousel(prev = {}) {
            const { prevOverflowX = '', prevScrollBehavior = '', prevOverflowAnchor = '' } = prev;
            if (!isGalleryVisible || hasScrolled) return;

            waitForFirstImage().then(() => {
                requestAnimationFrame(() => {
                    applyHeight();
                    slides = block.querySelectorAll('.pb-carousel-gallery > *');

                    // NEW: Wait another frame to let styles settle
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            // Multi-step assertion to defeat Safari's late layout shifts
                            // Step A: immediate hard reset
                            forceToFirstNow();
                            // Step B: assert again next frame (layout settled)
                            requestAnimationFrame(() => {
                                forceToFirstNow();
                                // Step C: final assert and then reveal
                                setTimeout(() => {
                                    scrollToSlide(0, { smooth: false });
                                    gallery.classList.add('pb-carousel-ready');
                                    // Restore styles and enable input
                                    gallery.style.overflowX = prevOverflowX || '';
                                    gallery.style.scrollBehavior = prevScrollBehavior || '';
                                    gallery.style.setProperty('overflow-anchor', prevOverflowAnchor || '');
                                    gallery.setAttribute('tabindex', '0');
                                    gallery.style.outline = 'none';
                                    gallery.style.boxShadow = 'none';
                                    gallery.addEventListener('keydown', (event) => {
                                        if (event.key === 'ArrowRight' && currentSlide < slides.length - 1) {
                                            scrollToSlide(currentSlide + 1);
                                        } else if (event.key === 'ArrowLeft' && currentSlide > 0) {
                                            scrollToSlide(currentSlide - 1);
                                        }
                                    });
                                    hasScrolled = true;
                                }, 120); // small delay to outwait Safari's last style pass
                            });
                        });
                    });
                });
            });
        }

        const resizeObserver = new ResizeObserver(applyHeight);
        resizeObserver.observe(gallery.parentElement);

        const chevrons = block.querySelectorAll('.pb-carousel-chevron');
        let currentSlide = 0;

        function scrollToSlide(index, opts = { smooth: true }) {
            const target = slides && slides[index];
            if (!target) return;
            // For the very first slide, force hard-left without centering to avoid Safari miscalc
            if (index === 0) {
                gallery.scrollTo({ left: 0, behavior: opts.smooth ? 'smooth' : 'auto' });
                currentSlide = 0;
                return;
            }
            // Otherwise, compute left so that the target is horizontally centered
            const desiredCenterLeft = target.offsetLeft - (gallery.clientWidth - target.clientWidth) / 2;
            const left = Math.max(0, Math.floor(Number.isFinite(desiredCenterLeft) ? desiredCenterLeft : 0));
            gallery.scrollTo({ left, behavior: opts.smooth ? 'smooth' : 'auto' });
            currentSlide = index;
        }

        chevrons.forEach((button) => {
            button.addEventListener('click', () => {
                if (button.classList.contains('prev') && currentSlide > 0) {
                    scrollToSlide(currentSlide - 1);
                } else if (button.classList.contains('next') && currentSlide < slides.length - 1) {
                    scrollToSlide(currentSlide + 1);
                }
            });
        });

        // --- Keep currentSlide in sync with manual swiping ---
        let scrollSyncTimeout;
        gallery.addEventListener('scroll', () => {
            clearTimeout(scrollSyncTimeout);
            scrollSyncTimeout = setTimeout(() => {
                if (!slides || slides.length === 0) return;

                const scrollCenter = gallery.scrollLeft + gallery.clientWidth / 2;
                let nearestIndex = 0;
                let nearestDistance = Infinity;

                slides.forEach((slide, index) => {
                    const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
                    const distance = Math.abs(scrollCenter - slideCenter);
                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestIndex = index;
                    }
                });

                currentSlide = nearestIndex;
            }, 100); // debounce scroll detection
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    isGalleryVisible = true;
                    // Freeze horizontal scrolling until we finish first-paint positioning
                    const prevOverflowX = gallery.style.overflowX;
                    const prevScrollBehavior = gallery.style.scrollBehavior;
                    const prevOverflowAnchor = gallery.style.getPropertyValue('overflow-anchor');
                    // Freeze any auto scrolling/anchoring during first paint
                    gallery.style.overflowX = 'hidden';
                    gallery.style.scrollBehavior = 'auto';
                    gallery.style.setProperty('overflow-anchor', 'none');
                    forceToFirstNow();
                    initializeCarousel({ prevOverflowX, prevScrollBehavior, prevOverflowAnchor });
                    observer.disconnect();
                }
            });
        });
        observer.observe(block);

        // On full load (including reload), hard-reset to first; Safari sometimes preserves inner scroll
        window.addEventListener('load', () => {
            forceToFirstNow();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && !hasScrolled) {
                forceToFirstNow();
            }
        });

        window.addEventListener('pageshow', (evt) => {
            if (evt.persisted) {
                // If page was restored from bfcache, force position again
                forceToFirstNow();
            }
        });
    });
});