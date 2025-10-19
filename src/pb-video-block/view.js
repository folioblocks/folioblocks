// view.js — PB Video Block Frontend Lightbox

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

	const blocks = document.querySelectorAll('.pb-video-block');

	blocks.forEach((block) => {
		block.addEventListener('click', (e) => {
			e.preventDefault();

			const videoUrl = block.getAttribute('data-video-url');
			if (!videoUrl) return;

			const gallery = block.closest('.pb-video-gallery');
			const layout = gallery ? gallery.getAttribute('data-lightbox-layout') : 'video-only';
			const title = block.getAttribute('data-video-title') || '';
			const description = block.getAttribute('data-video-description') || '';

			openLightbox(videoUrl, layout, title, description);
		});
	});

	function openLightbox(videoUrl, layout = 'video-only', title = '', description = '') {
		const overlay = document.createElement('div');
		overlay.className = 'pb-video-lightbox';
		overlay.innerHTML = `
			<div class="pb-video-lightbox ${layout === 'split' ? 'split-layout' : ''}">
				<div class="pb-video-lightbox-inner">
					<button class="pb-video-lightbox-close" aria-label="Close">×</button>
					${layout === 'split'
				? `
						<div class="pb-video-lightbox-video" style="flex:0 0 70%">
							${getVideoEmbedMarkup(videoUrl)}
						</div>
						<div class="pb-video-lightbox-info" style="flex:0 0 30%">
							${title ? `<h2 class="pb-video-lightbox-title">${title}</h2>` : ''}
							${description ? `<p class="pb-video-lightbox-description">${description}</p>` : ''}
						</div>
						`
				: `
						<div class="pb-video-lightbox-video">
							${getVideoEmbedMarkup(videoUrl)}
						</div>
						`}
				</div>
			</div>
		`;

		document.body.appendChild(overlay);

		const closeButton = overlay.querySelector('.pb-video-lightbox-close');
		if (closeButton && userUsedKeyboard) {
			closeButton.focus();
			overlay.addEventListener('keydown', (e) => {
				if (e.key === 'Tab') {
					e.preventDefault();
					closeButton.focus();
				}
			});
		}

		// Close lightbox when clicking anywhere outside the actual video container
		overlay.addEventListener('click', (e) => {
			const videoContainer = overlay.querySelector('.pb-video-lightbox-video');
			if (!videoContainer.contains(e.target)) {
				closeLightbox();
			}
		});
		document.body.style.overflow = 'hidden';

		// Close on button click or Escape
		overlay.querySelector('.pb-video-lightbox-close').addEventListener('click', closeLightbox);
		document.addEventListener('keydown', handleEscape);

		document.addEventListener('keydown', handleFullscreen);

		function handleFullscreen(e) {
			if (e.key.toLowerCase() === 'f') {
				const iframe = overlay.querySelector('.pb-video-lightbox-video iframe');
				const video = overlay.querySelector('.pb-video-lightbox-video video');
				if (iframe) {
					const container = iframe.parentElement;
					if (container.requestFullscreen) {
						container.requestFullscreen();
					} else if (container.webkitRequestFullscreen) {
						container.webkitRequestFullscreen();
					} else if (container.msRequestFullscreen) {
						container.msRequestFullscreen();
					}
				} else if (video) {
					if (video.requestFullscreen) {
						video.requestFullscreen();
					} else if (video.webkitRequestFullscreen) {
						video.webkitRequestFullscreen();
					} else if (video.msRequestFullscreen) {
						video.msRequestFullscreen();
					}
				}
			}
		}

		function handleEscape(e) {
			if (e.key === 'Escape') closeLightbox();
		}

		function closeLightbox() {
			overlay.remove();
			document.body.style.overflow = '';
			document.removeEventListener('keydown', handleFullscreen);
			document.removeEventListener('keydown', handleEscape);
		}
	}

	function getVideoEmbedMarkup(videoUrl) {
		if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
			const id = videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop();
			return `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
		}
		if (videoUrl.includes('vimeo.com')) {
			const id = videoUrl.split('/').pop();
			return `<iframe src="https://player.vimeo.com/video/${id}?autoplay=1" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
		}
		return `<video src="${videoUrl}" controls autoplay></video>`;
	}

	// Sequential fade-in for video blocks
	const allBlocks = document.querySelectorAll('.pb-video-block');
	allBlocks.forEach((block, index) => {
		block.style.opacity = 0;
		block.style.transform = 'translateY(20px)';
		block.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
		setTimeout(() => {
			block.style.opacity = 1;
			block.style.transform = 'translateY(0)';
		}, index * 150); // 150ms delay between each block
	});
});
