// view.js — PB Video Block Frontend Lightbox

document.addEventListener('DOMContentLoaded', () => {
	const blocks = document.querySelectorAll('.pb-video-block');

	blocks.forEach((block) => {
		block.addEventListener('click', (e) => {
			e.preventDefault();

			const videoUrl = block.getAttribute('data-video-url');
			if (!videoUrl) return;

			openLightbox(videoUrl);
		});
	});

	function openLightbox(videoUrl) {
		const overlay = document.createElement('div');
		overlay.className = 'pb-video-lightbox';
		overlay.innerHTML = `
			<div class="pb-video-lightbox-inner">
				<button class="pb-video-lightbox-close" aria-label="Close">×</button>
				<div class="pb-video-lightbox-video">
					${getVideoEmbedMarkup(videoUrl)}
				</div>
			</div>
		`;

		document.body.appendChild(overlay);
		document.body.style.overflow = 'hidden';

		// Close on button click or Escape
		overlay.querySelector('.pb-video-lightbox-close').addEventListener('click', closeLightbox);
		document.addEventListener('keydown', handleEscape);

		function handleEscape(e) {
			if (e.key === 'Escape') closeLightbox();
		}

		function closeLightbox() {
			overlay.remove();
			document.body.style.overflow = '';
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
});
