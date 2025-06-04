document.addEventListener('DOMContentLoaded', () => {
	const galleries = document.querySelectorAll('.pb-sidescroll-gallery');

	galleries.forEach((gallery) => {
		const track = gallery.querySelector('.pb-sidescroll-gallery-track');
		if (!track) return;

		const direction = gallery.getAttribute('data-scroll-direction') || 'left';
		const speedAttr = parseFloat(gallery.getAttribute('data-scroll-speed')) || 5;
		const speed = speedAttr * 0.5;
		const pauseOnHover = gallery.classList.contains('pb-pause-on-hover');

		let scrollAmount = direction === 'left' ? 0 : -track.scrollWidth / 2;
		let paused = false;

		// Attach hover listeners if enabled
		if (pauseOnHover) {
			gallery.addEventListener('mouseenter', () => {
				paused = true;
			});
			gallery.addEventListener('mouseleave', () => {
				paused = false;
			});
		}

		const animate = () => {
			if (!paused) {
				if (direction === 'left') {
					scrollAmount -= speed;
					if (Math.abs(scrollAmount) > track.scrollWidth / 2) {
						scrollAmount = 0;
					}
				} else {
					scrollAmount += speed;
					if (scrollAmount >= 0) {
						scrollAmount = -track.scrollWidth / 2;
					}
				}

				track.style.transform = `translateX(${scrollAmount}px)`;
			}

			requestAnimationFrame(animate);
		};

		animate();
	});
});