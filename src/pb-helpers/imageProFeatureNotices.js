import { __ } from "@wordpress/i18n";
import ProFeatureNotice from "./ProFeatureNotice";

const presets = {
	randomize: {
		title: __("Randomize Gallery Order", "folioblocks"),
		description: __(
			"Present images in a different order whenever the gallery loads.",
			"folioblocks",
		),
		features: [
			__("Automatically shuffle gallery images.", "folioblocks"),
			__("Keep repeat visits feeling fresh.", "folioblocks"),
		],
		campaign: "gallery-randomize",
		compact: true,
	},
	responsiveGaps: {
		title: __("Responsive Gallery Gaps", "folioblocks"),
		description: __(
			"Fine-tune gallery spacing independently for every screen size.",
			"folioblocks",
		),
		features: [
			__("Set custom desktop, tablet, and mobile gaps.", "folioblocks"),
			__("Choose any spacing from 0 to 50 pixels.", "folioblocks"),
		],
		campaign: "responsive-gallery-gaps",
		compact: true,
	},
	clickActions: {
		title: __("Advanced Click Actions", "folioblocks"),
		description: __(
			"Choose what happens when visitors interact with gallery images.",
			"folioblocks",
		),
		features: [
			__("Link to media files, custom URLs, Pages, or Posts.", "folioblocks"),
			__("Offer downloads or connect WooCommerce products.", "folioblocks"),
			__(
				"Customize lightbox appearance and displayed information.",
				"folioblocks",
			),
			__("Override click behavior for individual images.", "folioblocks"),
		],
		campaign: "image-click-actions",
	},
	hoverSettings: {
		title: __("Gallery Hover Settings", "folioblocks"),
		description: __(
			"Create richer interactions and reveal useful image information.",
			"folioblocks",
		),
		features: [
			__("Choose gradient, blur, color, or chip hover styles.", "folioblocks"),
			__(
				"Display titles, captions, categories, products, or EXIF data.",
				"folioblocks",
			),
			__("Customize overlay colors.", "folioblocks"),
			__("Override hover settings for individual images.", "folioblocks"),
		],
		campaign: "gallery-hover-settings",
	},
	filtering: {
		title: __("Gallery Filtering", "folioblocks"),
		description: __(
			"Help visitors quickly find the images that interest them.",
			"folioblocks",
		),
		features: [
			__("Add a visitor-facing filter bar.", "folioblocks"),
			__("Assign multiple categories to images.", "folioblocks"),
			__("Customize filter-bar typography and colors.", "folioblocks"),
		],
		campaign: "gallery-filtering",
	},
	watermarkOverlay: {
		title: __("Watermark Overlay", "folioblocks"),
		description: __(
			"Apply saved watermark overlays to gallery images and lightbox previews.",
			"folioblocks",
		),
		features: [
			__("Choose from saved watermarks.", "folioblocks"),
			__("Display watermarks on gallery images, lightbox images, or both.", "folioblocks"),
			__("Keep watermark styling managed globally.", "folioblocks"),
		],
		campaign: "watermark-overlay",
	},
	protectionPerformance: {
		title: __("Protection and Performance", "folioblocks"),
		description: __(
			"Add page-level controls for protecting and loading your media.",
			"folioblocks",
		),
		features: [
			__("Disable right-click on displayed media.", "folioblocks"),
			__("Lazy-load gallery images.", "folioblocks"),
		],
		campaign: "media-protection-performance",
		compact: true,
	},
	imageStyles: {
		title: __("Gallery Image Styles", "folioblocks"),
		description: __(
			"Give every gallery image a polished, consistent appearance.",
			"folioblocks",
		),
		features: [
			__("Customize border colors and widths.", "folioblocks"),
			__("Add rounded corners.", "folioblocks"),
			__("Apply image drop shadows.", "folioblocks"),
		],
		campaign: "gallery-image-styles",
	},
	filterStyles: {
		title: __("Gallery Filtering Styles", "folioblocks"),
		description: __(
			"Match the gallery filter bar to the design of your site.",
			"folioblocks",
		),
		features: [
			__("Customize filter text and background colors.", "folioblocks"),
			__("Style the active filtering category.", "folioblocks"),
			__("Control filter-bar typography.", "folioblocks"),
		],
		campaign: "gallery-filter-styles",
	},
	carouselPlayback: {
		title: __("Carousel Playback and Controls", "folioblocks"),
		description: __(
			"Create a continuously moving, hands-free gallery experience.",
			"folioblocks",
		),
		features: [
			__("Automatically advance carousel slides.", "folioblocks"),
			__("Loop slides continuously.", "folioblocks"),
			__("Configure playback timing and behavior.", "folioblocks"),
			__("Choose when navigation controls appear.", "folioblocks"),
		],
		campaign: "carousel-playback",
	},
	carouselControls: {
		title: __("Carousel Control Styles", "folioblocks"),
		description: __(
			"Customize carousel navigation to complement your gallery.",
			"folioblocks",
		),
		features: [
			__("Choose when navigation controls appear.", "folioblocks"),
			__("Customize control colors and appearance.", "folioblocks"),
		],
		campaign: "carousel-control-styles",
	},
	filmstripPlayback: {
		title: __("Filmstrip Playback and Display", "folioblocks"),
		description: __(
			"Create a more immersive and automated filmstrip experience.",
			"folioblocks",
		),
		features: [
			__("Automatically advance filmstrip images.", "folioblocks"),
			__("Open the filmstrip in fullscreen mode.", "folioblocks"),
			__("Randomize image order.", "folioblocks"),
		],
		campaign: "filmstrip-playback-display",
	},
	filmstripColorMode: {
		title: __("Filmstrip Color Mode", "folioblocks"),
		description: __(
			"Choose a light or dark presentation for your filmstrip.",
			"folioblocks",
		),
		features: [
			__("Match the filmstrip controls to your site.", "folioblocks"),
			__("Create a brighter or more cinematic presentation.", "folioblocks"),
		],
		campaign: "filmstrip-color-mode",
		compact: true,
	},
	imageOverrides: {
		title: __("Per-Image Gallery Overrides", "folioblocks"),
		description: __(
			"Give this image different behavior from the rest of its gallery.",
			"folioblocks",
		),
		features: [
			__("Override gallery click settings.", "folioblocks"),
			__("Override gallery hover settings.", "folioblocks"),
			__(
				"Highlight individual images with unique interactions.",
				"folioblocks",
			),
		],
		campaign: "per-image-overrides",
	},
	exif: {
		title: __("EXIF Metadata", "folioblocks"),
		description: __(
			"Show the camera settings and technical details behind your image.",
			"folioblocks",
		),
		features: [
			__("Read stored EXIF metadata.", "folioblocks"),
			__("Display camera details in overlays and lightboxes.", "folioblocks"),
			__("Keep technical information attached to the image.", "folioblocks"),
		],
		campaign: "image-exif-metadata",
	},
};

export const imageProFeatureNotice = (preset, overrides = {}) => (
	<ProFeatureNotice {...presets[preset]} {...overrides} />
);
