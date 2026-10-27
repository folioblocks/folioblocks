import {
	InspectorControls,
	store as blockEditorStore,
} from "@wordpress/block-editor";
import { PanelBody, RangeControl } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { Children } from "@wordpress/element";
import { __ } from "@wordpress/i18n";


/** One responsive Layout panel per block, containing its range controls. */
export function ResponsiveLayoutInspector({
	clientId,
	children,
	title = __("Layout", "folioblocks"),
}) {
	const { viewport, pseudo } = useSelect(
		(select) => {
			const editor = select(blockEditorStore);
			return (
				editor.getSelectedBlockStyleState?.(clientId) ?? {
					viewport: "default",
					pseudo: "default",
				}
			);
		},
		[clientId],
	);
	if (
		!["@tablet", "@mobile"].includes(viewport) ||
		pseudo !== "default" ||
		Children.toArray(children).length === 0
	) {
		return null;
	}

	return (
		<InspectorControls group="style-state">
			<PanelBody title={title}>
				{children}
			</PanelBody>
		</InspectorControls>
	);
}

/** A range inside ResponsiveLayoutInspector, backed by existing attributes. */
export default function ResponsiveRangeInspector({
	clientId,
	attributes,
	setAttributes,
	label,
	desktopKey,
	tabletKey,
	mobileKey,
	min = 1,
	max = 8,
	step = 1,
	help,
}) {
	const { viewport, pseudo } = useSelect(
		(select) => {
			const editor = select(blockEditorStore);
			return (
				editor.getSelectedBlockStyleState?.(clientId) ?? {
					viewport: "default",
					pseudo: "default",
				}
			);
		},
		[clientId],
	);

	const attribute = {
		"@tablet": tabletKey,
		"@mobile": mobileKey,
	}[viewport];

	// These controls edit viewport values, not hover/focus styles. Unknown viewports
	// must not silently overwrite desktop or another device's saved value.
	if (!attribute || pseudo !== "default") {
		return null;
	}

	return (
		<RangeControl
			label={label}
			value={attributes[attribute] ?? attributes[desktopKey]}
			min={min}
			max={max}
			step={step}
			help={help}
			onChange={(value) => {
				if (
					Number.isFinite(value) &&
					(!Number.isInteger(step) || Number.isInteger(value)) &&
					value >= min &&
					value <= max
				) {
					setAttributes({ [attribute]: value });
				}
			}}
			__nextHasNoMarginBottom
			__next40pxDefaultSize
		/>
	);
}
