document.addEventListener('DOMContentLoaded', function () {
	const containers = document.querySelectorAll('.pb-before-after-container');

	containers.forEach((container) => {
		const slider = container.querySelector('.pb-slider');
		const beforeWrapper = container.querySelector('.pb-before-wrapper');
		const afterImage = container.querySelector('.pb-after-image');

		if (!slider || !beforeWrapper || !afterImage) return;

		const initial = Number(slider.value) || 50;
		const isVertical = container.classList.contains('is-vertical');
		const handle = container.querySelector('.pb-slider-handle');

		if (!handle) return;

		if (isVertical) {
			beforeWrapper.style.clipPath = `inset(0 0 ${100 - initial}% 0)`;
			handle.style.top = `${initial}%`;
		} else {
			beforeWrapper.style.clipPath = `inset(0 ${100 - initial}% 0 0)`;
			handle.style.left = `${initial}%`;
		}

		// Maintain aspect ratio from after image
		const updateHeight = () => {
			if (afterImage.naturalWidth && afterImage.naturalHeight) {
				const aspectRatio = afterImage.naturalHeight / afterImage.naturalWidth;
				container.style.height = `${container.offsetWidth * aspectRatio}px`;
			}
		};

		if (afterImage.complete) {
			updateHeight();
		} else {
			afterImage.onload = updateHeight;
		}

		window.addEventListener('resize', updateHeight);

		slider.addEventListener('input', () => {
			const value = Number(slider.value);
			const isVertical = container.classList.contains('is-vertical');

			if (isVertical) {
				beforeWrapper.style.clipPath = `inset(0 0 ${100 - value}% 0)`;
				container.querySelector('.pb-slider-handle').style.top = `${value}%`;
			} else {
				beforeWrapper.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
				container.querySelector('.pb-slider-handle').style.left = `${value}%`;
			}
		});
		slider.addEventListener('wheel', (event) => {
			const isVertical = container.classList.contains('is-vertical');
			if (!isVertical) return;

			event.preventDefault();
			const delta = event.deltaY;
			const currentValue = Number(slider.value);
			const step = 2;

			const newValue = Math.min(100, Math.max(0, currentValue + (delta > 0 ? step : -step)));
			slider.value = newValue;

			beforeWrapper.style.clipPath = `inset(0 0 ${100 - newValue}% 0)`;
			container.querySelector('.pb-slider-handle').style.top = `${newValue}%`;
		}, { passive: false });
	});
	
	// Disable right-click on entire page if any gallery block has it enabled
	const disableRightClick = document.querySelector('[data-disable-right-click="true"]');
	if (disableRightClick) {
		document.addEventListener('contextmenu', (e) => {
			e.preventDefault();
		});
	}
});