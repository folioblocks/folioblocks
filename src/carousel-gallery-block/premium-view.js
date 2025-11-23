/**
 * Carousel Gallery Block
 * Premium View JS
 **/


document.addEventListener('DOMContentLoaded', () => {
  const blocks = document.querySelectorAll('.wp-block-folioblocks-carousel-gallery-block');

  blocks.forEach((block) => {
    // Guard: don’t double-init this block if something re-runs DOMContentLoaded
    if (block.dataset.pbPremiumInited === 'true') return;
    block.dataset.pbPremiumInited = 'true';

    const gallery = block.querySelector('.pb-carousel-gallery');
    if (!gallery) return;

    // ---- Premium: Disable right-click (if enabled) ----
    if (block.dataset.disableRightClick === 'true') {
      gallery.addEventListener('contextmenu', (e) => e.preventDefault(), { passive: false });
    }

    // ---- Premium: Autoplay wiring ----
    const autoplayEnabled = block.dataset.autoplay === 'true';
    if (!autoplayEnabled) return; // Nothing else to do if autoplay is off

    const autoplaySpeed = Number(block.dataset.autoplaySpeed) || 3;
    const showControls = block.dataset.showControls === 'true';

    // Slides + index helpers (independent of base view.js scope)
    let slides = gallery.querySelectorAll('.pb-carousel-gallery > *');
    let currentSlide = 0;
    let intervalId = null;

    // Compute nearest centered slide (sync after user scroll or autoplay)
    const syncCurrentIndex = () => {
      slides = gallery.querySelectorAll('.pb-carousel-gallery > *');
      if (!slides.length) return;
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
    };

    // Center on a given index
    const scrollToSlide = (index, opts = { smooth: true }) => {
      slides = gallery.querySelectorAll('.pb-carousel-gallery > *');
      const target = slides && slides[index];
      if (!target) return;

      // Center target within the gallery viewport
      const desiredCenterLeft =
        target.offsetLeft - (gallery.clientWidth - target.clientWidth) / 2;
      const left = Math.max(0, Math.floor(Number.isFinite(desiredCenterLeft) ? desiredCenterLeft : 0));
      gallery.scrollTo({ left, behavior: opts.smooth ? 'smooth' : 'auto' });
      currentSlide = index;
    };

    // Icons and play/pause button (present only if controls are rendered)
    const playButton = block.querySelector('.pb-carousel-play-button');
    const playIcon = playButton?.querySelector('.play-icon');
    const pauseIcon = playButton?.querySelector('.pause-icon');

    const updateIcons = (isPlaying) => {
      if (!playIcon || !pauseIcon) return; // silently ignore if no controls
      playIcon.style.display = isPlaying ? 'none' : 'inline';
      pauseIcon.style.display = isPlaying ? 'inline' : 'none';
    };

    const startAutoplay = () => {
      if (intervalId) return;
      updateIcons(true);
      intervalId = setInterval(() => {
        // Advance to next or stop at end
        slides = gallery.querySelectorAll('.pb-carousel-gallery > *');
        if (!slides.length) return;

        if (currentSlide < slides.length - 1) {
          scrollToSlide(currentSlide + 1);
          // ensure index stays accurate after smooth scroll completes
          setTimeout(() => {
            syncCurrentIndex();
          }, 150);
        } else {
          clearInterval(intervalId);
          intervalId = null;
          updateIcons(false);
        }
      }, autoplaySpeed * 1000);
    };

    const stopAutoplay = () => {
      if (!intervalId) return;
      clearInterval(intervalId);
      intervalId = null;
      updateIcons(false);
    };

    // If controls are shown, require play button to start autoplay
    if (showControls) {
      if (playButton && !playButton.dataset.pbPremiumBound) {
        playButton.dataset.pbPremiumBound = 'true';
        playButton.addEventListener('click', () => {
          if (intervalId) stopAutoplay();
          else startAutoplay();
        });
      }
    } else {
      // No controls: start automatically once the base script marks the gallery ready
      // (base view.js adds .pb-carousel-ready after initial positioning)
      const maybeStart = () => {
        if (gallery.classList.contains('pb-carousel-ready')) {
          // sync index once before starting
          syncCurrentIndex();
          startAutoplay();
          observer.disconnect();
        }
      };
      const observer = new MutationObserver(maybeStart);
      observer.observe(gallery, { attributes: true, attributeFilter: ['class'] });
      // Fallback: if already ready by the time we run
      maybeStart();
    }

    // Keep index in sync with user swipe
    let t;
    gallery.addEventListener('scroll', () => {
      clearTimeout(t);
      t = setTimeout(syncCurrentIndex, 100);
    });

    // Defensive: refresh slides on resize (DOM widths change)
    window.addEventListener('resize', () => {
      slides = gallery.querySelectorAll('.pb-carousel-gallery > *');
      syncCurrentIndex();
    });
  });
});