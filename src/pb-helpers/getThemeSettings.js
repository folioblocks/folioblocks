/**
 * Helpers for reading/normalizing theme typography settings (theme.json / Global Styles).
 * These are used in editor-only UI (Inspector Controls), not on the frontend.
 */

/**
 * Normalize the shape returned by useSettings("typography.fontFamilies")
 * WP may return either:
 *  - an array of font family objects
 *  - an object with groups: { theme: [], custom: [], default: [] }
 */
export function normalizeFontFamilies(input) {
	if (Array.isArray(input)) return input;

	if (input && typeof input === "object") {
		const out = [];
		Object.keys(input).forEach((key) => {
			if (Array.isArray(input[key])) out.push(...input[key]);
		});
		return out;
	}

	return [];
}

/**
 * Build SelectControl options for Font Family.
 * Uses core’s convention when a `slug` exists:
 *  var(--wp--preset--font-family--{slug})
 */
export function getFontFamilyOptions(families, __) {
	const safe = Array.isArray(families) ? families : [];

	const options = [
		{ label: __("Default", "folioblocks"), value: "" },
		...safe
			.filter((f) => f && (f.name || f.slug || f.fontFamily))
			.map((f) => {
				const label = f.name || f.slug || f.fontFamily;
				const value = f.slug
					? `var(--wp--preset--font-family--${f.slug})`
					: f.fontFamily || "";
				return { label, value };
			}),
	];

	return options;
}

/**
 * Attempt to derive font-weight options from font family definitions.
 *
 * In theme.json, a fontFamily entry may include `fontFace` array items like:
 *  { fontFamily, fontWeight, fontStyle, src: [...] }
 *
 * If no weights are found, we fall back to a sensible common set.
 */
export function getFontWeightOptions(families, __) {
	const safe = Array.isArray(families) ? families : [];

	const weights = new Set();

	for (const fam of safe) {
		const faces = fam?.fontFace;
		if (!Array.isArray(faces)) continue;

		for (const face of faces) {
			if (!face) continue;

			// theme.json can store fontWeight as "400" or 400 or "400 700"
			const w = face.fontWeight;
			if (typeof w === "number") weights.add(String(w));
			if (typeof w === "string") {
				// Split "400 700" / "400,700" / "400-700" conservatively
				w.split(/[,\s]+/).forEach((part) => {
					const trimmed = part.trim();
					if (/^\d{3}$/.test(trimmed)) weights.add(trimmed);
				});
			}
		}
	}

	const sorted = [...weights].sort((a, b) => Number(a) - Number(b));

	const options = [{ label: __("Theme Default", "folioblocks"), value: "" }];

	if (sorted.length) {
		sorted.forEach((w) => options.push({ label: w, value: w }));
		return options;
	}

	// Fallback if theme doesn’t expose specific weights
	["300", "400", "500", "600", "700"].forEach((w) =>
		options.push({ label: w, value: w }),
	);

	return options;
}
/**
 * Normalize the shape returned by useSettings("typography.fontSizes").
 * WP may return either:
 *  - an array of font size objects
 *  - an object with groups: { theme: [], custom: [], default: [] }
 */
export function normalizeFontSizes(input) {
	if (Array.isArray(input)) return input;

	if (input && typeof input === "object") {
		const out = [];
		Object.keys(input).forEach((key) => {
			if (Array.isArray(input[key])) out.push(...input[key]);
		});
		return out;
	}

	return [];
}

/**
 * Convert a theme.json font size value into a numeric pixel value.
 * Themes often define sizes as strings like "14px" or "1rem".
 *
 * NOTE: We cannot reliably parse complex expressions like clamp()/var()/calc().
 * For those cases we return null so the caller can fall back to defaults.
 */
export function parseThemeFontSizeToPx(size) {
	if (typeof size === "number" && Number.isFinite(size)) return size;
	if (typeof size !== "string") return null;

	const trimmed = size.trim();
	if (!trimmed) return null;

	// Support simple px sizes like "14px".
	if (trimmed.endsWith("px")) {
		const n = parseFloat(trimmed);
		return Number.isFinite(n) ? n : null;
	}

	// Support simple rem/em sizes like "1rem" or "0.875em".
	// We assume a 16px root for the picker display.
	if (trimmed.endsWith("rem") || trimmed.endsWith("em")) {
		const n = parseFloat(trimmed);
		return Number.isFinite(n) ? n * 16 : null;
	}

	return null;
}

/**
 * Build FontSizePicker options from theme font sizes.
 * Returns a usable list, falling back to a sensible S/M/L/XL/XXL set.
 */
export function getFontSizeOptions(normalizedFontSizes) {
	const safe = Array.isArray(normalizedFontSizes) ? normalizedFontSizes : [];

	const themeFontSizeOptions = safe
		.map((s) => {
			const px = parseThemeFontSizeToPx(s?.size);
			if (px == null) return null;

			return {
				name: s?.name || s?.slug || `${Math.round(px)}px`,
				size: px,
				slug: s?.slug || String(px),
			};
		})
		.filter(Boolean);

	const fallbackFontSizeOptions = [
		{ name: "S", size: 12, slug: "s" },
		{ name: "M", size: 14, slug: "m" },
		{ name: "L", size: 16, slug: "l" },
		{ name: "XL", size: 20, slug: "xl" },
		{ name: "XXL", size: 26, slug: "xxl" },
	];

	return themeFontSizeOptions.length ? themeFontSizeOptions : fallbackFontSizeOptions;
}

/**
 * Normalize filter-bar typography attributes into valid CSS variable values.
 * Keeps the frontend styles predictable by:
 *  - ensuring font-size / letter-spacing include units
 *  - clamping numeric font-weight into a widely-supported range
 *  - returning a stable decoration class for CSS routing
 */
export function getFilterTypographyCSS(attributes) {
	const fontFamilyValue = attributes?.filterFontFamily || "";
	const fontSizeValue = `${attributes?.filterFontSize ?? 16}px`;

	const letterSpacingRaw = attributes?.filterLetterSpacing ?? 0;
	const letterSpacingValue =
		typeof letterSpacingRaw === "number"
			? `${letterSpacingRaw}px`
			: `${parseFloat(letterSpacingRaw) || 0}px`;

	const rawWeight = attributes?.filterFontWeight;
	const numericWeight = Number.parseInt(rawWeight, 10);
	const fontWeightValue =
		rawWeight === "" || rawWeight == null
			? ""
			: Number.isFinite(numericWeight)
				? String(Math.min(900, Math.max(100, numericWeight)))
				: String(rawWeight);

	const decorationMode = attributes?.filterTextDecoration || "none";
	const decorationClass = `pb-filter-decoration-${decorationMode}`;

	return {
		decorationClass,
		cssVars: {
			"--pb-filter-font-family": fontFamilyValue,
			"--pb-filter-font-size": fontSizeValue,
			"--pb-filter-font-weight": fontWeightValue,
			"--pb-filter-font-style": attributes?.filterFontStyle || "normal",
			"--pb-filter-line-height": attributes?.filterLineHeight ?? 1.5,
			"--pb-filter-letter-spacing": letterSpacingValue,
			"--pb-filter-text-transform": attributes?.filterTextTransform || "none",
			"--pb-filter-text-decoration": decorationMode,
		},
	};
}