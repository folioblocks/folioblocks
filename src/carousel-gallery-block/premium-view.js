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
      document.addEventListener('contextmenu', (e) => e.preventDefault(), { passive: false });
    }

    // ---- Premium: Autoplay wiring ----
    const autoplayEnabled = block.dataset.autoplay === 'true';
    if (!autoplayEnabled) return; // Nothing else to do if autoplay is off

    const autoplaySpeed = Number(block.dataset.autoplaySpeed) || 3;
    // NOTE: dataset can be missing/incorrect depending on how the controls are rendered.
    // Treat "controls visible" as the source of truth.
    const showControlsFromDataset = block.dataset.showControls === 'true';
    const hasControlsMarkup = !!block.querySelector('.pb-carousel-controls') || !!block.querySelector('.pb-carousel-play-button');
    const showControls = showControlsFromDataset || hasControlsMarkup;

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

    // Icons and play/pause button(s) (controls markup can vary)
    // We support either:
    //  1) A single toggle button: .pb-carousel-play-button containing .play-icon + .pause-icon
    //  2) Separate buttons: .pb-carousel-play-button (play) and .pb-carousel-pause-button (pause)
    const playButton = block.querySelector('.pb-carousel-play-button');
    const pauseButton = block.querySelector('.pb-carousel-pause-button');

    // Icons may live inside the toggle button (common case)
    const playIcon = playButton?.querySelector('.play-icon');
    const pauseIcon = playButton?.querySelector('.pause-icon');

    const updateIcons = (isPlaying) => {
      // If we have a toggle button with icons, switch icons.
      if (playIcon && pauseIcon) {
        playIcon.style.display = isPlaying ? 'none' : 'inline';
        pauseIcon.style.display = isPlaying ? 'inline' : 'none';
      }

      // If we have separate buttons, optionally reflect state via aria-pressed.
      if (playButton) playButton.setAttribute('aria-pressed', String(!!isPlaying));
      if (pauseButton) pauseButton.setAttribute('aria-pressed', String(!isPlaying));
    };

    const startAutoplay = () => {
      if (intervalId) return;

      // If the base carousel script hasn't finished positioning yet, wait for it.
      if (!gallery.classList.contains('pb-carousel-ready')) {
        const readyObserver = new MutationObserver(() => {
          if (gallery.classList.contains('pb-carousel-ready')) {
            readyObserver.disconnect();
            // sync index once before starting
            syncCurrentIndex();
            startAutoplay();
          }
        });
        readyObserver.observe(gallery, { attributes: true, attributeFilter: ['class'] });
        return;
      }

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
      if (!intervalId) {
        // Still update icons/state so UI never gets stuck showing “pause”.
        updateIcons(false);
        return;
      }
      clearInterval(intervalId);
      intervalId = null;
      updateIcons(false);
    };

    // Bind controls
    const bindControls = () => {
      // Avoid double-binding (some themes/plugins may re-run scripts)
      if (block.dataset.pbPremiumControlsBound === 'true') return;
      block.dataset.pbPremiumControlsBound = 'true';

      // Separate pause button support
      if (pauseButton) {
        pauseButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          stopAutoplay();
        });
      }

      // Toggle button support (or play-only button if pauseButton exists)
      if (playButton) {
        playButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          // If we have a separate pause button, treat play button as play-only.
          if (pauseButton) {
            startAutoplay();
            return;
          }

          // Otherwise toggle play/pause.
          if (intervalId) stopAutoplay();
          else startAutoplay();
        });
      }
    };

    // If controls are shown, NEVER auto-start. Require user interaction.
    if (showControls) {
      bindControls();
      // Ensure initial icon state is “play”
      updateIcons(false);
    } else {
      // No controls visible: auto-start once the base script marks the gallery ready
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