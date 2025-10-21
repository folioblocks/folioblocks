// view.js — PB Video Block Frontend Lightbox

// ------------------------------
// 1. Input Method Tracking
// ------------------------------

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

// ------------------------------
// 2. Block Click Handling
// ------------------------------

document.addEventListener('DOMContentLoaded', () => {
	const blocks = document.querySelectorAll('.pb-video-block');

	blocks.forEach((block) => {
		block.addEventListener('click', (e) => {
			// Prevent lightbox activation when clicking Add to Cart button
			if (e.target.closest('.pb-video-add-to-cart')) return;

			e.preventDefault();

			const videoUrl = block.getAttribute('data-video-url');
			if (!videoUrl) return;

			const gallery = block.closest('.pb-video-gallery');
			const layout = gallery ? gallery.getAttribute('data-lightbox-layout') : 'video-only';
			const title = block.getAttribute('data-video-title') || '';
			const description = block.getAttribute('data-video-description') || '';

			openLightbox(videoUrl, layout, title, description, block);
		});
	});

	// ------------------------------
	// 6. Sequential Fade-in Animation
	// ------------------------------

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

// ------------------------------
// 3. Lightbox Open / Close
// ------------------------------

function openLightbox(videoUrl, layout = 'video-only', title = '', description = '', block = null) {
	const overlay = document.createElement('div');
	const previouslyFocused = document.activeElement;

	overlay.setAttribute('role', 'dialog');
	overlay.setAttribute('aria-modal', 'true');
	overlay.setAttribute('aria-label', title ? `Video: ${title}` : 'Video lightbox');
	overlay.className = `pb-video-lightbox ${
		layout === 'split'
			? 'split-layout'
			: layout === 'video-product'
			? 'video-product-layout'
			: ''
	}`;

	overlay.innerHTML = `
		<div class="pb-video-lightbox-inner">
			<button class="pb-video-lightbox-close" aria-label="Close">×</button>
			${
				layout === 'split' || layout === 'video-product'
					? `
				<div class="pb-video-lightbox-video" style="flex:0 0 70%">
					${getVideoEmbedMarkup(videoUrl)}
				</div>
				<div class="pb-video-lightbox-info" style="flex:0 0 30%">
					${
						layout === 'video-product' &&
						(block.getAttribute('data-product-name') ||
							block.getAttribute('data-product-price') ||
							block.getAttribute('data-product-description') ||
							block.getAttribute('data-product-url'))
							? `
						<div class="pb-lightbox-product-info">
							${
								block.getAttribute('data-product-name')
									? `<h2 class="pb-product-name">${block.getAttribute('data-product-name')}</h2>`
									: ''
							}
							${
								block.getAttribute('data-product-price')
									? `<p class="pb-product-price">${block.getAttribute('data-product-price')}</p>`
									: ''
							}
							${
								block.getAttribute('data-product-description')
									? `<p class="pb-product-description">${block.getAttribute('data-product-description')}</p>`
									: ''
							}
							${
								block.getAttribute('data-product-url')
									? `<a href="${block.getAttribute(
											'data-product-url'
									  )}" class="pb-view-product-button" target="_blank" rel="noopener noreferrer">View Product</a>`
									: ''
							}
						</div>
					`
							: `
						${title ? `<h2 class="pb-video-lightbox-title">${title}</h2>` : ''}
						${description ? `<p class="pb-video-lightbox-description">${description}</p>` : ''}
					`
					}
				</div>
			`
					: `
				<div class="pb-video-lightbox-video">
					${getVideoEmbedMarkup(videoUrl)}
				</div>
			`
			}
		</div>
	`;

	document.body.appendChild(overlay);
	document.body.style.overflow = 'hidden';

	const closeButton = overlay.querySelector('.pb-video-lightbox-close');

	// ------------------------------
	// 4. Accessibility Features
	// ------------------------------

	setupFocusTrap(overlay);

	// Close lightbox when clicking outside video container
	overlay.addEventListener('click', (e) => {
		const videoContainer = overlay.querySelector('.pb-video-lightbox-video');
		if (!videoContainer.contains(e.target)) {
			closeLightbox();
		}
	});

	closeButton.addEventListener('click', closeLightbox);
	document.addEventListener('keydown', handleEscape);
	document.addEventListener('keydown', handleFullscreen);

	function handleEscape(e) {
		if (e.key === 'Escape') closeLightbox();
	}

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

	function closeLightbox() {
		if (previouslyFocused) previouslyFocused.focus();
		overlay.remove();
		document.body.style.overflow = '';
		document.removeEventListener('keydown', handleFullscreen);
		document.removeEventListener('keydown', handleEscape);
	}
}

// ------------------------------
// 4. Accessibility Features (Helper)
// ------------------------------

function setupFocusTrap(container) {
	const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

	const updateFocusable = () =>
		Array.from(container.querySelectorAll(focusableSelectors)).filter(
			(el) => !el.hasAttribute('disabled') && el.offsetParent !== null
		);

	let focusableElements = updateFocusable();

	if (userUsedKeyboard && focusableElements.length) {
		// Focus the close button or first focusable element
		focusableElements[0].focus();
	}

	container.addEventListener('keydown', (e) => {
		if (e.key !== 'Tab') return;

		focusableElements = updateFocusable(); // refresh in case of dynamic buttons
		const firstEl = focusableElements[0];
		const lastEl = focusableElements[focusableElements.length - 1];

		if (!focusableElements.length) return;

		if (e.shiftKey) {
			if (document.activeElement === firstEl || document.activeElement === container) {
				e.preventDefault();
				lastEl.focus();
			}
		} else {
			if (document.activeElement === lastEl) {
				e.preventDefault();
				firstEl.focus();
			}
		}
	});
}

// ------------------------------
// 5. Video Embeds
// ------------------------------

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