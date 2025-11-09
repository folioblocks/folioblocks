/**
 * PB Video Block
 * View JS – Optimized Lightbox (fast YouTube/Vimeo playback)
 **/

let userUsedKeyboard = false;
window.addEventListener('keydown', (e) => {
	if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ') userUsedKeyboard = true;
});
window.addEventListener('mousedown', () => (userUsedKeyboard = false));
window.addEventListener('touchstart', () => (userUsedKeyboard = false));

const hasWooCommerce = !!document.querySelector('.woocommerce');

document.addEventListener('DOMContentLoaded', () => {
	const blocks = document.querySelectorAll('.pb-video-block');

	/** ----------------------------------------------------------------
	 *  Sequential fade-in animation for grid items
	 *  ---------------------------------------------------------------- */
	blocks.forEach((block, index) => {
		block.style.opacity = 0;
		block.style.transform = 'translateY(20px)';
		block.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
		setTimeout(() => {
			block.style.opacity = 1;
			block.style.transform = 'translateY(0)';
		}, index * 150);
	});

	blocks.forEach((block) => {
		const lbxId = block.getAttribute('data-lbx');
		const lightbox = lbxId ? document.querySelector(`.pb-video-lightbox[data-lbx="${lbxId}"]`) : null;
		const videoContainer = lightbox ? lightbox.querySelector('.pb-video-lightbox-video') : null;
		if (!lightbox || !videoContainer) return;

		/** ----------------------------------------------------------------
		 *  Create one reusable iframe for YouTube/Vimeo playback
		 *  ---------------------------------------------------------------- */
		const iframe = document.createElement('iframe');
		iframe.setAttribute('frameborder', '0');
		iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture');
		iframe.setAttribute('allowfullscreen', '');
		iframe.style.display = 'none';
		iframe.style.opacity = '0';
		iframe.style.transition = 'opacity 0.3s ease';
		videoContainer.appendChild(iframe);

		iframe.addEventListener('load', () => {
			iframe.classList.add('loaded');
			iframe.style.opacity = '1';
		});

		/** ----------------------------------------------------------------
		 *  Helper: Build correct embed markup or local video
		 *  ---------------------------------------------------------------- */
		function setVideoSource(videoUrl) {
			videoContainer.classList.remove('has-local-video');
			if (/youtube\.com|youtu\.be/.test(videoUrl)) {
				let videoId = null;
				try {
					if (videoUrl.includes('watch?v=')) {
						videoId = new URL(videoUrl).searchParams.get('v');
					} else if (videoUrl.includes('youtu.be/')) {
						videoId = videoUrl.split('youtu.be/')[1].split(/[?&]/)[0];
					}
				} catch (e) {
					console.error('Error parsing YouTube URL:', e);
				}
				if (videoId) {
					iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
					iframe.style.display = 'block';
					return;
				}
			}

			if (/vimeo\.com/.test(videoUrl)) {
				const videoId = videoUrl.split('/').pop();
				iframe.src = `https://player.vimeo.com/video/${videoId}?autoplay=1`;
				iframe.style.display = 'block';
				return;
			}

			// Self-hosted video
			iframe.style.display = 'none';
			iframe.src = '';
			videoContainer.classList.add('has-local-video');
			videoContainer.innerHTML = `<video src="${videoUrl}" controls autoplay></video>`;
		}

		/** ----------------------------------------------------------------
		 *  Open lightbox and play video
		 *  ---------------------------------------------------------------- */
		block.addEventListener('click', (e) => {
			if (e.target.closest('.pb-video-add-to-cart')) return;
			e.preventDefault();

			const id = block.getAttribute('data-lbx');
			const lightbox = document.querySelector(`.pb-video-lightbox[data-lbx="${id}"]`);
			const videoContainer = lightbox.querySelector('.pb-video-lightbox-video');

			const videoUrl = block.dataset.videoUrl;
			if (!videoUrl) return;

			videoContainer.innerHTML = ''; // clear old local video
			videoContainer.appendChild(iframe); // ensure iframe still present

			setVideoSource(videoUrl);

			lightbox.classList.add('active');
			document.body.style.overflow = 'hidden';
		});

		/** ----------------------------------------------------------------
		 *  Close lightbox and stop playback
		 *  ---------------------------------------------------------------- */
		function closeLightbox() {
			lightbox.classList.remove('active');
			document.body.style.overflow = '';
			iframe.style.display = 'none';
			iframe.style.opacity = '0';
			iframe.src = '';
			videoContainer.innerHTML = '';
			videoContainer.appendChild(iframe);
		}

		document.addEventListener('click', (e) => {
			if (e.target.closest('.pb-video-lightbox-close') && lightbox.classList.contains('active')) closeLightbox();
		});

		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
		});
	});
});