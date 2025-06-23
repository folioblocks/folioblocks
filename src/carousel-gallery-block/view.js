document.addEventListener('DOMContentLoaded', () => {

    // Disable right-click on entire page if any gallery block has it enabled
	const disableRightClick = document.querySelector('[data-disable-right-click="true"]');
	if (disableRightClick) {
		document.addEventListener('contextmenu', (e) => {
			e.preventDefault();
		});
	}

    const blocks = document.querySelectorAll('.wp-block-portfolio-blocks-carousel-gallery-block');
    blocks.forEach((block) => {
        const gallery = block.querySelector('.pb-carousel-gallery');
        if (!gallery) return;

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

        applyHeight();

        const resizeObserver = new ResizeObserver(applyHeight);
        resizeObserver.observe(gallery);

        const chevrons = block.querySelectorAll('.pb-carousel-chevron');
        const slides = block.querySelectorAll('.pb-carousel-gallery > *');
        let currentSlide = 0;

        function scrollToSlide(index) {
	        const target = slides[index];
	        if (target) {
		        target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
		        currentSlide = index;
	        }
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

        const playButton = block.querySelector('.pb-carousel-play-button');
        const playIcon = playButton?.querySelector('.play-icon');
        const pauseIcon = playButton?.querySelector('.pause-icon');
        const autoplayEnabled = block.dataset.autoplay === 'true';
        const autoplaySpeed = Number(block.dataset.autoplaySpeed) || 3;

        let intervalId = null;

        function updateIcons(isPlaying) {
	        if (isPlaying) {
		        playIcon.style.display = 'none';
		        pauseIcon.style.display = 'inline';
	        } else {
		        playIcon.style.display = 'inline';
		        pauseIcon.style.display = 'none';
	        }
        }

        function startAutoplay() {
	        if (intervalId) return;
	        updateIcons(true);
	        intervalId = setInterval(() => {
		        if (currentSlide < slides.length - 1) {
			        scrollToSlide(currentSlide + 1);
		        } else {
			        clearInterval(intervalId);
			        updateIcons(false);
		        }
	        }, autoplaySpeed * 1000);
        }

        function stopAutoplay() {
	        if (intervalId) {
		        clearInterval(intervalId);
		        intervalId = null;
		        updateIcons(false);
	        }
        }

        playButton?.addEventListener('click', () => {
	        if (intervalId) {
		        stopAutoplay();
	        } else {
		        startAutoplay();
	        }
        });

        if (autoplayEnabled) {
	        startAutoplay();
        }
    });
});
