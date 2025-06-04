const getAllBlocksRecursive = (clientId) => {
	const blocks = wp.data.select('core/block-editor').getBlocks(clientId);
	let all = [...blocks];
	blocks.forEach((b) => {
		all = all.concat(getAllBlocksRecursive(b.clientId));
	});
	return all;
};

console.log('[applyThumbnails] Initialized');

export const applyThumbnails = (clientId = null, retries = 10) => {
	const delay = 300;
	let allApplied = true;

	const blocks = clientId
		? getAllBlocksRecursive(clientId)
		: wp.data.select('core/block-editor').getBlocks();

	console.log(`[applyThumbnails] Start — blocks found: ${blocks.length}, retries left: ${retries}`);

	blocks.forEach((block) => {
		console.log(`[applyThumbnails] Checking block: ${block.name}, clientId: ${block.clientId}`);

		if (!block.attributes?.src) {
			console.log(`[applyThumbnails] Skipped — no src for block ${block.clientId}`);
			return;
		}

		const listItem = document.querySelector(`[data-block="${block.clientId}"]`);
		if (!listItem) {
			console.warn(`[applyThumbnails] List item not found for block ${block.clientId}`);
			allApplied = false;
			return;
		}

		let thumbnailContainer = listItem.querySelector('.block-editor-list-view-block-select-button__images');
		if (!thumbnailContainer) {
			const selectButton = listItem.querySelector('.block-editor-list-view-block-select-button');
			if (selectButton) {
				thumbnailContainer = document.createElement('span');
				thumbnailContainer.className = 'block-editor-list-view-block-select-button__images';
				selectButton.appendChild(thumbnailContainer);
				console.log(`[applyThumbnails] Created new thumbnail span for block ${block.clientId}`);
			} else {
				console.warn(`[applyThumbnails] Select button not found for block ${block.clientId}`);
				allApplied = false;
				return;
			}
		}

		// Apply styling
		thumbnailContainer.style.backgroundImage = `url(${block.attributes.src})`;
		thumbnailContainer.style.backgroundSize = 'cover';
		thumbnailContainer.style.backgroundPosition = 'center';
		thumbnailContainer.style.display = 'inline-block';
		thumbnailContainer.style.width = '24px';
		thumbnailContainer.style.height = '18px';

		console.log(`[applyThumbnails] Applied thumbnail for block ${block.clientId}`);
	});
};