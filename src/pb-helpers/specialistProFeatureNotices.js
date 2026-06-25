import { __ } from "@wordpress/i18n";
import ProFeatureNotice from "./ProFeatureNotice";

const presets = {
	beforeAfterControls: {
		title: __("Advanced Comparison Controls", "folioblocks"),
		description: __(
			"Fine-tune how visitors explore your before and after images.",
			"folioblocks",
		),
		features: [
			__("Set the slider handle starting position.", "folioblocks"),
			__("Display Before and After labels.", "folioblocks"),
			__("Choose label placement for each slider orientation.", "folioblocks"),
		],
		campaign: "before-after-controls",
	},
	beforeAfterStyles: {
		title: __("Slider and Label Styles", "folioblocks"),
		description: __(
			"Match the comparison controls to your site and images.",
			"folioblocks",
		),
		features: [
			__("Customize the slider handle and line color.", "folioblocks"),
			__("Choose label text and background colors.", "folioblocks"),
		],
		campaign: "before-after-styles",
	},
	loupeAppearance: {
		title: __("Loupe Appearance", "folioblocks"),
		description: __(
			"Customize the magnifying loupe to complement your image.",
			"folioblocks",
		),
		features: [
			__("Choose a circular or square loupe.", "folioblocks"),
			__("Use a light or dark loupe frame.", "folioblocks"),
		],
		campaign: "loupe-appearance",
	},
	backgroundVideoResponsive: {
		title: __("Responsive Background Video Controls", "folioblocks"),
		description: __(
			"Fine-tune the background video composition for every screen size.",
			"folioblocks",
		),
		features: [
			__("Set independent desktop, tablet, and mobile heights.", "folioblocks"),
			__("Adjust horizontal focal points per device.", "folioblocks"),
			__("Adjust vertical focal points per device.", "folioblocks"),
		],
		campaign: "background-video-responsive-controls",
	},
	protection: {
		title: __("Media Protection", "folioblocks"),
		description: __(
			"Add a page-level control that discourages visitors from copying displayed media.",
			"folioblocks",
		),
		features: [
			__("Disable right-click on compatible FolioBlocks media.", "folioblocks"),
		],
		campaign: "media-protection",
		compact: true,
	},
	protectionPerformance: {
		title: __("Protection and Performance", "folioblocks"),
		description: __(
			"Add page-level controls for protecting and loading your media.",
			"folioblocks",
		),
		features: [
			__("Disable right-click on displayed media.", "folioblocks"),
			__("Lazy-load compatible images.", "folioblocks"),
		],
		campaign: "media-protection-performance",
		compact: true,
	},
};

export const specialistProFeatureNotice = (preset, overrides = {}) => (
	<ProFeatureNotice {...presets[preset]} {...overrides} />
);
