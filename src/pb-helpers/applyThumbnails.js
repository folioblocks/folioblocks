const getAllBlocksRecursive = (clientId) => {
	const blocks = wp.data.select('core/block-editor').getBlocks(clientId);
	let all = [...blocks];
	blocks.forEach((b) => {
		all = all.concat(getAllBlocksRecursive(b.clientId));
	});
	return all;
};

const observeListViewChanges = () => {
	const listViewContainer = document.querySelector('.block-editor-list-view__content');
	if (!listViewContainer) return;

	const observer = new MutationObserver(() => {
		applyThumbnails(clientId);
	});

	observer.observe(listViewContainer, {
		childList: true,
		subtree: true,
	});
};


// Wait for List View to appear, then initialize observer
const waitForListView = () => {
	const editorLayout = document.querySelector('.edit-post-editor-layout');

	if (!editorLayout) {
		return;
	}

	const observer = new MutationObserver(() => {
		const listView = document.querySelector('.block-editor-list-view__content');
		if (listView) {
			observer.disconnect();
			observeListViewChanges(); // Begin watching for internal changes
			applyThumbnails(); // Run initially
		}
	});

	observer.observe(editorLayout, {
		childList: true,
		subtree: true,
	});
};

waitForListView();

export const applyThumbnails = (clientId = null, retries = 10) => {
	const delay = 300;
	let allApplied = true;

	const blocks = clientId
		? getAllBlocksRecursive(clientId)
		: wp.data.select('core/block-editor').getBlocks();

	blocks.forEach((block) => {
		// Only apply to 'portfolio-blocks/pb-image-block' with a valid src
		if (
			block.name !== 'portfolio-blocks/pb-image-block' ||
			!block.attributes?.src
		) {
			return;
		}

		const listItem = document.querySelector(`[data-block="${block.clientId}"]`);
		if (!listItem) {
			allApplied = false;
			return;
		}

		let thumbnailContainer = listItem.querySelector('.block-editor-list-view-block-select-button__image');
		if (!thumbnailContainer) {
			const selectButton = listItem.querySelector('.block-editor-list-view-block-select-button');
			if (selectButton) {
				thumbnailContainer = document.createElement('span');
				thumbnailContainer.className = 'block-editor-list-view-block-select-button__image';
				thumbnailContainer.dataset.pbThumbnail = 'true';
				selectButton.appendChild(thumbnailContainer);
			} else {
				allApplied = false;
				return;
			}
		}

		// Skip if already applied with correct background image
		if (
			thumbnailContainer.dataset.pbThumbnailApplied === 'true' &&
			thumbnailContainer.style.backgroundImage === `url("${block.attributes.src}")`
		) {
			return;
		}

		requestAnimationFrame(() => {
			thumbnailContainer.style.backgroundImage = `url("${block.attributes.src}")`;
			thumbnailContainer.style.backgroundSize = 'cover';
			thumbnailContainer.style.backgroundPosition = 'center';
			thumbnailContainer.style.setProperty('width', '30px', 'important');
			thumbnailContainer.style.height = '20px';
			thumbnailContainer.style.zIndex = '1';
			thumbnailContainer.dataset.pbThumbnailApplied = 'true';
		});
	});

	if (!allApplied && retries > 0) {
		setTimeout(() => {
			applyThumbnails(clientId, retries - 1);
		}, delay);
	}
};