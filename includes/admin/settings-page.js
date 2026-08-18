(function () {
	const config = window.folioBlocksDashboardNews;

	if (!config || !config.ajaxUrl || !config.nonce) {
		return;
	}

	const newsList = document.querySelector("[data-fbks-dashboard-news]");

	if (!newsList) {
		return;
	}

	const showFallback = () => {
		newsList.innerHTML = `<li class="pb-news-item--empty">${config.emptyText}</li>`;
	};

	const formData = new FormData();
	formData.append("action", "fbks_dashboard_news");
	formData.append("nonce", config.nonce);

	fetch(config.ajaxUrl, {
		method: "POST",
		credentials: "same-origin",
		body: formData,
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error("Unable to load FolioBlocks news.");
			}

			return response.json();
		})
		.then((result) => {
			if (!result.success || !result.data || !result.data.html) {
				showFallback();
				return;
			}

			newsList.innerHTML = result.data.html;
		})
		.catch(showFallback);
})();
